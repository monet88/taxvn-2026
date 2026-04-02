-- Thêm bảng user_settings để lưu cấu hình push
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_deadlines BOOLEAN NOT NULL DEFAULT true,
  notification_law_changes BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS cho user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Thêm device_id vào push_tokens để thay thế ràng buộc cũ (user_id, token) -> (user_id, device_id)
ALTER TABLE push_tokens ADD COLUMN device_id TEXT;
ALTER TABLE push_tokens DROP CONSTRAINT IF EXISTS push_tokens_user_id_token_key;
ALTER TABLE push_tokens ADD CONSTRAINT push_tokens_user_id_device_id_key UNIQUE(user_id, device_id);

-- Cập nhật trigger cho user_settings
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
