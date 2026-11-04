# Design Context: Nền tảng Freelance / Marketplace Việc làm Part-time Sinh viên

## 1. Project Overview
- **Name:** Student Part-time & Freelance Marketplace (Chuyên đề tốt nghiệp 2 - VLU)
- **Domain:** Two-sided labor marketplace connecting university students with vetted part-time and freelance job opportunities.
- **Tech Stack:** React 19 + Tailwind CSS + Vite (Frontend), Node.js Express 3-Tier (Backend), PostgreSQL 18 (Database).

## 2. Target Audience & Mental Models
- **Sinh viên (Students):** Needs immediate clarity on hourly wage (VNĐ/giờ), shift hours, exact location (Quận 1, Bình Thạnh, Gò Vấp...), and simple 1-click application. Highly sensitive to fake or scam listings.
- **Nhà tuyển dụng (Employers):** Needs compact, efficient candidate review (Cover letter, CV link, skills, university), quick status switching (`ACCEPTED` / `REJECTED`), and job progress tracking.
- **Quản trị viên (Admin):** Needs high-density table views for moderation and verified user oversight.

## 3. Brand Personality & Tone
- **Keywords:** Trustworthy, Collegiate, Crisp, Pragmatic, High-contrast, Fast.
- **Benchmark Inspiration:** Linear, Stripe Dashboard, GitHub Jobs, Raycast.
- **Anti-Slop Posture:** No generic SaaS purple/magenta gradients, no floating glassmorphism, no bloated card padding, no fake marketing buzzwords.

## 4. Visual Design System Tokens
- **Colors:**
  - Background: `bg-slate-50` (#f8fafc), Panels: `bg-white` (#ffffff)
  - Text: Primary `text-slate-900` (#0f172a), Secondary `text-slate-600` (#475569), Muted `text-slate-400` (#94a3b8)
  - Borders: Crisp 1px `border-slate-200` (#e2e8f0), Hover `border-slate-300` (#cbd5e1)
  - Primary Action: `bg-blue-600 hover:bg-blue-700 text-white`
  - Accent / Wage Badge: `bg-amber-50 text-amber-700 border-amber-200`
  - Success Badge: `bg-emerald-50 text-emerald-700 border-emerald-200`
- **Border Radius:**
  - Badges & Buttons: `rounded-md` (6px) or `rounded-lg` (8px)
  - Cards & Modals: `rounded-xl` (12px max). Never `rounded-3xl` or pills.
- **Spacing:**
  - Strict 4/8/12/16/24/32px scale.
- **Shadows:**
  - Subtle only: `shadow-xs` / `shadow-sm` (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`). No 24px blurred dropshadows.

## 5. Required UI States
Every screen must handle:
- Skeletons for Loading (never bare spinners).
- Actionable Empty States with CTA.
- Clear error banner with retry.
- Standard focus ring for keyboard navigation (`focus-visible:ring-2 focus-visible:ring-blue-500`).
