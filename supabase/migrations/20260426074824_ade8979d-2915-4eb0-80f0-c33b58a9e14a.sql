-- 1) Add points to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

-- 2) Enums
DO $$ BEGIN
  CREATE TYPE public.gift_rarity AS ENUM ('common','rare','epic','legendary','mythic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.gift_arc AS ENUM ('pirates','shinobi','dragons','luxury','attacks');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Gift catalog
CREATE TABLE IF NOT EXISTS public.gift_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  rarity public.gift_rarity NOT NULL DEFAULT 'common',
  arc public.gift_arc NOT NULL,
  price_points INTEGER NOT NULL DEFAULT 0,
  is_free_daily BOOLEAN NOT NULL DEFAULT false,
  vfx_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog viewable by authenticated"
  ON public.gift_catalog FOR SELECT TO authenticated USING (true);

-- 4) User inventory
CREATE TABLE IF NOT EXISTS public.user_gifts (
  user_id UUID NOT NULL,
  gift_id UUID NOT NULL REFERENCES public.gift_catalog(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, gift_id)
);
ALTER TABLE public.user_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own inventory"
  ON public.user_gifts FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 5) Daily claims tracking
CREATE TABLE IF NOT EXISTS public.daily_gift_claims (
  user_id UUID PRIMARY KEY,
  last_claim_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_gift_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own claims"
  ON public.daily_gift_claims FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 6) Gift transactions (sent in chats)
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  gift_id UUID NOT NULL REFERENCES public.gift_catalog(id),
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gift_tx_conv ON public.gift_transactions(conversation_id, created_at DESC);
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view gift transactions"
  ON public.gift_transactions FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));

-- 7) Add gift_id to messages for inline gift bubbles
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS gift_id UUID REFERENCES public.gift_catalog(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'text';

-- 8) Functions

-- Claim daily free gifts (5 random free gifts, once per 24h)
CREATE OR REPLACE FUNCTION public.claim_daily_gifts()
RETURNS TABLE(gift_id UUID, quantity INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _me UUID := auth.uid();
  _last TIMESTAMPTZ;
  _g RECORD;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT last_claim_at INTO _last FROM public.daily_gift_claims WHERE user_id = _me;
  IF _last IS NOT NULL AND _last > now() - INTERVAL '24 hours' THEN
    RAISE EXCEPTION 'Already claimed in last 24 hours';
  END IF;

  -- Pick 5 free gifts (random with repetition allowed)
  FOR _g IN
    SELECT id FROM public.gift_catalog WHERE is_free_daily = true ORDER BY random() LIMIT 5
  LOOP
    INSERT INTO public.user_gifts (user_id, gift_id, quantity)
    VALUES (_me, _g.id, 1)
    ON CONFLICT (user_id, gift_id) DO UPDATE SET quantity = public.user_gifts.quantity + 1, updated_at = now();
  END LOOP;

  INSERT INTO public.daily_gift_claims (user_id, last_claim_at) VALUES (_me, now())
    ON CONFLICT (user_id) DO UPDATE SET last_claim_at = now();

  RETURN QUERY SELECT ug.gift_id, ug.quantity FROM public.user_gifts ug WHERE ug.user_id = _me;
END; $$;

-- Add points (server-side; called when user watches an ad / interacts)
CREATE OR REPLACE FUNCTION public.add_points(_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _me UUID := auth.uid(); _new INTEGER;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount <= 0 OR _amount > 50 THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  UPDATE public.profiles SET points = points + _amount WHERE id = _me RETURNING points INTO _new;
  RETURN _new;
END; $$;

-- Purchase gift with points
CREATE OR REPLACE FUNCTION public.purchase_gift(_gift_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _me UUID := auth.uid(); _price INTEGER; _balance INTEGER;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT price_points INTO _price FROM public.gift_catalog WHERE id = _gift_id;
  IF _price IS NULL THEN RAISE EXCEPTION 'Gift not found'; END IF;
  IF _price <= 0 THEN RAISE EXCEPTION 'Gift not purchasable'; END IF;

  UPDATE public.profiles SET points = points - _price
    WHERE id = _me AND points >= _price RETURNING points INTO _balance;
  IF _balance IS NULL THEN RAISE EXCEPTION 'Not enough points'; END IF;

  INSERT INTO public.user_gifts (user_id, gift_id, quantity) VALUES (_me, _gift_id, 1)
    ON CONFLICT (user_id, gift_id) DO UPDATE SET quantity = public.user_gifts.quantity + 1, updated_at = now();
  RETURN _balance;
END; $$;

-- Send gift inside a conversation
CREATE OR REPLACE FUNCTION public.send_gift(_conversation_id UUID, _gift_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _me UUID := auth.uid();
  _recipient UUID;
  _qty INTEGER;
  _gift_name TEXT;
  _msg_id UUID;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_conversation_participant(_conversation_id, _me) THEN
    RAISE EXCEPTION 'Not a participant';
  END IF;

  SELECT user_id INTO _recipient FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND user_id <> _me LIMIT 1;
  IF _recipient IS NULL THEN RAISE EXCEPTION 'No recipient'; END IF;

  SELECT name INTO _gift_name FROM public.gift_catalog WHERE id = _gift_id;
  IF _gift_name IS NULL THEN RAISE EXCEPTION 'Gift not found'; END IF;

  UPDATE public.user_gifts SET quantity = quantity - 1, updated_at = now()
    WHERE user_id = _me AND gift_id = _gift_id AND quantity > 0
    RETURNING quantity INTO _qty;
  IF _qty IS NULL THEN RAISE EXCEPTION 'You do not own this gift'; END IF;

  INSERT INTO public.messages (conversation_id, sender_id, content, kind, gift_id)
    VALUES (_conversation_id, _me, '🎁 ' || _gift_name, 'gift', _gift_id)
    RETURNING id INTO _msg_id;

  INSERT INTO public.gift_transactions (conversation_id, sender_id, recipient_id, gift_id, message_id)
    VALUES (_conversation_id, _me, _recipient, _gift_id, _msg_id);

  RETURN _msg_id;
END; $$;

-- Bump conversation trigger (already exists for messages); ensure messages trigger present
DROP TRIGGER IF EXISTS trg_bump_conv ON public.messages;
CREATE TRIGGER trg_bump_conv AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_last_message();

-- Realtime
ALTER TABLE public.user_gifts REPLICA IDENTITY FULL;
ALTER TABLE public.gift_transactions REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_gifts;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_transactions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;