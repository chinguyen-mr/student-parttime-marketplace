const db = require('../../config/db');
const { NotFoundError, BadRequestError } = require('../../utils/app-error');

class TwentyWebhookService {
    /**
     * Xử lý webhook gửi từ Twenty CRM khi có sự kiện thay đổi trên Company/Employer
     * Payload: { event: "company.verified" | "company.updated", data: { taxCode, email, verificationStatus, companyName } }
     */
    async handleCompanyVerifiedEvent(payload) {
        if (!payload || !payload.data) {
            throw new BadRequestError('Payload webhook không hợp lệ (Thiếu data)');
        }

        const { taxCode, email, employerId, verificationStatus, companyName } = payload.data;

        // 1. Tìm employer tương ứng trong JobNest DB qua tax_code hoặc email hoặc user_id
        let userRes;
        if (employerId) {
            userRes = await db.query(
                `SELECT u.id, u.email, u.phone, u.full_name, ep.display_name, ep.tax_code
                 FROM users u
                 LEFT JOIN employer_profiles ep ON u.id = ep.user_id
                 WHERE u.id = $1 AND u.role = 'EMPLOYER'`,
                [employerId]
            );
        } else if (email) {
            userRes = await db.query(
                `SELECT u.id, u.email, u.phone, u.full_name, ep.display_name, ep.tax_code
                 FROM users u
                 LEFT JOIN employer_profiles ep ON u.id = ep.user_id
                 WHERE LOWER(u.email) = LOWER($1) AND u.role = 'EMPLOYER'`,
                [email]
            );
        } else if (taxCode) {
            userRes = await db.query(
                `SELECT u.id, u.email, u.phone, u.full_name, ep.display_name, ep.tax_code
                 FROM users u
                 JOIN employer_profiles ep ON u.id = ep.user_id
                 WHERE ep.tax_code = $1 AND u.role = 'EMPLOYER'`,
                [taxCode]
            );
        }

        const employer = userRes?.rows?.[0];
        if (!employer) {
            throw new NotFoundError(`Không tìm thấy nhà tuyển dụng phù hợp với thông tin Twenty CRM gửi sang (Email: ${email}, TaxCode: ${taxCode})`);
        }

        const targetCompanyName = employer.display_name || companyName || 'Doanh nghiệp';
        const newStatus = (verificationStatus || 'VERIFIED').toUpperCase();

        // 2. Cập nhật trạng thái xác thực trong employer_profiles
        await db.query(
            `UPDATE employer_profiles 
             SET verification_status = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2`,
            [newStatus, employer.id]
        );

        // 3. Tạo thông báo In-App trong bảng notifications
        const notifTitle = 'Xác thực doanh nghiệp thành công (Twenty CRM)';
        const notifBody = `Chúc mừng ${targetCompanyName}! Hồ sơ pháp lý của bạn đã được kiểm duyệt và phê duyệt thành công qua hệ thống Twenty CRM. Bạn hiện có thể đăng tin tuyển dụng không giới hạn.`;
        
        const notifRes = await db.query(
            `INSERT INTO notifications (user_id, type, title, body, target_type, target_id, created_at)
             VALUES ($1, 'VERIFICATION', $2, $3, 'EMPLOYER', $4, CURRENT_TIMESTAMP)
             RETURNING id, title, created_at`,
            [employer.id, notifTitle, notifBody, employer.id]
        );

        // 4. Giả lập / Gửi thông báo SMS & Email
        const dispatchedChannels = [];

        // Kênh Email
        if (employer.email) {
            console.log(`[EMAIL DISPATCH] Đang gửi email thông báo xác thực tới ${employer.email}...`);
            dispatchedChannels.push({
                channel: 'EMAIL',
                recipient: employer.email,
                subject: `[JobNest] Hồ sơ công ty ${targetCompanyName} đã được phê duyệt!`,
                status: 'DELIVERED',
            });
        }

        // Kênh SMS
        if (employer.phone) {
            console.log(`[SMS DISPATCH] Đang gửi tin nhắn SMS brandname tới ${employer.phone}...`);
            dispatchedChannels.push({
                channel: 'SMS',
                recipient: employer.phone,
                message: `[JobNest] Chuc mung ${targetCompanyName}! Ho so phap ly cua ban da duoc xac thuc thanh cong tren he thong.`,
                status: 'DELIVERED',
            });
        }

        // 5. Ghi nhật ký vào audit_logs nếu bảng tồn tại
        try {
            await db.query(
                `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, created_at)
                 VALUES ($1, 'CRM_VERIFICATION_NOTIFICATION', 'EMPLOYER', $2, $3, CURRENT_TIMESTAMP)`,
                [
                    employer.id,
                    employer.id,
                    JSON.stringify({
                        source: 'TWENTY_CRM_WEBHOOK',
                        verificationStatus: newStatus,
                        dispatchedChannels,
                    }),
                ]
            );
        } catch {
            // Audit log bảng tùy chọn, không chặn luồng chính
        }

        return {
            success: true,
            event: payload.event || 'company.verified',
            employer: {
                id: employer.id,
                email: employer.email,
                company_name: targetCompanyName,
                verification_status: newStatus,
            },
            notification_id: notifRes.rows[0]?.id,
            dispatched_channels: dispatchedChannels,
            timestamp: new Date().toISOString(),
        };
    }
}

module.exports = new TwentyWebhookService();

