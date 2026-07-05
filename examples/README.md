# MailKite examples — Expo (React Native)

Runnable, copy-pasteable screens. Each file's header comment lists what to set, the
Expo peer deps to install, and how to run it.

These are **client-side OAuth** examples: the end user signs into **their own**
MailKite account via the system browser (`mk.login()`), and tokens are kept in the
device secure enclave (`expo-secure-store`). No API key ships in the app.

| File | What it shows |
| --- | --- |
| [`01-login-and-send.tsx`](01-login-and-send.tsx) | **Sign in with MailKite** (system browser + secure token storage) → `mk.send(...)` over a verified domain |

Setup (per the [package README](../README.md)):

```sh
npx expo install expo-secure-store expo-web-browser expo-auth-session
npm install @mailkite/expo @mailkite/client
```

Add your app scheme to `app.json` so the OAuth redirect can return to the app:

```json
{ "expo": { "scheme": "mailkite-app" } }
```

Full docs: <https://mailkite.dev/docs> · Libraries: <https://mailkite.dev/docs/libraries>
