# 🍵 CozyGuardian Design System & Philosophy

> **AI Prompt Directive for Claude Code:**  
> All UI components, pages, and layouts generated in this codebase MUST strictly adhere to the tokens, rules, and semantic guidelines defined in this document. Do not invent custom color hexes or default to generic Tailwind colors unless explicitly specified here. Your overarching goal is to create UIs that feel calm, safe, and de-escalating.

---

## 🧘 1. Core Ethos & Visual Philosophy

1. **De-Escalating & Reassuring:** Users turning to CozyGuardian may be anxious, overwhelmed, or facing a digital emergency. UI elements must feel warm, grounded, and encouraging—never alarmist, sterile, or clinical.
2. **Soft Geometry:** Hard edges feel corporate and hostile. Use generous border radii (`rounded-cozy` / `16px`) for cards, modals, and containers.
3. **No Pitch Black / Pure White:** Avoid stark `#000000` dark modes or blinding `#FFFFFF` fullscreen backgrounds. Prefer warm creams and deep charcoal/espresso surfaces to reduce eye fatigue.

---

## 🎨 2. Color Palette & Semantics

Use the custom `cozy` Tailwind color namespace defined in `tailwind.config.js`. Do not substitute these with default Tailwind grays or reds.

> **Naming scheme — two real patterns, don't mix them up:**
> - **Surface tokens** (`bg`, `card`, `sage`): both modes get an explicit suffixed class — `cozy-{name}-light` and `cozy-{name}-dark` — used as `bg-cozy-{name}-light dark:bg-cozy-{name}-dark`.
> - **Status tokens** (`safe`, `watch`, `risk`): the tinted background (`bg-cozy-status-{name}/10`) is mode-invariant — same translucent tint reads fine on both cream and charcoal, so it does **not** get a `-light`/`-dark` split. Only the solid text color swaps for contrast: `text-cozy-status-{name}` (light) / `dark:text-cozy-status-{name}-dark` (dark) — there is no `cozy-status-{name}-light` class.
>
> See the config sample in §3 and the blueprints in §4 — class names must match exactly, an AI generating e.g. `cozy-sage-dark` or `cozy-status-safe-light` would reference a class that doesn't exist.

| Token (light class / dark class) | Hex | Semantic Usage |
| :--- | :--- | :--- |
| **`cozy-bg-light`** | `#FBF9F5` *(Cream)* | Global app background |
| **`cozy-bg-dark`** | `#181B1E` *(Warm Charcoal)* | Global app background |
| **`cozy-card-light`** | `#FFFFFF` *(Off-White)* | Cards, Modals, Popovers, Sidebars |
| **`cozy-card-dark`** | `#22262B` *(Soft Dark)* | Cards, Modals, Popovers, Sidebars |
| **`cozy-sage-light`** | `#3B6255` | Primary actions, branding, selected states |
| **`cozy-sage-dark`** | `#7FA99B` | Primary actions, branding, selected states |
| **`cozy-status-safe`** / **`-dark`** | `#4E9F76` / `#7CCAA1` | Low risk, secure, completed tasks, green flags |
| **`cozy-status-watch`** / **`-dark`** | `#D98A39` / `#E6B066` | Needs attention, pending updates, warnings |
| **`cozy-status-risk`** / **`-dark`** | `#C85A54` / `#E58B86` | High priority, active threats, emergency steps |

> **Note on `cozy-card`:** the light-mode `#FFFFFF` is an intentional, scoped exception to the "no pure white" rule in §1 — it applies to small elevated surfaces (cards/modals/popovers) sitting on the `cozy-bg` cream, not to fullscreen backgrounds. Never use `#FFFFFF` as a `<main>`/page-level background.

---

## 📐 3. Layout, Depth & Warm Typography

Even with a great color palette, layout and typography decisions make or break the feeling of calm. 

### Embrace Generous Whitespace
Clutter is the enemy of calm. Do not pack data densely.
* **Card Padding:** Give elements plenty of padding (`p-6` or `p-8` inside cards).
* **Component Gaps:** Use generous gaps (`gap-6` or `gap-8`) in flex/grid layouts to give content space to breathe.
* **Section Margins:** Keep generous vertical margins (`space-y-8` or `my-10`) between distinct content blocks.

### Use Soft, Diffused Shadows
Avoid harsh, dark drop shadows. Stick to subtle, warm-tinted shadows and ambient borders.
* **Light Mode Borders:** `border-stone-200/50` or `border-stone-300/40`
* **Dark Mode Borders:** `border-white/5` or `border-white/10`
* **Shadows:** Use `shadow-sm` or custom soft ambient shadows (`shadow-[0_4px_20px_rgba(0,0,0,0.03)]`).

### Pair with Warm Typography
A cold, geometric font (like default Inter or Roboto) will pull the design back into "tech dashboard" territory. Fonts with rounded terminals or warm humanist proportions lock in the comfy feeling.
* **Primary Sans (UI & Body):** `Plus Jakarta Sans`, `DM Sans`, or `Nunito`
* **Display / Accent (Headings):** `Fraunces` or `Plus Jakarta Sans` (Bold)
* **Monospace (Code / Guides):** `Victor Mono` or `JetBrains Mono`

```javascript
/* Expected Tailwind Config Target */
theme: {
  fontFamily: {
    sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
    display: ['Fraunces', 'serif'],
    mono: ['"Victor Mono"', '"JetBrains Mono"', 'monospace'],
  },
  extend: {
    colors: {
      'cozy-bg-light': '#FBF9F5',
      'cozy-bg-dark': '#181B1E',
      'cozy-card-light': '#FFFFFF',
      'cozy-card-dark': '#22262B',
      'cozy-sage-light': '#3B6255',
      'cozy-sage-dark': '#7FA99B',
      'cozy-status-safe': '#4E9F76',
      'cozy-status-safe-dark': '#7CCAA1',
      'cozy-status-watch': '#D98A39',
      'cozy-status-watch-dark': '#E6B066',
      'cozy-status-risk': '#C85A54',
      'cozy-status-risk-dark': '#E58B86',
    },
    borderRadius: {
      cozy: '16px',
    },
  },
}
```

---

## 🧩 4. Component Blueprints
When generating UI components, follow these standard class patterns:

### Main Page Wrapper
```tsx
<main className="min-h-screen bg-cozy-bg-light dark:bg-cozy-bg-dark text-slate-800 dark:text-slate-100 p-6 sm:p-8 transition-colors duration-200 font-sans">
  {/* Content */}
</main>
```

### Standard Content Card

```tsx
<div className="bg-cozy-card-light dark:bg-cozy-card-dark rounded-cozy p-6 sm:p-8 border border-stone-200/50 dark:border-white/5 shadow-sm">
  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 font-display">Card Title</h3>
  <p className="text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">Warm, human-friendly content goes here.</p>
</div>
```

### Primary Button (Sage Accent)

```tsx
<button className="bg-cozy-sage-light hover:bg-cozy-sage-light/90 hover:scale-[1.01] dark:bg-cozy-sage-dark dark:hover:bg-cozy-sage-dark/90 text-white dark:text-slate-950 font-medium px-5 py-3 rounded-xl transition-all duration-150 ease-out shadow-sm active:scale-[0.98]">
  Take Action
</button>
```

### Status Badges (De-escalating Alerts)
Never use aggressive full-red background banners. Use muted, tinted badges instead. Icons are [Lucide](https://lucide.dev) (already a project dependency) at `w-4 h-4`, 2px stroke — never the raw `● ▲ ■` text glyphs, which read as terminal/status-code output (see §5 Iconography):

```tsx
import { Check, Bell, Shield } from "lucide-react";

// Safe State
<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-cozy-status-safe/10 text-cozy-status-safe dark:text-cozy-status-safe-dark">
  <Check className="w-4 h-4" strokeWidth={2} /> Account Protected
</span>

// Watch State
<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-cozy-status-watch/10 text-cozy-status-watch dark:text-cozy-status-watch-dark">
  <Bell className="w-4 h-4" strokeWidth={2} /> Review Recommended
</span>

// Risk State (Calm Alert)
<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-cozy-status-risk/10 text-cozy-status-risk dark:text-cozy-status-risk-dark">
  <Shield className="w-4 h-4" strokeWidth={2} /> Immediate Action Needed
</span>
```

*(Whitespace, shadow, and typography rules for these blueprints are the same as §3 — not repeated here.)*

---

## 🌿 5. Motion & Signature Motifs

Calm colors and soft corners make CozyGuardian *safe*. They don't yet make it *memorable* — the same sage/cream/serif formula appears across most wellness apps. This section is what turns "generic calm" into "recognizably ours."

### Signature Motif: the Steeping Line
A single hand-feel motif ties the app together — a thin, organic curved line (like rising steam or a plant tendril), stroke width 2px, drawn in `cozy-sage-light` / `dark:cozy-sage-dark` at low opacity (`opacity-20` to `opacity-30`). Use it sparingly as a decorative accent:
* Behind the Dashboard header, as a large low-opacity SVG path.
* As the loading/scanning indicator (see below) instead of a generic spinner.
* Never as a repeating pattern or wallpaper — one motif per screen, max.

Canonical shape — a single reusable component, not a redrawn-per-screen path:

```tsx
// frontend/components/SteepingLine.tsx
export function SteepingLine({ animate = false, className = "" }: { animate?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 40" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 2c-4 5 4 7 0 12s4 7 0 12s4 7 0 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="20 80"
        className={`text-cozy-sage-light dark:text-cozy-sage-dark opacity-20 ${
          animate ? "motion-safe:animate-cozy-steep" : ""
        }`}
      />
    </svg>
  );
}
```

Requires the `cozy-steep` keyframe/animation from the Tailwind config in the Motion Language section below. Note the dash pattern (`20 80`, summing to `pathLength`) with an offset shift of exactly `-100` per loop — that's what makes the wrap seamless; a dasharray equal to the full path length would snap visibly on every repeat.

### Motion Language
Every state transition should feel like *settling*, not snapping. Default easing: `ease-out`, duration `200–350ms`. Avoid linear easing and anything under `150ms` — it reads as mechanical, not cozy. No `motion` / `framer-motion` dependency exists in this project yet — these are CSS-only, via Tailwind's `keyframes`/`animation` extension:

```javascript
/* tailwind.config.js — add alongside the colors/borderRadius extension in §3 */
extend: {
  keyframes: {
    'cozy-stagger-in': {
      '0%': { opacity: '0', transform: 'translateY(4px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'cozy-safe-pulse': {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.03)' },
    },
    'cozy-steep': {
      '0%': { strokeDashoffset: '0' },
      '100%': { strokeDashoffset: '-100' },
    },
  },
  animation: {
    'cozy-stagger-in': 'cozy-stagger-in 300ms ease-out both',
    'cozy-safe-pulse': 'cozy-safe-pulse 400ms ease-out 1',
    'cozy-steep': 'cozy-steep 2.5s ease-in-out infinite',
  },
},
```

* **Page/section load:** apply `motion-safe:animate-cozy-stagger-in`, stagger siblings by setting inline `style={{ animationDelay: `${i * 60}ms` }}` in the list/map — Tailwind alone can't express per-child delay. One well-orchestrated staggered reveal per view — not per element.
* **Scan in progress:** render `<SteepingLine animate />` (see above) instead of a generic spinner. Reinforces "something calm is happening," not "the system is working hard."
* **Risk resolved → Safe:** when a status badge transitions to `cozy-status-safe`, add `motion-safe:animate-cozy-safe-pulse` for one animation cycle (remove the class after `animationend`) plus the existing `transition-colors` crossfade. This is the app's one "reward" moment — reserve the pulse for genuine resolutions, never for neutral state changes, or it loses meaning.
* **Buttons/inputs:** keep existing `active:scale-[0.98]`; add `hover:scale-[1.01]` on primary buttons only, `150ms ease-out` (already in the §4 button blueprint).
* **Never:** shake, bounce, or flash animations on `cozy-status-risk` states — that reintroduces alarm. A risk state may fade in with the standard load stagger like everything else; it should never move differently than a safe state.
* **Respect reduced motion:** prefix every animation utility above with Tailwind's built-in `motion-safe:` (as shown), so `prefers-reduced-motion: reduce` users get the end-state instantly with no animation — no custom media query needed. An anxious or vestibular-sensitive user is exactly who this app serves; motion that can't be turned off is itself a small alarm.

### Iconography
Replace the raw `● ▲ ■` glyphs in status badges with [Lucide](https://lucide.dev) icons (already a project dependency — `lucide-react`) at 2px stroke weight: `Check` for Safe, `Bell` for Watch, `Shield` for Risk — see the badge blueprint in §4. Geometric bullet glyphs read as terminal/status-code output, which cuts against the "never clinical" ethos in §1. If Lucide's default stroke ever feels too sharp against the soft-geometry rule in §1, round the joins with a wrapping style override rather than commissioning fully custom icons — stay within the existing dependency.

---

## 🚫 6. Hard Constraints (What NOT to do)
NO Hard Reds or Harsh Alarms: Do not use Tailwind's bg-red-600 or text-red-500. Always use the cozy-status-risk tokens to maintain a calm tone even during emergencies.

NO Sharp Corners: Avoid rounded-none or rounded-sm on visible layout containers like cards, modals, or large buttons.

NO Hard Black Backgrounds: Do not use bg-black or bg-slate-950 for primary layout surfaces. Stick to bg-cozy-bg-dark (#181B1E).

NO Dense Form Fields: Inputs should be roomy (py-3 px-4) with soft focus rings using `ring-cozy-sage-light dark:ring-cozy-sage-dark`.

