# Crackerjack

A two-sided mobile marketplace for performing artists and event organizers in India. Direct booking, direct payment, no agents.

**Status**: Pre-MVP. Building from scratch with Claude Code.

---

## Quick start

```bash
# clone
git clone <repo-url> crackerjack-app
cd crackerjack-app

# tooling
mise install            # Node 20 LTS
corepack enable         # pnpm
pnpm install

# env
cp .env.example .env.local
# fill: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY,
#       EXPO_PUBLIC_RAZORPAY_KEY, SENTRY_DSN, POSTHOG_KEY

# local Supabase
supabase start
supabase db reset

# run
pnpm start              # press i for iOS sim, a for Android, or scan QR
```

First-time tooling setup (Mac, Apple Silicon): see [`docs/getting-started.md`](./docs/getting-started.md) — covers Xcode, Homebrew, mise, Watchman, OrbStack, Android Studio, and the recurring Apple Silicon gotchas.

---

## Documentation

| File | Read for |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | How to work in this repo (Claude Code reads this every session) |
| [`CHANGELOG.md`](./CHANGELOG.md) | What's been shipped and when |
| [`docs/architecture.md`](./docs/architecture.md) | System design, flows, security |
| [`docs/data-model.md`](./docs/data-model.md) | Database schema, RLS, indexes |
| [`docs/design-system.md`](./docs/design-system.md) | Code patterns for the visual system |
| [`docs/phases.md`](./docs/phases.md) | What we're building and when |
| [`docs/conventions.md`](./docs/conventions.md) | Code standards, git, naming |
| [`docs/decisions.md`](./docs/decisions.md) | Why we chose what we chose |

The visual design system lives separately at [`Design_System`](./Design_System) — that's the source of truth for tokens, components, and visual rules. `docs/design-system.md` is the code-level companion.

---

## Stack

Expo (React Native) + TypeScript · Supabase (Postgres, Auth, Storage, Edge Functions) · Razorpay · NativeWind · Zustand · TanStack Query · Sentry · PostHog.

Full rationale in [`docs/architecture.md`](./docs/architecture.md).

---

## Contact

Founders: ashish@crackerjack.info · nikhilgupta@crackerjack.info
Domain: [crackerjack.live](https://crackerjack.live)

---

## License

Proprietary. © Crackerjack 2025–present.