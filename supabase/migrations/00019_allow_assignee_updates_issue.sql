-- Migration 00019: let the assignee update their assigned issue
--
-- Why:
--   When an admin assigns an issue to a developer, that developer
--   needs to be able to move it through the status lifecycle
--   (open → in_progress → closed). Previously only reporter or
--   admin could update, so assignees had no way to mark their own
--   work as in-progress/done.
--
-- Policies are OR-ed in PostgreSQL — this is additive. Existing
-- "Reporter updates own issue" and "Admins update any issue"
-- policies stay.

CREATE POLICY "Assignee updates assigned issue"
  ON public.issues FOR UPDATE
  USING (
    public.is_approved()
    AND assignee = auth.uid()
  );
