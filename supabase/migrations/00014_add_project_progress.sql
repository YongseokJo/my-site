-- Migration 00014: project progress tracking
--
-- Why:
--   Approved proposals = projects. Projects need a status independent of
--   the approval status (in_progress, on_hold, stalled, published,
--   completed, aborted) so users can see at a glance which projects
--   are active vs done vs dead.
--
-- Default: in_progress (when admin approves a proposal it becomes an
-- active project).
--
-- Permissions:
--   Owner (submitter) and admin/co_admin can change progress. Implemented
--   via a SECURITY DEFINER RPC (not a broader UPDATE RLS policy) because
--   giving the owner table-level UPDATE on their own proposals would let
--   them flip the underlying review status back to pending, change title
--   post-approval, etc. The RPC narrows the surface to the progress
--   column only.

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS progress TEXT NOT NULL DEFAULT 'in_progress'
  CHECK (progress IN (
    'in_progress', 'on_hold', 'stalled', 'published', 'completed', 'aborted'
  ));

-- RPC: change the progress field, with owner-or-admin authorization
CREATE OR REPLACE FUNCTION public.update_project_progress(
  proposal_id UUID,
  new_progress TEXT
)
RETURNS VOID AS $$
DECLARE
  v_submitter UUID;
  v_role TEXT;
BEGIN
  IF new_progress NOT IN (
    'in_progress', 'on_hold', 'stalled', 'published', 'completed', 'aborted'
  ) THEN
    RAISE EXCEPTION 'Invalid progress value: %', new_progress;
  END IF;

  SELECT submitter INTO v_submitter
  FROM public.proposals
  WHERE id = proposal_id;

  IF v_submitter IS NULL THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF NOT public.is_approved() THEN
    RAISE EXCEPTION 'Caller not approved';
  END IF;

  v_role := public.get_user_role();
  IF v_submitter <> auth.uid() AND v_role NOT IN ('admin', 'co_admin') THEN
    RAISE EXCEPTION 'Not authorized to update this project';
  END IF;

  UPDATE public.proposals
  SET progress = new_progress
  WHERE id = proposal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.update_project_progress(UUID, TEXT) TO authenticated;
