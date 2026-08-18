-- ==============================================================================
-- Naaz Field Collector Database Schema (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Create the field_contacts table
CREATE TABLE IF NOT EXISTS field_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    category TEXT NOT NULL,
    mobile_number TEXT,
    whatsapp_number TEXT,
    company_name TEXT,
    designation TEXT,
    district TEXT,
    taluk TEXT,
    village TEXT,
    area TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create the land_opportunities table
CREATE TABLE IF NOT EXISTS land_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES field_contacts(id) ON DELETE SET NULL,
    listing_type TEXT NOT NULL,
    owner_name TEXT,
    contact_number TEXT,
    district TEXT,
    taluk TEXT,
    hobli TEXT,
    village TEXT,
    area TEXT,
    survey_number TEXT,
    property_type TEXT,
    asking_price TEXT,
    location_description TEXT,
    road_access TEXT,
    nearby_landmark TEXT,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create the contact_meetings table
CREATE TABLE IF NOT EXISTS contact_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES field_contacts(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meeting_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    meeting_type TEXT NOT NULL DEFAULT 'In-Person',
    status TEXT NOT NULL DEFAULT 'Completed',
    location TEXT,
    summary TEXT NOT NULL,
    outcome TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create the contact_followups table
CREATE TABLE IF NOT EXISTS contact_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES field_contacts(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes for commonly searched and filtered fields
CREATE INDEX IF NOT EXISTS idx_field_contacts_created_by ON field_contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_field_contacts_category ON field_contacts(category);
CREATE INDEX IF NOT EXISTS idx_field_contacts_district ON field_contacts(district);
CREATE INDEX IF NOT EXISTS idx_field_contacts_mobile_number ON field_contacts(mobile_number);
CREATE INDEX IF NOT EXISTS idx_field_contacts_created_at ON field_contacts(created_at);

CREATE INDEX IF NOT EXISTS idx_land_opportunities_created_by ON land_opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_land_opportunities_status ON land_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_land_opportunities_property_type ON land_opportunities(property_type);
CREATE INDEX IF NOT EXISTS idx_land_opportunities_district ON land_opportunities(district);
CREATE INDEX IF NOT EXISTS idx_land_opportunities_created_at ON land_opportunities(created_at);

CREATE INDEX IF NOT EXISTS idx_contact_meetings_contact_id ON contact_meetings(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_meetings_created_by ON contact_meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_contact_meetings_meeting_date ON contact_meetings(meeting_date);

CREATE INDEX IF NOT EXISTS idx_contact_followups_contact_id ON contact_followups(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_followups_created_by ON contact_followups(created_by);
CREATE INDEX IF NOT EXISTS idx_contact_followups_due_date ON contact_followups(due_date);
CREATE INDEX IF NOT EXISTS idx_contact_followups_status ON contact_followups(status);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE field_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_followups ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for field_contacts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view field_contacts' AND tablename = 'field_contacts') THEN
        CREATE POLICY "Authenticated users can view field_contacts" ON field_contacts
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own field_contacts' AND tablename = 'field_contacts') THEN
        CREATE POLICY "Users can insert their own field_contacts" ON field_contacts
            FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update field_contacts' AND tablename = 'field_contacts') THEN
        CREATE POLICY "Users can update field_contacts" ON field_contacts
            FOR UPDATE USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete field_contacts' AND tablename = 'field_contacts') THEN
        CREATE POLICY "Users can delete field_contacts" ON field_contacts
            FOR DELETE USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 8. RLS Policies for land_opportunities
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view land_opportunities' AND tablename = 'land_opportunities') THEN
        CREATE POLICY "Authenticated users can view land_opportunities" ON land_opportunities
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own land_opportunities' AND tablename = 'land_opportunities') THEN
        CREATE POLICY "Users can insert their own land_opportunities" ON land_opportunities
            FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update land_opportunities' AND tablename = 'land_opportunities') THEN
        CREATE POLICY "Users can update land_opportunities" ON land_opportunities
            FOR UPDATE USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete land_opportunities' AND tablename = 'land_opportunities') THEN
        CREATE POLICY "Users can delete land_opportunities" ON land_opportunities
            FOR DELETE USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 9. RLS Policies for contact_meetings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view contact_meetings' AND tablename = 'contact_meetings') THEN
        CREATE POLICY "Authenticated users can view contact_meetings" ON contact_meetings
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own contact_meetings' AND tablename = 'contact_meetings') THEN
        CREATE POLICY "Users can insert their own contact_meetings" ON contact_meetings
            FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update contact_meetings' AND tablename = 'contact_meetings') THEN
        CREATE POLICY "Users can update contact_meetings" ON contact_meetings
            FOR UPDATE USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete contact_meetings' AND tablename = 'contact_meetings') THEN
        CREATE POLICY "Users can delete contact_meetings" ON contact_meetings
            FOR DELETE USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 10. RLS Policies for contact_followups
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view contact_followups' AND tablename = 'contact_followups') THEN
        CREATE POLICY "Authenticated users can view contact_followups" ON contact_followups
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own contact_followups' AND tablename = 'contact_followups') THEN
        CREATE POLICY "Users can insert their own contact_followups" ON contact_followups
            FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update contact_followups' AND tablename = 'contact_followups') THEN
        CREATE POLICY "Users can update contact_followups" ON contact_followups
            FOR UPDATE USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete contact_followups' AND tablename = 'contact_followups') THEN
        CREATE POLICY "Users can delete contact_followups" ON contact_followups
            FOR DELETE USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 11. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE field_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE land_opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_followups;
