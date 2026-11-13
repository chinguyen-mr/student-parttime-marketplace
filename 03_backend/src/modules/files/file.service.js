const db = require('../../config/db');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/app-error');
const { EDITABLE_LEGAL } = require('../auth/employer-account.service');
const { normalizeLegalStatus } = require('../auth/employer-public.service');

const IMAGE_TYPES = {
    'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
    'image/webp': (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
};
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_SOURCE_MAX_BYTES = 4 * 1024 * 1024;
const COVER_MAX_BYTES = 3 * 1024 * 1024;
const OFFICE_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
const OFFICE_IMAGES_MAX = 8;
// Tài liệu pháp lý: PDF hoặc ảnh chụp, tối đa 5 file × 5MB. Không bao giờ phát công khai.
const LEGAL_DOC_TYPES = { ...IMAGE_TYPES, 'application/pdf': (b) => b.toString('ascii', 0, 5) === '%PDF-' };
const LEGAL_DOC_MAX_BYTES = 5 * 1024 * 1024;
const LEGAL_DOCS_MAX = 5;

/** Tách data URL base64 → { mime, buffer }, kiểm tra loại file theo nội dung thật (magic bytes). */
function decodeDataUrl(dataUrl, maxBytes, types, typeError) {
    const match = /^data:([\w/+.-]+);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
    if (!match) throw new BadRequestError('File không hợp lệ (cần data URL base64).');
    const [, mime, base64] = match;
    const check = types[mime];
    if (!check) throw new BadRequestError(typeError);
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length === 0) throw new BadRequestError('File rỗng.');
    if (buffer.length > maxBytes) throw new BadRequestError(`File vượt quá ${Math.round(maxBytes / 1024 / 1024)}MB.`);
    if (!check(buffer)) throw new BadRequestError('Nội dung file không khớp định dạng khai báo.');
    return { mime, buffer };
}
const decodeImageDataUrl = (dataUrl, maxBytes) => decodeDataUrl(dataUrl, maxBytes, IMAGE_TYPES, 'Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');

/** Tên file hiển thị: bỏ đường dẫn và ký tự điều khiển, giới hạn độ dài. */
const safeFileName = (name, fallback) => {
    const s = String(name || '').split(/[\\/]/).pop().replace(/[\u0000-\u001f<>"]/g, '').trim();
    return (s || fallback).slice(0, 120);
};

/** Bảng hồ sơ chứa avatar theo vai trò. Nhà tuyển dụng dùng avatar làm logo công ty. */
async function profileTableFor(userId) {
    const res = await db.query('SELECT role, full_name FROM users WHERE id = $1', [userId]);
    const user = res.rows[0];
    if (!user) throw new NotFoundError('Không tìm thấy tài khoản.');
    if (user.role === 'STUDENT') return { table: 'student_profiles', nameCol: 'full_name', user };
    if (user.role === 'EMPLOYER') return { table: 'employer_profiles', nameCol: 'display_name', user };
    throw new ForbiddenError('Tài khoản này không có ảnh đại diện.');
}

class FileService {
    /**
     * Lưu ảnh đại diện đã cắt. `sourceDataUrl` (tùy chọn) là ảnh gốc để chỉnh lại sau này;
     * bỏ trống khi chỉ căn chỉnh lại ảnh cũ → giữ nguyên ảnh gốc hiện có.
     */
    async setAvatar(userId, dataUrl, sourceDataUrl) {
        const { mime, buffer } = decodeImageDataUrl(dataUrl, AVATAR_MAX_BYTES);
        const source = sourceDataUrl ? decodeImageDataUrl(sourceDataUrl, AVATAR_SOURCE_MAX_BYTES) : null;
        const { table, nameCol, user } = await profileTableFor(userId);
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const ins = await client.query(
                `INSERT INTO file_uploads (owner_id, kind, original_name, mime_type, size_bytes, data)
                 VALUES ($1, 'AVATAR', 'avatar', $2, $3, $4) RETURNING id`,
                [userId, mime, buffer.length, buffer]
            );
            const fileId = ins.rows[0].id;
            const avatarUrl = `/api/files/${fileId}`;
            const upd = await client.query(`UPDATE ${table} SET avatar_url = $2, updated_at = NOW() WHERE user_id = $1`, [userId, avatarUrl]);
            if (upd.rowCount === 0) {
                await client.query(`INSERT INTO ${table} (user_id, ${nameCol}, avatar_url) VALUES ($1, $2, $3)`, [userId, user.full_name, avatarUrl]);
            }
            // Chỉ giữ ảnh đại diện mới nhất
            await client.query(`DELETE FROM file_uploads WHERE owner_id = $1 AND kind = 'AVATAR' AND id <> $2`, [userId, fileId]);
            if (source) {
                await client.query(`DELETE FROM file_uploads WHERE owner_id = $1 AND kind = 'AVATAR_SOURCE'`, [userId]);
                await client.query(
                    `INSERT INTO file_uploads (owner_id, kind, original_name, mime_type, size_bytes, data)
                     VALUES ($1, 'AVATAR_SOURCE', 'avatar-source', $2, $3, $4)`,
                    [userId, source.mime, source.buffer.length, source.buffer]
                );
            }
            await client.query('COMMIT');
            return { avatar_url: avatarUrl };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async removeAvatar(userId) {
        const { table } = await profileTableFor(userId);
        await db.query(`UPDATE ${table} SET avatar_url = NULL, updated_at = NOW() WHERE user_id = $1`, [userId]);
        await db.query(`DELETE FROM file_uploads WHERE owner_id = $1 AND kind IN ('AVATAR', 'AVATAR_SOURCE')`, [userId]);
        return { avatar_url: null };
    }

    /** Ảnh gốc của avatar — chỉ chủ tài khoản lấy được (dùng để căn chỉnh lại). */
    async getAvatarSource(userId) {
        const res = await db.query(
            `SELECT mime_type, data FROM file_uploads WHERE owner_id = $1 AND kind = 'AVATAR_SOURCE' ORDER BY id DESC LIMIT 1`,
            [userId]
        );
        if (!res.rows[0]) throw new NotFoundError('Chưa có ảnh gốc.');
        return res.rows[0];
    }

    // ---------- Ảnh bìa & ảnh văn phòng (chỉ nhà tuyển dụng) ----------

    async assertEmployer(userId) {
        const res = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (!res.rows[0]) throw new NotFoundError('Không tìm thấy tài khoản.');
        if (res.rows[0].role !== 'EMPLOYER') throw new ForbiddenError('Chỉ nhà tuyển dụng mới tải được ảnh doanh nghiệp.');
        const prof = await db.query('SELECT id FROM employer_profiles WHERE user_id = $1', [userId]);
        if (!prof.rows[0]) throw new NotFoundError('Chưa có hồ sơ doanh nghiệp.');
    }

    async setCover(userId, dataUrl) {
        await this.assertEmployer(userId);
        const { mime, buffer } = decodeImageDataUrl(dataUrl, COVER_MAX_BYTES);
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const ins = await client.query(
                `INSERT INTO file_uploads (owner_id, kind, original_name, mime_type, size_bytes, data)
                 VALUES ($1, 'COVER', 'cover', $2, $3, $4) RETURNING id`,
                [userId, mime, buffer.length, buffer]
            );
            const url = `/api/files/${ins.rows[0].id}`;
            await client.query('UPDATE employer_profiles SET cover_url = $2, updated_at = NOW() WHERE user_id = $1', [userId, url]);
            await client.query(`DELETE FROM file_uploads WHERE owner_id = $1 AND kind = 'COVER' AND id <> $2`, [userId, ins.rows[0].id]);
            await client.query('COMMIT');
            return { cover_url: url };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async removeCover(userId) {
        await this.assertEmployer(userId);
        await db.query('UPDATE employer_profiles SET cover_url = NULL, updated_at = NOW() WHERE user_id = $1', [userId]);
        await db.query(`DELETE FROM file_uploads WHERE owner_id = $1 AND kind = 'COVER'`, [userId]);
        return { cover_url: null };
    }

    async addOfficeImage(userId, dataUrl) {
        await this.assertEmployer(userId);
        const { mime, buffer } = decodeImageDataUrl(dataUrl, OFFICE_IMAGE_MAX_BYTES);
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            // Khóa dòng hồ sơ để 2 lần tải đồng thời không vượt giới hạn
            const prof = await client.query('SELECT office_images FROM employer_profiles WHERE user_id = $1 FOR UPDATE', [userId]);
            const current = Array.isArray(prof.rows[0].office_images) ? prof.rows[0].office_images : [];
            if (current.length >= OFFICE_IMAGES_MAX) throw new BadRequestError(`Tối đa ${OFFICE_IMAGES_MAX} ảnh văn phòng.`);
            const ins = await client.query(
                `INSERT INTO file_uploads (owner_id, kind, original_name, mime_type, size_bytes, data)
                 VALUES ($1, 'OFFICE_IMAGE', 'office', $2, $3, $4) RETURNING id`,
                [userId, mime, buffer.length, buffer]
            );
            const next = [...current, `/api/files/${ins.rows[0].id}`];
            await client.query('UPDATE employer_profiles SET office_images = $2, updated_at = NOW() WHERE user_id = $1', [userId, JSON.stringify(next)]);
            await client.query('COMMIT');
            return { office_images: next };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async removeOfficeImage(userId, fileId) {
        await this.assertEmployer(userId);
        const url = `/api/files/${fileId}`;
        const prof = await db.query('SELECT office_images FROM employer_profiles WHERE user_id = $1', [userId]);
        const current = Array.isArray(prof.rows[0]?.office_images) ? prof.rows[0].office_images : [];
        if (!current.includes(url)) throw new NotFoundError('Không tìm thấy ảnh.');
        const next = current.filter(u => u !== url);
        await db.query('UPDATE employer_profiles SET office_images = $2, updated_at = NOW() WHERE user_id = $1', [userId, JSON.stringify(next)]);
        // Chỉ xóa file thuộc chính chủ
        await db.query(`DELETE FROM file_uploads WHERE id = $1 AND owner_id = $2 AND kind = 'OFFICE_IMAGE'`, [fileId, userId]);
        return { office_images: next };
    }

    /** Đổi thứ tự ảnh thư viện: `order` phải là hoán vị đúng của danh sách hiện có. */
    async reorderOfficeImages(userId, order) {
        await this.assertEmployer(userId);
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const prof = await client.query('SELECT office_images FROM employer_profiles WHERE user_id = $1 FOR UPDATE', [userId]);
            const current = Array.isArray(prof.rows[0].office_images) ? prof.rows[0].office_images : [];
            const next = Array.isArray(order) ? order.map(String) : [];
            const isPermutation = next.length === current.length && new Set(next).size === next.length && next.every(u => current.includes(u));
            if (!isPermutation) throw new BadRequestError('Danh sách ảnh không khớp với thư viện hiện tại. Hãy tải lại trang.');
            await client.query('UPDATE employer_profiles SET office_images = $2, updated_at = NOW() WHERE user_id = $1', [userId, JSON.stringify(next)]);
            await client.query('COMMIT');
            return { office_images: next };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    // ---------- Ảnh người đại diện (riêng tư, khác logo doanh nghiệp) ----------

    async setRepresentativeAvatar(userId, dataUrl) {
        await this.assertEmployer(userId);
        const { mime, buffer } = decodeImageDataUrl(dataUrl, AVATAR_MAX_BYTES);
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const ins = await client.query(
                `INSERT INTO file_uploads (owner_id, kind, original_name, mime_type, size_bytes, data)
                 VALUES ($1, 'REP_AVATAR', 'representative', $2, $3, $4) RETURNING id`,
                [userId, mime, buffer.length, buffer]
            );
            const url = `/api/files/representative-avatar?v=${ins.rows[0].id}`;
            await client.query('UPDATE employer_profiles SET representative_avatar_url = $2, updated_at = NOW() WHERE user_id = $1', [userId, url]);
            await client.query(`DELETE FROM file_uploads WHERE owner_id = $1 AND kind = 'REP_AVATAR' AND id <> $2`, [userId, ins.rows[0].id]);
            await client.query('COMMIT');
            return { representative_avatar_url: url };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async removeRepresentativeAvatar(userId) {
        await this.assertEmployer(userId);
        await db.query('UPDATE employer_profiles SET representative_avatar_url = NULL, updated_at = NOW() WHERE user_id = $1', [userId]);
        await db.query(`DELETE FROM file_uploads WHERE owner_id = $1 AND kind = 'REP_AVATAR'`, [userId]);
        return { representative_avatar_url: null };
    }

    /** Chỉ chính chủ xem được ảnh người đại diện. */
    async getRepresentativeAvatar(userId) {
        const res = await db.query(
            `SELECT mime_type, data FROM file_uploads WHERE owner_id = $1 AND kind = 'REP_AVATAR' ORDER BY id DESC LIMIT 1`,
            [userId]
        );
        if (!res.rows[0]) throw new NotFoundError('Chưa có ảnh người đại diện.');
        return res.rows[0];
    }

    // ---------- Tài liệu pháp lý (riêng tư: chính chủ + quản trị viên) ----------

    async assertLegalEditable(userId) {
        await this.assertEmployer(userId);
        const res = await db.query('SELECT verification_status FROM employer_profiles WHERE user_id = $1', [userId]);
        if (!EDITABLE_LEGAL.includes(normalizeLegalStatus(res.rows[0]?.verification_status))) {
            throw new ForbiddenError('Hồ sơ pháp lý đang chờ duyệt hoặc đã được xác minh nên không thể thay đổi tài liệu.');
        }
    }

    async addLegalDocument(userId, dataUrl, name) {
        await this.assertLegalEditable(userId);
        const { mime, buffer } = decodeDataUrl(dataUrl, LEGAL_DOC_MAX_BYTES, LEGAL_DOC_TYPES, 'Chỉ chấp nhận PDF, JPG, PNG hoặc WEBP.');
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            // Khóa hồ sơ để 2 lần tải đồng thời không vượt giới hạn số tài liệu
            await client.query('SELECT 1 FROM employer_profiles WHERE user_id = $1 FOR UPDATE', [userId]);
            const count = await client.query(`SELECT COUNT(*)::int AS n FROM file_uploads WHERE owner_id = $1 AND kind = 'LEGAL_DOC'`, [userId]);
            if (count.rows[0].n >= LEGAL_DOCS_MAX) throw new BadRequestError(`Tối đa ${LEGAL_DOCS_MAX} tài liệu.`);
            const ins = await client.query(
                `INSERT INTO file_uploads (owner_id, kind, original_name, mime_type, size_bytes, data)
                 VALUES ($1, 'LEGAL_DOC', $2, $3, $4, $5) RETURNING id, original_name, mime_type, size_bytes, created_at`,
                [userId, safeFileName(name, 'tai-lieu'), mime, buffer.length, buffer]
            );
            await client.query('COMMIT');
            const r = ins.rows[0];
            return { id: r.id, name: r.original_name, mime_type: r.mime_type, size_bytes: r.size_bytes, created_at: r.created_at };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async removeLegalDocument(userId, fileId) {
        await this.assertLegalEditable(userId);
        const res = await db.query(`DELETE FROM file_uploads WHERE id = $1 AND owner_id = $2 AND kind = 'LEGAL_DOC'`, [fileId, userId]);
        if (res.rowCount === 0) throw new NotFoundError('Không tìm thấy tài liệu.');
        return { id: fileId };
    }

    /** Tải tài liệu pháp lý: chỉ chính chủ hoặc quản trị viên. */
    async getLegalDocument(requester, fileId) {
        const res = await db.query(
            `SELECT owner_id, original_name, mime_type, data FROM file_uploads WHERE id = $1 AND kind = 'LEGAL_DOC'`,
            [fileId]
        );
        const doc = res.rows[0];
        if (!doc || (doc.owner_id !== requester.id && requester.role !== 'ADMIN')) throw new NotFoundError('Không tìm thấy tài liệu.');
        return doc;
    }

    /** File công khai: ảnh đại diện, ảnh bìa, ảnh văn phòng, ảnh đánh giá. CV và ảnh gốc avatar không phát công khai. */
    async getPublicFile(fileId) {
        const res = await db.query(
            `SELECT mime_type, data FROM file_uploads WHERE id = $1 AND kind IN ('AVATAR', 'REVIEW_IMAGE', 'COVER', 'OFFICE_IMAGE')`,
            [fileId]
        );
        if (!res.rows[0]) throw new NotFoundError('Không tìm thấy file.');
        return res.rows[0];
    }
}

module.exports = new FileService();
