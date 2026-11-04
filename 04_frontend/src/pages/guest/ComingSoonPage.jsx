import React from 'react';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function ComingSoonPage({
  title = 'Tính năng mới',
  description = 'Chúng tôi đang hoàn thiện tính năng này để mang đến trải nghiệm tốt hơn cho bạn.',
  onGoHome,
  onBack,
  prevTabLabel = 'trang trước',
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: '#140B1E',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top Left Floating Back Button to where user came from */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 24,
            left: 28,
            zIndex: 100,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
        >
          <ArrowLeft size={16} />
          <span>Trở về {prevTabLabel}</span>
        </button>
      )}

      {/* ===================================================================== */}
      {/* 1. FULL-SCREEN BACKGROUND SVG: PEELED PAPER ARTWORK                   */}
      {/* (Inspired directly by the reference image: Left dark, Right peeled)  */}
      {/* ===================================================================== */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 1,
        }}
      >
        <defs>
          {/* Deep Plum & Charcoal Dark Gradient for Left Background */}
          <linearGradient id="fullBgDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#12081A" />
            <stop offset="40%" stopColor="#1F122F" />
            <stop offset="70%" stopColor="#2A173E" />
            <stop offset="100%" stopColor="#140A20" />
          </linearGradient>

          {/* Diagonal Lighting Beams */}
          <linearGradient id="beamA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(89, 70, 117, 0.4)" />
            <stop offset="60%" stopColor="rgba(242, 161, 132, 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id="beamB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(89, 70, 117, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* White / Ivory Paper Sheet Gradient */}
          <linearGradient id="paperWhite" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E2DCE8" />
            <stop offset="12%" stopColor="#F7F5FA" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Cast Shadow under the curl roll */}
          <linearGradient id="curlCastShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 0, 0, 0.85)" />
            <stop offset="50%" stopColor="rgba(14, 7, 24, 0.5)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* 3D Cylindrical Curl Roll Lighting */}
          <linearGradient id="curlRollSurface" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7E7092" />
            <stop offset="20%" stopColor="#BDB1CD" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="75%" stopColor="#DDD5E8" />
            <stop offset="100%" stopColor="#F6F3F9" />
          </linearGradient>
        </defs>

        {/* Base dark canvas */}
        <rect width="1440" height="900" fill="url(#fullBgDark)" />

        {/* Diagonal facets on dark surface */}
        <polygon points="0,0 450,0 200,900 0,900" fill="url(#beamA)" />
        <polygon points="250,0 620,0 380,900 10,900" fill="url(#beamB)" />

        {/* Ambient Drop Shadow beneath the peel */}
        <path
          d="M 820,0 Q 600,480 440,900 L 1440,900 L 1440,0 Z"
          fill="url(#curlCastShadow)"
          opacity="0.95"
        />

        {/* The White Paper Sheet on the Right */}
        <path
          d="M 850,0 Q 630,480 470,900 L 1440,900 L 1440,0 Z"
          fill="url(#paperWhite)"
        />

        {/* The 3D Curled Roll (Tấm giấy cuộn lật 3D) */}
        <path
          d="M 850,0 Q 630,480 470,900 C 410,900 370,820 400,730 Q 590,340 790,0 Z"
          fill="url(#curlRollSurface)"
        />

        {/* Bottom curl lip / rolled underside */}
        <path
          d="M 470,900 C 410,900 370,820 400,730 C 430,680 490,730 515,815 C 530,865 505,900 470,900 Z"
          fill="#211432"
          opacity="0.88"
        />

        {/* Curled Spine Highlight */}
        <path
          d="M 810,0 Q 600,420 440,840"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Crease shadow edge */}
        <path
          d="M 850,0 Q 630,480 470,900"
          stroke="rgba(34, 24, 51, 0.3)"
          strokeWidth="3"
          fill="none"
        />
      </svg>

      {/* ===================================================================== */}
      {/* 2. TOP CORNER BRANDING: LOGO JOBNEST                                  */}
      {/* ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          left: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 10,
        }}
      >
        <img
          src="/logo.jpg"
          alt="JobNest Logo"
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            objectFit: 'contain',
            background: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
          }}
        />
        <div>
          <div style={{ fontSize: 19, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            JobNest
          </div>
          <div style={{ fontSize: 12, color: '#A997C5', fontWeight: 600 }}>
            Nền tảng Việc làm Sinh viên
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. CONTENT ON THE REVEALED WHITE PAPER SECTION (Right side)           */}
      {/* ===================================================================== */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1440,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          zIndex: 10,
          boxSizing: 'border-box',
          padding: '40px 48px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: 580,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            boxSizing: 'border-box',
          }}
        >
          {/* Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(89, 70, 117, 0.08)',
              border: '1px solid rgba(89, 70, 117, 0.2)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              color: '#594675',
              marginBottom: 16,
            }}
          >
            <Sparkles size={14} color="#F2A184" />
            <span>Chức năng đang hoàn thiện</span>
          </div>

          {/* COMING SOON Heading (Bold & Impactful) */}
          <h1
            style={{
              fontSize: 'clamp(44px, 6vw, 76px)',
              fontWeight: 900,
              lineHeight: 0.94,
              color: '#221833',
              letterSpacing: '-0.04em',
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              textShadow: '0 2px 6px rgba(34, 24, 51, 0.1)',
            }}
          >
            COMING
            <br />
            SOON
          </h1>

          {/* STAY TUNED Subtitle */}
          <div
            style={{
              fontSize: 'clamp(15px, 2vw, 22px)',
              fontWeight: 800,
              color: '#594675',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            STAY TUNED
          </div>

          {/* Peach Accent Bar */}
          <div
            style={{
              width: 64,
              height: 4,
              backgroundColor: '#F2A184',
              borderRadius: 2,
              marginBottom: 20,
            }}
          />

          {/* Feature Focus Pill */}
          <div
            style={{
              display: 'inline-block',
              fontSize: 15,
              fontWeight: 800,
              color: '#30283A',
              backgroundColor: '#F9E5DC',
              border: '1.5px solid #F2A184',
              padding: '8px 18px',
              borderRadius: 10,
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(242, 161, 132, 0.25)',
              maxWidth: '100%',
              lineHeight: 1.4,
            }}
          >
            ✨ {title}
          </div>

          {/* Friendly Vietnamese Explanation */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: '#52495E',
              fontWeight: 500,
              margin: '0 0 8px 0',
              maxWidth: 480,
            }}
          >
            {description}
          </p>

          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.6,
              color: '#777080',
              margin: '0 0 32px 0',
              maxWidth: 460,
            }}
          >
            JobNest đang chuẩn bị những điều thú vị để mang đến trải nghiệm tốt nhất cho bạn. Hãy quay lại trong thời gian tới nhé!
          </p>

          {/* DUAL ACTION BUTTONS: QUAY LẠI NƠI ĐÃ BẤM & VỀ TRANG CHỦ */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.03, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'linear-gradient(135deg, #594675 0%, #49375F 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 26px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(89, 70, 117, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                <ArrowLeft size={19} />
                <span>Quay lại {prevTabLabel}</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onGoHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: onBack ? '#FFFFFF' : 'linear-gradient(135deg, #594675 0%, #49375F 100%)',
                color: onBack ? '#221833' : '#FFFFFF',
                border: onBack ? '1.5px solid #D1D5DB' : 'none',
                borderRadius: 12,
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: onBack ? '0 2px 8px rgba(0,0,0,0.06)' : '0 8px 24px rgba(89, 70, 117, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <Home size={19} />
              <span>Về trang chủ</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ===================================================================== */}
      {/* 4. DISCREET COPYRIGHT ON THE DARK SECTION (Bottom Left)              */}
      {/* ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 40,
          zIndex: 10,
          fontSize: 12,
          color: '#7A6E8B',
        }}
      >
        <span>&copy; 2026 JobNest. All rights reserved. • Trường Đại học Văn Lang</span>
      </div>
    </div>
  );
}
