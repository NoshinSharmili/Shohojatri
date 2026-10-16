# Shohojatri POC — Prompt Pack

Two tracks that run in parallel:
- **Track A — Claude Design**: design system + screens. Start here first; it only needs the logo and this file.
- **Track B — Claude Code**: builds the working app phase by phase from `CLAUDE.md` + `docs/`. Phases 1–13 don't need the final design; phase 14 applies it.

How to use: run one prompt at a time, review, commit, then continue. For Claude Code, start each phase in plan mode for the bigger phases (marked ★), approve the plan, then let it build.

---

## Track A — Claude Design

### A0. Design system (attach `logo_shoho.png`)

```
Create a design system for "Shohojatri" (সহযাত্রী, "companion"), a Bangla-first, bilingual (Bangla/English) web app for parents of young children, special-school teachers and child-development specialists in Bangladesh. It has two parts: an early developmental screening (questionnaire + guided camera activities → a developmental risk report) and a companion that tracks an autistic child's progress with the family, teachers and doctors.

Base everything on the attached logo. Brand colours taken from it:
navy #004E8B (wordmark), deep navy #003C78, blue #1586BC, sky #249CC0, teal #03B4BA, mint #3ABEB1, leaf green #47AC8D, sprout #8CC88A, deep teal #0A7788, star amber #F8B442.
Risk-class colours (calm, never alarming): Low = leaf #47AC8D, Moderate = amber #F8B442, Elevated = #E8833A, High = #C8553D — always with a label and icon, never colour alone.

Feel: warm, calm, hopeful, trustworthy — soft rounded shapes and flowing curves like the logo, generous whitespace, friendly illustrations of Bangladeshi families, not clinical or cold. Avoid red-alert styling, puzzle-piece imagery and anything that implies a child needs "fixing".

Typography: must render Bangla beautifully — use Hind Siliguri (or Noto Sans Bengali) for Bangla and a matching Latin face; Bangla body line-height ≥ 1.6; body 16px minimum on mobile. Show every component in both Bangla and English — Bangla text is longer.

Deliver tokens (colour, type scale, spacing, radius, shadow, motion) and components: buttons (primary/secondary/ghost/danger), inputs, single/multi choice answer cards with an "Other (write)" option that expands to a text box, chips, segmented language toggle (বাংলা | EN), progress stepper, cards (child card, log entry card with author-role badge Parent/Teacher/Specialist, reminder card, activity card, AI-suggestion card with Confirm/Edit/Dismiss), risk class badge + score gauge, tabs, bottom navigation (mobile) and sidebar (desktop), chat bubbles with source chips, toasts, empty/loading/error states, modal/sheet. Mobile-first (390px) and desktop (1280px). WCAG AA contrast.
```

### A1. Onboarding & auth

```
Using the Shohojatri design system, design mobile screens (Bangla, with an English variant of each):
1. Splash/landing with logo, one-line promise ("প্রথম চিন্তা থেকে দীর্ঘ পথচলা — শিশুর পাশে সবসময়"), language toggle, "শুরু করুন".
2. Choose role: Parent / Special-school teacher. Small link: "Are you a specialist? Your account is created by Shohojatri — log in here."
3. Sign up (name, phone or email, password) — parent and teacher (teacher adds school name).
4. Log in; first-login "Set a new password" for specialists.
Keep forms short, friendly, large tap targets.
```

### A2. Screening flow (parent, mobile)

```
Design the screening flow for a parent on a phone, in Bangla (sample child: রাফি, 2 বছর ১০ মাস):
1. Parent home: warm welcome, "স্ক্রিনিং শুরু করুন" hero card explaining in 2 lines what screening is (not a diagnosis, ~15 minutes), list of existing children.
2. Child details form (name, date of birth, who is answering).
3. Consent screen: plain-language points with icons — not a diagnosis; camera and mic are used only on this phone, video is never uploaded; you can delete anytime; you choose who sees the report. Checkbox + continue.
4. Questionnaire: one question per screen, small friendly illustration, 4 answer cards (হ্যাঁ, বেশিরভাগ সময় / মাঝে মাঝে / খুব কম / কখনো না / নিশ্চিত নই) + "অন্য কিছু (লিখে দিন)" expanding to a text box; progress bar "প্রশ্ন ৫/২০"; back button. Variant showing the AI confirmation: "আমরা বুঝেছি: মাঝে মাঝে — ঠিক আছে?" with confirm/change.
5. Part 2 intro: what the activities are, what you'll need (a toy, good light, quiet room), "each can be skipped".
6. Setup check: live camera view with friendly checks (light ✓, face found ✓, quiet ✓), and fix-it tips.
7. Calibration: full-screen playful star moving left/centre/right.
8. Response to name — parent view: phone held by parent facing the child; big state messages "রাফি খেলছে… অপেক্ষা করুন" then "এখন একবার নাম ধরে ডাকুন" (very large, high contrast), trial dots 1/3, Skip / Something went wrong.
9. "Look where I point" — child-facing on-screen stimulus: a friendly animated character in the centre between two toys (ball and toy boat) pointing to one; plus the choice screen "On screen" vs "With me (live)".
10. "Copy me" — on-screen character demonstrating clap / wave / arms up / touch head, with a "your turn" state.
11. "Look & watch" (optional) — split screen social vs patterns (just layout).
12. Free play — 2-minute timer, "play as you normally do".
13. Analysing screen (calm animation using the logo's path motif).
Child-facing screens must be simple, bright, uncluttered, no text the child needs to read; parent-facing instructions are short.
```

### A3. Results, reports, help

```
Design the results experience (Bangla, mobile + desktop for reports):
1. Result screen for each class (Low, Moderate, Elevated, High): class badge with icon, score gauge (e.g. 52%), headline ("বেশ কিছু প্রাথমিক লক্ষণ দেখা গেছে"), "এর মানে কী" (2–3 sentences, clearly not a diagnosis), "যা লক্ষ্য করেছি" (3 items), "যা ভালো দেখেছি" (strengths), next steps, confidence note, buttons: ডাক্তারকে রিপোর্ট দিন · কাছের বিশেষজ্ঞ খুঁজুন · ফলাফল নিয়ে প্রশ্ন করুন. Tone must be calm and supportive even for High.
2. Parent report — printable A4 page.
3. Doctor report — printable A4, information-dense but clean: identifiers, summary, questionnaire table, per-activity metrics with trial table, data quality, red flags, method note, QR code. English with a বাংলা toggle.
4. Share sheet: link with expiry, copy, WhatsApp share, QR, revoke.
5. Results chat: AI chat with suggested question chips and a gentle "not a diagnosis" banner.
6. Nearby specialists: map + list cards (name, type, distance, tap-to-call, "Shohojatri-তে আছেন" badge), filter chips by type, division picker if location is off.
```

### A4. Companion — parent

```
Design the companion module for a parent (Bangla, mobile first, plus desktop for the child dashboard). Sample child রাফি, autistic, 3 years 2 months; teacher শিক্ষিকা নাসরিন; specialist ডা. তানভীর.
1. Activation wizard: diagnosis details → characteristics questionnaire (10 short sections with chips and "Other") → care team with Child ID "SJ-7K3QX" (copy, share, QR) → done.
2. Parent home: child card, "আজ" (today's reminders: speech therapy 4pm, evening walk), suggested activity card, quick-log floating button.
3. Child dashboard tabs: Overview ("এখন রাফি" AI summary with source chips, recent changes, open concerns, next appointment, goals with progress), Timeline (entries with author badges, filters, "সহজ করে বুঝিয়ে দিন" button on teacher/doctor notes), Progress (domain trend charts, goal progress, check-in metrics, screening history), Care plan, Documents, Care team (members, pending requests with approve + scope toggles: share medicines / share documents, activity log), Chat.
4. Quick log bottom sheet: domain chips → 1–5 face rating → optional text → save.
5. Document upload + AI extraction review: image on top, extracted fields below (medicine name, dose as written, frequency, follow-up date) with "unreadable" warning chip, Confirm.
6. Companion chat: answers with source chips, suggested-action cards (reminder draft, activity card), Status report button and a rendered status report page.
7. Reminders centre and activity detail (steps, materials, why it helps, "করেছি" done button).
```

### A5. Teacher, specialist, admin

```
Design:
1. Teacher home (mobile): "শিশুর অ্যাক্সেস চান" box with Child ID input + message + send; grid of approved child cards with "২টি নতুন" badges; pending requests list. Confirmation state: "আইডি সঠিক হলে অভিভাবককে জানানো হয়েছে".
2. Teacher view of a child dashboard (education scope) with a prominent "ক্লাসের নোট যোগ করুন" and a classroom note template.
3. Specialist home (desktop-first): patient list table (name, age, next follow-up, last update), request access box, verified badge; child dashboard with screening reports and "Add clinical note" (visibility: care team / clinical only).
4. Admin (desktop): specialists table, "Add specialist" form (name, specialty, registration no., organisation, contact, chamber location) and the one-time password reveal, audit log.
```

### A6. Handoff check

```
Review all screens: every screen exists in Bangla and English, nothing overflows with Bangla text, risk classes never rely on colour alone, empty/loading/error states exist for lists, chat and camera permission denied. Then prepare the handoff for Claude Code: tokens as CSS variables + Tailwind theme, component list with names, and a screen-to-route map:
/[locale] (landing) · /login · /signup · /home · /screening/new · /screening/[id]/consent · /screening/[id]/questions/[n] · /screening/[id]/activities/[task] · /screening/[id]/result · /screenings/[id]/report · /screenings/[id]/clinician · /share/[token] · /specialists · /children/[id]/(overview|timeline|progress|care-plan|documents|care-team|chat) · /teacher · /specialist · /admin
```

Put the exported handoff in the repo at `design/`.

---

## Track B — Claude Code

### B0. Kickoff (once)

```
Read CLAUDE.md, docs/SCREENING_SPEC.md and docs/COMPANION_SPEC.md completely. Then:
1. Create docs/OPEN_QUESTIONS.md with anything ambiguous or contradictory (max 15, each with your recommended default).
2. Propose the build order for the phases in PROMPTS.md Track B with a rough size for each.
Don't write code yet.
```

### B1. Scaffold ★

```
Scaffold the monorepo exactly as in CLAUDE.md §4:
- apps/api: FastAPI with uv, settings via pydantic-settings, SQLAlchemy 2 + Alembic (SQLite default, DATABASE_URL override), health endpoint, CORS for the web app, error format from CLAUDE.md §5, ruff + pytest configured, .env.example.
- apps/web: latest stable Next.js App Router + TypeScript strict + Tailwind with the brand tokens from CLAUDE.md §7 as CSS variables, next-intl with [locale] routing (bn default, / → /bn), messages/bn.json + en.json, Bengali font via next/font, language toggle component, TanStack Query provider, openapi-typescript client generation script (`pnpm gen:api`), .env.example.
- Find the logo file (logo_shoho.png) in the repo and move it to apps/web/public/brand/.
- docker-compose.yml running api + web.
- A placeholder landing page in Bangla with the logo that calls /health.
Done when: both apps start with the commands in CLAUDE.md, /bn and /en render, lint/typecheck/tests pass. Write docs/CHANGELOG.md.
```

### B2. Auth, roles, admin ★

```
Implement auth and roles per CLAUDE.md §3 and COMPANION_SPEC §3 and §15 (users table):
- Sign-up for parent and teacher; login; refresh; logout; change password; /me. argon2 hashing; JWT access + refresh in httpOnly, SameSite=Lax cookies.
- Specialists: admin-only creation endpoint returning a one-time temporary password; must_change_password enforced (all other endpoints return 403 with code `password_change_required`).
- Admin: list/deactivate specialists.
- Seed: admin@demo.bd, parent@demo.bd, teacher@demo.bd, teacher2@demo.bd, doctor@demo.bd (password demo1234).
- Web: login, signup (role choice), set-new-password, role-based redirect to /home (parent), /teacher, /specialist, /admin; route guards; basic admin pages.
- Tests: auth flows, role guards, forced password change.
Plain, accessible UI using tokens — final visuals come later.
```

### B3. Children, Child ID, access requests, audit ★

```
Implement COMPANION_SPEC §2 and §3:
- children model + Child ID generator (SJ- + 5 Crockford base32 chars), regenerate.
- access requests with non-enumerating responses and 10/day rate limit; approve with scope options; decline; revoke; 14-day expiry.
- One permission table in code + `require_child_access(child_id, need=...)` FastAPI dependency; audit_log writes for every non-parent access.
- Notifications table + in-app notification list (request received/approved/declined).
- Web: parent "Care team" page (pending requests, approve with toggles, members, revoke, Child ID copy/share/QR); teacher and specialist home (request box, child cards, pending list).
- Tests: a parametrised matrix of role × permission × grant state (none/pending/approved/revoked), enumeration-safe responses, rate limit.
```

### B4. Screening — child setup, consent, questionnaire

```
Implement SCREENING_SPEC §1–§3 and the matching API from §10:
- Seed the 20 items from §3.2 (bn + en, domain, direction, critical, weight, min_age) into seed/questionnaire.yaml and load them.
- Child details (reuse existing child or create), age gating messages, consent (store text version + timestamp).
- One-question-per-screen UI with the answer options from §3.1, "Other" expanding to text, q13 single-choice, q19/q20 special options, final free-text note, progress saving and resume, back navigation.
- "Other" mapping via ai/llm.py + prompts/answer_mapper.md with the confirm UI; fallback when no API key.
- score_questionnaire() in apps/api/app/scoring with unit tests (age eligibility, not_sure exclusion, q13 age table, critical failures).
Done when a parent can complete the questionnaire in Bangla and English and resume after reload.
```

### B5. Scoring engine + fixtures ★

```
Build apps/api/app/scoring per SCREENING_SPEC §4.4–§4.9, §5 and §6 — pure Python, no I/O:
- config.yaml with every threshold, window and weight from the spec, plus scoring_version.
- detect_rtn, detect_joint_attention (both variants), detect_imitation, detect_gaze_preference, detect_free_play, combine() with renormalised weights, classes, red-flag floors, confidence, top concerns/strengths as i18n finding keys + params.
- scripts/make_fixtures.py generating synthetic frame streams for typical / elevated / noisy profiles for every task (realistic noise, missing faces, latencies, oscillating wrists for free play).
- pytest: each detector on each profile, edge cases (no valid trials → inconclusive, t0 fallback, pre_state facing excluded, calibration fallback), combine() with missing tasks and each floor rule, class boundaries 20/21, 45/46, 70/71.
Report coverage for app/scoring (target ≥ 90%).
```

### B6. Browser capture, setup check, calibration, activities ★

```
Implement lib/cv in apps/web per SCREENING_SPEC §4.1–§4.8:
- Lazy-load @mediapipe/tasks-vision (FaceLandmarker with blendshapes + transformation matrix, PoseLandmarker lite) and @mediapipe/tasks-audio (AudioClassifier/YAMNet); GPU with CPU fallback; ~15 fps processing loop; per-frame feature record exactly as in §4.1; RMS every 50 ms; no recording, no upload of media.
- Write lib/cv/README.md documenting coordinate conventions and how you verified yaw vs nose_dx sign.
- Setup check (§4.2), child-face confirmation when two faces are visible, calibration (§4.3).
- Task runners as small state machines with the exact timings in the spec: RTN with gating + "Call now" + optional vibration; Look where I point on-screen (animated SVG character + two toys, 6 balanced trials, Bangla voice line "দেখো!" — generate simple audio with the Web Speech API if no recorded asset; note it in OPEN_QUESTIONS) and the live variant; Copy me (on-screen demo + live variant with spoken countdown); Look & watch; Free play.
- Skip / try again / "something went wrong" on every task; upload frames+markers+audio_events+device+quality to POST /screenings/{id}/tasks/{task}; show per-task status.
- Handle camera/mic permission denied and unsupported browsers with clear Bangla/English guidance and the option to continue with the questionnaire-only report.
Test manually on desktop Chrome and Android Chrome; write findings in docs/CHANGELOG.md.
```

### B7. Finalize, reports, sharing, demo mode

```
Implement SCREENING_SPEC §5–§7 and §9:
- POST /finalize runs the detectors + combine and stores RiskResult; works with questionnaire only.
- Result screen per class with gauge, headline, what this means, what we noticed / what went well (from finding keys), next steps, confidence note.
- Parent report and doctor report pages with print CSS (A4), "Download PDF" via window.print, doctor report English default with বাংলা toggle, QR code to share URL.
- report_shares: create (hashed token, 30-day expiry), revoke, public /share/[token] page, view counting.
- Demo screening mode (?demo=1 or settings toggle): replay fixtures through the same endpoints, visibly labelled "Demo" in UI and reports.
Done when the demo parent can run a full demo screening on a laptop without a camera and print both reports in Bangla.
```

### B8. Results chat + nearby specialists

```
Implement SCREENING_SPEC §8:
- ai/llm.py (OpenAI client, OPENAI_MODEL env, streaming helper, JSON-output helper, graceful "AI not configured"), ai/prompts/results_explainer.md and ai/prompts/safety.md (from COMPANION_SPEC §13.4).
- POST /screenings/{id}/chat streaming SSE with only that screening's data; suggested question chips; replies in current locale.
- specialist_directory seed: ~15 fictional sample entries across Dhaka, Chattogram, Sylhet, Rajshahi, Khulna marked is_sample, plus the seeded specialist user; GET /specialists/nearby with haversine; division picker with approximate centroids.
- Web: chat UI, specialists map (Leaflet + OSM) + list with type filters, tap-to-call, "Sample" and "On Shohojatri" badges.
- Tests: results chat prompt contains no other child's data; nearby sorting.
```

### B9. Companion — activation, characteristics, logs, timeline ★

```
Implement COMPANION_SPEC §1, §4, §5:
- Activation wizard (from a screened child or a new child), diagnosis details, characteristics questionnaire (10 sections, bilingual options + Other, versioned), care-team step showing Child ID.
- Logs: model, create/edit-within-24h/correction, visibility, ratings, goal progress; role templates for teacher/specialist; quick-log bottom sheet.
- Timeline with filters and author badges; "Explain this to me" (POST /logs/{id}/explain, not saved unless the parent saves it).
- Notifications for new professional entries (daily digest when > 3).
- Tests: visibility rules per role, edit window, correction chain.
```

### B10. Documents + care plan

```
Implement COMPANION_SPEC §6 and §7:
- Upload (PDF/JPG/PNG ≤ 10 MB) to UPLOAD_DIR with random names, authorised download endpoint.
- Extraction with prompts/document_extractor.md (pypdf for PDFs, the multimodal lightweight model for images) → draft with illegible_fields; review screen side-by-side; confirm creates medications/therapies/follow-ups + a clinical_note log + optional reminders.
- Goals, therapies, medications, follow-ups CRUD with role rules; teacher goal suggestions the parent can accept.
- Tests: unconfirmed extraction never appears in context or care plan; teacher can't see medications/documents unless shared.
```

### B11. Context engine, retrieval, companion chat, status report ★

```
Implement COMPANION_SPEC §11–§13:
- child_context schema (Pydantic), context_updater prompt, debounced background update on every trigger, validation + one retry, versioning with changelog, deterministic domain trends and stats.
- Read-time scope filtering (statement visible only if all source_ids are visible to the viewer).
- Embeddings for logs and confirmed documents; numpy cosine retrieval with the same scope filter.
- Companion chat: prompt assembly exactly as §13.2, SSE streaming, citations + suggested_actions tail, conversation history with summarisation after 12 turns, urgent-situation card (999).
- Status report: deterministic numbers + LLM narrative, audiences parent/teacher/doctor, saved, printable, shareable to care team.
- Tests with the LLM mocked: context never cites non-existent sources, conflicts recorded not resolved, teacher never receives clinical-derived text via context, retrieval or report; medication text copied exactly.
Add a small eval script (scripts/eval_chat.py) with 15 questions in Bangla/English against the seeded Rafi data, checking: answers cite sources, no diagnosis/medication-change language, urgent prompts show the 999 card.
```

### B12. Schedules, reminders, activity library

```
Implement COMPANION_SPEC §8–§9:
- schedule_items with recurrence + occurrences, reminder centre, "Today" card, browser notifications while the app is open, mark done (home_activity → activity_done log).
- AI-suggested reminders as confirm cards (never auto-scheduled).
- seed/activities.yaml with 30 activities following §9 (bn + en, household materials common in Bangladesh, why it helps, adaptations), reviewed: false; activity detail page; chatbot recommends only from library + therapist recommendations.
```

### B13. Dashboards & progress

```
Implement COMPANION_SPEC §14 views with real data: parent home, child dashboard tabs (Overview with "Right now" summary + citations, Timeline, Progress charts with Recharts — domain trends with 7-day smoothing, goal progress, screening history; Care plan; Documents; Care team; Chat), teacher home, specialist home (sortable patient list), admin.
Stretch: monthly check-in (§10) reusing the RTN, joint attention and imitation runners, plotted on Progress.
Then extend the seed so Rafi has 3 months of believable logs from parent/teacher/specialist, a prescription, therapy schedule, goals with progress, two check-ins and a filled context — so every tab looks alive in a demo.
```

### B14. Apply the Claude Design UI ★

```
The design handoff is in design/. Restyle the app to match it without changing behaviour, routes or API contracts:
1. Replace CLAUDE.md §7 tokens with the design's tokens (update CLAUDE.md).
2. Rebuild components in components/ui to match the design components (same names where possible).
3. Go screen by screen using the design's screen-to-route map; keep all i18n keys; add any new copy to both bn.json and en.json.
4. Check each screen at 390px and 1280px, in Bangla and English, light background; fix overflow.
List any design screens that have no matching feature (or vice versa) in docs/OPEN_QUESTIONS.md instead of inventing behaviour.
```

### B15. Demo polish & QA

```
Prepare for the pitch demo:
- Run every journey end to end in Bangla and English with the seeded accounts: parent screening (demo mode and real camera), reports + share link, results chat, specialists; activation → logs → document → chat → status report; teacher request → parent approval → teacher note → parent "explain"; specialist clinical note; admin creates specialist.
- Add Playwright smoke tests for these journeys (demo mode, LLM mocked).
- Go through the CLAUDE.md §9 checklist for every feature and fix gaps.
- Accessibility pass (keyboard, labels, contrast), performance pass (MediaPipe lazy load, bundle size).
- Write README.md: setup in 5 commands, demo accounts, demo script (5-minute walkthrough following Rafi's journey), known limitations from SCREENING_SPEC §11.
```

---

## Useful one-liners during the build

- "Before changing anything, read the relevant section of docs/… and tell me which rules apply."
- "Run the CLAUDE.md §9 checklist on what you just built."
- "Show me the Bangla version of every new string you added and flag anything that sounds like a literal translation."
- "Add this decision to the spec and CHANGELOG."
