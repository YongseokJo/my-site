-- Migration 00013: Let admins delete approved proposals (= projects)
--
-- Why:
--   The Projects panel needs a delete button. Previous policies (00008)
--   only allowed delete when status='pending', so clicking delete on an
--   approved project silently failed under RLS even for admins.
--
-- Who can delete (final policy set):
--   - Submitter (owner): only their own PENDING proposals (unchanged
--     from 00008). Once a proposal is approved into a project, the owner
--     can no longer delete it — only an admin can retire the project.
--   - admin / co_admin: any proposal, any status (broadened from
--     pending-only).
--
-- "Owner deletes own pending proposal" is preserved as-is.

DROP POLICY IF EXISTS "Admin deletes any pending proposal" ON public.proposals;

CREATE POLICY "Admin deletes any proposal"
  ON public.proposals FOR DELETE
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'co_admin')
  );
