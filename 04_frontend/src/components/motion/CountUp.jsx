import React, { useEffect, useRef, useState } from 'react';

const canAnimate = () =>
  typeof window !== 'undefined'
  && typeof IntersectionObserver !== 'undefined'
  && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Đếm số tăng dần khi thẻ thống kê xuất hiện (ý tưởng "Number Ticker" của Magic UI, viết lại gọn).
 * Chỉ áp dụng cho số nguyên; giá trị khác (VD "—", 4.5) hiển thị nguyên văn. Giảm chuyển động → hiện số cuối ngay.
 */
export default function CountUp({ value, duration = 900, format = (n) => n.toLocaleString('vi-VN'), className = '', style }) {
  const target = Number(value);
  const animatable = value !== null && value !== '' && Number.isInteger(target);
  const [enabled] = useState(canAnimate);
  const [shown, setShown] = useState(0);
  const ref = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!animatable || !enabled || !ref.current) return undefined;
    let raf = 0;
    const from = fromRef.current;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some(en => en.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        setShown(Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
        else fromRef.current = target;
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, animatable, enabled, duration]);

  return (
    <span ref={ref} className={`jn-kpi-number ${className}`.trim()} style={style}>
      {!animatable ? value : format(enabled ? shown : target)}
    </span>
  );
}
