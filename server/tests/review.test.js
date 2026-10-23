const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const reviewService = require('../src/services/review.service');
const jobRepository = require('../src/repositories/job.repository');

describe('UC-09: Quy tắc nghiệp vụ Đánh giá sau công việc (Reviews)', () => {
    test('Không cho phép đánh giá nếu công việc chưa hoàn thành (COMPLETED)', async () => {
        const originalFindJob = jobRepository.findById;
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 2,
            status: 'OPEN',
        });

        await assert.rejects(
            async () => {
                await reviewService.createReview(4, {
                    job_id: 1,
                    reviewee_id: 2,
                    rating: 5,
                    comment: 'Rất tốt',
                });
            },
            {
                name: 'AppError',
                message: 'Chỉ có thể đánh giá sau khi công việc đã được xác nhận Hoàn thành (COMPLETED)',
            }
        );

        jobRepository.findById = originalFindJob;
    });

    test('Không cho phép tự đánh giá chính mình', async () => {
        const originalFindJob = jobRepository.findById;
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 2,
            status: 'COMPLETED',
        });

        await assert.rejects(
            async () => {
                await reviewService.createReview(2, {
                    job_id: 1,
                    reviewee_id: 2,
                    rating: 5,
                    comment: 'Tự khen bản thân',
                });
            },
            {
                name: 'AppError',
                message: 'Không thể tự đánh giá chính mình',
            }
        );

        jobRepository.findById = originalFindJob;
    });
});
