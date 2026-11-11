const db = require('../../config/db');

/**
 * P0-03 & MODULE SPECIFICATION:
 * ĐỘNG CƠ SO KHỚP LỊCH LÀM VIỆC & GỢI Ý CÁ NHÂN HÓA (MATCHING ENGINE)
 * Triển khai mô hình 2 tầng độc lập:
 * - Tầng 1: Bộ lọc cứng (Hard Constraint Gating) — loại bỏ công việc vi phạm ràng buộc bắt buộc.
 * - Tầng 2: Chấm điểm xếp hạng mềm (Soft Composite Scoring: 40% Lịch - 25% Ngành - 20% Vị trí - 15% Lương)
 *   và sinh mảng lý do gợi ý cụ thể (Explainability).
 */
class MatchingService {
    /**
     * Chuyển đổi "HH:MM:SS" hoặc "HH:MM" thành số phút từ đầu ngày (00:00)
     * Xử lý chuỗi an toàn, trả về 0 nếu định dạng không hợp lệ.
     * @param {string} timeStr
     * @returns {number} Số phút (0 - 1440)
     */
    timeToMinutes(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.trim().split(':');
        const hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;
        return Math.max(0, Math.min(1440, hours * 60 + minutes));
    }

    /**
     * Chuyển mã số thứ sang tên tiếng Việt chuẩn
     * Quy ước hệ thống JOBNEST: 1 = Chủ Nhật, 2 = Thứ Hai, ..., 7 = Thứ Bảy
     * @param {number} dayOfWeek
     * @returns {string} Tên thứ
     */
    getDayName(dayOfWeek) {
        const days = {
            1: 'Chủ Nhật',
            2: 'Thứ Hai',
            3: 'Thứ Ba',
            4: 'Thứ Tư',
            5: 'Thứ Năm',
            6: 'Thứ Sáu',
            7: 'Thứ Bảy'
        };
        return days[dayOfWeek] || `Thứ ${dayOfWeek}`;
    }

    /**
     * Hợp nhất các khoảng thời gian bị trùng hoặc tiếp giáp nhau (Disjoint Interval Union)
     * Ngăn chặn việc tính trùng (Double Counting) khi sinh viên có nhiều slot rảnh đè lên nhau.
     * @param {Array<{start_time: string, end_time: string, is_active?: boolean}>} slots
     * @returns {Array<[number, number]>} Các khoảng [startMin, endMin] phân biệt, đã sắp xếp
     */
    mergeIntervals(slots) {
        if (!slots || !Array.isArray(slots) || slots.length === 0) return [];

        // 1. Chuyển sang phút và lọc các khoảng không hợp lệ (end <= start) hoặc bị vô hiệu hóa
        const intervals = [];
        for (const s of slots) {
            if (s.is_active === false) continue;
            const start = this.timeToMinutes(s.start_time);
            const end = this.timeToMinutes(s.end_time);
            if (end > start) {
                intervals.push([start, end]);
            }
        }

        if (intervals.length === 0) return [];

        // 2. Sắp xếp theo start tăng dần
        intervals.sort((a, b) => a[0] - b[0]);

        // 3. Gom các khoảng trùng hoặc tiếp giáp nhau
        const merged = [intervals[0]];
        for (let i = 1; i < intervals.length; i++) {
            const current = intervals[i];
            const last = merged[merged.length - 1];

            if (current[0] <= last[1]) {
                // Trùng hoặc tiếp giáp -> mở rộng điểm kết thúc
                last[1] = Math.max(last[1], current[1]);
            } else {
                merged.push(current);
            }
        }

        return merged;
    }

    /**
     * Tính toán độ trùng khớp thời gian giữa ca yêu cầu của Job và lịch rảnh sinh viên
     * Sử dụng thuật toán giao khoảng thời gian (Interval Intersection) trên tập hợp đã hợp nhất,
     * loại bỏ hoàn toàn nguy cơ Double Counting và kiểm tra nghiêm ngặt thời lượng ca tối thiểu (min_hours_per_shift).
     * 
     * @param {Array} jobSchedules - Danh sách ca làm việc của công việc
     * @param {Array} studentSlots - Danh sách khung giờ rảnh của sinh viên
     * @param {Object} [options] - Cấu hình so khớp bổ sung
     * @returns {Object} Chi tiết kết quả so khớp thời gian
     */
    calculateScheduleOverlap(jobSchedules, studentSlots, options = {}) {
        if (!jobSchedules || jobSchedules.length === 0) {
            return {
                is_flexible: true,
                total_required_hours: 0,
                total_covered_hours: 0,
                coverage_ratio: 1.0,
                mandatory_count: 0,
                mandatory_satisfied_count: 0,
                all_mandatory_satisfied: true,
                matched_shifts: [],
                unmatched_shifts: []
            };
        }

        let totalRequiredHours = 0;
        let totalCoveredHours = 0;
        let mandatoryCount = 0;
        let mandatorySatisfiedCount = 0;
        const matchedShifts = [];
        const unmatchedShifts = [];

        // Lọc các khung rảnh của sinh viên còn hoạt động
        const activeStudentSlots = (studentSlots || []).filter(s => s.is_active !== false);

        for (const jobShift of jobSchedules) {
            const jStartMin = this.timeToMinutes(jobShift.start_time);
            const jEndMin = this.timeToMinutes(jobShift.end_time);

            // Bỏ qua ca không hợp lệ nếu end <= start
            if (jEndMin <= jStartMin) continue;

            const shiftDurationHours = (jEndMin - jStartMin) / 60;
            totalRequiredHours += shiftDurationHours;

            const isMandatory = jobShift.is_mandatory !== false;
            if (isMandatory) mandatoryCount++;

            const minRequiredHours = parseFloat(jobShift.min_hours_per_shift || 0);

            // Lấy và hợp nhất các slot rảnh của sinh viên vào cùng thứ (tránh double count)
            const studentDaySlots = activeStudentSlots.filter(s => s.day_of_week === jobShift.day_of_week);
            const mergedDayIntervals = this.mergeIntervals(studentDaySlots);

            let shiftCoveredMinutes = 0;
            for (const [sStartMin, sEndMin] of mergedDayIntervals) {
                const overlapStart = Math.max(jStartMin, sStartMin);
                const overlapEnd = Math.min(jEndMin, sEndMin);

                if (overlapEnd > overlapStart) {
                    shiftCoveredMinutes += (overlapEnd - overlapStart);
                }
            }

            const shiftCoveredHours = Math.min(shiftDurationHours, shiftCoveredMinutes / 60);

            // Kiểm tra ràng buộc thời lượng ca tối thiểu (Minimum Shift Duration Rule)
            if (shiftCoveredHours >= minRequiredHours && shiftCoveredHours > 0) {
                totalCoveredHours += shiftCoveredHours;
                if (isMandatory) mandatorySatisfiedCount++;

                matchedShifts.push({
                    day_of_week: jobShift.day_of_week,
                    day_name: this.getDayName(jobShift.day_of_week),
                    start_time: jobShift.start_time,
                    end_time: jobShift.end_time,
                    hours_covered: Math.round(shiftCoveredHours * 10) / 10,
                    hours_required: Math.round(shiftDurationHours * 10) / 10,
                    min_hours_per_shift: minRequiredHours,
                    is_mandatory: isMandatory
                });
            } else {
                unmatchedShifts.push({
                    day_of_week: jobShift.day_of_week,
                    day_name: this.getDayName(jobShift.day_of_week),
                    start_time: jobShift.start_time,
                    end_time: jobShift.end_time,
                    hours_covered: Math.round(shiftCoveredHours * 10) / 10,
                    hours_required: Math.round(shiftDurationHours * 10) / 10,
                    min_hours_per_shift: minRequiredHours,
                    is_mandatory: isMandatory,
                    reason: shiftCoveredHours === 0 
                        ? 'Sinh viên không rảnh khung giờ này' 
                        : `Thời lượng trùng (${Math.round(shiftCoveredHours * 10) / 10}h) chưa đạt tối thiểu (${minRequiredHours}h)`
                });
            }
        }

        const coverageRatio = totalRequiredHours > 0 
            ? Math.min(1.0, totalCoveredHours / totalRequiredHours) 
            : 1.0;

        const allMandatorySatisfied = mandatoryCount === 0 || mandatorySatisfiedCount === mandatoryCount;

        return {
            is_flexible: false,
            total_required_hours: Math.round(totalRequiredHours * 10) / 10,
            total_covered_hours: Math.round(totalCoveredHours * 10) / 10,
            coverage_ratio: Math.round(coverageRatio * 100) / 100,
            mandatory_count: mandatoryCount,
            mandatory_satisfied_count: mandatorySatisfiedCount,
            all_mandatory_satisfied: allMandatorySatisfied,
            matched_shifts: matchedShifts,
            unmatched_shifts: unmatchedShifts
        };
    }

    /**
     * Đánh giá một tin tuyển dụng đối với một sinh viên cụ thể theo mô hình 2 tầng
     * @param {Object} job - Thông tin công việc
     * @param {Array} jobSchedules - Các ca làm việc của công việc
     * @param {Array} studentSlots - Lịch rảnh của sinh viên
     * @param {Object} studentProfile - Hồ sơ chuyên ngành, trường, địa điểm của sinh viên
     * @param {Object} [options] - Tùy chọn kiểm tra (mandatoryPolicy: 'AT_LEAST_ONE' | 'ALL')
     * @returns {Object} Kết quả đánh giá
     */
    evaluateJobForStudent(job, jobSchedules, studentSlots, studentProfile, options = {}) {
        const activeSlots = (studentSlots || []).filter(s => s.is_active !== false);
        const hasAvailability = activeSlots.length > 0;
        const overlapResult = this.calculateScheduleOverlap(jobSchedules, activeSlots, options);

        // ================= GIAI ĐOẠN 1: BỘ LỌC CỨNG (HARD CONSTRAINTS) =================
        // 1.1. Công việc bắt buộc phải đang mở nhận đơn (OPEN) và được phê duyệt (APPROVED)
        if (job.status !== 'OPEN') {
            return { is_qualified: false, reason: `Công việc không ở trạng thái mở (status: ${job.status})` };
        }
        if (job.moderation_status && job.moderation_status !== 'APPROVED') {
            return { is_qualified: false, reason: `Công việc chưa được kiểm duyệt phê duyệt (moderation: ${job.moderation_status})` };
        }

        // 1.2. Nếu sinh viên ĐÃ cài đặt lịch rảnh và công việc có ca cụ thể:
        if (hasAvailability && !overlapResult.is_flexible) {
            const mandatoryPolicy = options.mandatoryPolicy || 'AT_LEAST_ONE';

            if (mandatoryPolicy === 'ALL') {
                if (!overlapResult.all_mandatory_satisfied) {
                    return { is_qualified: false, reason: 'Chưa đáp ứng đầy đủ tất cả ca làm việc bắt buộc' };
                }
            } else {
                // Mặc định 'AT_LEAST_ONE': Nếu có ca bắt buộc, sinh viên phải đáp ứng ít nhất 1 ca
                if (overlapResult.mandatory_count > 0 && overlapResult.mandatory_satisfied_count === 0) {
                    return { is_qualified: false, reason: 'Không đáp ứng được ca làm việc bắt buộc nào' };
                }
            }

            // Ngưỡng tối thiểu tỷ lệ phủ giờ: dưới 40% -> LOẠI BỎ vì không đảm bảo ca làm việc
            const minCoverageThreshold = options.minCoverageThreshold !== undefined ? options.minCoverageThreshold : 0.40;
            if (overlapResult.coverage_ratio < minCoverageThreshold) {
                return { 
                    is_qualified: false, 
                    reason: `Thời lượng rảnh (${Math.round(overlapResult.coverage_ratio * 100)}%) dưới ngưỡng tối thiểu (${Math.round(minCoverageThreshold * 100)}%)` 
                };
            }
        }

        // ================= GIAI ĐOẠN 2: CHẤM ĐIỂM XẾP HẠNG (SOFT SCORING) =================
        // Tiêu chí 1: Thời gian (Trọng số 40%)
        let scheduleScore = 0.5; // Điểm trung tính cho sinh viên chưa cài đặt lịch (Cold-start)
        if (hasAvailability) {
            scheduleScore = overlapResult.is_flexible ? 1.0 : overlapResult.coverage_ratio;
        } else if (overlapResult.is_flexible) {
            scheduleScore = 0.9;
        }

        // Tiêu chí 2: Ngành nghề & Chuyên ngành (Trọng số 25%)
        let categoryScore = 0.6;
        const studentMajor = (studentProfile?.major || '').toLowerCase();
        const jobCat = (job.category || '').toLowerCase();
        if (studentMajor && jobCat && (jobCat.includes(studentMajor) || studentMajor.includes(jobCat))) {
            categoryScore = 1.0;
        } else if (['nhà hàng / f&b', 'bán lẻ', 'sự kiện / pg / pb', 'phục vụ', 'dịch vụ / bán vé', 'gia sư'].some(c => jobCat.includes(c))) {
            categoryScore = 0.8; // Ngành phổ thông phù hợp đại đa số sinh viên
        } else if (!studentMajor) {
            categoryScore = 0.6; // Điểm trung tính nếu chưa nhập chuyên ngành
        } else {
            categoryScore = 0.4; // Ngành chuyên môn khác biệt
        }

        // Tiêu chí 3: Địa điểm (Trọng số 20%)
        let locationScore = 0.7;
        const jobLoc = (job.location || '').toLowerCase();
        if (jobLoc.includes('remote') || jobLoc.includes('từ xa') || jobLoc.includes('online')) {
            locationScore = 1.0;
        } else if (jobLoc.includes('bình thạnh') || jobLoc.includes('quận 1') || jobLoc.includes('gò vấp')) {
            locationScore = 0.9; // Khu vực liền kề các cơ sở ĐH lớn (VLU CS1, CS2, CS3)
        } else if (jobLoc.includes('hồ chí minh') || jobLoc.includes('tp.hcm') || jobLoc.includes('tphcm')) {
            locationScore = 0.7;
        } else if (!jobLoc) {
            locationScore = 0.5;
        } else {
            locationScore = 0.4;
        }

        // Tiêu chí 4: Mức lương (Trọng số 15%)
        let salaryScore = 0.7;
        const salaryNum = parseFloat(job.salary || 0);
        if (job.salary_type === 'HOURLY') {
            if (salaryNum >= 45000) salaryScore = 1.0;
            else if (salaryNum >= 35000) salaryScore = 0.85;
            else if (salaryNum >= 25000) salaryScore = 0.7;
            else if (salaryNum > 0) salaryScore = 0.5;
            else salaryScore = 0.65;
        } else if (job.salary_type === 'MONTHLY') {
            if (salaryNum >= 6000000) salaryScore = 1.0;
            else if (salaryNum >= 3500000) salaryScore = 0.8;
            else if (salaryNum > 0) salaryScore = 0.6;
            else salaryScore = 0.65;
        } else {
            salaryScore = salaryNum > 0 ? 0.8 : 0.65;
        }

        // Tính tổng Matching Score (thang 100 điểm)
        const rawScore = (0.40 * scheduleScore + 0.25 * categoryScore + 0.20 * locationScore + 0.15 * salaryScore) * 100;
        const compositeScore = Math.min(100, Math.max(0, Math.round(rawScore)));

        // ================= TẠO MẢNG LÝ DO GỢI Ý CỤ THỂ (EXPLAINABILITY) =================
        const matchReasons = [];
        const matchReasonDetails = [];

        // 1. Lý do lịch làm việc
        if (hasAvailability && !overlapResult.is_flexible) {
            const pct = Math.round(overlapResult.coverage_ratio * 100);
            let scheduleLabel = '';
            if (pct >= 90) {
                const shiftDescriptions = overlapResult.matched_shifts
                    .map(s => `${s.day_name} (${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)})`)
                    .join(', ');
                scheduleLabel = `Khớp ${pct}% lịch học: Trùng các ca ${shiftDescriptions}`;
            } else {
                scheduleLabel = `Khớp ${pct}% ca làm việc yêu cầu`;
            }
            matchReasons.push(scheduleLabel);
            matchReasonDetails.push({ type: 'schedule', label: scheduleLabel, score: scheduleScore });
        } else if (overlapResult.is_flexible) {
            const label = 'Thời gian làm việc linh hoạt / Freelance: Phù hợp với mọi lịch học';
            matchReasons.push(label);
            matchReasonDetails.push({ type: 'schedule', label, score: scheduleScore });
        } else {
            const label = 'Bạn chưa cập nhật lịch rảnh: Hãy bổ sung lịch để nhận gợi ý chính xác nhất';
            matchReasons.push(label);
            matchReasonDetails.push({ type: 'schedule', label, score: scheduleScore });
        }

        // 2. Lý do chuyên ngành
        if (categoryScore >= 0.9) {
            const label = `Phù hợp chuyên ngành học của bạn (${studentProfile?.major || job.category})`;
            matchReasons.push(label);
            matchReasonDetails.push({ type: 'category', label, score: categoryScore });
        } else if (categoryScore >= 0.8) {
            const label = `Ngành nghề phổ thông, linh hoạt cho sinh viên (${job.category || 'Dịch vụ'})`;
            matchReasons.push(label);
            matchReasonDetails.push({ type: 'category', label, score: categoryScore });
        }

        // 3. Lý do vị trí
        if (locationScore >= 0.9) {
            const label = `Vị trí thuận tiện: ${job.location || 'Gần trường học'}`;
            matchReasons.push(label);
            matchReasonDetails.push({ type: 'location', label, score: locationScore });
        }

        // 4. Lý do mức lương
        if (salaryScore >= 0.85) {
            const salaryFormatted = new Intl.NumberFormat('vi-VN').format(job.salary || 0);
            const unit = job.salary_type === 'HOURLY' ? 'giờ' : 'tháng';
            const label = `Mức thu nhập hấp dẫn: ${salaryFormatted} đ/${unit}`;
            matchReasons.push(label);
            matchReasonDetails.push({ type: 'salary', label, score: salaryScore });
        }

        // Huy hiệu trực quan (Badge)
        let badgeType = 'MATCHED';
        let badgeLabel = 'Phù hợp';
        if (hasAvailability) {
            if (overlapResult.coverage_ratio >= 0.85) {
                badgeType = 'PERFECT_MATCH';
                badgeLabel = `Khớp ${Math.round(overlapResult.coverage_ratio * 100)}% lịch học`;
            } else if (overlapResult.coverage_ratio >= 0.40) {
                badgeType = 'PARTIAL_MATCH';
                badgeLabel = `Khớp ${Math.round(overlapResult.coverage_ratio * 100)}% ca làm`;
            } else {
                badgeType = 'FLEXIBLE';
                badgeLabel = 'Bán thời gian';
            }
        } else {
            badgeLabel = overlapResult.is_flexible ? 'Linh hoạt' : 'Gợi ý ngành nghề';
        }

        return {
            is_qualified: true,
            matching_score: compositeScore,
            schedule_match_percentage: Math.round(scheduleScore * 100),
            badge_type: badgeType,
            badge_label: badgeLabel,
            match_reasons: matchReasons,
            match_reason_details: matchReasonDetails,
            overlap_details: overlapResult,
            scores: {
                schedule: scheduleScore,
                category: categoryScore,
                location: locationScore,
                salary: salaryScore
            }
        };
    }

    /**
     * Lấy danh sách việc làm gợi ý cá nhân hóa cho sinh viên từ PostgreSQL
     * @param {number} studentId
     * @param {Object} [params]
     * @returns {Promise<Object>}
     */
    async getRecommendedJobs(studentId, { limit = 20, offset = 0, mandatoryPolicy = 'AT_LEAST_ONE' } = {}) {
        // 1. Lấy lịch rảnh hiện tại của sinh viên
        const availRes = await db.query(
            'SELECT * FROM student_availabilities WHERE student_id = $1 AND is_active = TRUE ORDER BY day_of_week, start_time',
            [studentId]
        );
        const studentSlots = availRes.rows;

        // 2. Lấy hồ sơ sinh viên
        const profileRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [studentId]);
        const studentProfile = profileRes.rows[0] || {};

        // 3. Lấy tất cả các công việc đang mở (OPEN) và đã duyệt
        const jobsQuery = `
            SELECT j.*, 
                   COALESCE(ep.display_name, 'Doanh nghiệp') AS employer_name, 
                   ep.location AS employer_location,
                   ep.avatar_url AS employer_avatar
            FROM jobs j
            LEFT JOIN employer_profiles ep ON ep.user_id = j.employer_id
            WHERE j.status = 'OPEN' 
              AND (j.moderation_status = 'APPROVED' OR j.moderation_status IS NULL)
            ORDER BY j.created_at DESC
        `;
        const jobsRes = await db.query(jobsQuery);
        const openJobs = jobsRes.rows;

        // 4. Lấy tất cả ca làm việc của các job này
        const jobIds = openJobs.map(j => j.id);
        const schedulesByJobId = {};
        if (jobIds.length > 0) {
            const schedRes = await db.query(
                'SELECT * FROM job_work_schedules WHERE job_id = ANY($1::int[]) ORDER BY day_of_week, start_time',
                [jobIds]
            );
            for (const s of schedRes.rows) {
                if (!schedulesByJobId[s.job_id]) schedulesByJobId[s.job_id] = [];
                schedulesByJobId[s.job_id].push(s);
            }
        }

        // 5. Chạy thuật toán so khớp 2 tầng
        const evaluatedJobs = [];
        for (const job of openJobs) {
            const schedules = schedulesByJobId[job.id] || [];
            const evaluation = this.evaluateJobForStudent(job, schedules, studentSlots, studentProfile, { mandatoryPolicy });

            if (evaluation.is_qualified) {
                evaluatedJobs.push({
                    ...job,
                    matching_score: evaluation.matching_score,
                    schedule_match_percentage: evaluation.schedule_match_percentage,
                    badge_type: evaluation.badge_type,
                    badge_label: evaluation.badge_label,
                    match_reasons: evaluation.match_reasons,
                    match_reason_details: evaluation.match_reason_details,
                    work_schedules: schedules
                });
            }
        }

        // 6. Sắp xếp danh sách theo Matching Score giảm dần
        evaluatedJobs.sort((a, b) => b.matching_score - a.matching_score);

        const paginatedJobs = evaluatedJobs.slice(offset, offset + limit);

        return {
            student_has_availability: studentSlots.length > 0,
            total_available_slots: studentSlots.length,
            total_matched_jobs: evaluatedJobs.length,
            jobs: paginatedJobs
        };
    }
}

module.exports = new MatchingService();

