// Docs: docs/architecture/client-side-oauth-libraries.md
//
// createMailKiteClient — the one call an Expo/RN app makes. It composes the
// shared @mailkite/client core with the two native adapters in this package:
// a SecureStore-backed TokenStore and an expo-web-browser auth opener. The app
// then uses the returned client exactly like the TS client (login / send / …);
// nothing about PKCE or the API surface is reimplemented here.

import { MailKiteClient, type MailKiteClientOptions } from "@mailkite/client";
import { SecureStoreTokenStore } from "./secure-store.js";
import { createExpoAuthOpener } from "./auth-session.js";

export interface CreateMailKiteClientOptions extends MailKiteClientOptions {
  /** Native redirect URI (custom scheme, e.g. `mailkite-app://redirect`, or the
   *  result of `makeRedirectUri()`). Required so login can catch the callback. */
  redirectUri: string;
}

/** Fill in the native defaults (SecureStore store + expo-web-browser opener),
 *  keeping any `store`/`openAuthUrl` the caller passed. Pure — exported so the
 *  factory wiring can be unit-tested without constructing the core. */
export function resolveClientOptions(options: CreateMailKiteClientOptions): MailKiteClientOptions {
  return {
    ...options,
    store: options.store ?? new SecureStoreTokenStore(),
    openAuthUrl: options.openAuthUrl ?? createExpoAuthOpener(options.redirectUri),
  };
}

/** Build a MailKiteClient wired with `expo-secure-store` storage and an
 *  `expo-web-browser` auth opener. Any `store`/`openAuthUrl` you pass wins. */
export function createMailKiteClient(options: CreateMailKiteClientOptions): MailKiteClient {
  return new MailKiteClient(resolveClientOptions(options));
}
