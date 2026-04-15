-- Migration 00021: co_admin has full equivalence with admin
--
-- Why:
--   Path A of the role-model decision (single role, additive
--   hierarchy). co_admin is intended as a peer of admin, but the
--   original RLS policies were written against role='admin' literally.
--   Earlier migrations (00013, 00016) patched the policies they
--   touched, but two policies still excluded co_admin:
--
--     1. "Admins update any profile" (00004) — co_admin couldn't
--        approve new users, change other users' roles, etc.
--     2. "PI and admin update proposals" (00004) — co_admin couldn't
--        approve / reject / edit a proposal during review.
--
--   Closing both gaps so co_admin == admin everywhere it matters.
--   Going forward, treat the two roles as interchangeable for any
--   policy-level decision; reserve admin-only as a future capability
--   if needed.

DROP POLICY IF EXISTS "Admins update any profile" ON public.profiles;

CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'co_admin'));

DROP POLICY IF EXISTS "PI and admin update proposals" ON public.proposals;

CREATE POLICY "PI and admin update proposals"
  ON public.proposals FOR UPDATE
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'co_admin', 'pi_mentor')
  );
