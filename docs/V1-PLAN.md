# HOLYDO MARKET — Version 1 plan

> Status: **approved and implemented as v1.** This document is retained as the scope and
> design record. See the [README](../README.md) for what shipped, how to run it, and verified
> limitations. Wireframes: [WIREFRAMES.md](./WIREFRAMES.md) · Findings:
> [REPOSITORY-REVIEW.md](./REPOSITORY-REVIEW.md)

## 1. Product in one sentence

HOLYDO MARKET helps people find trusted local service providers — hair, braids, beauty, cleaning,
repairs and more — by neighbourhood, and gives independent providers and small businesses a
verified storefront to be discovered, contacted, and booked.

## 2. Product principles

1. **Local first.** Location is part of the search, not a setting buried in a menu. Every result
   answers "how far is this from me?"
2. **Human verification.** Every public provider has been reviewed by a real administrator. The
   badge is earned, explained, and visible.
3. **Low-friction contact.** A customer can go from landing to an appointment request in under a
   minute, without creating an account first.
4. **Provider dignity.** The provider dashboard is a working tool, not a marketing page: clear
   status, clear requests, editable profile.
5. **Mobile is the product.** Designed at 390 px first, then expanded. Desktop gets more canvas,
   not a different product.
6. **Original by construction.** References inform structure and rhythm only. No copied layouts,
   copy, logos, imagery, or code.

## 3. Target users

| Persona | Need | V1 success signal |
| --- | --- | --- |
| **Customer** — e.g. Amina, 29, new in the neighbourhood | Find a trusted braider or cleaner nearby this week, see real prices, make contact | Reaches a provider profile and sends a request in < 5 minutes |
| **Independent provider** — e.g. Nadia, braider working from home | Be discoverable beyond Instagram DMs; control her services and hours | Completes a profile and submits it for approval |
| **Business owner** — e.g. Marc, repair shop | Show services, location and opening hours to nearby customers | Receives and manages appointment requests |
| **Administrator** — HOLYDO staff | Keep the marketplace trustworthy without slowing genuine providers | Reviews a submission with enough evidence to approve or reject confidently |

## 4. V1 scope

### Must ship

**Customer**
- Home page with service + location search, category browse, nearby providers and neighbourhood links.
- Search results with category, city/neighbourhood, optional device location, radius, filters, sort, and a map.
- Provider profile with gallery, about, services and prices, opening hours, service area, reviews, contact and appointment request.
- Guest appointment request (name, contact, preferred date/window, note) and confirmation screen.
- Customer account: sign up, log in, leave a review, save favourites (favourites may be a stretch; see Should).
- Static pages: How it works, For providers, Trust & safety, Contact, Privacy/Terms stubs.

**Provider**
- Free account creation and provider onboarding wizard (7 steps, saveable draft).
- Independent vs. business type.
- Services, prices, photos, opening hours, base location, travel radius, and service settings (at my place / salon / shop / travel to client).
- Submit for approval; see status (draft, pending, approved, rejected with reason).
- Personal dashboard: profile editor, services CRUD, photos, hours, availability note, appointment request inbox, review list.
- Public profile is only visible after approval.

**Admin**
- Seeded admin account and protected `/admin`.
- Pending applications queue, application detail, approve / reject with a required reason.
- All providers list with status, suspend/reinstate.
- Audit trail of approval decisions.

### Should ship (if time allows)
- Saved providers for customers.
- Provider response templates for requests.
- Review moderation (hide/report).
- "Open now" and next-available hint.
- Basic analytics on the dashboard (profile views, request count).

### Explicitly not in v1
- Payments, deposits, payouts, commissions.
- Real-time calendar sync or instant confirmation.
- Native iOS/Android binaries (the product ships as an installable PWA; the mobile web app is the mobile product).
- In-app chat threads (contact happens by request, phone, WhatsApp, email).
- Multi-language UI (copy is written to be translation-ready; English v1).
- Subscription plans or promoted listings.

## 5. Technology

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js (App Router) + TypeScript** | One codebase for server-rendered pages, route handlers and server actions; strong SEO for provider pages; easy deploy. |
| Styling | **Tailwind CSS v4** + small design-token layer + CSS variables | Fast, consistent mobile-first UI without a heavy component library. |
| UI primitives | Radix UI (dialog, select, tabs, popover) + custom components | Accessible behaviour without adopting an opinionated visual system. |
| Data | **Prisma + SQLite** (dev/v1), Postgres-ready schema | Zero-setup local demo; one provider swap for production. |
| Validation | **Zod** | Shared server/client validation, typed forms. |
| Auth | Email + password, **Argon2id** hash, database-backed sessions, HttpOnly cookies | No third-party dependency for v1; roles and approval are product-specific. |
| Images | Local uploads in dev, served through a validation + resize route; seed images from a licensed/placeholder source | Uploads are essential to the provider journey. Production swaps to S3/Cloudinary. |
| Maps | **Leaflet + OpenStreetMap** tiles | No API key or billing; sufficient for v1 discovery. |
| Testing | Vitest for logic, Playwright for the two critical journeys | Protects approval state and search/booking flows. |
| Quality | ESLint, Prettier, `tsc --noEmit` | Boring, reliable baseline. |

**Deployment assumption:** Vercel or any Node host. SQLite is deliberately a v1/demo choice; the
schema uses no SQLite-specific features, and the README will document the Postgres switch.

## 6. Information architecture

```
/                               Home — search, categories, near you
/search                         Results with filters + map (query state in URL)
/providers/[slug]               Public provider profile (APPROVED only)
/categories/[slug]              Category landing → filtered search
/cities/[city]                  City/neighbourhood landing → filtered search
/how-it-works                   Customer explanation
/for-providers                  Provider value proposition → join
/provider/join                  7-step onboarding (auth required after step 1)
/login, /signup                 Customer + provider entry
/account                        Customer account, requests, reviews, saved
/provider/dashboard             Provider overview + status
/provider/dashboard/profile     Edit profile, photos, hours, area
/provider/dashboard/services    Service CRUD
/provider/dashboard/requests    Appointment request inbox
/provider/dashboard/reviews     Reviews
/admin                          Admin overview
/admin/applications             Pending queue
/admin/applications/[id]        Review + approve/reject
/admin/providers                All providers, suspend/reinstate
```

All search/filter state lives in the URL (`?q=braids&city=montreal&hood=plateau&radius=5&sort=distance`),
so results are shareable and the back button behaves.

## 7. Data model (v1)

```
User          id, name, email (unique), passwordHash, phone?, role (CUSTOMER|PROVIDER|ADMIN),
              createdAt, updatedAt
Session       id, tokenHash (unique), userId, expiresAt, createdAt
Provider      id, userId (unique), slug (unique), type (INDEPENDENT|BUSINESS), status
              (DRAFT|PENDING|APPROVED|REJECTED|SUSPENDED), displayName, legalName?,
              tagline?, about, categoryId, logoUrl?, coverUrl?, addressLine, city,
              neighbourhood, postalCode?, lat, lng, travelRadiusKm, servesAtHome, servesAtSalon,
              servesAtShop, travelsToClient, phone, email, website?, instagram?, languages,
              responseTimeHours?, submittedAt?, reviewedAt?, reviewedById?, reviewNote?,
              ratingAvg, ratingCount, createdAt, updatedAt
Category      id, slug, name, blurb, icon, sortOrder, isActive
Service       id, providerId, categoryId?, name, description?, priceCents, priceType
              (FIXED|FROM|HOURLY), durationMin?, isActive, sortOrder
ProviderPhoto id, providerId, url, alt, sortOrder
OpeningHour   id, providerId, dayOfWeek (0–6), opensAt?, closesAt?, isClosed
ServiceArea   id, providerId, label (neighbourhood or city), city
BookingRequest id, providerId, serviceId?, customerUserId?, name, email, phone,
              preferredDate, preferredWindow (MORNING|AFTERNOON|EVENING), message?,
              status (PENDING|ACCEPTED|DECLINED|COMPLETED|CANCELLED), createdAt, respondedAt?
Review        id, providerId, authorUserId, bookingRequestId?, rating (1–5), body,
              status (PUBLISHED|HIDDEN), isVerified, createdAt
AdminAction   id, adminUserId, providerId, action (APPROVE|REJECT|SUSPEND|REINSTATE),
              note, createdAt
```

Indexes: provider `(status, city, categoryId)`, `(lat, lng)`, service `(providerId, isActive)`,
booking `(providerId, status, createdAt)`, review `(providerId, status)`.

### Approval state machine

```
DRAFT ──submit──▶ PENDING ──approve──▶ APPROVED ──suspend──▶ SUSPENDED
  ▲                  │                     ▲                     │
  │                  └──reject (note)──▶ REJECTED ──resubmit──┘
  └────────────────────── edit ◀────────────────────────────────┘
```

Rules:
- Only `APPROVED` providers are publicly queryable, indexable, and visible in search.
- Submission is blocked until required fields exist: type, display name, category, about (min
  80 chars), at least one active service, at least one photo, base location, at least one opening
  hour, and at least one service setting.
- Approval/rejection writes an `AdminAction` with the admin id, timestamp, and note.
- Rejection shows the note to the provider and allows edits + resubmission.
- Suspension hides the profile immediately; requests already received remain visible to the provider.
- "Verified" in the UI is derived only from `status = APPROVED` (and is removed if suspended).

## 8. Search & location

1. **Query inputs**: free text `q`, category, city, neighbourhood, radius (1/3/5/10/25 km), filters
   (provider type, service setting, price ceiling, min rating, open now), sort (recommended,
   distance, rating, price).
2. **Location resolution**:
   - Device geolocation (explicit button, never automatic on load) sets `lat`/`lng`.
   - Otherwise a curated city/neighbourhood list provides coordinates (seeded).
   - Fallback: city-wide results, no fake distance; distance labels say "City centre".
3. **Distance**: Haversine computed server-side in a small helper. For v1's dataset, filtering in
   application code after a status/category/city DB filter is acceptable and exact. A comment
   marks the production upgrade path (PostGIS / geohash + bounding box).
4. **Privacy**: coordinates are rounded to ~3 decimals in URLs and never shown publicly; provider
   public location is neighbourhood + approximate map circle, not a home address.
5. **Empty state**: explain which filter to relax, show nearby cities, and offer "Tell us what
   you're looking for" (stores a request — a small, useful lead capture).

## 9. Design direction

**Concept: "the neighbourhood noticeboard, reimagined."** Warm paper, confident serif headlines,
photography of real work and real hands, ink borders and stamp-like verification marks. Friendly
and local, but precise enough to trust with an appointment.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#17130F` | Text, borders, footer |
| Paper | `#F6F0E4` | Page background |
| Surface | `#FFFDF8` | Cards, sheets |
| Marigold | `#F2B33D` | Primary accent, highlights, search CTA |
| Clay | `#C9502E` | Secondary accent, important actions, badges |
| Pine | `#173D2E` | Trust band, provider CTA, status success |
| Muted | `#6F665A` | Metadata |
| Line | `#DED4C2` | Dividers |

- **Typography**: Fraunces (display serif, variable optical size) + Inter (UI). Large editorial
  hero (clamp 44–88 px), tight tracking on display, comfortable 16 px body.
- **Shape & texture**: 18–28 px radii, 1 px ink borders, soft "sticker" offset shadows on feature
  cards, rounded pills for categories, no glassmorphism or neon gradients.
- **Mobile**: sticky top bar with location; bottom tab bar (Explore, Search, Saved, Account);
  filters in a bottom sheet; provider profile has a sticky "Request" bar.
- **Desktop**: 12-column grid, max width 1240 px, sticky booking card on profiles, map beside results.
- **Motion**: 150–250 ms ease-out for hover, sheet, and reveal; `prefers-reduced-motion` respected.
- **Accessibility**: WCAG 2.1 AA contrast, visible focus rings, 44 px targets, labelled forms,
  keyboard-operable dialogs, alt text required on uploads.
- **Imagery**: provider-uploaded photos, seeded with original/placeholder imagery only; no copied
  Awwwards assets.

### What we take from each reference (structure only)

| Reference | Structural idea used | Deliberately not used |
| --- | --- | --- |
| Parkbench | Community framing: neighbourhoods as first-class destinations, warm human tone, local trust | Their brand, layout, copy, logo |
| The Gigs | Marketplace logic: browse categories → compare providers → view profile → request | Their visual identity, cards, wording |
| Sparker | Listings presentation: strong category entry points, filter/map results, mobile-first directory cards | Their template design, code, assets |

## 10. Customer journey (v1)

| # | Stage | Screen | What the customer does | What the product does | Edge states |
| --- | --- | --- | --- | --- | --- |
| 1 | Discover | `/` | Lands from search/social; sees categories + nearby providers | Detects nothing silently; offers location button and city picker | Returning user sees last city |
| 2 | Search | `/` hero | Types "braids", picks "Le Plateau", hits Search | Builds URL state, resolves coordinates, queries approved providers | No query → popular categories |
| 3 | Compare | `/search` | Scans cards, filters by travel/price/rating, toggles map | Shows distance, price from, verified state, open now; updates URL | Empty → relax filters / nearby city |
| 4 | Evaluate | `/providers/[slug]` | Reviews photos, services, prices, hours, area, reviews | Shows approved profile, next availability, trust markers | Unapproved → 404 |
| 5 | Request | Booking sheet | Picks service, date, time window, leaves note + contact | Validates, stores request, notifies provider | Guest allowed; spam/rate limited |
| 6 | Confirm | `/requests/[id]/confirmation` | Sees what happens next | Confirms request reference and provider response expectation | Provider declines → email with alternatives |
| 7 | Follow-up | Email / `/account` | Provider accepts, they arrange details | Status updates; review invite after completion | No response → reminder after 24 h |

**Emotional arc:** curious → oriented → confident → reassured → committed. The trust band and
verified stamp appear before the first request, not after.

## 11. Service-provider journey (v1)

| # | Stage | Screen | What the provider does | What the product does | Edge states |
| --- | --- | --- | --- | --- | --- |
| 1 | Consider | `/for-providers` | Reads benefits, sees "free during launch" | Explains approval, effort, and what customers see | Signed in → resume draft |
| 2 | Create account | `/provider/join` | Name, email, password, phone, terms | Creates user + draft provider in one transaction | Email exists → log in |
| 3 | Choose type | Step 2 | Independent or business | Adapts labels/fields (legal name, team size) | Can change later |
| 4 | Build profile | Steps 3–6 | Category, about, services/prices, photos, location, hours, service settings | Autosaves draft; validates completeness; previews public card | Incomplete → clear inline errors |
| 5 | Submit | Step 7 | Confirms and submits | Status `PENDING`; confirmation screen; email receipt | Withdraw/edit before review |
| 6 | Wait | `/provider/dashboard` | Sees pending banner and checklist | Explains review window (target < 48 h) | Rejected → reason + fix + resubmit |
| 7 | Go live | Email + dashboard | Shares profile link | Status `APPROVED`; profile public; analytics start | Suspended → explanation + appeal |
| 8 | Operate | Dashboard | Edits services/hours, reads requests, accepts/declines | Updates public page live; request status + customer email | No requests → profile tips |
| 9 | Grow | Dashboard | Reads reviews, updates availability | Review summary, response prompts | Bad review → report/moderation |

## 12. Admin journey (v1)

1. Log in with the seeded admin account (credentials printed once in setup; changeable).
2. `/admin` shows pending count, oldest waiting application, recent decisions.
3. `/admin/applications/[id]` shows the full application, photos, services, declared location,
   contact details, and a checklist of required evidence.
4. Admin **approves** (profile goes live immediately) or **rejects with a required note**
   (provider sees the note and can resubmit).
5. Every decision is recorded in `AdminAction`; `/admin/providers` supports suspension/reinstatement.

## 13. Milestones

| Milestone | Deliverable | Acceptance |
| --- | --- | --- |
| **M0 — Align** | Repository review, v1 plan, 4 wireframes | You approve the direction and wireframes |
| **M1 — Foundation** | Next.js app, tokens, layout, seed data, Prisma schema, migrations, README | `pnpm dev` runs; home renders from DB; lint/typecheck pass |
| **M2 — Discovery** | Home, search + filters + map, category/city pages, provider profile | Search by city/neighbourhood works; approved-only visibility verified |
| **M3 — Supply** | Provider auth, 7-step onboarding, dashboard, services/photos/hours/area editing | A new provider can go draft → submitted |
| **M4 — Trust & demand** | Admin queue + decisions, appointment requests + inbox, reviews | Approve → public; request → provider inbox → accept; review appears |
| **M5 — Polish** | Mobile bottom nav, empty/loading/error states, PWA manifest, a11y pass, Playwright journeys, deployment notes | Customer + provider journeys pass end-to-end; Lighthouse mobile ≥ 90 |

## 14. Definition of done for v1

- A first-time visitor can search by category + neighbourhood, open a provider, and send an
  appointment request on a 390 px viewport without horizontal scroll.
- A new provider can create an account, complete every profile section, submit, and see a pending
  status; an admin can approve or reject with a note.
- Only approved providers appear in search, sitemap, and public routes.
- The provider dashboard can edit profile/services/hours and see incoming requests.
- Seeds make the product feel alive (≥ 12 providers, ≥ 6 categories, photos, reviews, realistic
  prices in CAD, Montréal neighbourhoods).
- `README.md` documents setup, seeded accounts, scripts, and the Postgres switch.
- Comments explain non-obvious decisions; no copied assets or code.

## 15. Decisions I need from you

1. **Approve the wireframes and direction** (or mark changes) — this is the required gate.
2. **Launch market for demo data**: I propose **Montréal** (neighbourhoods such as Le Plateau,
   Rosemont, Little Burgundy, Villeray). It is easy to switch to another city via seed data.
3. **Language**: English UI for v1. French-ready copy and structure; say if bilingual is required now.
4. **Brand name treatment**: "HOLYDO MARKET" wordmark, with the shorter "HOLYDO" used in compact
   mobile contexts. No external logo exists, so I will design a simple typographic mark.
5. **Appointment requests vs. instant booking**: v1 proposes requests the provider confirms. Real
   availability calendars are a later phase.
