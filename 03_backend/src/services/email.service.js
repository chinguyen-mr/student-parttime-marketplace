/**
 * Email Service for JobNest
 * Handles transactional emails including Password Reset, Account Verification, and System Notices.
 * 
 * Supports:
 * - Real SMTP transport via nodemailer (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS / SMTP_PASSWORD)
 * - Safe fallback for development and testing with in-memory capture
 * - Anti-leak logging safeguards (never logs raw tokens in production)
 */

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.lastDispatchedEmail = null;
        this.dispatchedHistory = [];
        this.transporter = null;
    }

    /**
     * Initializes or returns cached nodemailer transporter
     */
    getTransporter() {
        const smtpHost = process.env.SMTP_HOST;
        if (!smtpHost) {
            return null;
        }

        const port = parseInt(process.env.SMTP_PORT || '1025', 10);
        const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

        const transportConfig = {
            host: smtpHost,
            port,
            secure: isSecure,
            tls: {
                rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true'
            }
        };

        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
        if (user) {
            transportConfig.auth = { user, pass };
        }

        return nodemailer.createTransport(transportConfig);
    }

    /**
     * Dispatches a password reset email
     * @param {string} toEmail 
     * @param {string} resetUrl 
     * @param {string} rawToken 
     * @returns {Promise<{ success: boolean, messageId?: string, transport: string, simulated?: boolean }>}
     */
    async sendPasswordResetEmail(toEmail, resetUrl, rawToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        const sender = process.env.SMTP_FROM || 'JobNest Platform <noreply@jobnest.vn>';

        const emailPayload = {
            from: sender,
            to: toEmail,
            subject: '[JobNest] Hướng dẫn khôi phục mật khẩu tài khoản',
            resetUrl,
            rawToken,
            timestamp: new Date().toISOString()
        };

        // Always record in-memory for testing and audit trail
        this.lastDispatchedEmail = emailPayload;
        this.dispatchedHistory.push(emailPayload);
        if (this.dispatchedHistory.length > 50) {
            this.dispatchedHistory.shift();
        }

        const transporter = this.getTransporter();

        // 1. If SMTP transport is configured, send via real SMTP
        if (transporter) {
            try {
                const mailOptions = {
                    from: sender,
                    to: toEmail,
                    subject: emailPayload.subject,
                    text: `Xin chào,\n\nBạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản ${toEmail} trên hệ thống JobNest.\n\nMã xác nhận của bạn (hiệu lực 15 phút): ${rawToken}\n\nNhập mã này tại màn hình Quên mật khẩu (${resetUrl}) để đặt mật khẩu mới.\n\nNếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ JobNest`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #EAE5F0; border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                                <h2 style="color: #7565A8; margin: 0;">JobNest</h2>
                            </div>
                            <h3 style="color: #30283A; margin-top: 0;">Hướng dẫn đặt lại mật khẩu</h3>
                            <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">Xin chào,</p>
                            <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
                                Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong>.
                            </p>
                            <p style="font-size: 13px; color: #6B7280;">Nhập mã xác nhận sau tại màn hình Quên mật khẩu trên <a href="${resetUrl}" style="color: #7565A8;">JobNest</a>:</p>
                            <div style="background: #F8FAFC; border: 1.5px dashed #7565A8; padding: 14px; border-radius: 6px; font-family: monospace; font-size: 26px; letter-spacing: 6px; font-weight: bold; color: #30283A; text-align: center;">
                                ${rawToken}
                            </div>
                            <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px; line-height: 1.5;">
                                Lưu ý: Liên kết và mã xác thực chỉ có hiệu lực trong vòng <strong>15 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
                            </p>
                        </div>
                    `
                };

                const info = await transporter.sendMail(mailOptions);
                return {
                    success: true,
                    transport: 'smtp',
                    messageId: info.messageId,
                    accepted: info.accepted,
                    response: info.response
                };
            } catch (err) {
                // SMTP delivery failure must be caught and raised/handled safely
                console.error(`[EMAIL-SERVICE-ERROR] Lỗi gửi email qua SMTP tới ${toEmail}:`, err.message);
                throw new Error(`Gửi email qua SMTP thất bại: ${err.message}`);
            }
        }

        // 2. Production chưa cấu hình SMTP: báo lỗi thay vì giả vờ đã gửi (người dùng sẽ chờ mã không bao giờ tới)
        if (isProduction) {
            throw new Error('Chưa cấu hình SMTP (SMTP_HOST) nên không gửi được email');
        }

        // 3. Safe Fallback (No SMTP configured): Development & Test Mode
        if (!isProduction) {
            console.log(`[DEV-EMAIL-DISPATCH] Giả lập gửi email đặt lại mật khẩu tới ${toEmail}`);
        }

        return {
            success: true,
            transport: 'in-memory',
            simulated: true,
            messageId: `inmemory-${Date.now()}`
        };
    }

    /**
     * Gửi câu trả lời của Admin cho người dùng form "Trung tâm hỗ trợ".
     * Không có SMTP → trả { success: false, reason: 'NO_SMTP' } (không ném lỗi: câu trả lời vẫn được lưu).
     */
    async sendSupportReply(toEmail, { name, topic, question, reply }) {
        const transporter = this.getTransporter();
        if (!transporter) return { success: false, reason: 'NO_SMTP' };
        const text = `Chào ${name || 'bạn'},\n\n${reply}\n\n---\nCâu hỏi của bạn (${topic}):\n${question}\n\nTrân trọng,\nTrung tâm hỗ trợ JobNest`;
        try {
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || 'JobNest Platform <noreply@jobnest.vn>',
                to: toEmail,
                subject: `[JobNest] Phản hồi yêu cầu hỗ trợ: ${topic}`,
                text,
            });
            return { success: true, messageId: info.messageId };
        } catch (err) {
            console.error(`[EMAIL-SERVICE-ERROR] Lỗi gửi phản hồi hỗ trợ tới ${toEmail}:`, err.message);
            return { success: false, reason: 'SMTP_ERROR' };
        }
    }

    /**
     * Helper for integration tests to inspect last dispatched email
     */
    getLastDispatched() {
        return this.lastDispatchedEmail;
    }

    /**
     * Clear history for test isolation
     */
    clearHistory() {
        this.lastDispatchedEmail = null;
        this.dispatchedHistory = [];
    }
}

module.exports = new EmailService();
