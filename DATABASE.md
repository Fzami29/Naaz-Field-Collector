# Naaz Field Collector — Database Specification

## Database

Use the project's Supabase PostgreSQL database.

Keep these tables separate from the main Naaz Verify application's tables.

Suggested tables:

- `field_contacts`
- `land_opportunities`

Supabase Auth manages users.

## Table: field_contacts

Suggested columns:

| Column | Type | Required |
|---|---|---|
| id | UUID | Yes |
| created_by | UUID | Yes |
| full_name | TEXT | Yes |
| category | TEXT | Yes |
| mobile_number | TEXT | No |
| whatsapp_number | TEXT | No |
| company_name | TEXT | No |
| designation | TEXT | No |
| district | TEXT | No |
| taluk | TEXT | No |
| village | TEXT | No |
| area | TEXT | No |
| address | TEXT | No |
| notes | TEXT | No |
| created_at | TIMESTAMPTZ | Yes |
| updated_at | TIMESTAMPTZ | Yes |

`created_by` should reference `auth.users(id)`.

## Contact Categories

Use controlled values:

- Advocate
- Seller
- Buyer
- Banker
- Real Estate Agent
- Developer
- Land Owner
- Other

## Table: land_opportunities

Suggested columns:

| Column | Type | Required |
|---|---|---|
| id | UUID | Yes |
| created_by | UUID | Yes |
| contact_id | UUID | No |
| listing_type | TEXT | Yes |
| owner_name | TEXT | No |
| contact_number | TEXT | No |
| district | TEXT | No |
| taluk | TEXT | No |
| hobli | TEXT | No |
| village | TEXT | No |
| area | TEXT | No |
| survey_number | TEXT | No |
| property_type | TEXT | No |
| asking_price | TEXT | No |
| location_description | TEXT | No |
| road_access | TEXT | No |
| nearby_landmark | TEXT | No |
| status | TEXT | Yes |
| notes | TEXT | No |
| created_at | TIMESTAMPTZ | Yes |
| updated_at | TIMESTAMPTZ | Yes |

`created_by` references `auth.users(id)`.

`contact_id` can reference `field_contacts(id)`.

## Listing Types

- For Sale
- Wanted to Buy
- For Lease
- Other

## Property Types

- Agricultural Land
- Residential Land
- Commercial Land
- Site
- House
- Building
- Other

## Status Values

- Available
- Under Discussion
- Sold
- Not Available
- Follow Up Required

## Timestamps

Use:

`created_at TIMESTAMPTZ DEFAULT now()`

`updated_at TIMESTAMPTZ DEFAULT now()`

Update `updated_at` whenever a record is modified.

## Security

Enable Row Level Security on all application tables.

Authenticated users should be able to:

- SELECT records they are authorized to see
- INSERT records
- UPDATE records

For the initial field-worker workflow, do not allow record deletion from the application.

Do not expose the Supabase service-role key in frontend code.

## created_by

Do not allow the frontend to freely impersonate another user.

Use the authenticated Supabase user ID.

The database policies must use `auth.uid()` where appropriate.

## Environment Variables

Use only:

`NEXT_PUBLIC_SUPABASE_URL`

`NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never commit real secrets to GitHub.

## Indexes

Consider indexes for commonly searched/filterable fields such as:

- `created_by`
- `category`
- `district`
- `mobile_number`
- `created_at`
- `status`
- `property_type`

Do not over-index the database unnecessarily.

## SQL Deliverable

Create:

`supabase/schema.sql`

The file should contain the actual SQL required to create the V1 tables, constraints, indexes, RLS, and policies.

It must be usable directly in the Supabase SQL Editor.
