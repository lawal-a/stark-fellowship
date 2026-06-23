# STARK Fellowship — Project Memory

## Project Overview
STARK Fellowship is a **love-based entrepreneurship fellowship** by Heave Ventures, run by Abiodun Lawal (CEO).
- Main landing page: `starkfellowship.org` → `index.html`
- Handbook page: `handbook-26.starkfellowship.org` → `handbook-26.html`
- Admin panel: `starkfellowship.org/admin` → `admin.html`

## Tech Stack
- **Hosting**: Cloudflare Pages (project name: `stark-fellowship`)
- **Backend**: Cloudflare Workers (via `/functions/`) + KV namespace (`STARK_DATA`)
- **No build step** — pure static HTML/CSS/JS files deployed at root
- **Fonts**: Playfair Display, Barlow Condensed, Inter (Google Fonts)
- **Logo**: Cloudinary CDN
  - Black (for light bg): `https://res.cloudinary.com/dzmutoos2/image/upload/v1777645189/STARK_BLACK_l5fu2p.png`
  - Blue (for light bg): `https://res.cloudinary.com/dzmutoos2/image/upload/v1777645189/STARK_BLUE_noa9f9.png`
  - White (for dark bg): use `filter: brightness(0) invert(1)` on the black logo

## Brand Colors
- Blue: `#1818E8` / Blue dark: `#1010BA`
- Gold: `#C8A84B` / Gold light: `#E8D085`
- Charcoal: `#191928`
- Cream: `#FAFAF7`

## STARK Y'26 Programme
**Two tracks run in parallel (May–July 2026):**

### LBI — Life Business Incubator
- 9 weeks (including Demo Day), Mondays 6:00–8:30PM WAT
- Week 1 unlocks: May 18, 2026
- Demo Day: July 13, 2026 (W9)
- Submission link: `https://docs.google.com/forms/u/1/d/e/1FAIpQLSeiPxf-m1mx6FBHxySbfGQpijwnMjkAZpwyc5qedI12yJaT0Q/viewform?usp=sharing`

### SOT — School of Timothy (Co-Founder Track)
- 5 weeks, Fridays 6:00–8:30PM WAT
- Week 1 unlocks: May 16, 2026
- Merging Ceremony: June 8, 2026 (W5, joint with LBI W4)
- Submission link: `https://forms.gle/r891yJnGRXBBG4w96`
- Quiz link: `https://forms.gle/iMRwaUfo8XRLD1uF6`

### Shared
- Office Hours: `https://calendar.app.google/GnsdPBRKd3SAZkqn6`
- Prayer: Tuesdays & Thursdays, 7:00AM WAT
- Contact: `theteam@heaveventures.com`

## handbook-26.html — Architecture
- Single-file HTML with embedded CSS + JS (no external dependencies except Google Fonts + Cloudinary logo)
- **Track switching**: LBI / SOT toggle in nav and on hero cards — re-renders curriculum, roadmap, and principles
- **Week locking**: Weeks unlock automatically by date/time (6AM WAT on the session day). Locked weeks show a live countdown timer.
- **Week unlock dates**: stored as `unlock: 'YYYY-MM-DD'` on each week object, interpreted as `06:00:00+01:00`
- **Accordion**: only one week open at a time; current week auto-opens on load
- **Placeholder sections**: Bye-Laws, Prayer Schedule, FAQ — "Content coming soon" — awaiting content from Abiodun

## Subdomain Setup (handbook-26.starkfellowship.org)
The file `handbook-26.html` lives in the root of the same Cloudflare Pages project.
To make the subdomain work, two options:
1. **Cloudflare Redirect Rule**: In Cloudflare dashboard → Rules → Redirect Rules, add:
   - Incoming URL: `handbook-26.starkfellowship.org/*`
   - Target: `starkfellowship.org/handbook-26`
2. **Separate Pages project**: Deploy a new Cloudflare Pages project with just `handbook-26.html` as `index.html` and attach `handbook-26.starkfellowship.org` as its custom domain.

## Programs Page Pattern
`programs.html` is the **canonical active program URL** (`starkfellowship.org/programs`).
It is linked from the homepage nav. When a program ends:
1. Rename `programs.html` → `archive/name-year.html` (e.g. `archive/jos-26.html`)
2. Drop the next program's content into a new `programs.html`

`conference-26.html` is the archived source for the Jos '26 bootcamp page.

## Files
```
/
├── index.html          ← Main landing page (starkfellowship.org)
├── programs.html       ← Active program page (starkfellowship.org/programs) ← linked from nav
├── admin.html          ← Admin panel
├── handbook-26.html    ← Y'26 Participant Handbook
├── conference-26.html  ← Archived Jos '26 bootcamp source
├── wrangler.toml       ← Cloudflare Pages + Workers config
├── CLAUDE.md           ← This file
└── functions/
    ├── register.js     ← Waitlist registration API
    ├── volunteer.js    ← Volunteer signup API
    ├── conference-register.js ← Conference registration API
    └── api/
        └── admin-data.js ← Admin data API
```

## Pending (awaiting content from Abiodun)
- [ ] Bye-Laws content
- [ ] Prayer Schedule content (times, Zoom links, format)
- [ ] FAQ content
- [ ] Add subdomain redirect in Cloudflare dashboard
