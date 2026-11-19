import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';

// Danh sách ngành nghề đang hiển thị (do Admin quản lý ở trang Danh mục), sắp theo số tin đang tuyển.
// Tải 1 lần và dùng chung cho chân trang, trang chủ và bộ lọc Tìm việc → mọi nơi khớp với dữ liệu thật.
let cache = null;
let pending = null;

function loadCategories() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(`${API_BASE}/jobs/categories`)
      .then(res => res.json())
      .then(data => {
        cache = data.success && Array.isArray(data.data) ? data.data : [];
        return cache;
      })
      .catch(() => [])
      .finally(() => { pending = null; });
  }
  return pending;
}

/** [{ id, name, job_count }] — mảng rỗng khi đang tải hoặc lỗi mạng */
export default function useJobCategories() {
  const [categories, setCategories] = useState(cache || []);
  useEffect(() => {
    let alive = true;
    loadCategories().then(list => { if (alive) setCategories(list); });
    return () => { alive = false; };
  }, []);
  return categories;
}
