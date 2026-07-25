# PulseTask — Bug Fix Summary

**48 bugs found → 43 fixed · 5 noted (non-code/architectural)**

## Fixed (43 bugs)

### Phase 1 — Security (7 bugs)
| ID | Bug | Fix |
|----|-----|-----|
| C1 | Missing Content-Security-Policy | CSP meta tag added to index.html with script-src, connect-src, style-src, font-src, img-src, manifest-src |
| C2 | No SRI on unpkg script | `integrity="sha384-..." crossorigin="anonymous"` added to `<script>` tag |
| H2 | Client-side admin check forgeable | `subscribeRealtime()` now always uses `user_id` filter regardless of admin flag |
| M1 | Error messages leak internals | `safeError()` function maps raw errors to user-safe messages; all toast error sites updated |
| L1 | `select('*')` on export | Changed to explicit column list |
| L2 | No tag length validation | Max 20 tags, 50 chars each; silent truncation |
| L4 | RPC fallback bypasses edge function auth | Removed `supabase.rpc('delete_my_account')` fallback; also replaced `AbortSignal.timeout` with `AbortController` for compat |

### Phase 2 — Critical/High Logic (6 bugs)
| ID | Bug | Fix |
|----|-----|-----|
| C3 | inline edit Escape resets calendar | `e.stopPropagation()` added to Escape handler in inline edit keydown |
| H3 | CRUD toast contradicts UI | Await `loadItems()` after mutations + warning toast on failure |
| H5 | Undo timeout lost on nav | Persist undo state in `sessionStorage` with expiry timestamp |
| H6 | Monthly recurrence date drift | Clamp to month-end: `setDate(0)` when day rolls after `setMonth(getMonth()+1)` |
| H7 | Auth form missing novalidate | `novalidate` attribute added to `<form>` |
| M3 | Recurrence keeps time-of-day | `new Date(today() + 'T00:00:00')` instead of `new Date()` for recurrence date |

### Phase 3 — Medium Logic (7 bugs)
| ID | Bug | Fix |
|----|-----|-----|
| M2 | Realtime + tag filter race | Skip `loadItems()` in realtime handler when `activeTagFilter` is set |
| M4 | Report history wiped on error | Moved `.remove()` after the error check |
| M10 | Double-click Add creates duplicates | Disable `addBtn` during `addItem()`, re-enable after |
| M11 | Undo promise rejection unhandled | `try/catch` around `completeItem()` in timeout; shows "Retry" bar on failure |
| M12 | Report concurrent requests race | `reportLoading_` guard flag prevents concurrent fetches |
| M13 | Dialog Escape resets calendar | `!e.target.closest('dialog')` guard on document Escape handler |
| M5 | AbortSignal.timeout compat | Replaced with AbortController + setTimeout (done in L4 fix) |

### Phase 4 — Accessibility (11 bugs)
| ID | Bug | Fix |
|----|-----|-----|
| H4 | Light-mode button contrast ~3:1 | `[data-theme="light"] .btn-primary` uses dark text (#1e1e1a) for 4.5:1+ |
| M7 | Inline edit not keyboard accessible | `tabIndex=0` + Enter key handler on `.item-text` activates edit mode |
| M8 | Focus not returned after dialog close | `lastFocused` tracking + `.focus()` on dialog close/confirm |
| L20 | No `<main>` landmark | `<main id="app">` replaces `<div id="app">` with `</main>` close |
| L21 | Emoji without aria-hidden | `<span aria-hidden="true">` wrapped around emoji in stats, chips |
| L22 | Dialogs missing aria-labelledby | `aria-labelledby="confirmMsg"` and `aria-labelledby="reportDialogTitle"` added |
| L23 | Missing ARIA live regions | `role="alert"` on authError, `aria-live="polite"` on toast container, `role="progressbar"` on loading |
| L24 | Inputs lack proper labels | `aria-label` added to taskInput, taskDate, recurrenceSelect, tagsField |
| L25 | Placeholder-as-label | Fixed by aria-label addition (same as L24) |

### Phase 5 — PWA (7 bugs)
| ID | Bug | Fix |
|----|-----|-----|
| M6 | SW silent cache errors | `console.warn()` instead of empty `.catch(() => {})` |
| M9 | No PNG icons | Generated 192x192 and 512x512 PNGs + apple-touch-icon.png; updated manifest and HTML |
| L8 | SW base URL trailing slash mismatch | Added `basePlain` (no-trailing-slash variant) to precache ASSETS |
| L9 | SW register path hardcoded | Changed to relative `'sw.js'` with `scope: './'` |
| L10 | No offline fallback page | Created `offline.html` with styled offline message; cached in SW; used as fetch fallback |
| L11 | Manifest missing scope | Added `"scope": "/ToDoApp/"` |
| L12 | Manual cache version | Bumped to `pulsetask-v7`; documented as deliberate |

### Phase 6 — Code Quality (5 bugs)
| ID | Bug | Fix |
|----|-----|-----|
| L13 | Dead CSS variables | Removed `--border-hover-base`, `--shadow-sm`, `--focus-ring`, `--radius-full` |
| L14 | dialog styles in wrong layer | Moved `dialog` + `dialog::backdrop` to `@layer base` |
| L15 | Stale tag bar render order | Removed redundant `renderTagFilterBar()` from `filterByTag()` |
| L16 | confirmResolve ordering | Swapped to `close()` then `nullify` |
| L17 | Admin mode vestigial | Handled as part of H2 fix |
| L6 | Missing preconnect crossorigin | Added `crossorigin` to fonts.googleapis preconnect |
| L7 | No gstatic preconnect | Added `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` |

## Noted — Not Fixed (5 items)
These are architectural notes requiring server-side changes or platform config:

| ID | Bug | Reason |
|----|-----|--------|
| H1 | JWT in localStorage | Requires Supabase config: `persistSession: false` + PKCE/cookie storage. Needs server changes. |
| L3 | No rate limiting on auth | Server-side only (Supabase handles free-tier rate limits). |
| L5 | Password min length client-only | Already enforced server-side by Supabase; client check is UX only. |
| L18 | Google Fonts without SRI | Google Fonts CSS doesn't support SRI — CSS injection risk is low vs. JS. |
| L19 | Missing X-Content-Type-Options | GitHub Pages platform limitation; not fixable in app code. |

## Files changed
- `app.js` — 35+ edits across security, logic, accessibility, PWA
- `index.html` — CSP meta, SRI, novalidate, preconnect, a11y (labels, roles, landmarks, dialogs)
- `style.css` — Button contrast, dead vars removed, dialog layer fix
- `sw.js` — Cache version bump, base URL fix, offline fallback, error logging
- `manifest.json` — Scope added, PNG icons
- `offline.html` — NEW: offline fallback page
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — NEW: PNG icons
