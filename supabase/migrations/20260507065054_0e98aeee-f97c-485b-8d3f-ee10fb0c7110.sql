
-- 1) follows table
CREATE TABLE public.follows (
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows viewable by authenticated"
  ON public.follows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE TO authenticated
  USING (follower_id = auth.uid());

CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);

-- 2) profile metadata columns
ALTER TABLE public.profiles
  ADD COLUMN cover_url TEXT,
  ADD COLUMN years_watching INTEGER,
  ADD COLUMN watch_history TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN favorites TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN watchlist TEXT[] NOT NULL DEFAULT '{}';

-- 3) social validation helper
CREATE OR REPLACE FUNCTION public.is_socially_connected(_a UUID, _b UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.follows
    WHERE (follower_id = _a AND following_id = _b)
       OR (follower_id = _b AND following_id = _a)
  )
$$;

-- 4) update get_or_create_conversation to require social connection (or existing chat)
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(_other_user UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _me UUID := auth.uid();
  _conv UUID;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _me = _other_user THEN RAISE EXCEPTION 'Cannot start conversation with yourself'; END IF;

  SELECT cp1.conversation_id INTO _conv
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = _me AND cp2.user_id = _other_user
  LIMIT 1;

  IF _conv IS NOT NULL THEN
    RETURN _conv;
  END IF;

  IF NOT public.is_socially_connected(_me, _other_user) THEN
    RAISE EXCEPTION 'يجب أن تتابع هذا المستخدم أو يتابعك أولاً قبل بدء المحادثة';
  END IF;

  INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO _conv;
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (_conv, _me), (_conv, _other_user);
  RETURN _conv;
END;
$$;

-- 5) storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Cover images publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Users upload own cover"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own cover"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own cover"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6) realtime for profiles updates (avatar/level changes)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
