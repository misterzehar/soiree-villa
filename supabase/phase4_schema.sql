-- ============================================================
-- Phase 4 — Messagerie (chat de groupe par soirée)
-- ============================================================

-- 1 conversation par experience (créée à la demande)
CREATE TABLE conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (experience_id)
);

-- Messages (texte et/ou photo, soft-delete)
CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES auth.users(id),
  content         text,
  photo_url       text,
  deleted_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  CONSTRAINT content_or_photo CHECK (content IS NOT NULL OR photo_url IS NOT NULL)
);

-- Activer le suivi complet pour Supabase Realtime
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Curseur de lecture par utilisateur par conversation
CREATE TABLE message_reads (
  user_id         uuid REFERENCES auth.users(id)     ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id)  ON DELETE CASCADE,
  last_read_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, conversation_id)
);

-- Signalements (organisateur ou participant)
CREATE TABLE reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      uuid NOT NULL REFERENCES auth.users(id),
  reported_user_id uuid NOT NULL REFERENCES auth.users(id),
  conversation_id  uuid NOT NULL REFERENCES conversations(id),
  reason           text NOT NULL,
  created_at       timestamptz DEFAULT now()
);

-- ─── Storage bucket : chat-photos ──────────────────────────────
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'chat-photos', 'chat-photos', true,
  ARRAY['image/jpeg','image/png','image/webp','image/gif'],
  5242880
)
ON CONFLICT DO NOTHING;

CREATE POLICY "chat-photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-photos');

CREATE POLICY "chat-photos auth upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ─── Fonctions helper ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION user_can_access_conversation(conv_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversations c
    JOIN experiences e ON e.id = c.experience_id
    JOIN organizers o ON o.id = e.organizer_id
    WHERE c.id = conv_id AND o.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM conversations c
    JOIN experiences e ON e.id = c.experience_id
    JOIN registrations r ON r.experience_id = e.id
    WHERE c.id = conv_id
      AND r.participant_email = auth.email()
      AND r.payment_status = 'paid'
  )
$$;

CREATE OR REPLACE FUNCTION user_is_organizer_of_conversation(conv_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversations c
    JOIN experiences e ON e.id = c.experience_id
    JOIN organizers o ON o.id = e.organizer_id
    WHERE c.id = conv_id AND o.user_id = auth.uid()
  )
$$;

-- ─── RLS : conversations ───────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_select" ON conversations FOR SELECT
USING (user_can_access_conversation(id));

CREATE POLICY "conv_insert" ON conversations FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM experiences e
    JOIN organizers o ON o.id = e.organizer_id
    WHERE e.id = experience_id AND o.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM experiences e
    JOIN registrations r ON r.experience_id = e.id
    WHERE e.id = experience_id
      AND r.participant_email = auth.email()
      AND r.payment_status = 'paid'
  )
);

-- ─── RLS : messages ────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "msg_select" ON messages FOR SELECT
USING (user_can_access_conversation(conversation_id));

CREATE POLICY "msg_insert" ON messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND user_can_access_conversation(conversation_id)
  AND EXISTS (
    SELECT 1
    FROM conversations c
    JOIN experiences e ON e.id = c.experience_id
    WHERE c.id = conversation_id
      AND e.date > now() - interval '30 days'
  )
);

-- Seul l'organisateur peut soft-delete (poser deleted_at)
CREATE POLICY "msg_update_organizer" ON messages FOR UPDATE TO authenticated
USING (user_is_organizer_of_conversation(conversation_id))
WITH CHECK (user_is_organizer_of_conversation(conversation_id));

-- ─── RLS : message_reads ──────────────────────────────────────
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reads_select_own" ON message_reads FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "reads_insert_own" ON message_reads FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "reads_update_own" ON message_reads FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- ─── RLS : reports ─────────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_auth" ON reports FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_select_own" ON reports FOR SELECT
USING (reporter_id = auth.uid());
