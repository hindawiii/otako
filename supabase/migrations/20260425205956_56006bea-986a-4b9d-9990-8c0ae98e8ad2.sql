-- Tighten conversations INSERT: disallow direct inserts; only the SECURITY DEFINER function can create them
DROP POLICY IF EXISTS "Authenticated can create conversations" ON public.conversations;

-- Tighten participants INSERT: disallow direct inserts; only the SECURITY DEFINER function can add them
DROP POLICY IF EXISTS "Users can add themselves or to new conversations" ON public.conversation_participants;