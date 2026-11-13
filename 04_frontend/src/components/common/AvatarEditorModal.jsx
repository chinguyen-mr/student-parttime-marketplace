import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, X, Check, Loader2 } from 'lucide-react';

const VIEW = 300;          // kích thước khung chỉnh (px)
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

// Kích thước ảnh sau khi xoay (xoay 90/270 thì đổi chiều)
const rotatedSize = (img, rot) => (rot % 180 === 0 ? [img.width, img.height] : [img.height, img.width]);

// Giới hạn vị trí để ảnh luôn phủ kín khung
function clampOffset(img, rot, zoom, x, y) {
  const [rw, rh] = rotatedSize(img, rot);
  const s = (VIEW / Math.min(rw, rh)) * zoom;
  const maxX = Math.max(0, (rw * s - VIEW) / 2);
  const maxY = Math.max(0, (rh * s - VIEW) / 2);
  return [Math.max(-maxX, Math.min(maxX, x)), Math.max(-maxY, Math.min(maxY, y))];
}

/** Vẽ ảnh theo trạng thái chỉnh vào canvas kích thước `size`. */
function drawCrop(ctx, img, { rot, zoom, x, y }, size) {
  const [rw, rh] = rotatedSize(img, rot);
  const k = size / VIEW;
  const s = (VIEW / Math.min(rw, rh)) * zoom * k;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2 + x * k, size / 2 + y * k);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(s, s);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}

/** Ảnh gốc thu nhỏ (cạnh dài ≤ 1600px) để lưu lại, dùng khi chỉnh lần sau. */
export function downscaleSource(img, maxSide = 1600) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Khung căn chỉnh ảnh đại diện: kéo để di chuyển, thanh trượt/cuộn chuột để phóng to, xoay 90°.
 * onSave(croppedDataUrl, imageElement) — ảnh vuông 400×400 JPEG.
 */
export default function AvatarEditorModal({ src, title = 'Chỉnh sửa ảnh đại diện', saving = false, onCancel, onSave }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [img, setImg] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [state, setState] = useState({ rot: 0, zoom: 1, x: 0, y: 0 });

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.onerror = () => setLoadError(true);
    image.src = src;
  }, [src]);

  // Vẽ khung xem trước + lớp phủ tối ngoài vòng tròn
  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    drawCrop(ctx, img, state, VIEW);
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, VIEW, VIEW);
    ctx.arc(VIEW / 2, VIEW / 2, VIEW / 2 - 2, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(VIEW / 2, VIEW / 2, VIEW / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [img, state]);

  const update = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      if (!img) return next;
      const [x, y] = clampOffset(img, next.rot, next.zoom, next.x, next.y);
      return { ...next, x, y };
    });
  }, [img]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, saving]);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, x: state.x, y: state.y };
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    update({ x: d.x + (e.clientX - d.px), y: d.y + (e.clientY - d.py) });
  };
  const onPointerUp = () => { dragRef.current = null; };
  const onWheel = (e) => update({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom - e.deltaY * 0.0015)) });
  const onKeyDown = (e) => {
    const step = 10;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) { e.preventDefault(); update({ x: state.x + moves[e.key][0], y: state.y + moves[e.key][1] }); }
    if (e.key === '+' || e.key === '=') update({ zoom: Math.min(MAX_ZOOM, state.zoom + 0.1) });
    if (e.key === '-') update({ zoom: Math.max(MIN_ZOOM, state.zoom - 0.1) });
  };

  const handleSave = () => {
    const out = document.createElement('canvas');
    out.width = 400;
    out.height = 400;
    drawCrop(out.getContext('2d'), img, state, 400);
    onSave(out.toDataURL('image/jpeg', 0.88), img);
  };

  const iconBtn = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8,
    border: '1px solid #E2E8F0', background: '#ffffff', color: '#475569', cursor: 'pointer'
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onCancel(); }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#ffffff', borderRadius: 16, boxShadow: '0 24px 60px rgba(15,23,42,0.3)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{title}</h3>
          <button type="button" onClick={onCancel} disabled={saving} aria-label="Đóng" style={{ ...iconBtn, border: 'none', width: 30, height: 30 }}><X size={18} /></button>
        </div>

        <div style={{ padding: '18px 18px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {loadError ? (
            <div style={{ width: VIEW, height: VIEW, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C', fontSize: 13, textAlign: 'center' }}>
              Không đọc được ảnh. Hãy thử ảnh khác.
            </div>
          ) : !img ? (
            <div style={{ width: VIEW, height: VIEW, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={VIEW}
              height={VIEW}
              tabIndex={0}
              aria-label="Kéo để di chuyển ảnh, dùng phím mũi tên để căn chỉnh, + và - để phóng to thu nhỏ"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              onKeyDown={onKeyDown}
              style={{ width: VIEW, height: VIEW, maxWidth: '100%', borderRadius: 12, cursor: dragRef.current ? 'grabbing' : 'grab', touchAction: 'none', outlineColor: '#7565A8' }}
            />
          )}
          <div style={{ fontSize: 12, color: '#64748B' }}>Kéo ảnh để căn vị trí khuôn mặt vào giữa vòng tròn</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <button type="button" style={iconBtn} aria-label="Thu nhỏ" disabled={!img} onClick={() => update({ zoom: Math.max(MIN_ZOOM, state.zoom - 0.2) })}><ZoomOut size={16} /></button>
            <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} value={state.zoom} disabled={!img} aria-label="Mức phóng to"
              onChange={(e) => update({ zoom: Number(e.target.value) })} style={{ flex: 1, accentColor: '#7565A8' }} />
            <button type="button" style={iconBtn} aria-label="Phóng to" disabled={!img} onClick={() => update({ zoom: Math.min(MAX_ZOOM, state.zoom + 0.2) })}><ZoomIn size={16} /></button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6, fontSize: 12.5, fontWeight: 600 }} disabled={!img}
              onClick={() => update({ rot: (state.rot + 270) % 360, x: 0, y: 0 })}><RotateCcw size={15} /> Xoay trái</button>
            <button type="button" style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6, fontSize: 12.5, fontWeight: 600 }} disabled={!img}
              onClick={() => update({ rot: (state.rot + 90) % 360, x: 0, y: 0 })}><RotateCw size={15} /> Xoay phải</button>
            <button type="button" style={{ ...iconBtn, width: 'auto', padding: '0 12px', fontSize: 12.5, fontWeight: 600 }} disabled={!img}
              onClick={() => setState({ rot: 0, zoom: 1, x: 0, y: 0 })}>Đặt lại</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 18px', borderTop: '1px solid #F1F5F9', marginTop: 10 }}>
          <button type="button" onClick={onCancel} disabled={saving}
            style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#ffffff', color: '#475569', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Hủy
          </button>
          <button type="button" onClick={handleSave} disabled={!img || saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: !img || saving ? '#C4B5FD' : '#7565A8', color: '#ffffff', fontSize: 13.5, fontWeight: 700, cursor: !img || saving ? 'not-allowed' : 'pointer' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {saving ? 'Đang lưu...' : 'Lưu ảnh'}
          </button>
        </div>
      </div>
    </div>
  );
}
