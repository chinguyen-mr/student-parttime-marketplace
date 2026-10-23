const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const jobService = require('../src/services/job.service');
const jobRepository = require('../src/repositories/job.repository');

describe('UC-04 & UC-08: Quy tắc nghiệp vụ Tin tuyển dụng (Jobs)', () => {
    test('Không cho phép nhà tuyển dụng khác cập nhật tin không thuộc quyền quản lý', async () => {
        const originalFind = jobRepository.findById;
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 10, // Thuộc employer 10
            status: 'OPEN',
        });

        await assert.rejects(
            async () => {
                await jobService.updateJobStatus(1, 99, 'FILLED'); // Employer 99 cố tình sửa
            },
            {
                name: 'ForbiddenError',
                message: 'Bạn không có quyền chỉnh sửa tin tuyển dụng của nhà tuyển dụng khác',
            }
        );

        jobRepository.findById = originalFind;
    });

    test('Không cho phép chuyển công việc đã hoàn thành (COMPLETED) trở lại trạng thái OPEN', async () => {
        const originalFind = jobRepository.findById;
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 10,
            status: 'COMPLETED',
        });

        await assert.rejects(
            async () => {
                await jobService.updateJobStatus(1, 10, 'OPEN');
            },
            {
                name: 'AppError',
                message: 'Công việc đã hoàn thành không thể chuyển lại trạng thái Đang tuyển',
            }
        );

        jobRepository.findById = originalFind;
    });
});
