import React from 'react';
import { Button as AnimateUIButton } from '@animate-ui/react/primitives/buttons/button';

/**
 * Animated Button component based on Animate UI primitive.
 * Supports standard button props, Lucide icons, and micro-interactions
 * with graceful fallback for prefers-reduced-motion.
 */
export default function Button({
  children,
  variant = 'secondary', // 'primary' | 'secondary' | 'success' | 'danger'
  className = '',
  style = {},
  hoverScale = 1.015,
  tapScale = 0.975,
  disabled = false,
  ...props
}) {
  const variantClass = variant ? `btn-${variant}` : '';
  const combinedClassName = `btn ${variantClass} ${className}`.trim();

  return (
    <AnimateUIButton
      className={combinedClassName}
      hoverScale={disabled ? 1 : hoverScale}
      tapScale={disabled ? 1 : tapScale}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
      {...props}
    >
      {children}
    </AnimateUIButton>
  );
}
export { Button };
