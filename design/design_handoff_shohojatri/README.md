# Handoff: Shohojatri (সহযাত্রী) — Screening + Companion web app

## Overview
Bangla-first, bilingual (bn / en) web app for parents of young children in Bangladesh, special-school teachers and child-development specialists.
Two surfaces share one account:
1. **Screening** — child details → consent → 20-question questionnaire → guided camera play activities → developmental risk result, parent report, clinician report, share link, nearby specialists. Mobile-first (390 px).
2. **Companion** — a child's shared record with family, teachers and doctors: quick logs, timeline, progress, care plan, documents (AI-read), care team, reminders, activities, AI assistant chat with cited sources, status reports. Desktop 1280 px + mobile.

## About the design files
Everything in `design/` is a **design reference made in HTML** (React-in-the-browser prototypes laid out on a pannable canvas). It is **not production code**. Recreate these designs in the target codebase. The route map below suggests Next.js App Router with a `[locale]` segment. If the repo already has an environment, use its patterns instead. Do not copy the canvas scaffolding (`Phone`, `cv-*`, `row-title`, absolute positioning). It only exists to present frames side by side.

The components in `design/_ds/_ds_bundle.js` are the design system's reference implementations. Re-implement them as real components (names and props listed below) and style them with the tokens in `tokens/`.

## Fidelity
**High-fidelity.** Final colours, type, spacing, radii, shadows, copy (Bangla + English where present) and states. Match pixel-for-pixel using the tokens. Two exceptions: illustrations aren't supplied yet (icon tiles and the logo mark stand in where illustrations go), and the questionnaire items are placeholders, not a validated instrument.

---

## 1 · Design review (done before this handoff)

| Check | Result |
|---|---|
| Every screen exists in Bangla **and** English | **Partial — see gaps.** Bilingual: Onboarding, Assistant Chat, States, Doctor Report (bn/en toggle). **Bangla only:** Screening Flow (all frames), Results (R/S/C/N frames), Companion (W/H/Q/R/A/D/C/B frames), Parent Report. Their English copy must still be written. Strings already follow the content rules, so translation is copy work, not layout work. |
| Nothing overflows with Bangla text | **Pass.** An automated check over every frame found no horizontally clipped or truncated text. Vertical cut-offs only happen inside intentional scroll regions (specialist lists N1/N3, the results-chat thread C1, filter chip rows). In production these must be real scroll containers (`overflow-y:auto` lists, `overflow-x:auto` chip rows with `scroll-snap`). Never use `text-overflow:ellipsis` on Bangla labels. Let them wrap. |
| Risk classes never rely on colour alone | **Pass after one fix.** Everywhere uses `RiskBadge` (tinted pill + icon + label + 4-step bars) or `ScoreGauge` with its badge. The one failure was the Doctor Report composite-score band: its coloured zones only had numeric ticks. Zone labels (Low/Moderate/Elevated/High · কম/মাঝারি/বাড়তি/উচ্চ) were added. Flagged questionnaire rows use tint + flag icon + "At-risk" text. |
| Empty / loading / error for lists | **Added** in `States.html`: timeline, documents, reminders, specialists, past screenings. Each has empty (StateView + one verb CTA), loading (Skeleton shaped like the real card) and error (system-blamed copy, "your work is saved", Try again). |
| Chat states | Empty, voice, streaming, thinking, offline (question saved), AI unavailable → `Assistant Chat.html` (X1, X2, C1, C4). **Added:** thread loading, history empty, history error → `States.html` CH1–CH3. |
| Camera permission denied | **Added** in `States.html`: K1 pre-permission explainer, K2 permission denied (settings steps + Try again + continue without games, with a "less certain" note), K3 camera won't start. |
| Token bug | `--text-link` referenced an undefined `--sj-blue-ink`. It is now defined as `#1373A3` in `tokens/tokens.css`. |

### Routes with no design yet
These need design before build. Do not invent them silently:
- `/[locale]` **landing** — only the in-app splash exists (Onboarding 01). There is no marketing/landing page.
- `/share/[token]` — the **recipient's** view of a shared report (plus expired/revoked states). Only the owner's share sheet exists (Results S1–S3).
- `/teacher` — teacher dashboard (class list of children). Only the teacher's sign-up and chat (Assistant Chat V1–V2) exist.
- `/specialist` — specialist dashboard (patients, shared reports). Only first login (Onboarding 04b) and the specialist chat (V3) exist.
- `/admin` — no design (it also creates specialist accounts, per Onboarding copy).
- `/screenings/[id]/clinician` — only the **print/A4** Doctor Report exists. The web view should reuse that content in a `reading-max`/`content-max` column.

---

## 2 · Screen → route map
All routes live under `/[locale]` (`bn` default, `en`). The language toggle swaps the locale segment and keeps the path. Frame IDs refer to captions on the canvases in `design/`.

| Route | Screen(s) | File · frame | Viewport |
|---|---|---|---|
| `/[locale]` | Landing — **not designed**. Use the Splash for the app entry | Onboarding Screens · 01 | 390 |
| `/login` | Log in · specialist first-login "set new password" (shown when the account has a temp password) | Onboarding · 04a, 04b | 390 |
| `/signup` | Choose role → sign up (parent: phone/email tabs · teacher: + school) | Onboarding · 02, 03a, 03b | 390 |
| `/home` | Parent home: screening only / companion only / both. Companion home with child card, "today", suggested activity, FAB quick-log. AI entry FAB | Screening Flow · 01a–01c; Companion · H1; Assistant Chat · E1 | 390 / desktop shell |
| `/screening/new` | Child details (stepper 1/4) | Screening Flow · 02 | 390 |
| `/screening/[id]/consent` | Consent (stepper 2/4) | Screening Flow · 03 | 390 |
| `/screening/[id]/questions/[n]` | Question (n = 1…20): pick answer · "Other (write)" · AI-confirmed free text. After 20 → Part-2 intro | Screening Flow · 04a, 04b, 04c, 05 | 390 |
| `/screening/[id]/activities/[task]` | `task` = `setup` (camera check, + K1–K3 permission states) · `calibration` · `name-call` (wait / call now) · `point` (how-to / stimulus) · `copy` (demo / child's turn) · `look` (optional) · `free-play` · `analysing` | Screening Flow · 06, 07, 08a–b, 09a–b, 10a–b, 11, 12, 13; States · K1–K3 | 390, child-facing frames full-bleed |
| `/screening/[id]/result` | Result in 4 classes (full scroll). Share sheet, QR/copied, link revoked, chat about the result | Results · R1–R4, S1–S3, C1 | 390 |
| `/screenings/[id]/report` | Parent report (A4, printable) | Parent Report.html | A4 |
| `/screenings/[id]/clinician` | Clinician report (A4, en/bn toggle). Web view not designed | Doctor Report.html | A4 |
| `/share/[token]` | **Not designed** — the recipient view. Reuse the clinician report body + expiry/revoked states | — | — |
| `/specialists` | Map + list with type filters, location-off division picker, desktop. States SP1–SP3 | Results · N1, N2, N3; States · SP1–3 | 390 / 1280 |
| `/children/[id]/overview` | Overview (desktop) · mobile overview with AI entry | Companion · B1; Assistant Chat · E2, D3 | 1280 / 390 |
| `/children/[id]/timeline` | Timeline · states | Companion · B2; States · TL1–3 | 1280 / 390 |
| `/children/[id]/progress` | Progress | Companion · B3 | 1280 |
| `/children/[id]/care-plan` | Care plan | Companion · B4 | 1280 |
| `/children/[id]/documents` | Documents + screening reports · upload flow · states | Companion · B5, D1–D3; States · DC1–3 | 1280 / 390 |
| `/children/[id]/care-team` | Care team, join requests, activity | Companion · B6 | 1280 |
| `/children/[id]/chat` | AI assistant — mobile + desktop, all states, status report flow | Companion · C1–C3, B7; Assistant Chat · all; States · CH1–3 | 390 / 1280 |
| `/teacher` | **Not designed** (teacher chat scope exists: Assistant Chat V1–V2) | — | — |
| `/specialist` | **Not designed** (specialist chat: V3) | — | — |
| `/admin` | **Not designed** | — | — |

**Designed screens your map doesn't route yet.** Suggested routes:
- `/children/new?step=1…5` — profile wizard without screening: Companion W1–W5 (incl. W3 traits in 10 parts, W4 care team + child ID, W4b QR sheet).
- Quick log — a **bottom sheet** over `/home` or `/children/[id]/*` (Companion Q1–Q3). No route. Optionally `?log=new`.
- `/reminders` — reminder centre (Companion R1; States RM1–3).
- `/children/[id]/activities/[activityId]` — activity detail → done (Companion A1–A2).
- `/children/[id]/reports/[reportId]` — AI status report page, printable (Companion C3; Assistant Chat R3).

---

## 3 · Components
### Design-system primitives (build these first, names as listed)
| Name | Props (enums) | Notes |
|---|---|---|
| `Icon` | name, size, strokeWidth, color, title | Lucide 0.460, 2 px stroke. Sizes 16–20 UI, 22–24 nav, 32–44 empty states |
| `Button` | variant `primary\|secondary\|ghost\|danger`, size `sm\|md\|lg`, icon, iconRight, block, loading, disabled, type, lang | Pill. Labels are verbs. `danger` only for destructive actions |
| `IconButton` | icon, **label (required, localised)**, variant `ghost\|soft\|solid`, size `sm\|md` | 48 px hit area |
| `TextField` | label, hint, error, optionalLabel, value, defaultValue, onChange, placeholder, multiline, rows, type, icon, id, required, disabled, lang | 14 px radius |
| `ChoiceCard` | label, description, selected, multi, icon, onSelect, disabled, lang | Selected = navy border + inset ring + navy-50 + filled indicator |
| `ChoiceGroup` / `ChoiceOption` | value, label, description, icon (option) | Single/multi + "Other (write)" that opens a textarea |
| `Chip` | label, selected, onClick, icon, tone `calm\|warm\|sky\|leaf`, onRemove, removeLabel, lang | 44 px min height |
| `LanguageToggle` | value `bn\|en`, onChange, label | In every header |
| `Stepper` | steps, total, current, variant `segments\|labeled`, countLabel, caption, lang | |
| `Tabs` / `TabItem` | items {id,label,icon,count}, value, onChange, variant (`pill`), lang | |
| `BottomNav` / `NavItem` | items {id,label,icon,badge}, value, lang | 72 px |
| `Sidebar` / `SidebarItem` | items {id,label,icon,badge,section}, value, header, footer, lang | 264 px |
| `Card` | tone `calm\|warm\|sky\|flat`, interactive, padding, as | White 20 px radius + hairline + shadow-sm. Toned cards have no shadow |
| `Avatar` | src, name, size, alt | Initial fallback |
| `RoleBadge` | role `parent\|teacher\|specialist`, label, lang | |
| `ChildCard` | name, meta, avatarSrc, stats, badge, onClick, lang | |
| `LogEntryCard` | author, role, roleLabel, time, title, body, tags, attachments, comments, avatarSrc, onClick, lang | |
| `ReminderCard` | title, time, kind `therapy\|appointment\|medicine\|activity`, done, onToggle, toggleLabel, lang | |
| `ActivityCard` | title, description, imageSrc, icon, meta, status `todo\|done`, doneLabel, ctaLabel, onStart, lang | |
| `SuggestionCard` | eyebrow, title, body, sources, status `pending\|confirmed`, confirmedLabel, labels, onConfirm, onEdit, onDismiss, lang | Leaf corner. AI copy is always tentative + cited |
| `RiskBadge` | level `low\|moderate\|elevated\|high`, label, size `md\|lg`, showBars, lang | **The only way to show a risk class.** Icons: sprout / eye / compass / hand-heart |
| `ScoreGauge` | value, max, thresholds, level, caption, maxLabel, width, showBadge, lang | Always with badge (or a RiskBadge nearby) |
| `ChatBubble` | from `assistant\|user`, sources, sourcesLabel, time, avatarSrc, lang | Leaf corners |
| `SourceChip` | label, kind `log\|report\|doc\|guide`, onClick, lang | Opens the source in a Sheet |
| `Toast` | tone `success\|info\|warning\|error`, title, message, actionLabel, onAction, onClose, closeLabel, lang | |
| `StateView` | kind `empty\|loading\|error\|offline\|done`, title, message, icon, illustrationSrc, action, lang | |
| `Skeleton` | width, height, radius | Shimmer. Respect reduced motion |
| `Modal` | open, title, footer, onClose, closeLabel, icon, lang | 28 px radius. Overlay `--surface-overlay` |
| `Sheet` | open, title, footer, onClose, closeLabel, lang | `--radius-sheet` |

### Product composites (from the screen files — build on the primitives)
- **Shells:** `MobileShell` (status-safe header 56 px + scroll body + sticky footer CTA with page-colour fade + optional BottomNav), `AppHeader` (back · title · action), `DeskShell` (Sidebar 264 + top bar 72 with breadcrumb/LanguageToggle + child header + Tabs; content max 1120), `ChildTabs`.
- **Screening:** `ScreenHero`, `PastScreeningRow`, `QuestionHeader` (progress bar + n/20), `QuestionIllustration`, `AiConfirmCard` (dashed teal), `CamFeed` (viewfinder + face box + live pill), `SetupCheck`, `ParentPill`, child-facing `Stage` + `Character` (poses idle/point/clap/wave/up/head/turn) + `Ball`/`Boat` stimuli, `CalibrationStar`, `TrialDots`, `ParentPrompt` (calm/go message cards), `AnalysingView`.
- **Results:** `ResultScreen` (gauge + badge + domain rows + next steps + not-a-diagnosis note), `ShareSheet` / `LinkBox` (expiry, copy, WhatsApp, QR, revoke), `QRCode`, `SpecialistCard`, `FilterChips`, `MapView` + pins/popup, `DivisionPicker`.
- **Companion:** `ProfileWizard` (WStep, ChipSet with "Other"), `QuickLogSheet` (topic chips → `FaceRating` 1–5 → note), `Sparkline`, `Trend`, `GoalRow`, `DocUpload` (type/source picker → reading → side-by-side review with numbered fields + "couldn't read" marks), `StatusReport` (setup sheet → card → printable page), `CareTeamList`, `JoinRequest`.
- **Assistant:** `AssistantHeader` (scope line per role), `Composer` (attach · field · send/voice, LanguageToggle, AI disclaimer), `TypingRow`, `ReminderDraft` / `ActivityDraft` / `LogDraft` (SuggestionCard variants), `UrgentCard` (tap-to-call), `MedCard` (prescription verbatim), `SourceSheet`, `HistoryList`, `DeskAside` ("Rafi now", goals, upcoming).

---

## 4 · Interactions & behaviour
- **Language:** `LanguageToggle` switches the `[locale]` segment and sets `<html lang>`. Every bilingual block carries `lang`. Use Bangla numerals in bn (`toBnDigits()`) and Latin in en. Bangla runs 20–30 % longer, so layouts must wrap and never truncate.
- **Line-height** is driven by `:lang()`: bn body 1.7 / headings 1.45, en body 1.5 / headings 1.2.
- **Motion:** ease-out `cubic-bezier(.22,.8,.36,1)`; 120/200/320/480 ms. Enter = rise 8 px + fade. Completion ticks use the soft spring. Loading = three breathing dots (blue/teal/sprout) or Skeleton. Every duration drops to 0 under `prefers-reduced-motion`. Child-facing stage animations stop too.
- **Hover:** white surfaces → navy-50; primary → navy-deep; interactive cards lift 1 px to shadow-md. **Press:** scale .97–.99. **Focus:** `--ring-focus` (white gap + 2 px blue).
- **Questionnaire:** answers autosave per question. Back keeps the answer. "Other" opens a textarea, and the AI paraphrase must be confirmed or edited before it counts (04c).
- **Camera:** show the K1 explainer before calling `getUserMedia`. On `NotAllowedError` → K2. On `NotReadableError` / `NotFoundError` → K3. "See results without the games" produces a questionnaire-only result marked lower confidence. Camera is on only during activities.
- **Errors** blame the system and confirm the user's work is safe. Offline chat keeps the question queued (X1).
- **Share links** expire, can be revoked (S3), and are viewed at `/share/[token]`.
- **Reports** always say it's not a diagnosis.

## 5 · State to model
`locale`; `user.role` (parent/teacher/specialist/admin) + `mustChangePassword`; `screening` {id, child, consent, answers[20] (choice | other text + aiConfirmed), activities{task: status, trials[]}, cameraPermission: prompt|granted|denied|unavailable, result {score, level, domains, confidence}}; `shareLinks[]` {token, expiresAt, revokedAt}; `child` {profile, traits, careTeam[] with per-member permissions, logs[], reminders[], activities[], documents[] {ocrFields, unreadable[] , verified}, goals[]}; `chat` {threads[], messages[] with sources[], drafts (pending|confirmed|dismissed), online}. Every list has `status: loading | ready | empty | error`.

## 6 · Design tokens
Source of truth: **`tokens/tokens.css`** (CSS variables). Tailwind: **`tokens/tailwind.config.js`** (v3) or **`tokens/tailwind.v4.css`** (v4 `@theme`). Fonts: **`tokens/fonts.css`** + `tokens/fonts/` (self-hosted woff2, Bengali + Latin subsets, OFL).

- **Brand:** navy `#004E8B` (ink + primary), navy-deep `#003C78`, blue `#1586BC`, sky `#249CC0`, teal `#03B4BA`, mint `#3ABEB1`, leaf `#47AC8D`, sprout `#8CC88A`, teal-deep `#0A7788`, amber `#F8B442`. Mid-tones are fills only.
- **Text-safe inks:** teal `#0A7788`, leaf `#2C7A62`, amber `#7A4E00`, link `#1373A3`.
- **Tints:** navy-50 `#EAF2F9`, navy-100 `#D3E4F2`, sky-50 `#E8F4FA`, teal-50 `#E3F6F5`, teal-100 `#C6ECEA`, leaf-50 `#E7F4EE`, sprout-50 `#EEF7EC`, amber-50 `#FEF4DE`, amber-100 `#FDE6B4`.
- **Neutrals:** 0 `#FFFFFF` · 25 `#FAFBF8` (page) · 50 `#F4F7F6` · 100 `#EAF0F0` · 200 `#DAE4E6` · 300 `#C2D0D4` · 400 `#94A6AE` · 500 `#5F7082` · 600 `#47596B` · 700 `#2E4256` · 800 `#1B2F44` · 900 `#0F2236`.
- **Risk (fill / ink / bg):** low `#47AC8D/#246B55/#E5F4EE` · moderate `#F8B442/#7A4E00/#FEF3DC` · elevated `#E8833A/#8A4210/#FCEBDD` · high `#C8553D/#8E3322/#F8E4DF`.
- **Feedback:** success `#2C7A62` · info `#1373A3` · warning `#7A4E00` · danger `#B04A33` (hover `#953B27`, destructive only).
- **Type:** display Baloo Da 2 (500–800), body Hind Siliguri (400–700). Sizes display 36/48, h1 28/34, h2 22/26, h3 19, body-lg 18, body 16 (minimum), small 14, caption 13.
- **Spacing:** 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80. Tap ≥ 48 (chips 44). Gutters 20 mobile / 32 desktop. Content max 1120, reading max 640, sidebar 264, bottom nav 72.
- **Radius:** 6, 10, 14 (inputs), 20 (cards), 28 (dialogs), pill. Leaf `22 22 22 6` / `22 22 6 22`. Sheet `28 28 0 0`.
- **Shadow (navy-tinted):** xs, sm, md, lg, nav — see tokens.css. No inner shadows. No glassmorphism.
- **Gradients:** sky (hero panels), journey (brand moments only), gauge.

## 7 · Assets
- `design/assets/` — logo lockups (bn + en): `shohojatri-logo*.png` stacked, `shohojatri-mark.png`, `shohojatri-wordmark-bn.png` / `-en.png`. Only brand asset supplied.
- Icons: Lucide 0.460 (`lucide-react` in production).
- Illustrations of Bangladeshi families: **not yet supplied.** Icon tiles stand in for them.

## 8 · Files (`design/`)
- `Onboarding Screens.html` — splash, role, sign-up, log-in, specialist first login · bn + en
- `Screening Flow.html` + `sf-shell.jsx`, `sf-a.jsx`, `sf-b.jsx` — home variants → activities · bn
- `Results.html` + `rs-*.jsx`, `rs.css` — results, share, chat, specialists, printable reports · bn
- `Parent Report.html` (bn) · `Doctor Report.html` (en/bn toggle) — A4 print
- `Companion.html` + `cm-*.jsx`, `cm.css` — wizard, home, quick log, reminders, activities, documents, chat, desktop dashboard · bn
- `Assistant Chat.html` + `ac-*.jsx`, `ac.css` — AI assistant, all states, roles, desktop · bn + en
- `States.html` — camera permission, list empty/loading/error, chat loading/history · bn + en
- `_ds/` — design-system reference bundle, component CSS, tokens, fonts (needed to open the HTML files)

Open any HTML file in a browser, then pan and zoom the canvas. Frame captions give the IDs used above.
