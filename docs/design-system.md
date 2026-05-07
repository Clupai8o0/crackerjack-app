# Design System (code companion)

The visual rules — colors, typography, spacing, anti-patterns — live in [`/Design_System`](../Design_System). That file is the source of truth for what the app looks like.

This file is the source of truth for **how the design system is implemented in code**. Read both before building UI.

---

## File structure

```
lib/
└── theme.ts                     # tokens, single source of hex values

components/
├── ui/                          # primitives — design system in code
│   ├── Text.tsx
│   ├── Pill.tsx
│   ├── Button.tsx
│   ├── IconButton.tsx
│   ├── Avatar.tsx
│   ├── Input.tsx
│   ├── FormField.tsx
│   ├── Sheet.tsx
│   ├── ListRow.tsx
│   ├── PhotoCard.tsx
│   ├── Calendar.tsx
│   ├── Screen.tsx               # page wrapper
│   ├── StatusBar.tsx
│   ├── TabBar.tsx
│   ├── Glow.tsx                 # ambient accent gradient
│   └── index.ts                 # barrel export
└── patterns/                    # compositions — second-order, screen-specific
    ├── HeroHeader.tsx
    ├── SectionHeader.tsx
    ├── PriceTag.tsx
    ├── RatingChip.tsx
    ├── EmptyState.tsx
    └── KeyboardScreen.tsx

tailwind.config.js               # re-exports theme tokens as utility classes

app/dev/components.tsx           # stories route, every primitive × every variant
```

---

## Tokens (`lib/theme.ts`)

Direct port of [`Design_System`](../Design_System) §10. The only place hex values live in the codebase.

```ts
export const T = {
  // surfaces
  bg:        '#000000',
  surface:   '#0E0E10',
  raised:    '#16161A',
  line:      '#26262C',
  // ink
  ink:       '#F5F1EB',
  ink2:      '#C9C1D5',
  ink3:      '#7A7A82',
  inkDeep:   '#1A0F33',
  // accent
  accent:    '#39FF7A',
  accentInk: '#08210F',
  accentSoftFill:   'rgba(57,255,122,0.12)',
  accentSoftBorder: 'rgba(57,255,122,0.35)',
  // glow
  glow: 'radial-gradient(circle, rgba(57,255,122,0.26) 0%, rgba(57,255,122,0) 70%)',
  // type
  sans:  "'Inter', system-ui, sans-serif",
  mono:  "'JetBrains Mono', monospace",
  serif: "'Instrument Serif', serif",
  // radius
  rPill: 999, rTile: 18, rCard: 22, rHero: 28,
  // motion
  ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
} as const;
```

Tailwind config (`tailwind.config.js`) extends `theme.colors`, `theme.borderRadius`, and `theme.fontFamily` from these. NativeWind uses them automatically.

**Forbidden:** `#ffffff` anywhere outside `theme.ts`. A grep for `#[0-9a-fA-F]{6}` in any file other than `theme.ts` should return nothing.

---

## Fonts

Loaded once at app boot via `expo-font` in `app/_layout.tsx`:

- **Inter** (500, 600) — UI workhorse
- **Instrument Serif** (400, 400 italic) — display only
- **JetBrains Mono** (500) — numerals, timestamps, eyebrow labels

App must show a splash screen until all three are loaded. Don't render UI with system font fallbacks; the brand depends on the typography pairing.

---

## Component build order

Build in this order. Earlier items have no dependencies on later items.

### Wave 1 — Atoms
1. `Text` — every variant from Design_System §3
2. `Pill` — flavors `accent` / `cream` / `ghost` / `tinted` × sizes `lg` / `md` / `sm`
3. `Button` — single CTA variant only
4. `IconButton` — surface and photo contexts
5. `Avatar` — sizes `sm` / `md` / `lg`

### Wave 2 — Inputs
6. `Input` — text field, pill-shaped
7. `FormField` — label + Input + error message slot
8. `Sheet` — bottom sheet modal
9. `ListRow` — pill-shaped row with avatar + content + chevron

### Wave 3 — Layout chrome
10. `Screen` — page wrapper, applies bg + safe area + status bar + tab bar
11. `StatusBar` — custom rendered, 44pt
12. `TabBar` — floating pill, bottom 20

### Wave 4 — Heavy
13. `PhotoCard` — three sizes (`hero`, `tile`, `footer`), enforces scrim rules
14. `Calendar` — 7-col grid, default / out-of-month / selected / marked states
15. `Glow` — pure decoration, ambient accent radial

After Wave 4, all primitives exist. Subsequent screens compose; they don't invent.

---

## The `Text` primitive is non-negotiable

Every text node in every screen uses `<Text variant="...">`. Never:
- `<Text style={{ fontWeight: 'bold' }}>` — use a strong variant
- `<Text style={{ fontStyle: 'italic' }}>` — use a `display-italic-*` variant
- `<Text style={{ color: '#39FF7A' }}>` — use the variant's color or pass `color` prop with a token name

Forbidden props on `Text`: `bold`, `italic`, `underline`, raw `style.color`.

Variants (exhaustive — if you need something not on this list, add a variant before using it):

| Variant | Family · size · weight | Default color |
|---|---|---|
| `display-l` / `-m` / `-s` | Serif · 48 / 38 / 30 · 400 | `ink` |
| `display-italic-l` / `-m` / `-s` | Serif italic · same sizes | `accent` |
| `body` | Inter · 13.5 · 400 | `ink2` |
| `body-strong` | Inter · 13.5 · 600 | `ink` |
| `label` | Inter · 15 · 600 | (set by Button) |
| `pill` | Inter · 12.5 · 600 | (set by Pill flavor) |
| `caption` | Inter · 11 · 500 | `ink3` |
| `mono-eyebrow` | Mono · 9.5 · 500 · 0.14em uppercase | `ink3` |
| `mono-time` | Mono · 10.5 · 500 · 0.04em | `ink2` |
| `mono-unit` | Mono · 11 · 400 | `ink3` |
| `tile-name` | Inter · 13 · 600 · -0.01em | `ink` |
| `tile-category` | Inter · 9.5 · 600 · 0.02em | (overlay context) |

---

## Patterns (compositions)

`components/patterns/` holds compositions used on more than one screen. Build only after the **second** screen needs the composition. Never preemptively.

Likely patterns and what they compose:

| Pattern | Composes |
|---|---|
| `HeroHeader` | `PhotoCard` size hero + `IconButton` (back) + `IconButton` (share) |
| `SectionHeader` | `Text` display-italic + optional "See all" link |
| `PriceTag` | `Text` Serif amount + `Text` mono-unit |
| `RatingChip` | `Pill` accent + star glyph + numeric |
| `EmptyState` | `PhotoCard` placeholder + `Text` headline + `Text` body + `Button` |
| `KeyboardScreen` | `Screen` + `KeyboardAvoidingView` + `KeyboardAwareScrollView` |

---

## Screen rules

Every route file in `app/`:

1. Returns `<Screen>` as the root
2. Composes only primitives + patterns — no raw `react-native` `View`/`Text`/`Image`/`Pressable`
3. Has explicit loading, empty, and error states (use `EmptyState` pattern for empties)
4. Uses TanStack Query for data, not `useEffect` + `fetch`
5. Has every interactive element wired to `accessibilityLabel`

If a screen needs something a primitive doesn't do, the missing primitive belongs in `components/ui/`, not inline.

---

## Photography

The brand IS the photography. Per Design_System §6:

- Subject: artists working — DJ at decks, photographer mid-shot, fire dancer at night
- Light: warm, low-key; daylight only at golden hour
- Crop: tight on action, not faces
- Treatment: `saturate(1.05) contrast(1.05)` (apply via `expo-image`'s `filter` prop or a wrapping Skia layer when needed)

For development, source from Unsplash with explicit width:
```tsx
<Image source={{ uri: 'https://images.unsplash.com/photo-X?w=600&q=80' }} />
```

Width matches rendered slot — `200` for avatars, `400` for thumbs, `600` for tiles, `900` for hero. Never `?w=2000` for a 100px target.

Replace with photos of actual platform artists once supply onboarding starts.

---

## Anti-patterns (auto-reject)

These are forbidden. If you find yourself reaching for one, stop and re-read [`Design_System`](../Design_System) §9.

- Pure white anywhere
- Two accent colors
- A green CTA (CTA is `ink`)
- Bold serif headlines (use italic instead)
- `box-shadow` on UI surfaces (only the device frame casts a shadow)
- Border-radius `4` or `8` anywhere except SVG strokes
- `text-decoration: underline` on links (use color/weight shifts)
- Emoji as iconography
- Skeleton loader gradient shimmer (use crossfade)
- Toast or snackbar (confirmations happen in place — buttons change state)
- Decorative SVG curves, blobs, waves
- Color-coded status (red error, amber warn) — use copy + weight + accent presence
- Card with a left-border accent stripe
- Multiple icon libraries (Phosphor only)

---

## Stories route

`app/dev/components.tsx` — only mounted when `__DEV__ === true`. Renders every primitive × every variant in a scrollable list. This is the design system in code; if it's not on this route, it's not a supported variant.

The owner uses this route to visually verify the system. When you change a primitive, walk through this route on iOS sim before committing.

---

## When the visual system needs to change

If you genuinely believe Design_System needs to change (a screen requirement breaks a rule), surface it to the owner — don't quietly violate the rule. The Design_System file is opinionated for a reason; deviations compound.