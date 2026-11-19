// Dựng từ 05_wireframes/_capture/*.json:
//  1) 05_wireframes/JOBNEST_Wireframe_v2.drawio — trang "Sơ đồ màn hình & luồng" + mỗi màn hình 1 trang (wireframe xám, sửa được)
//  2) 05_wireframes/figma/<id> <tên>.svg — bản giao diện chi tiết để kéo thả vào Figma (khung, chữ, ảnh, icon giữ được)
// Chạy: node scripts/wireframes/build.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const CAP = path.join(ROOT, '05_wireframes', '_capture');
const OUT_DRAWIO = path.join(ROOT, '05_wireframes', 'JOBNEST_Wireframe_v2.drawio');
const FIG = path.join(ROOT, '05_wireframes', 'figma');
// Mặc định: 4 file wireframe khung sườn theo vai trò. --full: file draw.io 1 trang/màn hình. --figma: SVG + liên kết cho Figma.
const ARGS = new Set(process.argv.slice(2));
if (ARGS.has('--figma')) fs.mkdirSync(FIG, { recursive: true });

const ROLE_NAME = { guest: 'Khách', student: 'Sinh viên', employer: 'Nhà tuyển dụng', admin: 'Quản trị viên' };
const ROLE_ORDER = ['guest', 'student', 'employer', 'admin'];
const screens = fs.readdirSync(CAP).filter(f => /^[A-Z]\d.*\.json$/.test(f))
  .map(f => JSON.parse(fs.readFileSync(path.join(CAP, f), 'utf8')))
  .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || a.id.localeCompare(b.id, 'en', { numeric: true }));
const byId = Object.fromEntries(screens.map(s => [s.id, s]));

// Luồng prototype: [từ, tới, thao tác]
const FLOWS = [
  ['G01', 'G02', 'Tìm việc làm'], ['G01', 'G05', 'Việc làm theo lịch rảnh'], ['G01', 'G06', 'Giới thiệu'], ['G01', 'G07', 'Chân trang: Điều khoản'],
  ['G02', 'G03', 'Chọn tin'], ['G03', 'G04', 'Xem công ty'], ['G03', 'G08', 'Ứng tuyển (chưa đăng nhập)'], ['G01', 'G14', 'Đăng nhập mạng xã hội'],
  ['G08', 'G09', 'Quên mật khẩu'], ['G09', 'G15', 'Gửi mã xác nhận'], ['G08', 'G10', 'Đăng ký'], ['G10', 'G11', 'Tab Nhà tuyển dụng'],
  ['G08', 'S01', 'Đăng nhập Sinh viên'], ['G08', 'E01', 'Đăng nhập NTD'], ['G08', 'A01', 'Đăng nhập Admin'],
  ['S01', 'S02', 'Lịch rảnh & Gợi ý'], ['S01', 'S03', 'Hồ sơ xin việc'], ['S01', 'S04', 'Quản lý CV'], ['S01', 'S05', 'Việc đã lưu'],
  ['S01', 'S06', 'Lịch sử ứng tuyển'], ['S01', 'S10', 'Đánh giá'], ['S01', 'S11', 'Thông báo'], ['S01', 'S12', 'Cài đặt'],
  ['S03', 'S14', 'Ứng tuyển tin (hồ sơ đủ)'], ['S14', 'S06', 'Gửi ứng tuyển'], ['S06', 'S13', 'Chi tiết đơn'],
  ['S01', 'S15', 'Bấm ảnh đại diện'], ['S01', 'S16', 'Bấm chuông'],
  ['E01', 'E02a', 'Hồ sơ doanh nghiệp'], ['E02a', 'E02b', 'Thông tin chung'], ['E02b', 'E02c', 'Giới thiệu & văn hóa'], ['E02c', 'E02d', 'Chính sách'],
  ['E02d', 'E02e', 'Liên hệ'], ['E02e', 'E02f', 'Chi nhánh'], ['E02f', 'E02g', 'Vị trí'], ['E02g', 'E02h', 'Xác minh'],
  ['E01', 'E03', 'Người đại diện'], ['E01', 'E04', 'Tin tuyển dụng'], ['E04', 'E05', 'Đăng tin mới'], ['E01', 'E06', 'Hồ sơ ứng viên'],
  ['E06', 'E07', 'Xem hồ sơ'], ['E06', 'E08', 'Tuyển chọn'], ['E07', 'E09', 'Xem trang hồ sơ SV'], ['E01', 'E10', 'Quản lý hợp đồng'],
  ['E01', 'E12', 'Đánh giá'], ['E01', 'E13', 'Thông báo'], ['E01', 'E14', 'Cài đặt'],
  ['A01', 'A02', 'Người dùng'], ['A01', 'A03', 'Xác minh DN'], ['A03', 'A04', 'Xem hồ sơ'], ['A01', 'A05', 'Khiếu nại'],
  ['A01', 'A06', 'Kiểm duyệt tin'], ['A06', 'A07', 'Xem tin'], ['A06', 'A15', 'Xuất báo cáo'], ['A01', 'A08', 'Báo cáo'], ['A08', 'A09', 'Xử lý'],
  ['A01', 'A10', 'Kiểm duyệt đánh giá'], ['A10', 'A11', 'Xem đánh giá'], ['A01', 'A12', 'Danh mục'], ['A12', 'A13', 'Bấm "X tin"'], ['A01', 'A14', 'Nhật ký'],
].filter(([a, b]) => byId[a] && byId[b]);

// ─────────── tiện ích màu ───────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const parseC = (c) => {
  const m = /rgba?\(([^)]+)\)/.exec(c || '');
  if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
};
const hex = (c) => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const lum = (c) => (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
const greyFor = (c) => {
  // Màu nền → thang xám wireframe (pha với nền trắng theo độ trong)
  const L = 1 - c.a * (1 - lum(c));
  return L > 0.97 ? '#FFFFFF' : L > 0.88 ? '#F4F4F4' : L > 0.72 ? '#E3E3E3' : L > 0.5 ? '#C9C9C9' : '#A6A6A6';
};

// ─────────── 1) draw.io ───────────
function wireframeCells(s) {
  const cells = [];
  let n = 0;
  const id = () => `${s.id}-${++n}`;
  const W = s.w, H = s.h;
  cells.push(`<mxCell id="${id()}" value="${esc(`${s.id} · ${s.name} (${ROLE_NAME[s.role]})`)}" style="text;html=0;fontSize=22;fontStyle=1;fontColor=#555555;align=left;verticalAlign=middle;" vertex="1" parent="1"><mxGeometry x="0" y="-50" width="${W}" height="40" as="geometry"/></mxCell>`);
  cells.push(`<mxCell id="${id()}" value="" style="rounded=0;fillColor=#FFFFFF;strokeColor=#666666;strokeWidth=2;" vertex="1" parent="1"><mxGeometry x="0" y="0" width="${W}" height="${H}" as="geometry"/></mxCell>`);
  for (const k of s.nodes) {
    if (k.k === 'box') {
      if (k.w < 2 || k.h < 2) continue;
      if (k.w >= W * 0.97 && k.h >= H * 0.6 && !(parseC(k.bg)?.a < 1)) continue; // nền trang
      const c = parseC(k.bg) || (k.g ? parseC(k.g[0]) : null);
      const fill = c ? greyFor(c) : 'none';
      const overlay = c && c.a < 0.95 && k.w >= W * 0.9;
      const style = [
        `rounded=${k.r > 0 ? 1 : 0}`, k.r > 0 ? `absoluteArcSize=1;arcSize=${Math.round(Math.min(k.r * 2, 60))}` : '',
        `fillColor=${overlay ? '#555555' : fill}`, overlay ? `opacity=${Math.round(c.a * 100)}` : '',
        `strokeColor=${k.bc ? '#9E9E9E' : 'none'}`, k.dash ? 'dashed=1' : '', k.sh ? 'shadow=1' : '',
      ].filter(Boolean).join(';');
      cells.push(`<mxCell id="${id()}" value="" style="${style};" vertex="1" parent="1"><mxGeometry x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" as="geometry"/></mxCell>`);
    } else if (k.k === 'line') {
      const w = Math.max(1, Math.abs(k.x2 - k.x1)), h = Math.max(1, Math.abs(k.y2 - k.y1));
      cells.push(`<mxCell id="${id()}" value="" style="rounded=0;fillColor=#CFCFCF;strokeColor=none;" vertex="1" parent="1"><mxGeometry x="${Math.min(k.x1, k.x2)}" y="${Math.min(k.y1, k.y2)}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
    } else if (k.k === 'img') {
      if (k.src && /tile|openstreetmap|basemaps|cartocdn/.test(k.src)) continue;
      if (k.w < 4 || k.h < 4) continue;
      const round = k.r >= Math.min(k.w, k.h) / 2 - 1;
      const label = k.w > 120 && k.h > 60 ? (k.src ? 'Ảnh' : 'Bản đồ / nội dung nhúng') : '';
      const style = round
        ? 'ellipse;fillColor=#D6D6D6;strokeColor=#9E9E9E;fontColor=#777777;'
        : 'shape=mxgraph.mockup.graphics.simpleIcon;strokeColor=#9E9E9E;fillColor=#E8E8E8;fontColor=#777777;verticalLabelPosition=middle;verticalAlign=middle;';
      cells.push(`<mxCell id="${id()}" value="${esc(label)}" style="${style}html=0;" vertex="1" parent="1"><mxGeometry x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" as="geometry"/></mxCell>`);
    } else if (k.k === 'svg') {
      if (k.w < 3 || k.h < 3) continue;
      const big = k.w > 64 || k.h > 64;
      cells.push(`<mxCell id="${id()}" value="" style="${big ? 'shape=mxgraph.mockup.graphics.simpleIcon;fillColor=#E8E8E8;strokeColor=#9E9E9E' : 'rounded=1;arcSize=30;fillColor=#BDBDBD;strokeColor=none'};" vertex="1" parent="1"><mxGeometry x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" as="geometry"/></mxCell>`);
    } else if (k.k === 'text') {
      const c = parseC(k.c) || { r: 51, g: 51, b: 51, a: 1 };
      const L = lum(c);
      const fc = L > 0.8 ? '#FFFFFF' : L > 0.5 ? '#8A8A8A' : '#333333';
      const fs = Math.max(8, Math.round(k.fs));
      const st = (k.fw >= 600 ? 1 : 0) + (k.it ? 2 : 0);
      const h = k.mid ? k.h : Math.max(k.h, fs * 1.2);
      cells.push(`<mxCell id="${id()}" value="${esc(k.t)}" style="text;html=0;whiteSpace=nowrap;align=left;verticalAlign=middle;spacing=0;fontFamily=Helvetica;fontSize=${fs};fontStyle=${st};fontColor=${fc};" vertex="1" parent="1"><mxGeometry x="${k.x}" y="${k.y}" width="${Math.max(k.w + 4, 8)}" height="${h}" as="geometry"/></mxCell>`);
    }
  }
  return cells;
}

function page(id, name, cells, w, h) {
  return `<diagram id="${esc(id)}" name="${esc(name)}"><mxGraphModel dx="1200" dy="800" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="${w}" pageHeight="${h}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells.join('')}</root></mxGraphModel></diagram>`;
}

// Trang sơ đồ: cột theo vai trò, mỗi màn hình 1 ô có liên kết tới trang của nó, mũi tên theo luồng
function indexPage() {
  // Mỗi vai trò 1 dải ngang; trong dải, màn hình xếp theo "bậc" (số bước từ màn gốc) từ trái sang phải
  const cells = [];
  const COLW = 400, BOXW = 260, BOXH = 54, GAP = 18;
  const ROOTS = { guest: 'G01', student: 'S01', employer: 'E01', admin: 'A01' };
  cells.push(`<mxCell id="ix-title" value="JOBNEST — Sơ đồ màn hình &amp; luồng prototype (${screens.length} màn hình · bấm vào ô để mở trang wireframe)" style="text;html=1;fontSize=24;fontStyle=1;align=left;" vertex="1" parent="1"><mxGeometry x="0" y="-70" width="2000" height="40" as="geometry"/></mxCell>`);
  let bandY = 0, maxX = 0;
  for (const r of ROLE_ORDER) {
    const list = screens.filter(s => s.role === r);
    const ids = new Set(list.map(s => s.id));
    const level = { [ROOTS[r]]: 0 };
    const queue = [ROOTS[r]];
    while (queue.length) {
      const cur = queue.shift();
      for (const [a, b] of FLOWS) if (a === cur && ids.has(b) && level[b] === undefined) { level[b] = level[cur] + 1; queue.push(b); }
    }
    list.forEach(s => { if (level[s.id] === undefined) level[s.id] = 1; });
    const cols = {};
    list.forEach(s => { (cols[level[s.id]] = cols[level[s.id]] || []).push(s); });
    const rows = Math.max(...Object.values(cols).map(c => c.length));
    const bandH = 60 + rows * (BOXH + GAP) + 20;
    const bandW = Object.keys(cols).length * COLW;
    maxX = Math.max(maxX, bandW);
    cells.push(`<mxCell id="ix-band-${r}" value="" style="rounded=1;arcSize=2;fillColor=#FAF9FD;strokeColor=#DDD6F3;dashed=1;" vertex="1" parent="1"><mxGeometry x="-20" y="${bandY - 10}" width="${bandW}" height="${bandH}" as="geometry"/></mxCell>`);
    cells.push(`<mxCell id="ix-h-${r}" value="${esc(ROLE_NAME[r])} (${list.length} màn hình)" style="rounded=1;fillColor=#7565A8;fontColor=#FFFFFF;strokeColor=none;fontSize=16;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="0" y="${bandY}" width="${BOXW}" height="38" as="geometry"/></mxCell>`);
    Object.entries(cols).forEach(([lv, arr]) => arr.forEach((s, i) => {
      const x = Number(lv) * COLW, y = bandY + 56 + i * (BOXH + GAP);
      cells.push(`<UserObject id="ix-${s.id}" label="${esc(`${s.id} · ${s.name}`)}" link="data:page/id,pg-${s.id}"><mxCell style="rounded=1;whiteSpace=wrap;html=0;fillColor=${lv === '0' ? '#F4B99D' : '#F1EEF8'};strokeColor=#7565A8;fontSize=12;align=left;spacingLeft=8;fontStyle=${lv === '0' ? 1 : 0};" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${BOXW}" height="${BOXH}" as="geometry"/></mxCell></UserObject>`);
    }));
    bandY += bandH + 40;
  }
  FLOWS.forEach(([a, b, label], i) => {
    const cross = a[0] !== b[0];
    cells.push(`<mxCell id="ix-e${i}" value="${esc(label)}" style="edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;html=0;endArrow=block;endFill=1;strokeColor=${cross ? '#7565A8' : '#E59A78'};strokeWidth=1.4;${cross ? 'dashed=1;' : ''}exitX=1;exitY=0.5;entryX=0;entryY=0.5;fontSize=10;fontColor=#555555;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="ix-${a}" target="ix-${b}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  });
  return page('pg-index', '00 · Sơ đồ màn hình & luồng', cells, maxX + 100, bandY);
}

if (ARGS.has('--full')) {
  const diagrams = [indexPage(), ...screens.map(s => page(`pg-${s.id}`, `${s.id} · ${s.name}`, wireframeCells(s), s.w, s.h))];
  fs.writeFileSync(OUT_DRAWIO, `<mxfile host="JobNest-wireframe-builder" version="24.0.0" pages="${diagrams.length}">${diagrams.join('')}</mxfile>`);
  console.log('draw.io:', path.relative(ROOT, OUT_DRAWIO), (fs.statSync(OUT_DRAWIO).size / 1024 / 1024).toFixed(1) + 'MB', diagrams.length, 'trang');
}

// ─────────── 1b) 4 file wireframe khung sườn (mỗi vai trò 1 trang chứa mọi màn hình + luồng) ───────────
const SK = 0.5;          // tỉ lệ thu nhỏ trên trang tổng
const MAXH = 2400;       // màn quá dài: chỉ vẽ phần trên
function skeletonCells(s, ox, oy) {
  const cells = [];
  let n = 0;
  const id = () => `${s.id}-k${++n}`;
  const X = (v) => +(ox + v * SK).toFixed(1), Y = (v) => +(oy + v * SK).toFixed(1), D = (v) => +(v * SK).toFixed(1);
  const H = Math.min(s.h, MAXH);
  const geo = (x, y, w, h) => `<mxGeometry x="${X(x)}" y="${Y(y)}" width="${Math.max(1, D(w))}" height="${Math.max(1, D(h))}" as="geometry"/>`;
  const cut = s.h > MAXH ? ' · (đã cắt phần dưới)' : '';
  cells.push(`<mxCell id="${s.id}-title" value="${esc(`${s.id} · ${s.name}${cut}`)}" style="text;html=0;fontSize=20;fontStyle=1;fontColor=#4C3F86;align=left;verticalAlign=bottom;" vertex="1" parent="1"><mxGeometry x="${ox}" y="${oy - 44}" width="${D(s.w)}" height="36" as="geometry"/></mxCell>`);
  cells.push(`<mxCell id="${s.id}-frame" value="" style="rounded=0;fillColor=#FFFFFF;strokeColor=#555555;strokeWidth=2;" vertex="1" parent="1">${geo(0, 0, s.w, H)}</mxCell>`);
  for (const k of s.nodes) {
    const top = k.k === 'line' ? Math.min(k.y1, k.y2) : k.y;
    if (top >= H) continue;
    if (k.k === 'box') {
      if (k.w < 3 || k.h < 3) continue;
      if (k.w >= s.w * 0.97 && k.h >= s.h * 0.6 && !(parseC(k.bg)?.a < 1)) continue;
      const c = parseC(k.bg) || (k.g ? parseC(k.g[0]) : null);
      const overlay = c && c.a < 0.95 && k.w >= s.w * 0.9;
      const style = [`rounded=${k.r > 0 ? 1 : 0}`, k.r > 0 ? `absoluteArcSize=1;arcSize=${Math.round(Math.min(k.r, 30))}` : '',
        `fillColor=${overlay ? '#555555' : (c ? greyFor(c) : 'none')}`, overlay ? `opacity=${Math.round(c.a * 100)}` : '',
        `strokeColor=${k.bc ? '#B0B0B0' : 'none'}`, k.dash ? 'dashed=1' : ''].filter(Boolean).join(';');
      cells.push(`<mxCell id="${id()}" value="" style="${style};" vertex="1" parent="1">${geo(k.x, k.y, k.w, Math.min(k.h, H - k.y))}</mxCell>`);
    } else if (k.k === 'line') {
      cells.push(`<mxCell id="${id()}" value="" style="rounded=0;fillColor=#D6D6D6;strokeColor=none;" vertex="1" parent="1">${geo(Math.min(k.x1, k.x2), top, Math.max(2, Math.abs(k.x2 - k.x1)), Math.max(2, Math.abs(k.y2 - k.y1)))}</mxCell>`);
    } else if (k.k === 'img') {
      if ((k.src && /tile|openstreetmap|basemaps|cartocdn/.test(k.src)) || k.w < 6 || k.h < 6) continue;
      const round = k.r >= Math.min(k.w, k.h) / 2 - 1;
      cells.push(`<mxCell id="${id()}" value="" style="${round ? 'ellipse;fillColor=#E0E0E0;strokeColor=#A0A0A0' : 'shape=mxgraph.mockup.graphics.simpleIcon;fillColor=#EEEEEE;strokeColor=#A0A0A0'};" vertex="1" parent="1">${geo(k.x, k.y, k.w, Math.min(k.h, H - k.y))}</mxCell>`);
    } else if (k.k === 'svg') {
      if (k.w < 4 || k.h < 4) continue;
      const big = k.w > 64 || k.h > 64;
      cells.push(`<mxCell id="${id()}" value="" style="${big ? 'shape=mxgraph.mockup.graphics.simpleIcon;fillColor=#EEEEEE;strokeColor=#A0A0A0' : 'ellipse;fillColor=#C8C8C8;strokeColor=none'};" vertex="1" parent="1">${geo(k.x, k.y, k.w, k.h)}</mxCell>`);
    } else if (k.k === 'text') {
      const c = parseC(k.c) || { r: 51, g: 51, b: 51, a: 1 };
      const light = lum(c) > 0.8;
      const t = String(k.t).trim();
      // Giữ chữ cho tiêu đề và nhãn nút/menu ngắn; còn lại thay bằng thanh xám
      const keep = !k.mid && (k.fs >= 18 || (k.fw >= 600 && k.fs >= 13 && t.length <= 28));
      if (keep) {
        cells.push(`<mxCell id="${id()}" value="${esc(t)}" style="text;html=0;whiteSpace=nowrap;align=left;verticalAlign=middle;spacing=0;fontFamily=Helvetica;fontSize=${Math.max(7, Math.round(k.fs * SK))};fontStyle=1;fontColor=${light ? '#FFFFFF' : '#333333'};" vertex="1" parent="1">${geo(k.x, k.y, k.w + 6, Math.max(k.h, k.fs * 1.2))}</mxCell>`);
      } else {
        const bh = Math.max(4, k.fs * 0.5);
        cells.push(`<mxCell id="${id()}" value="" style="rounded=1;arcSize=50;fillColor=${light ? '#F2F2F2' : (k.mid ? '#E6E6E6' : '#D2D2D2')};strokeColor=none;" vertex="1" parent="1">${geo(k.x, k.y + (k.h - bh) / 2, Math.max(8, k.w * (k.mid ? 0.6 : 0.95)), bh)}</mxCell>`);
      }
    }
  }
  return { cells, h: D(H) };
}

// 1 file draw.io, 4 trang (sheet): Khách · Sinh viên · Nhà tuyển dụng · Quản trị viên
const rolePages = [];
for (const r of ROLE_ORDER) {
  const list = screens.filter(s => s.role === r);
  const COLS = 4, COLW = 1440 * SK + 260, TOP = 140;
  const cells = [];
  cells.push(`<mxCell id="${r}-title" value="${esc(`JOBNEST — Wireframe ${ROLE_NAME[r]} (${list.length} màn hình)`)}" style="text;html=0;fontSize=40;fontStyle=1;fontColor=#4C3F86;align=left;" vertex="1" parent="1"><mxGeometry x="0" y="0" width="2400" height="60" as="geometry"/></mxCell>`);
  cells.push(`<mxCell id="${r}-note" value="Khung sườn bố cục (hộp, ảnh, nút; thanh xám = nội dung chữ). Giao diện chi tiết xem ở prototype Figma. Mũi tên = luồng chuyển màn hình." style="text;html=0;fontSize=18;fontColor=#666666;align=left;" vertex="1" parent="1"><mxGeometry x="0" y="64" width="2400" height="30" as="geometry"/></mxCell>`);
  const inRole = new Set(list.map(s => s.id));
  const roleFlows = FLOWS.filter(([a, b]) => inRole.has(a) && inRole.has(b));

  // Sơ đồ luồng thu nhỏ ở đầu trang: cây theo bậc từ màn gốc; bấm ô → cuộn tới màn hình đó
  const ROOT_ID = { guest: 'G01', student: 'S01', employer: 'E01', admin: 'A01' }[r];
  const level = { [ROOT_ID]: 0 };
  const q = [ROOT_ID];
  while (q.length) { const cur = q.shift(); for (const [a, b] of roleFlows) if (a === cur && level[b] === undefined) { level[b] = level[cur] + 1; q.push(b); } }
  list.forEach(s => { if (level[s.id] === undefined) level[s.id] = 1; });
  const cols = {};
  list.forEach(s => (cols[level[s.id]] = cols[level[s.id]] || []).push(s));
  const MBW = 300, MBH = 50, MCOL = 420, MGAP = 16, mapTop = TOP + 70;
  cells.push(`<mxCell id="${r}-map-title" value="Sơ đồ luồng (bấm vào ô để tới màn hình)" style="text;html=0;fontSize=22;fontStyle=1;fontColor=#333333;align=left;" vertex="1" parent="1"><mxGeometry x="0" y="${TOP + 20}" width="900" height="34" as="geometry"/></mxCell>`);
  let mapH = 0;
  Object.entries(cols).forEach(([lv, arr]) => arr.forEach((s, i) => {
    const mx = Number(lv) * MCOL, my = mapTop + i * (MBH + MGAP);
    mapH = Math.max(mapH, my + MBH - mapTop);
    const link = `data:action/json,{&quot;actions&quot;:[{&quot;select&quot;:{&quot;cells&quot;:[&quot;${s.id}-frame&quot;]}},{&quot;scroll&quot;:{&quot;cells&quot;:[&quot;${s.id}-frame&quot;]}}]}`;
    cells.push(`<UserObject id="map-${s.id}" label="${esc(`${s.id} · ${s.name}`)}" link="${link}"><mxCell style="rounded=1;whiteSpace=wrap;html=0;fillColor=${lv === '0' ? '#F4B99D' : '#F1EEF8'};strokeColor=#7565A8;fontSize=14;align=left;spacingLeft=10;fontStyle=${lv === '0' ? 1 : 0};" vertex="1" parent="1"><mxGeometry x="${mx}" y="${my}" width="${MBW}" height="${MBH}" as="geometry"/></mxCell></UserObject>`);
  }));
  roleFlows.forEach(([a, b, label], i) => {
    cells.push(`<mxCell id="${r}-flow-${i}" value="${esc(label)}" style="edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;html=0;endArrow=block;endFill=1;strokeColor=#E5865A;strokeWidth=2;exitX=1;exitY=0.5;entryX=0;entryY=0.5;fontSize=12;fontColor=#9A4A24;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="map-${a}" target="map-${b}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  });

  // Lưới các màn hình khung sườn
  let y = mapTop + mapH + 160, maxW = Math.max(Object.keys(cols).length * MCOL, 2400);
  for (let i = 0; i < list.length; i += COLS) {
    const row = list.slice(i, i + COLS);
    let rowH = 0;
    row.forEach((s, j) => {
      const res = skeletonCells(s, j * COLW, y);
      cells.push(...res.cells);
      const outs = FLOWS.filter(([a]) => a === s.id).map(([, b, l]) => `${b} (${l})`);
      if (outs.length) cells.push(`<mxCell id="${s.id}-next" value="${esc('→ chuyển tới: ' + outs.join(', '))}" style="text;html=0;whiteSpace=wrap;fontSize=13;fontColor=#9A4A24;align=left;verticalAlign=top;" vertex="1" parent="1"><mxGeometry x="${j * COLW}" y="${y + res.h + 8}" width="${1440 * SK}" height="40" as="geometry"/></mxCell>`);
      rowH = Math.max(rowH, res.h);
    });
    maxW = Math.max(maxW, row.length * COLW);
    y += rowH + 220;
  }
  const cross = FLOWS.filter(([a, b]) => inRole.has(a) !== inRole.has(b));
  if (cross.length) {
    const txt = 'Liên kết sang vai trò khác: ' + cross.map(([a, b, l]) => `${a} → ${b} (${l})`).join(' · ');
    cells.push(`<mxCell id="${r}-cross" value="${esc(txt)}" style="text;html=0;fontSize=16;fontColor=#7565A8;align=left;" vertex="1" parent="1"><mxGeometry x="0" y="98" width="2400" height="28" as="geometry"/></mxCell>`);
  }
  rolePages.push(page(`role-${r}`, `${ROLE_ORDER.indexOf(r) + 1}. ${ROLE_NAME[r]} (${list.length})`, cells, maxW, y));
}
const ONE = path.join(ROOT, '05_wireframes', 'JOBNEST_Wireframe.drawio');
fs.writeFileSync(ONE, `<mxfile host="JobNest-wireframe-builder" version="24.0.0" pages="${rolePages.length}">${rolePages.join('')}</mxfile>`);
console.log('draw.io:', path.relative(ROOT, ONE), (fs.statSync(ONE).size / 1024 / 1024).toFixed(1) + 'MB,', rolePages.length, 'trang (sheet),', screens.length, 'màn hình');


// ─────────── 2) SVG cho Figma ───────────
const imgCache = new Map();
async function dataUri(src) {
  if (!src) return null;
  if (imgCache.has(src)) return imgCache.get(src);
  let v = null;
  try {
    const res = await fetch(src);
    if (res.ok) {
      const type = (res.headers.get('content-type') || 'image/png').split(';')[0];
      v = `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
    }
  } catch { v = null; }
  imgCache.set(src, v);
  return v;
}
const fillAttr = (c, name = 'fill') => {
  const p = parseC(c);
  if (!p) return `${name}="none"`;
  return `${name}="${hex(p)}"${p.a < 1 ? ` ${name}-opacity="${+p.a.toFixed(3)}"` : ''}`;
};

async function svgFor(s) {
  const defs = [];
  const body = [];
  let n = 0;
  body.push(`<rect x="0" y="0" width="${s.w}" height="${s.h}" fill="#FFFFFF"/>`);
  for (const k of s.nodes) {
    const op = k.op < 0.99 ? ` opacity="${+k.op.toFixed(2)}"` : '';
    if (k.k === 'box') {
      if (k.w < 1 || k.h < 1) continue;
      let fill = fillAttr(k.bg);
      if (k.g) {
        const gid = `g${++n}`;
        const a = parseC(k.g[0]), b = parseC(k.g[1]);
        defs.push(`<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hex(a)}" stop-opacity="${a.a}"/><stop offset="1" stop-color="${hex(b)}" stop-opacity="${b.a}"/></linearGradient>`);
        fill = `fill="url(#${gid})"`;
      }
      const stroke = k.bc ? ` ${fillAttr(k.bc, 'stroke')} stroke-width="${k.bw}"${k.dash ? ' stroke-dasharray="6 4"' : ''}` : '';
      body.push(`<rect x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}"${k.r ? ` rx="${+k.r.toFixed(1)}"` : ''} ${fill}${stroke}${op}/>`);
    } else if (k.k === 'line') {
      body.push(`<line x1="${k.x1}" y1="${k.y1}" x2="${k.x2}" y2="${k.y2}" ${fillAttr(k.c, 'stroke')} stroke-width="${k.w}"${op}/>`);
    } else if (k.k === 'img') {
      const uri = await dataUri(k.src);
      if (!uri) { body.push(`<rect x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" fill="#E5E7EB"${op}/>`); continue; }
      let clip = '';
      if (k.r > 0) {
        const cid = `c${++n}`;
        defs.push(`<clipPath id="${cid}"><rect x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" rx="${+k.r.toFixed(1)}"/></clipPath>`);
        clip = ` clip-path="url(#${cid})"`;
      }
      const par = k.fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice';
      body.push(`<image x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" preserveAspectRatio="${par}" href="${uri}"${clip}${op}/>`);
    } else if (k.k === 'svg') {
      const m = k.m.replace(/^<svg\b([^>]*)>/, (all, attrs) => {
        const a = attrs.replace(/\s(width|height|x|y|class|style)="[^"]*"/g, '');
        const vb = /viewBox=/.test(a) ? '' : ' viewBox="0 0 24 24"';
        return `<svg${a}${vb} x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}"${op}>`;
      });
      body.push(/xmlns=/.test(m.slice(0, 200)) ? m : m.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
    } else if (k.k === 'text') {
      const y = k.y + k.h / 2 + k.fs * 0.35;
      // Font hệ thống của web (system-ui → Segoe UI trên Windows) → Inter: Figma luôn có sẵn, hỗ trợ tiếng Việt
      const ff = /^(system-ui|-apple-system|BlinkMacSystemFont|Segoe UI|Helvetica Neue)$/i.test(k.ff) ? 'Inter' : k.ff;
      body.push(`<text x="${k.x}" y="${+y.toFixed(1)}" font-family="${esc(ff)}" font-size="${k.fs}" font-weight="${k.fw}"${k.it ? ' font-style="italic"' : ''} ${fillAttr(k.c)}${op} xml:space="preserve">${esc(k.t)}</text>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${s.w}" height="${s.h}" viewBox="0 0 ${s.w} ${s.h}"><title>${esc(`${s.id} ${s.name}`)}</title><defs>${defs.join('')}</defs><g id="${s.id}">${body.join('')}</g></svg>`;
}

if (ARGS.has('--figma')) (async () => {
  for (const f of fs.readdirSync(FIG).filter(f => f.endsWith('.svg'))) fs.unlinkSync(path.join(FIG, f));
  let total = 0;
  for (const s of screens) {
    const svg = await svgFor(s);
    const name = `${s.id} ${s.name}`.replace(/[\\/:*?"<>|]/g, '-');
    fs.writeFileSync(path.join(FIG, `${name}.svg`), svg);
    total += svg.length;
  }
  console.log('Figma SVG:', screens.length, 'file,', (total / 1024 / 1024).toFixed(1) + 'MB');
  // Danh sách luồng để nối prototype trong Figma
  const md = ['# Luồng prototype JobNest (nối trong Figma: Prototype → kéo từ nút/vùng ở màn "Từ" tới khung "Tới")', '',
    '| Từ | Thao tác | Tới |', '|---|---|---|',
    ...FLOWS.map(([a, b, l]) => `| ${a} · ${byId[a].name} | ${l} | ${b} · ${byId[b].name} |`)];
  fs.writeFileSync(path.join(FIG, 'LUONG_PROTOTYPE.md'), md.join('\n') + '\n');
  writePrototypeLinks();
})();

// ─────────── 3) Vùng bấm prototype cho plugin Figma ───────────
// Mỗi liên kết: màn nguồn, màn đích, ô chữ để bấm (lấy toạ độ từ dữ liệu trích xuất), mở dạng trang hoặc popup.
function writePrototypeLinks() {
  const texts = (id) => (byId[id]?.nodes || []).filter(n => n.k === 'text');
  const match = (t, m) => (m instanceof RegExp ? m.test(t) : t.trim() === m);
  const find = (id, m, { region, pick = 'first' } = {}) => {
    const c = texts(id).filter(n => match(n.t.trim(), m) && (!region || region(n)));
    if (!c.length) return null;
    const n = pick === 'last' ? c[c.length - 1] : c[0];
    return { x: Math.max(0, n.x - 8), y: Math.max(0, n.y - 6), w: n.w + 16, h: n.h + 12 };
  };
  const isPopup = (id) => /popup|Menu|chuông/i.test(byId[id]?.name || '');
  const links = [];
  const add = (from, to, label, m, opt = {}) => {
    if (!byId[from] || !byId[to] || from === to) return;
    const box = find(from, m, opt);
    if (!box) return;
    if (links.some(l => l.from === from && Math.abs(l.box.x - box.x) < 4 && Math.abs(l.box.y - box.y) < 4)) return;
    links.push({ from, to, label, overlay: isPopup(to), box });
  };
  // Menu điều hướng lặp lại trên mọi màn của vai trò
  const NAV = {
    guest: [{ region: n => n.y < 80 }, { 'Trang chủ': 'G01', 'Tìm việc làm': 'G02', 'Việc làm theo lịch rảnh': 'G05', 'Đăng nhập': 'G08', 'Đăng ký': 'G10' }],
    student: [{ region: n => n.x < 300 && n.y > 80 }, { 'Tổng quan': 'S01', 'Lịch rảnh & Gợi ý AI': 'S02', 'Hồ sơ xin việc': 'S03', 'Quản lý CV': 'S04', 'Việc làm đã lưu': 'S05', 'Lịch sử ứng tuyển': 'S06', 'Đánh giá & Phản hồi': 'S10', 'Thông báo': 'S11', 'Cài đặt tài khoản': 'S12' }],
    employer: [{ region: n => n.x < 280 && n.y > 80 }, { 'Tổng quan': 'E01', 'Hồ sơ doanh nghiệp': 'E02a', 'Tin tuyển dụng': 'E04', 'Hồ sơ ứng viên': 'E06', 'Quản lý hợp đồng': 'E10', 'Đánh giá': 'E12', 'Thông báo': 'E13', 'Thông tin người đại diện': 'E03', 'Cài đặt tài khoản': 'E14' }],
    admin: [{ region: n => n.x < 260 && n.y > 80 }, { 'Tổng quan': 'A01', 'Người dùng': 'A02', 'Xác minh doanh nghiệp': 'A03', 'Khiếu nại tài khoản': 'A05', 'Kiểm duyệt tin': 'A06', 'Báo cáo': 'A08', 'Kiểm duyệt đánh giá': 'A10', 'Danh mục': 'A12', 'Nhật ký hệ thống': 'A14' }],
  };
  for (const s of screens) {
    if (isPopup(s.id)) continue;
    const [opt, map] = NAV[s.role];
    for (const [label, to] of Object.entries(map)) add(s.id, to, label, label, opt);
  }
  // Các tab trong Hồ sơ doanh nghiệp
  const TABS = { 'Logo, ảnh bìa & thư viện': 'E02a', 'Thông tin chung': 'E02b', 'Giới thiệu & văn hóa': 'E02c', 'Chính sách nhân sự': 'E02d', 'Liên hệ công khai': 'E02e', 'Chi nhánh': 'E02f', 'Vị trí trụ sở': 'E02g' };
  for (const s of screens.filter(x => x.id.startsWith('E02'))) {
    for (const [label, to] of Object.entries(TABS)) add(s.id, to, label, label, { region: n => n.x > 280 });
    add(s.id, 'E02h', 'Xác minh doanh nghiệp', /^Xác minh doanh/, { region: n => n.x > 280 });
  }
  // Nút chính theo luồng nghiệp vụ
  const MAIN = [
    ['G01', 'G07', 'Quy định bảo mật', /Quy định bảo mật|Quy chế hoạt động/], ['G02', 'G03', 'Xem chi tiết', 'Xem chi tiết công việc'],
    ['G03', 'G04', 'Xem công ty', /Xem (trang |thông tin )?công ty|Xem hồ sơ công ty/], ['G03', 'G08', 'Ứng tuyển', /Ứng tuyển ngay/],
    ['G08', 'G09', 'Quên mật khẩu', /Quên mật khẩu/], ['G09', 'G15', 'Gửi mã xác nhận', /Gửi mã xác nhận/], ['G08', 'G14', 'Đăng nhập Google', /Google/], ['G10', 'G11', 'Tab NTD', 'Nhà tuyển dụng', { region: n => n.y > 100 }],
    ['G08', 'S01', 'Đăng nhập', /^Đăng nhập$/, { pick: 'last', region: n => n.y > 100 }], ['G11', 'E01', 'Đăng ký NTD', /^Đăng ký/, { pick: 'last', region: n => n.y > 100 }],
    ['S05', 'G03', 'Xem chi tiết công việc', 'Xem chi tiết công việc'], ['S01', 'S06', 'Xem tất cả', /^Xem tất cả/],
    ['G03', 'S14', 'Ứng tuyển (đã đăng nhập SV)', /Ứng tuyển ngay/, { pick: 'last' }], ['S14', 'S06', 'Gửi ứng tuyển', /Gửi ứng tuyển/],
    ['S06', 'S13', 'Chi tiết đơn', /Chi tiết đơn/],
    ...[['Tổng quan', 'S01'], ['Hồ sơ & CV', 'S03'], ['Lịch rảnh & Gợi ý', 'S02'], ['Việc làm đã lưu', 'S05'], ['Lịch sử ứng tuyển', 'S06'],
      ['Đánh giá & Phản hồi', 'S10'], ['Cài đặt tài khoản', 'S12']].map(([l, to]) => ['S15', to, l, l, { region: n => n.x > 1100 && n.y < 600 }]),
    ['S16', 'S11', 'Xem tất cả thông báo', /Xem tất cả/],
    ['E04', 'E05', 'Đăng tin mới', /Đăng tin mới/, { pick: 'last' }], ['E01', 'E05', 'Đăng tin mới', /Đăng tin mới/],
    ['E06', 'E07', 'Xem hồ sơ', 'Xem hồ sơ'], ['E06', 'E08', 'Tuyển chọn', /Tuyển chọn ứng viên chính thức/],
    ['A03', 'A04', 'Xem hồ sơ', 'Xem hồ sơ'], ['A06', 'A07', 'Xem tin', /^(Xem|Duyệt|Chi tiết)/, { region: n => n.x > 1000 }],
    ['A08', 'A09', 'Xử lý', /^(Xem|Xử lý|Chi tiết)/, { region: n => n.x > 1000 }], ['A12', 'A13', 'Xem tin', /^tin$/, { region: n => n.x > 900 }],
    ['A06', 'A15', 'Xuất báo cáo', /Xuất báo cáo/],
  ];
  for (const [a, b, label, m, opt] of MAIN) add(a, b, label, m, opt);
  const starts = [['G01', 'Khách'], ['S01', 'Sinh viên'], ['E01', 'Nhà tuyển dụng'], ['A01', 'Quản trị viên']].filter(([id]) => byId[id]);
  const layout = ROLE_ORDER.map(r => ({ role: ROLE_NAME[r], ids: screens.filter(s => s.role === r).map(s => `${s.id} ${s.name}`.replace(/[\\/:*?"<>|]/g, '-')) }));
  fs.writeFileSync(path.join(FIG, 'prototype_links.json'), JSON.stringify({ starts, layout, links }, null, 1));
  console.log('Liên kết prototype:', links.length, '(trên', new Set(links.map(l => l.from)).size, 'màn hình)');
}
