# StreamSphere Live

Project: Premium Live TV Streaming Platform

Build a modern, responsive, production-ready Live TV streaming website where users can register, log in, subscribe/pay for access, watch authorized live TV channels, and manage their account from a personal dashboard.

The platform must be designed with a clean, professional OTT/Live TV style interface and should work perfectly on desktop, tablet, and mobile.

1. Technology & Architecture

Use a modern full-stack architecture.

Preferred stack:

React + TypeScript

Tailwind CSS

Modern component library such as shadcn/ui

Supabase for:

Authentication

PostgreSQL database

User profiles

Subscription data

Payment records

Row Level Security

Use a modular architecture so external payment gateways and streaming APIs can be integrated later.

Do NOT hard-code sensitive API keys or payment credentials in frontend code.

Use environment variables for all secrets.

2. Public Website

Create the following public pages:

Home Page

Create a premium OTT-style homepage containing:

Professional header/navigation

Logo area

Home

Live TV

Packages/Pricing

About

Contact

Login

Register

User account button when logged in

Hero section:

Large promotional banner

"Watch Live TV Anytime, Anywhere"

Short description

"Start Watching" CTA

"View Packages" CTA

Live Channels section:

Display currently available channels

Channel logo

Channel name

Live status

Watch button

Add sections for:

Featured channels

Popular channels

Subscription packages

Features

Why choose us

FAQ

Footer

3. Live TV Page

Create a dedicated /live-tv page.

Display channels in a responsive grid.

Each channel card should contain:

Channel logo

Channel name

Category

LIVE badge

Short description

Watch Now button

Categories:

News

Sports

Entertainment

Movies

Kids

Religious

International

Other

Add category filtering and search.

When a user clicks a channel:

If the channel is free:

Allow the user to watch it.

If the channel requires a subscription:

Check the user's active subscription.

If subscribed:
Allow playback.

If not subscribed:
Show a professional subscription-required screen with:

Channel information

Required package

Subscribe button

Login/Register button if necessary

4. Video Player Page

Create a dedicated channel/player page:

/watch/:channelId

The player should support authorized live streaming URLs such as:

HLS .m3u8

DASH where applicable

Other supported browser-compatible streaming formats

Use a modern responsive video player.

Player features:

Play/Pause

Volume

Fullscreen

Live indicator

Picture-in-picture where supported

Loading state

Error state

Responsive mobile controls

IMPORTANT:

Do not provide or embed copyrighted/pirated TV streams.

The platform should only support streaming URLs that the website owner has legal authorization to distribute.

5. User Authentication

Implement complete authentication using Supabase Auth.

Registration fields:

Full Name

Email

Phone Number

Password

Confirm Password

Login:

Email

Password

Remember session

Also include:

Forgot Password

Reset Password

Email verification

Logout

After registration, automatically create a user profile in the database.

6. User Dashboard

Create a professional user dashboard at:

/dashboard

Dashboard sidebar:

Overview

My Profile

My Subscription

Payment History

Watch History

Favorite Channels

Change Password

Logout

Dashboard Overview

Show:

User name

Account status

Current subscription

Subscription expiry date

Recently watched channels

Favorite channels

Payment status

Example cards:

Active Package
Subscription Status
Expiry Date
Total Payments

7. User Profile

Create /dashboard/profile.

Allow users to view and update:

Full Name

Email

Phone

Profile photo

Account information

Email should not be editable directly unless proper email-change verification is implemented.

8. Subscription System

Create a flexible subscription/package system.

Example packages:

Basic

30 Days

Limited channels

HD streaming

Standard

90 Days

More channels

HD streaming

Multiple categories

Premium

365 Days

All available channels

Full HD where available

Premium support

The package names, prices, duration, and channel access must be configurable from the admin panel.

Do NOT hard-code pricing.

Database should store:

Package name

Description

Price

Currency

Duration

Status

Features

Channel access rules

9. Payment System

Create a complete payment architecture.

The system should support integration with payment gateways.

Design the payment layer so that gateways can be added without changing the main subscription logic.

Payment flow:

User selects a package

User clicks Subscribe

Create pending payment

Redirect/open payment gateway

User completes payment

Payment gateway sends callback/webhook

Verify payment server-side

Update payment status

Activate user's subscription

Update subscription expiry date

Show successful payment page

Payment statuses:

Pending

Processing

Paid

Failed

Cancelled

Refunded

IMPORTANT SECURITY RULES:

Never activate a subscription only because the frontend says payment was successful.

Payment must be verified server-side through the gateway API/webhook.

Keep payment credentials in environment variables.

Create proper webhook handling.

10. Payment History

Create:

/dashboard/payments

Display:

Transaction ID

Package

Amount

Currency

Payment method

Date

Status

Invoice/receipt option where applicable

Users can only see their own payment records.

11. Subscription Management

Create:

/dashboard/subscription

Show:

Current package

Start date

Expiry date

Subscription status

Days remaining

Payment information

Statuses:

Active

Expired

Cancelled

Pending

Show a clear warning when subscription is about to expire.

12. Favorites

Allow users to favorite channels.

Each channel card should have:

Favorite/unfavorite button

Create:

/dashboard/favorites

Users can see their favorite channels.

13. Watch History

Store recently watched channels.

Dashboard page:

/dashboard/history

Show:

Channel

Last watched time

Watch duration if available

Users should be able to clear their own watch history.

14. Admin Panel

Create a secure admin dashboard:

/admin

Only users with admin role can access it.

Admin sidebar:

Dashboard

Users

Channels

Categories

Packages

Subscriptions

Payments

Transactions

Watch History

Reports

Settings

15. Admin Dashboard

Show statistics:

Total users

Active users

Active subscriptions

Expired subscriptions

Total revenue

Today's revenue

Monthly revenue

Total channels

Active channels

Use clean charts and statistics cards.

16. Channel Management

Admin can:

Add channel

Edit channel

Delete channel

Enable/disable channel

Change channel order

Upload channel logo

Set channel category

Set streaming URL

Mark channel as free/premium

Assign required package

Add description

Channel database fields should include:

id

name

slug

logo_url

description

category_id

stream_url

stream_type

is_live

is_free

is_active

sort_order

created_at

updated_at

Never expose private streaming credentials or admin-only information to unauthorized users.

17. Category Management

Admin can:

Create categories

Edit categories

Delete categories

Enable/disable categories

Set category ordering

18. Package Management

Admin can:

Create package

Edit package

Delete package

Enable/disable package

Set price

Set duration

Define package features

Assign channels/packages access

19. User Management

Admin can:

View users

Search users

Filter users

View user details

Activate/deactivate account

Change user role

View subscription

View payment history

Roles:

User

Admin

Never allow a normal user to access admin routes.

20. Subscription Management for Admin

Admin should be able to see:

User

Package

Start date

Expiry date

Status

Payment reference

Admin may manually activate/deactivate subscriptions when appropriate.

All manual subscription changes should be logged.

21. Payment Management for Admin

Admin payment table:

Transaction ID

User

Package

Amount

Payment method

Date

Status

Filters:

Paid

Pending

Failed

Refunded

Search by:

User

Email

Transaction ID

22. Database Design

Create a proper relational database.

Recommended tables:

profiles

id

full_name

email

phone

avatar_url

role

status

created_at

updated_at

categories

id

name

slug

status

sort_order

created_at

channels

id

category_id

name

slug

logo_url

description

stream_url

stream_type

is_free

is_active

sort_order

created_at

updated_at

packages

id

name

description

price

currency

duration_days

features

status

created_at

updated_at

package_channels

id

package_id

channel_id

subscriptions

id

user_id

package_id

start_date

expiry_date

status

payment_id

created_at

updated_at

payments

id

user_id

package_id

transaction_id

amount

currency

payment_method

status

gateway_response

paid_at

created_at

favorites

id

user_id

channel_id

created_at

watch_history

id

user_id

channel_id

watched_at

duration

payment_webhooks

id

gateway

event_id

payload

status

processed_at

created_at

audit_logs

id

user_id

action

entity_type

entity_id

metadata

created_at

23. Security

Implement strong security from the beginning.

Use:

Supabase Row Level Security

Protected routes

Role-based access control

Server-side payment verification

Secure webhook verification

Input validation

Form validation

Rate limiting where appropriate

Secure password handling through Supabase Auth

Environment variables

No secret API keys in frontend

SQL injection protection

XSS protection

CSRF protection where applicable

Users must never be able to:

Access another user's profile

View another user's payment history

Modify another user's subscription

Access admin routes

Modify channel data

Modify payment records

24. Responsive Design

The entire website must be responsive.

Desktop:

Full navigation

Sidebar dashboard

Large video player

Channel grid

Tablet:

Responsive grid

Collapsible navigation

Mobile:

Bottom/mobile navigation where appropriate

Touch-friendly controls

Mobile video player

Responsive cards

Responsive dashboard

Make sure there is no horizontal scrolling.

25. UI/UX Design

Use a modern premium streaming-platform design.

Design inspiration can be similar in usability to modern OTT platforms, but do not copy another company's branding or copyrighted UI.

Use:

Dark modern streaming theme

Clean typography

Rounded cards

Professional buttons

Smooth hover effects

Skeleton loading

Empty states

Error states

Toast notifications

Confirmation dialogs

Use consistent spacing and responsive components.

26. Important Pages

Create these routes:

Public:

/
/live-tv
/channel/:slug
/pricing
/about
/contact
/faq
/login
/register
/forgot-password

User:

/dashboard
/dashboard/profile
/dashboard/subscription
/dashboard/payments
/dashboard/favorites
/dashboard/history
/dashboard/settings

Admin:

/admin
/admin/users
/admin/channels
/admin/categories
/admin/packages
/admin/subscriptions
/admin/payments
/admin/reports
/admin/settings

27. SEO

Implement basic SEO:

Dynamic page titles

Meta descriptions

Open Graph metadata

SEO-friendly URLs

Sitemap-ready architecture

Proper heading hierarchy

Semantic HTML

Fast loading

28. Performance

Optimize for performance:

Lazy load channel images

Lazy load video player

Optimize images

Use pagination for large tables

Avoid unnecessary database queries

Use caching where appropriate

Use loading skeletons

Optimize mobile performance

29. Error Handling

Create professional error handling.

Examples:

Invalid login

Email already exists

Payment failed

Payment pending

Subscription expired

Channel unavailable

Stream unavailable

Network error

Unauthorized access

Admin access denied

Show user-friendly messages instead of technical errors.

30. Demo Data

Create realistic demo data for development:

At least:

8 sample channels

5 categories

3 subscription packages

Sample user account

Sample admin account

Clearly mark demo streaming URLs as placeholders.

Do not use unauthorized third-party TV streams.

31. Final Development Requirements

Before considering the project complete:

Make sure registration works.

Make sure login/logout works.

Make sure password reset works.

Make sure user dashboard works.

Make sure admin dashboard works.

Make sure role-based access works.

Make sure users can only access their own data.

Make sure channel management works.

Make sure package management works.

Make sure subscription logic works.

Make sure payment architecture is webhook-ready.

Make sure payment verification is server-side.

Make sure protected premium channels require an active subscription.

Make sure expired subscriptions cannot access premium channels.

Make sure responsive design works on mobile.

Make sure there are no console errors.

Make sure database relationships and RLS policies are correctly configured.

Make sure all sensitive keys are stored in environment variables.

Make sure the application is structured so a real payment gateway can be connected later without rebuilding the entire application.

Make sure only legally authorized streaming sources can be configured.

Important

Do not build a fake payment system that simply changes subscription status from the frontend.

Create the payment integration architecture properly with server-side verification and webhook support.

Start by building the complete UI, database schema, authentication, authorization, subscription logic, channel management, and admin dashboard.

Use clean, maintainable, scalable code and reusable components throughout the project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a865b7b8-30b4-471f-8895-eb4ae04fd4dd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
