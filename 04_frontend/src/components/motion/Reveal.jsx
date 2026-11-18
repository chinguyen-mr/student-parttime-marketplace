import React, { useLayoutEffect, useRef } from 'react';

/**
 * Hiện dần + trượt lên khi cuộn tới (fade/slide-up nhẹ, có thể so le bằng `delay`).
 * - Phần tử đã nằm trong màn hình lúc tải → hiện ngay, không bắt người dùng chờ.
 * - Trình duyệt không có IntersectionObserver → không ẩn gì cả.
 * - Giảm chuyển động: CSS trong index.css bỏ trạng thái ẩn.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return undefined; // đã thấy → không ẩn
    el.classList.add('is-pending');
    const io = new IntersectionObserver((entries) => {
      if (entries.some(en => en.isIntersecting)) {
        el.classList.remove('is-pending');
        io.disconnect();
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`jn-reveal ${className}`.trim()} style={{ '--reveal-delay': `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
