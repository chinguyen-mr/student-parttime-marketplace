-- 014: Đánh giá doanh nghiệp & đánh giá công việc của ứng viên (Candidate → Employer / Job)
-- Tách biệt hoàn toàn với bảng `reviews` cũ (đánh giá 2 chiều sau công việc — UC-09), không đổi dữ liệu cũ.
-- Trạng thái kiểm duyệt: PENDING (chờ duyệt) → PUBLISHED (công khai) | REJECTED (từ chối)
--                        PUBLISHED → HIDDEN (ẩn tạm) → PUBLISHED; mọi trạng thái → REMOVED (gỡ, xóa mềm)
-- Chỉ review PUBLISHED được hiển thị công khai và được tính vào điểm tổng hợp.

-- 1. Đánh giá doanh nghiệp (mỗi ứng viên 1 đánh giá / doanh nghiệp)
CREATE TABLE IF NOT EXISTS company_reviews (
  id SERIAL PRIMARY KEY,
  employer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_type VARCHAR(20) NOT NULL
    CHECK (experience_type IN ('WORKED', 'INTERNED', 'INTERVIEWED', 'APPLIED')),
  rating_environment SMALLINT NOT NULL CHECK (rating_environment BETWEEN 1 AND 5),
  rating_salary_benefits SMALLINT NOT NULL CHECK (rating_salary_benefits BETWEEN 1 AND 5),
  rating_management SMALLINT NOT NULL CHECK (rating_management BETWEEN 1 AND 5),
  rating_culture SMALLINT NOT NULL CHECK (rating_culture BETWEEN 1 AND 5),
  rating_learning SMALLINT NOT NULL CHECK (rating_learning BETWEEN 1 AND 5),
  rating_recruitment SMALLINT NOT NULL CHECK (rating_recruitment BETWEEN 1 AND 5),
  rating_overall SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  title VARCHAR(120) NOT NULL,
  pros TEXT NOT NULL,
  cons TEXT NOT NULL,
  advice TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  -- Xác thực trải nghiệm do hệ thống tính từ dữ liệu thật (không do người dùng tự khai)
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_source VARCHAR(20) CHECK (verification_source IN ('WORK_ASSIGNMENT', 'APPLICATION')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN', 'REMOVED')),
  moderation_flags TEXT[] NOT NULL DEFAULT '{}',
  moderation_reason TEXT,
  edit_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT company_reviews_unique_reviewer UNIQUE (employer_id, reviewer_id),
  CONSTRAINT company_reviews_no_self CHECK (employer_id <> reviewer_id),
  CONSTRAINT company_reviews_verified_source CHECK (is_verified = (verification_source IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_company_reviews_public ON company_reviews (employer_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_reviews_reviewer ON company_reviews (reviewer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_reviews_status ON company_reviews (status, created_at DESC);

-- 2. Đánh giá công việc (chỉ người đã thực sự làm công việc đó — có work_assignment)
CREATE TABLE IF NOT EXISTS job_reviews (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id INT REFERENCES work_assignments(id) ON DELETE SET NULL,
  experience_type VARCHAR(20) NOT NULL CHECK (experience_type IN ('WORKED', 'INTERNED')),
  rating_description_accuracy SMALLINT NOT NULL CHECK (rating_description_accuracy BETWEEN 1 AND 5),
  rating_salary_accuracy SMALLINT NOT NULL CHECK (rating_salary_accuracy BETWEEN 1 AND 5),
  rating_schedule SMALLINT NOT NULL CHECK (rating_schedule BETWEEN 1 AND 5),
  rating_workload SMALLINT NOT NULL CHECK (rating_workload BETWEEN 1 AND 5),
  rating_manager_support SMALLINT NOT NULL CHECK (rating_manager_support BETWEEN 1 AND 5),
  rating_overall SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_source VARCHAR(20) CHECK (verification_source IN ('WORK_ASSIGNMENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN', 'REMOVED')),
  moderation_flags TEXT[] NOT NULL DEFAULT '{}',
  moderation_reason TEXT,
  edit_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT job_reviews_unique_reviewer UNIQUE (job_id, reviewer_id),
  CONSTRAINT job_reviews_no_self CHECK (employer_id <> reviewer_id),
  CONSTRAINT job_reviews_verified_source CHECK (is_verified = (verification_source IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_job_reviews_public ON job_reviews (job_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_reviews_employer ON job_reviews (employer_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_reviews_reviewer ON job_reviews (reviewer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_reviews_status ON job_reviews (status, created_at DESC);

-- 3. Phản hồi của doanh nghiệp (tối đa 1 phản hồi / review)
CREATE TABLE IF NOT EXISTS review_replies (
  id SERIAL PRIMARY KEY,
  company_review_id INT REFERENCES company_reviews(id) ON DELETE CASCADE,
  job_review_id INT REFERENCES job_reviews(id) ON DELETE CASCADE,
  employer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE' CHECK (status IN ('VISIBLE', 'HIDDEN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_replies_one_target CHECK ((company_review_id IS NOT NULL)::int + (job_review_id IS NOT NULL)::int = 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_review_replies_company ON review_replies (company_review_id) WHERE company_review_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_review_replies_job ON review_replies (job_review_id) WHERE job_review_id IS NOT NULL;

-- 4. Báo cáo vi phạm (REPORT) và khiếu nại của tác giả (APPEAL)
CREATE TABLE IF NOT EXISTS review_reports (
  id SERIAL PRIMARY KEY,
  company_review_id INT REFERENCES company_reviews(id) ON DELETE CASCADE,
  job_review_id INT REFERENCES job_reviews(id) ON DELETE CASCADE,
  reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(10) NOT NULL DEFAULT 'REPORT' CHECK (kind IN ('REPORT', 'APPEAL')),
  reason VARCHAR(30) NOT NULL
    CHECK (reason IN ('SPAM', 'OFFENSIVE', 'FALSE_INFO', 'PERSONAL_INFO', 'CONFLICT_OF_INTEREST', 'OTHER', 'APPEAL')),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  resolution_note TEXT,
  resolved_by INT REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_reports_one_target CHECK ((company_review_id IS NOT NULL)::int + (job_review_id IS NOT NULL)::int = 1)
);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports (status, kind, created_at DESC);
-- Không cho gửi trùng khi báo cáo/khiếu nại trước đó của cùng người còn đang chờ xử lý
CREATE UNIQUE INDEX IF NOT EXISTS uq_review_reports_pending_company
  ON review_reports (company_review_id, reporter_id, kind) WHERE status = 'PENDING' AND company_review_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_review_reports_pending_job
  ON review_reports (job_review_id, reporter_id, kind) WHERE status = 'PENDING' AND job_review_id IS NOT NULL;

-- 5. Nhật ký kiểm duyệt (mọi thay đổi trạng thái, kèm lý do và người thực hiện)
CREATE TABLE IF NOT EXISTS review_moderation_logs (
  id SERIAL PRIMARY KEY,
  company_review_id INT REFERENCES company_reviews(id) ON DELETE CASCADE,
  job_review_id INT REFERENCES job_reviews(id) ON DELETE CASCADE,
  actor_id INT REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(20) NOT NULL,
  action VARCHAR(30) NOT NULL,
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  reason TEXT,
  report_id INT REFERENCES review_reports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_logs_one_target CHECK ((company_review_id IS NOT NULL)::int + (job_review_id IS NOT NULL)::int = 1)
);
CREATE INDEX IF NOT EXISTS idx_review_logs_company ON review_moderation_logs (company_review_id, created_at);
CREATE INDEX IF NOT EXISTS idx_review_logs_job ON review_moderation_logs (job_review_id, created_at);
