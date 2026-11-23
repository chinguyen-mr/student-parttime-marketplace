#!/usr/bin/env bash
# Dọn dữ liệu thử của 1 lần chạy new_features.cjs: $1 = mã lần chạy
R="$1"
docker exec -i jobnest-postgres psql -U postgres -d cd2_marketplace_db -v ON_ERROR_STOP=1 -q <<SQL
BEGIN;
CREATE TEMP TABLE qa_u AS SELECT id FROM users WHERE email LIKE 'qa-%-$R@example.test';
CREATE TEMP TABLE qa_j AS SELECT id FROM jobs WHERE title LIKE '[QA-NEW $R]%';
DELETE FROM notifications WHERE type='ADMIN_TASK' AND (target_id IN (SELECT id FROM qa_j) OR target_id IN (SELECT id FROM qa_u) OR body LIKE '%$R%');
DELETE FROM notifications WHERE type IN ('SUPPORT_REQUEST','SUPPORT_REPLY') AND body LIKE '%$R%';
DELETE FROM admin_logs WHERE target_id IN (SELECT id FROM qa_u) OR metadata::text LIKE '%$R%';
DELETE FROM jobs WHERE id IN (SELECT id FROM qa_j);
DELETE FROM deliverable_reviews WHERE reviewed_by IN (SELECT id FROM qa_u);
DELETE FROM work_deliverables WHERE submitted_by IN (SELECT id FROM qa_u);
DELETE FROM users WHERE id IN (SELECT id FROM qa_u);
DELETE FROM notifications n WHERE type='ADMIN_TASK' AND ((target_type='REPORT' AND NOT EXISTS(SELECT 1 FROM reports r WHERE r.id=n.target_id)) OR (target_type='USER_APPEAL' AND NOT EXISTS(SELECT 1 FROM user_appeals a WHERE a.id=n.target_id)) OR (target_type='REVIEW_REPORT' AND NOT EXISTS(SELECT 1 FROM review_reports x WHERE x.id=n.target_id)) OR (target_type IN ('COMPANY_REVIEW') AND NOT EXISTS(SELECT 1 FROM company_reviews c WHERE c.id=n.target_id)) OR (target_type='JOB_REVIEW' AND NOT EXISTS(SELECT 1 FROM job_reviews c WHERE c.id=n.target_id)) OR (target_type='JOB' AND NOT EXISTS(SELECT 1 FROM jobs j WHERE j.id=n.target_id)) OR (target_type='EMPLOYER_VERIFICATION' AND NOT EXISTS(SELECT 1 FROM users u WHERE u.id=n.target_id)));
SELECT 'còn lại', (SELECT count(*) FROM users WHERE email LIKE 'qa-%-$R@example.test'), (SELECT count(*) FROM jobs WHERE title LIKE '[QA-NEW $R]%');
COMMIT;
SQL
