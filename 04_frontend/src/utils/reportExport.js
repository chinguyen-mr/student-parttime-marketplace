// Xuất báo cáo dùng chung: Excel (.xlsx có định dạng) và bản in / PDF (qua hộp thoại in của trình duyệt).
//
// Mô tả báo cáo (report spec):
// {
//   title: 'Báo cáo kiểm duyệt tin tuyển dụng',
//   subtitle?: 'Bộ lọc: Chờ duyệt',            // dòng phụ dưới tiêu đề
//   fileName?: 'kiem-duyet-tin',                // không cần đuôi
//   author?: 'Quản trị viên Hệ thống',          // người lập — in ở phần ký tên
//   summary?: [['Tổng số tin', 12], ...],       // các ô thống kê nhanh
//   columns: [{ header, value: (row) => any, width?, type?: 'text'|'number'|'money'|'date'|'datetime', align? }],
//   rows: [...],
// }

const BRAND = '7565A8';
const BRAND_SOFT = 'EFECF7';
const PEACH = 'F4B99D';

const pad = (n) => String(n).padStart(2, '0');
const toDate = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
export const fmtDate = (v) => { const d = toDate(v); return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : ''; };
export const fmtDateTime = (v) => { const d = toDate(v); return d ? `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}` : ''; };
const fmtNumber = (v) => (v === null || v === undefined || v === '' ? '' : Number(v).toLocaleString('vi-VN'));

const cellValue = (col, row, i) => {
  const v = col.value ? col.value(row, i) : row[col.key];
  return v === undefined ? null : v;
};

const displayValue = (col, v) => {
  if (v === null || v === '') return '';
  switch (col.type) {
    case 'date': return fmtDate(v);
    case 'datetime': return fmtDateTime(v);
    case 'money': return v === '' ? '' : `${fmtNumber(v)} đ`;
    case 'number': return fmtNumber(v);
    default: return String(v);
  }
};

const safeName = (s) => String(s || 'bao-cao')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

const stamp = () => { const d = new Date(); return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`; };

// ─────────────────────────────── EXCEL ───────────────────────────────
export async function exportExcel(spec) {
  const { default: ExcelJS } = await import('exceljs');
  const { title, subtitle, summary = [], columns, rows, author } = spec;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'JobNest';
  wb.created = new Date();
  const ws = wb.addWorksheet('Báo cáo', {
    pageSetup: { paperSize: 9, orientation: columns.length > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } },
    headerFooter: { oddFooter: '&L JobNest — &A&R Trang &P / &N' },
    views: [{ showGridLines: false }],
  });
  const ncol = columns.length + 1; // + cột STT
  const thin = { style: 'thin', color: { argb: 'FFD9D4EC' } };

  const band = (text, font, fill, height) => {
    const r = ws.addRow([text]);
    ws.mergeCells(r.number, 1, r.number, ncol);
    r.getCell(1).font = font;
    if (fill) r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${fill}` } };
    r.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    if (height) r.height = height;
    return r;
  };
  band('JOBNEST · Nền tảng việc làm part-time cho sinh viên', { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }, BRAND, 20);
  band(title.toUpperCase(), { bold: true, size: 16, color: { argb: `FF${BRAND}` } }, null, 30);
  band([subtitle, `Thời gian xuất: ${fmtDateTime(new Date())}`, author ? `Người lập: ${author}` : null].filter(Boolean).join('   ·   '),
    { italic: true, size: 10, color: { argb: 'FF64748B' } }, null, 18);

  if (summary.length) {
    ws.addRow([]);
    // Thống kê: mỗi dòng 1 cặp nhãn – giá trị. Nhãn gộp qua nhiều cột khi cột đầu hẹp (VD cột ID) để không bị cắt chữ.
    const labelWidth = Math.max(...summary.map(([l]) => String(l).length)) + 2;
    let labelEnd = 2;
    for (let w = columns[0]?.width || 12; w < labelWidth && labelEnd < ncol - 1; labelEnd++) w += columns[labelEnd - 1]?.width || 12;
    const valueCol = labelEnd + 1;
    summary.forEach(([label, value]) => {
      const r = ws.addRow([]);
      r.getCell(2).value = label;
      r.getCell(valueCol).value = value;
      if (labelEnd > 2) ws.mergeCells(r.number, 2, r.number, labelEnd);
      r.getCell(2).font = { size: 10.5, color: { argb: 'FF334155' } };
      r.getCell(valueCol).font = { bold: true, size: 11, color: { argb: `FF${BRAND}` } };
      r.getCell(valueCol).alignment = { horizontal: 'left' };
      [2, valueCol].forEach(c => { r.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND_SOFT}` } }; r.getCell(c).border = { bottom: thin }; });
    });
  }
  ws.addRow([]);

  const head = ws.addRow(['STT', ...columns.map(c => c.header)]);
  head.height = 24;
  head.eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10.5 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND}` } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    c.border = { top: thin, bottom: thin, left: thin, right: thin };
  });
  const headRow = head.number;

  rows.forEach((row, i) => {
    const vals = columns.map(col => {
      const v = cellValue(col, row, i);
      if (v === null || v === '') return null;
      if (col.type === 'date' || col.type === 'datetime') {
        // ExcelJS ghi Date theo UTC → dời về giờ địa phương để Excel hiển thị đúng ngày/giờ Việt Nam
        const d = toDate(v);
        return d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000) : null;
      }
      if (col.type === 'money' || col.type === 'number') return Number.isFinite(Number(v)) ? Number(v) : v;
      return typeof v === 'object' ? String(v) : v;
    });
    const r = ws.addRow([i + 1, ...vals]);
    r.eachCell({ includeEmpty: true }, (c, colNo) => {
      const col = columns[colNo - 2];
      c.border = { top: thin, bottom: thin, left: thin, right: thin };
      c.font = { size: 10 };
      c.alignment = { vertical: 'top', wrapText: true, horizontal: colNo === 1 ? 'center' : (col?.align || (['money', 'number'].includes(col?.type) ? 'right' : 'left')) };
      if (i % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F7FC' } };
      if (col?.type === 'date') c.numFmt = 'dd/mm/yyyy';
      if (col?.type === 'datetime') c.numFmt = 'dd/mm/yyyy hh:mm';
      if (col?.type === 'money') c.numFmt = '#,##0" đ"';
      if (col?.type === 'number') c.numFmt = '#,##0';
    });
  });

  ws.getColumn(1).width = 6;
  columns.forEach((col, i) => { ws.getColumn(i + 2).width = col.width || Math.min(45, Math.max(12, col.header.length + 4)); });
  ws.views = [{ state: 'frozen', ySplit: headRow, showGridLines: false }];
  ws.autoFilter = { from: { row: headRow, column: 1 }, to: { row: headRow, column: ncol } };

  ws.addRow([]);
  const tot = ws.addRow(['', `Tổng cộng: ${rows.length} dòng`]);
  tot.getCell(2).font = { bold: true, size: 10.5 };
  ws.addRow([]);
  const sign = ws.addRow([]);
  const signCol = Math.max(2, ncol - 1);
  sign.getCell(signCol).value = `TP. Hồ Chí Minh, ngày ${fmtDate(new Date())}`;
  sign.getCell(signCol).font = { italic: true, size: 10 };
  const sign2 = ws.addRow([]);
  sign2.getCell(signCol).value = 'Người lập báo cáo';
  sign2.getCell(signCol).font = { bold: true, size: 10.5 };
  ws.addRow([]); ws.addRow([]); ws.addRow([]);
  const sign3 = ws.addRow([]);
  sign3.getCell(signCol).value = author || '(Ký và ghi rõ họ tên)';
  sign3.getCell(signCol).font = { size: 10, color: { argb: 'FF64748B' } };
  // Viền nhấn màu đào dưới tiêu đề
  ws.getRow(2).getCell(1).border = { bottom: { style: 'medium', color: { argb: `FF${PEACH}` } } };

  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName(spec.fileName || title)}_${stamp()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ─────────────────────────────── IN / PDF ───────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function buildPrintHtml(spec) {
  const { title, subtitle, summary = [], columns, rows, author } = spec;
  const landscape = columns.length > 6;
  const now = new Date();
  const body = rows.map((row, i) => `<tr><td class="c">${i + 1}</td>${columns.map(col => {
    const v = displayValue(col, cellValue(col, row, i));
    const align = col.align || (['money', 'number'].includes(col.type) ? 'right' : 'left');
    return `<td style="text-align:${align}">${esc(v)}</td>`;
  }).join('')}</tr>`).join('');
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: "Be Vietnam Pro", "Segoe UI", Arial, sans-serif; color: #1E293B; margin: 0; font-size: 11px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .brand { display:flex; justify-content:space-between; align-items:center; border-bottom: 3px solid #${PEACH}; padding-bottom: 8px; }
  .logo { font-weight: 800; font-size: 18px; color: #${BRAND}; letter-spacing: -0.02em; }
  .logo small { display:block; font-weight: 500; font-size: 10px; color: #64748B; letter-spacing: 0; }
  .doc { text-align:right; font-size: 10px; color: #64748B; line-height: 1.5; }
  h1 { text-align:center; font-size: 19px; margin: 18px 0 4px; color: #0F172A; text-transform: uppercase; letter-spacing: 0.02em; }
  .sub { text-align:center; color:#64748B; margin-bottom: 14px; }
  .stats { display:flex; flex-wrap:wrap; gap: 8px; margin: 0 0 14px; }
  .stat { flex: 1 1 120px; border: 1px solid #DDD8EE; border-left: 4px solid #${BRAND}; border-radius: 6px; padding: 7px 10px; background: #${BRAND_SOFT}; }
  .stat b { display:block; font-size: 16px; color: #${BRAND}; }
  .stat span { font-size: 10px; color: #475569; }
  table { width:100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  th { background: #${BRAND}; color: #fff; font-weight: 700; padding: 6px 6px; border: 1px solid #${BRAND}; text-align:left; font-size: 10.5px; }
  td { padding: 5px 6px; border: 1px solid #E2E0EC; vertical-align: top; word-break: break-word; }
  tbody tr:nth-child(even) td { background: #F8F7FC; }
  tr { page-break-inside: avoid; }
  .c { text-align:center; color:#64748B; width: 34px; }
  .total { margin-top: 8px; font-weight: 700; }
  .sign { display:flex; justify-content:flex-end; margin-top: 22px; page-break-inside: avoid; }
  .sign div { text-align:center; min-width: 220px; }
  .sign i { color:#64748B; }
  .sign b { display:block; margin: 4px 0 56px; }
  .empty { text-align:center; padding: 24px; color:#94A3B8; }
</style></head><body>
  <div class="brand"><div class="logo">JobNest<small>Nền tảng việc làm part-time cho sinh viên</small></div>
  <div class="doc">Ngày xuất: ${esc(fmtDateTime(now))}${author ? `<br>Người lập: ${esc(author)}` : ''}</div></div>
  <h1>${esc(title)}</h1>
  ${subtitle ? `<div class="sub">${esc(subtitle)}</div>` : '<div class="sub"></div>'}
  ${summary.length ? `<div class="stats">${summary.map(([l, v]) => `<div class="stat"><b>${esc(typeof v === 'number' ? fmtNumber(v) : v)}</b><span>${esc(l)}</span></div>`).join('')}</div>` : ''}
  <table><thead><tr><th class="c" style="color:#fff">STT</th>${columns.map(c => `<th>${esc(c.header)}</th>`).join('')}</tr></thead>
  <tbody>${body || `<tr><td class="empty" colspan="${columns.length + 1}">Không có dữ liệu</td></tr>`}</tbody></table>
  <div class="total">Tổng cộng: ${rows.length} dòng</div>
  <div class="sign"><div><i>TP. Hồ Chí Minh, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}</i><b>Người lập báo cáo</b>${esc(author || '(Ký và ghi rõ họ tên)')}</div></div>
</body></html>`;
}

/** Mở hộp thoại in của trình duyệt (chọn "Lưu dưới dạng PDF" để ra file PDF). */
export function printReport(spec) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(buildPrintHtml(spec));
  doc.close();
  const go = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1500);
  };
  if (doc.readyState === 'complete') setTimeout(go, 150); else iframe.onload = go;
}
