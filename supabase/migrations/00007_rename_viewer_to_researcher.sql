-- Add researcher to the role constraint (keep viewer for backward compat)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'co_admin', 'pi_mentor', 'developer', 'viewer', 'researcher'));

-- Migrate existing viewers to researcher
UPDATE public.profiles SET role = 'researcher' WHERE role = 'viewer';
