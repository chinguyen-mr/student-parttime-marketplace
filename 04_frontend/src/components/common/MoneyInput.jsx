import React from 'react';

/**
 * Ô nhập tiền: hiển thị có dấu chấm ngăn cách hàng nghìn (9.000.000), giá trị trả ra là số nguyên.
 * onChange(number | '') — '' khi ô trống.
 */
export default function MoneyInput({ value, onChange, style, suffix = 'đ', ...rest }) {
  const digits = String(value ?? '').split('.')[0].replace(/\D/g, '');
  const display = digits ? Number(digits).toLocaleString('vi-VN') : '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        {...rest}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
          onChange(raw ? Number(raw) : '');
        }}
        style={{ ...style, width: '100%', boxSizing: 'border-box', paddingRight: 36 }}
      />
      <span aria-hidden="true" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#475569', pointerEvents: 'none' }}>
        {suffix}
      </span>
    </div>
  );
}
