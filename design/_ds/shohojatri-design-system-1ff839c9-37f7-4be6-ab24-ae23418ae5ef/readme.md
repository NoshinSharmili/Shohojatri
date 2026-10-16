# Shohojatri Design System (সহযাত্রী — "companion")

Bangla-first, bilingual (Bangla / English) web app for **parents of young children, special-school teachers and child-development specialists in Bangladesh**.

Two product surfaces:
1. **Screening** — early developmental screening: questionnaire + guided camera activities → a developmental risk report. Mobile-first (390px). → `ui_kits/screening/`
2. **Companion** — tracks an autistic child's progress together with family, teachers and doctors: shared log, reminders, AI suggestions, assistant chat, reports. Desktop (1280px) + mobile. → `ui_kits/companion/`

## Sources
- `uploads/logo_shoho.png` — the only brand asset supplied (1254² PNG, white background). Cut into transparent lockups in `assets/logo/`.
- Written brief (colours, risk palette, feel, typography, component list). No codebase, Figma or existing screens were supplied — **all components and UI kits are original designs derived from the logo + brief**, not recreations.

---

## CONTENT FUNDAMENTALS

**Voice:** a warm, knowledgeable companion walking beside the parent — never a clinician delivering a verdict. Calm, hopeful, plain.

- **Bangla first.** Every string is written in Bangla first, then English. Bangla copy runs ~20–30% longer — layouts must wrap, never truncate. Use Bangla numerals (০১২৩…) in Bangla UI (`toBnDigits()` helper); Latin digits in English.
- **Address:** formal-warm "আপনি" (never তুমি/তুই). English uses "you". The product speaks as "we/I" only in the assistant ("আমি সারাংশ তৈরি করছি").
- **Name the child.** "আয়ানকে নাম ধরে ডাকলে…" beats "your child". Personal, specific.
- **Never imply fixing.** Say "extra support", "growth", "next step", "progress". Avoid "disorder", "abnormal", "fail", "fix", "cure", "suffer". Risk is "কম / মাঝারি / বাড়তি / উচ্চ ঝুঁকি" and always comes with what to do next.
- **Always say it's not a diagnosis** on reports: "এটি রোগনির্ণয় নয় — এটি পরবর্তী পদক্ষেপ বোঝার একটা সহায়ক।"
- **Reassure on questions:** "সঠিক বা ভুল উত্তর নেই — যা দেখেছেন সেটাই বেছে নিন।"
- **Errors blame the system, keep the user's work safe:** "সংযোগে সমস্যা — আপনার উত্তর সংরক্ষিত আছে।"
- **Casing (English):** Sentence case everywhere — buttons, titles, tabs ("Start screening", not "Start Screening"). No ALL CAPS except tiny Latin-only overline labels.
- **Buttons are verbs:** "শুরু করুন / Start", "সেভ করুন / Save", "শেয়ার করুন / Share". Secondary actions are gentle: "পরে করব / Maybe later".
- **Teachers & doctors by role-respectful names:** "রুমানা আপা", "ডা. নাসরিন".
- **Emoji:** not used. Celebration comes from the amber star colour and copy ("প্রথমবার!").
- **AI copy is tentative and cited:** "…মনে হচ্ছে", "চেষ্টা করে দেখতে পারেন", always with source chips and Confirm / Edit / Dismiss.

## VISUAL FOUNDATIONS

- **Colour:** straight from the logo. Navy `#004E8B` is the ink + primary action colour. Blues → teals → greens form the "journey" gradient (parent's figure flowing into the child and the hills). Star amber `#F8B442` = hope, celebration, warm notes. Text-safe inks: navy, deep teal `#0A7788`, leaf ink `#2C7A62`, amber ink `#7A4E00`. Mid-tones (teal, sky, mint, amber) are **fills only**, never body text on white.
- **Risk classes** (calm): Low leaf `#47AC8D`, Moderate amber `#F8B442`, Elevated `#E8833A`, High `#C8553D`. Rendered as tinted pill + dark ink + icon + label + 4-step bars — never colour alone, never red-alert banners. Danger red (`#B04A33`) is reserved for destructive actions only.
- **Neutrals** have a faint blue-green cast; page `#FAFBF8`, cards white.
- **Type:** Baloo Da 2 (rounded, echoes the wordmark) for display/headings/numbers; Hind Siliguri for body/UI in both scripts. Body 16px minimum; Bangla line-height 1.7 (headings 1.45), English 1.5. Headings bold 700, body 400, labels 600.
- **Shape:** soft and round — pill buttons/chips, 14px inputs, 20px cards, 28px dialogs and sheets. Signature **leaf corner** (22/22/22/6) on chat bubbles, suggestion cards and hero panels — echoes the logo's hills. No sharp corners.
- **Backgrounds:** mostly flat warm-white. The sky gradient (`--sj-gradient-sky`) for hero panels; the full journey gradient only for brand moments (splash, celebration). No textures, no grain, no full-bleed photos by default. No purple, no aggressive gradients.
- **Imagery:** friendly flat illustrations of Bangladeshi families (to be supplied — see Caveats); warm daylight palette drawn from the brand colours. No puzzle pieces, no medical stock photography, no sad/isolated children.
- **Cards:** white, 20px radius, 1px `rgba(0,60,120,.06)` hairline + soft navy-tinted shadow (`--shadow-sm`). Tinted tone variants (calm/teal, warm/amber, sky) have no shadow. No coloured left-border accents.
- **Shadows:** low and navy-tinted (`rgba(0,60,120,…)`) — xs/sm/md/lg + nav. No inner shadows. Focus = white gap + 2px blue ring.
- **Hover:** white surfaces → navy-50 tint; navy → deep navy; cards lift 1px with md shadow. **Press:** scale .97–.99. **Selected:** navy border + inset 1px navy ring + navy-50 fill + filled indicator/check.
- **Motion:** gentle ease-out (`cubic-bezier(.22,.8,.36,1)`), 120/200/320ms. Things rise 8px + fade in. Soft spring only for completion ticks. Loading = three breathing dots in blue/teal/sprout. All durations → 0 under `prefers-reduced-motion`.
- **Transparency/blur:** only the dialog overlay (`rgba(15,34,54,.42)`), no glassmorphism.
- **Layout:** mobile 390 with 20px gutters, sticky bottom CTA area with fade; bottom nav 72px. Desktop 1280 with 264px sidebar, 72px top bar, content max 1120, reading max 640. Tap targets ≥48px (chips 44).
- **Accessibility:** WCAG AA for all text pairs; never colour-only status; every interactive element has a Bangla/English accessible label; `lang` attribute on bilingual blocks.

## ICONOGRAPHY

- **Lucide** (https://lucide.dev), linked from CDN `https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js`. 2px rounded stroke matches the logo's soft rounded forms. *Substitution flag: no icon set was supplied; Lucide was chosen as the closest fit.*
- Use via the `Icon` component (`<Icon name="sprout"/>`). Sizes: 16–20 inline/UI, 22–24 nav and tiles, 32–44 empty states.
- Icons usually sit in a soft **tile** (48px, 14px radius, tinted bg + ink-colour glyph).
- Key mappings: parent `heart`, teacher `school`, specialist `stethoscope`; risk low `sprout`, moderate `eye`, elevated `compass`, high `hand-heart` (support, not alarm); errors `cloud-off`; AI `sparkles`; sources `notebook-pen` / `clipboard-list` / `file-text` / `book-open`.
- No emoji, no unicode-glyph icons, no puzzle pieces.
- Brand imagery: only the logo exists (`assets/logo/`). Illustrations are TBD.

## Logo usage
- `shohojatri-logo.png` stacked lockup (default) · `shohojatri-mark.png` symbol · `shohojatri-wordmark.png` Bangla wordmark (headers) · `-white` versions on navy. `shohojatri-logo-original.png` = untouched upload.
- Keep clear space ≥ the child's head diameter. Don't recolour the mark, don't place it on busy imagery.

---

## Index

- `styles.css` — entry point (imports only). `tokens/` colors, typography, spacing, radius, shadow, motion, fonts, base. `components/components.css` — component classes (`.sj-*`).
- `fonts/` — self-hosted Baloo Da 2 + Hind Siliguri (Bengali + Latin woff2, OFL, from Google Fonts).
- `assets/logo/` — logo cut-outs.
- `guidelines/` — foundation specimen cards (Brand, Colors, Type, Spacing).
- `components/` — React primitives (each `Name.jsx` + `.d.ts` + `.prompt.md`, one card per folder).
- `ui_kits/screening/` — mobile screening flow. `ui_kits/companion/` — desktop companion.
- `thumbnail.html`, `SKILL.md`.

### Components
- **core:** Icon
- **actions:** Button (primary / secondary / ghost / danger), IconButton
- **forms:** TextField (input + textarea)
- **choice:** ChoiceCard, ChoiceGroup (single/multi + "Other (write)"), Chip
- **navigation:** LanguageToggle, Stepper, Tabs, BottomNav, Sidebar
- **cards:** Card, Avatar, RoleBadge, ChildCard, LogEntryCard, ReminderCard, ActivityCard, SuggestionCard
- **data:** RiskBadge, ScoreGauge
- **chat:** ChatBubble, SourceChip
- **feedback:** Toast, StateView (empty/loading/error/offline/done), Skeleton
- **overlay:** Modal, Sheet

Consumers must load React 18, the Lucide UMD script, `styles.css` and `_ds_bundle.js`.

### Intentional additions (beyond the brief)
- **Icon** — wrapper for Lucide glyphs used by every component.
- **IconButton** — header/close/composer actions.
- **Card, Avatar** — shared base surface and person avatar used by the requested cards.
- **Skeleton** — in-place loading for lists (complements the requested loading state).

## Caveats
- No illustrations of Bangladeshi families were supplied — UI kits use the logo mark and icon tiles where illustrations should go.
- Fonts are Google Fonts choices (no brand font supplied); Baloo Da 2 was chosen to echo the rounded wordmark.
- Screening questions are illustrative placeholders, not a validated instrument (e.g. M-CHAT-R/F); thresholds `[3,8,13]/20` are examples.
