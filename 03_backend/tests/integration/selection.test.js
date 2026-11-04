const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const selectionService = require('../../src/modules/selections/selection.service');
const jobRepository = require('../../src/database/repositories/job.repository');
const applicationRepository = require('../../src/database/repositories/application.repository');
const db = require('../../src/config/db');

describe('RULE A3: Tuyến duy nhất chấp nhận ứng viên và khởi tạo Work Assignment (POST /jobs/:jobId/selections)', () => {
    test('Employer sở hữu job có thể chọn ứng viên -> application chuyển ACCEPTED + assignment được tạo', async () => {
        const originalFindJob = jobRepository.findById;
        const originalFindApp = applicationRepository.findById;
        const originalPool = db.pool;

        // Mock Job
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 10,
            status: 'OPEN',
            quantity_required: 5,
        });

        // Mock Application
        applicationRepository.findById = async (id) => ({
            id: 101,
            job_id: 1,
            student_id: 25,
            status: 'PENDING',
        });

        // Mock DB Pool transaction & queries
        const mockClient = {
            query: async (sql, params) => {
                if (typeof sql === 'string' && sql.includes('INSERT INTO work_assignments')) {
                    return {
                        rows: [{
                            id: 1,
                            job_id: params[0],
                            student_id: params[1],
                            application_id: params[2],
                            status: 'ASSIGNED',
                        }]
                    };
                }
                return { rows: [] };
            },
            release: () => {}
        };

        db.pool = {
            connect: async () => mockClient,
            query: async () => ({ rows: [{ count: '0' }] })
        };
        db.query = async () => ({ rows: [{ count: '0' }] });

        const result = await selectionService.createSelections(1, 10, [101]);

        assert.equal(result.job_id, 1);
        assert.equal(result.accepted_count, 1);
        assert.equal(result.assignments.length, 1);
        assert.equal(result.assignments[0].status, 'ASSIGNED');
        assert.equal(result.assignments[0].application_id, 101);

        // Restore
        jobRepository.findById = originalFindJob;
        applicationRepository.findById = originalFindApp;
        db.pool = originalPool;
    });

    test('Employer không sở hữu job gọi selections -> 403 Forbidden', async () => {
        const originalFindJob = jobRepository.findById;

        // Job belongs to employer 10, but employer 99 calls
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 10,
            status: 'OPEN',
            quantity_required: 5,
        });

        await assert.rejects(
            async () => {
                await selectionService.createSelections(1, 99, [101]);
            },
            {
                name: 'ForbiddenError',
                message: 'Bạn không có quyền lựa chọn ứng viên cho tin tuyển dụng của nhà tuyển dụng khác',
            }
        );

        jobRepository.findById = originalFindJob;
    });

    test('Chọn vượt quantity_required -> 409 QuantityExceeded', async () => {
        const originalFindJob = jobRepository.findById;
        const originalFindApp = applicationRepository.findById;
        const originalDbQuery = db.query;

        // Job has quantity_required = 1
        jobRepository.findById = async (id) => ({
            id: 1,
            employer_id: 10,
            status: 'OPEN',
            quantity_required: 1,
        });

        applicationRepository.findById = async (id) => ({
            id: id,
            job_id: 1,
            student_id: id + 10,
            status: 'PENDING',
        });

        // Current accepted count = 1
        db.query = async (sql) => {
            if (typeof sql === 'string' && sql.includes('COUNT(*)')) {
                return { rows: [{ count: '1' }] };
            }
            return { rows: [] };
        };

        // Try to select 1 more (1 + 1 = 2 > 1) -> 409
        await assert.rejects(
            async () => {
                await selectionService.createSelections(1, 10, [101]);
            },
            {
                name: 'QuantityExceededError',
            }
        );

        jobRepository.findById = originalFindJob;
        applicationRepository.findById = originalFindApp;
        db.query = originalDbQuery;
    });
});
