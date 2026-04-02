---
phase: 4
slug: calculator-screens
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-01
reviewed_at: 2026-04-01T18:45:00+07:00
---

# Phase 4 — UI Design Contract

> Visual and interaction contract for the mobile calculator surface. Extends the Phase 3 shell contract without changing the established design system.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | custom components built on NativeWind primitives |
| Icon treatment | icon chip + text label, never icon-only for primary tool discovery |
| Font | system default (SF Pro iOS, Roboto Android) |

---

## Screen Shapes

### Tool Index Screens
- Single-column searchable card list
- Sticky page title + compact search field at the top
- Each tool card shows: icon, title, one-line description, requirement ID badge
- Do not use a dense 2-column phone grid for the 42-tool inventory

### Calculator Screens
- Primary hierarchy: title > main numeric input > result summary > supporting sections
- Inputs and results belong on the same scroll surface
- First meaningful result should appear inside the first viewport on common phone heights
- Secondary notes, assumptions, and law references can sit below the main result

### Comparison Screens
- Old vs new law or strategy deltas must be visually paired
- Positive savings states use accent color sparingly; avoid coloring the whole screen
- Comparison rows should favor stacked cards on small phones instead of squeezed side-by-side tables

### Reference Screens
- Read-only reference tools use section cards with strong headings and compact metadata chips
- Tables should collapse into stacked rows/cards on small widths rather than horizontal overflow where possible

---

## Spacing Scale

Declared values (inherit Phase 3; must stay multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Micro gaps, inline chips |
| sm | 8px | Input label spacing, helper text |
| md | 16px | Default card padding |
| lg | 24px | Section spacing |
| xl | 32px | Page padding / major separators |

Exceptions: touch targets remain minimum 44x44px.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Label | 14px | 400 | 1.4 |
| Body | 16px | 400 | 1.5 |
| Heading | 24px | 600 | 1.2 |
| Display | 32px | 600 | 1.1 |
| Numeric Result | 28px | 700 | 1.1 |

---

## Color

Use the same palette ratified in Phase 3:

| Role | Value | Usage |
|------|-------|-------|
| Background | #ffffff | Screen background |
| Surface | #f9fafb | Cards, grouped sections |
| Accent | #059669 | Primary CTA, active result emphasis |
| Destructive | #dc2626 | Delete, errors |
| Primary Text | #1a1a1a | Headlines and core content |
| Border | #e5e7eb | Separators, inputs, muted cards |

Accent rules:
- Reserve accent for the current focus or best outcome
- Do not tint every interactive row emerald
- Use neutral cards for most discovery surfaces

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Search placeholder | Tìm công cụ theo tên hoặc tác vụ |
| Draft badge | Bản nháp |
| Share CTA | Chia sẻ kết quả |
| Realtime helper | Kết quả cập nhật ngay khi bạn nhập |
| Empty search state | Không tìm thấy công cụ phù hợp |
| Empty search hint | Thử từ khóa khác hoặc mở rộng phạm vi tìm kiếm |

---

## Interaction Rules

- Numeric inputs should feel transactional and calm: no noisy animation on every keystroke
- Result transitions may fade or cross-dissolve, but avoid jumpy layout shifts
- Search filters update immediately as the user types
- Draft/restored state must be visibly acknowledged with a subtle badge or caption, not a modal

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-01
