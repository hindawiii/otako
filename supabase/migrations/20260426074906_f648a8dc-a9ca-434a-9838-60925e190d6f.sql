INSERT INTO storage.buckets (id, name, public) VALUES ('gift-assets', 'gift-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Gift assets are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gift-assets');