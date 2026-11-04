import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Animated Toast banner component powered by Motion.
 * Features:
 * - Slide-in and fade-out animations with AnimatePresence
 * - Role alert accessibility
 */
export default function AnimatedToast({
  toast,
  onClose,
}) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="app-toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#0ea5e9' : '#10b981',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 10,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.1)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 420,
          }}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
          ) : toast.type === 'info' ? (
            <Info size={20} style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle size={20} style={{ flexShrink: 0 }} />
          )}
          <span style={{ flex: 1 }}>{toast.message}</span>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Đóng thông báo"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                opacity: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 2,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
            >
              <X size={16} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export { AnimatedToast };
