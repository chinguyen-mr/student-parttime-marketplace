import { API_BASE } from '../../config/api';

// Gọi API đánh giá: trả nguyên body JSON khi thành công, ném Error (kèm danh sách lỗi chi tiết) khi thất bại
export async function reviewRequest(path, { method = 'GET', token, body } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Không kết nối được máy chủ. Vui lòng thử lại.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại');
    err.details = Array.isArray(data.details) ? data.details : [];
    err.status = res.status;
    throw err;
  }
  return data;
}
