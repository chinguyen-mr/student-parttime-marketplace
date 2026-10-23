const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const applicationService = require('../src/services/application.service');
const jobRepository = require('../src/repositories/job.repository');
const applicationRepository = require('../src/repositories/application.repository');

describe('UC-06 & UC-07: Quy tắc nghiệp vụ Ứng tuyển (Applications)', () => {
    test('Nhà tuyển dụng không thể tự nộp đơn ứng tuyển vào tin của chính mình', async () => {
        const originalFindJob = jobRepository.findById;
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 5,
            status: 'OPEN',
            moderation_status: 'APPROVED',
        });

        await assert.rejects(
            async () => {
                await applicationService.applyForJob(5, { job_id: 1 });
            },
            {
                name: 'AppError',
                message: 'Nhà tuyển dụng không thể tự ứng tuyển vào tin của chính mình',
            }
        );

        jobRepository.findById = originalFindJob;
    });

    test('Không cho phép nộp đơn vào công việc đã đóng hoặc chưa duyệt', async () => {
        const originalFindJob = jobRepository.findById;
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 5,
            status: 'CLOSED',
            moderation_status: 'APPROVED',
        });

        await assert.rejects(
            async () => {
                await applicationService.applyForJob(20, { job_id: 1 });
            },
            {
                name: 'AppError',
                message: 'Tin tuyển dụng này hiện đã đóng hoặc không còn nhận ứng viên',
            }
        );

        jobRepository.findById = originalFindJob;
    });

    test('Không cho phép một sinh viên nộp đơn ứng tuyển trùng lặp vào cùng 1 tin', async () => {
        const originalFindJob = jobRepository.findById;
        const originalFindApp = applicationRepository.findByJobAndStudent;

        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 5,
            status: 'OPEN',
            moderation_status: 'APPROVED',
        });

        applicationRepository.findByJobAndStudent = async (jobId, studentId) => ({
            id: 99,
            job_id: 1,
            student_id: 20,
            status: 'PENDING',
        });

        await assert.rejects(
            async () => {
                await applicationService.applyForJob(20, { job_id: 1 });
            },
            {
                name: 'ConflictError',
                message: 'Bạn đã nộp đơn ứng tuyển cho công việc này rồi. Không thể nộp đơn trùng.',
            }
        );

        jobRepository.findById = originalFindJob;
        applicationRepository.findByJobAndStudent = originalFindApp;
    });
});
