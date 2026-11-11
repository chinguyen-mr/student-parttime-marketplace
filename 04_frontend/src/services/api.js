/**
 * Centralized API configuration and network helper utilities for JobNest Client
 */

export const API_BASE = (() => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api/v1`;
  }
  return 'http://localhost:5000/api/v1';
})();
export const SERVER_BASE = API_BASE.replace(/\/api(\/v1)?\/?$/, '');
export const HEALTH_ENDPOINT = `${SERVER_BASE}/health`;

/**
 * Checks if the backend server is reachable and database is healthy
 * @param {number} timeoutMs 
 * @returns {Promise<{ ok: boolean, dbOk: boolean, message: string }>}
 */
export async function checkBackendConnection(timeoutMs = 4000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(HEALTH_ENDPOINT, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: true,
        dbOk: data.db === 'ok',
        message: 'Kết nối máy chủ Backend thành công.'
      };
    }

    return {
      ok: false,
      dbOk: false,
      message: `Máy chủ phản hồi với mã trạng thái ${res.status}`
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, dbOk: false, message: 'Kết nối máy chủ Backend bị quá thời gian chờ (Timeout).' };
    }
    return { ok: false, dbOk: false, message: 'Không thể kết nối đến máy chủ Backend (Port 5000).' };
  }
}

/**
 * Categorizes an API/Fetch error into a human-friendly message
 * @param {Error|any} err 
 * @param {Response} [res]
 * @returns {string}
 */
export function formatApiError(err, res = null) {
  if (res) {
    if (res.status === 401) return 'Phiên đăng nhập hết hạn hoặc thông tin xác thực không chính xác.';
    if (res.status === 403) return 'Bạn không có quyền thực hiện hành động này.';
    if (res.status === 404) return 'Không tìm thấy dữ liệu yêu cầu trên hệ thống.';
    if (res.status >= 500) return 'Máy chủ Backend đang gặp sự cố nội bộ. Vui lòng thử lại sau.';
  }

  if (err?.name === 'TypeError' && err?.message?.includes('fetch')) {
    return 'Không thể kết nối đến máy chủ Backend (Port 5000). Vui lòng kiểm tra dịch vụ.';
  }

  return err?.message || 'Đã có lỗi xảy ra trong quá trình xử lý yêu cầu.';
}
