const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const profileRoutes = require('./modules/auth/profile.routes');
const jobRoutes = require('./modules/jobs/job.routes');
const applicationRoutes = require('./modules/applications/application.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const adminRoutes = require('./modules/reports/admin.routes');
const selectionRoutes = require('./modules/selections/selection.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const proposalRoutes = require('./modules/proposals/proposal.routes');
const assignmentRoutes = require('./modules/assignments/assignment.routes');
const errorHandler = require('./middleware/error.middleware');
const { NotFoundError } = require('./utils/app-error');
const db = require('./config/db');



const app = express();

// Middlewares
// CORS allowlist: ưu tiên CORS_ORIGINS từ env; mặc định giữ đủ 8 origin localhost hiện có.
const defaultAllowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:3000',
];

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
    : defaultAllowedOrigins;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Không ném lỗi: chỉ bỏ CORS header, trình duyệt tự chặn — không lộ stack/config.
            console.warn(`[CORS] Từ chối origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());

// Health Check — KHÔNG trả err.message (lộ host/user/db name)
app.get('/health', async (req, res) => {
    const result = await db.testConnection();
    res.status(result.ok ? 200 : 503).json({
        status: result.ok ? 'ok' : 'degraded',
        db: result.ok ? 'ok' : 'unavailable',
        service: 'cd2-marketplace-backend',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/health', (req, res) => res.redirect('/health'));

// API Routes
// A3 RULE: Endpoint duy nhất chấp nhận ứng viên và khởi tạo Work Assignment
app.use('/api/v1/jobs', selectionRoutes);
app.use('/api/jobs', selectionRoutes);

// Base API Routes (Hỗ trợ cả /api và /api/v1)
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/v1/proposals', proposalRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/v1/assignments', assignmentRoutes);



// 404 Route Handler
app.use((req, res, next) => {
    next(new NotFoundError(`Đường dẫn không tồn tại: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
