class AppError extends Error {
    constructor(message, statusCode = 400, details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400);
        this.name = 'BadRequestError';
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource conflict', details = null) {
        super(message, 409, details);
        this.name = 'ConflictError';
    }
}

class StateTransitionInvalidError extends AppError {
    constructor(message = 'ACCEPTED chỉ được set qua POST /jobs/:jobId/selections (A3 RULE)') {
        super(message, 409, 'STATE_TRANSITION_INVALID');
        this.name = 'StateTransitionInvalidError';
        this.code = 'STATE_TRANSITION_INVALID';
    }
}

class QuantityExceededError extends AppError {
    constructor(message = 'Số lượng ứng viên được chọn vượt quá số lượng tuyển dụng của công việc') {
        super(message, 409, 'QUANTITY_EXCEEDED');
        this.name = 'QuantityExceededError';
        this.code = 'QUANTITY_EXCEEDED';
    }
}

module.exports = {
    AppError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    StateTransitionInvalidError,
    QuantityExceededError,
};

