function errorHandler(err, req, res, next) {
    console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);

    // PostgreSQL unique violation error code 23505
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Dữ liệu đã tồn tại trong hệ thống (trùng khóa duy nhất).',
            error: err.detail || err.message,
        });
    }

    // PostgreSQL foreign key violation error code 23503
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Tham chiếu dữ liệu không tồn tại (Lỗi ràng buộc khóa ngoại).',
            error: err.detail || err.message,
        });
    }

    const statusCode = err.statusCode || 500;
    const response = {
        success: false,
        message: err.message || 'Lỗi hệ thống nội bộ máy chủ',
    };

    if (err.details) {
        response.details = err.details;
    }

    if (process.env.NODE_ENV === 'development' && statusCode === 500) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

module.exports = errorHandler;
