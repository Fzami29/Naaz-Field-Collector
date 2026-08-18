# Naaz Field Collector — UI Guidelines

## Overall Design

The application is primarily used on a mobile phone in the field.

Mobile-first design is mandatory.

The interface should feel like a professional internal business tool rather than a generic AI-generated dashboard.

## Visual Direction

Preferred:

- White/light background
- Deep emerald/green primary color
- Neutral gray
- Small gold accent where useful
- Clean cards
- Clear typography
- Strong spacing
- Touch-friendly controls

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Huge decorative elements
- Unnecessary animations
- Clutter
- Tiny buttons
- Long complicated navigation

## Mobile Requirements

Forms should be easy to complete with one hand.

Use:

- Large inputs
- Large buttons
- Clear labels
- Proper keyboard types
- Comfortable spacing
- Sticky or easily accessible primary action where appropriate

Phone numbers should use an appropriate numeric/telephone keyboard.

## Login Screen

Simple screen containing:

- Naaz Field Collector logo/name
- Short subtitle
- Email
- Password
- Show/hide password
- Login button
- Error message

No public registration.

## Dashboard

Top section:

**Naaz Field Collector**

Then small summary cards:

- Today's Contacts
- Total Contacts
- Today's Land
- Total Land

Primary actions:

**+ Add Contact**

**+ Add Land**

Below:

**Recent Entries**

Use actual Supabase data.

## Add Contact Screen

Use a clear form divided into small logical sections.

### Personal

- Full Name
- Category

### Contact

- Mobile
- WhatsApp
- Company/Office
- Designation

### Location

- District
- Taluk
- Village
- Area
- Address

### Notes

- Notes

Primary button:

**Save Contact**

The save button should clearly show a loading state during submission.

## Add Land Screen

Sections:

### Opportunity

- Listing Type
- Property Type
- Status

### Location

- District
- Taluk
- Hobli
- Village
- Area/Location
- Survey Number
- Nearby Landmark
- Road Access

### Owner

- Owner Name
- Contact Number

### Property

- Approximate Area
- Asking Price
- Location Description
- Notes

Primary button:

**Save Land Opportunity**

## Lists

Use cards on mobile.

A contact card can show:

- Name
- Category
- Location
- Phone
- Date

A land card can show:

- Owner
- Property Type
- Location
- Area
- Price
- Status

Provide clear View/Edit actions.

## Search

Search bars should be visible and easy to use.

Do not require complex filters for basic use.

## Empty States

Empty states should guide the user toward the next action.

Example:

**No contacts collected yet.**

Button:

**Add Contact**

Never show fake records.

## Feedback

After a successful save:

Show a clear success message such as:

**Contact saved successfully.**

After errors:

Explain the problem in simple language.

Do not expose technical database errors directly when a friendly message can be provided.

## Accessibility

Use:

- Proper labels
- Keyboard accessibility
- Good contrast
- Clear focus states
- Large touch targets
- Semantic HTML

## Responsiveness

The application must work well at:

- Small Android phones
- Large Android phones
- Tablets
- Desktop browsers

The mobile experience is the priority.

## Performance

Keep the app lightweight.

Avoid unnecessary libraries.

Do not load large assets unnecessarily.

The field worker should be able to open the application quickly on a mobile network.
