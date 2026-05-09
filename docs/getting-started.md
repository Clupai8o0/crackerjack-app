# Getting Started

Setting up the dev environment from a fresh MacBook (Apple Silicon). Run sections in order. ~90 minutes if downloads cooperate.

> If you're Claude Code reading this on a hosted environment: you don't need most of this. Skip to §"Repo bootstrap".

---

## 1 · System prerequisites

### Xcode Command Line Tools
```bash
xcode-select --install
```

### Xcode (full)
Install from the Mac App Store. After install:
```bash
sudo xcodebuild -license accept
xcodebuild -downloadPlatform iOS
```

### Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Add to `~/.zshrc`:
```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify: `which brew` → `/opt/homebrew/bin/brew`. Anything else means leftover x86 Homebrew — uninstall first.

---

## 2 · Runtime managers

### mise
```bash
brew install mise
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
exec zsh
```

In the repo (later): `mise use node@20` writes `.mise.toml` and pins Node 20 LTS.

### pnpm via Corepack
```bash
corepack enable
```

Don't `npm i -g pnpm`. Corepack picks up the version from `package.json#packageManager`.

---

## 3 · Editor

VS Code or Cursor. Install these extensions:
- Biome (`biomejs.biome`)
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features (built-in)

Recommended `settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "quickfix.biome": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 4 · Mobile runtime

### iOS Simulator
Comes with Xcode. Open via `Xcode → Open Developer Tool → Simulator`. Pick iPhone 15 Pro.

### Watchman
```bash
brew install watchman
```

### Physical Android device (Phase 1–2)
Plug in any Android phone with USB debugging on (Settings → About → tap build number 7×, then Developer Options → USB debugging). Install Expo Go from Play Store.

### Android Studio (defer to Phase 2)
- Download from `developer.android.com` (Apple Silicon build)
- First launch → install SDK Platform 34, Build-Tools 34, Platform-Tools, Emulator
- JDK 17:
  ```bash
  brew install --cask zulu@17
  ```
- Add to `~/.zshrc`:
  ```bash
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
  ```
- Create AVD: Pixel 7, system image API 34, **arm64-v8a** (not x86 — emulation is unusable).

---

## 5 · Containers

### OrbStack
```bash
brew install --cask orbstack
```

Faster, lighter than Docker Desktop on Apple Silicon. Free for personal use.

If you must use Docker Desktop: `brew install --cask docker`. It works, just slower.

---

## 6 · Project CLIs

```bash
pnpm add -g eas-cli supabase
```

Don't install Expo CLI globally — `expo-cli` npm package is deprecated. Use `npx expo` from inside the repo.

---

## 7 · Service accounts

Create these and store creds in 1Password (or your password manager). Free unless noted.

| Service | Purpose | Cost | Create when |
|---|---|---|---|
| GitHub | Code host | Free | Now |
| Expo (expo.dev) | EAS Build, OTA, Push | Free tier | Now |
| Supabase | Backend | Free tier | Now |
| Razorpay | Payments | Free; KYC for live | Phase 4 start |
| Sentry | Crash tracking | Free tier | Phase 1 end |
| PostHog | Analytics | Free tier | Phase 1 end |
| Apple Developer Program | iOS distribution | $99/yr | Phase 6 |
| Google Play Console | Android distribution | $25 once | Phase 6 |

Apple/Google fees are the only out-of-pocket costs before launch.

---

## 8 · Repo bootstrap

```bash
# clone
git clone <repo-url> crackerjack-app
cd crackerjack-app

# pin tools
mise install              # reads .mise.toml
corepack enable           # picks up pnpm version

# install
pnpm install

# env
cp .env.example .env.local
# fill in:
#   EXPO_PUBLIC_SUPABASE_URL
#   EXPO_PUBLIC_SUPABASE_ANON_KEY
#   EXPO_PUBLIC_RAZORPAY_KEY (test mode initially)
#   SENTRY_DSN
#   POSTHOG_KEY

# local Supabase
supabase start
supabase db reset         # applies migrations + seed

# run
pnpm start                # boots Metro
# i = iOS Simulator
# a = Android emulator
# scan QR = Expo Go on device
```

---

## 9 · Apple Silicon gotchas

Things that will go wrong; how to fix:

- **`pod install` fails with arch errors**:
  ```bash
  brew install cocoapods
  ```
  (Don't `sudo gem install`.) Or one-off: `arch -arm64 pod install`.

- **`node-gyp` build fails on a native dep**:
  ```bash
  sudo xcode-select --reset
  xcode-select --install
  ```

- **Watchman complains about file limits**:
  ```bash
  sudo launchctl limit maxfiles 524288 524288
  ```
  Add to `~/.zshrc`.

- **iOS Simulator hangs / black screen**:
  ```bash
  xcrun simctl shutdown all && xcrun simctl erase all
  ```

- **Metro picks up the wrong Node**: confirm with `which node` — should resolve under `~/.local/share/mise/`.

- **EAS Build fails on iOS with "missing provisioning profile"**: `eas credentials` and let EAS manage them.

- **`pnpm ios` fails with `No code signing certificates are available to use`** (even targeting a simulator):

  This happens when `app.json` plugins include `expo-apple-authentication` (or anything that adds entitlements like `com.apple.developer.applesignin` or `com.apple.developer.associated-domains`). Expo CLI requires a signing identity for *simulator* builds when those entitlements are present — see `node_modules/@expo/cli/build/src/run/ios/codeSigning/simulatorCodeSigning.js`. The error message wrongly mentions "physical iOS devices".

  Three-step fix (one-time, free — no paid Apple Developer Program needed):

  1. **Add a Personal Team to Xcode.** Open Xcode → **Settings → Apple Accounts** → **+** → sign in with your Apple ID. Xcode auto-creates a free "Personal Team".

  2. **Generate an Apple Development cert.** Same panel → click your account → click your **Personal Team** row → **Manage Certificates...** → **+** → **Apple Development**. Wait a few seconds for it to appear.

  3. **Install the WWDR intermediate cert** (the cert from step 2 chains to it; without it, `security find-identity -v -p codesigning` reports 0 valid identities even though `security find-identity -p codesigning` shows the cert):
     ```bash
     curl -O https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
     security import AppleWWDRCAG3.cer -k ~/Library/Keychains/login.keychain-db
     ```

  Verify:
  ```bash
  security find-identity -v -p codesigning
  # → 1 valid identities found ("Apple Development: <email> (XXXXXXXXXX)")
  ```

  Then `pnpm ios` works. The team ID gets cached in `app.json` under `ios.appleTeamId` after the first build, so subsequent builds don't prompt.

- **`expo run:ios` appears to hang for minutes with no `xcodebuild` process running**: Expo is waiting for interactive input (e.g. team selection) and your shell pipeline is buffering its prompt. Don't pipe `expo run:ios` through `tail`/`head`/`grep` — let it write directly to the terminal, or use `--device <UDID>` and pre-set `ios.appleTeamId` in `app.json` to avoid the prompt entirely.

---

## 10 · Sanity check

```bash
node -v                 # v20.x
pnpm -v                 # 9.x or 10.x
npx expo --version
xcrun simctl list devices | head
adb devices             # if Android Studio installed
orb status              # or: docker ps
eas --version
supabase --version
```

If all return without errors, you're ready. Open `CLAUDE.md` and pick the next task from `docs/phases.md`.