const db = require('../../config/db');
const { AppError, BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/app-error');
const { normalizeLegalStatus } = require('./employer-public.service');
const { diffFields, logProfileChange } = require('./employer-audit');

// Chỉ sửa/gửi hồ sơ pháp lý khi chưa nằm trong quy trình xét duyệt hoặc đã được duyệt
const EDITABLE_LEGAL = ['UNVERIFIED', 'NEEDS_INFO', 'REJECTED'];
const REVIEW_DECISIONS = ['VERIFIED', 'NEEDS_INFO', 'REJECTED'];

const str = (v, max) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim().replace(/\s+/g, ' ');
    return s ? s.slice(0, max) : null;
};

/** MST Việt Nam: 10 số, hoặc 10 số + "-" + 3 số (đơn vị phụ thuộc). */
const normalizeTaxCode = (v) => {
    const s = String(v || '').replace(/\s/g, '');
    return /^\d{10}(-\d{3})?$/.test(s) ? s : null;
};

function validateRepresentative(body = {}) {
    const name = str(body.representative_name, 100);
    const title = str(body.representative_title, 100);
    const errors = [];
    if (!name || name.length < 2) errors.push('Họ và tên người đại diện cần ít nhất 2 ký tự.');
    else if (/[<>{}\d]/.test(name)) errors.push('Họ và tên không được chứa số hoặc ký tự đặc biệt.');
    if (errors.length) throw new AppError(errors[0], 400, errors);
    return { representative_name: name, representative_title: title };
}

function validateLegalInfo(body = {}) {
    const company_name = str(body.company_name, 255);
    const errors = [];
    if (!company_name || company_name.length < 2) errors.push('Cần nhập tên pháp nhân (theo giấy chứng nhận đăng ký doanh nghiệp).');
    const tax_code = normalizeTaxCode(body.tax_code);
    if (!tax_code) errors.push('Mã số thuế phải gồm 10 chữ số (hoặc 10 số + "-" + 3 số với chi nhánh).');
    if (errors.length) throw new AppError(errors[0], 400, errors);
    return { company_name, tax_code };
}

async function requireEmployerProfile(q, userId, lock = false) {
    const res = await q.query(
        `SELECT ep.*, u.role FROM users u JOIN employer_profiles ep ON ep.user_id = u.id WHERE u.id = $1${lock ? ' FOR UPDATE OF ep' : ''}`,
        [userId]
    );
    const row = res.rows[0];
    if (!row) throw new NotFoundError('Chưa có hồ sơ doanh nghiệp.');
    if (row.role !== 'EMPLOYER') throw new ForbiddenError('Chỉ nhà tuyển dụng mới có hồ sơ doanh nghiệp.');
    return row;
}

async function listLegalDocs(q, userId) {
    const res = await q.query(
        `SELECT id, original_name, mime_type, size_bytes, created_at FROM file_uploads
         WHERE owner_id = $1 AND kind = 'LEGAL_DOC' ORDER BY id`,
        [userId]
    );
    return res.rows.map(r => ({ id: r.id, name: r.original_name, mime_type: r.mime_type, size_bytes: r.size_bytes, created_at: r.created_at }));
}

function toVerificationDto(row, documents) {
    const status = normalizeLegalStatus(row.verification_status);
    return {
        status,
        note: row.verification_note || null,
        submitted_at: row.verification_submitted_at || null,
        reviewed_at: row.verification_reviewed_at || null,
        company_name: row.company_name || null,
        tax_code: row.tax_code || null,
        editable: EDITABLE_LEGAL.includes(status),
        documents,
    };
}

class EmployerAccountService {
    /** Người đại diện: họ tên, chức vụ. Email/SĐT đăng nhập không sửa ở đây (cần quy trình xác minh). */
    async updateRepresentative(userId, body) {
        const data = validateRepresentative(body);
        const before = await requireEmployerProfile(db, userId);
        await db.query(
            `UPDATE employer_profiles SET representative_name = $2, representative_title = $3, updated_at = NOW() WHERE user_id = $1`,
            [userId, data.representative_name, data.representative_title]
        );
        await logProfileChange(db, userId, userId, 'REPRESENTATIVE', diffFields(before, data, ['representative_name', 'representative_title']));
        return data;
    }

    async getVerification(userId) {
        const row = await requireEmployerProfile(db, userId);
        return toVerificationDto(row, await listLegalDocs(db, userId));
    }

    /** Lưu tên pháp nhân + MST (bản nháp). Bị khóa khi đang chờ duyệt hoặc đã xác minh. */
    async updateLegalInfo(userId, body) {
        const data = validateLegalInfo(body);
        const row = await requireEmployerProfile(db, userId);
        if (!EDITABLE_LEGAL.includes(normalizeLegalStatus(row.verification_status))) {
            throw new ForbiddenError('Hồ sơ pháp lý đang chờ duyệt hoặc đã được xác minh nên không thể sửa.');
        }
        await db.query(
            `UPDATE employer_profiles SET company_name = $2, tax_code = $3, updated_at = NOW() WHERE user_id = $1`,
            [userId, data.company_name, data.tax_code]
        );
        await logProfileChange(db, userId, userId, 'VERIFICATION', diffFields(row, data, ['company_name', 'tax_code']));
        return this.getVerification(userId);
    }

    /** Gửi hồ sơ xác minh: cần tên pháp nhân, MST hợp lệ và ít nhất 1 tài liệu. */
    async submitVerification(userId) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const row = await requireEmployerProfile(client, userId, true);
            const status = normalizeLegalStatus(row.verification_status);
            if (!EDITABLE_LEGAL.includes(status)) {
                throw new BadRequestError(status === 'PENDING' ? 'Hồ sơ đã được gửi và đang chờ xét duyệt.' : 'Doanh nghiệp đã được xác minh.');
            }
            validateLegalInfo(row);
            const docs = await listLegalDocs(client, userId);
            if (!docs.length) throw new BadRequestError('Cần tải lên ít nhất 1 tài liệu (giấy chứng nhận đăng ký doanh nghiệp).');
            await client.query(
                `UPDATE employer_profiles SET verification_status = 'PENDING', verification_submitted_at = NOW(),
                        verification_note = NULL, updated_at = NOW() WHERE user_id = $1`,
                [userId]
            );
            await logProfileChange(client, userId, userId, 'VERIFICATION', { verification_status: { from: status, to: 'PENDING' }, documents: { count: docs.length } });
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        return this.getVerification(userId);
    }

    // ---------- Quản trị viên ----------

    async listVerificationRequests({ status = 'PENDING' } = {}) {
        const filter = status === 'ALL' ? null : normalizeLegalStatus(status);
        const res = await db.query(
            `SELECT ep.user_id, ep.display_name, ep.company_name, ep.tax_code, ep.account_type, ep.verification_status,
                    ep.verification_note, ep.verification_submitted_at, ep.verification_reviewed_at,
                    u.email, u.created_at AS user_created_at,
                    (SELECT COUNT(*)::int FROM file_uploads f WHERE f.owner_id = ep.user_id AND f.kind = 'LEGAL_DOC') AS document_count
             FROM employer_profiles ep JOIN users u ON u.id = ep.user_id
             WHERE u.role = 'EMPLOYER' AND ($1::text IS NULL OR ep.verification_status = $1)
             ORDER BY ep.verification_submitted_at DESC NULLS LAST, ep.user_id DESC
             LIMIT 200`,
            [filter]
        );
        return res.rows.map(r => ({ ...r, verification_status: normalizeLegalStatus(r.verification_status) }));
    }

    async getVerificationForAdmin(employerId) {
        const row = await requireEmployerProfile(db, employerId);
        return { user_id: employerId, display_name: row.display_name, ...toVerificationDto(row, await listLegalDocs(db, employerId)) };
    }

    /** Duyệt / yêu cầu bổ sung / từ chối. Lý do bắt buộc khi không duyệt. Có thể thu hồi xác minh đã cấp. */
    async reviewVerification(adminId, employerId, body = {}) {
        const decision = String(body.status || '').toUpperCase();
        const note = str(body.note, 1000);
        if (!REVIEW_DECISIONS.includes(decision)) throw new BadRequestError('Quyết định phải là VERIFIED, NEEDS_INFO hoặc REJECTED.');
        if (decision !== 'VERIFIED' && !note) throw new BadRequestError('Cần ghi rõ lý do để doanh nghiệp bổ sung hoặc biết vì sao bị từ chối.');
        const client = await db.pool.connect();
        let row;
        try {
            await client.query('BEGIN');
            row = await requireEmployerProfile(client, employerId, true);
            const current = normalizeLegalStatus(row.verification_status);
            const allowed = current === 'PENDING' || (current === 'VERIFIED' && decision !== 'VERIFIED');
            if (!allowed) throw new BadRequestError(`Không thể chuyển từ trạng thái ${current} sang ${decision}.`);
            await client.query(
                `UPDATE employer_profiles SET verification_status = $2, verification_note = $3,
                        verification_reviewed_at = NOW(), updated_at = NOW() WHERE user_id = $1`,
                [employerId, decision, note]
            );
            await logProfileChange(client, employerId, adminId, 'VERIFICATION_REVIEW', { verification_status: { from: current, to: decision }, note });
            await client.query(
                `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata) VALUES ($1, $2, 'USER', $3, $4)`,
                [adminId, `LEGAL_VERIFICATION_${decision}`, employerId, JSON.stringify({ from: current, note })]
            );
            const title = {
                VERIFIED: 'Doanh nghiệp đã được xác minh pháp lý',
                NEEDS_INFO: 'Hồ sơ xác minh doanh nghiệp cần bổ sung',
                REJECTED: 'Hồ sơ xác minh doanh nghiệp bị từ chối',
            }[decision];
            const bodyText = decision === 'VERIFIED'
                ? 'Trang công ty của bạn đã hiển thị huy hiệu "Đã xác minh pháp lý".'
                : `Lý do: ${note}. Vui lòng cập nhật trong mục Hồ sơ doanh nghiệp › Xác minh doanh nghiệp.`;
            await client.query(
                `INSERT INTO notifications (user_id, type, title, body, target_type, target_id, created_at)
                 VALUES ($1, 'VERIFICATION', $2, $3, 'EMPLOYER', $1, NOW())`,
                [employerId, title, bodyText]
            );
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        return this.getVerificationForAdmin(employerId);
    }
}

module.exports = new EmployerAccountService();
module.exports.validateRepresentative = validateRepresentative;
module.exports.validateLegalInfo = validateLegalInfo;
module.exports.normalizeTaxCode = normalizeTaxCode;
module.exports.EDITABLE_LEGAL = EDITABLE_LEGAL;
