-- Migration 00015: project lock state (admin-only override)
--
-- Why:
--   Admins need a way to freeze a project so its owner can no longer
--   change the progress field (e.g., to preserve state for evaluation,
--   or after publication so the owner can't accidentally reopen). Lock
--   is a separate, orthogonal concept from progress — a locked project
--   still has whatever progress value it had when locked.
--
-- Surface model:
--   - All approved users can READ is_locked (visible lock icon when on)
--   - Only admin/co_admin can TOGGLE is_locked, via set_project_lock RPC
--   - When locked, update_project_progress rejects non-admin callers
--
-- Owner does not see the lock toggle in their UI — it's an admin-only
-- control. Owner's progress dropdown becomes read-only when locked.

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- Admin/co_admin: lock or unlock a project
CREATE OR REPLACE FUNCTION public.set_project_lock(
  proposal_id UUID,
  locked BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF NOT public.is_approved() THEN
    RAISE EXCEPTION 'Caller not approved';
  END IF;

  v_role := public.get_user_role();
  IF v_role NOT IN ('admin', 'co_admin') THEN
    RAISE EXCEPTION 'Only admins can change project lock state';
  END IF;

  UPDATE public.proposals
  SET is_locked = locked
  WHERE id = proposal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.set_project_lock(UUID, BOOLEAN) TO authenticated;

-- Re-define update_project_progress to enforce the lock for non-admins
CREATE OR REPLACE FUNCTION public.update_project_progress(
  proposal_id UUID,
  new_progress TEXT
)
RETURNS VOID AS $$
DECLARE
  v_submitter UUID;
  v_locked BOOLEAN;
  v_role TEXT;
BEGIN
  IF new_progress NOT IN (
    'in_progress', 'on_hold', 'stalled', 'published', 'completed', 'aborted'
  ) THEN
    RAISE EXCEPTION 'Invalid progress value: %', new_progress;
  END IF;

  SELECT submitter, is_locked INTO v_submitter, v_locked
  FROM public.proposals
  WHERE id = proposal_id;

  IF v_submitter IS NULL THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF NOT public.is_approved() THEN
    RAISE EXCEPTION 'Caller not approved';
  END IF;

  v_role := public.get_user_role();

  -- Owner authorization: must be owner OR admin/co_admin
  IF v_submitter <> auth.uid() AND v_role NOT IN ('admin', 'co_admin') THEN
    RAISE EXCEPTION 'Not authorized to update this project';
  END IF;

  -- Lock enforcement: when locked, only admin/co_admin can update
  IF v_locked AND v_role NOT IN ('admin', 'co_admin') THEN
    RAISE EXCEPTION 'Project is locked';
  END IF;

  UPDATE public.proposals
  SET progress = new_progress
  WHERE id = proposal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
