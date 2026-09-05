-- ==============================================================================
-- Migration: 001_fix_ownership_rls.sql
-- Purpose  : Fix the Supabase UPDATE/DELETE ownership vulnerability.
--
-- PROBLEM: The original UPDATE and DELETE policies for field_contacts,
-- land_opportunities, contact_meetings, and contact_followups used:
--   USING (auth.uid() IS NOT NULL)
-- This allows ANY authenticated user to edit or delete ANY other user's records.
--
-- FIX: Replace these policies with strict ownership checks:
--   USING (auth.uid() = created_by)
--
-- NOTE: SELECT and INSERT policies are NOT changed because:
--   - SELECT: The app intentionally allows all authenticated users to see each
--     other's contacts (shared field team model).
--   - INSERT: Already correctly uses WITH CHECK (auth.uid() = created_by).
-- ==============================================================================

-- ── field_contacts ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update field_contacts" ON field_contacts;
CREATE POLICY "Users can update field_contacts"
    ON field_contacts FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete field_contacts" ON field_contacts;
CREATE POLICY "Users can delete field_contacts"
    ON field_contacts FOR DELETE
    USING (auth.uid() = created_by);

-- ── land_opportunities ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update land_opportunities" ON land_opportunities;
CREATE POLICY "Users can update land_opportunities"
    ON land_opportunities FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete land_opportunities" ON land_opportunities;
CREATE POLICY "Users can delete land_opportunities"
    ON land_opportunities FOR DELETE
    USING (auth.uid() = created_by);

-- ── contact_meetings ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update contact_meetings" ON contact_meetings;
CREATE POLICY "Users can update contact_meetings"
    ON contact_meetings FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete contact_meetings" ON contact_meetings;
CREATE POLICY "Users can delete contact_meetings"
    ON contact_meetings FOR DELETE
    USING (auth.uid() = created_by);

-- ── contact_followups ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update contact_followups" ON contact_followups;
CREATE POLICY "Users can update contact_followups"
    ON contact_followups FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete contact_followups" ON contact_followups;
CREATE POLICY "Users can delete contact_followups"
    ON contact_followups FOR DELETE
    USING (auth.uid() = created_by);
