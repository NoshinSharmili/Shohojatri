# Open questions

Kickoff review (B0) of `CLAUDE.md`, `docs/SCREENING_SPEC.md`, `docs/COMPANION_SPEC.md`, `PROMPTS.md` and the design handoff (`design/design_handoff_shohojatri/README.md`).

Format: issue → **recommended default** (what we'll do unless told otherwise) · phases affected. Answered items move to the spec (and CHANGELOG) and are deleted here.

---

### 1. ~~Design already exists — still build "plain" first?~~ Resolved in B1
Handoff tokens and fonts are used from B1; CLAUDE.md §7/§8 updated.

### 2. Route map: design's map vs. PROMPTS/CLAUDE.md
Design routes use singular `/screening/new`, `/screening/[id]/…` for the flow and plural `/screenings/[id]/report|clinician` for reports (spec §7 agrees on the plural report routes). It also adds routes that no phase owns: `/children/new?step=`, `/reminders`, `/children/[id]/activities/[activityId]`, `/children/[id]/reports/[reportId]`, quick-log as a sheet (`?log=new`).
**Default:** Adopt the design's map verbatim, extra routes included, so B14 needs no route changes. Mixed singular/plural is cosmetic. · B4, B7, B9, B11, B12

### 3. Screens with no design, and missing English copy
Not designed: landing, `/share/[token]` recipient view (+ expired/revoked), `/teacher`, `/specialist`, `/admin`, clinician web view. Screening Flow, Results, Companion and Parent Report frames are Bangla-only.
**Default:** Build these from the primitives (clinician web view and share view reuse the Doctor Report body in a `reading-max` column). Landing = the in-app splash (Onboarding 01). Ask Claude Design for the teacher/specialist/admin screens before B14. Write English copy as we build, following the design's content rules. · B2, B3, B7, B13

### 4. `ai/llm.py` is needed before the phase that creates it
B4 uses `llm.py` + `answer_mapper.md` for "Other" answers (SCREENING §3.3); B8 is where `llm.py` is built.
**Default:** Minimal `llm.py` in B4 (client, JSON-output helper, "AI not configured" fallback, model names from env, confirmed against OpenAI docs). B8 adds SSE streaming and `safety.md`. · B4, B8

### 5. "Other" mapper only fits frequency items
SCREENING §3.3 says the mapper returns `usually|sometimes|rarely|not_sure`, but q13 (`sentences/single_words/sounds_gestures/little`), q19 (`no/yes/not_sure`) and q20 (hearing) have different options and all allow "Other".
**Default:** Send the item's own option keys to the mapper and accept only one of those. q20 is unscored, so its "Other" text is stored verbatim for the doctor report without mapping. · B4

### 6. Confidence rules overlap
SCREENING §6.4 (High/Medium/Low) and §3.5 ("< 80% scorable → confidence drops one level") overlap: High already requires ≥ 80%, "questionnaire answered" is undefined, and "most tasks low quality" can match both Medium and Low.
**Default:** (a) base level: High if ≥ 3 valid tasks and none `low`; Medium if ≥ 1 valid task and fewer than half of valid tasks are `low`; else Low. (b) then, if < 80% of eligible items are scorable, drop one level (min Low). Add both as config + tests. · B5

### 7. Look & watch (T4): weight and stimulus
§4.7 says it's unvalidated "hence low weight", but §6.1 gives it 0.10 (same as imitation, double free play). Its stimulus also needs animated children + a recorded traditional Bangla rhyme, which nobody has been asked to produce.
**Default:** Treat T4 as stretch: build it last in B6 with a simple SVG stimulus. Keep 0.10 in `config.yaml` as the spec says (weights renormalise when it's skipped). Flag the weight for the clinical advisor. · B5, B6

### 8. Voice prompts in Bangla
T2 ("দেখো!"), T3 ("এভাবে করো!", "এত্ত বড়!", 3-2-1 countdown) and calibration (soft sound) need audio. B6 suggests the Web Speech API, but most Android/desktop Chrome installs have no bn-BD voice, and the design supplies no audio.
**Default:** A team member records short clips (bn + en) as static assets. Web Speech is the fallback; a visual cue is used if neither works. · B6

### 9. Monthly check-ins: seeded but not built
CLAUDE.md §10 requires Rafi's seed to include two monthly check-ins; COMPANION §10 and B13 call the feature a stretch. It's also unclear whether teachers see check-ins: they are `check_in` logs (visible to teachers via `care_team`) but are re-runs of screening tasks (screening results are hidden from teachers per §3.2).
**Default:** Seed check-ins as `check_in` logs with metrics and plot them on Progress; the check-in runner stays a stretch. Check-in logs default to `clinical` visibility, and the parent can change it per entry. · B9, B13

### 10. Specialist access to a screening, and requests for screening-only children
SCREENING §7 says a parent can share with an on-platform specialist "in-app (grants access to that screening via the normal access flow)". But the normal flow is requester-initiated and grants are child-level, not per screening. Also unspecified: can access be requested for a child still in `screening` status?
**Default:** Child IDs exist for every child, whatever their status. "Share in-app" = the parent picks a Shohojatri specialist (from the directory) and sends an invite, which creates a normal child-level `clinical` grant once the specialist accepts. No per-screening grants. · B3, B7, B8

### 11. What "private" log visibility means
COMPANION §3.2 shows `private` as "author only (+ parent always)" in the parent column and "author only" for others. That reads as: a teacher's private note is still visible to the parent.
**Default:** `private` = author + the child's parent. The UI labels it "Only you and the parent" for non-parents and "Only me" for the parent's own entries. · B3, B9, B11

### 12. Sharing status reports across scopes
COMPANION §13.5 says status reports are "shareable with the care team". A report a parent or specialist generates (full or clinical scope) would then reach teachers, which conflicts with §11.3 (teachers never receive clinical-derived text).
**Default:** Store the scope a report was generated under. Sharing sends it only to members whose scope covers it; for others the UI offers "generate a teacher version" (regenerated from education-scoped context). · B11

### 13. Demo screenings and the real record
Not specified: whether demo-mode screenings (`is_demo`) appear in screening history, change `child.status`, or feed the context engine; and which fixture profile demo mode replays.
**Default:** Demo screenings appear in history with a "Demo" label, never trigger the context engine or show on Progress, and can be deleted in one tap. Demo mode replays `elevated` by default, with a settings switch for `typical` / `noisy`. · B7, B11

### 14. Data-model gaps (COMPANION §15 vs specs)
- `screenings` has no `informant` (who is answering) or the final free-text note, yet both appear in the doctor report.
- Calibration results have no home.
- Log edits are "versioned" (§5.1) but there's no versions table.
- `documents.visibility` values are undefined.
- `access_grants.can_add_logs` exists but §3.2 says all members can add logs.
**Default:** Add `screenings.informant` and `screenings.parent_note`. Store calibration as a `screening_tasks` row (`task = "calibration"`). Add `log_versions(log_id, version, snapshot_json, edited_at)`. `documents.visibility` = `care_team | clinical | private`, gated additionally by `share_documents`. `can_add_logs` defaults to true, and the parent can make a member read-only. Update §15 when built. · B3, B4, B9, B10

### 15. ~~Sign-up by phone, verification, password reset~~ Resolved in B2
Email or phone login, no OTP, admin-issued temporary passwords. Now in COMPANION_SPEC §3.1 ("Accounts and passwords").

---

**Decided without asking** (noted for the record, not open):
- Auth cookies stay first-party via a Next.js rewrite of `/api/v1/*` → FastAPI (verify SSE isn't buffered).
- The >3-entries daily digest is grouped when the notification list is read (no scheduler).
- Request expiry (14 days) is evaluated lazily.
- Audit log: one row per request per child touched.
- Logo comes from `design/assets/` (`logo_shoho.png` itself isn't in the repo). Copied in B1 to `apps/web/public/brand/logo_shoho.png` (bn) and `logo_shoho_en.png` (en).
