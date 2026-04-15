-- Migration 00018: allow researchers and co_admins to create issues
--
-- Why:
--   Mirrors 00017 for the issues table. The original "Developers
--   create issues" policy (00004) locked out researcher + co_admin.
--   Opening it so anyone approved can log a to-do / issue.
--
-- Who can INSERT issues after this:
--   admin, co_admin, pi_mentor, developer, researcher
--   (reporter must still equal auth.uid())

DROP POLICY IF EXISTS "Developers create issues" ON public.issues;

CREATE POLICY "Approved users create issues"
  ON public.issues FOR INSERT
  WITH CHECK (
    public.is_approved()
    AND public.get_user_role() IN (
      'admin', 'co_admin', 'pi_mentor', 'developer', 'researcher'
    )
    AND reporter = auth.uid()
  );
