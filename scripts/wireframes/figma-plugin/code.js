// Plugin Figma "JobNest – Dựng prototype": nhận các file SVG + prototype_links.json trong thư mục 05_wireframes/figma
// (do scripts/wireframes/build.js --figma sinh ra), xóa trang prototype cũ, tạo trang mới, đưa 61 màn vào,
// xếp theo vai trò, tạo vùng bấm và nối liên kết prototype, đặt điểm bắt đầu cho từng vai trò.
figma.showUI(__html__, { width: 380, height: 260 });

const PAGE_NAME = 'JobNest Prototype';
const GAP_X = 200, GAP_Y = 400;
const idOf = (name) => String(name || '').trim().split(/\s+/)[0];
const say = (text) => figma.ui.postMessage({ type: 'progress', text });
const tick = () => new Promise((r) => setTimeout(r, 0));

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'build') return;
  try {
    const { svgs, data } = msg;
    const { starts = [], layout = [], links = [] } = data;

    // 1) Xóa trang cũ do plugin tạo, tạo trang mới
    await figma.loadAllPagesAsync();
    const old = figma.root.children.filter((p) => p.name === PAGE_NAME);
    const page = figma.createPage();
    page.name = PAGE_NAME;
    await figma.setCurrentPageAsync(page);
    for (const p of old) p.remove();

    // 2) Đưa từng màn SVG vào thành khung
    const frames = {};
    let i = 0;
    for (const s of svgs) {
      i++;
      say(`Đang đưa màn ${i}/${svgs.length}: ${s.name}`);
      await tick();
      const node = figma.createNodeFromSvg(s.text);
      node.name = s.name;
      node.clipsContent = true;
      page.appendChild(node);
      frames[idOf(s.name)] = node;
    }

    // 3) Xếp mỗi vai trò một hàng
    let y = 0;
    for (const row of layout) {
      let x = 0, h = 0;
      for (const name of row.ids) {
        const f = frames[idOf(name)];
        if (!f) continue;
        f.x = x; f.y = y;
        x += f.width + GAP_X; h = Math.max(h, f.height);
      }
      if (h) y += h + GAP_Y;
    }

    // 4) Vùng bấm + liên kết
    let ok = 0, missing = 0;
    for (const l of links) {
      const from = frames[l.from], to = frames[l.to];
      if (!from || !to) { missing++; continue; }
      const r = figma.createRectangle();
      r.name = `→ ${l.to} · ${l.label}`;
      r.x = l.box.x; r.y = l.box.y;
      r.resize(Math.max(4, l.box.w), Math.max(4, l.box.h));
      r.fills = [{ type: 'SOLID', color: { r: 0.46, g: 0.4, b: 0.66 }, opacity: 0 }];
      from.appendChild(r);
      await r.setReactionsAsync([{
        trigger: { type: 'ON_CLICK' },
        actions: [{ type: 'NODE', destinationId: to.id, navigation: l.overlay ? 'OVERLAY' : 'NAVIGATE', transition: null, preserveScrollPosition: false }],
      }]);
      ok++;
      if (ok % 50 === 0) { say(`Đã nối ${ok}/${links.length} liên kết…`); await tick(); }
    }

    // 5) Điểm bắt đầu cho từng vai trò
    page.flowStartingPoints = starts.filter(([id]) => frames[id]).map(([id, name]) => ({ nodeId: frames[id].id, name }));
    figma.viewport.scrollAndZoomIntoView(Object.values(frames));

    const text = `Xong: ${Object.keys(frames).length} màn hình, ${ok} liên kết bấm${missing ? ` (bỏ qua ${missing} liên kết thiếu màn)` : ''}, ${page.flowStartingPoints.length} điểm bắt đầu.\nBấm ▶ Present để chạy thử.`;
    figma.ui.postMessage({ type: 'done', text });
    figma.notify(`JobNest: đã dựng prototype ${ok} liên kết`);
  } catch (e) {
    figma.ui.postMessage({ type: 'done', text: 'Lỗi: ' + (e && e.message ? e.message : e) });
  }
};
