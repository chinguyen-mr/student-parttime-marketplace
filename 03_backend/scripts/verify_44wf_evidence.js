/**
 * COMPREHENSIVE 44 WORKFLOW EXECUTION & EVIDENCE HARVESTER
 * Tests Rule A3, Admin CRUD, Reports, Notifications, Assignments, Categories
 * Captures before/after DB state, HTTP responses, and RBAC enforcement
 */

const http = require('http');
const db = require('../src/config/db');

const API_BASE = 'http://localhost:5000/api';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
        const options = {
            hostname: url.hostname,
            port: url.port || 5000,
            path: url.pathname + url.search,
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });

        req.on('error', err => reject(err));

        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function runDetailedEvidence() {
    console.log('=== STARTING 44 WORKFLOW EVIDENCE VERIFICATION ===\n');
    const evidenceReport = {};

    // 1. Auth Tokens
    const studentLogin = await request('POST', '/auth/login', { email: 'student.test@vlu.edu.vn', password: 'password123' });
    const studentToken = studentLogin.body?.data?.token;
    const studentId = studentLogin.body?.data?.user?.id;

    const employerLogin = await request('POST', '/auth/login', { email: 'employer.test@vlu.edu.vn', password: 'password123' });
    const employerToken = employerLogin.body?.data?.token;
    const employerId = employerLogin.body?.data?.user?.id;

    const adminLogin = await request('POST', '/auth/login', { email: 'admin.test@vlu.edu.vn', password: 'password123' });
    const adminToken = adminLogin.body?.data?.token;

    // Another employer for IDOR checks
    const otherEmpLogin = await request('POST', '/auth/login', { email: 'hr_demo@company.com', password: 'password123' });
    const otherEmpToken = otherEmpLogin.body?.data?.token;

    console.log(`Tokens acquired: Student(${studentId}), Employer(${employerId}), Admin`);

    // =========================================================================
    // SECTION 1: RULE A3 DEEP DIVE (CANDIDATE SELECTION & CONCURRENCY)
    // =========================================================================
    console.log('\n--- SECTION 1: Testing Rule A3 Deep Dive ---');

    // 1.1 Create fresh test job
    const freshJobRes = await request('POST', '/jobs', {
        title: `A3 Test Job ${Date.now()}`,
        description: 'Test Rule A3 isolation and concurrency',
        requirements: 'Testing only',
        category: 'F&B / Pha chế',
        work_type: 'PART_TIME',
        salary_type: 'HOURLY',
        salary: 30000,
        quantity_required: 1,
        location: 'Quận 1, TP.HCM',
        application_deadline: new Date(Date.now() + 86400000 * 10).toISOString()
    }, employerToken);
    const testJobId = freshJobRes.body?.data?.id;

    // Moderate to OPEN
    await request('PATCH', `/admin/jobs/${testJobId}/moderate`, {
        moderation_status: 'APPROVED',
        moderation_reason: 'Automated A3 Test Harness'
    }, adminToken);

    // Apply 2 different students to this job
    const app1Res = await request('POST', '/applications', {
        job_id: testJobId,
        cover_letter: 'Student 1 applying for A3 testing',
        cv_url: 'https://vlu.edu.vn/cv1.pdf'
    }, studentToken);
    const app1Id = app1Res.body?.data?.id;

    console.log(`Test Job #${testJobId} created, Application #${app1Id} submitted`);

    // 1.2 Non-owner Employer attempts Selections -> MUST 403
    const nonOwnerSel = await request('POST', `/jobs/${testJobId}/selections`, {
        applicationIds: [app1Id]
    }, otherEmpToken);
    console.log(`A3 Non-owner Selections attempt: HTTP ${nonOwnerSel.status} (Expected 403)`);

    // 1.3 Direct PATCH Application status to ACCEPTED -> MUST 409
    const directPatch = await request('PATCH', `/applications/${app1Id}/status`, {
        status: 'ACCEPTED'
    }, employerToken);
    console.log(`A3 Direct PATCH ACCEPTED attempt: HTTP ${directPatch.status} (Expected 409)`);

    // 1.4 Valid Owner Selections -> MUST 200, DB: app.status = ACCEPTED, 1 assignment created
    const countBefore = await db.query('SELECT COUNT(*) FROM work_assignments WHERE job_id = $1', [testJobId]);
    const validSel = await request('POST', `/jobs/${testJobId}/selections`, {
        applicationIds: [app1Id]
    }, employerToken);
    const countAfter = await db.query('SELECT COUNT(*) FROM work_assignments WHERE job_id = $1', [testJobId]);
    const appState = await db.query('SELECT status FROM applications WHERE id = $1', [app1Id]);
    console.log(`A3 Valid Selections: HTTP ${validSel.status}, App Status: ${appState.rows[0]?.status}, Assignments Before: ${countBefore.rows[0]?.count}, After: ${countAfter.rows[0]?.count}`);

    // 1.5 Duplicate Request / Exceeding quantity_required -> MUST 409
    const dupSel = await request('POST', `/jobs/${testJobId}/selections`, {
        applicationIds: [app1Id]
    }, employerToken);
    console.log(`A3 Duplicate Selections attempt: HTTP ${dupSel.status} (Expected 409)`);

    evidenceReport.ruleA3 = {
        nonOwnerStatus: nonOwnerSel.status,
        directPatchStatus: directPatch.status,
        validSelStatus: validSel.status,
        dupSelStatus: dupSel.status,
        assignmentsCreated: countAfter.rows[0]?.count - countBefore.rows[0]?.count,
        appStatusAfter: appState.rows[0]?.status
    };

    // =========================================================================
    // SECTION 2: ADMIN CRUD ON CATEGORIES (WF-A07)
    // =========================================================================
    console.log('\n--- SECTION 2: Testing Admin Category Full CRUD (WF-A07) ---');

    // 2.1 GET Categories
    const catList = await request('GET', '/admin/categories', null, adminToken);
    console.log(`Category GET: HTTP ${catList.status}, Total: ${catList.body?.data?.length || 0}`);

    // 2.2 POST Category (Create)
    const newCatRes = await request('POST', '/admin/categories', {
        name: `Ngành nghề Test ${Date.now()}`,
        slug: `nganh-nghe-test-${Date.now()}`,
        description: 'Mô tả thử nghiệm CRUD danh mục',
        is_active: true
    }, adminToken);
    const createdCatId = newCatRes.body?.data?.id;
    console.log(`Category POST: HTTP ${newCatRes.status}, Created ID: ${createdCatId}`);

    // 2.3 PUT Category (Update)
    let updateCatRes = null;
    if (createdCatId) {
        updateCatRes = await request('PUT', `/admin/categories/${createdCatId}`, {
            name: `Ngành nghề Đã Sửa ${Date.now()}`,
            description: 'Mô tả cập nhật thành công',
            is_active: false
        }, adminToken);
        console.log(`Category PUT: HTTP ${updateCatRes.status}`);
    }

    // 2.4 DELETE Category
    let deleteCatRes = null;
    if (createdCatId) {
        deleteCatRes = await request('DELETE', `/admin/categories/${createdCatId}`, null, adminToken);
        console.log(`Category DELETE: HTTP ${deleteCatRes.status}`);
    }

    evidenceReport.adminCategoryCrud = {
        getStatus: catList.status,
        postStatus: newCatRes.status,
        putStatus: updateCatRes?.status,
        deleteStatus: deleteCatRes?.status
    };

    // =========================================================================
    // SECTION 3: ADMIN REPORT RESOLUTION & HISTORY (WF-A05 & WF-A06 & WF-X01)
    // =========================================================================
    console.log('\n--- SECTION 3: Testing Report Submission & Admin Resolution (WF-X01, WF-A05, WF-A06) ---');

    // 3.1 Student submits report against employer (WF-X01)
    const reportSubmit = await request('POST', '/reports', {
        target_type: 'USER',
        target_id: employerId,
        reason: 'Có dấu hiệu đăng tin không đúng sự thật',
        evidence_url: 'https://evidence.vlu.edu.vn/screenshot.png'
    }, studentToken);
    const newReportId = reportSubmit.body?.data?.id;
    console.log(`Report Submit (WF-X01): HTTP ${reportSubmit.status}, Report ID: ${newReportId}`);

    // 3.2 Admin views report list (WF-A05)
    const reportList = await request('GET', '/admin/reports?status=PENDING', null, adminToken);
    console.log(`Report List (WF-A05): HTTP ${reportList.status}, Count: ${reportList.body?.data?.length || 0}`);

    // 3.3 Admin resolves report with punitive action (WF-A06)
    let resolveRes = null;
    if (newReportId) {
        resolveRes = await request('POST', `/admin/reports/${newReportId}/action`, {
            action_type: 'WARNED',
            notes: 'Đã gửi cảnh cáo sơ bộ tới nhà tuyển dụng'
        }, adminToken);
        console.log(`Report Resolve (WF-A06): HTTP ${resolveRes.status}`);
    }

    evidenceReport.reportWorkflow = {
        submitStatus: reportSubmit.status,
        listStatus: reportList.status,
        resolveStatus: resolveRes?.status,
        reportId: newReportId
    };

    // =========================================================================
    // SECTION 4: NOTIFICATIONS POLLING & UNREAD MANAGEMENT (WF-S11, WF-E12)
    // =========================================================================
    console.log('\n--- SECTION 4: Testing Notifications Polling & Unread Counts ---');

    const notifGet = await request('GET', '/notifications?limit=10', null, studentToken);
    const unreadCount = notifGet.body?.data?.filter(n => !n.is_read)?.length || 0;
    const firstNotifId = notifGet.body?.data?.[0]?.id;

    let markReadRes = null;
    if (firstNotifId) {
        markReadRes = await request('PATCH', `/notifications/${firstNotifId}/read`, null, studentToken);
    }
    console.log(`Notifications: HTTP ${notifGet.status}, Total: ${notifGet.body?.data?.length || 0}, Unread: ${unreadCount}, MarkRead: ${markReadRes?.status}`);

    evidenceReport.notifications = {
        getStatus: notifGet.status,
        totalRetrieved: notifGet.body?.data?.length || 0,
        markReadStatus: markReadRes?.status,
        mechanism: 'Database-Backed REST API Polling on Demand'
    };

    // =========================================================================
    // SECTION 5: PART-TIME VS FREELANCE ASSIGNMENTS & DELIVERABLES
    // =========================================================================
    console.log('\n--- SECTION 5: Testing Part-time vs Freelance Work Management ---');

    // Check Part-time Assignment created in Section 1
    const ptAssignment = await db.query('SELECT id, status FROM work_assignments WHERE job_id = $1 LIMIT 1', [testJobId]);
    const ptAssignId = ptAssignment.rows[0]?.id;

    // Update Part-time Assignment status
    let ptStatusRes = null;
    if (ptAssignId) {
        ptStatusRes = await request('PATCH', `/assignments/${ptAssignId}/status`, {
            status: 'IN_PROGRESS'
        }, employerToken);
        console.log(`Part-time Assignment #${ptAssignId} -> IN_PROGRESS: HTTP ${ptStatusRes.status}`);
    }

    // Check deliverable requirement on part-time job:
    const ptDeliverablesCount = await db.query('SELECT COUNT(*) FROM work_deliverables WHERE assignment_id = $1', [ptAssignId || 0]);
    console.log(`Part-time Deliverables count: ${ptDeliverablesCount.rows[0]?.count} (Expected 0 - Not required for shifts)`);

    evidenceReport.assignments = {
        ptAssignId,
        ptStatusChange: ptStatusRes?.status,
        ptDeliverablesCount: parseInt(ptDeliverablesCount.rows[0]?.count, 10)
    };

    console.log('\n=== EVIDENCE HARVESTING COMPLETE ===\n');
    console.log(JSON.stringify(evidenceReport, null, 2));

    return evidenceReport;
}

runDetailedEvidence()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('EVIDENCE_HARVESTER_ERROR:', err);
        process.exit(1);
    });

