# Naaz Field Collector — Project Overview

## Purpose

Naaz Field Collector is a separate internal web application for collecting real-world field information.

It is **not part of the main Naaz Verify application**.

A field worker will use the application from a mobile phone to collect information about people, businesses, and land/property opportunities. The submitted information must be stored as real data in Supabase.

## Core Flow

Field worker:

1. Logs in with a Supabase Auth account.
2. Opens the dashboard.
3. Adds a contact or land opportunity.
4. Submits the form.
5. Data is saved directly to Supabase PostgreSQL.
6. The saved record can immediately be viewed and edited.

## Deployment

The application will be deployed independently on Vercel.

Suggested project name:

`Naaz Field Collector`

Possible future domain:

`collect.naazverify.com`

The domain is optional for V1.

## Technology

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)
- Vercel

## V1 Principle

Keep the first version simple and reliable.

Do not build a full CRM or connect it to the main Naaz Verify application yet.

The purpose of V1 is reliable field-data collection.

## No Mock Data

There must be:

- No mock records
- No fake users
- No hardcoded sample entries
- No localStorage as the primary database
- No fake authentication

All submitted records must use the real Supabase database.

## V1 Users

Initially, the application can have one manually created field-worker account in Supabase Auth.

Public registration is not required.

## Future Direction

After enough real information has been collected, the workflow can be evaluated and expanded.

Possible future features may include:

- Advanced search
- Maps/GPS
- Follow-ups
- Documents/photos
- Multiple field workers
- Admin dashboard
- Analytics
- CRM functions
- Data export
- Integration with Naaz Verify

These are intentionally outside V1.
