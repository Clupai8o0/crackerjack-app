---
name: mobile-design-mastery
description: >
  Comprehensive mobile UI/UX design intelligence for Crackerjack — a React Native / Expo / NativeWind app.
  Combines: UX heuristics (Nielsen/Krug), Hook Model habit engineering, iOS HIG for native feel,
  Emil Kowalski animation philosophy adapted for Reanimated, taste-skill design parameters,
  impeccable design laws, and design sprint facilitation. Use for any UI work, screen design,
  component animation, feature engagement review, or design audit. Trigger on: "design", "animate",
  "feels off", "engagement", "habit", "audit", "polish", "layout", "sprint", "heuristic", "UX review".
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
---

# Mobile Design Mastery — Crackerjack

> You are a senior design engineer and UX strategist building a two-sided marketplace for performing artists in India. Every screen must feel native, fast, and trustworthy. Design is a competitive advantage.

---

## Design Parameters

These three values drive all output decisions. Override per-task if specified.

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `DESIGN_VARIANCE` | **7** | Distinctive, asymmetric — not perfectly centered layouts |
| `MOTION_INTENSITY` | **5** | Fluid Reanimated transitions, spring physics, no gratuitous animation |
| `VISUAL_DENSITY` | **5** | Balanced — rich with artist info but never cramped |

---

## Part 1: Core Mobile Laws (Non-Negotiable)

### Touch & Layout
- Minimum tap target: **44×44pt** always. Use `minWidth: 44, minHeight: 44` on Pressable.
- Safe areas: wrap all screens in `<SafeAreaView>` or use `useSafeAreaInsets()`. Never put controls under the notch, Dynamic Island, or home indicator.
- Spacing rhythm: **4/8dp grid** only. NativeWind: `p-2`, `p-4`, `p-6`, `gap-2`, `gap-4`.
- Bottom sheet / tab bar content inset: always account for `bottom` safe area inset.
- Use `min-h-[100dvh]` equivalent — account for keyboard raising the bottom on Android.

### Typography (Adapted iOS HIG for React Native)
- Scale: Large Title 34pt Bold → Title 28pt → Subheadline 17pt → Body 16pt → Caption 12pt.
- NativeWind classes: `text-3xl font-bold` → `text-2xl` → `text-base` → `text-sm`.
- Line height minimum 1.3× font size. NativeWind: `leading-snug` for headers, `leading-relaxed` for body.
- Optimal line length: **35–50 chars** on mobile. Constrain wide text.
- Contrast minimum 4.5:1 (WCAG AA). Test both light and dark modes.
- Ban Inter. Prefer the project's font (check `lib/theme.ts` for the configured font family).

### Color
- **Forbidden:** pure `#000000`, pure `#FFFFFF`, gradients, drop shadows. (Design System §9)
- Use only tokens from `lib/theme.ts`. No hex values in components.
- Semantic intent: destructive = `rose-500`, success = `emerald-500`, interactive tint = project accent.
- One accent color, saturation under 80%. No "AI purple" (#6366f1 as a default).
- Always verify contrast in both themes independently.

### Icons
- **Phosphor icons only.** Zero emoji as iconography. (Design System + taste-skill mandate)
- Use filled variant for selected/active state, regular for inactive.
- Tab bar: filled when selected. Nav bar actions: regular weight.

### Navigation (iOS HIG + React Native)
- **Tab bar** for primary destinations. 2–5 tabs maximum. Never hamburger menus.
- Tab bar always visible; remembers state per tab.
- **Stack navigation** for drill-down (list → detail → edit).
- **Modal** (bottom sheet or full-screen) for focused tasks only: compose, filters, settings sub-screens.
- Back button text = previous screen title, not "Back".
- Never trap users — every modal has a clear close/dismiss path.
- Search: pull-down from list header, not a permanent top bar.

### Forbidden Patterns (Anti-Slop)
- Hamburger menus
- Gradients and drop shadows
- Emoji as UI elements
- Pure black / pure white backgrounds
- Generic placeholder data ("John Doe", "Acme Artist")
- Cards on high-density dashboards (use borders + negative space instead)
- Website-like layouts (full-width hero images, centered marketing text)
- Oversaturated "startup blue" as the default
- `console.log` in committed code

---

## Part 2: UX Heuristics (Nielsen + Krug)

### Krug's Three Laws — Apply to Every Screen

**1. Don't Make Me Think**
Every screen must be self-evident. If a user has to pause to understand a label, the label is wrong. Clever names lose to clear names always.
- Self-evident CTAs: "Book Now" not "Proceed to Engagement"; "Message" not "Initiate Conversation".
- Error messages: state the problem + the fix. Never blame the user.

**2. Click Count Doesn't Matter — Confidence Does**
Each tap must be painless, obvious, and confidence-building. Users abandon when confused, not when they've tapped many times.
- Progress indicators in booking flow: "Step 2 of 3: Payment".
- Clear breadcrumbs in deep navigation.

**3. Get Rid of Half the Words**
Happy-talk wastes space. Remove "Welcome to Crackerjack!", cut polite filler, use action-oriented empty states.
- Before: "We've received your booking request and will process it shortly."
- After: "Request sent. DJ Arjun will respond within 24 hours."

### The Trunk Test — Apply to Every New Screen
Drop a user at random on this screen. Can they immediately answer:
1. What app is this?
2. What page am I on?
3. What are the major sections?
4. What can I do here?
5. Where am I in the hierarchy?

If any answer is unclear, redesign the screen header and navigation.

### Nielsen's 10 Heuristics — Quick Audit Checklist

| # | Heuristic | Mobile Application |
|---|-----------|-------------------|
| 1 | Visibility of system status | Loading skeletons, booking progress, payment confirmation |
| 2 | Match real world | "Book" not "Reserve an Engagement", "₹" not "INR amount" |
| 3 | User control + freedom | Cancel booking without penalty, undo actions where possible |
| 4 | Consistency + standards | Same words mean same things everywhere in the app |
| 5 | Error prevention | Date picker over text input, confirm before irreversible actions |
| 6 | Recognition over recall | Show artist availability in calendar, don't make user remember dates |
| 7 | Flexibility + efficiency | Saved searches, quick-rebook past artists, keyboard shortcuts |
| 8 | Aesthetic + minimalist | Every element earns its place. One primary CTA per screen. |
| 9 | Help recover from errors | "Payment failed — retry or change method" with specific reason |
| 10 | Help + documentation | Contextual tooltips for first-time organizers, not a help center |

### Severity Rating
Rate every UX issue found:
- **4 — Catastrophic**: Prevents task completion → fix immediately
- **3 — Major**: Causes significant failure → fix before shipping
- **2 — Minor**: Causes frustration/delay → schedule fix
- **1 — Cosmetic**: Minor annoyance → fix if time allows
- **0 — Not a problem**: Disagreement, not a usability issue

---

## Part 3: Hook Model (Habit Engineering)

> Apply when designing features that need regular engagement: feed, notifications, reviews, rebooking.

```
Trigger → Action → Variable Reward → Investment
    ↑                                      │
    └──────────────────────────────────────┘
```

### Phase 1: Trigger
**Goal**: move users from external triggers (push notifications) to internal triggers (emotion-driven habitual opens).

- **External triggers** (early): push notification when artist responds, booking reminder D-3 and D-1, payment received alert.
- **Internal trigger mapping** for Crackerjack:
  - Organizer: anxiety about finding the right artist → app resolves uncertainty.
  - Artist: FOMO about missed bookings / income → app resolves financial anxiety.
  - Both: social proof of activity ("12 DJs are available this weekend in Goa").

**Push notification copy pattern:**
- Not: "You have a new message."
- Yes: "Arjun just replied to your booking request — see if the dates work."

### Phase 2: Action
**Goal**: make the core action completable in under 60 seconds.

- **Organizer core action**: search → profile view → send booking request. Remove every friction point.
- **Artist core action**: view booking request → accept/counter → done.
- Apply Fogg Behavior Model: Motivation × Ability × Trigger must converge simultaneously.
- Every extra field, confirmation dialog, or loading screen is a drop-off point.
- Progressive disclosure: ask for payment details at checkout, not during signup.

### Phase 3: Variable Reward
**Goal**: each session should surface something new and slightly surprising.

- **Tribe rewards**: social validation — "3 organizers viewed your profile today", reviews appearing.
- **Hunt rewards**: variable search results — artist feed changes with new availability, new acts in Goa.
- **Self rewards**: profile strength score improving, booking count milestone.
- Avoid predictable reward cadences. Variable = engaging; predictable = boring.

### Phase 4: Investment
**Goal**: every completed action increases switching cost and loads the next trigger.

- Artist: fills profile (data) → better search ranking → more bookings → trigger.
- Organizer: saves artist to favorites (data) → gets notified on new availability → trigger.
- Reviews: compound; more reviews = more trust = better investment in reputation.
- Don't trap users: make profile export possible; make switching out the right choice only because the product delivers real value.

### Manipulation Matrix (Ethics Check)
Before shipping any engagement mechanic, ask:

| | **I'd use this product** | **I wouldn't** |
|--|--------------------------|----------------|
| **Genuinely helps users** | Facilitator ✓ | Peddler — rethink |
| **Doesn't help users** | Entertainer — be careful | Dealer ✗ |

Only ship Facilitator mechanics.

---

## Part 4: Animation (Emil Kowalski × React Native Reanimated)

### Should This Animate?

| Frequency | Decision |
|-----------|----------|
| 100+ times/day (search results, tab switching) | No animation. Ever. |
| Tens of times/day (scroll to load, list items) | None or subtle fade only |
| Occasional (modals, drawers, bottom sheets) | Standard spring animation |
| Rare / first-time (onboarding, booking success) | Full delight animation |

**Never animate keyboard-triggered actions.** Search input, filter toggles — no animation.

### Easing Decision Tree (Reanimated)

```
Is element entering or exiting the screen?
  → YES: ease-out (starts fast, feels responsive)
    withTiming(1, { easing: Easing.out(Easing.cubic) })
  → NO:
    Moving across screen? → ease-in-out
    Hover/press feedback? → ease (standard)
    Constant motion (skeleton)? → linear
    Default → ease-out

Spring physics (preferred for gestures + modal):
  withSpring(value, { stiffness: 100, damping: 20 })
  Bounce: keep subtle (0.1–0.3 equivalent)
```

**Never use `easeIn` for UI.** Starts slow = feels sluggish at the exact moment users look.

### Duration Guide (React Native)

| Element | Duration |
|---------|----------|
| Button press feedback | 100–160ms |
| Tab switch | 200ms |
| Bottom sheet open | 280–350ms (spring) |
| Full-screen modal | 350–450ms (spring) |
| Booking success celebration | 600–800ms (with spring bounce) |
| Skeleton shimmer | 1000ms linear (looping) |

### Entry Animation Rule
**Never animate from `scale: 0`.** Start from `scale: 0.95` combined with `opacity: 0`.
```js
// Correct entry
withSpring(1, { stiffness: 120, damping: 18 }) // scale
withTiming(1, { duration: 200 }) // opacity
```

### React Native Performance Rules
Only animate `transform` and `opacity`. Never animate `width`, `height`, `padding`, `margin`, `backgroundColor` (causes layout passes).

```js
// CORRECT — GPU composited
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }, { translateY: translateY.value }],
  opacity: opacity.value,
}));

// WRONG — triggers layout
const animatedStyle = useAnimatedStyle(() => ({
  height: height.value, // layout pass on every frame
}));
```

### Spring Configuration Standards
```js
// Modal / bottom sheet open
{ stiffness: 100, damping: 18, mass: 0.8 }

// Button press feedback
{ stiffness: 400, damping: 30 } // fast, snappy

// Drag gesture dismiss
{ stiffness: 80, damping: 20 } // momentum-respecting
```

### Gesture Interactions
- Momentum-based dismissal: measure velocity, not just distance. Quick flick = dismiss even if short distance.
- Damping at boundaries: dragging past natural boundary applies friction — never hard stops.
- Use `runOnJS` sparingly. Keep callbacks on the UI thread when possible.
- Multi-touch protection: ignore additional touch points once drag starts.

### Haptics (Expo Haptics)
```js
// Physical impact (button press, confirm)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

// Success (booking confirmed, payment received)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

// Warning (approaching limit, action requires confirmation)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)

// Selection change (picker, toggle)
Haptics.selectionAsync()
```

Never use haptics on scroll, never repeat haptics on continuous drag, never for decorative purposes.

### Reduced Motion
```js
import { useReducedMotion } from 'react-native-reanimated';

const shouldReduce = useReducedMotion();
const animationDuration = shouldReduce ? 0 : 300;
const scaleTarget = shouldReduce ? 1 : 0.95;
```

### Stagger for Lists
```js
// Items entering a list — cascade in, don't all appear at once
.item:nth-child(n) { delay: n * 40ms } // max 4 items, then cut
```
Keep delays 30–60ms between items. Stagger is decorative — never block interaction.

### Asymmetric Enter/Exit
- Enter: **slower** (user watches it come in)
- Exit: **faster** (user already made the decision)
```js
// Modal
open: withSpring(0, { stiffness: 90, damping: 18 }) // slower
close: withTiming(height, { duration: 220, easing: Easing.out(Easing.cubic) }) // snappy
```

---

## Part 5: Impeccable Design Laws

### The Setup Gate
Before touching any UI component:
1. Read the project's `Design_System.MD` — understand color, type, spacing, component rules.
2. Check `docs/design-system.md` — code companion for implementation.
3. Know the register: **Crackerjack is a product register** (app UI serving tasks, not a brand/marketing surface). Earned familiarity is the bar — fluent users of Zomato, Swiggy, BookMyShow should find it intuitive.

### Design Laws
- **Color**: Tinted neutrals only. No `#000` or `#fff`. Pick a strategy (restrained, committed, drenched) before selecting colors.
- **Spacing**: Vary spacing intentionally for rhythm. Don't uniform-pad everything.
- **Copy**: Every word earns its place. No filler text. No marketing speak in UI copy.
- **Layout**: Vary layouts across sections. Don't center everything. (`DESIGN_VARIANCE: 7`)
- **Motion**: Animate only opacity + transform. Motion must be meaningful, not decorative.
- **Hierarchy**: One primary CTA per screen. Never five competing buttons.
- **AI Slop Test**: Reject first-order reflexes ("marketplace = teal gradient") and second-order traps ("Indian app = orange and yellow").

### Crackerjack-Specific Design North Star
Crackerjack targets Goa → India. The aesthetic should feel:
- **Trustworthy** (this handles real money via escrow)
- **Aspirational** (artists take pride in their profiles)
- **Warm but not gaudy** (India market, but not kitsch)
- **Fast** (tier-2 device performance matters)

Reference: BookMyShow for density patterns, Airbnb for trust signals, Linear for interaction quality.

---

## Part 6: iOS HIG Key Rules (Adapted for Expo/RN)

### Navigation Architecture
```
TabNavigator (2–5 tabs, always visible)
├── HomeStack      → discovery, search
├── BookingsStack  → active / past bookings
├── MessagesStack  → chat
├── ProfileStack   → artist profile / organizer dashboard
└── (optional) ExploreStack
```

- Bottom tab bar: `height: 49 + safe area bottom`
- Active tab: filled icon + label colored with accent
- Inactive tab: regular icon + muted label

### Modals vs. Stacks
- **Stack (push)**: artist profile view, booking detail, portfolio expand
- **Modal (present)**: new booking form, payment screen, review submission, settings

### Large Titles
- Screen headers use large title style at top, collapse to compact on scroll.
- In RN: `largeTitle` in native stack header config, or implement scroll-based `Animated.Value` for custom headers.

### Forms & Input
```
Label (above input, always visible)
├── TextInput (with correct keyboardType)
├── Helper text (optional, below input)
└── Error message (below input, red, specific fix)
```
- `keyboardType="email-address"` for email fields.
- `autoComplete` for password, email, phone.
- Numeric inputs for amounts: `keyboardType="numeric"`.

---

## Part 7: Design Sprint (Rapid Feature Ideation)

Use this when: facing a new major feature, team disagreement about UX direction, or before starting any Phase in `docs/phases.md`.

### The 5-Day Framework (Compressed)
1. **Monday — Map**: Define the problem. Who is the user? What is the critical moment? Where can things fail?
2. **Tuesday — Sketch**: Individual solution sketches. No group brainstorming. Vote on best concepts.
3. **Wednesday — Decide**: Critique sketches, storyboard the winning approach. One direction.
4. **Thursday — Prototype**: Build a clickable, realistic-looking mock. Not production code.
5. **Friday — Test**: Show to 5 real artists or organizers. Watch for confusion. Patterns emerge from 3+ people.

### When to Run a Sprint
- High-stakes feature (escrow payment flow, booking dispute resolution)
- Multiple possible UX approaches with no clear winner
- Risky assumptions about user behavior

### When to Skip
- Problem and solution are already validated
- Feature is small and low-risk
- Decision-maker can't commit a full week

---

## Part 8: Design Audit Commands

When called to audit a screen or component, work through these gates in order:

### `/design audit <screen>`
1. **Trunk Test** — Can I tell what this screen is immediately?
2. **Touch targets** — All interactive elements ≥ 44×44pt?
3. **Safe areas** — No content hidden behind hardware?
4. **Contrast** — WCAG AA 4.5:1 in both light and dark?
5. **Typography** — Semantic scale? Readable at small sizes?
6. **Navigation** — Consistent with app patterns? Exit always visible?
7. **States** — Loading, empty, error, and populated all implemented?
8. **Hook review** — What trigger, action, reward, investment does this screen serve?
9. **Animation** — Meaningful? Not on high-frequency actions? Only transform + opacity?
10. **Anti-patterns** — Any forbidden patterns? (Emojis, pure white/black, gradients, hamburger)

Output a severity-rated punch list.

### `/design polish <component>`
1. Check spacing rhythm (4/8dp grid).
2. Check font weights and sizes against scale.
3. Check color token usage — no hardcoded hex.
4. Check icon consistency — Phosphor, correct weight/fill.
5. Check copy — half the words, action-oriented.
6. Check animations — correct easing, duration, enter/exit asymmetry.

### `/design hook <feature>`
1. What is the intended internal trigger?
2. What external triggers are in place?
3. Is the core action completable in < 60 seconds?
4. Is there variability in the reward?
5. Does the investment load the next trigger?
6. Manipulation Matrix: Facilitator, Peddler, Entertainer, or Dealer?

### `/design sprint <problem>`
Facilitate a compressed Design Sprint session: map the problem, sketch solution spaces, storyboard the winner, identify the prototype scope, and list Friday test questions.

---

## Part 9: Mobile Image Generation Direction

When generating visual references or wireframe mockups for Crackerjack:

- **Platform**: React Native cross-platform, premium mode.
- **Multi-screen consistency**: lock palette, typography, spacing, icon style first. Keep every subsequent screen aligned.
- **First screen discipline**: calm, premium, immediately readable. Clear visual hierarchy. Not overloaded.
- **Device mockups**: clean phone frames with subtle borders.
- **Color discipline**: one controlled palette per screen set. No muddy combinations.
- **Iconography**: Phosphor-style outline icons. Custom-feeling, not generic.
- **Imagery**: photography with clean fades/masks when artist photos are shown.

**Anti-generic direction**: resist "purple-blue fintech gradients", excessive glassmorphism, fake chart dashboards, and generic "DJ1, DJ2, DJ3" data.

---

## Part 10: Pre-Ship Checklist

Before marking any UI task done, verify:

- [ ] All touch targets ≥ 44×44pt
- [ ] Safe areas respected on iPhone SE and Pro Max
- [ ] Contrast 4.5:1 in both light and dark modes
- [ ] No hardcoded hex colors — only theme tokens
- [ ] No emoji as icons — Phosphor only
- [ ] No gradients, drop shadows, pure white/black
- [ ] Loading, empty, error, and populated states all built
- [ ] Animations only on transform + opacity
- [ ] No animation on keyboard-triggered actions
- [ ] `prefers-reduced-motion` respected
- [ ] Tab bar navigation (not hamburger)
- [ ] Every screen passes the Trunk Test
- [ ] Copy passes the "half the words" rule
- [ ] No forbidden anti-patterns
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Tested in iOS simulator, walked all states

---

*Sources: ui-ux-pro-max (nextlevelbuilder), ux-heuristics + hooked-ux + design-sprint + ios-hig-design (wondelai/skills), impeccable (pbakaus), emil-design-eng (emilkowalski/skill), taste-skill + imagegen-frontend-mobile (Leonxlnx/taste-skill). Adapted for Expo + NativeWind + Reanimated + Phosphor.*
