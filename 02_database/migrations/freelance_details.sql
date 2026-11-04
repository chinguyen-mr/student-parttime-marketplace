-- Chi tiết công việc Freelance
CREATE TABLE IF NOT EXISTS freelance_details (
  job_id INT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  deliverable_requirements TEXT NOT NULL,
  deadline DATE NOT NULL,
  revision_limit INT
);
