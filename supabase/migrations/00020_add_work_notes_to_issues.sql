-- Migration 00020: add work_notes to issues
--
-- Why:
--   Assignees need a place to log progress, blockers, questions, or
--   resolution notes while working on an issue. A single editable text
--   column is the simplest shape that fits the "assignee owns the
--   working state" model.
--
-- Who can write:
--   Assignee (via "Assignee updates assigned issue" policy from 00019),
--   reporter (via "Reporter updates own issue"),
--   admin / co_admin (via "Admins update any issue").
--
-- Who can read: every approved user (existing SELECT policy from 00016).
--
-- If threaded comments with authorship + timestamps become needed
-- later, add a separate issue_comments table — don't try to bolt it
-- onto this column.

ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS work_notes TEXT;
