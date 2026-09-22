# PlayMatch

**Swipe. Match. Play.** A Tinder-style discovery app for video games, built on the
[RAWG Video Games Database](https://rawg.io).

Pick the platforms, genres and eras you care about, then swipe through a deck of
games — right to keep, left to pass, up for the full details. After fifteen swipes
PlayMatch works out your **Gamer Personality** from the games you liked.

---

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [How the API key is protected](#how-the-api-key-is-protected)
- [Running it locally](#running-it-locally)
- [Deploying to Netlify](#deploying-to-netlify)
- [Project structure](#project-structure)
- [Staying inside the RAWG rate limit](#staying-inside-the-rawg-rate-limit)
- [Tech stack](#tech-stack)
- [Credits](#credits)

---

## Features

> **Build status.** The filter screen, swipe deck and details view are complete.
> The match list and Gamer Personality card are the two screens still being
> built — they are described below as designed, and this note will go once they
> land.

### Filter screen
Choose what goes in the deck before you start. Every group is multi-select, and
leaving a group empty means "no limit", so you can skip straight to swiping.

- **Platform** — PC, PlayStation, Xbox, Nintendo, Mobile
- **Genre** — fetched live from RAWG, so the list is never out of date
- **Era** — Retro (pre-2000), 2000s, 2010s, 2020s

### Swipe deck
Each card shows the cover art, title, release year, genres, platforms, average
playtime, RAWG rating and Metacritic score (colour-coded green / amber / red).

Three ways to play, all doing exactly the same thing:

| Action | Drag | Button | Keyboard |
|---|---|---|---|
| Like | right | ♥ | <kbd>→</kbd> |
| Pass | left | ✕ | <kbd>←</kbd> |
| Details | up | ⓘ | <kbd>↑</kbd> |

The deck also:

- fetches the next page automatically before it runs dry
- never deals a game you have already swiped on, even after a reload
- skips games with no cover art rather than showing a blank card
- shows drag hints until you have actually dragged a card

### Details view
Opened by swiping up. Shows the trailer when RAWG has one and falls back to the
screenshot gallery when it does not — many games have no trailer, so this is the
normal case rather than an error. Also lists the description, developer,
publisher, release date, age rating and platforms, with a link to the game's
RAWG page. You can like or pass without going back to the deck.

### Match list &nbsp;·&nbsp; 🚧 in progress
Every game you liked, saved in `localStorage` so it survives a refresh. View the
cover art, remove anything you change your mind about, and open each game on RAWG.

### Gamer Personality &nbsp;·&nbsp; 🚧 in progress
After about fifteen swipes, PlayMatch reads the genres and tags of everything you
liked and assigns one of eight archetypes — Cozy Explorer, Adrenaline Junkie,
Strategist, Story Seeker, Retro Soul, Dungeon Diver, Nightmare Crawler or Chaos
Gremlin — with your top three genres shown as RPG-style stat bars.

### Throughout
- **Loading states** — animated arcade blocks, never a blank screen
- **Empty states** — separate messages for "no games matched those filters" and
  "you swiped through everything"
- **Error states** — the message matches the actual problem (rate limit, no
  connection, bad key) and every one has a retry button
- **Responsive** down to 320px, and **`prefers-reduced-motion`** is respected
  throughout: every decorative animation switches off

---

## Screenshots

<!--
  Add screenshots to docs/screenshots/ and uncomment the lines below.

  ![Start screen](docs/screenshots/start.png)
  ![Filter screen](docs/screenshots/filters.png)
  ![Swipe deck](docs/screenshots/deck.png)
  ![Details view](docs/screenshots/details.png)
  ![Match list](docs/screenshots/matches.png)
  ![Gamer Personality](docs/screenshots/personality.png)
-->

| Screen | |
|---|---|
| Start screen | _screenshot to be added_ |
| Filter screen | _screenshot to be added_ |
| Swipe deck | _screenshot to be added_ |
| Details view | _screenshot to be added_ |
| Match list | _screenshot to be added_ |
| Gamer Personality | _screenshot to be added_ |

---

## How the API key is protected

**The RAWG key is never sent to the browser.** This is the core of the project's
architecture, so it is worth spelling out.

```
┌─────────┐      ┌──────────────────────────┐      ┌──────────┐
│ Browser │ ───▶ │ Netlify Function         │ ───▶ │ RAWG API │
│ (React) │      │ (runs on Netlify server) │      │          │
└─────────┘      └──────────────────────────┘      └──────────┘
                   RAWG_API_KEY lives here
                   and nowhere else
```

1. The React app only ever calls its own endpoints, for example
   `/.netlify/functions/games?genres=4&page=1`. No key is attached.
2. The function runs on Netlify's server, reads `RAWG_API_KEY` from the
   environment, adds it to the RAWG request, and returns the result.
3. The key exists in exactly two places: `.env` on your machine (which is
   gitignored) and Netlify's environment variables in production. It is never in
   the source, never in the bundle, and never in a network request the browser
   can see.

**You can verify this yourself.** Open DevTools → Network on the running app and
inspect any request — every one goes to `/.netlify/functions/…` with no key in
the URL, headers or body. You can also search the production build:

```bash
npm run build
grep -r "your-key-here" dist/    # returns nothing
```

Two further safeguards in [`netlify/functions/games.js`](netlify/functions/games.js):

- **Only known parameters are forwarded.** `page`, `page_size`, `platforms`,
  `genres`, `dates` and `ordering` are read individually; anything else the
  browser sends is ignored. The function cannot be used as an open proxy to RAWG.
- **Every value is validated.** Platform and genre ids must be comma-separated
  numbers, dates must match RAWG's exact range format, `ordering` must be one of
  a fixed list, and `page_size` is clamped to 40.

---

## Running it locally

### Requirements

- **Node.js 20.19+ or 22.12+** (Vite 8's requirement; built and tested on Node 24)
  — check yours with `node -v`
- **Netlify CLI**, which runs the serverless functions on your machine:
  ```bash
  npm install -g netlify-cli
  ```

### 1. Clone and install

```bash
git clone https://github.com/Ryle-Tan/PlayMatch.git
cd PlayMatch
npm install
```

### 2. Get a free RAWG API key

1. Go to <https://rawg.io/apidocs>
2. Sign up for a free account
3. Your key appears on that page — copy it

### 3. Create your `.env`

Copy the example file and paste your key in:

```bash
cp .env.example .env
```

Then edit `.env` so it reads:

```
RAWG_API_KEY=paste_your_key_here
```

> `.env` is listed in `.gitignore` and must never be committed. Run `git status`
> before committing and confirm `.env` is not in the list.

### 4. Start the app

```bash
netlify dev
```

Open **<http://localhost:8888>**.

> **Use port 8888, not 5173.** `netlify dev` runs Vite *and* the serverless
> functions on the same origin. Port 5173 is Vite on its own — the pages load but
> every API call 404s, because the functions are not there.

### Available scripts

| Command | What it does |
|---|---|
| `netlify dev` | Run the app with working serverless functions (**use this**) |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run dev` | Vite only — no functions, API calls will fail |

### Clearing your saved data

PlayMatch stores your matches, filters and swipe history in `localStorage`. To
start fresh, run this in the browser console:

```js
localStorage.clear(); location.reload();
```

---

## Deploying to Netlify

### 1. Push to GitHub

```bash
git add .
git commit -m "chore: prepare for deploy"
git push
```

### 2. Create the site

1. Sign in at <https://app.netlify.com> and choose **Add new site → Import an
   existing project**
2. Connect your GitHub account and pick the `PlayMatch` repository
3. The build settings are read automatically from `netlify.toml`, so you should
   see:
   - **Build command** — `npm run build`
   - **Publish directory** — `dist`
   - **Functions directory** — `netlify/functions`

### 3. Add the API key — do not skip this

In the Netlify dashboard go to **Site configuration → Environment variables →
Add a variable**:

| Key | Value |
|---|---|
| `RAWG_API_KEY` | your RAWG key |

Without this the site deploys successfully but every request returns a clear
"Server key missing" error, because the functions have no key to use.

### 4. Deploy

Click **Deploy site**. Netlify rebuilds automatically on every push to `main`.

> If you add the environment variable *after* the first deploy, trigger a new one
> (**Deploys → Trigger deploy → Deploy site**) so the functions pick it up.

---

## Project structure

```
PlayMatch/
├─ netlify/
│  ├─ lib/
│  │  └─ rawg.js              Shared server helper — the only file that
│  │                          reads RAWG_API_KEY. Handles timeouts, rate
│  │                          limits and trims RAWG's large responses.
│  └─ functions/
│     ├─ games.js             The swipe deck's source
│     ├─ genres.js            Genre list for the filter screen
│     ├─ game-details.js      Full information for one game
│     ├─ screenshots.js       Screenshot gallery
│     └─ movies.js            Trailers (returns an empty list, not an
│                             error, when a game has none)
│
├─ public/                    Logo files, served as-is
│
├─ src/
│  ├─ components/             One folder per screen and shared piece,
│  │                          each with its own CSS file
│  ├─ hooks/
│  │  ├─ useDeck.js           Paging, de-duplication, "never show a game
│  │  │                       twice", and the empty/error states
│  │  └─ useMatches.js        The liked-games list
│  ├─ lib/
│  │  ├─ api.js               The only place the frontend makes requests
│  │  ├─ cache.js             localStorage cache with expiry
│  │  ├─ storage.js           Matches, seen games, filters, swipe count
│  │  ├─ filters.js           Filter options → RAWG query parameters
│  │  └─ errorCopy.js         Error code → friendly heading
│  └─ styles/                 Design tokens, background, shared UI
│
├─ .env                       Your API key — gitignored, never committed
├─ .env.example               Template showing what .env needs
└─ netlify.toml               Build, functions and dev server config
```

### Routes

| Path | Screen |
|---|---|
| `/` | Start screen |
| `/filters` | Choose platforms, genres and eras |
| `/swipe` | The swipe deck |
| `/game/:id` | Details for one game |
| `/matches` | Your liked games |
| `/result` | Gamer Personality card |

`netlify.toml` includes a single-page-app redirect so these URLs work when opened
or refreshed directly, instead of returning a 404.

---

## Staying inside the RAWG rate limit

RAWG's free tier has a monthly request cap, so PlayMatch avoids spending requests
it does not need to, in three ways.

**1. Browser cache.** Every response is stored in `localStorage` with an expiry,
so repeating a search costs nothing:

| Data | Cached for |
|---|---|
| Genres | 7 days |
| Game lists | 1 hour |
| Details, screenshots, trailers | 24 hours |

**2. CDN cache.** The functions set `Netlify-CDN-Cache-Control`, so Netlify serves
repeat requests from its own edge cache without calling RAWG at all — including
for visitors who have never been to the site before.

**3. Request de-duplication.** If two parts of the app ask for the same thing at
the same moment, `api.js` makes one request and shares the result. Without this,
neither caller would have finished in time to fill the cache for the other.

The deck also requests 20 games per page and only fetches the next page when
fewer than five cards are left, rather than loading everything up front.

---

## Tech stack

| | |
|---|---|
| **React 19** | UI |
| **Vite 8** | Build tool and dev server |
| **React Router 7** | Client-side routing |
| **Framer Motion 13** | Swipe gestures and card animation |
| **Netlify Functions** | Serverless proxy that hides the API key |
| **localStorage** | Matches, filters, swipe history and response caching |
| **Plain CSS** | Custom properties for theming, one file per component |

Fonts are [Lilita One](https://fonts.google.com/specimen/Lilita+One) for titles,
[DM Sans](https://fonts.google.com/specimen/DM+Sans) for body text and
[Space Mono](https://fonts.google.com/specimen/Space+Mono) for numbers and labels,
all from Google Fonts.

---

## Credits

All game data, cover art, screenshots and trailers come from the
**[RAWG Video Games Database](https://rawg.io)**. RAWG requires attribution, which
appears in the footer of every screen in the app.

Built as a third-party API coursework project.
