# @mailkite/expo

The **Expo / React Native** MailKite SDK. It's a thin adapter: it composes the
isomorphic [`@mailkite/client`](https://github.com/mailkite/mailkite-js) core and only adds the two native surfaces
RN needs — **secure token storage** (`expo-secure-store`) and a **system auth view**
(`expo-web-browser` / `expo-auth-session`). All the OAuth 2.1 + PKCE logic and the
full API method surface come from the shared core; nothing is reimplemented here.

Your user **signs into their own MailKite account** (Google / email) and the library
holds a short-lived token that **is** that user — same flow as a dashboard login.

> **Read-only mirror.** This repo is a generated, release-time mirror of the MailKite
> monorepo (the private source of truth); the source isn't developed here. Install
> `@mailkite/expo` from npm rather than cloning. Full docs: <https://mailkite.dev/docs/libraries>.

## Install

```sh
npx expo install expo-secure-store expo-web-browser expo-auth-session
npm install @mailkite/expo @mailkite/client
```

> `@mailkite/client` is a sibling package. Until it's published to npm it resolves
> to the local `../ts` workspace (`"@mailkite/client": "file:../ts"` in this
> package's `package.json`). The four `expo-*` / `react` / `react-native` packages
> are **peer dependencies** your app already provides.

## App scheme / redirect setup

Add a custom scheme to your `app.json` so the OAuth redirect can deep-link back in:

```json
{
  "expo": {
    "scheme": "mailkite-app"
  }
}
```

Then derive the redirect URI from it (or hard-code `mailkite-app://redirect`):

```ts
import { makeRedirectUri } from "@mailkite/expo";
const redirectUri = await makeRedirectUri({ scheme: "mailkite-app", path: "redirect" });
// → "mailkite-app://redirect"
```

The OAuth server accepts any exactly-registered redirect URI (and dynamic client
registration runs on first login), so no extra backend config is required.

## Three-line usage

```ts
import { createMailKiteClient } from "@mailkite/expo";

const mk = createMailKiteClient({ redirectUri: "mailkite-app://redirect" });
await mk.login();                                    // opens the system auth view
await mk.send({ from: "you@yourdomain.com", to: "x@example.com", subject: "Hi", text: "Hello" });
```

`mk` is a full `MailKiteClient`: `mk.listDomains()`, `mk.listMessages()`,
`mk.uploadAttachment(...)`, `mk.logout()`, automatic token refresh, and
`MailKiteError.retryAfter` on `429` — all from the shared core.

The token is persisted in the OS secure enclave (Keychain / Keystore) via
`SecureStoreTokenStore`, so a login survives app restarts.

## What's in the box

- `createMailKiteClient({ redirectUri })` — the factory that wires everything.
- `SecureStoreTokenStore` — `@mailkite/client`'s `TokenStore` backed by `expo-secure-store`.
- `createExpoAuthOpener(redirectUri)` — the `openAuthUrl` adapter (use it directly
  for a custom `new MailKiteClient({ ... })`).
- `makeRedirectUri(options)` — convenience pass-through to `expo-auth-session`.
- Everything re-exported from `@mailkite/client` (`MailKiteClient`, `MailKiteError`,
  `verifyWebhook`, token stores, all types).

## Develop

```sh
npm install            # resolves @mailkite/client from ../ts (build it first if needed)
npm run typecheck
npm test               # SecureStoreTokenStore + factory wiring (no device needed)
npm run build
```
