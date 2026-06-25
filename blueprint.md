Build a **world-class premium football ecosystem website** for **CBFC (Community Based Football Club)** using:

* **Next.js 15**
* **React**
* **TypeScript**
* **SCSS / Sass architecture**
* **Framer Motion**
* **PostgreSQL**
* **Node.js backend APIs**
* **Role-based admin dashboard**
* **AWS S3 / media-ready structure**

---

# PROJECT OVERVIEW

Create a premium, modern, international-standard football ecosystem platform for **CBFC**.

This is **not just a football club website** and **not just an agency website**.

The platform must operate as a **complete football ecosystem** with **three connected divisions**:

1. **CBFC Academy**

   * Youth talent development
   * Football education
   * Training programs
   * Academy registration

2. **CBFC Agency**

   * Player representation
   * Scouting exposure
   * Trial placement
   * International opportunities
   * Recruitment inquiries

3. **CBFC Professional Football Club**

   * Senior football team
   * Professional player development
   * Match representation
   * Club achievements and fixtures

The website must clearly communicate the pathway:

**Academy → Agency → Professional Club → International Opportunities**

The final product should feel like a fusion of:

* a top European football academy website
* a modern player scouting / agency platform
* a professional football club website
* a luxury sports brand experience

This must feel **custom-built, premium, cinematic, and high-end**, not like a generic template.

---

# BRAND / DESIGN SYSTEM

## Primary Color Palette (Use this exact palette)

### Core Brand Colors

* **Premium Gold**: `#C8A75D`
* **Charcoal Black**: `#121212`

### Supporting Colors

* **Dark Surface**: `#1B1B1B`
* **White**: `#FFFFFF`
* **Soft Light Background**: `#F5F5F5`
* **Light Gold Accent**: `#E2C68B`
* **Muted Gray**: `#B8B8B8`
* **Border Gray**: `#2A2A2A`
* **Success Green**: `#2E8B57`
* **Danger / Alert Red**: `#C0392B`

## Best UI Color Usage Rules

Use the palette this way:

* **Main background (dark premium sections):** `#121212`
* **Secondary dark cards / elevated sections:** `#1B1B1B`
* **Gold highlights / CTAs / hover accents / borders / stat emphasis:** `#C8A75D`
* **Soft premium hover accent / gradient support:** `#E2C68B`
* **Primary text on dark backgrounds:** `#FFFFFF`
* **Muted supporting text:** `#B8B8B8`
* **Borders / dividers:** `#2A2A2A`
* **Light sections if needed:** `#F5F5F5`

## Visual Direction

The website should feel:

* premium
* luxurious
* cinematic
* football-focused
* international
* elite
* modern
* editorial
* fast and smooth
* mobile-first

## Visual Style Requirements

* Full-width premium hero sections
* Large football imagery
* Glassmorphism accents where appropriate
* Elegant hover animations
* Sophisticated typography
* Cinematic football visuals
* Smooth transitions using Framer Motion
* Strong spacing system
* High-end cards
* Dark luxury aesthetic with gold accents
* Sticky navigation
* Clear hierarchy and premium layout rhythm

Avoid:

* generic sports template styling
* excessive rounded toy-like UI
* random colors outside the palette
* overcrowded layouts

---

# TECHNICAL REQUIREMENTS

## Stack

Use:

* **Next.js 15 App Router**
* **TypeScript**
* **SCSS Modules + global SCSS architecture**
* **Framer Motion**
* **PostgreSQL**
* **Node.js / Next server actions or API routes**
* **Role-based authentication**
* **SEO-ready metadata**
* **Image optimization**
* **Responsive design**
* **Lazy loading where appropriate**

---

# SCSS ARCHITECTURE (IMPORTANT)

Do **not** use Tailwind.

Set up the project with a **proper SCSS folder structure**.

## Required SCSS structure

```bash
src/
  app/
  components/
  features/
  lib/
  types/
  styles/
    abstracts/
      _variables.scss
      _colors.scss
      _mixins.scss
      _breakpoints.scss
      _animations.scss
      _functions.scss
    base/
      _reset.scss
      _typography.scss
      _globals.scss
      _utilities.scss
    layout/
      _container.scss
      _grid.scss
      _sections.scss
      _header.scss
      _footer.scss
    components/
      _buttons.scss
      _cards.scss
      _forms.scss
      _badges.scss
      _modals.scss
      _video-card.scss
      _player-card.scss
      _stats.scss
    pages/
      _home.scss
      _academy.scss
      _players.scss
      _player-profile.scss
      _agency.scss
      _club.scss
      _video-hub.scss
      _movement.scss
      _news.scss
      _contact.scss
      _admin.scss
```

## Main SCSS file

Create one major SCSS entry file outside the subfolders:

```bash
src/styles/main.scss
```

This `main.scss` should import all partials in the correct order.

Example import order:

1. abstracts
2. base
3. layout
4. components
5. pages

Also set up CSS variables for the brand colors and spacing system.

---

# PROJECT STRUCTURE

Use a scalable structure like this:

```bash
src/
  app/
    (public)/
      page.tsx
      academy/
      players/
      agency/
      club/
      video-hub/
      player-movement/
      news/
      contact/
      player/[slug]/
    admin/
    api/
  components/
    common/
    layout/
    home/
    academy/
    players/
    agency/
    club/
    video/
    news/
    contact/
    admin/
  features/
    academy/
    players/
    agency/
    club/
    media/
    news/
    inquiries/
    dashboard/
  lib/
    db/
    utils/
    constants/
    validators/
    actions/
  types/
```

---

# GLOBAL LAYOUT REQUIREMENTS

## Sticky Navbar

Create a premium sticky navigation bar.

### Left

* CBFC logo

### Center / Main Menu

* Home
* Academy
* Players
* Agency
* Professional Club
* Video Hub
* Player Movement
* News
* Contact

### Right CTA

* **Join CBFC**

Navbar requirements:

* visible while scrolling
* transparent/overlay on hero initially if appropriate
* transitions into a darker solid background on scroll
* mobile menu support
* premium hover states
* active route indication

## Footer

Create a premium multi-column footer including:

* CBFC overview
* quick links
* contact details
* social links
* academy / agency / club links
* newsletter / contact CTA
* copyright

---

# WEBSITE PAGES & FEATURES

---

# 1) HOMEPAGE

Build a cinematic homepage.

## Hero Section

Split hero into **three pillars**:

1. Academy
2. Agency
3. Professional Club

### Hero Content

**Headline:**
**From Talent Discovery To Professional Success**

**Subheadline:**
CBFC develops, represents, and advances football talent through our Academy, Agency, and Professional Club structure.

### CTA Buttons

* Explore Players
* Join Academy
* Contact Agency

### Hero Visual Direction

* dynamic football imagery
* premium dark overlay
* gold accents
* cinematic composition
* motion effects
* depth and layered content
* possibly a 3-column visual storytelling section for the three divisions

---

## About CBFC Section

Introduce CBFC as a complete football ecosystem.

Display 3 premium cards:

* **Academy** — developing future football stars
* **Agency** — creating global opportunities for players
* **Professional Club** — competing and developing elite talent

Use icons, hover effects, premium card design, and strong copy hierarchy.

---

## Statistics Section

Animated counters for:

* Registered Players
* Academy Graduates
* Players Abroad
* Players On Trial
* Scout Requests
* Club Matches Played
* Professional Placements

Use premium stat cards and number animations.

---

## Featured Players Section

Display premium player cards with:

* player photo
* name
* position
* nationality
* age
* current status

Hover state should reveal:

* quick view
* stat preview
* “View Profile” CTA

---

## Latest Activity Section

Build a dynamic premium timeline / activity feed for:

* trial updates
* camp invitations
* player achievements
* international opportunities
* agency news
* club updates

---

## Video Highlights Section

Show:

* featured player highlights
* match clips
* academy training videos
* club highlights

Use premium video cards.

---

# 2) ACADEMY PAGE

Create a full Academy section.

## Academy Hero

Headline:
**Developing Tomorrow’s Football Stars**

Show:

* training sessions
* coaches
* youth players
* academy environment

## Age Categories

Interactive cards for:

* U10
* U13
* U15
* U17
* U19

## Academy Programs

Show:

* Technical Development
* Tactical Development
* Physical Conditioning
* Mental Development
* Match Exposure
* Leadership Development

## Academy Facilities

Show:

* Training Ground
* Gym
* Classrooms
* Medical Support
* Recovery Area

Use gallery / premium cards.

## Academy Gallery

Include:

* training
* tournaments
* camps
* matchdays

## Academy Registration Form

Fields:

* Full Name
* Date of Birth
* Position
* Height
* Preferred Foot
* Parent/Guardian Name
* Email
* Phone Number
* Previous Club

CTA:
**Apply To Join Academy**

---

# 3) PLAYERS DIRECTORY PAGE

Create a premium player discovery page.

## Search / Filter

Search by:

* player name

Advanced filters:

* position
* age
* nationality
* status
* academy graduate
* professional player

## Player Cards

Each card should display:

* photo
* name
* position
* age
* nationality
* status

### Status Types

* Available For Trials
* On Trial
* Abroad
* In Development
* Professional Squad

CTA:

* Open Profile

---

# 4) PLAYER PROFILE PAGE (CORE FEATURE)

Route structure:

```bash
/player/[slug]
```

Example:
`/player/john-doe`

## Player Header

Display:

* professional photo
* full name
* date of birth
* age
* nationality
* position
* height
* weight
* preferred foot
* status badge

## Biography

Professional player summary section.

## Performance / Skill Section

Use skill tags / bars / premium visual chips for:

* Pace
* Vision
* Passing
* Dribbling
* Finishing
* Tackling
* Leadership
* Strength

## Achievements Timeline

Display:

* awards
* tournaments
* recognition
* milestones

## Previous Clubs

Professional history section.

## Statistics Section

Depending on position, show:

* matches played
* goals
* assists
* clean sheets
* minutes played

## Media Gallery

Include:

* highlight videos
* match clips
* professional photos

Features:

* fullscreen media support
* mobile optimized
* embedded video player
* premium gallery experience

## Player Movement Timeline

Track:

* academy entry
* camp participation
* agency representation
* trials
* professional team
* international opportunities

## Scout Contact CTA Area

Prominent CTA buttons:

* Request Player
* Contact Agency
* WhatsApp Inquiry

---

# 5) AGENCY PAGE

Dedicated agency division page.

Purpose:
Represent and promote players.

## Agency Services

Show:

* Player Representation
* Trial Placement
* Club Networking
* International Opportunities
* Career Development
* Contract Support

## Scout Interaction / Inquiry System

Create a premium inquiry form with:

* Scout Name
* Club Name
* Email
* Phone
* Message

CTA:
**Request Player**

---

# 6) VIDEO HUB PAGE

Create a scouting-focused media library.

## Filters

### By Position

* Goalkeeper
* Defender
* Midfielder
* Forward

### By Age

* U10
* U13
* U15
* U17
* U19
* Senior

## Featured Video

Large hero video showcase.

## Video Grid

Each video card should show:

* thumbnail
* player
* position
* duration

Optimize for:

* fast streaming
* lazy loading
* premium card layout

---

# 7) PROFESSIONAL CLUB PAGE

Dedicated senior team section.

## Club Hero

Headline:
**Representing Excellence On The Pitch**

Display:

* team photography
* stadium atmosphere
* match action shots

## First Team Squad

Player cards with:

* photo
* name
* position
* jersey number
* nationality

## Coaching Staff

Display:

* Head Coach
* Assistant Coach
* Fitness Coach
* Goalkeeping Coach
* Team Manager

## Fixtures & Results

Show:

* upcoming matches
* match results
* league position

## Club Statistics

Animated counters for:

* matches played
* wins
* goals scored
* clean sheets
* players developed

## Achievements

Trophies and honors section.

## Club Gallery

Photos and videos.

## Sponsorship CTA

Buttons:

* Become A Partner
* Sponsor CBFC
* Contact Club

---

# 8) PLAYER MOVEMENT PAGE

Create a player pathway / development page.

Categories:

* Available For Trials
* On Trial
* In Camp
* Abroad
* Professional Team

Use a premium timeline / pathway design.

Every player card should link to the full profile page.

---

# 9) NEWS & MEDIA PAGE

Create a modern magazine-style news center.

Categories:

* Academy News
* Player Updates
* Trial News
* Club News
* International Opportunities
* Agency Announcements

Features:

* featured article section
* category filters
* search
* article cards
* article detail page support

---

# 10) CONTACT PAGE

Create a premium contact page.

## Contact Form

Fields:

* Full Name
* Organization
* Email
* Phone
* Message

## Contact Info

Display:

* Email
* Phone
* WhatsApp
* Office Address

## Map

Embed Google Maps section placeholder / integration-ready block.

---

# ADMIN DASHBOARD

Build a secure role-based admin dashboard.

## Roles

At minimum:

* Super Admin
* Content Admin
* Academy/Admin Staff

## Admin Features

Manage:

* academy applications
* players
* coaches
* club squad
* videos
* images
* news
* inquiries
* player status / movement history

## Player Management

Admin must be able to:

* create player
* edit player
* delete player
* upload media
* update statistics
* update status
* update movement history

## News Management

* create articles
* edit articles
* publish news
* save drafts
* assign categories

## Inquiry Management

Track:

* scout requests
* academy applications
* club contacts

Statuses:

* New
* Pending
* Contacted
* Closed

---

# DATABASE / DATA MODELS

Design scalable TypeScript types and database models for the core entities.

## Player model fields

Include:

* id
* fullName
* slug
* profilePhoto
* dateOfBirth
* age
* nationality
* position
* height
* weight
* preferredFoot
* biography
* strengths
* statistics
* achievements
* previousClubs
* videos
* images
* movementHistory
* status
* academyGraduate
* professionalPlayer
* createdAt
* updatedAt

## Additional entities to model

Also create structures for:

* academy applications
* scout inquiries
* news articles
* videos
* club staff
* fixtures/results
* player movement records
* player achievements
* player stats
* gallery items
* contact inquiries

Use clean, scalable TypeScript interfaces / types.

---

# UX / UI REQUIREMENTS

## Must Have

* mobile-first responsiveness
* elegant animations
* premium hover interactions
* accessible form labels
* good spacing rhythm
* sticky nav
* image optimization
* page transitions where useful
* SEO-friendly structure
* semantic HTML
* reusable components

## Performance

* fast loading
* lazy-loaded media where needed
* optimized images
* avoid bloated unnecessary libraries
* clean code splitting where helpful

---

# SEO REQUIREMENTS

Implement:

* metadata for each page
* Open Graph tags
* Twitter card support
* sitemap-ready structure
* semantic heading hierarchy
* descriptive page titles and descriptions
* schema-ready article/player metadata structure where appropriate

---

# IMPLEMENTATION RULES

## Important:

1. Build this as a **real production-grade project structure**, not a one-file mockup.
2. Use **reusable components** throughout.
3. Use **TypeScript types** properly.
4. Use **SCSS modules or scoped SCSS where appropriate**, while still maintaining the global SCSS architecture in `src/styles`.
5. Create **clean folder separation** for features and components.
6. Create **sample seed/mock data** for players, news, videos, club stats, and movement history so the UI can be fully demonstrated.
7. Ensure all major pages are scaffolded and styled.
8. The homepage must feel **premium enough to impress a sponsor, scout, academy parent, or player immediately**.
9. Prioritize **luxury football branding** over generic startup styling.
10. Make the player profile system one of the strongest parts of the entire platform.

---

# DELIVERABLE EXPECTATION

I want a **fully structured premium CBFC website codebase** with:

* public pages
* player directory
* player profile pages
* academy section
* agency section
* professional club section
* video hub
* player movement page
* news page
* contact page
* admin dashboard structure
* SCSS architecture
* reusable components
* TypeScript typing
* mock data / seed-ready content structure
* premium UI styling using the CBFC brand palette

Start by generating:

1. the full project structure
2. the global SCSS architecture
3. the layout system
4. homepage implementation
5. shared reusable components
6. then scaffold the remaining pages and admin structure
7. then wire mock data across the experience

Keep the code organized, scalable, and premium.
