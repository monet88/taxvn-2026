# Milestones

## 1.0 v1.0 MVP (Shipped: 2026-04-02)

**Phases completed:** 8 phases, 24 plans, 32 tasks

**Key accomplishments:**

- pnpm monorepo with Turborepo orchestration and 3 shared packages (tax-core, tax-data, config)
- 30 pure calculator modules extracted to @taxvn/tax-core, 6 reference data modules to @taxvn/tax-data, with non-pure imports fixed
- Removed deprecated isSecondHalf2026 flag from all 7+ files — Law 109/2025/QH15 deductions apply uniformly from 01/01/2026
- 127 deterministic tests across 19 files validating all 30+ tax calculators — GROSS↔NET round-trip, bracket consistency, and interface contract verification
- Supabase project initialized with 4-table PostgreSQL schema (calculation_history, share_snapshots, push_tokens, app_config), RLS policies, and typed @taxvn/supabase client package

---
