-- Đánh giá nghiệm thu sản phẩm bàn giao
CREATE TABLE IF NOT EXISTS deliverable_reviews (
  id SERIAL PRIMARY KEY,
  deliverable_id INT NOT NULL REFERENCES work_deliverables(id) ON DELETE CASCADE,
  reviewed_by INT NOT NULL REFERENCES users(id),
  decision VARCHAR(30) CHECK (decision IN ('ACCEPTED', 'REVISION_REQUESTED')),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_deliverable_reviews_deliverable ON deliverable_reviews(deliverable_id);
