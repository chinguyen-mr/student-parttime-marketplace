const express = require('express');
const router = express.Router();
const twentyWebhookService = require('./twenty-webhook.service');
const { UnauthorizedError, BadRequestError } = require('../../utils/app-error');

// Middleware xác thực API Key từ Twenty CRM gửi sang
function verifyTwentyApiKey(req, res, next) {
    const receivedKey = req.headers['x-api-key'] || req.query.apiKey;
    const configuredKey = process.env.JOBNEST_SYNC_API_KEY || process.env.TWENTY_SYNC_API_KEY || 'jobnest_twenty_secret_key_2026';

    if (!receivedKey || receivedKey !== configuredKey) {
        return next(new UnauthorizedError('Từ chối truy cập: API Key của Twenty CRM không hợp lệ hoặc bị thiếu'));
    }
    next();
}

/**
 * POST /api/webhooks/twenty
 * Endpoint nhận webhook tự động từ Twenty CRM khi đối tượng Company hoặc Opportunity được cập nhật
 */
router.post('/twenty', verifyTwentyApiKey, async (req, res, next) => {
    try {
        const payload = req.body;
        if (!payload || typeof payload !== 'object') {
            throw new BadRequestError('Dữ liệu webhook phải là định dạng JSON');
        }

        const result = await twentyWebhookService.handleCompanyVerifiedEvent(payload);

        res.status(200).json({
            success: true,
            message: 'Đã nhận webhook từ Twenty CRM, cập nhật trạng thái và gửi thông báo SMS/Email thành công',
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/webhooks/twenty/health
 * Kiểm tra trạng thái sẵn sàng của Webhook Listener
 */
router.get('/twenty/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'jobnest-twenty-webhook-listener',
        endpoint: '/api/webhooks/twenty',
        auth: 'Header x-api-key required',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;

