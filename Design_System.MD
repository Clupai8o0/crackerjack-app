# Crackerjack Design System

A photo-led, dark-canvas system for an artist-booking marketplace. One canvas, one accent, one display face. Restraint is the brand.

---

## 1 · Principles

1. **Photography is the hero.** Every screen earns its visual weight from a real photograph of an artist or venue. Type and chrome support the image — never the inverse. If a screen has no image, it has no soul; ship a placeholder before shipping a generic empty state.
2. **One accent, used sparingly.** Neon green (`#39FF7A`) is the only chromatic accent. It marks identity and value — *italic display words, the price/rating/escrow chip, the active calendar day.* Nothing else. If everything is green, nothing is.
3. **Cream over white.** The light token is warm cream `#F5F1EB`, never pure white. Pure white is forbidden as a fill or text color.
4. **Italic carries emotion, roman carries fact.** Display type pairs an upright Instrument Serif word with an italic green counterpart (`Let's explore` / `new artists`). This pairing IS the brand voice. Use it on every screen at the headline level and never elsewhere.
5. **Pill-first geometry.** Buttons, chips, calendar selection, tab bar, list rows — all `border-radius: 999px`. Photo cards are the only rectangles, and they get a generous `18–28px` corner. There are no `4px` or `8px` corners anywhere.
6. **No drop shadows on UI.** Only the phone frame itself casts a shadow (it's a physical object). All depth in-app comes from photographs, scrims, and the faint green ambient glows behind content.
7. **Add nothing decorative.** No gradients on UI surfaces. No icon-fills as ornament. No emoji. No "AI slop": stat ribbons, sparkle dividers, faux badges, decorative SVG curves.

---

## 2 · Color

### Tokens (the entire palette)

| Token        | Hex        | Role                                                              |
|--------------|------------|-------------------------------------------------------------------|
| `bg`         | `#000000`  | App canvas — true black, no exceptions                            |
| `surface`    | `#0E0E10`  | Cards, photo placeholders, list rows                              |
| `raised`     | `#16161A`  | Elevated chrome — tab bar pill, modals                            |
| `line`       | `#26262C`  | Hairline borders, dividers, avatar rings                          |
| `ink`        | `#F5F1EB`  | Primary text, primary button fill, status-bar glyphs              |
| `ink2`       | `#C9C1D5`  | Secondary text, body copy                                         |
| `ink3`       | `#7A7A82`  | Tertiary text, captions, mono labels                              |
| `accent`     | `#39FF7A`  | **The** accent — see §2.2                                         |
| `accentInk`  | `#08210F`  | Text/icon color *on top of* `accent` fills                        |
| `inkDeep`    | `#1A0F33`  | Text/icon color *on top of* `ink` fills (cream buttons, pills)    |

That's 10 tokens. There is no eleventh. There is no warning amber, success teal, or info blue. Status is communicated through copy, type weight, and presence of the accent.

### 2.1 · Forbidden

- Pure white (`#FFFFFF`) — use `ink` (`#F5F1EB`).
- Any second hue (yellow, amber, red, blue, purple, teal). Removed deliberately. Do not reintroduce.
- Gradients on UI fills — buttons, chips, cards. Photographs and *scrims over photographs* are the only gradients permitted.
- Translucent green stacked on translucent green (the chip and the glow are different jobs; don't compound them on the same element).

### 2.2 · How to use the accent

The accent appears in exactly four contexts, in this order of priority:

1. **The italic word in a display headline** — `<Serif italic color={accent}>`. Always one word. Never the whole headline.
2. **A solid-fill pill carrying primary economic or trust signal** — From-price tag, rating chip, "Razorpay escrow" chip, "38 events" credibility chip. Background `accent`, foreground `accentInk`.
3. **An "active selection" mark** — the selected day in the calendar, the currently-playing track, the chosen filter when it represents the user's *answer* (not the default).
4. **A faint ambient glow** — a single radial gradient of `accent` at 22–28% opacity, blurred 40–50px, placed *behind* content as atmosphere. Maximum two glows per screen, never overlapping the photograph.

If a use case doesn't fit one of those four, it's not getting the accent. Demote it to `ink2` text, an `ink`-filled button, or a `line`-bordered chip.

### 2.3 · Pairings

- `accent` fill → `accentInk` text (the only legible combo on green).
- `ink` fill → `inkDeep` text (cream buttons, cream filter pills).
- Anything else → `ink` / `ink2` / `ink3` text on dark surfaces.

Contrast minimums (WCAG AA): body copy ≥ 4.5:1, large display ≥ 3:1. `ink3` (#7A7A82) on `bg` is the floor and is captions-only — never use it for tap targets or primary copy.

---

## 3 · Typography

Three families. No fourth.

| Family               | Role                                                          | Weights used  |
|----------------------|---------------------------------------------------------------|---------------|
| **Instrument Serif** | Display only — page titles, section headers, hero pricing     | 400 regular, 400 italic |
| **Inter**            | Everything else — UI, body, buttons, chips, captions          | 500, 600      |
| **JetBrains Mono**   | Numerals & timestamps where alignment matters; eyebrow labels | 500           |

### 3.1 · Display rules

- **The pairing IS the rule.** Every page-level headline is two display words minimum: one upright `ink`, one italic `accent`. Pattern:
  `Let's `*`explore`* `· Pick a `*`night`* `· Recent `*`nights`*
- Size scale: **48 / 42 / 38 / 30 / 24** px. No display text smaller than 24. No display text larger than 48.
- Line-height: `1.0` for stacked display blocks, `1.05` for single-line.
- Letter-spacing: `-0.01em` on italic; default on roman.
- Never bold the display. Never uppercase the display. Italic does the emphasis.

### 3.2 · UI scale (Inter)

| Use                    | Size  | Weight | Letter-spacing |
|------------------------|-------|--------|----------------|
| Body copy              | 13.5  | 400    | 0              |
| Button label           | 15    | 600    | -0.005em       |
| Pill / chip label      | 12.5  | 600    | -0.005em       |
| List-row primary       | 13.5  | 600    | -0.005em       |
| List-row secondary     | 11    | 500    | 0              |
| Welcome eyebrow        | 11.5  | 500    | -0.005em       |
| Avatar-name            | 14    | 600    | 0              |
| Tile name overlay      | 13    | 600    | -0.01em        |
| Tile category badge    | 9.5   | 600    | 0.02em         |
| Caption                | 11    | 500    | 0              |

### 3.3 · Mono rules

Mono is for *machine* values — times, schedule labels, eyebrow keys, dates. Always tabular figures (`font-feature-settings: "tnum" 1`).

| Use                       | Size  | Weight | Letter-spacing | Case      |
|---------------------------|-------|--------|----------------|-----------|
| Eyebrow label (e.g. YOUR BUDGET) | 9.5   | 500    | 0.14em         | UPPERCASE |
| Time-range pill           | 10.5  | 500    | 0.04em         | as-is     |
| Calendar weekday header   | 9.5   | 500    | 0.06em         | UPPERCASE |
| Inline unit (e.g. incl. GST)     | 11    | 400    | 0              | as-is     |

Currency amounts (`₹52,000`) sit in **Instrument Serif** at display size. The unit (`incl. GST`) sits next to it in mono. This is a fixed pattern.

### 3.4 · Forbidden

- Bold display.
- Italic body copy.
- Mono for body or button labels.
- Inter for headlines.
- All-caps Inter (use mono if you need caps).
- `text-decoration: underline` on links — links are color shifts and weight shifts only.

---

## 4 · Layout & spacing

### 4.1 · Phone canvas

`390 × 844` (iPhone 14 logical), border-radius `48px`, status-bar height `44px`. Content sits at safe-area `22px` horizontal by default. Top of content begins at `y = 44` (status bar bottom). Bottom safe zone is `120px` to clear the floating tab bar; raise to `130px` on screens with grid content.

### 4.2 · Spacing scale

`4 / 8 / 12 / 14 / 16 / 18 / 22 / 24 / 30` px.

That's it. If you need a number not in the scale, you don't. The two off-scale values (`6`, `10`) exist only inside chips for icon-to-label gaps; don't use them on layout.

Common slots:
- **Section gap:** `24` between an H2 and its first child; `30` between unrelated sections.
- **Inline gap (chips, icons in a row):** `8`.
- **Horizontal padding (page):** `22`. Tile-grid containers may use `16` to let the grid breathe to the edge.
- **Card inner padding:** `14–18`.

### 4.3 · Radius scale

`18` (small photo card · spec card) · `22` (medium photo card) · `28` (hero photo card) · `36` (icon button height) · `54` (primary CTA height) · `999` (everything pill-shaped).

There is no `4`, `8`, or `12` radius. If a thing isn't a photo card, it's a pill.

### 4.4 · The grid

- **Tile grid:** 2 columns, `gap: 10`, page padding `16`. Each tile is `aspect-ratio: 1 / 1.05` (slightly taller than square).
- **Calendar grid:** 7 columns, no column gap, `row-gap: 16`. Day cells are `34px` circles inside a `36px` row.
- **Profile sections:** single column, `padding: 0 22`.

---

## 5 · Components

### 5.1 · Buttons

**Primary CTA**
- Width: 100% of safe area
- Height: `54`
- Radius: `999`
- Fill: `ink`
- Text color: `inkDeep`
- Label: Inter 15 / 600, with the *verb* set in italic Instrument Serif 18 inline (e.g. *Request* booking now). The italic verb is required on primary CTAs — it carries the voice.

**Icon button**
- Size: `42 × 42` (or `36 × 36` in dense rows)
- Radius: `999`
- Fill on dark surface: `rgba(255,255,255,0.08)`
- Fill on photo (scrim): `rgba(255,255,255,0.15)` + `backdrop-filter: blur(8px)`
- Border: `1px solid rgba(255,255,255,0.18)`
- Glyph: `ink`, `1.6` stroke

**Forbidden:** secondary outlined buttons in `accent`. The accent never bears a verb. If a secondary action exists, it's a text link in `ink2` or an icon button.

### 5.2 · Pills & chips

The pill is the workhorse. Three flavors:

| Flavor       | Fill                          | Border                       | Text         | When                                  |
|--------------|-------------------------------|------------------------------|--------------|---------------------------------------|
| **Accent**   | `accent`                      | none                         | `accentInk`  | Price · rating · escrow · "X events"  |
| **Cream**    | `ink`                         | none                         | `inkDeep`    | Active filter · "now playing" tag     |
| **Ghost**    | `rgba(255,255,255,0.06)`      | `1px rgba(255,255,255,0.10)` | `ink2`       | Inactive filter · neutral metadata    |
| **Tinted**   | `rgba(57,255,122,0.12)`       | `1px rgba(57,255,122,0.35)`  | `accent`     | Soft accent — "4 yrs" tenure, status  |

Pill height: `36` for tap targets, `28` for inline metadata, `20` for overlay tags on photos. All pills get `padding: 0 14px` (or `0 11px` at 28-height, `3px 9px` at 20-height) and `white-space: nowrap`.

### 5.3 · Photo cards

Three sizes: hero (`380` tall), tile (`aspect 1/1.05`), footer (`170` min-height).

Every photo card has:
1. The photo, `object-fit: cover`, `filter: saturate(1.05) contrast(1.05)`.
2. A **scrim** — a vertical gradient sized to the legibility need:
   - Bottom-only label: `linear-gradient(180deg, rgba(15,10,28,0.35) 0%, rgba(15,10,28,0) 30%, rgba(15,10,28,0) 50%, rgba(15,10,28,0.85) 100%)`
   - Top + bottom (status bar present): same plus a `rgba(15,10,28,0.4) → 0%` at the top.
3. Text anchored to the dark zone. Title bottom-left in Serif. Optional accent pill top-left or bottom-right. Category tag (if any) is a Cream pill at `9.5px` placed above the title.

**Never:** a full-card colored overlay. Never tint the photo. Never apply a colored gradient. The scrim is always `rgba(15,10,28,...)` — a near-black violet that sits inside the brand's neutral lane.

### 5.4 · List rows

Pill-shaped row, full width, `surface` fill, `1px line` border. Layout: avatar (`38` circle, `1px line` border) · text block · trailing arrow. Padding `10px 14px 10px 10px`. Gap between row items `8`.

### 5.5 · Tab bar

A floating pill, not a bar. Centered horizontally, `bottom: 20px`. Fill: `raised`, border `1px line`, padding `6`. Items are `50 × 50` circles. Active item: `ink` fill, `inkDeep` glyph. Inactive: transparent, `ink` glyph. Maximum five items; we ship two.

### 5.6 · Calendar

7-col grid. Weekday header in mono 9.5 / 500 / `0.06em` / uppercase / `ink3`. Day cells `36` tall, day glyph in a `34` circle. States:
- **Default** — `ink`, no fill.
- **Out-of-month** — `ink3`, opacity 0.45.
- **Selected** — `accent` fill, `inkDeep` glyph, weight 600.
- **Marked** — `1.5px dashed rgba(245,241,235,0.45)` border ring, no fill.

Never combine selected and marked on the same day; selected wins.

### 5.7 · Status bar

Custom-rendered (390-wide), `44` tall, `padding: 14px 26px 6px`. Time at left, glyphs at right, dynamic-island gap in the middle. Glyph color: `ink` on dark, `inkDeep` on cream. Always present at the top of every screen — even hero-photo screens, where it sits *over* the scrim.

---

## 6 · Photography direction

The brand IS the photography. Rules:

- **Subject:** the artist working — DJ at the decks, photographer with camera raised, magician's hands mid-flourish, fire dancer at night, beach reception in golden-hour. Never staged portraits, never stock smiling-team-in-office.
- **Light:** warm, low-key, atmospheric. Tungsten, candle, sodium, neon. Daylight allowed only at golden hour.
- **Crop:** tight on the subject's *action*, not their face. The hands, the deck, the camera, the flame.
- **Treatment:** `saturate(1.05) contrast(1.05)`. No B&W. No duotone. No filters that read as "preset."
- **Sourcing:** real Unsplash URLs with `?w=…&q=80` query string. Width matches the rendered slot — `200` for avatars, `400` for thumbs, `600` for tiles, `900` for hero. Never use `?w=2000` for a 100px slot; bandwidth is part of the system.

---

## 7 · Motion & state

Motion is restrained and *physical*. No bouncing, no parallax, no marquee.

- **Tap feedback:** `transform: scale(0.97)` for `120ms ease-out`. Pills, buttons, list rows.
- **Sheet entry:** `translateY(100%) → 0`, `220ms cubic-bezier(0.32, 0.72, 0, 1)`.
- **Selection change** (calendar, filters): `150ms ease` on background-color and color. No size animation.
- **Photo loads:** crossfade `200ms` from `surface` placeholder. No skeleton shimmer.

Hover states do not exist (touch surface). Focus rings are `2px accent` outline at `2px` offset, only on physical-keyboard nav.

---

## 8 · Voice & copy

- **Sentence case** for everything. Title Case is forbidden.
- **Contractions** allowed and encouraged: "Let's", "you're", "don't".
- **The italic-pairing pattern** extends into copy: short upright phrase + one emphasized italic word. "Recent *nights*", "Pick a *night*", "Booking now".
- **Numbers are never spelled out** when they're data — `38 events`, `4 yrs`, `₹52,000`, `21:30`. Mono renders these wherever alignment matters.
- **No marketing adjectives.** Never "amazing", "incredible", "world-class", "premium", "curated". The photography earns those words; copy doesn't.
- **Currency:** `₹` glyph, no space, comma-grouped (Indian or Western — pick one per locale and stay consistent). Always include the unit qualifier in mono next to it (`incl. GST`, `from`, `per night`).
- **Dates:** `12 Apr · 6h` in Inter 11. Times in mono `21:30 — 02:30 IST`.

---

## 9 · Anti-patterns (do not ship)

- Two accent colors. The accent is one color.
- A green CTA. The CTA is `ink`.
- A bold serif headline. Use italic.
- A box-shadow on a card.
- A pure-white text fill.
- A 4px or 8px border-radius anywhere except SVG strokes.
- Inline-flow buttons separated by whitespace. Use `flex` + `gap`.
- An emoji acting as an icon.
- A "skeleton loader" gradient shimmer.
- A decorative SVG curve, blob, or wave behind content. The ambient *glow* is the only background visual; the photo is the foreground visual.
- A second display family. Instrument Serif is alone in its lane.
- A status indicator using color (red error, amber warn, blue info). Status is copy + weight + accent presence.
- "Card with a left-border accent stripe."
- A toast or snackbar. Confirmations happen *in place* — the button label changes, the chip flips state.

---

## 10 · Build tokens (drop-in)

```js
const T = {
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
};
```

---

## 11 · Review checklist

Before shipping any new screen, verify:

- [ ] Exactly one accent color is present, used in ≤ 4 places.
- [ ] At least one display headline uses the `roman + italic-accent` pairing.
- [ ] No pure white. No yellow. No second hue.
- [ ] Every card is either pill-shaped or one of `18 / 22 / 28` radius.
- [ ] No box-shadow on UI surfaces.
- [ ] Photographs (or labeled placeholders) are present and dominant.
- [ ] Mono is used for all times, dates, eyebrow keys, and inline units.
- [ ] Bottom 120px is clear of content (tab-bar safe zone).
- [ ] All pills have `white-space: nowrap`.
- [ ] No emoji used as functional iconography.
- [ ] Status communicated through copy + weight + accent — not through extra colors.
