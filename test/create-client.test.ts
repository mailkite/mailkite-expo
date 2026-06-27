// Docs: docs/architecture/client-side-oauth-libraries.md
//
// The auth-session adapter needs a real device, so instead we assert the factory
// WIRING via the pure `resolveClientOptions` helper: it must supply a
// SecureStore-backed store and an openAuthUrl opener by default, and honor any
// the caller passes. (The actual MailKiteClient construction / OAuth lives in
// @mailkite/client and is tested there.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveClientOptions } from "../src/create-client.ts";
import { SecureStoreTokenStore } from "../src/secure-store.ts";

test("default options: SecureStore store + openAuthUrl opener are wired", () => {
  const opts = resolveClientOptions({ redirectUri: "mailkite-app://redirect" });
  assert.ok(opts.store instanceof SecureStoreTokenStore, "default store is SecureStoreTokenStore");
  assert.equal(typeof opts.openAuthUrl, "function", "default openAuthUrl opener is wired");
  assert.equal(opts.redirectUri, "mailkite-app://redirect");
});

test("caller-supplied store and openAuthUrl win over the defaults", () => {
  const myStore = { load() {}, save() {}, clear() {} } as any;
  const myOpener = async () => "https://app/callback?code=x&state=y";
  const opts = resolveClientOptions({
    redirectUri: "mailkite-app://redirect",
    store: myStore,
    openAuthUrl: myOpener,
  });
  assert.equal(opts.store, myStore);
  assert.equal(opts.openAuthUrl, myOpener);
});
