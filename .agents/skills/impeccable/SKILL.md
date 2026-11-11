---
name: impeccable
description: "Professional UI/UX craft, critique, audit, and design refinement framework created by Paul Bakaus (https://github.com/pbakaus/impeccable). Enforces deliberate frontend design, eliminates generic AI visual slop, and respects established project design systems."
---

# Impeccable — Deliberate AI Frontend Design Framework

Official Repository: [https://github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable)  
Author: Paul Bakaus  
Standard: Agent Skills Specification / Claude Code & Cursor Compatibility

## Overview
Impeccable is a specialized design vocabulary and auditing engine that bridges high-level design taste and AI coding assistants. It prevents agents from defaulting to generic AI templates ("AI slop" like repetitive blue/purple gradients, monotonous Inter-only card layouts, and arbitrary padding) while guaranteeing strict adherence to the project's brand design system.

---

## Core Principles

1. **Context First**: Always consult `PRODUCT.md` (product mission, target audience, business constraints) and `DESIGN.md` (color tokens, typography scales, spacing units, elevation rules) before creating or modifying UI components.
2. **Preserve Established Identity**: In JobNest, the primary identity is **Soft Lavender (`#7565A8`)** and **Peach (`#F4B99D`)**. Never replace these with arbitrary AI palette defaults.
3. **Intentional Hierarchy**: Every screen must have a clear primary action, logical reading flow, and unambiguous visual contrast.
4. **Resilient States**: Components must explicitly handle 4 fundamental states:
   - *Loading* (skeleton screens or subtle spinners)
   - *Empty* (helpful illustrations, clear guidance, and call-to-action)
   - *Error* (actionable feedback and retry options)
   - *Success* (affirmative visual confirmations)
5. **Accessibility & Responsive**: Minimum 44x44px touch targets on mobile, WCAG AA 4.5:1 contrast ratio for normal text, and seamless breakpoints (`sm:`, `md:`, `lg:`, `xl:`).

---

## Slash Commands & Workflows

### 1. `/impeccable craft [target]`
Plans and implements a new screen or component with deliberate layout, interaction states, and atomic component composition.

### 2. `/impeccable critique [target]`
Conducts a comprehensive UX review evaluating:
- Visual hierarchy and information architecture.
- Typography scale consistency and vertical rhythm.
- Spacing consistency (Tailwind 4px grid: `p-2`, `p-4`, `p-6`, `gap-3`).
- Clarity of CTAs and cognitive load.

### 3. `/impeccable audit [target]`
Technical frontend audit checking:
- Color contrast (WCAG AA).
- Responsive behavior across mobile (375px), tablet (768px), and desktop (1280px).
- HTML semantic markup (`<nav>`, `<main>`, `<article>`, `<button>` vs `<a>`).
- Performance and bundle cleanliness (no redundant icon packages, clean hooks).

### 4. `/impeccable polish [target]`
Performs a high-craft refinement pass:
- Micro-interactions, transitions, and hover states (`transition-all duration-200 ease-in-out`).
- Border subtleties (`border-slate-200/80` or `border-lavender-100`).
- Elevation and drop-shadow calibration (`shadow-sm`, `shadow-md` with lavender/peach tints).

### 5. `/impeccable harden [target]`
Ensures edge-case resilience:
- Long string overflows (`truncate`, `line-clamp-2`, `break-words`).
- Empty datasets and null safety.
- Form validation feedback and focus traps.

### 6. `/impeccable bolder` / `/impeccable quieter`
Aesthetic dial adjustment:
- **bolder**: Increases visual impact, contrast, and distinct accent accents.
- **quieter**: Softens borders, reduces background contrast, and cleans up visual clutter.

---

## Integration with JobNest
When modifying or reviewing JobNest frontend:
- Verify components in `04_frontend/src/components/`.
- Ensure routes in `04_frontend/src/App.jsx` render correctly for Student, Employer, and Admin.
- Never duplicate existing components (`JobCard.jsx`, `Modal.jsx`, `Badge.jsx`). Reuse and extend.

