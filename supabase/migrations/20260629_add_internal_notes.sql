-- Add internal notes column to submissions table
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/waawddubgwkxokqxmtak/sql
-- Run AFTER 20260628_create_submissions.sql

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;
