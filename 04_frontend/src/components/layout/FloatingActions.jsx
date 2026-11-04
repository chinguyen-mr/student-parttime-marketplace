import React, { useState, useEffect } from 'react';
import { ArrowUp, Headphones, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingActions({
  onOpenSupport,
}) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="floating-actions-container">
      {/* 1. Scroll-to-top button with smooth entrance */}
      <AnimatePresence>
        {showScrollTop && (
          <div style={{ position: 'relative', pointerEvents: 'auto' }}>
            <AnimatePresence>
              {hoveredButton === 'top' && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  style={{
                    position: 'absolute',
                    right: '54px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#30283A',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid #49375F',
                  }}
                >
                  Lên đầu trang
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.6, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 15 }}
              whileHover={{ scale: 1.1, backgroundColor: '#49375F' }}
              whileTap={{ scale: 0.92 }}
              onMouseEnter={() => setHoveredButton('top')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={scrollToTop}
              aria-label="Lên đầu trang"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#594675',
                color: '#ffffff',
                border: '2px solid #EAE5F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(89, 70, 117, 0.28)',
                cursor: 'pointer',
              }}
            >
              <ArrowUp size={20} />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Support & Hotline shortcut button */}
      <div style={{ position: 'relative', pointerEvents: 'auto' }}>
        <AnimatePresence>
          {hoveredButton === 'support' && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              style={{
                position: 'absolute',
                right: '58px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#30283A',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid #49375F',
              }}
            >
              Hỗ trợ & Hotline 24/7
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08, backgroundColor: '#E78C6D' }}
          whileTap={{ scale: 0.92 }}
          onMouseEnter={() => setHoveredButton('support')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={onOpenSupport}
          aria-label="Trung tâm hỗ trợ"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#F2A184',
            color: '#30283A',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(242, 161, 132, 0.45)',
            cursor: 'pointer',
          }}
        >
          <Headphones size={22} />
        </motion.button>
      </div>
    </div>
  );
}
