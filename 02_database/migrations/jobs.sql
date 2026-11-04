-- Tin tuyển dụng (Part-time, Seasonal, Freelance)
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  employer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  salary_type VARCHAR(20) DEFAULT 'HOURLY',
  salary DECIMAL(12, 2) NOT NULL,
  work_type VARCHAR(50) DEFAULT 'PART_TIME',
  status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'CLOSED', 'EXPIRED', 'REJECTED', 'OPEN', 'FILLED', 'COMPLETED')),
  moderation_status VARCHAR(50) DEFAULT 'APPROVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
