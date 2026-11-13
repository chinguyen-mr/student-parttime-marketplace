const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const profileRoutes = require('./modules/auth/profile.routes');
const jobRoutes = require('./modules/jobs/job.routes');
const applicationRoutes = require('./modules/applications/application.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const experienceReviewRoutes = require('./modules/reviews/experience-review.routes');
const experienceReviewAdminRoutes = require('./modules/reviews/experience-review.admin.routes');
const adminRoutes = require('./modules/reports/admin.routes');
const reportRoutes = require('./modules/reports/report.routes');
const selectionRoutes = require('./modules/selections/selection.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const proposalRoutes = require('./modules/proposals/proposal.routes');
const assignmentRoutes = require('./modules/assignments/assignment.routes');
const webhookRoutes = require('./modules/webhooks/webhook.routes');
const fileRoutes = require('./modules/files/file.routes');
const errorHandler = require('./middleware/error.middleware');
const { NotFoundError } = require('./utils/app-error');
const db = require('./config/db');

const app = express();

// Express reverse-proxy configuration: trust 1 hop (Nginx reverse proxy)
// Ensures req.ip correctly reflects the client's IP from X-Forwarded-For set by Nginx
app.set('trust proxy', 1);

// Middlewares
// CORS allowlist: hỗ trợ các cổng chuẩn (8080, 8081, 5173, 3000) và tự động cho phép mọi cổng localhost trong môi trường phát triển
const defaultAllowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:8082',
    'http://127.0.0.1:8082',
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
        const isLocalhost = Boolean(origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
        if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
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
// Ảnh tải lên gửi dạng base64 nên cần giới hạn lớn hơn mặc định 100kb (phải đứng trước parser chung)
app.use(['/api/files', '/api/v1/files'], express.json({ limit: '8mb' }));
app.use(express.json());

// Root Endpoint & Favicon (Phản hồi thân thiện khi mở cổng 5000 trên trình duyệt)
app.get('/', (req, res) => {
    res.json({
        service: 'cd2-marketplace-backend',
        status: 'online',
        health_check: 'http://localhost:5000/health',
        frontend_app: 'http://localhost:8080',
        message: 'Máy chủ Backend API đang hoạt động bình thường! Để mở giao diện Web người dùng, vui lòng truy cập http://localhost:8080'
    });
});
app.get('/favicon.ico', (req, res) => res.status(204).end());

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
// Đánh giá doanh nghiệp & công việc của ứng viên (migration 014)
app.use('/api/reviews', experienceReviewRoutes);
app.use('/api/v1/reviews', experienceReviewRoutes);
app.use('/api/admin/reviews', experienceReviewAdminRoutes);
app.use('/api/v1/admin/reviews', experienceReviewAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/v1/proposals', proposalRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// 404 Route Handler
app.use((req, res, next) => {
    next(new NotFoundError(`Đường dẫn không tồn tại: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
