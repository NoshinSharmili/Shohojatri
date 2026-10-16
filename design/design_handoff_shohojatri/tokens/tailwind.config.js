/** Shohojatri Tailwind theme (Tailwind v3 config; for v4 see tailwind.v4.css).
 *  Every value points at a CSS variable from tokens.css — tokens.css is the source of truth.
 *  Import order: fonts.css → tokens.css → @tailwind base/components/utilities. */
const v = (name) => `var(--${name})`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}', './app/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '390px', md: '768px', lg: '1024px', xl: '1280px' },
    colors: {
      transparent: 'transparent', current: 'currentColor', white: '#FFFFFF',
      navy: { DEFAULT: v('sj-navy'), deep: v('sj-navy-deep'), 50: v('sj-navy-50'), 100: v('sj-navy-100') },
      blue: { DEFAULT: v('sj-blue'), ink: v('sj-blue-ink') },
      sky: { DEFAULT: v('sj-sky'), 50: v('sj-sky-50') },
      teal: { DEFAULT: v('sj-teal'), deep: v('sj-teal-deep'), ink: v('sj-ink-teal'), 50: v('sj-teal-50'), 100: v('sj-teal-100') },
      mint: v('sj-mint'),
      leaf: { DEFAULT: v('sj-leaf'), ink: v('sj-ink-leaf'), 50: v('sj-leaf-50') },
      sprout: { DEFAULT: v('sj-sprout'), 50: v('sj-sprout-50') },
      amber: { DEFAULT: v('sj-amber'), ink: v('sj-ink-amber'), 50: v('sj-amber-50'), 100: v('sj-amber-100') },
      n: { 0: v('sj-n-0'), 25: v('sj-n-25'), 50: v('sj-n-50'), 100: v('sj-n-100'), 200: v('sj-n-200'), 300: v('sj-n-300'), 400: v('sj-n-400'), 500: v('sj-n-500'), 600: v('sj-n-600'), 700: v('sj-n-700'), 800: v('sj-n-800'), 900: v('sj-n-900') },
      risk: {
        low: { DEFAULT: v('sj-risk-low'), ink: v('sj-risk-low-ink'), bg: v('sj-risk-low-bg') },
        moderate: { DEFAULT: v('sj-risk-moderate'), ink: v('sj-risk-moderate-ink'), bg: v('sj-risk-moderate-bg') },
        elevated: { DEFAULT: v('sj-risk-elevated'), ink: v('sj-risk-elevated-ink'), bg: v('sj-risk-elevated-bg') },
        high: { DEFAULT: v('sj-risk-high'), ink: v('sj-risk-high-ink'), bg: v('sj-risk-high-bg') },
      },
      success: { DEFAULT: v('sj-success'), bg: v('sj-success-bg') },
      info: { DEFAULT: v('sj-info'), bg: v('sj-info-bg') },
      warning: { DEFAULT: v('sj-warning'), bg: v('sj-warning-bg') },
      danger: { DEFAULT: v('sj-danger'), hover: v('sj-danger-hover'), bg: v('sj-danger-bg') },
      role: {
        parent: { DEFAULT: v('sj-role-parent'), bg: v('sj-role-parent-bg') },
        teacher: { DEFAULT: v('sj-role-teacher'), bg: v('sj-role-teacher-bg') },
        specialist: { DEFAULT: v('sj-role-specialist'), bg: v('sj-role-specialist-bg') },
      },
      /* semantic */
      text: { 1: v('text-1'), 2: v('text-2'), 3: v('text-3'), brand: v('text-brand'), link: v('text-link'), 'on-brand': v('text-on-brand') },
      surface: { page: v('surface-page'), card: v('surface-card'), sunken: v('surface-sunken'), muted: v('surface-muted'), brand: v('surface-brand'), 'brand-deep': v('surface-brand-deep'), calm: v('surface-calm'), sky: v('surface-sky'), warm: v('surface-warm'), overlay: v('surface-overlay') },
      border: { 1: v('border-1'), 2: v('border-2'), focus: v('border-focus'), selected: v('border-selected') },
      action: { primary: v('action-primary'), 'primary-hover': v('action-primary-hover'), 'ghost-hover': v('action-ghost-hover'), 'selected-bg': v('action-selected-bg') },
    },
    fontFamily: { display: v('font-display'), body: v('font-body'), mono: v('font-mono') },
    fontSize: {
      caption: v('fs-caption'), small: v('fs-small'), body: v('fs-body'), 'body-lg': v('fs-body-lg'),
      h3: v('fs-h3'), h2: v('fs-h2'), h1: v('fs-h1'), display: v('fs-display'),
      'h2-lg': v('fs-h2-lg'), 'h1-lg': v('fs-h1-lg'), 'display-lg': v('fs-display-lg'),
    },
    fontWeight: { regular: v('fw-regular'), medium: v('fw-medium'), semibold: v('fw-semibold'), bold: v('fw-bold'), extrabold: '800' },
    lineHeight: { bn: v('lh-bn'), 'bn-heading': v('lh-bn-heading'), en: v('lh-en'), 'en-heading': v('lh-en-heading') },
    letterSpacing: { heading: v('ls-heading'), caps: v('ls-caps'), normal: '0' },
    spacing: {
      0: v('sp-0'), px: '1px', 1: v('sp-1'), 2: v('sp-2'), 3: v('sp-3'), 4: v('sp-4'), 5: v('sp-5'), 6: v('sp-6'), 8: v('sp-8'), 10: v('sp-10'), 12: v('sp-12'), 16: v('sp-16'), 20: v('sp-20'),
      tap: v('tap-min'), gutter: v('gutter-mobile'), 'gutter-desk': v('gutter-desktop'), sidebar: v('sidebar-w'), bottomnav: v('bottomnav-h'),
    },
    borderRadius: {
      none: '0', xs: v('radius-xs'), sm: v('radius-sm'), md: v('radius-md'), lg: v('radius-lg'), xl: v('radius-xl'), pill: v('radius-pill'), full: v('radius-pill'),
      leaf: v('radius-leaf'), 'leaf-r': v('radius-leaf-r'), sheet: v('radius-sheet'),
    },
    boxShadow: { none: 'none', xs: v('shadow-xs'), sm: v('shadow-sm'), md: v('shadow-md'), lg: v('shadow-lg'), nav: v('shadow-nav'), focus: v('ring-focus'), selected: v('ring-selected') },
    transitionTimingFunction: { out: v('ease-out'), 'in-out': v('ease-in-out'), spring: v('ease-soft-spring') },
    transitionDuration: { fast: v('dur-fast'), base: v('dur-base'), slow: v('dur-slow'), gentle: v('dur-gentle') },
    extend: {
      maxWidth: { content: v('content-max'), reading: v('reading-max') },
      minHeight: { tap: v('tap-min'), chip: '44px' },
      minWidth: { tap: v('tap-min') },
      backgroundImage: { journey: v('sj-gradient-journey'), skyfade: v('sj-gradient-sky'), gauge: v('sj-gradient-gauge') },
      keyframes: {
        'sj-rise': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'sj-breathe': { '0%,100%': { opacity: '.55', transform: 'scale(.92)' }, '50%': { opacity: '1', transform: 'scale(1)' } },
        'sj-shimmer': { '0%': { backgroundPosition: '-200px 0' }, '100%': { backgroundPosition: '200px 0' } },
      },
      animation: { rise: 'sj-rise var(--dur-slow) var(--ease-out) both', breathe: 'sj-breathe 1.4s var(--ease-in-out) infinite', shimmer: 'sj-shimmer 1.4s linear infinite' },
    },
  },
  plugins: [
    /* Bangla needs taller line boxes. lang-aware leading without per-component logic. */
    function ({ addBase }) {
      addBase({
        ':lang(bn)': { lineHeight: 'var(--lh-bn)' },
        ':lang(en)': { lineHeight: 'var(--lh-en)' },
        ':lang(bn) :is(h1,h2,h3,h4)': { lineHeight: 'var(--lh-bn-heading)' },
        ':lang(en) :is(h1,h2,h3,h4)': { lineHeight: 'var(--lh-en-heading)' },
      });
    },
  ],
};
