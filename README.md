# Ficha ⚽

**Ficha** is a premium, state-of-the-art Football Player Dashboard designed for scouting, analysis, and player comparisons. The name **Ficha** is derived from the Spanish word for **"player card"** (*ficha de jugador*), capturing the core essence of the application: a comprehensive, visually rich digital trading card and performance dashboard for football players worldwide.

Built using a modern, reactive stack powered by **SvelteKit**, **Tailwind CSS v4**, and **LayerChart**, Ficha aggregates live football data and transfer market insights to deliver deep analytical profiles of players, teams, and matches.

---

## 🚀 Tech Stack

- **Framework:** SvelteKit (Svelte 5)
- **Styling:** Tailwind CSS v4 (CSS-first configuration)
- **Component Library:** shadcn-svelte
- **Data Validation:** Zod
- **Visualizations:** LayerChart & LayerCake (D3-based charts)
- **HTTP Client:** Axios
- **APIs:** 
  - API-Football (RapidAPI) for live stats, rosters, fixture details, and ratings.
  - Transfermarkt API (Local Docker instance) for player market values, transfer history, and contract info.

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have **Node.js** (v18+) and **pnpm** installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd ficha
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Sync SvelteKit types:
   ```bash
   pnpm prepare
   ```

### Running the Development Server

Start the local server with hot-module replacement (HMR):
```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🗺️ Roadmap & Phases

### 📌 Phase 1 — MVP (Minimum Viable Product)
**Goal:** Search for a player, view basic stats and market value.
- [ ] Setup API-Football integration (RapidAPI credentials & endpoints testing).
- [ ] Setup Transfermarkt API via local Docker instance.
- [ ] Implement Zod schemas for both API response validation.
- [ ] Create an aggregator API endpoint under `+server.ts` (`/api/player/[id]`).
- [ ] Implement player search functionality by name.
- [ ] Create the Player Profile page featuring photo, name, club, position, nationality, age, and basic details.
- [ ] Design basic stats cards (goals, assists, appearances, minutes played).
- [ ] Fetch and display market value from Transfermarkt.
- [ ] Enable Default Dark Mode utilizing the bespoke *Ficha* color palette.
- [ ] **[Security]** Environment variable validation at startup using Zod.
- [ ] **[Security]** Zod parsing in every `+server.ts` endpoint to reject malformed requests.
- [ ] **[Security]** Never expose the RapidAPI key to the client; routing all third-party calls through the server.
- [ ] **[Security]** Configure local Transfermarkt Docker container to not expose ports publicly (internal calls only).
- [ ] **[Security]** Add an API secret verification header between SvelteKit and the Transfermarkt container.

### 🔍 Phase 2 — Player Deep Dive
**Goal:** In-depth player performance analysis.
- [ ] Implement Season selector.
- [ ] Implement Competition filters (overall vs. league specific).
- [ ] Calculate and display normalized stats per 90 minutes.
- [ ] Goal breakdown visualization (open play, headers, free kicks, penalties).
- [ ] Assist breakdown (types of assists).
- [ ] Discipline stats (yellow/red cards and per-game ratios).
- [ ] Clean sheet tracker (specifically for goalkeepers and defenders).
- [ ] Integrate match-by-match ratings from API-Football.
- [ ] Visual form tracker showing ratings from the last 5 matches.
- [ ] Display player injury history timeline.
- [ ] Display contract information, expiry date, agent, and nationality details.
- [ ] **[Security]** Implement rate limiting per IP on the search and player endpoints (e.g., using `@upstash/ratelimit`).
- [ ] **[Security]** Implement request throttling on the search query (max N requests per minute per IP).
- [ ] **[Security]** Sanitize all query parameters before dispatching them to external APIs.
- [ ] **[Security]** Apply max length validation on search input parameters.
- [ ] **[Security]** Prevent path traversal attacks inside the dynamic route handler `[id]`.

### 📊 Phase 3 — Visualizations & Charts
**Goal:** Turn statistics into intuitive visual layouts.
- [ ] Bar chart for goals/assists progression per season.
- [ ] Line chart plotting form/ratings throughout the season.
- [ ] Radar chart mapping attributes (attacking, defending, passing, physical, mental).
- [ ] Interactive Shot Map indicating matchday attempt positions.
- [ ] Pass accuracy trend charts.
- [ ] Minutes played distribution (starter vs. substitute).
- [ ] Donut chart representing goals per competition.
- [ ] Line chart showing historical market value evolution.
- [ ] Interactive pitch activity heatmaps.
- [ ] **[Security]** XSS protection: sanitize all data retrieved from external APIs before rendering.
- [ ] **[Security]** Never render raw HTML strings from API responses directly.

### ⚖️ Phase 4 — Comparison & Scouting
**Goal:** Side-by-side player comparisons and scouting tools.
- [ ] Multi-player comparison dashboard (2 players side-by-side).
- [ ] Overlaid radar charts comparing attributes.
- [ ] Per 90-minute stats comparison (normalized, not raw values).
- [ ] Similar players recommendation engine (shares similar positions and stats).
- [ ] Auto-generated AI/heuristic scouting reports.
- [ ] Age vs. performance curves.
- [ ] "Value for Money" score calculation (stats performance relative to market value).
- [ ] Custom Best XI squad builder with combined team stats.
- [ ] **[Security]** Validate input for comparison endpoints (limit to max 2 player IDs, enforce format checks).
- [ ] **[Security]** Set stricter rate limits on comparison endpoints due to heavier API aggregation overhead.

### 🏆 Phase 5 — Team & League View
**Goal:** Expand focus from individual players to teams and competitions.
- [ ] Team Overview pages (squad list, formations, overall stats).
- [ ] Top scorers and top assisters per league tables.
- [ ] Live league standings.
- [ ] Team form tracking (last 5 matches).
- [ ] Head-to-head (H2H) match history builder.
- [ ] Upcoming fixture calendars.
- [ ] Squad depth visualization maps.
- [ ] Average squad age and total squad market value charts.
- [ ] **[Security]** Apply strict rate limiting on league and team endpoints to prevent scrapers and abuse.
- [ ] **[Security]** Cache server-side API responses to minimize direct hits to external APIs.

### 🏁 Phase 6 — Match Center
**Goal:** Live match tracking and historical match stats.
- [ ] Match results and scoreboard.
- [ ] Interactive lineup configurations and tactical layouts.
- [ ] Individual player ratings per match.
- [ ] Complete match statistics (possession, shots, passes, corners, etc.).
- [ ] Interactive match timeline events (goals, bookings, substitutions).
- [ ] Man of the Match awards indicator.
- [ ] Real-time live match updates.
- [ ] **[Security]** Validate the formatting of match IDs before executing external API queries.
- [ ] **[Security]** Apply strict rate limiting on live updates endpoints (enforce a minimum polling interval of 30 seconds).

### ✨ Phase 7 — UX & Polish
**Goal:** Elevate look, feel, and performance to a commercial product standard.
- [ ] Implement loading skeleton placeholders.
- [ ] Informative error pages (e.g., player not found, API rate-limits, downtime).
- [ ] Delightful empty states with micro-illustrations.
- [ ] Full responsiveness (mobile, tablet, desktop).
- [ ] Fluid page transition animations.
- [ ] Interactive light/dark mode switcher.
- [ ] Universal Search bar hotkey shortcut (`Cmd+K` / `Ctrl+K`).
- [ ] Breadcrumb navigation paths.
- [ ] Copy-to-clipboard profile sharing buttons.
- [ ] PDF export functionality for player stats cards.
- [ ] Guided onboarding tooltips for new users.
- [ ] **[Security]** Configure secure HTTP headers in `hooks.server.ts` (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- [ ] **[Security]** Establish strict CORS policies restricting which origins can access internal API routes.
- [ ] **[Security]** Avoid leaking database/internal player IDs in share links (use slugs or hashed IDs instead).

### 👤 Phase 8 — Personalization
**Goal:** Enable user personalization options.
- [ ] Bookmarked/Favorite players quick-lists.
- [ ] Followed teams feed.
- [ ] Search query history log.
- [ ] Custom market value watchlists.
- [ ] Live browser notifications for watchlist market value fluctuations.
- [ ] Custom notes and annotations per player profile.
- [ ] Customizable widget-based home dashboard.
- [ ] **[Security]** Store favorites and notes locally in `localStorage` without saving sensitive backend credentials.
- [ ] **[Security]** Sanitize user notes before saving to prevent Stored XSS.
- [ ] **[Security]** Limit notification dispatch rates to prevent user spam.

### 🧠 Phase 9 — AI Features
**Goal:** Distinctive AI-powered scouting and predictions.
- [ ] AI-generated scouting reports summarizing performance.
- [ ] Player form/growth prediction engine.
- [ ] Natural Language Search ("young striker in La Liga with high goals per 90").
- [ ] Strengths and weaknesses auto-highlighting cards.
- [ ] Transfer rumor aggregator with sentiment analysis.
- [ ] Injury probability risk scores based on history.
- [ ] **[Security]** Sanitize natural language prompts before passing to the AI model to prevent prompt injection.
- [ ] **[Security]** Enforce strict rate limits on AI-related endpoints to manage hosting costs and prevent exhaustion.
- [ ] **[Security]** Filter and validate AI-generated output before rendering to avoid raw or malicious content payload execution.
- [ ] **[Security]** Ensure no personal or sensitive user data is forwarded to third-party AI models.

### 🔌 Phase 10 — Backend & Scale
**Goal:** Production ready architecture.
- [ ] Drizzle ORM + PostgreSQL integration for caching and data persistence.
- [ ] Better Auth integration for user account management.
- [ ] API rate-limiting rules and robust retry handling mechanisms.
- [ ] Automated cron jobs for daily market value updates.
- [ ] Redis caching layer for trending players.
- [ ] Multi-container deployment (Vercel for frontend, Railway/Render for Docker APIs).
- [ ] API usage dashboards and usage quota analytics.
- [ ] **[Security]** Configure built-in CSRF protection inside SvelteKit.
- [ ] **[Security]** Set up secure session expiry times and refresh token rotation.
- [ ] **[Security]** Implement brute force protection controls on auth entry points.
- [ ] **[Security]** Support OAuth only (Google/GitHub/etc.) to avoid managing raw user credentials/passwords.
- [ ] **[Security]** Implement temporary or permanent IP blocking for repetitive abusers.
- [ ] **[Security]** Integrate basic bot detection patterns on the search endpoint.
- [ ] **[Security]** Log anomalous request traffic (such as burst requests or suspicious querying patterns).
- [ ] **[Security]** Build alerts for near-exhausted API quotas.
- [ ] **[Security]** Manage all secret keys strictly via environment variables (run audits before deploying to verify no hardcoded secrets exist).
