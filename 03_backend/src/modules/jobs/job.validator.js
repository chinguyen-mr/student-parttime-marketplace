const { AppError } = require('../../utils/app-error');

function validateCreateJob(req, res, next) {
    const { title, description, category, location, salary, salary_type, work_type } = req.body;
    const errors = [];

    if (!title || title.trim().length < 5) errors.push('Tiêu đề công việc phải có ít nhất 5 ký tự');
    if (!description || description.trim().length < 10) errors.push('Mô tả công việc phải có ít nhất 10 ký tự');
    if (!category || category.trim().length === 0) errors.push('Danh mục công việc không được để trống');
    if (!location || location.trim().length === 0) errors.push('Địa điểm làm việc không được để trống');
    
    const numSalary = Number(salary);
    if (isNaN(numSalary) || numSalary <= 0) {
        errors.push('Mức lương phải là một số dương lớn hơn 0');
    }

    if (salary_type && !['HOURLY', 'FIXED', 'MONTHLY'].includes(salary_type)) {
        errors.push('Loại lương không hợp lệ (chấp nhận: HOURLY, FIXED, MONTHLY)');
    }

    if (work_type && !['PART_TIME', 'FULL_TIME'].includes(work_type)) {
        errors.push('Hình thức công việc không hợp lệ (chấp nhận: PART_TIME, FULL_TIME)');
    }

    const { application_deadline } = req.body;
    if (application_deadline) {
        const deadlineDate = new Date(application_deadline);
        if (isNaN(deadlineDate.getTime())) {
            errors.push('Hạn nộp hồ sơ không đúng định dạng ngày tháng');
        } else if (deadlineDate <= new Date()) {
            errors.push('Hạn nộp hồ sơ (application_deadline) bắt buộc phải là một ngày trong tương lai');
        }
    }

    if (errors.length > 0) {
        return next(new AppError('Dữ liệu đăng tin không hợp lệ', 400, errors));
    }

    next();
}

function validateJobStatus(req, res, next) {
    const { status } = req.body;
    const allowed = ['OPEN', 'FILLED', 'COMPLETED', 'CLOSED'];

    if (!status || !allowed.includes(status)) {
        return next(new AppError(`Trạng thái công việc không hợp lệ. Cho phép: ${allowed.join(', ')}`, 400));
    }

    next();
}

module.exports = {
    validateCreateJob,
    validateJobStatus,
};
