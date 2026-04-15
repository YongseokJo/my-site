-- Migration 00016: open issues SELECT to all approved users
--
-- Why:
--   Mirrors the pattern established by the Projects panel (migrations
--   00011-00013) — to-do / issue tracking should be visible to the
--   whole community, not just developers+. Researchers and anyone
--   approved can now see what's on the to-do list.
--
-- Who can still do what:
--   - read  : all approved users (broadened from admin/pi_mentor/developer)
--   - create: admin / pi_mentor / developer (unchanged — via existing policy)
--   - update: admin / reporter (unchanged — via existing policies)
--   - delete: reporter for open issues / admin for any open issue (00008)
--
-- Also fixes the co_admin gap in "Admins update any issue" while
-- we're in here — co_admins couldn't update issue status before.

DROP POLICY IF EXISTS "Approved users read issues" ON public.issues;

CREATE POLICY "Approved users read issues"
  ON public.issues FOR SELECT
  USING (public.is_approved());

-- Fix co_admin gap on update policy
DROP POLICY IF EXISTS "Admins update any issue" ON public.issues;

CREATE POLICY "Admins update any issue"
  ON public.issues FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'co_admin'));

-- Also expand admin delete policy for co_admin (00008 didn't include co_admin)
DROP POLICY IF EXISTS "Admin deletes any open issue" ON public.issues;

CREATE POLICY "Admin deletes any open issue"
  ON public.issues FOR DELETE
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'co_admin')
    AND status = 'open'
  );
