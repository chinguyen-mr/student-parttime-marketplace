// Plugin Figma: đọc prototype_links.json (do scripts/wireframes/build.js --figma sinh ra) và nối prototype
// cho các khung màn hình đã import từ 05_wireframes/figma/*.svg (tên khung bắt đầu bằng mã màn, vd "G01 Trang chủ").
figma.showUI(__html__, { width: 360, height: 230 });

const idOf = (name) => String(name || '').trim().split(/\s+/)[0];
const GAP_X = 200, GAP_Y = 400;

// Khung SVG kéo vào có thể là FRAME hoặc GROUP → quy về FRAME để làm đích prototype
function asFrame(node) {
  if (node.type === 'FRAME' || node.type === 'COMPONENT') return node;
  const f = figma.createFrame();
  f.name = node.name;
  f.resize(Math.max(1, node.width), Math.max(1, node.height));
  f.x = node.x; f.y = node.y;
  f.fills = [];
  node.parent.appendChild(f);
  f.appendChild(node);
  node.x = 0; node.y = 0;
  return f;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'link') return;
  const { starts = [], layout = [], links = [] } = msg.data || {};
  const page = figma.currentPage;

  const frames = {};
  for (const n of page.children) {
    const id = idOf(n.name);
    if (/^[GSEA]\d+[a-z]?$/.test(id)) frames[id] = asFrame(n);
  }
  const found = Object.keys(frames).length;
  if (!found) {
    figma.ui.postMessage({ type: 'done', text: 'Không thấy khung màn hình nào (tên phải bắt đầu bằng G01, S01, E01, A01…). Hãy kéo các file SVG vào trang trước.' });
    return;
  }

  // Xếp theo hàng: mỗi vai trò một hàng
  if (msg.arrange) {
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
  }

  // Xóa vùng bấm cũ (chạy lại plugin không bị nhân đôi)
  for (const f of Object.values(frames)) {
    for (const c of f.findChildren(n => n.getPluginData('jobnest') === 'hotspot')) c.remove();
  }

  let ok = 0, missing = 0;
  for (const l of links) {
    const from = frames[l.from], to = frames[l.to];
    if (!from || !to) { missing++; continue; }
    const r = figma.createRectangle();
    r.name = `→ ${l.to} · ${l.label}`;
    r.x = l.box.x; r.y = l.box.y;
    r.resize(Math.max(4, l.box.w), Math.max(4, l.box.h));
    r.fills = [{ type: 'SOLID', color: { r: 0.46, g: 0.4, b: 0.66 }, opacity: 0 }];
    r.setPluginData('jobnest', 'hotspot');
    from.appendChild(r);
    await r.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{
        type: 'NODE',
        destinationId: to.id,
        navigation: l.overlay ? 'OVERLAY' : 'NAVIGATE',
        transition: null,
        preserveScrollPosition: false,
      }],
    }]);
    ok++;
  }

  // Điểm bắt đầu cho 4 vai trò
  page.flowStartingPoints = starts
    .filter(([id]) => frames[id])
    .map(([id, name]) => ({ nodeId: frames[id].id, name }));

  figma.ui.postMessage({ type: 'done', text: `Xong: ${found} màn hình, ${ok} liên kết bấm${missing ? `, bỏ qua ${missing} liên kết thiếu màn` : ''}, ${page.flowStartingPoints.length} điểm bắt đầu.\nBấm ▶ Present để chạy thử.` });
  figma.notify(`JobNest: đã nối ${ok} liên kết prototype`);
};
