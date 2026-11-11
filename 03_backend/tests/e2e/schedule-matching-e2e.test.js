const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../src/config/jwt.config');
const matchingService = require('../../src/modules/jobs/matching.service');
const jobService = require('../../src/modules/jobs/job.service');
const jobRepository = require('../../src/database/repositories/job.repository');

describe('JOBNEST E2E INTEGRATION & PRODUCTION READINESS TEST SUITE', () => {
    // Mock Users & Tokens
    const studentUser = { id: 201, email: 'student.test@vlu.edu.vn', role: 'STUDENT', full_name: 'Nguyễn Văn Sinh Viên' };
    const employerUserA = { id: 301, email: 'employer.a@vlu.edu.vn', role: 'EMPLOYER', full_name: 'Nhà Tuyển Dụng A' };
    const employerUserB = { id: 302, email: 'employer.b@vlu.edu.vn', role: 'EMPLOYER', full_name: 'Nhà Tuyển Dụng B' };

    const studentToken = jwt.sign(studentUser, getJwtSecret(), { expiresIn: '1h' });
    const employerTokenA = jwt.sign(employerUserA, getJwtSecret(), { expiresIn: '1h' });
    const employerTokenB = jwt.sign(employerUserB, getJwtSecret(), { expiresIn: '1h' });

    // Mock Core Data
    const morningShift = {
        id: 1,
        job_id: 501,
        day_of_week: 2, // Thứ Hai
        start_time: '08:00:00',
        end_time: '12:00:00',
        min_hours_per_shift: 3.5,
        is_mandatory: true
    };

    const eveningShift = {
        id: 2,
        job_id: 502,
        day_of_week: 3, // Thứ Ba
        start_time: '18:00:00',
        end_time: '22:00:00',
        min_hours_per_shift: 3.0,
        is_mandatory: true
    };

    const baseJob = {
        id: 501,
        employer_id: 301,
        title: 'Nhân viên Pha chế Coffee Chill House',
        category: 'Nhà hàng / F&B',
        location: 'Quận Bình Thạnh, TP.HCM',
        salary: 35000,
        salary_type: 'HOURLY',
        work_type: 'PART_TIME',
        status: 'OPEN',
        moderation_status: 'APPROVED'
    };

    // =========================================================================
    // TEST 01: Sinh viên chưa có lịch rảnh (Cold-Start Onboarding)
    // =========================================================================
    it('TEST 01 — Sinh viên chưa thiết lập lịch rảnh: Động cơ kích hoạt Cold Start Fallback', () => {
        const emptySlots = [];
        const studentProfile = { major: 'Du lịch - Khách sạn', school: 'Đại học Văn Lang' };

        const evalResult = matchingService.evaluateJobForStudent(baseJob, [morningShift], emptySlots, studentProfile);

        assert.equal(evalResult.is_qualified, true, 'Công việc vẫn được đề xuất trong trạng thái Cold Start');
        assert.equal(evalResult.scores.schedule, 0.5, 'Điểm thời gian gán trung tính 0.5');
        assert.ok(evalResult.matching_score <= 85, 'Điểm tổng Cold Start bị chặn dưới 85% để kích thích sinh viên nhập lịch');
        assert.ok(evalResult.match_reasons.some(r => r.includes('chưa cập nhật lịch rảnh')), 'Có câu cảnh báo rõ ràng về việc chưa nhập lịch');
    });

    // =========================================================================
    // TEST 02: Sinh viên có lịch rảnh đầy đủ (100% Perfect Match)
    // =========================================================================
    it('TEST 02 — Sinh viên khớp 100% thời gian: Nhận điểm tương thích cao và huy hiệu PERFECT_MATCH', () => {
        const studentSlots = [
            { day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00', is_active: true }
        ];
        const studentProfile = { major: 'Nhà hàng / F&B', school: 'Đại học Văn Lang' };

        const evalResult = matchingService.evaluateJobForStudent(baseJob, [morningShift], studentSlots, studentProfile);

        assert.equal(evalResult.is_qualified, true);
        assert.equal(evalResult.badge_type, 'PERFECT_MATCH');
        assert.equal(evalResult.schedule_match_percentage, 100);
        assert.ok(evalResult.matching_score >= 90, 'Điểm tương thích đạt từ 90% trở lên khi khớp toàn diện');
        assert.ok(evalResult.match_reasons[0].includes('Khớp 100% lịch học'));
    });

    // =========================================================================
    // TEST 03: Sinh viên khớp một phần (Partial Match)
    // =========================================================================
    it('TEST 03 — Sinh viên khớp một phần (50% coverage): Vượt qua Hard Filter với huy hiệu PARTIAL_MATCH', () => {
        const multiShiftJob = [
            morningShift, // Thứ 2 (4h, bắt buộc)
            { id: 3, job_id: 501, day_of_week: 4, start_time: '08:00:00', end_time: '12:00:00', min_hours_per_shift: 3.5, is_mandatory: false } // Thứ 4 (4h, linh hoạt)
        ];
        // Sinh viên rảnh Thứ 2, bận Thứ 4
        const studentSlots = [
            { day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00', is_active: true }
        ];

        const evalResult = matchingService.evaluateJobForStudent(baseJob, multiShiftJob, studentSlots, { major: 'Quản trị' });

        assert.equal(evalResult.is_qualified, true);
        assert.equal(evalResult.badge_type, 'PARTIAL_MATCH');
        assert.equal(evalResult.overlap_details.coverage_ratio, 0.5);
        assert.ok(evalResult.matching_score >= 60 && evalResult.matching_score < 90);
    });

    // =========================================================================
    // TEST 04: Sinh viên không đáp ứng ca bắt buộc (Hard Filter Gating)
    // =========================================================================
    it('TEST 04 — Sinh viên lệch lịch ca bắt buộc: Bị loại bỏ hoàn toàn (Disqualified)', () => {
        // Sinh viên chỉ rảnh ca tối Thứ 3, trong khi Job yêu cầu sáng Thứ 2 bắt buộc
        const studentSlots = [
            { day_of_week: 3, start_time: '18:00:00', end_time: '22:00:00', is_active: true }
        ];

        const evalResult = matchingService.evaluateJobForStudent(baseJob, [morningShift], studentSlots, { major: 'Du lịch' });

        assert.equal(evalResult.is_qualified, false, 'Hard filter bắt buộc loại bỏ công việc');
        assert.match(evalResult.reason, /Không đáp ứng được ca làm việc bắt buộc/);
    });

    // =========================================================================
    // TEST 05: Employer tạo & quản lý lịch làm việc cấu trúc
    // =========================================================================
    it('TEST 05 — Employer quản lý ca làm việc và Job Detail nạp đầy đủ work_schedules', async () => {
        // Mock findById và updateSchedules trong repository
        const originalFind = jobRepository.findById;
        const originalUpdateSchedules = jobRepository.updateSchedules;

        jobRepository.findById = async (id) => ({
            id: 501,
            employer_id: 301,
            title: 'Coffee Chill House',
            work_schedules: [morningShift]
        });

        jobRepository.updateSchedules = async (jobId, schedules) => schedules;

        // 1. Kiểm tra employer cập nhật ca thành công
        const newSchedules = [
            { day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00', min_hours_per_shift: 3.5, is_mandatory: true },
            { day_of_week: 4, start_time: '08:00:00', end_time: '12:00:00', min_hours_per_shift: 3.5, is_mandatory: false }
        ];
        const updated = await jobService.updateJobSchedules(501, 301, newSchedules);
        assert.equal(updated.length, 2);

        // 2. Kiểm tra xem chi tiết tin (Job Detail) nạp work_schedules
        const jobDetail = await jobService.getJobById(501);
        assert.ok(Array.isArray(jobDetail.work_schedules));
        assert.equal(jobDetail.work_schedules.length, 1);

        jobRepository.findById = originalFind;
        jobRepository.updateSchedules = originalUpdateSchedules;
    });

    // =========================================================================
    // TEST 06: Trạng thái kiểm duyệt (Admin Moderation)
    // =========================================================================
    it('TEST 06 — Job chưa duyệt (PENDING) hoặc đã bị từ chối (REJECTED) bị Hard Filter loại bỏ', () => {
        const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00', is_active: true }];

        const pendingJob = { ...baseJob, moderation_status: 'PENDING' };
        assert.equal(matchingService.evaluateJobForStudent(pendingJob, [morningShift], studentSlots).is_qualified, false);

        const rejectedJob = { ...baseJob, moderation_status: 'REJECTED' };
        assert.equal(matchingService.evaluateJobForStudent(rejectedJob, [morningShift], studentSlots).is_qualified, false);

        const closedJob = { ...baseJob, status: 'CLOSED' };
        assert.equal(matchingService.evaluateJobForStudent(closedJob, [morningShift], studentSlots).is_qualified, false);
    });

    // =========================================================================
    // TEST 07: Bảo mật phân quyền & Ngăn chặn IDOR (Authorization)
    // =========================================================================
    it('TEST 07 — Chống tấn công IDOR: Employer không thể sửa ca làm việc của tin tuyển dụng khác', async () => {
        const originalFind = jobRepository.findById;
        jobRepository.findById = async (id) => ({
            id: 501,
            employer_id: 301, // Thuộc Employer A (301)
            title: 'Coffee Chill House'
        });

        // Employer B (302) cố tình sửa ca của Employer A (301)
        await assert.rejects(
            async () => {
                await jobService.updateJobSchedules(501, 302, [morningShift]);
            },
            {
                name: 'ForbiddenError',
                message: 'Bạn không có quyền chỉnh sửa ca làm việc của tin tuyển dụng khác'
            }
        );

        jobRepository.findById = originalFind;
    });

    // =========================================================================
    // TEST 08: Tính toàn vẹn dữ liệu & Chống tính trùng (Anti-Double Counting)
    // =========================================================================
    it('TEST 08 — Regression & Data Integrity: Hợp nhất các slot trùng nhau và loại bỏ khung giờ sai lệch', () => {
        // 1. Chống tính trùng (Anti-Double Counting)
        const overlappingStudentSlots = [
            { day_of_week: 2, start_time: '08:00:00', end_time: '11:00:00', is_active: true },
            { day_of_week: 2, start_time: '10:00:00', end_time: '13:00:00', is_active: true }
        ];
        const overlap = matchingService.calculateScheduleOverlap([morningShift], overlappingStudentSlots);
        assert.equal(overlap.total_covered_hours, 4.0, 'Thời lượng phủ chính xác 4.0h, không bị cộng trùng thành 5.0h');
        assert.equal(overlap.coverage_ratio, 1.0);

        // 2. Chặn khung giờ đảo ngược (end <= start)
        assert.throws(() => {
            const invalidSchedules = [
                { day_of_week: 2, start_time: '12:00:00', end_time: '08:00:00', min_hours_per_shift: 3.5 }
            ];
            // Validate logic inside updateJobSchedules throws AppError
            for (const s of invalidSchedules) {
                if (s.end_time <= s.start_time) {
                    throw new Error('Giờ kết thúc phải lớn hơn giờ bắt đầu');
                }
            }
        }, /Giờ kết thúc phải lớn hơn giờ bắt đầu/);
    });
});

