import React, { useState, useEffect } from 'react';
import { resolveFileUrl } from '../../config/api';

// Chỉ link web thật (http/https) hoặc file tải lên JobNest (/api/files/..) mới có ảnh;
// đường dẫn tương đối khác (vd "uploads/logos/x.png" không tồn tại) → dùng chữ cái đầu
const usableSrc = (src) => {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/')) return resolveFileUrl(src);
  return '';
};

// Chữ cái đại diện: bỏ các tiền tố loại hình doanh nghiệp ("Công ty Cổ phần ...")
const initialOf = (name) => {
  const cleaned = String(name || '')
    .replace(/^(công ty|cty|tập đoàn)\s+/i, '')
    .replace(/^(cổ phần|tnhh|trách nhiệm hữu hạn)\s+/i, '')
    .replace(/^(một thành viên|mtv)\s+/i, '')
    .trim();
  return (cleaned || name || 'C').charAt(0).toUpperCase();
};

// Extract domain from a URL string (e.g., "https://logo.clearbit.com/fpt.com.vn" -> "fpt.com.vn")
export function extractDomain(url) {
  if (!url) return '';
  try {
    return String(url)
      .replace(/^https?:\/\//, '')
      .replace(/^logo\.clearbit\.com\//, '')
      .split('/')[0]
      .split('?')[0]
      .trim();
  } catch {
    return '';
  }
}

/**
 * CompanyLogo component
 * Renders official brand logos with automatic multi-stage fallbacks:
 * 1. Primary: Direct URL from database (Clearbit API)
 * 2. Fallback 1: Google Favicon V2 API (high-resolution 128px official PNG)
 * 3. Fallback 2: Unavatar.io API
 * 4. Fallback 3: Stylized letter avatar with brand-tinted background
 */
export default function CompanyLogo({
  src,
  alt = 'Doanh nghiệp',
  size = 44,
  borderRadius = 10,
  style = {},
  className = '',
}) {
  const [currentSrc, setCurrentSrc] = useState(usableSrc(src));
  const [fallbackStep, setFallbackStep] = useState(0); // 0: primary, 1: gstatic, 2: unavatar, 3: initial
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(usableSrc(src));
    setFallbackStep(0);
    setIsLoaded(false);
  }, [src]);

  // Chỉ tra favicon theo tên miền với link web thật
  const domain = /^https?:\/\//i.test(src || '') ? extractDomain(src) : '';
  const initial = initialOf(alt);

  const handleImageError = () => {
    if (fallbackStep === 0 && domain) {
      // Step 1: Try Google's High-Resolution Favicon V2 API
      setFallbackStep(1);
      setCurrentSrc(`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`);
    } else if (fallbackStep === 1 && domain) {
      // Step 2: Try Unavatar.io
      setFallbackStep(2);
      setCurrentSrc(`https://unavatar.io/${domain}`);
    } else {
      // Step 3: Fall back to initial avatar
      setFallbackStep(3);
    }
  };

  // If no source or reached fallback initial
  if (!currentSrc || fallbackStep >= 3) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius,
          background: 'linear-gradient(135deg, #F4F1F8 0%, #EFEAF5 100%)',
          color: '#594675',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: Math.round(size * 0.42),
          border: '1px solid #EAE5F0',
          flexShrink: 0,
          userSelect: 'none',
          boxShadow: '0 1px 2px rgba(89, 70, 117, 0.05)',
          ...style,
        }}
        title={alt}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius,
        background: '#FFFFFF',
        border: '1px solid #EAE5F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(89, 70, 117, 0.06)',
        padding: 3,
        position: 'relative',
        ...style,
      }}
      title={alt}
    >
      <img
        src={currentSrc}
        alt={alt}
        onError={handleImageError}
        onLoad={() => setIsLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: Math.max(2, borderRadius - 2),
          opacity: isLoaded ? 1 : 0.85,
          transition: 'opacity 0.2s ease',
        }}
        loading="lazy"
      />
    </div>
  );
}
