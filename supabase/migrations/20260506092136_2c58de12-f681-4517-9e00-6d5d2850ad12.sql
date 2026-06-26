ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS kept_in_profile boolean NOT NULL DEFAULT false;
CREATE POLICY "Kept stories viewable by authenticated"
  ON public.stories FOR SELECT TO authenticated
  USING (kept_in_profile = true);
CREATE POLICY "Users can update own stories keep flag"
  ON public.stories FOR UPDATE TO authenticated
  USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());