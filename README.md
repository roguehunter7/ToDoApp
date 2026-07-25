# PulseTask

Minimal todo app with auth, built as a single HTML file on Supabase.

**Live:** https://roguehunter7.github.io/ToDoApp/

## Stack

- Single HTML file (no framework, no build step)
- Supabase (Auth, Database, RLS, Edge Functions)
- GitHub Pages (deploy on push to main)

## Features

### Auth
- Sign up / sign in with email + password
- Auth state listener persists session across tabs
- Account self-deletion (Edge Function + RPC fallback)

### Tasks
- Add todo items
- Log activities with `did:`, `x:`, or `/done` prefix — auto-classified as completed
- Checkbox to complete, delete button to remove
- Real-time sync via Supabase Realtime (scoped to user_id)

### Dashboard
- Two-column layout: "What I Did Today" / "Left To Do"
- Today-only filter on completed items
- Progress ring with percentage
- Relative timestamps on completed items

### Security
- Row Level Security on all tables — users see only their own data
- Realtime subscription filtered to user_id
- Edge Function uses service role key for admin delete
- `delete_my_account` RPC as fallback if Edge Function unreachable

## Database

| Table | Purpose |
|-------|---------|
| `items` | Todos and activity logs, owned by user |
| `admins` | Email-based admin list |

Policies enforce: users CRUD own items, admins read all, authenticated read admins table.

## Workflow

```
Sign up  Check email (if confirmation enabled)  Sign in
  Add tasks ("Buy groceries")
  Log activities ("did: Shipped ponytail-audit")
  Toggle complete  Delete
  Sign out or delete account
```

## Local dev

Open `index.html` in a browser. No server needed — it talks directly to Supabase.
