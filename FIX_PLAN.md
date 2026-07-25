# PulseTask Bug Fix Plan

## Phase 1: Security — 7 bugs (C1, C2, H2, M1, L1, L2, L4)
C1 · CSP meta tag → index.html
C2 · SRI integrity on unpkg → index.html:16
H2 · Don't trust client admin flag for realtime → app.js:428-436
M1 · Wrap error messages with safe map → app.js throughout
L1 · Explicit column select on export → app.js:364
L2 · Tag length validation → app.js:739
L4 · Remove RPC fallback for account deletion → app.js:399-402

## Phase 2: Critical/High Logic — 5 bugs (C3, H3, H5, H6, H7)
C3 · inline edit Escape stopPropagation → app.js:584
H3 · Await loadItems + error handling → app.js:472-479, 481-519, 726-761
H5 · sessionStorage for undo timeout → app.js:555-559
H6 · Clamp monthly recurrence → app.js:508
H7 · Add novalidate to auth form → index.html:27

## Phase 3: Medium Logic — 8 bugs (M2, M3, M4, M5, M10, M11, M12, M13)
M2 · Skip realtime refresh when tag filter active → app.js:434
M3 · Normalize recurrence to midnight → app.js:505-507
M4 · Reorder report history cleanup → app.js:917-920
M5 · AbortController polyfill → app.js:397
M10 · Disable addBtn during addItem → app.js:763
M11 · try/catch undo timeout → app.js:555-559
M12 · Guard concurrent report requests → app.js:837-885
M13 · Guard dialog Escape propagation → app.js:804-809

## Phase 4: Accessibility — 10 bugs (H4, M7, M8, L20-L25)
H4 · Light-mode button contrast → style.css:301
M7 · Keyboard-accessible inline edit → app.js:568
M8 · Return focus after dialog close → app.js:823-830
L20-L25 · Landmarks, emoji aria-hidden, labels, live regions → index.html, app.js

## Phase 5: PWA — 7 bugs (M6, M9, L8-L12)
M6 · SW catch log warning → sw.js:16
M9 · Generate PNG icons → manifest.json + new files
L8 · SW base URL trailing slash → sw.js:7
L9 · Relative SW register path → app.js:196
L10 · Offline fallback → sw.js + offline.html
L11 · Manifest scope → manifest.json
L12 · Cache version note → sw.js:1

## Phase 6: Code Quality — 5 bugs (L13-L17)
L13 · Remove dead CSS vars → style.css
L14 · Move dialog to base layer → style.css:412
L15 · Remove redundant tag bar render → app.js:709
L16 · Fix confirmResolve ordering → app.js:247,252,256
L17 · Remove vestigial admin realtime filter removal → app.js:428-436
