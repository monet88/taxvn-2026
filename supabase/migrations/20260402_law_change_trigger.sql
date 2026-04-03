-- Create tax_law_history if it doesn't exist
CREATE TABLE IF NOT EXISTS tax_law_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    effective_date DATE NOT NULL,
    url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: RLS policies might be needed later, but only admins should insert here.
ALTER TABLE tax_law_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tax_law_history" 
    ON tax_law_history FOR SELECT 
    USING (true);

-- Create a function that triggers Webhook to Supabase Edge Function
CREATE OR REPLACE FUNCTION trigger_law_change_push()
RETURNS trigger AS $$
DECLARE
  url_str TEXT;
BEGIN
  -- We assume SUPABASE_URL is accessible or we hardcode the edge function endpoint
  -- Typically done via pg_net extension in Supabase
  -- If pg_net is available:
  -- PERFORM net.http_post(
  --     url := 'http://functions:9000/send_law_change_push',
  --     body := json_build_object('title', NEW.title, 'body', NEW.description, 'url', NEW.url)::jsonb,
  --     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  -- );

  -- Since we're writing a simple trigger concept:
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_tax_law_history_insert
  AFTER INSERT ON tax_law_history
  FOR EACH ROW
  EXECUTE FUNCTION trigger_law_change_push();
