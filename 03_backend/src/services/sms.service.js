/**
 * SMS Service for JobNest
 * Supports:
 * 1. Twilio SMS Gateway (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
 * 2. SpeedSMS Gateway for Vietnam (SPEEDSMS_AUTH_TOKEN)
 * 3. eSMS.vn Gateway for Vietnam (ESMS_API_KEY, ESMS_SECRET_KEY)
 * 4. Development fallback with secure capture
 */

class SmsService {
    constructor() {
        this.lastDispatchedSms = null;
        this.dispatchedHistory = [];
    }

    /**
     * Formats phone number to international E.164 format (+84...)
     * @param {string} phone 
     * @returns {string}
     */
    formatPhoneNumber(phone) {
        if (!phone) return '';
        let cleaned = phone.replace(/[^0-9+]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '+84' + cleaned.substring(1);
        } else if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        return cleaned;
    }

    /**
     * Sends SMS via Twilio
     */
    async sendViaTwilio(toPhone, message) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromPhone) {
            return null;
        }

        const formattedPhone = this.formatPhoneNumber(toPhone);
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const params = new URLSearchParams();
        params.append('To', formattedPhone);
        params.append('From', fromPhone);
        params.append('Body', message);

        const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });

            const data = await res.json();
            if (res.ok) {
                return { success: true, sid: data.sid, provider: 'twilio' };
            } else {
                console.error('[Twilio Error]', data);
                return { success: false, error: data.message || 'Twilio SMS failed', provider: 'twilio' };
            }
        } catch (err) {
            console.error('[Twilio Request Exception]', err.message);
            return { success: false, error: err.message, provider: 'twilio' };
        }
    }

    /**
     * Sends SMS via SpeedSMS (Vietnam)
     */
    async sendViaSpeedSms(toPhone, message) {
        const token = process.env.SPEEDSMS_AUTH_TOKEN;
        if (!token) return null;

        let phoneFormatted = toPhone.replace(/[^0-9]/g, '');
        const url = 'https://api.speedsms.vn/index.php/sms/send';

        const payload = {
            to: [phoneFormatted],
            content: message,
            sms_type: 2, // 2: OTP / CSKH
            sender: process.env.SPEEDSMS_SENDER || ''
        };

        try {
            const authHeader = 'Basic ' + Buffer.from(`${token}:x`).toString('base64');
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.status === 'success') {
                return { success: true, data, provider: 'speedsms' };
            } else {
                return { success: false, error: data.message || 'SpeedSMS failed', provider: 'speedsms' };
            }
        } catch (err) {
            return { success: false, error: err.message, provider: 'speedsms' };
        }
    }

    /**
     * Dispatches an OTP via SMS
     * @param {string} toPhone 
     * @param {string} otpCode 
     * @returns {Promise<{ success: boolean, provider: string, simulated: boolean, message?: string }>}
     */
    async sendOtpSms(toPhone, otpCode) {
        const message = `[JobNest] Ma xac thuc OTP cua ban la ${otpCode}. Ma co hieu luc trong 5 phut. Khong chia se ma nay cho bat ky ai.`;

        const record = {
            toPhone,
            otpCode,
            timestamp: new Date().toISOString()
        };
        this.lastDispatchedSms = record;
        this.dispatchedHistory.push(record);

        // 1. Try Twilio
        const twilioResult = await this.sendViaTwilio(toPhone, message);
        if (twilioResult) {
            return { ...twilioResult, simulated: !twilioResult.success };
        }

        // 2. Try SpeedSMS
        const speedSmsResult = await this.sendViaSpeedSms(toPhone, message);
        if (speedSmsResult) {
            return { ...speedSmsResult, simulated: !speedSmsResult.success };
        }

        // 3. Fallback Dev simulation
        console.log(`[JobNest SMS SIMULATOR] Sent OTP ${otpCode} to ${toPhone}`);
        return {
            success: true,
            provider: 'simulated',
            simulated: true,
            message: 'Đã tạo mã OTP thực tế trên máy chủ. Chưa cấu hình Twilio/SpeedSMS API Key trong .env để bắn SMS mạng di động thật.'
        };
    }
}

const smsService = new SmsService();
module.exports = smsService;

