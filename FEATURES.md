# Naaz Field Collector — V1 Features

## 1. Authentication

### Login

Fields:

- Email
- Password

Functions:

- Login
- Show/hide password
- Loading state
- Error handling
- Logout

Use Supabase Authentication.

No public registration in V1.

All protected pages require authentication.

## 2. Dashboard

Show:

- Today's contacts
- Total contacts
- Today's land entries
- Total land opportunities

Main actions:

- Add Contact
- Add Land

Also show recent entries from the real Supabase database.

Do not populate the dashboard with fake data.

## 3. Contact Collection

### Contact Categories

- Advocate
- Seller
- Buyer
- Banker
- Real Estate Agent
- Developer
- Land Owner
- Other

### Contact Fields

Required:

- Full Name
- Category

Optional:

- Mobile Number
- WhatsApp Number
- Company/Office
- Designation
- District
- Taluk
- Village
- Area
- Address
- Notes

Automatically store:

- Created by
- Created at
- Updated at

## 4. Land Opportunity Collection

### Listing Type

- For Sale
- Wanted to Buy
- For Lease
- Other

### Property Type

- Agricultural Land
- Residential Land
- Commercial Land
- Site
- House
- Building
- Other

### Status

- Available
- Under Discussion
- Sold
- Not Available
- Follow Up Required

### Fields

Location:

- District
- Taluk
- Hobli
- Village
- Area/Location
- Survey Number
- Nearby Landmark
- Road Access

Owner/contact:

- Owner Name
- Contact Number

Property:

- Approximate Area
- Asking Price
- Location Description
- Notes

Optional:

- Link to an existing contact

## 5. Contact List

Route:

`/contacts`

Display real database records.

Functions:

- Search
- Category filter
- View
- Edit

Search useful fields such as:

- Name
- Mobile
- Company
- Location

Do not provide delete functionality in V1.

## 6. Land List

Route:

`/land`

Display real database records.

Functions:

- Search
- Status filter
- Property type filter
- View
- Edit

Show useful information such as:

- Owner
- Property type
- Listing type
- Location
- Area
- Asking price
- Status
- Date

## 7. Details

Contact route:

`/contacts/[id]`

Land route:

`/land/[id]`

Show all available information.

Mobile phone numbers should be clickable with `tel:`.

WhatsApp action may be provided when a WhatsApp number exists.

## 8. Editing

Authenticated users can edit existing records.

The form must load the actual Supabase record.

After saving:

- Update Supabase
- Update `updated_at`
- Show success feedback
- Handle errors

## 9. Navigation

Mobile navigation should prioritize:

- Dashboard
- Contacts
- Land
- Add

Desktop can use a sidebar or top navigation.

Include:

- Current user
- Logout

## 10. Validation

At minimum:

- Required fields must be checked.
- Whitespace should be trimmed.
- Phone numbers should accept reasonable Indian formats.
- Save buttons should prevent accidental double submission.
- Errors should be clearly displayed.

## 11. Loading and Empty States

Provide proper loading states for:

- Login
- Dashboard
- Lists
- Saving
- Editing

Provide useful empty states.

Example:

"No contacts collected yet."

with:

"Add First Contact"

Never insert fake records to improve the visual appearance.

## 12. V1 Exclusions

Do not implement yet:

- Payments
- AI
- Government API integrations
- Complex CRM
- Customer portal
- Public registration
- Advanced analytics
- Notifications
- Complex role systems
- Full mapping system
- Document verification
