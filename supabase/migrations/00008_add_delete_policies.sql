-- Add DELETE policies for issues and proposals
-- Reporters/submitters can delete their own open/pending items
-- Admins and co_admins can delete any open/pending items

-- Issues: owner can delete own open issues, admin/co_admin can delete any open issue
CREATE POLICY "Owner deletes own open issue"
  ON public.issues FOR DELETE
  USING (
    public.is_approved()
    AND reporter = auth.uid()
    AND status = 'open'
  );

CREATE POLICY "Admin deletes any open issue"
  ON public.issues FOR DELETE
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'co_admin')
    AND status = 'open'
  );

-- Proposals: submitter can delete own pending proposals, admin/co_admin can delete any pending proposal
CREATE POLICY "Owner deletes own pending proposal"
  ON public.proposals FOR DELETE
  USING (
    public.is_approved()
    AND submitter = auth.uid()
    AND status = 'pending'
  );

CREATE POLICY "Admin deletes any pending proposal"
  ON public.proposals FOR DELETE
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'co_admin')
    AND status = 'pending'
  );
