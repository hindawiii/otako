-- Add is_read flag for messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (conversation_id, created_at);

-- Allow recipients (participants who are not the sender) to mark messages as read
DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.messages;
CREATE POLICY "Recipients can mark messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
  AND sender_id <> auth.uid()
)
WITH CHECK (
  public.is_conversation_participant(conversation_id, auth.uid())
  AND sender_id <> auth.uid()
);
