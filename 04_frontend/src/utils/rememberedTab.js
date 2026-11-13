import { useEffect, useState } from 'react';

// Ghi nhớ tab đang mở để TẢI LẠI TRANG (F5) vẫn ở đúng chỗ.
// Chỉ khôi phục khi trình duyệt thật sự tải lại trang, và chỉ 1 lần cho mỗi khu vực — các lần điều hướng
// bình thường trong app (VD bấm "Đăng tin mới") vẫn dùng tab được truyền vào như cũ.
// Lưu ở sessionStorage: riêng từng tab trình duyệt, tự mất khi đóng tab.

const PREFIX = 'jobnest_tab_';
const consumed = new Set();

const isPageReload = (() => {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    return nav ? nav.type === 'reload' : performance.navigation?.type === 1;
  } catch {
    return false;
  }
})();

/** Tab đã lưu trước khi tải lại trang (null nếu không phải tải lại / đã dùng / không hợp lệ). */
export function takeRestoredTab(key, allowed) {
  if (!isPageReload || consumed.has(key)) return null;
  consumed.add(key);
  try {
    const saved = sessionStorage.getItem(PREFIX + key);
    return saved && (!allowed || allowed.includes(saved)) ? saved : null;
  } catch {
    return null;
  }
}

export function rememberTab(key, tab) {
  try { sessionStorage.setItem(PREFIX + key, tab); } catch { /* chế độ riêng tư / bị chặn */ }
}

/** Xóa mọi tab đã nhớ (đăng nhập / đăng xuất để không mở lại trang của phiên trước). */
export function clearRememberedTabs() {
  try {
    Object.keys(sessionStorage).filter(k => k.startsWith(PREFIX)).forEach(k => sessionStorage.removeItem(k));
  } catch { /* bỏ qua */ }
}

/**
 * useState cho tab con của một khu vực (portal). Effect đồng bộ theo initialTab của nơi dùng nên chỉ chạy
 * khi initialTab thật sự đổi (so với giá trị trước), để không ghi đè tab vừa khôi phục.
 */
export function useRememberedTab(key, initialTab, allowed) {
  const [tab, setTab] = useState(() => takeRestoredTab(key, allowed) || initialTab);
  useEffect(() => { rememberTab(key, tab); }, [key, tab]);
  return [tab, setTab];
}
