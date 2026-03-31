# Technology Stack

**Analysis Date:** 2026-03-31

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code in `src/` (`.ts`, `.tsx`)

**Secondary:**
- JavaScript - Config files only: `next.config.js`, `postcss.config.js`, `scripts/generate-icons.mjs`
- CSS - Global styles at `src/app/globals.css` (Tailwind directives + custom utilities)

## Runtime

**Environment:**
- Node.js 22.x (LTS) - Confirmed via Dockerfile `node:22-alpine` and local `v22.22.0`

**Package Manager:**
- npm 11.7.0
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.0.10 - App Router, configured as `output: 'export'` (static site generation only)
- React 19.2.3 - UI rendering, JSX transform (`react-jsx`)
- Tailwind CSS 3.4.19 - Utility-first CSS, heavily customized in `tailwind.config.ts`

**Testing:**
- Playwright 1.57.0 - End-to-end testing (`@playwright/test` 1.57.0)
- No unit test framework detected (no Jest, Vitest)

**Build/Dev:**
- PostCSS 8.5.6 - CSS processing via `postcss.config.js`
- Autoprefixer 10.4.22 - CSS vendor prefixes
- Docker + Alpine - Build pipeline via `Dockerfile` and `build.sh`

## Key Dependencies

**Critical:**
- `recharts` 2.15.4 - All chart/data visualization components (tax brackets, income waterfall, salary comparison). Used in `src/components/TaxChart.tsx`, `src/components/IncomeWaterfallChart.tsx`, `src/components/MortgageCalculator/MortgageChart.tsx`, `src/components/MonthlyPlanner/MonthlyPlanner.tsx`
- `lz-string` 1.5.0 - URL state compression for shareable calculator links. Core to `src/lib/snapshotCodec.ts`
- `jspdf` 3.0.4 - PDF generation for tax reports. Used in `src/lib/exportUtils.ts`
- `html2canvas` 1.4.1 - HTML-to-canvas for PDF export. Used in `src/lib/exportUtils.ts`
- `qrcode.react` 4.2.0 - QR code generation for share URLs. Used in `src/components/SaveShare/QRCodeModal.tsx`

**Infrastructure:**
- `next/font/google` - Inter font loaded with Vietnamese subset via Google Fonts CDN (no separate package, built into Next.js)

## Configuration

**Environment:**
- `NEXT_PUBLIC_BASE_PATH` - Optional base path for deployment subdirectories (used in `next.config.js`)
- `NEXT_PUBLIC_ENABLE_SW` - Set to `'true'` to enable service worker in non-production environments (checked in `src/components/ui/PWAProvider.tsx`)
- No `.env` files detected in repo; no other `process.env` references found

**Build:**
- `next.config.js` - Static export mode, trailing slashes, unoptimized images
- `tsconfig.json` - Strict mode, ES2017 target, `@/*` path alias mapping to `./src/*`, bundler module resolution
- `tailwind.config.ts` - Extended theme with full custom color palette, spacing, animations, shadows, and typography
- `postcss.config.js` - Tailwind + Autoprefixer only

## Platform Requirements

**Development:**
- Node.js 22.x
- npm (no pnpm or yarn lockfiles present)

**Production:**
- Pure static site — Next.js `output: 'export'` generates HTML/CSS/JS files to `out/` directory
- No server-side runtime required
- Deployed to `thue.1devops.io` (GitHub Pages via CNAME file at `public/CNAME`)
- Docker used only for reproducible builds (`build.sh` + `Dockerfile`), not for serving

---

*Stack analysis: 2026-03-31*
