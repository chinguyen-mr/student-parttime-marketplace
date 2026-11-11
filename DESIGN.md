# JobNest — Design System Specification

## Brand Identity: Soft Lavender & Peach
JobNest features an approachable, trustworthy, and modern aesthetic tailored for Vietnamese university students and professional employers. The visual identity relies on soothing pastel tones balanced with crisp typography and generous whitespace.

---

## 1. Color Palette Tokens

### Primary — Soft Lavender
- **Base Primary**: `#7565A8` (`var(--color-primary)`) — Used for primary buttons, active navigation states, primary branding, headers.
- **Primary Hover**: `#635394` (`var(--color-primary-hover)`) — Interactive hover state.
- **Lavender Accent**: `#A997C5` (`var(--color-lavender)`) — Secondary badges, tag backgrounds.
- **Lavender Light**: `#EEEAF7` (`var(--color-lavender-light)`) — Active item backgrounds, highlight borders.
- **Lavender Surface**: `#F3EFF9` (`var(--color-lavender-surface)`) — Subtle card tinted backgrounds.

### Secondary & Accent — Warm Peach
- **Base Accent**: `#F4B99D` (`var(--color-secondary)` / `var(--color-accent)`) — Accent badges, urgent indicators, high-contrast CTA accents.
- **Accent Hover**: `#E8A484` (`var(--color-accent-hover)`) — Darker peach for hover states.
- **Accent Background**: `#FDF1EA` (`var(--color-accent-bg)`) — Soft peach tint for notification banners, highlights, rating badges.

### Canvas & Surface
- **Canvas Background**: `#F8F7FB` (`var(--color-background)`) — Soft cream canvas background across all application views.
- **Card Surface**: `#FFFFFF` (`var(--color-surface)`) — Crisp white cards with rounded corners.
- **Border Default**: `#EAE7F0` (`var(--color-border)`) — Soft lavender-tinted borders.
- **Border Active/Hover**: `#D5CFE2` (`var(--color-border-hover)`).

### Typography & Neutrals
- **Text Main**: `#29263A` (`var(--color-text)`) — High-contrast dark eggplant for headings and body copy (WCAG AAA contrast).
- **Text Secondary**: `#777486` (`var(--color-text-secondary)`) — Muted slate purple for subtitles, metadata, timestamps.
- **Text Muted**: `#9C98AA` (`var(--color-text-muted)`) — Placeholders, disabled states.

---

## 2. Typography
- **Primary Typeface**: `Plus Jakarta Sans`, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
- **Scale**:
  - `Display / H1`: 32px / 2rem, Font Weight 800, tracking -0.02em.
  - `H2 / Section Title`: 24px / 1.5rem, Font Weight 700.
  - `H3 / Card Title`: 18px / 1.125rem, Font Weight 600.
  - `Body Regular`: 15px / 0.9375rem, Font Weight 400 or 500, leading relaxed.
  - `Caption / Metadata`: 13px / 0.8125rem, Font Weight 500.

---

## 3. UI Components & Layout Guidelines

- **Border Radius**:
  - Cards & Containers: `rounded-2xl` (16px) or `rounded-xl` (12px).
  - Buttons & Inputs: `rounded-xl` (12px) or `rounded-lg` (8px).
  - Badges & Pills: `rounded-full` (9999px).
- **Shadows & Elevation**:
  - `shadow-sm`: Subtle border reinforcement (`0 1px 2px 0 rgba(41, 38, 58, 0.05)`).
  - `shadow-md`: Hover elevation for job cards and modals (`0 4px 12px -2px rgba(117, 101, 168, 0.1)`).
- **Interactive Feedback**:
  - All interactive elements must declare `transition-all duration-200 ease-in-out`.
  - Focus rings: `focus:ring-2 focus:ring-[#7565A8]/30 focus:outline-none`.

---

## 4. State Representation Standards
- **Loading**: Skeleton placeholders mimicking actual content cards rather than generic spinning wheels.
- **Empty**: Contextual illustrations or icons with helpful Vietnamese copy ("Chưa có hồ sơ nào ứng tuyển", "Không tìm thấy công việc phù hợp") and clear recovery button.
- **Error**: Amber/Red alert banner with human-readable error explanation and retry trigger.
- **Success**: Soft emerald / peach confirmation toasts with automatic dismissal.

