# External Integrations

**Analysis Date:** 2026-03-31

## APIs & External Services

**Analytics:**
- Google Analytics 4 (GA4) - Tracks user behavior and page views
  - Measurement ID: `G-E2MGYR8HY4` (hardcoded in `src/app/layout.tsx` line 8)
  - Loaded via `next/script` with `afterInteractive` strategy
  - DNS prefetch configured for `www.googletagmanager.com` and `www.google-analytics.com`
  - No GA4 env var — ID is hardcoded directly in `layout.tsx`

**Fonts:**
- Google Fonts CDN - Serves Inter font with `latin` and `vietnamese` subsets
  - Loaded via Next.js `next/font/google` built-in integration in `src/app/layout.tsx`
  - Preconnect hints to `https://fonts.googleapis.com` and `https://fonts.gstatic.com`

## Data Storage

**Databases:**
- None — this is a fully client-side static app with no backend database

**Browser Storage (localStorage):**
- `tax-calculator-saves` - Named calculator saves (snapshots), max 50 entries
  - Implementation: `src/lib/snapshotStorage.ts`
- `tax-calculator-history` - Legacy key (migrated away, only read during one-time migration)
- `tax-calculator-migrated-v2` - Migration flag to prevent re-migration

**File Storage:**
- Local filesystem only — PDF and CSV exports are generated client-side and downloaded as files via `src/lib/exportUtils.ts`

**Caching:**
- Service Worker cache (`public/sw.js`) — three named caches:
  - `thue-2026-static-v1` — pre-cached static assets (HTML, JS, CSS, icons)
  - `thue-2026-dynamic-v1` — dynamically cached pages (network-first strategy)
  - `thue-2026-v1` — general cache
- Cache-first strategy for static assets (`.js`, `.css`, fonts, images)
- Network-first strategy for HTML pages
- PWA managed via `src/lib/pwaUtils.ts` and `src/components/ui/PWAProvider.tsx`

## Authentication & Identity

**Auth Provider:**
- None — no authentication exists. The app is fully public and requires no login.

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or similar error tracking service integrated

**Logs:**
- Browser `console.error` / `console.log` only
- Service worker logs prefixed with `[SW]`, PWA utility logs prefixed with `[PWA]`
- No server-side logging (static app)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages at `thue.1devops.io` (CNAME: `public/CNAME`)
- Static files served from the `out/` directory produced by `next build`

**Build Pipeline:**
- Docker-based build via `build.sh` + `Dockerfile`
  - Builder stage: `node:22-alpine`
  - Output stage: `alpine:latest` (copies static files to `/output`)
- No GitHub Actions workflow detected in repo (referenced in `build.sh` comments but `.github/` not present)

## Environment Configuration

**Required env vars:**
- None are strictly required — all defaults are hardcoded

**Optional env vars:**
- `NEXT_PUBLIC_BASE_PATH` - Base path for subdirectory deployments (defaults to `''`)
- `NEXT_PUBLIC_ENABLE_SW` - Set to `'true'` to enable service worker outside production

**Secrets location:**
- No secrets managed in this repo. GA4 measurement ID is public-safe (client-side analytics ID).

## Webhooks & Callbacks

**Incoming:**
- None — static site has no API routes or webhook endpoints

**Outgoing:**
- None — the app makes no outbound HTTP requests at runtime (all calculations are local)

## URL Sharing

**Mechanism:**
- Calculator state is serialized to URL hash fragments using `src/lib/snapshotCodec.ts`
- Encoding pipeline: JSON → LZ-String compression → Base64 URI-safe string
- Format: `https://thue.1devops.io/tinh-thue/#<tab>~<encoded-state>`
- QR codes generated client-side via `qrcode.react` in `src/components/SaveShare/QRCodeModal.tsx`
- No server involved — share links are fully self-contained

## Schema.org Structured Data

**Inline JSON-LD in `src/app/layout.tsx`:**
- `WebApplication` schema (finance app, free, Vietnamese)
- `Organization` schema (1DevOps)
- `FAQPage` schema (6 tax-related Q&A entries)
- Purpose: SEO enrichment only, no runtime API usage

---

*Integration audit: 2026-03-31*
