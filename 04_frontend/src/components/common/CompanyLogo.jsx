import React, { useState, useEffect } from 'react';

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
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const [fallbackStep, setFallbackStep] = useState(0); // 0: primary, 1: gstatic, 2: unavatar, 3: initial
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || '');
    setFallbackStep(0);
    setIsLoaded(false);
  }, [src]);

  const domain = extractDomain(src);
  const initial = (alt || 'C').charAt(0).toUpperCase();

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
