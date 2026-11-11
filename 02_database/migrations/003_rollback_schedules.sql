-- =============================================================================
-- ROLLBACK 003: HOÀN NGUYÊN BẢNG LỊCH RẢNH VÀ CA LÀM VIỆC (CHỈ THỰC HIỆN KHI XÁC NHẬN)
-- Dự án: JOBNEST
-- Lưu ý: Không dùng DROP TABLE CASCADE tự động để tránh mất dữ liệu liên đới
-- =============================================================================

DROP TABLE IF EXISTS job_work_schedules;
DROP TABLE IF EXISTS student_availabilities;

