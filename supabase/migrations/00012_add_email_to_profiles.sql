-- Migration 00012: Mirror auth.users.email into public.profiles
--
-- Why:
--   The Projects panel needs to display the project owner's email and
--   provide a mailto link. auth.users isn't readable from the client
--   via PostgREST, so we mirror the email into profiles where existing
--   RLS already allows reads for approved users (migration 00011).
--
-- Privacy implication (intentional):
--   Every approved user can now read every other approved user's email
--   in addition to display_name and role. This is consistent with the
--   collaborative intent of the platform — projects need contactable
--   owners.
--
-- Sync model:
--   Email is written at signup via the trigger below and backfilled
--   for existing users. Email changes via Supabase auth flows are NOT
--   automatically mirrored — if a user changes their auth email, the
--   profiles.email will go stale. Add an UPDATE trigger on auth.users
--   later if/when email change becomes a real flow.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill from auth.users for any existing rows missing email
UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
    AND p.email IS NULL;

-- Update the signup trigger to populate email going forward
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
