-- Add PI and mentor email fields to proposals table
ALTER TABLE public.proposals
  ADD COLUMN pi_email TEXT,
  ADD COLUMN mentor_email TEXT;
