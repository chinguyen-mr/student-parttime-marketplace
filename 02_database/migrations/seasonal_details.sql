-- Chi tiết công việc thời vụ (Seasonal)
CREATE TABLE IF NOT EXISTS seasonal_details (
  job_id INT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  schedule_description TEXT
);
