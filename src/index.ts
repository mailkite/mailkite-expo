// Docs: docs/architecture/client-side-oauth-libraries.md
//
// @mailkite/expo — the thin Expo / React Native adapter over @mailkite/client.
// It adds only the native surfaces (secure storage + system auth view) and
// re-exports the shared core so apps import everything from one package.

export { SecureStoreTokenStore } from "./secure-store.js";
export type { SecureStoreLike, SecureStoreTokenStoreOptions } from "./secure-store.js";
export { createExpoAuthOpener, makeRedirectUri } from "./auth-session.js";
export { createMailKiteClient } from "./create-client.js";
export type { CreateMailKiteClientOptions } from "./create-client.js";

// Re-export the shared core (MailKiteClient, MailKiteError, verifyWebhook,
// token stores, all types) so `@mailkite/expo` is the only import an app needs.
export * from "@mailkite/client";
export { default } from "@mailkite/client";
