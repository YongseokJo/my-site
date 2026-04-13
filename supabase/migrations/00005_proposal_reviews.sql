-- Add review_comment and reviewer columns for D-11 and D-12
ALTER TABLE public.proposals
  ADD COLUMN review_comment TEXT,
  ADD COLUMN reviewer UUID REFERENCES public.profiles(id);
