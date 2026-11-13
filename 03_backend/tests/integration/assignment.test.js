const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const assignmentService = require('../../src/modules/assignments/assignment.service');
const db = require('../../src/config/db');

describe('NGÀY 4: Kiểm thử Module Work Assignments (Tiến độ công việc & Phân quyền)', () => {
    // 1. Student xem my-assignments → trả list
    test('Student xem my-assignments -> trả list', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('FROM work_assignments wa')) {
                return {
                    rows: [
                        {
                            id: 1,
                            job_id: 10,
                            student_id: 5,
                            job_title: 'Lập trình Frontend',
                            employer_name: 'TechCorp',
                            status: 'NOT_STARTED',
                            created_at: new Date()
                        }
                    ]
                };
            }
            return { rows: [] };
        };

        const list = await assignmentService.getMyAssignments(5);
        assert.equal(list.length, 1);
        assert.equal(list[0].job_title, 'Lập trình Frontend');
        assert.equal(list[0].status, 'NOT_STARTED');

        db.query = originalDbQuery;
    });

    // 2. Employer xem employer-assignments → trả list
    test('Employer xem employer-assignments -> trả list', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('FROM work_assignments wa')) {
                return {
                    rows: [
                        {
                            id: 1,
                            job_id: 10,
                            student_id: 5,
                            student_name: 'Nguyễn Văn Chí',
                            job_title: 'Lập trình Frontend',
                            status: 'NOT_STARTED',
                            created_at: new Date()
                        }
                    ]
                };
            }
            return { rows: [] };
        };

        const list = await assignmentService.getEmployerAssignments(2);
        assert.equal(list.length, 1);
        assert.equal(list[0].student_name, 'Nguyễn Văn Chí');

        db.query = originalDbQuery;
    });

    // 3. Employer chuyển NOT_STARTED → IN_PROGRESS → 200
    test('Employer chuyển NOT_STARTED -> IN_PROGRESS -> 200', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('SELECT wa.*, j.employer_id')) {
                return {
                    rows: [{
                        id: 1,
                        job_id: 10,
                        employer_id: 2,
                        student_id: 5,
                        status: 'NOT_STARTED',
                        job_title: 'Lập trình Frontend'
                    }]
                };
            }
            if (typeof sql === 'string' && sql.includes('UPDATE work_assignments')) {
                return {
                    rows: [{
                        id: 1,
                        status: 'IN_PROGRESS',
                        updated_at: new Date()
                    }]
                };
            }
            if (typeof sql === 'string' && sql.includes('INSERT INTO notifications')) {
                return { rows: [{ id: 1 }] };
            }
            return { rows: [] };
        };

        const updated = await assignmentService.updateStatus(1, 2, 'IN_PROGRESS');
        assert.equal(updated.status, 'IN_PROGRESS');

        db.query = originalDbQuery;
    });

    // 4. Employer chuyển IN_PROGRESS → COMPLETED → 200
    test('Employer chuyển IN_PROGRESS -> COMPLETED -> 200', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('SELECT wa.*, j.employer_id')) {
                return {
                    rows: [{
                        id: 1,
                        job_id: 10,
                        employer_id: 2,
                        student_id: 5,
                        status: 'IN_PROGRESS',
                        job_title: 'Lập trình Frontend'
                    }]
                };
            }
            if (typeof sql === 'string' && sql.includes('UPDATE work_assignments')) {
                return {
                    rows: [{
                        id: 1,
                        status: 'COMPLETED',
                        updated_at: new Date()
                    }]
                };
            }
            if (typeof sql === 'string' && sql.includes('INSERT INTO notifications')) {
                return { rows: [{ id: 1 }] };
            }
            return { rows: [] };
        };

        const updated = await assignmentService.updateStatus(1, 2, 'COMPLETED');
        assert.equal(updated.status, 'COMPLETED');

        db.query = originalDbQuery;
    });

    // 5. Employer chuyển thẳng NOT_STARTED → COMPLETED → 409
    test('Employer chuyển thẳng NOT_STARTED -> COMPLETED -> 409', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('SELECT wa.*, j.employer_id')) {
                return {
                    rows: [{
                        id: 1,
                        job_id: 10,
                        employer_id: 2,
                        student_id: 5,
                        status: 'NOT_STARTED',
                        job_title: 'Lập trình Frontend'
                    }]
                };
            }
            return { rows: [] };
        };

        await assert.rejects(
            async () => {
                await assignmentService.updateStatus(1, 2, 'COMPLETED');
            },
            {
                name: 'StateTransitionInvalidError',
                message: 'Không thể chuyển thẳng từ NOT_STARTED sang COMPLETED (phải qua IN_PROGRESS)'
            }
        );

        db.query = originalDbQuery;
    });

    // 6. Employer chuyển lùi COMPLETED → IN_PROGRESS → 409
    test('Employer chuyển lùi COMPLETED -> IN_PROGRESS -> 409', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('SELECT wa.*, j.employer_id')) {
                return {
                    rows: [{
                        id: 1,
                        job_id: 10,
                        employer_id: 2,
                        student_id: 5,
                        status: 'COMPLETED',
                        job_title: 'Lập trình Frontend'
                    }]
                };
            }
            return { rows: [] };
        };

        await assert.rejects(
            async () => {
                await assignmentService.updateStatus(1, 2, 'IN_PROGRESS');
            },
            {
                name: 'StateTransitionInvalidError',
                // Code đã gộp COMPLETED/TERMINATED/RESIGNED thành "hợp đồng đã kết thúc" (migration 015)
                message: 'Không thể thay đổi trạng thái hợp đồng đã kết thúc (COMPLETED)'
            }
        );

        db.query = originalDbQuery;
    });

    // 7. Không sở hữu job gọi PATCH → 403
    test('Không sở hữu job gọi PATCH -> 403', async () => {
        const originalDbQuery = db.query;

        db.query = async (sql, params) => {
            if (typeof sql === 'string' && sql.includes('SELECT wa.*, j.employer_id')) {
                return {
                    rows: [{
                        id: 1,
                        job_id: 10,
                        employer_id: 2, // Thuộc về employer 2
                        student_id: 5,
                        status: 'NOT_STARTED',
                        job_title: 'Lập trình Frontend'
                    }]
                };
            }
            return { rows: [] };
        };

        await assert.rejects(
            async () => {
                // Employer 99 cố cập nhật
                await assignmentService.updateStatus(1, 99, 'IN_PROGRESS');
            },
            {
                name: 'ForbiddenError',
            }
        );

        db.query = originalDbQuery;
    });
});
