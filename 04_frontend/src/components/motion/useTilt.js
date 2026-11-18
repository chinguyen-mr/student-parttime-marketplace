import { useCallback, useRef } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Chỉ spotlight (không nghiêng) — dùng trực tiếp làm onPointerMove cho thẻ trong danh sách. */
export function trackSpotlight(e) {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  el.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
}

/**
 * Tilt 3D + spotlight theo con trỏ (ý tưởng từ react-tilt / Aceternity "3D card", viết lại không phụ thuộc thư viện).
 * Ghi biến CSS lên phần tử: --rx/--ry (độ nghiêng), --mx/--my (vị trí spotlight). Phần trình bày nằm ở index.css (.jn-tilt, .jn-spotlight).
 * Chỉ chạy với chuột (bỏ qua cảm ứng/bút) và tắt khi người dùng bật "giảm chuyển động".
 *
 * @param {number} max độ nghiêng tối đa (deg)
 * @returns {{ ref, onPointerMove, onPointerLeave }}
 */
export default function useTilt(max = 5) {
  const ref = useRef(null);
  const frame = useRef(0);

  const onPointerMove = useCallback((e) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      el.classList.add('is-tilting');
    });
  }, [max]);

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    cancelAnimationFrame(frame.current);
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.classList.remove('is-tilting');
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
