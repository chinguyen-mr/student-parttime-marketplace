const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const matchingService = require('../../src/modules/jobs/matching.service');

describe('ĐỘNG CƠ SO KHỚP LỊCH LÀM VIỆC & GỢI Ý CÁ NHÂN HÓA (MATCHING ENGINE TEST SUITE)', () => {
    // Ca làm việc mẫu
    const morningShiftT2 = {
        id: 1,
        job_id: 101,
        day_of_week: 2, // Thứ Hai
        start_time: '08:00:00',
        end_time: '12:00:00',
        min_hours_per_shift: 3.5,
        is_mandatory: true
    };

    const morningShiftT4 = {
        id: 2,
        job_id: 101,
        day_of_week: 4, // Thứ Tư
        start_time: '08:00:00',
        end_time: '12:00:00',
        min_hours_per_shift: 3.5,
        is_mandatory: true
    };

    const flexibleShiftT6 = {
        id: 3,
        job_id: 101,
        day_of_week: 6, // Thứ Sáu
        start_time: '08:00:00',
        end_time: '12:00:00',
        min_hours_per_shift: 3.0,
        is_mandatory: false
    };

    const eveningShiftT3 = {
        id: 4,
        job_id: 102,
        day_of_week: 3, // Thứ Ba
        start_time: '18:00:00',
        end_time: '22:00:00',
        min_hours_per_shift: 3.0,
        is_mandatory: true
    };

    const standardJob = {
        id: 101,
        title: 'Nhân viên Phục vụ Part-time Coffee House',
        category: 'Nhà hàng / F&B',
        location: 'Quận Bình Thạnh, TP.HCM',
        salary: 35000,
        salary_type: 'HOURLY',
        status: 'OPEN',
        moderation_status: 'APPROVED'
    };

    // =========================================================================
    // NHÓM A: HARD CONSTRAINT FILTER (BỘ LỌC CỨNG)
    // =========================================================================
    describe('Nhóm A: Hard Constraint Filter (Bộ lọc điều kiện cứng)', () => {
        it('A1. Chấp thuận công việc OPEN và đã APPROVED', () => {
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const res = matchingService.evaluateJobForStudent(standardJob, [morningShiftT2], studentSlots);
            assert.equal(res.is_qualified, true);
        });

        it('A2. Loại bỏ công việc đã CLOSED', () => {
            const closedJob = { ...standardJob, status: 'CLOSED' };
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const res = matchingService.evaluateJobForStudent(closedJob, [morningShiftT2], studentSlots);
            assert.equal(res.is_qualified, false);
            assert.match(res.reason, /không ở trạng thái mở/);
        });

        it('A3. Loại bỏ công việc chưa được duyệt (moderation_status !== APPROVED)', () => {
            const pendingJob = { ...standardJob, moderation_status: 'PENDING' };
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const res = matchingService.evaluateJobForStudent(pendingJob, [morningShiftT2], studentSlots);
            assert.equal(res.is_qualified, false);
            assert.match(res.reason, /chưa được kiểm duyệt phê duyệt/);
        });

        it('A4. Loại bỏ công việc bị REJECTED', () => {
            const rejectedJob = { ...standardJob, moderation_status: 'REJECTED' };
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const res = matchingService.evaluateJobForStudent(rejectedJob, [morningShiftT2], studentSlots);
            assert.equal(res.is_qualified, false);
        });

        it('A5. Loại bỏ công việc khi sinh viên không đáp ứng được ca bắt buộc nào', () => {
            // Sinh viên chỉ rảnh T3 tối, job yêu cầu sáng T2 bắt buộc
            const studentSlots = [{ day_of_week: 3, start_time: '18:00:00', end_time: '22:00:00' }];
            const res = matchingService.evaluateJobForStudent(standardJob, [morningShiftT2], studentSlots);
            assert.equal(res.is_qualified, false);
            assert.match(res.reason, /Không đáp ứng được ca làm việc bắt buộc/);
        });

        it('A6. Chấp thuận công việc không có ca bắt buộc (hoàn toàn linh hoạt)', () => {
            const studentSlots = [{ day_of_week: 6, start_time: '08:00:00', end_time: '12:00:00' }];
            const res = matchingService.evaluateJobForStudent(standardJob, [flexibleShiftT6], studentSlots);
            assert.equal(res.is_qualified, true);
        });

        it('A7. Đáp ứng chính sách ALL khi tùy chọn mandatoryPolicy: "ALL"', () => {
            const twoMandatoryShifts = [morningShiftT2, morningShiftT4];
            // Sinh viên chỉ rảnh T2, bận T4
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            
            // Với chính sách mặc định AT_LEAST_ONE: Qualified (vì đáp ứng 1 ca và coverage = 50% >= 40%)
            const resAtLeastOne = matchingService.evaluateJobForStudent(standardJob, twoMandatoryShifts, studentSlots);
            assert.equal(resAtLeastOne.is_qualified, true);

            // Với chính sách khắt khe ALL: Disqualified
            const resAll = matchingService.evaluateJobForStudent(standardJob, twoMandatoryShifts, studentSlots, {}, { mandatoryPolicy: 'ALL' });
            assert.equal(resAll.is_qualified, false);
            assert.match(resAll.reason, /đầy đủ tất cả ca làm việc bắt buộc/);
        });
    });

    // =========================================================================
    // NHÓM B: TIME OVERLAP ENGINE & GEOMETRY
    // =========================================================================
    describe('Nhóm B: Time Overlap Engine & Edge Cases (Tính toán giao khoảng thời gian)', () => {
        it('B1. Khớp hoàn toàn 100% thời gian (Perfect Match)', () => {
            const studentSlots = [
                { day_of_week: 2, start_time: '07:30:00', end_time: '12:30:00' }
            ];
            const overlap = matchingService.calculateScheduleOverlap([morningShiftT2], studentSlots);
            assert.equal(overlap.coverage_ratio, 1.0);
            assert.equal(overlap.total_covered_hours, 4.0);
            assert.equal(overlap.all_mandatory_satisfied, true);
            assert.equal(overlap.matched_shifts.length, 1);
        });

        it('B2. Khớp một phần hợp lệ (Partial Match) đạt ngưỡng tối thiểu', () => {
            const studentSlots = [
                { day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' } // Khớp T2 (4h), thiếu T4 (4h)
            ];
            const multiDayJob = [morningShiftT2, morningShiftT4];
            const overlap = matchingService.calculateScheduleOverlap(multiDayJob, studentSlots);
            assert.equal(overlap.total_required_hours, 8.0);
            assert.equal(overlap.total_covered_hours, 4.0);
            assert.equal(overlap.coverage_ratio, 0.5);
            assert.equal(overlap.matched_shifts.length, 1);
            assert.equal(overlap.unmatched_shifts.length, 1);
        });

        it('B3. Không khớp thời gian (0% Overlap)', () => {
            const studentSlots = [
                { day_of_week: 5, start_time: '08:00:00', end_time: '12:00:00' }
            ];
            const overlap = matchingService.calculateScheduleOverlap([morningShiftT2], studentSlots);
            assert.equal(overlap.total_covered_hours, 0);
            assert.equal(overlap.coverage_ratio, 0);
            assert.equal(overlap.matched_shifts.length, 0);
        });

        it('B4. Loại bỏ thời lượng nếu không đạt min_hours_per_shift', () => {
            // Ca yêu cầu min 3.5h, sinh viên chỉ rảnh 2h (08:00 - 10:00)
            const studentSlots = [
                { day_of_week: 2, start_time: '08:00:00', end_time: '10:00:00' }
            ];
            const overlap = matchingService.calculateScheduleOverlap([morningShiftT2], studentSlots);
            assert.equal(overlap.total_covered_hours, 0);
            assert.equal(overlap.coverage_ratio, 0);
            assert.equal(overlap.matched_shifts.length, 0);
            assert.match(overlap.unmatched_shifts[0].reason, /chưa đạt tối thiểu/);
        });

        it('B5. Xử lý chính xác tiếp giáp biên (Boundary Contact: duration = 0)', () => {
            // Job: 08:00 - 12:00. Sinh viên rảnh: 12:00 - 16:00 (chạm biên tại 12:00)
            const studentSlots = [
                { day_of_week: 2, start_time: '12:00:00', end_time: '16:00:00' }
            ];
            const overlap = matchingService.calculateScheduleOverlap([morningShiftT2], studentSlots);
            assert.equal(overlap.total_covered_hours, 0);
            assert.equal(overlap.coverage_ratio, 0);
        });

        it('B6. Hợp nhất khoảng rảnh (Merge Intervals) — Chống tính trùng (Anti-Double Counting)', () => {
            // Sinh viên có 2 slot rảnh đè lên nhau vào Thứ 2:
            // Slot 1: 08:00 - 11:00 (3h)
            // Slot 2: 10:00 - 13:00 (3h)
            // Hợp nhất thực tế: 08:00 - 13:00 (5h)
            // Job yêu cầu: 08:00 - 12:00 (4h)
            // Nếu bị double-counting, nó sẽ cộng (3h + 2h = 5h) vượt quá thời lượng ca 4h!
            const overlappingSlots = [
                { day_of_week: 2, start_time: '08:00:00', end_time: '11:00:00' },
                { day_of_week: 2, start_time: '10:00:00', end_time: '13:00:00' }
            ];
            const overlap = matchingService.calculateScheduleOverlap([morningShiftT2], overlappingSlots);
            assert.equal(overlap.total_covered_hours, 4.0); // Bằng đúng 4.0h của ca làm việc, không bị 5.0h
            assert.equal(overlap.coverage_ratio, 1.0);
        });

        it('B7. Tin tuyển dụng hoàn toàn linh hoạt (Không có lịch làm việc)', () => {
            const overlap = matchingService.calculateScheduleOverlap([], [{ day_of_week: 2, start_time: '08:00', end_time: '12:00' }]);
            assert.equal(overlap.is_flexible, true);
            assert.equal(overlap.coverage_ratio, 1.0);
            assert.equal(overlap.all_mandatory_satisfied, true);
        });
    });

    // =========================================================================
    // NHÓM C: SOFT COMPOSITE SCORING (CHẤM ĐIỂM XẾP HẠNG MỀM)
    // =========================================================================
    describe('Nhóm C: Soft Composite Scoring (Chấm điểm tương thích 4 thành phần)', () => {
        it('C1. Tuân thủ chính xác công thức trọng số 40% - 25% - 20% - 15%', () => {
            // Sinh viên A: Khớp 100% thời gian (S_sched = 1.0), Ngành khớp CNTT (S_cat = 1.0),
            // Địa điểm Bình Thạnh (S_loc = 0.9), Lương 50k >= 45k (S_sal = 1.0)
            // MatchingScore = 0.4*1.0 + 0.25*1.0 + 0.20*0.9 + 0.15*1.0 = 0.40 + 0.25 + 0.18 + 0.15 = 0.98 -> 98%
            const itJob = {
                id: 201,
                title: 'Lập trình viên Frontend React.js',
                category: 'Công nghệ thông tin',
                location: 'Quận Bình Thạnh, TP.HCM',
                salary: 50000,
                salary_type: 'HOURLY',
                status: 'OPEN',
                moderation_status: 'APPROVED'
            };
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const profile = { major: 'Công nghệ thông tin', school: 'ĐH Văn Lang' };

            const res = matchingService.evaluateJobForStudent(itJob, [morningShiftT2], studentSlots, profile);
            assert.equal(res.is_qualified, true);
            assert.equal(res.matching_score, 98);
            assert.equal(res.scores.schedule, 1.0);
            assert.equal(res.scores.category, 1.0);
            assert.equal(res.scores.location, 0.9);
            assert.equal(res.scores.salary, 1.0);
        });

        it('C2. Điểm ngành nghề: Ưu tiên ngành khớp (1.0), ngành phổ thông (0.8), ngành khác (0.4)', () => {
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const profile = { major: 'Thiết kế đồ họa' };

            // Job thiết kế: 1.0
            const designJob = { ...standardJob, category: 'Thiết kế đồ họa' };
            const resDesign = matchingService.evaluateJobForStudent(designJob, [morningShiftT2], studentSlots, profile);
            assert.equal(resDesign.scores.category, 1.0);

            // Job phục vụ F&B: 0.8
            const resFb = matchingService.evaluateJobForStudent(standardJob, [morningShiftT2], studentSlots, profile);
            assert.equal(resFb.scores.category, 0.8);

            // Job xây dựng / khác: 0.4
            const otherJob = { ...standardJob, category: 'Xây dựng / Cầu đường' };
            const resOther = matchingService.evaluateJobForStudent(otherJob, [morningShiftT2], studentSlots, profile);
            assert.equal(resOther.scores.category, 0.4);
        });

        it('C3. Điểm địa điểm: Remote (1.0), Quận trung tâm/gần trường (0.9), TP.HCM (0.7)', () => {
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];

            const remoteJob = { ...standardJob, location: 'Remote / Làm việc từ xa' };
            const resRemote = matchingService.evaluateJobForStudent(remoteJob, [morningShiftT2], studentSlots);
            assert.equal(resRemote.scores.location, 1.0);

            const binhThanhJob = { ...standardJob, location: 'Quận Bình Thạnh, TP.HCM' };
            const resBinhThanh = matchingService.evaluateJobForStudent(binhThanhJob, [morningShiftT2], studentSlots);
            assert.equal(resBinhThanh.scores.location, 0.9);

            const hcmJob = { ...standardJob, location: 'Quận 7, TP.HCM' };
            const resHcm = matchingService.evaluateJobForStudent(hcmJob, [morningShiftT2], studentSlots);
            assert.equal(resHcm.scores.location, 0.7);
        });

        it('C4. Điểm mức lương: Phân cấp theo bậc giờ và bậc tháng', () => {
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];

            // Lương giờ cao >= 45k -> 1.0
            const highJob = { ...standardJob, salary: 50000, salary_type: 'HOURLY' };
            assert.equal(matchingService.evaluateJobForStudent(highJob, [morningShiftT2], studentSlots).scores.salary, 1.0);

            // Lương giờ khá >= 35k -> 0.85
            const midJob = { ...standardJob, salary: 35000, salary_type: 'HOURLY' };
            assert.equal(matchingService.evaluateJobForStudent(midJob, [morningShiftT2], studentSlots).scores.salary, 0.85);

            // Lương giờ cơ bản >= 25k -> 0.7
            const lowJob = { ...standardJob, salary: 28000, salary_type: 'HOURLY' };
            assert.equal(matchingService.evaluateJobForStudent(lowJob, [morningShiftT2], studentSlots).scores.salary, 0.7);
        });

        it('C5. Điểm tổng không bao giờ vượt quá khoảng [0, 100]', () => {
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const res = matchingService.evaluateJobForStudent(standardJob, [morningShiftT2], studentSlots);
            assert.ok(res.matching_score >= 0 && res.matching_score <= 100);
        });
    });

    // =========================================================================
    // NHÓM D: DATA INTEGRITY & COLD START FALLBACK
    // =========================================================================
    describe('Nhóm D: Data Integrity & Cold Start Fallback', () => {
        it('D1. Sinh viên chưa cài đặt lịch rảnh: Fallback an toàn với nhãn nhắc nhở', () => {
            const emptySlots = [];
            const profile = { major: 'Công nghệ thông tin' };
            const res = matchingService.evaluateJobForStudent(standardJob, [morningShiftT2], emptySlots, profile);
            assert.equal(res.is_qualified, true);
            assert.equal(res.scores.schedule, 0.5);
            assert.ok(res.match_reasons.some(r => r.includes('chưa cập nhật lịch rảnh')));
        });

        it('D2. Lịch rảnh bị vô hiệu hóa (is_active = FALSE): Tự động bỏ qua khung giờ này', () => {
            // Sinh viên có slot rảnh sáng T2 bị vô hiệu hóa (is_active: false), và slot tối T3 đang hoạt động
            const mixedSlots = [
                { day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00', is_active: false },
                { day_of_week: 3, start_time: '18:00:00', end_time: '22:00:00', is_active: true }
            ];
            // Với Job sáng T2: vì slot T2 bị inactive nên sinh viên không có giờ trùng ca bắt buộc sáng T2 -> BỊ LOẠI BỞI HARD FILTER
            const res = matchingService.evaluateJobForStudent(standardJob, [morningShiftT2], mixedSlots);
            assert.equal(res.is_qualified, false);
            assert.match(res.reason, /Không đáp ứng được ca làm việc bắt buộc/);
        });

        it('D3. Xử lý an toàn khi khung giờ sai lệch (end <= start)', () => {
            const invalidSlots = [
                { day_of_week: 2, start_time: '12:00:00', end_time: '08:00:00', is_active: true }
            ];
            const merged = matchingService.mergeIntervals(invalidSlots);
            assert.equal(merged.length, 0); // Đã loại bỏ khung sai
        });

        it('D4. Xử lý an toàn khi thiếu dữ liệu chuyên ngành hoặc mức lương', () => {
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const jobWithoutSalary = { ...standardJob, salary: null, salary_type: null };
            const emptyProfile = {};
            const res = matchingService.evaluateJobForStudent(jobWithoutSalary, [morningShiftT2], studentSlots, emptyProfile);
            assert.equal(res.is_qualified, true);
            assert.ok(!isNaN(res.matching_score));
            assert.ok(res.matching_score > 0);
        });
    });

    // =========================================================================
    // NHÓM E: INTEGRATION & EXPLAINABILITY
    // =========================================================================
    describe('Nhóm E: Integration & Explainability (Minh bạch lý do gợi ý)', () => {
        it('E1. Sinh mảng lý do cụ thể theo cả 2 dạng chuỗi và đối tượng cấu trúc', () => {
            const studentSlots = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const profile = { major: 'Nhà hàng / F&B' };
            const res = matchingService.evaluateJobForStudent(standardJob, [morningShiftT2], studentSlots, profile);

            // Kiểm tra mảng chuỗi trực quan
            assert.ok(Array.isArray(res.match_reasons));
            assert.ok(res.match_reasons.length >= 2);
            assert.ok(res.match_reasons[0].includes('Khớp 100% lịch học'));

            // Kiểm tra mảng đối tượng cấu trúc
            assert.ok(Array.isArray(res.match_reason_details));
            const scheduleDetail = res.match_reason_details.find(d => d.type === 'schedule');
            assert.ok(scheduleDetail);
            assert.equal(scheduleDetail.score, 1.0);
        });

        it('E2. Huy hiệu hiển thị (Badge) chính xác theo tỷ lệ khớp', () => {
            // Khớp 100% -> PERFECT_MATCH
            const studentSlotsFull = [{ day_of_week: 2, start_time: '08:00:00', end_time: '12:00:00' }];
            const resFull = matchingService.evaluateJobForStudent(standardJob, [morningShiftT2], studentSlotsFull);
            assert.equal(resFull.badge_type, 'PERFECT_MATCH');

            // Khớp 50% -> PARTIAL_MATCH
            const multiShift = [morningShiftT2, morningShiftT4];
            const resPartial = matchingService.evaluateJobForStudent(standardJob, multiShift, studentSlotsFull);
            assert.equal(resPartial.badge_type, 'PARTIAL_MATCH');
        });
    });
});
