DROP POLICY IF EXISTS "Gift assets are publicly readable" ON storage.objects;
CREATE POLICY "Gift assets read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gift-assets');