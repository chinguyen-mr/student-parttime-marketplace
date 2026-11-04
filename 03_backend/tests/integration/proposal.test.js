const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const proposalService = require('../../src/modules/proposals/proposal.service');
const selectionService = require('../../src/modules/selections/selection.service');
const jobRepository = require('../../src/database/repositories/job.repository');
const db = require('../../src/config/db');

describe('NGÀY 3: Kiểm thử Module Proposals (Freelance Flow & A3 Rule)', () => {
    // 1. Student nộp proposal cho job Freelance hợp lệ → 201 + insert vào DB
    test('Student nộp proposal cho job Freelance hợp lệ -> 201 + insert vào DB', async () => {
        const originalFindJob = jobRepository.findById;
        const originalDbQuery = db.query;

        jobRepository.findById = async (id) => ({
            id: 10,
            employer_id: 2,
            title: 'Thiết kế Logo thương hiệu',
            work_type: 'FREELANCE',
            status: 'OPEN',
        });

        db.query = async (sql, params) => {
            // Check existing
            if (typeof sql === 'string' && (sql.includes('proposals WHERE job_id') || sql.includes('freelance_proposals WHERE job_id'))) {
                return { rows: [] };
            }
            // Insert proposal
            if (typeof sql === 'string' && (sql.includes('INSERT INTO freelance_proposals') || sql.includes('INSERT INTO proposals'))) {
                return {
                    rows: [{
                        id: 100,
                        job_id: params[0],
                        student_id: params[1],
                        proposal_text: params[2],
                        estimated_duration: params[3],
                        proposed_price: params[4],
                        status: 'SUBMITTED',
                        submitted_at: new Date()
                    }]
                };
            }
            // Notifications insert
            if (typeof sql === 'string' && sql.includes('INSERT INTO notifications')) {
                return { rows: [{ id: 1 }] };
            }
            return { rows: [] };
        };

        const result = await proposalService.createProposal(5, {
            job_id: 10,
            proposal_text: 'Tôi có kinh nghiệm Figma và Photoshop trên 2 năm, hoàn thành đúng hạn.',
            estimated_duration: '5 ngày',
            proposed_price: 2500000
        });

        assert.equal(result.id, 100);
        assert.equal(result.status, 'SUBMITTED');
        assert.equal(result.proposed_price, 2500000);

        jobRepository.findById = originalFindJob;
        db.query = originalDbQuery;
    });

    // 2. Student nộp proposal cho job Part-time → 409 STATE_TRANSITION_INVALID
    test('Student nộp proposal cho job Part-time -> 409 STATE_TRANSITION_INVALID', async () => {
        const originalFindJob = jobRepository.findById;

        jobRepository.findById = async (id) => ({
            id: 11,
            employer_id: 2,
            title: 'Phục vụ quán cà phê',
            work_type: 'PART_TIME',
            status: 'OPEN',
        });

        await assert.rejects(
            async () => {
                await proposalService.createProposal(5, {
                    job_id: 11,
                    proposal_text: 'Tôi có kinh nghiệm làm barista và phục vụ bàn nhiệt tình.',
                });
            },
            {
                name: 'StateTransitionInvalidError',
                message: 'Công việc này không phải hình thức Freelance, vui lòng nộp đơn ứng tuyển Part-time thông thường'
            }
        );

        jobRepository.findById = originalFindJob;
    });

    // 3. Student nộp proposal trùng cho cùng job → 409 DUPLICATE_RESOURCE
    test('Student nộp proposal trùng cho cùng job -> 409 DUPLICATE_RESOURCE', async () => {
        const originalFindJob = jobRepository.findById;
        const originalDbQuery = db.query;

        jobRepository.findById = async (id) => ({
            id: 10,
            employer_id: 2,
            title: 'Thiết kế Web UI',
            work_type: 'FREELANCE',
            status: 'OPEN',
        });

        // Already exists
        db.query = async (sql, params) => {
            if (typeof sql === 'string' && (sql.includes('proposals WHERE job_id') || sql.includes('freelance_proposals WHERE job_id'))) {
                return { rows: [{ id: 50 }] };
            }
            return { rows: [] };
        };

        await assert.rejects(
            async () => {
                await proposalService.createProposal(5, {
                    job_id: 10,
                    proposal_text: 'Tôi muốn làm đề xuất lần 2 cho công việc này.',
                });
            },
            {
                name: 'ConflictError',
            }
        );

        jobRepository.findById = originalFindJob;
        db.query = originalDbQuery;
    });

    // 4. Employer xem danh sách proposals của job mình → 200 + list
    test('Employer xem danh sách proposals của job mình -> 200 + list', async () => {
        const originalFindJob = jobRepository.findById;
        const originalDbQuery = db.query;

        jobRepository.findById = async (id) => ({
            id: 10,
            employer_id: 2,
            title: 'Thiết kế Logo thương hiệu',
        });

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && (sql.includes('FROM freelance_proposals p') || sql.includes('FROM proposals p'))) {
                return {
                    rows: [
                        { id: 1, job_id: 10, student_id: 5, student_name: 'Nguyễn Văn A', status: 'SUBMITTED' },
                        { id: 2, job_id: 10, student_id: 6, student_name: 'Trần Thị B', status: 'REVIEWING' }
                    ]
                };
            }
            return { rows: [] };
        };

        const list = await proposalService.getJobProposals(10, 2);
        assert.equal(list.length, 2);
        assert.equal(list[0].student_name, 'Nguyễn Văn A');

        jobRepository.findById = originalFindJob;
        db.query = originalDbQuery;
    });

    // 5. Employer chuyển proposal sang REVIEWING → 200
    test('Employer chuyển proposal sang REVIEWING -> 200', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('SELECT p.*, j.employer_id')) {
                return {
                    rows: [{
                        id: 1,
                        job_id: 10,
                        employer_id: 2,
                        student_id: 5,
                        status: 'SUBMITTED',
                        job_title: 'Thiết kế Logo thương hiệu'
                    }]
                };
            }
            if (typeof sql === 'string' && (sql.includes('UPDATE freelance_proposals') || sql.includes('UPDATE proposals'))) {
                return {
                    rows: [{
                        id: 1,
                        status: 'REVIEWING',
                        updated_at: new Date()
                    }]
                };
            }
            if (typeof sql === 'string' && sql.includes('INSERT INTO notifications')) {
                return { rows: [{ id: 1 }] };
            }
            return { rows: [] };
        };

        const updated = await proposalService.updateStatus(1, 2, 'REVIEWING');
        assert.equal(updated.status, 'REVIEWING');

        db.query = originalDbQuery;
    });

    // 6. Employer cố set ACCEPTED qua PATCH → 409 (A3)
    test('Employer cố set ACCEPTED qua PATCH -> 409 (A3)', async () => {
        await assert.rejects(
            async () => {
                await proposalService.updateStatus(1, 2, 'ACCEPTED');
            },
            {
                name: 'StateTransitionInvalidError',
                message: 'ACCEPTED chỉ được set qua POST /jobs/:jobId/selections (A3 RULE)'
            }
        );
    });

    // 7. Employer không sở hữu job gọi PATCH → 403
    test('Employer không sở hữu job gọi PATCH -> 403', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('SELECT p.*, j.employer_id')) {
                return {
                    rows: [{
                        id: 1,
                        job_id: 10,
                        employer_id: 2, // Thuộc về employer 2
                        student_id: 5,
                        status: 'SUBMITTED',
                        job_title: 'Thiết kế Logo'
                    }]
                };
            }
            return { rows: [] };
        };

        await assert.rejects(
            async () => {
                // Employer 99 cố cập nhật
                await proposalService.updateStatus(1, 99, 'REJECTED');
            },
            {
                name: 'ForbiddenError',
            }
        );

        db.query = originalDbQuery;
    });

    // 8. Selections endpoint với proposalIds → proposal ACCEPTED + tạo work_assignment
    test('Selections endpoint với proposalIds -> proposal ACCEPTED + tạo work_assignment', async () => {
        const originalFindJob = jobRepository.findById;
        const originalPool = db.pool;
        const originalDbQuery = db.query;

        jobRepository.findById = async (id) => ({
            id: 10,
            employer_id: 2,
            title: 'Thiết kế Website E-commerce',
            work_type: 'FREELANCE',
            status: 'OPEN',
            quantity_required: 1,
        });

        const mockClient = {
            query: async (sql, params) => {
                if (typeof sql === 'string' && sql.includes('INSERT INTO work_assignments')) {
                    return {
                        rows: [{
                            id: 88,
                            job_id: params[0],
                            student_id: params[1],
                            proposal_id: params[2],
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

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && (sql.includes('FROM freelance_proposals WHERE id') || sql.includes('FROM proposals WHERE id'))) {
                return {
                    rows: [{
                        id: 100,
                        job_id: 10,
                        student_id: 5,
                        status: 'SUBMITTED'
                    }]
                };
            }
            if (typeof sql === 'string' && (sql.includes('COUNT(*) FROM freelance_proposals') || sql.includes('COUNT(*) FROM proposals'))) {
                return { rows: [{ count: '0' }] };
            }
            return { rows: [] };
        };

        const result = await selectionService.createSelections(10, 2, { proposalIds: [100] });

        assert.equal(result.job_id, 10);
        assert.equal(result.accepted_count, 1);
        assert.equal(result.assignments.length, 1);
        assert.equal(result.assignments[0].proposal_id, 100);
        assert.equal(result.assignments[0].status, 'ASSIGNED');

        jobRepository.findById = originalFindJob;
        db.pool = originalPool;
        db.query = originalDbQuery;
    });
});
