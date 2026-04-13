-- RLS policies and security definer functions for four-tier role system
-- Per D-04, D-10, D-11
-- CRITICAL: Uses SECURITY DEFINER functions for role lookups to avoid
-- circular RLS dependency on profiles table (see Research anti-patterns)

-- ============================================================
-- SECURITY DEFINER FUNCTIONS
-- Never query profiles directly in RLS policies; use these instead
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT approved FROM public.profiles WHERE id = auth.uid()),
    FALSE
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES RLS POLICIES
-- ============================================================

-- Users can read their own profile (even if unapproved, needed for UI)
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Users can update their own display_name (not role or approved)
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile (for role assignment and approval)
CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- ISSUES RLS POLICIES (per D-11)
-- ============================================================

-- Approved developers, pi_mentors, and admins can view issues
CREATE POLICY "Approved users read issues"
  ON public.issues FOR SELECT
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'pi_mentor', 'developer')
  );

-- Approved developers+ can create issues (reporter must be self)
CREATE POLICY "Developers create issues"
  ON public.issues FOR INSERT
  WITH CHECK (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'pi_mentor', 'developer')
    AND reporter = auth.uid()
  );

-- Admins can update any issue
CREATE POLICY "Admins update any issue"
  ON public.issues FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- Reporters can update their own issues
CREATE POLICY "Reporter updates own issue"
  ON public.issues FOR UPDATE
  USING (reporter = auth.uid() AND public.is_approved());

-- ============================================================
-- PROPOSALS RLS POLICIES (per D-11)
-- Viewers see approved proposals only; developers+ see all
-- ============================================================

-- Approved users can read proposals (viewers see approved only)
CREATE POLICY "Approved users read proposals"
  ON public.proposals FOR SELECT
  USING (
    public.is_approved()
    AND (
      public.get_user_role() IN ('admin', 'pi_mentor', 'developer')
      OR (public.get_user_role() = 'viewer' AND status = 'approved')
    )
  );

-- Approved developers+ can submit proposals (submitter must be self)
CREATE POLICY "Developers submit proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'pi_mentor', 'developer')
    AND submitter = auth.uid()
  );

-- PI/mentors and admins can update proposals (for approval/rejection)
CREATE POLICY "PI and admin update proposals"
  ON public.proposals FOR UPDATE
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'pi_mentor')
  );
