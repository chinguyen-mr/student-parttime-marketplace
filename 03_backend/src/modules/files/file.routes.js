const express = require('express');
const router = express.Router();
const fileService = require('./file.service');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// PUT /api/files/avatar — body: { image: "data:image/jpeg;base64,..." }
router.put('/avatar', verifyToken, async (req, res, next) => {
    try {
        const data = await fileService.setAvatar(req.user.id, req.body?.image, req.body?.source);
        res.status(200).json({ success: true, message: 'Đã cập nhật ảnh đại diện', data });
    } catch (err) {
        next(err);
    }
});

// GET /api/files/avatar/source — ảnh gốc để căn chỉnh lại (chỉ chủ tài khoản)
router.get('/avatar/source', verifyToken, async (req, res, next) => {
    try {
        const file = await fileService.getAvatarSource(req.user.id);
        res.set({ 'Content-Type': file.mime_type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' });
        res.send(file.data);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/files/avatar
router.delete('/avatar', verifyToken, async (req, res, next) => {
    try {
        const data = await fileService.removeAvatar(req.user.id);
        res.status(200).json({ success: true, message: 'Đã xóa ảnh đại diện', data });
    } catch (err) {
        next(err);
    }
});

// ---------- Ảnh doanh nghiệp (chỉ nhà tuyển dụng) ----------
const ok = (res, message, data) => res.status(200).json({ success: true, message, data });

// PUT /api/files/cover — body: { image } — ảnh bìa trang công ty
router.put('/cover', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try { ok(res, 'Đã cập nhật ảnh bìa', await fileService.setCover(req.user.id, req.body?.image)); } catch (err) { next(err); }
});

// DELETE /api/files/cover
router.delete('/cover', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try { ok(res, 'Đã xóa ảnh bìa', await fileService.removeCover(req.user.id)); } catch (err) { next(err); }
});

// POST /api/files/office-images — body: { image } — thêm ảnh văn phòng (tối đa 8)
router.post('/office-images', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try { ok(res, 'Đã thêm ảnh văn phòng', await fileService.addOfficeImage(req.user.id, req.body?.image)); } catch (err) { next(err); }
});

// DELETE /api/files/office-images/:id
router.delete('/office-images/:id(\\d+)', verifyToken, requireRoles('EMPLOYER'), async (req, res, next) => {
    try { ok(res, 'Đã xóa ảnh văn phòng', await fileService.removeOfficeImage(req.user.id, parseInt(req.params.id, 10))); } catch (err) { next(err); }
});

// GET /api/files/:id — ảnh công khai (avatar, ảnh bìa, ảnh văn phòng, ảnh đánh giá)
router.get('/:id(\\d+)', async (req, res, next) => {
    try {
        const file = await fileService.getPublicFile(parseInt(req.params.id, 10));
        res.set({
            'Content-Type': file.mime_type,
            'X-Content-Type-Options': 'nosniff',
            // Mỗi lần đổi ảnh tạo id mới nên có thể cache lâu
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        });
        res.send(file.data);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
