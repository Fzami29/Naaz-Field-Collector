-- Create the field_contacts table
CREATE TABLE field_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
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

-- Create the land_opportunities table
CREATE TABLE land_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    contact_id UUID REFERENCES field_contacts(id),
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

-- Indexes for commonly searched/filterable fields
CREATE INDEX idx_field_contacts_created_by ON field_contacts(created_by);
CREATE INDEX idx_field_contacts_category ON field_contacts(category);
CREATE INDEX idx_field_contacts_district ON field_contacts(district);
CREATE INDEX idx_field_contacts_mobile_number ON field_contacts(mobile_number);
CREATE INDEX idx_field_contacts_created_at ON field_contacts(created_at);

CREATE INDEX idx_land_opportunities_created_by ON land_opportunities(created_by);
CREATE INDEX idx_land_opportunities_status ON land_opportunities(status);
CREATE INDEX idx_land_opportunities_property_type ON land_opportunities(property_type);
CREATE INDEX idx_land_opportunities_district ON land_opportunities(district);
CREATE INDEX idx_land_opportunities_created_at ON land_opportunities(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE field_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_opportunities ENABLE ROW LEVEL SECURITY;

-- Policies for field_contacts
-- Authenticated users can view all records
CREATE POLICY "Authenticated users can view field_contacts" ON field_contacts
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert their own records
CREATE POLICY "Users can insert their own field_contacts" ON field_contacts
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Authenticated users can update records
CREATE POLICY "Users can update field_contacts" ON field_contacts
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Policies for land_opportunities
-- Authenticated users can view all records
CREATE POLICY "Authenticated users can view land_opportunities" ON land_opportunities
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert their own records
CREATE POLICY "Users can insert their own land_opportunities" ON land_opportunities
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Authenticated users can update records
CREATE POLICY "Users can update land_opportunities" ON land_opportunities
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);
