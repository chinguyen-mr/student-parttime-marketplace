-- Chi tiết công việc Part-time
CREATE TABLE IF NOT EXISTS part_time_details (
  job_id INT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  shift_description VARCHAR(255),
  weekly_schedule TEXT,
  hours_per_week INT
);
