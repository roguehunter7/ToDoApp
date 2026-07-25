# PulseTask

Minimal todo + activity tracker with auth, calendar scheduling, and AI-powered summaries, built on Supabase.

**Live:** https://roguehunter7.github.io/ToDoApp/

## Stack

- Vanilla JS (ES module, no framework, no build step)
- Supabase (Auth, Postgres + RLS, Realtime, Edge Functions)
- GitHub Pages (deploy on push to `main`)
- PWA (service worker caches app shell, installable)

## Features

### Auth
- Sign up / sign in with email + password
- Persistent session across tabs
- Account self-deletion (Edge Function + RPC fallback)

### Tasks & Activities
- **Task mode** (📝) — add todos with optional scheduled date
- **Activity mode** (✨) — log things you did (marked complete immediately)
- Quick-add chips for common tasks (hide after first use)
- Keyboard: `⌘K` / `Ctrl+K` to focus input, `Enter` to add, `Escape` to jump to today

### Dashboard
- Two-column layout: completed / pending
- Per-day view: select a day from the week strip or date picker
- Progress ring showing completion percentage
- Stats badges: done today / left to do
- Relative timestamps on completed items

### Calendar
- Week strip with dots on days that have tasks
- Navigate weeks with `‹` / `›` arrows
- Date picker to jump to any date
- Escape returns to today's view

### AI Summaries (optional)
- Generate daily / weekly / monthly reports
- Edge Function calls DeepSeek to produce summaries and bullet points
- Previously generated reports are browsable from the report dialog

### Real-time sync
- Tasks update across open tabs instantly via Supabase Realtime
- Filtered to the current user (admin sees all)

### PWA
- Installable on desktop and mobile
- Offline-capable (service worker caches app shell)
- Manifest includes theme color, display mode metadata

## Database

| Table | Purpose |
|-------|---------|
| `items` | Todos (`TODO`) and activity logs (`ACTIVITY_LOG`), owned by user |
| `admins` | Email-based admin list (admin sees all items) |
| `reports` | Generated report summaries, owned by user |

### Row-Level Security
- **items:** users CRUD own items; admins SELECT all
- **admins:** any authenticated user can read (for admin check)
- **reports:** users SELECT own reports; edge function inserts via service role

## Project structure

```
├── index.html       App shell (auth UI, main layout, dialogs)
├── style.css        All styles (layered: reset → theme → base → components)
├── app.js           Application logic (auth, CRUD, calendar, reports)
├── sw.js            Service worker (stale-while-revalidate with network timeout)
├── manifest.json    PWA manifest
├── favicon.svg      SVG favicon + PWA icon
└── README.md
```

## Local development

Serve the project root with any static server — no build step needed.

```sh
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

The app connects to a Supabase project directly from the client. The anon key and project URL are embedded in `app.js`.

To run your own instance:
1. Create a Supabase project
2. Create the `items`, `admins`, and `reports` tables matching the schema
3. Set up RLS policies
4. Deploy the `delete-account` and `generate-summary` edge functions
5. Update the `supabase.createClient()` call in `app.js` with your project URL and anon key

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Add task / activity |
| `⌘K` / `Ctrl+K` | Focus input |
| `Escape` | Reset view to today |
| `Escape` (dialog open) | Close dialog |
