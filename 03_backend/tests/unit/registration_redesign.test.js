const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateRegister,
  validateResetPassword
} = require('../../src/modules/auth/auth.validator');

// Helper to run express middleware synchronously or asynchronously
function runMiddleware(middleware, body) {
  return new Promise((resolve, reject) => {
    const req = { body: body || {} };
    const res = {};
    const next = (err) => {
      if (err) return reject(err);
      resolve();
    };
    try {
      middleware(req, res, next);
    } catch (e) {
      reject(e);
    }
  });
}

describe('Registration Simplification — Unit Tests (Auth Validator)', () => {
  // =========================================================================
  // 1. Candidate Registration (Ứng viên) — Tối giản Bước 1
  // =========================================================================
  describe('Candidate Registration Validation (Step 1 Minimal)', () => {
    // Chỉ 6 trường: full_name, email, phone, password, confirmPassword, terms_accepted
    const minimalCandidateData = {
      role: 'STUDENT',
      full_name: 'Nguyễn Văn An',
      email: 'nguyenvanan.test@vlu.edu.vn',
      phone: '0901234567',
      password: 'Password@123',
      terms_accepted: true
    };

    it('should pass with ONLY the 6 core Step 1 candidate fields', async () => {
      await assert.doesNotReject(async () => {
        await runMiddleware(validateRegister, minimalCandidateData);
      });
    });

    it('should reject candidate with missing full_name', async () => {
      const invalid = { ...minimalCandidateData, full_name: '' };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, invalid),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Họ tên'))
      );
    });

    it('should reject candidate with missing email', async () => {
      const invalid = { ...minimalCandidateData, email: '' };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, invalid),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Email'))
      );
    });

    it('should reject candidate with invalid email format', async () => {
      const invalid = { ...minimalCandidateData, email: 'invalid-email-format' };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, invalid),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Email không hợp lệ'))
      );
    });

    it('should reject candidate with invalid phone format', async () => {
      const invalid = { ...minimalCandidateData, phone: '123' };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, invalid),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Số điện thoại'))
      );
    });

    it('should reject candidate with weak password (< 6 chars)', async () => {
      const invalid = { ...minimalCandidateData, password: '123' };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, invalid),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Mật khẩu'))
      );
    });
  });

  // =========================================================================
  // 2. Employer Registration (Nhà tuyển dụng) — Tối giản Bước 1
  // =========================================================================
  describe('Employer Registration Validation (Step 1 Minimal)', () => {
    // Chỉ 7 trường: representative_name, email, phone, company_name, password, confirmPassword, terms_accepted
    const minimalEmployerData = {
      role: 'EMPLOYER',
      representative_name: 'Trần Thị Giám Đốc',
      company_name: 'Công ty Cổ phần Công nghệ ABC',
      email: 'recruitment@abctech.vn',
      phone: '0987654321',
      password: 'Password@2026',
      terms_accepted: true
    };

    it('should pass with ONLY the 7 core Step 1 employer fields', async () => {
      await assert.doesNotReject(async () => {
        await runMiddleware(validateRegister, minimalEmployerData);
      });
    });

    it('should accept full_name fallback if representative_name not given', async () => {
      const fallback = {
        ...minimalEmployerData,
        representative_name: undefined,
        full_name: 'Trần Thị Giám Đốc'
      };
      await assert.doesNotReject(async () => {
        await runMiddleware(validateRegister, fallback);
      });
    });

    it('should reject employer with missing representative name and full_name', async () => {
      const invalid = {
        ...minimalEmployerData,
        representative_name: '',
        full_name: ''
      };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, invalid),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Họ tên'))
      );
    });

    it('should reject employer with missing company_name', async () => {
      const invalid = {
        ...minimalEmployerData,
        company_name: ''
      };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, invalid),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Tên doanh nghiệp'))
      );
    });
  });

  // =========================================================================
  // 3. Security & Role Constraints
  // =========================================================================
  describe('Security & Role Protection', () => {
    it('should strictly reject role ADMIN', async () => {
      const attemptAdmin = {
        role: 'ADMIN',
        full_name: 'Hacker Administrator',
        email: 'hacker@admin.com',
        phone: '0912345678',
        password: 'Password@123'
      };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, attemptAdmin),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Vai trò đăng ký không hợp lệ'))
      );
    });

    it('should strictly reject arbitrary roles like SUPERUSER', async () => {
      const attemptSuper = {
        role: 'SUPERUSER',
        full_name: 'Super User',
        email: 'super@user.com',
        phone: '0912345678',
        password: 'Password@123'
      };
      await assert.rejects(
        async () => await runMiddleware(validateRegister, attemptSuper),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Vai trò đăng ký không hợp lệ'))
      );
    });
  });

  // =========================================================================
  // 4. Direct Password Reset (No OTP Required)
  // =========================================================================
  describe('Direct Password Reset Validation', () => {
    it('should pass with valid email and new password without OTP token', async () => {
      await assert.doesNotReject(async () => {
        await runMiddleware(validateResetPassword, {
          email: 'user.test@vlu.edu.vn',
          new_password: 'NewStrongPassword@2026'
        });
      });
    });

    it('should reject reset when new password is short (< 6 chars)', async () => {
      await assert.rejects(
        async () =>
          await runMiddleware(validateResetPassword, {
            email: 'user.test@vlu.edu.vn',
            new_password: '123'
          }),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('Mật khẩu mới'))
      );
    });

    it('should reject reset without email or token', async () => {
      await assert.rejects(
        async () =>
          await runMiddleware(validateResetPassword, {
            email: '',
            token: '',
            new_password: 'NewStrongPassword@2026'
          }),
        (err) => err.statusCode === 400 && err.details.some(e => e.includes('email'))
      );
    });
  });
});
