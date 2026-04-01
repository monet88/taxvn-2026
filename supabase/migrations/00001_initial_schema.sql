-- ============================================================
-- TaxVN Backend Schema
-- Auth tables managed by Supabase Auth (auth.users, auth.sessions)
-- Custom tables below for app-specific data
-- ============================================================

-- Lịch sử tính thuế
CREATE TABLE calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  input_json JSONB NOT NULL,
  result_json JSONB NOT NULL,
  snapshot_version INTEGER NOT NULL DEFAULT 1,
  tax_core_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index cho truy vấn thường xuyên
CREATE INDEX idx_history_user_created ON calculation_history(user_id, created_at DESC);
CREATE INDEX idx_history_user_tool ON calculation_history(user_id, tool_name);

-- Chia sẻ kết quả tính thuế
CREATE TABLE share_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(8) NOT NULL UNIQUE,
  snapshot_json JSONB NOT NULL,
  snapshot_version INTEGER NOT NULL DEFAULT 1,
  tax_core_version TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_token ON share_snapshots(token);
CREATE INDEX idx_share_expires ON share_snapshots(expires_at);

-- Push notification tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Cấu hình app (version gate, feature flags)
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed version config
INSERT INTO app_config (key, value) VALUES
  ('version_gate', '{
    "minimumVersion": "0.1.0",
    "latestVersion": "0.1.0",
    "effectiveDate": "2026-01-01",
    "disabledCalculators": [],
    "updateUrl": {
      "ios": "https://apps.apple.com/app/taxvn/id000000000",
      "android": "https://play.google.com/store/apps/details?id=io.1devops.taxvn"
    }
  }'::jsonb);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE calculation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Calculation History: user chỉ thấy data của mình
CREATE POLICY "Users can insert own history"
  ON calculation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own history"
  ON calculation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON calculation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Share Snapshots: ai cũng đọc được (public read by token), chỉ auth user tạo được
CREATE POLICY "Anyone can read share by token"
  ON share_snapshots FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Authenticated users can create shares"
  ON share_snapshots FOR INSERT
  WITH CHECK (true);  -- Edge Function dùng service_role key

-- Push Tokens: user quản lý token của mình
CREATE POLICY "Users can manage own push tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- App Config: public read, no write (admin via dashboard)
CREATE POLICY "Anyone can read app config"
  ON app_config FOR SELECT
  USING (true);

-- ============================================================
-- Functions
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
