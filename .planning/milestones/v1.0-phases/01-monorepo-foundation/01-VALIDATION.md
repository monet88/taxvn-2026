---
phase: 01
slug: monorepo-foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `packages/tax-core/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @taxvn/tax-core test` |
| **Full suite command** | `pnpm --filter @taxvn/tax-core test` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @taxvn/tax-core test`
- **After every plan wave:** Run `pnpm --filter @taxvn/tax-core test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1.1 | 01 | 1 | FOUND-01 | build | `pnpm --filter @taxvn/tax-core build` | ✅ | ✅ green |
| 1.2 | 01 | 1 | FOUND-01 | build | `pnpm --filter @taxvn/tax-core build` | ✅ | ✅ green |
| 1.3 | 01 | 1 | FOUND-01 | build | `pnpm --filter @taxvn/tax-core build` | ✅ | ✅ green |
| 1.4 | 01 | 1 | FOUND-01 | build | `pnpm --filter @taxvn/tax-data build` | ✅ | ✅ green |
| 1.5 | 01 | 1 | FOUND-01 | build | `turbo run build --filter='./packages/*'` | ✅ | ✅ green |
| 2.1 | 02 | 2 | FOUND-02, FOUND-05, FOUND-07 | unit | `pnpm --filter @taxvn/tax-core test` | ✅ | ✅ green |
| 2.2 | 02 | 2 | FOUND-02 | unit | `pnpm --filter @taxvn/tax-core test` | ✅ | ✅ green |
| 2.3 | 02 | 2 | FOUND-02 | unit | `pnpm --filter @taxvn/tax-data build` | ✅ | ✅ green |
| 2.4 | 02 | 2 | FOUND-02 | unit | `pnpm --filter @taxvn/tax-core build` | ✅ | ✅ green |
| 3.1 | 03 | 2 | FOUND-04, FOUND-06 | unit | `regressionFOUND06.test.ts` | ✅ | ✅ green |
| 3.2 | 03 | 2 | FOUND-06 | unit | `regressionFOUND06.test.ts` | ✅ | ✅ green |
| 3.3 | 03 | 2 | FOUND-04 | unit | `bracketConsistency.test.ts` | ✅ | ✅ green |
| 4.1 | 04 | 3 | FOUND-03 | unit | `taxCalculator.test.ts` | ✅ | ✅ green |
| 4.2 | 04 | 3 | FOUND-03 | unit | `grossNetRoundTrip.test.ts` | ✅ | ✅ green |
| 4.3 | 04 | 3 | FOUND-03 | unit | `bracketConsistency.test.ts` | ✅ | ✅ green |
| 4.4 | 04 | 3 | FOUND-03 | unit | `pnpm --filter @taxvn/tax-core test` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Test Coverage Summary

| Category | Files | Tests |
|----------|-------|-------|
| Core tax (brackets, deductions, insurance) | 1 | 30 |
| GROSS↔NET round-trip | 1 | 14 |
| Bracket consistency | 1 | 7 |
| Domain calculators (29 modules) | 27 | 165 |
| Regression (FOUND-05/06/07) | 3 | 3 |
| **Total** | **32** | **219** |

---

## Requirement Coverage

| Requirement | Description | Tests | Status |
|-------------|-------------|-------|--------|
| FOUND-01 | Monorepo scaffold | build verification | ✅ COVERED |
| FOUND-02 | Extract modules | build + 29 calculator test files | ✅ COVERED |
| FOUND-03 | Golden-output 120+ tests | 219 tests across 32 files | ✅ COVERED |
| FOUND-04 | Bracket consistency fix | `bracketConsistency.test.ts` (7 tests) | ✅ COVERED |
| FOUND-05 | MAX_MONTHLY_INCOME relocate | `regressionFOUND05.test.ts` | ✅ COVERED |
| FOUND-06 | isSecondHalf2026 removal | `regressionFOUND06.test.ts` | ✅ COVERED |
| FOUND-07 | formatNumber import fix | `regressionFOUND07.test.ts` | ✅ COVERED |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Audit 2026-04-01

| Metric | Count |
|--------|-------|
| Gaps found | 13 |
| Resolved | 13 |
| Escalated | 0 |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 2s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-01
