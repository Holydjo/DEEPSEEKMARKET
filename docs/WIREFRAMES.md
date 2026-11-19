# HOLYDO MARKET — Wireframes & interaction notes

> **Approved and implemented in v1.** These wireframes remain the design record; the shipped
> implementation is documented in the [README](../README.md). Production screenshots live in
> `docs/screenshots` once captured.
>
> Open the review gallery: **[wireframes/index.html](../wireframes/index.html)**

## What is included

| Page | Desktop | Mobile | Full wireframe |
| --- | --- | --- | --- |
| Homepage | [PNG](../wireframes/screens/home-desktop.png) | [PNG](../wireframes/screens/home-mobile.png) | [home.html](../wireframes/home.html) |
| Search results | [PNG](../wireframes/screens/search-desktop.png) | [PNG](../wireframes/screens/search-mobile.png) | [search.html](../wireframes/search.html) |
| Provider profile | [PNG](../wireframes/screens/provider-desktop.png) | [PNG](../wireframes/screens/provider-mobile.png) | [provider.html](../wireframes/provider.html) |
| Provider sign-up | [PNG](../wireframes/screens/join-desktop.png) | [PNG](../wireframes/screens/join-mobile.png) | [join.html](../wireframes/join.html) |

Each wireframe is annotated on the page; the notes below record the decisions behind the annotations
and the states that still need implementation.

---

## 1. Homepage (`/`)

**Job:** turn a vague need into a located search in one action, then prove the marketplace is real
and trustworthy.

### Desktop structure

1. **Announcement bar** — launch city, approved provider count, provider CTA. Thin, dismissible.
2. **Header** — logo, primary nav, current location pill, log in, “List your service”. Location is
   always visible and editable.
3. **Hero** — editorial headline, one-line explanation, combined search (service + place) and primary
   Search button. Popular searches below remove the blank-field problem.
4. **Collage** — one main provider photo, one detail, an approval stamp, and a live provider mini-card.
   This is the first proof that profiles are real.
5. **Proof strip** — provider count, neighbourhood count, average rating/review volume.
6. **Categories** — eight tiles with live counts. “All 12 categories” for the rest.
7. **Close to you** — three provider cards, re-sortable by Nearby / Top rated / New. Each card shows
   photo, name, verified state, category, neighbourhood, rating, distance, service setting, and
   “from” price.
8. **Trust band** — plain-language approval explanation plus a real decision-record mock
   (application ID, checks, reviewer, date). The badge is earned, not decorative.
9. **Provider band** — invitation after demand is demonstrated; includes a dashboard preview and a
   plain “free during launch, no commission” promise.
10. **Neighbourhoods** — four place cards linking to filtered search; supports local SEO.
11. **Footer** — discover, provider, company, legal, language.

### Mobile structure

Header (logo + location + menu) → hero → stacked service/place fields + full-width Search → popular
chips → 2×3 category grid → horizontal “Close to you” cards → compact trust card → provider CTA →
horizontal neighbourhood cards → bottom tab bar (Explore, Search, Saved, Account).

### Behaviour & states

- **Location:** no silent geolocation. The customer taps “Use location” or picks a city/neighbourhood.
  The chosen place persists across visits.
- **Returning customer:** restores last place; “Close to you” may replace categories above the fold.
- **No nearby providers:** show nearest neighbourhoods and category links, not an empty carousel.
- **Search submit:** navigates to `/search?...` with the URL as the source of truth.
- **Loading:** skeletons at final card dimensions; no layout shift.

### Open question for approval

On mobile, categories appear before nearby providers on a first visit. On return visits, I propose
lifting nearby providers above categories. Confirm or keep a fixed order.

---

## 2. Search results (`/search`)

**Job:** compare nearby providers quickly, with filters that are powerful but never hide the result.

### Desktop structure

1. Compact header + full search strip (service, place, radius, Search).
2. Category chips with counts; current category selected.
3. Result summary: “38 providers near Le Plateau”, category, radius, sort, “Approved only”.
4. Active filter chips, each removable; “Clear all”.
5. **Left rail (sticky):** provider type, where they work, max price, rating, availability, distance.
   Clear/Apply at the bottom; live active count in the header.
6. **Centre list:** horizontal cards with photo, name, verified, open-today, category/neighbourhood,
   rating, distance, response time, service tags, price, duration, View profile + Request.
7. **Right map (sticky):** numbered/price pins, radius circle, “Search this area”, zoom/locate,
   OpenStreetMap attribution, “5 of 38 pins shown”, plus a “Can’t find the right fit? Ask” card.
8. Load more (12 at a time). No numbered pagination on mobile.

### Mobile structure

Search field + category chips → result count + sort → Filters / Map / Sort row → active filters →
130 px map preview → vertical result cards (photo left, decision data right, View) → load more →
bottom tab bar. Filters and map expand intentionally; no accidental full-screen takeovers.

### Behaviour & states

- **URL state:** `q`, `category`, `city`, `hood`, `lat`, `lng`, `radius`, `type`, `place`, `priceMax`,
  `rating`, `openNow`, `sort`. Shareable and back-button safe.
- **Filter application:** updates the count before applying on mobile (“Show 38 results”); desktop
  applies immediately and preserves scroll position.
- **Distance:** exact Haversine distance when an origin exists. If only a city is chosen, show
  neighbourhoods and no invented distance. Coordinates in URLs are rounded (~3 decimals).
- **Map/list sync:** hover/focus on a card highlights its pin; clicking a pin scrolls the card into
  view. The map never shows an unapproved provider.
- **Empty:** explain which constraint failed; offer “Extend to 10 km”, remove a filter, browse a nearby
  neighbourhood, or request a provider. Never pad results.
- **Loading:** card skeletons; map keeps its last known pins while the list updates.
- **Errors:** retry inline; do not erase the query.

### Open question for approval

On desktop, is the map always visible, or should it be a toggle as it is on mobile? I propose always
visible above 1100 px because it aids comparison; below that, it becomes a toggle.

---

## 3. Provider profile (`/providers/[slug]`)

**Job:** turn interest into a confident appointment request. The page must feel authored by the
provider, framed by HOLYDO’s verification.

### Desktop structure

1. Header + breadcrumb; share / save / report.
2. **Gallery:** one large photo + two smaller + “+6 photos”; lightbox on click.
3. **Identity:** verified badge, independent/business, open state, H1 name, rating + review count,
   category, neighbourhood, distance. Provider’s own about text.
4. **Quick facts:** home studio, travel radius, availability, reply time, languages, years active.
5. **Services & prices:** each service has name, description, price or “from”, duration, Request.
   Final price confirmed before appointment; no deposit required.
6. **Gallery strip:** more work, link to all photos.
7. **Opening hours:** full week, today highlighted, “open now”, appointment-only note, last booking
   window.
8. **Service area:** approximate map circle (never an exact home pin), accepted neighbourhoods,
   travel fee, stated before confirmation.
9. **Reviews:** 4.9 average, count, distribution, most-mentioned terms; cards with avatar, date,
   stars, “Booked via HOLYDO”, service tag, helpful count.
10. **Similar providers:** two nearby, comparable cards.
11. **Sticky right rail:** from-price, primary Request appointment, secondary Message, reply time,
    free-to-request, today’s hours, area, travel fee, languages, contact icons, privacy note,
    “Checked by HOLYDO” receipt, safety note.
12. Footer.

### Mobile structure

Full-bleed gallery with back/save/share → identity + verified/open → about → quick facts → anchor row
(Services · Hours · Area · Reviews · Photos) → services with Request buttons → hours → service area
map → reviews → safety note → sticky bottom Request bar (price + Message + Request). No bottom tab bar
on this page, so the CTA owns the bottom edge.

### Request sheet

- Step 1: service, preferred date, morning/afternoon/evening, name, phone or email, optional note.
- Shows “No payment now” and the provider’s typical reply time.
- Step 2: review the request and confirm; sends a reference.
- Account is not required before sending; the confirmation offers account creation to track follow-ups.

### Behaviour & states

- **Approved only:** draft, pending, rejected, and suspended providers return 404. Requests stop.
- **No reviews yet:** “New on HOLYDO” + verified profile note, not fake social proof.
- **No photos:** category cover, never a stock face.
- **No hours / closed today:** explicit “Closed today” and next opening.
- **Phone/messaging:** hidden until a request is made; protects provider privacy and keeps the first
  contact structured.
- **SEO:** canonical URL, LocalBusiness + Service + AggregateRating structured data, share image.
- **Safety:** deposit warning, report path, and clear “request ≠ confirmed appointment” language.

---

## 4. Provider sign-up (`/provider/join`)

**Job:** let a provider submit a complete, trustworthy profile with minimum confusion and zero risk of
accidental publishing.

### Seven steps

| # | Step | Required content |
| --- | --- | --- |
| 1 | Account | Full name, email, password, phone, terms. Creates user + draft provider in one transaction. |
| 2 | Your business | Independent/business, public name, main category, tagline (optional), about (min 80 chars), city, neighbourhood, service settings. |
| 3 | Services & prices | At least one service: name, price / from, duration, description, optional category. |
| 4 | Photos | At least one real photo; up to 8; camera or library on mobile; alt text; crop preview. |
| 5 | Location & area | Public neighbourhood, private street address, travel radius, neighbourhoods served. |
| 6 | Hours | At least one open interval; closed days; appointment-only toggle. |
| 7 | Review & submit | Completeness checklist, preview, provider agreement, submit for approval. |

### Desktop structure

Minimal header with Save & exit and help → progress header (step x of 7 + 7-segment bar) → sticky
left step rail with statuses and an approval-time card → centre form card (one job per step) →
right live preview of the public card + submission checklist → footer legal links.

### Mobile structure

Close (X), step title, Save & exit, segmented progress → one step per screen → sticky Back / Save /
Continue bar → same validation and autosave. The application is resumable.

### Behaviour & states

- **Autosave:** on blur and every 20 seconds. “Save & exit” emails a resume link. Returning providers
  land on the first incomplete step.
- **Validation:** inline, visible; submit disabled with a reason. Required: type, name, category,
  about, ≥ 1 service, ≥ 1 photo, city/neighbourhood, ≥ 1 service setting, ≥ 1 opening interval.
- **Service settings:** at my home studio / at a salon / at a shop / I travel to the client. These
  become search filters and card tags.
- **Public vs private:** city + neighbourhood public; street address private until a request is
  accepted; map shows an approximate area.
- **Submit:** status → PENDING; private confirmation screen; email receipt; target review < 48 h.
- **Rejected:** reviewer note, highlighted fields, edit + resubmit.
- **Approved:** public profile, share link, dashboard access, first-request guidance.
- **Suspended:** profile hidden, reason + appeal contact, requests paused.

### Approval state machine

```
DRAFT ──submit──▶ PENDING ──approve──▶ APPROVED ──suspend──▶ SUSPENDED
  ▲                  │                    ▲                    │
  │                  └──reject──▶ REJECTED ──resubmit─────────┘
  └──────────────────── edit ◀─────────────────────────────────┘
```

---

## Cross-cutting components

| Component | Rule |
| --- | --- |
| Provider card | Photo, name, verified badge, category, place, distance, rating, service setting, from-price. Whole card is tappable; heart is separate. |
| Verified badge | Derived only from `status = APPROVED`. Never hand-set. Tooltip explains what was checked. |
| Category tile | Icon, name, live count. Links to filtered results. |
| Filter controls | Real checkboxes with labels and counts; mobile uses a bottom sheet; apply is explicit with a live result count. |
| Location picker | City / neighbourhood curated list + optional device location. Coordinates rounded in URLs. |
| Empty state | Explains the failed constraint and offers 2–3 concrete next steps. No filler results. |
| Skeleton | Matches final card dimensions. |
| Toast | Confirms saving, request sent, filter applied. Not used for errors that need a fix. |
| Dialog / sheet | Radix-based, focus trapped, ESC/backdrop closes, returns focus to trigger. |

## Content & tone

- Plain, warm, specific. “Good work, right around the corner.” — not “Unlock your potential.”
- Prices in CAD with clear “from” semantics; durations in hours/minutes.
- Provider voice is preserved in bios and service descriptions; HOLYDO writes the frame, not the person.
- Trust copy names what is checked and when, and explains what “verified” does not mean.

## Accessibility requirements

- WCAG 2.1 AA contrast; no colour-only status (pair with text/icon).
- Visible focus rings; 44 × 44 px minimum targets on mobile.
- Real form labels, `aria-describedby` for hints/errors, `aria-live` for validation and result counts.
- Dialog focus trap and restoration; keyboard-operable filters, map pins, and photo lightbox.
- Alt text required for provider photo uploads.
- Reduced-motion support; no autoplaying carousels.

## What these wireframes deliberately do not decide

- Exact final photography, logo artwork, or illustration style (no assets exist yet).
- Final type scale and spacing tokens (direction set; values will be tuned in build).
- French/English toggle placement (v1 is English; structure is translation-ready).
- Payments, deposits, calendar sync, or messaging threads (out of scope for v1).

## Approval checklist

- [ ] Homepage: search, categories, nearby proof, and approval story in the right order.
- [ ] Search: filters, map, result cards and empty state.
- [ ] Provider profile: services/prices, hours, area, reviews, sticky request rail.
- [ ] Sign-up: 7 steps, draft autosave, service settings, pending state.
- [ ] Mobile patterns: bottom nav, sticky CTA, bottom sheet.
- [ ] Brand direction: ink / paper / marigold / pine, Fraunces + Inter.
- [ ] Launch market: Montréal seed data (or specify another).
- [ ] Booking model: appointment requests confirmed by the provider (no payments).

Reply **“approved”** with any changes, or mark specific items above. I will not build the interface
until this gate is cleared.
