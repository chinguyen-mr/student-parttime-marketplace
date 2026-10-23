const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/error.middleware');
const { NotFoundError } = require('./errors/app-error');
const db = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', async (req, res) => {
    let dbStatus = 'ok';
    try {
        await db.query('SELECT 1');
    } catch (err) {
        dbStatus = `unhealthy: ${err.message}`;
    }

    res.status(dbStatus === 'ok' ? 200 : 503).json({
        status: dbStatus === 'ok' ? 'ok' : 'degraded',
        db: dbStatus,
        service: 'cd2-marketplace-backend',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/health', (req, res) => res.redirect('/health'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((req, res, next) => {
    next(new NotFoundError(`Đường dẫn không tồn tại: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
