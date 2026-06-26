-- Resource type for reports
DO $$ BEGIN
  CREATE TYPE public.report_resource AS ENUM ('post', 'comment', 'voice_comment', 'audio_room');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.report_reason AS ENUM ('abuse', 'inappropriate', 'spam', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_profile_id UUID,
  resource_type public.report_resource NOT NULL,
  resource_id UUID NOT NULL,
  reason public.report_reason NOT NULL,
  reason_ar TEXT NOT NULL,
  description_ar TEXT,
  status public.report_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_resource ON public.reports(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reports"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- Comment reactions table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);

ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions viewable by authenticated"
  ON public.comment_reactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can react"
  ON public.comment_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unreact own"
  ON public.comment_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Allow authors to UPDATE their own text comments (for edit feature)
CREATE POLICY "Users can update own text comments"
  ON public.post_comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND audio_url IS NULL)
  WITH CHECK (user_id = auth.uid() AND audio_url IS NULL);