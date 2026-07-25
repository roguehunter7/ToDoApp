# PulseTask

Todo + activity tracker with auth, calendar scheduling, and AI summaries. Vanilla JS, zero build step.

**Live:** https://roguehunter7.github.io/ToDoApp/

## Stack

- **Vanilla JS** — ES modules, no framework, no build
- **Supabase** — Auth, Postgres with RLS, Realtime, Edge Functions
- **GitHub Pages** — auto-deployed on push to `main`
- **PWA** — installable, cached app shell with offline fallback

## Features

- Sign up / sign in with email + password, account self-delete
- **Task mode** — add todos with optional scheduled date
- **Activity mode** — log things you did (auto-completed)
- Two-column dashboard (done / pending) per selected day
- Week strip calendar with task dots, date picker, `Escape` resets to today
- Progress ring with completion %, stats badges
- Real-time sync across open tabs
- **AI Summaries** — daily / weekly / monthly reports via DeepSeek v4 Flash (Edge Function)
- **Tags** — organize tasks with tags, click to filter
- **Recurring tasks** — daily / weekly / monthly repeats (auto-created on complete, month-end clamped)
- **Inline edit** — double-click a pending task to edit (keyboard-accessible via Enter)
- **Undo complete** — 5-second undo bar after completing a task (survives page navigation)
- **Export** — download all data as JSON from the user menu
- `⌘K` focus input, `Enter` add, quick-add chips (hide after first use)
- **Dark/light theme** — toggle persisted to localStorage
- **Security** — Content-Security-Policy, Subresource Integrity on CDN scripts, safe error messages
- **Accessibility** — ARIA labels, landmarks, live regions, keyboard navigation, WCAG-contrast buttons

## Database

| Table | Purpose |
|-------|---------|
| `items` | Todos (`TODO`) and activity logs (`ACTIVITY_LOG`) |
| `admins` | Email-based admin list |
| `reports` | Generated AI summaries |

RLS: users CRUD own items; admins SELECT all; reports insert via service role.

## Project structure

```
├── index.html         App shell + dialogs
├── style.css          Layered CSS (reset → theme → base → components)
├── app.js             All app logic
├── sw.js              Service worker
├── manifest.json      PWA manifest
├── offline.html       Offline fallback page
├── favicon.svg        SVG icon
├── icon-192.png       192×192 PWA icon
├── icon-512.png       512×512 PWA icon
├── apple-touch-icon.png
└── README.md
```

## Local dev

```sh
python3 -m http.server 8080   # or: npx serve .
```

To run your own instance: create a Supabase project, create the tables, set up RLS, deploy the `delete-account` and `generate-summary` edge functions, then swap the `supabase.createClient()` URL and anon key in `app.js`.

## Keyboard

| Key | Action |
|-----|--------|
| `Enter` | Add task/activity |
| `Enter` (on task text) | Start inline edit |
| `⌘K` / `Ctrl+K` | Focus input |
| `Escape` | Cancel inline edit / close dialog / reset to today |

## Bug fixes

43 of 48 identified bugs fixed across security, logic, accessibility, PWA, and code quality.
