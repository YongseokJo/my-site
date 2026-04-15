-- Migration 00017: allow researchers and co_admins to submit proposals
--
-- Why:
--   The original policy (00004) only allowed admin/pi_mentor/developer
--   to INSERT proposals. Researchers (formerly viewers) were locked
--   out — they could only read approved proposals. Product decision:
--   researchers should be able to submit proposals too, since they're
--   the ones doing the research that the proposal describes.
--
--   Also fixes the co_admin gap — co_admin wasn't in the allow-list
--   even though they have admin-level responsibilities.
--
-- Who can INSERT proposals after this:
--   admin, co_admin, pi_mentor, developer, researcher
--   (submitter must still equal auth.uid())

DROP POLICY IF EXISTS "Developers submit proposals" ON public.proposals;

CREATE POLICY "Approved users submit proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (
    public.is_approved()
    AND public.get_user_role() IN (
      'admin', 'co_admin', 'pi_mentor', 'developer', 'researcher'
    )
    AND submitter = auth.uid()
  );
