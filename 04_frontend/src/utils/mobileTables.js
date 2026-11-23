// Điện thoại: bảng dữ liệu hiển thị thành danh sách thẻ (CSS ở index.css, mục "Bảng → thẻ").
// Gắn data-label = tiêu đề cột cho từng ô <td> để thẻ hiện "Nhãn: giá trị". Chạy lại khi DOM thay đổi.
// Bỏ qua bảng có class jn-table-fit (bảng tự xử lý bố cục, VD lịch rảnh).

function labelTable(table) {
  const head = table.tHead?.rows?.[table.tHead.rows.length - 1];
  if (!head) return;
  const labels = [];
  for (const th of head.cells) {
    const text = th.textContent.replace(/\s+/g, ' ').trim();
    for (let i = 0; i < (th.colSpan || 1); i++) labels.push(text);
  }
  for (const body of table.tBodies) {
    for (const row of body.rows) {
      let col = 0;
      for (const td of row.cells) {
        const label = td.colSpan > 1 && row.cells.length === 1 ? '' : (labels[col] || '');
        if (td.getAttribute('data-label') !== label) td.setAttribute('data-label', label);
        col += td.colSpan || 1;
      }
    }
  }
}

export function installMobileTableLabels(root = document.body) {
  if (typeof window === 'undefined' || !root) return () => {};
  let scheduled = false;
  const run = () => {
    scheduled = false;
    root.querySelectorAll('table:not(.jn-table-fit)').forEach(labelTable);
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(run); } };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();
  return () => observer.disconnect();
}
