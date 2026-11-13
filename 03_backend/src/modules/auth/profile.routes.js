const express = require('express');
const router = express.Router();
const profileService = require('./profile.service');
const studentProfileService = require('./student-profile.service');
const employerPublicService = require('./employer-public.service');
const employerAccountService = require('./employer-account.service');
const db = require('../../config/db');

// Đăng nhập không bắt buộc: có token thì xác thực, không có thì đi tiếp với req.user = undefined
const optionalAuth = (req, res, next) => (req.headers.authorization ? verifyToken(req, res, next) : next());
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// GET /api/profile/me (UC-03: Xem hồ sơ cá nhân)
router.get('/me', verifyToken, async (req, res, next) => {
    try {
        // Sinh viên: kèm danh sách kinh nghiệm và ngày sinh dạng YYYY-MM-DD
        const studentProfile = req.user.role === 'STUDENT'
            ? await studentProfileService.getMyProfile(req.user.id)
            : null;
        const profile = studentProfile || await profileService.getProfile(req.user.id);
        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/profile/me/student (Lưu toàn bộ hồ sơ xin việc của sinh viên — ghi đè, cho phép xóa trường)
router.put('/me/student', verifyToken, requireRoles('STUDENT'), async (req, res, next) => {
    try {
        const profile = await studentProfileService.update(req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Đã lưu hồ sơ',
            data: profile,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/profile/availability (Xem lịch rảnh sinh viên - bảo vệ RBAC: Chỉ STUDENT)
router.get('/availability', verifyToken, requireRoles('STUDENT'), async (req, res, next) => {
    try {
        const db = require('../../config/db');
        const result = await db.query(
            'SELECT * FROM student_availabilities WHERE student_id = $1 AND is_active = TRUE ORDER BY day_of_week, start_time',
            [req.user.id]
        );
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/profile/availability (Cập nhật lịch rảnh sinh viên - bảo vệ RBAC: Chỉ STUDENT)
router.put('/availability', verifyToken, requireRoles('STUDENT'), async (req, res, next) => {
    const db = require('../../config/db');
    const client = await db.pool.connect();
    try {
        const { slots } = req.body;
        if (!Array.isArray(slots)) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu slots phải là một mảng danh sách ca rảnh'
            });
        }

        // Validate các khung giờ
        for (const slot of slots) {
            const day = parseInt(slot.day_of_week, 10);
            if (isNaN(day) || day < 1 || day > 7) {
                return res.status(400).json({
                    success: false,
                    message: 'day_of_week phải từ 1 (Chủ Nhật) đến 7 (Thứ Bảy)'
                });
            }
            if (!slot.start_time || !slot.end_time || slot.end_time <= slot.start_time) {
                return res.status(400).json({
                    success: false,
                    message: `Khung giờ không hợp lệ (${slot.start_time} - ${slot.end_time}): Giờ kết thúc phải lớn hơn giờ bắt đầu`
                });
            }
        }

        await client.query('BEGIN');
        await client.query('DELETE FROM student_availabilities WHERE student_id = $1', [req.user.id]);

        const inserted = [];
        for (const slot of slots) {
            const insRes = await client.query(
                `INSERT INTO student_availabilities (student_id, day_of_week, start_time, end_time, is_active)
                 VALUES ($1, $2, $3, $4, TRUE)
                 RETURNING *`,
                [req.user.id, parseInt(slot.day_of_week, 10), slot.start_time, slot.end_time]
            );
            inserted.push(insRes.rows[0]);
        }
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Cập nhật lịch rảnh thành công',
            data: inserted
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
});

// GET /api/profile/:userId (Xem hồ sơ công khai của người dùng khác)
// GET /api/profile/:userId — xem hồ sơ người khác
// - Nhà tuyển dụng: chỉ dữ liệu công khai (không lộ email/SĐT đăng nhập, MST, giấy phép, người đại diện)
// - Sinh viên: chỉ chính chủ, admin, hoặc nhà tuyển dụng đã nhận đơn ứng tuyển của sinh viên đó
router.get('/:userId(\\d+)', optionalAuth, async (req, res, next) => {
    try {
        const targetId = parseInt(req.params.userId, 10);
        const target = (await db.query('SELECT role FROM users WHERE id = $1', [targetId])).rows[0];
        if (!target) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
        }
        // Không phải sinh viên → hồ sơ doanh nghiệp công khai (404 nếu tài khoản không có hồ sơ doanh nghiệp)
        if (target.role !== 'STUDENT') {
            const data = await employerPublicService.getPublicProfile(targetId);
            return res.status(200).json({ success: true, data });
        }
        // Hồ sơ sinh viên chứa thông tin cá nhân
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để xem hồ sơ ứng viên' });
        }
        let allowed = req.user.id === targetId || req.user.role === 'ADMIN';
        if (!allowed && req.user.role === 'EMPLOYER') {
            const rel = await db.query(
                `SELECT 1 FROM applications a JOIN jobs j ON j.id = a.job_id
                 WHERE a.student_id = $1 AND j.employer_id = $2 LIMIT 1`,
                [targetId, req.user.id]
            );
            allowed = rel.rowCount > 0;
        }
        if (!allowed) {
            return res.status(403).json({ success: false, message: 'Bạn chỉ xem được hồ sơ của ứng viên đã nộp đơn vào tin của mình' });
        }
        const profile = await profileService.getProfile(targetId);
        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        next(err);
    }
});

// PUT /api/profile/me/employer-public — nhà tuyển dụng cập nhật thông tin hiển thị trên trang công ty
router.put('/me/employer-public', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try {
        const data = await employerPublicService.updatePublicInfo(req.user.id, req.body);
        res.status(200).json({ success: true, message: 'Đã lưu thông tin công khai', data });
    } catch (err) {
        next(err);
    }
});

// PUT /api/profile/me/representative — Thông tin người đại diện (họ tên, chức vụ)
router.put('/me/representative', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try {
        const data = await employerAccountService.updateRepresentative(req.user.id, req.body);
        res.status(200).json({ success: true, message: 'Đã lưu thông tin người đại diện', data });
    } catch (err) {
        next(err);
    }
});

// Xác minh pháp lý doanh nghiệp (khác xác minh email/SĐT)
router.get('/me/verification', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try {
        res.status(200).json({ success: true, data: await employerAccountService.getVerification(req.user.id) });
    } catch (err) {
        next(err);
    }
});
router.put('/me/verification', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try {
        const data = await employerAccountService.updateLegalInfo(req.user.id, req.body);
        res.status(200).json({ success: true, message: 'Đã lưu thông tin pháp lý', data });
    } catch (err) {
        next(err);
    }
});
router.post('/me/verification/submit', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try {
        const data = await employerAccountService.submitVerification(req.user.id);
        res.status(200).json({ success: true, message: 'Đã gửi hồ sơ xác minh. JobNest sẽ xét duyệt và thông báo cho bạn.', data });
    } catch (err) {
        next(err);
    }
});

// Trường nhà tuyển dụng không được tự đặt qua PUT /me:
// - trạng thái/kết quả xác minh pháp lý (chỉ quản trị viên), ảnh (chỉ qua /api/files có kiểm tra nội dung)
// - tên pháp nhân/MST/giấy phép khi hồ sơ đang chờ duyệt hoặc đã xác minh
const EMPLOYER_PROTECTED_FIELDS = ['verification_status', 'verification_note', 'verification_submitted_at', 'verification_reviewed_at',
    'avatar_url', 'cover_url', 'office_images', 'representative_avatar_url'];
const LEGAL_LOCKED_FIELDS = ['company_name', 'tax_code', 'business_license_file'];

async function sanitizeEmployerUpdate(userId, body) {
    const clean = { ...(body || {}) };
    for (const k of EMPLOYER_PROTECTED_FIELDS) delete clean[k];
    const cur = await db.query('SELECT verification_status FROM employer_profiles WHERE user_id = $1', [userId]);
    const status = employerPublicService.normalizeLegalStatus(cur.rows[0]?.verification_status);
    if (!employerAccountService.EDITABLE_LEGAL.includes(status)) for (const k of LEGAL_LOCKED_FIELDS) delete clean[k];
    return clean;
}

// PUT /api/profile/me (UC-03: Cập nhật hồ sơ cá nhân)
router.put('/me', verifyToken, async (req, res, next) => {
    try {
        const body = req.user.role === 'EMPLOYER' ? await sanitizeEmployerUpdate(req.user.id, req.body) : req.body;
        const updated = await profileService.updateProfile(req.user.id, body);
        res.status(200).json({
            success: true,
            message: 'Cập nhật hồ sơ thành công',
            data: updated,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/profile/appeals (Người dùng nộp đơn khiếu nại tài khoản)
router.post('/appeals', verifyToken, async (req, res, next) => {
    try {
        const adminService = require('../reports/admin.service');
        const appeal = await adminService.submitAppeal(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Đã gửi đơn khiếu nại thành công, Quản trị viên sẽ xem xét phản hồi.',
            data: appeal,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
