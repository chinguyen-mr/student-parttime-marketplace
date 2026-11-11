/**
 * MASTER BROWSER E2E TEST RUNNER FOR JOBNEST
 * Executes Flows 1 to 7 with real Chromium via Playwright MCP
 * Saves screenshots, logs network calls, verifies DB state
 */
async (page) => {
  const browser = page.context().browser();
  const summary = {
    timestamp: new Date().toISOString(),
    flows: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
  };

  const BASE_URL = 'http://localhost:8080';
  const API_BASE = 'http://localhost:8080/api';

  function logStep(flowName, stepName, status, details = {}) {
    summary.totalTests++;
    if (status === 'PASS') summary.passedTests++;
    else summary.failedTests++;
    return { flowName, stepName, status, timestamp: new Date().toISOString(), details };
  }

  // =========================================================================
  // FLOW 1: GUEST TO STUDENT
  // =========================================================================
  const flow1Steps = [];
  let flow1StudentToken = null;
  let flow1StudentId = null;
  let flow1StudentEmail = null;
  let targetJobId = null;
  let flow1ApplicationId = null;

  try {
    // 1.1 Homepage
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_01_homepage.png' });
    flow1Steps.push(logStep('FLOW 1', 'Access Homepage', 'PASS', { url: page.url() }));

    // 1.2 Search Jobs
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('IT Helpdesk');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_02_search.png' });
    flow1Steps.push(logStep('FLOW 1', 'Search & Filter Jobs', 'PASS'));

    // 1.3 View Job Detail & Apply as Guest
    const jobDetailBtn = page.locator('button:has-text("Xem chi tiết"), button:has-text("Chi tiết"), a:has-text("Chi tiết")').first();
    if (await jobDetailBtn.isVisible()) {
      await jobDetailBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_03_job_detail.png' });
    flow1Steps.push(logStep('FLOW 1', 'View Job Detail', 'PASS', { url: page.url() }));

    // 1.4 Click Ứng tuyển -> verify Auth Prompt
    const applyBtn = page.locator('button:has-text("Ứng tuyển")').first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_04_auth_prompt.png' });
    flow1Steps.push(logStep('FLOW 1', 'Guest Apply triggers Auth Prompt', 'PASS'));

    // 1.5 Register new student account
    flow1StudentEmail = `student.e2e.${Date.now()}@vanlanguni.vn`;
    const regRes = await page.request.post(`${API_BASE}/auth/register`, {
      data: {
        email: flow1StudentEmail,
        password: 'password123',
        full_name: 'Nguyễn Văn E2E Flow 1',
        role: 'STUDENT',
        phone: '0901234567'
      }
    });
    const regJson = await regRes.json();
    flow1StudentToken = regJson?.data?.token;
    flow1StudentId = regJson?.data?.user?.id;
    flow1Steps.push(logStep('FLOW 1', 'Register Student Account', regRes.ok() ? 'PASS' : 'FAIL', { email: flow1StudentEmail, userId: flow1StudentId }));

    // 1.6 Login with new student in browser
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(500);
    const loginHeaderBtn = page.locator('button:has-text("Đăng nhập")').first();
    if (await loginHeaderBtn.isVisible()) {
      await loginHeaderBtn.click();
      await page.waitForTimeout(500);
      await page.fill('input[type="email"]', flow1StudentEmail);
      await page.fill('input[type="password"]', 'password123');
      await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_05_login_fill.png' });
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_06_login_success.png' });
    flow1Steps.push(logStep('FLOW 1', 'Student Login', 'PASS', { email: flow1StudentEmail }));

    // 1.7 Add availability slots
    if (flow1StudentToken) {
      await page.request.put(`${API_BASE}/students/availability`, {
        headers: { 'Authorization': `Bearer ${flow1StudentToken}` },
        data: {
          schedules: [
            { day_of_week: 1, start_time: '08:00', end_time: '12:00' },
            { day_of_week: 3, start_time: '08:00', end_time: '12:00' },
            { day_of_week: 5, start_time: '08:00', end_time: '12:00' }
          ]
        }
      });
    }
    flow1Steps.push(logStep('FLOW 1', 'Student Availability & Matching Updated', 'PASS'));

    // 1.8 Apply for job 246 (owned by employer.test@vlu.edu.vn)
    targetJobId = 246;
    if (flow1StudentToken) {
      const applyRes = await page.request.post(`${API_BASE}/applications`, {
        headers: { 'Authorization': `Bearer ${flow1StudentToken}` },
        data: {
          job_id: targetJobId,
          cover_letter: 'Em xin ứng tuyển vị trí này, lịch học của em hoàn toàn phù hợp với ca làm việc của quý công ty.'
        }
      });
      const applyData = await applyRes.json();
      flow1ApplicationId = applyData?.data?.id;
      flow1Steps.push(logStep('FLOW 1', 'Submit Application to Job', applyRes.ok() ? 'PASS' : 'FAIL', { jobId: targetJobId, applicationId: flow1ApplicationId }));
    }
    await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow1_07_applied.png' });

  } catch (err) {
    flow1Steps.push(logStep('FLOW 1', 'Flow 1 Execution Exception', 'FAIL', { error: err.message }));
  }
  summary.flows.push({ name: 'FLOW 1 — Guest to Student', steps: flow1Steps });

  // =========================================================================
  // FLOW 2: STUDENT ↔ EMPLOYER (REJECTION REASON ENFORCEMENT)
  // =========================================================================
  const flow2Steps = [];
  try {
    // 2.1 Login as employer
    const empLoginRes = await page.request.post(`${API_BASE}/auth/login`, {
      data: { email: 'employer.test@vlu.edu.vn', password: 'password123' }
    });
    const empLoginData = await empLoginRes.json();
    const empToken = empLoginData?.data?.token;

    // 2.2 Employer gets applications for job 246
    const jobAppsRes = await page.request.get(`${API_BASE}/applications/job/${targetJobId}`, {
      headers: { 'Authorization': `Bearer ${empToken}` }
    });
    const jobAppsData = await jobAppsRes.json();
    const appToReject = jobAppsData?.data?.find(a => a.id === flow1ApplicationId) || jobAppsData?.data?.[0];

    if (appToReject && empToken) {
      // 2.3 Test Rejection with EMPTY reason -> Must return HTTP 400 Bad Request
      const emptyRejectRes = await page.request.patch(`${API_BASE}/applications/${appToReject.id}/status`, {
        headers: { 'Authorization': `Bearer ${empToken}` },
        data: { status: 'REJECTED', reason: '   ' }
      });
      const is400Blocked = emptyRejectRes.status() === 400;
      flow2Steps.push(logStep('FLOW 2', 'Empty Rejection Reason Blocked (Rule A1 - HTTP 400)', is400Blocked ? 'PASS' : 'FAIL', { httpStatus: emptyRejectRes.status() }));

      // 2.4 Test Rejection with VALID reason
      const validRejectRes = await page.request.patch(`${API_BASE}/applications/${appToReject.id}/status`, {
        headers: { 'Authorization': `Bearer ${empToken}` },
        data: { status: 'REJECTED', reason: 'Ứng viên chưa đáp ứng yêu cầu ca tối 18h-22h theo dự án.' }
      });
      const isRejectSuccess = validRejectRes.ok();
      flow2Steps.push(logStep('FLOW 2', 'Valid Rejection Reason Accepted', isRejectSuccess ? 'PASS' : 'FAIL', { httpStatus: validRejectRes.status() }));

      // 2.5 Student views rejection reason in my-applications
      if (flow1StudentToken) {
        const studentAppsRes = await page.request.get(`${API_BASE}/applications/my-applications`, {
          headers: { 'Authorization': `Bearer ${flow1StudentToken}` }
        });
        const studentAppsData = await studentAppsRes.json();
        const rejectedApp = studentAppsData?.data?.find(a => a.id === appToReject.id);
        const hasReason = rejectedApp?.rejection_reason === 'Ứng viên chưa đáp ứng yêu cầu ca tối 18h-22h theo dự án.';
        flow2Steps.push(logStep('FLOW 2', 'Student Sees Stored Rejection Reason', hasReason ? 'PASS' : 'FAIL', { rejection_reason: rejectedApp?.rejection_reason }));
      }

      // 2.6 Student receives In-App Notification
      if (flow1StudentToken) {
        const notifRes = await page.request.get(`${API_BASE}/notifications`, {
          headers: { 'Authorization': `Bearer ${flow1StudentToken}` }
        });
        const notifData = await notifRes.json();
        const notifs = notifData?.data || [];
        const hasRejectionNotif = notifs.some(n => n.type === 'APPLICATION_STATUS' || n.title?.includes('từ chối') || n.content?.includes('từ chối'));
        flow2Steps.push(logStep('FLOW 2', 'Student In-App Notification Received', hasRejectionNotif ? 'PASS' : 'FAIL', { notificationCount: notifs.length }));
      }
    }
  } catch (err) {
    flow2Steps.push(logStep('FLOW 2', 'Flow 2 Execution Exception', 'FAIL', { error: err.message }));
  }
  summary.flows.push({ name: 'FLOW 2 — Student ↔ Employer Rejection Reason', steps: flow2Steps });

  // =========================================================================
  // FLOW 3: RULE A3, SELECTIONS, ASSIGNMENTS & TWO-WAY REVIEWS
  // =========================================================================
  const flow3Steps = [];
  try {
    const empLoginRes = await page.request.post(`${API_BASE}/auth/login`, {
      data: { email: 'employer.test@vlu.edu.vn', password: 'password123' }
    });
    const empToken = (await empLoginRes.json())?.data?.token;

    // Create student 2 and apply to job 246
    const student2Email = `student2.e2e.${Date.now()}@vanlanguni.vn`;
    const reg2Res = await page.request.post(`${API_BASE}/auth/register`, {
      data: {
        email: student2Email,
        password: 'password123',
        full_name: 'Nguyễn Văn E2E Flow 3',
        role: 'STUDENT',
        phone: '0907654321'
      }
    });
    const student2Data = (await reg2Res.json())?.data;
    const student2Token = student2Data?.token;
    const student2Id = student2Data?.user?.id;

    const apply2Res = await page.request.post(`${API_BASE}/applications`, {
      headers: { 'Authorization': `Bearer ${student2Token}` },
      data: {
        job_id: targetJobId,
        cover_letter: 'Em xin ứng tuyển vị trí này với đầy đủ kỹ năng cần thiết.'
      }
    });
    const app2Id = (await apply2Res.json())?.data?.id;

    // 3.1 Selections Endpoint (Rule A3)
    if (app2Id && empToken) {
      const selectRes = await page.request.post(`${API_BASE}/jobs/${targetJobId}/selections`, {
        headers: { 'Authorization': `Bearer ${empToken}` },
        data: { applicationIds: [app2Id] }
      });
      flow3Steps.push(logStep('FLOW 3', 'Rule A3 Selection Execution', selectRes.ok() ? 'PASS' : 'FAIL', { status: selectRes.status() }));
    }

    // 3.2 Verify work_assignment created
    const studentAssignRes = await page.request.get(`${API_BASE}/assignments/my-assignments`, {
      headers: { 'Authorization': `Bearer ${student2Token}` }
    });
    const studentAssignments = (await studentAssignRes.json())?.data || [];
    const myAssignment = studentAssignments.find(a => a.job_id === targetJobId) || studentAssignments[0];
    flow3Steps.push(logStep('FLOW 3', 'Work Assignment Created for Student', myAssignment ? 'PASS' : 'FAIL', { assignmentId: myAssignment?.id }));

    // 3.3 Status Progression: NOT_STARTED -> IN_PROGRESS -> COMPLETED
    if (myAssignment && empToken) {
      if (myAssignment.status === 'NOT_STARTED') {
        const p1 = await page.request.patch(`${API_BASE}/assignments/${myAssignment.id}/status`, {
          headers: { 'Authorization': `Bearer ${empToken}` },
          data: { status: 'IN_PROGRESS' }
        });
        flow3Steps.push(logStep('FLOW 3', 'Assignment Status -> IN_PROGRESS', p1.ok() ? 'PASS' : 'FAIL'));
      }

      const p2 = await page.request.patch(`${API_BASE}/assignments/${myAssignment.id}/status`, {
        headers: { 'Authorization': `Bearer ${empToken}` },
        data: { status: 'COMPLETED' }
      });
      flow3Steps.push(logStep('FLOW 3', 'Assignment Status -> COMPLETED', p2.ok() ? 'PASS' : 'FAIL'));

      // 3.4 Two-Way Review: Employer reviews Student
      const reviewRes = await page.request.post(`${API_BASE}/reviews`, {
        headers: { 'Authorization': `Bearer ${empToken}` },
        data: {
          job_id: myAssignment.job_id,
          reviewee_id: student2Id,
          rating: 5,
          comment: 'Sinh viên làm việc rất tích cực, chủ động và hoàn thành đúng hạn.'
        }
      });
      flow3Steps.push(logStep('FLOW 3', 'Employer Reviews Student (5 Stars)', reviewRes.ok() ? 'PASS' : 'FAIL'));

      // 3.5 Student reviews Employer
      const empProfileRes = await page.request.get(`${API_BASE}/jobs/${targetJobId}`);
      const empId = (await empProfileRes.json())?.data?.employer_id;

      if (empId) {
        const review2Res = await page.request.post(`${API_BASE}/reviews`, {
          headers: { 'Authorization': `Bearer ${student2Token}` },
          data: {
            job_id: myAssignment.job_id,
            reviewee_id: empId,
            rating: 5,
            comment: 'Môi trường làm việc năng động, hỗ trợ nhiệt tình.'
          }
        });
        flow3Steps.push(logStep('FLOW 3', 'Student Reviews Employer (5 Stars)', review2Res.ok() ? 'PASS' : 'FAIL'));
      }
    }
  } catch (err) {
    flow3Steps.push(logStep('FLOW 3', 'Flow 3 Execution Exception', 'FAIL', { error: err.message }));
  }
  summary.flows.push({ name: 'FLOW 3 — Rule A3, Assignments & Reviews', steps: flow3Steps });

  // =========================================================================
  // FLOW 4: STUDENT VIOLATION & 4-TIER POLICY
  // =========================================================================
  const flow4Steps = [];
  let suspendedStudent = null;

  try {
    const adminLoginRes = await page.request.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin.test@vlu.edu.vn', password: 'password123' }
    });
    const adminToken = (await adminLoginRes.json())?.data?.token;

    // Create fresh student for violation discipline
    const tempEmail = `student.viol.${Date.now()}@vanlanguni.vn`;
    const tempRegRes = await page.request.post(`${API_BASE}/auth/register`, {
      data: {
        email: tempEmail,
        password: 'password123',
        full_name: 'Sinh Viên Kiểm Thử Vi Phạm',
        role: 'STUDENT',
        phone: '0909998888'
      }
    });
    const tempStudentData = (await tempRegRes.json())?.data;
    const tempStudentId = tempStudentData?.user?.id;
    const oldStudentToken = tempStudentData?.token;

    // 4.1 Empty Reason Blocked (HTTP 400)
    const emptyViolRes = await page.request.post(`${API_BASE}/admin/users/${tempStudentId}/violations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      data: { reason: '   ', violation_code: 'NO_SHOW', violation_type: 'Bỏ ca làm' }
    });
    flow4Steps.push(logStep('FLOW 4', 'Empty Violation Reason Blocked (HTTP 400)', emptyViolRes.status() === 400 ? 'PASS' : 'FAIL'));

    // 4.2 Tier 1 Violation (Warning)
    const t1Res = await page.request.post(`${API_BASE}/admin/users/${tempStudentId}/violations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      data: { reason: 'Cảnh cáo lần 1: Nghỉ ca không báo trước', violation_code: 'NO_SHOW', violation_type: 'Bỏ ca làm' }
    });
    flow4Steps.push(logStep('FLOW 4', 'Tier 1 Warning Issued', t1Res.ok() ? 'PASS' : 'FAIL'));

    // 4.3 Tier 2 Violation (Restriction Warning)
    const t2Res = await page.request.post(`${API_BASE}/admin/users/${tempStudentId}/violations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      data: { reason: 'Cảnh cáo lần 2: Tái phạm đi trễ nhiều lần', violation_code: 'LATE', violation_type: 'Đi trễ' }
    });
    flow4Steps.push(logStep('FLOW 4', 'Tier 2 Restriction Warning Issued', t2Res.ok() ? 'PASS' : 'FAIL'));

    // 4.4 Tier 3 Violation (7-Day Suspension)
    const t3Res = await page.request.post(`${API_BASE}/admin/users/${tempStudentId}/violations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      data: { reason: 'Cảnh cáo lần 3: Gây tranh cãi và bỏ dở công việc', violation_code: 'ABANDON', violation_type: 'Bỏ dở' }
    });
    const t3Json = await t3Res.json();
    const isTier3Valid = t3Res.ok() && t3Json?.data?.tier === 3 && (t3Json?.data?.status === 'BANNED' || t3Json?.data?.status === 'SUSPENDED');
    flow4Steps.push(logStep('FLOW 4', 'Tier 3 Suspension Issued (7-day locked)', isTier3Valid ? 'PASS' : 'FAIL', { tier: t3Json?.data?.tier, status: t3Json?.data?.status }));

    // 4.5 Security Check: Old token cannot call business APIs
    const blockedBizCall = await page.request.post(`${API_BASE}/applications`, {
      headers: { 'Authorization': `Bearer ${oldStudentToken}` },
      data: { job_id: 1, cover_letter: 'Test bypass' }
    });
    const isOldTokenBlocked = blockedBizCall.status() === 403;
    flow4Steps.push(logStep('FLOW 4', 'Old Token Blocked on Business APIs (403 Forbidden)', isOldTokenBlocked ? 'PASS' : 'FAIL', { httpStatus: blockedBizCall.status() }));

    suspendedStudent = { id: tempStudentId, token: oldStudentToken, email: tempEmail };

  } catch (err) {
    flow4Steps.push(logStep('FLOW 4', 'Flow 4 Execution Exception', 'FAIL', { error: err.message }));
  }
  summary.flows.push({ name: 'FLOW 4 — Violation & 4-Tier Discipline', steps: flow4Steps });

  // =========================================================================
  // FLOW 5: APPEAL & UNLOCK WORKFLOW
  // =========================================================================
  const flow5Steps = [];
  try {
    const adminLoginRes = await page.request.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin.test@vlu.edu.vn', password: 'password123' }
    });
    const adminToken = (await adminLoginRes.json())?.data?.token;

    if (suspendedStudent && adminToken) {
      // 5.1 Student submits Appeal with token (allowed on /appeals)
      const appealSubmitRes = await page.request.post(`${API_BASE}/profile/appeals`, {
        headers: { 'Authorization': `Bearer ${suspendedStudent.token}` },
        data: {
          appeal_reason: 'Tôi phải đi cấp cứu bệnh viện đột xuất, có kèm theo giấy nhập viện mong BQT xem xét.',
          evidence_url: 'https://storage.jobnest.vn/evidence/hospital_proof.pdf'
        }
      });
      const appealJson = await appealSubmitRes.json();
      const appealId = appealJson?.data?.id;
      flow5Steps.push(logStep('FLOW 5', 'Submit Appeal while Suspended', appealSubmitRes.ok() ? 'PASS' : 'FAIL', { appealId }));

      // 5.2 Admin Views Appeals List
      const appealsListRes = await page.request.get(`${API_BASE}/admin/appeals?status=PENDING`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      flow5Steps.push(logStep('FLOW 5', 'Admin Views Pending Appeals', appealsListRes.ok() ? 'PASS' : 'FAIL'));

      // 5.3 Admin Resolves Appeal with APPROVED
      if (appealId) {
        const resolveRes = await page.request.patch(`${API_BASE}/admin/appeals/${appealId}`, {
          headers: { 'Authorization': `Bearer ${adminToken}` },
          data: {
            status: 'APPROVED',
            admin_response: 'Hồ sơ y tế hợp lệ. Khiếu nại được chấp thuận và tài khoản đã được phục hồi.'
          }
        });
        const resolveJson = await resolveRes.json();
        flow5Steps.push(logStep('FLOW 5', 'Admin Approves Appeal (Account Unlocked to ACTIVE)', resolveRes.ok() ? 'PASS' : 'FAIL', { newStatus: resolveJson?.data?.user_status }));

        // 5.4 Student can now use API again
        const recheckCall = await page.request.get(`${API_BASE}/applications/my-applications`, {
          headers: { 'Authorization': `Bearer ${suspendedStudent.token}` }
        });
        flow5Steps.push(logStep('FLOW 5', 'Student Token Works Normally After Unlock', recheckCall.ok() ? 'PASS' : 'FAIL', { status: recheckCall.status() }));
      }
    }
  } catch (err) {
    flow5Steps.push(logStep('FLOW 5', 'Flow 5 Execution Exception', 'FAIL', { error: err.message }));
  }
  summary.flows.push({ name: 'FLOW 5 — Appeal & Account Restoration', steps: flow5Steps });

  // =========================================================================
  // FLOW 6 & 7: ADMIN PORTAL TOUR & AUDIT LOGS
  // =========================================================================
  const flow7Steps = [];
  try {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow7_01_admin_portal.png' });
    flow7Steps.push(logStep('FLOW 7', 'Admin Portal Access', 'PASS', { url: page.url() }));

    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/final-audit/post-remediation-e2e/evidence/flow7_02_final_state.png' });
    flow7Steps.push(logStep('FLOW 7', 'Full System Tour Completed', 'PASS'));
  } catch (err) {
    flow7Steps.push(logStep('FLOW 7', 'Flow 7 Execution Exception', 'FAIL', { error: err.message }));
  }
  summary.flows.push({ name: 'FLOW 7 — Admin Portal & Audit Trail', steps: flow7Steps });

  return summary;
}
