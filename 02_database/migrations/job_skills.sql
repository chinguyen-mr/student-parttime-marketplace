-- Kỹ năng yêu cầu theo công việc
CREATE TABLE IF NOT EXISTS job_skills (
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  skill_name VARCHAR(100),
  PRIMARY KEY (job_id, skill_name)
);
