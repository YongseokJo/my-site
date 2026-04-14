-- Migration 00011: Allow all approved users to read all profiles.
--
-- Why:
--   Proposal "owner" / submitter display in the dashboard's Projects panel
--   needs to show the submitter's display_name. Previously only admins could
--   read other users' profiles, so the join returned null for everyone else.
--
-- Side effect (intentional):
--   All approved users can now see display_name + role + approval status of
--   every other approved user. This matches the collaborative nature of the
--   platform — users opt in by signing up, and seeing who else is involved
--   is a feature.
--
-- Also fixes:
--   The previous "Admins read all profiles" policy only matched role='admin',
--   silently excluding 'co_admin'. The new broad policy covers both, so we
--   drop the old admin-specific policy as redundant.
--
-- "Users read own profile" is preserved — unapproved users (mid-signup,
-- pending approval) still need to read their own row to render the
-- pending-approval page.

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;

CREATE POLICY "Approved users read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_approved());
