-- Kalponeek writer submission portal
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/waawddubgwkxokqxmtak/sql

CREATE TABLE IF NOT EXISTS submissions (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number TEXT        UNIQUE NOT NULL,
  full_name        TEXT        NOT NULL,
  email            TEXT        NOT NULL,
  bio              TEXT        NOT NULL,
  story_title      TEXT        NOT NULL,
  genre            TEXT        NOT NULL CHECK (genre IN ('Fiction','Poetry','Essay','Translation','Interview','Culture')),
  content_rating   TEXT        NOT NULL CHECK (content_rating IN ('All readers','15+','18+')),
  cover_letter     TEXT,
  piece            TEXT        NOT NULL,
  previously_published BOOLEAN NOT NULL DEFAULT false,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','under review','accepted','rejected')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous) can insert a new submission
CREATE POLICY "Anyone can submit"
  ON submissions
  FOR INSERT
  WITH CHECK (true);

-- The server (service role) bypasses RLS for status lookups.
-- If you ever query directly with the anon key, enable this:
-- CREATE POLICY "Writers can check own status"
--   ON submissions
--   FOR SELECT
--   USING (true);

-- Index for fast status lookups
CREATE INDEX IF NOT EXISTS submissions_email_ref_idx
  ON submissions (email, reference_number);
