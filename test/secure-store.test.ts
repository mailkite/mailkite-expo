// Docs: docs/architecture/client-side-oauth-libraries.md
//
// Unit tests for SecureStoreTokenStore against an in-memory SecureStore mock.
// Run: npm test  (node --import tsx --test). The native expo-secure-store module
// is NOT needed — we inject a SecureStoreLike backend. The OAuth/PKCE/transport
// logic lives in @mailkite/client and is tested there.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SecureStoreTokenStore, type SecureStoreLike } from "../src/secure-store.ts";

/** In-memory stand-in for expo-secure-store. */
function memoryStore(): SecureStoreLike & { dump: () => Record<string, string> } {
  const m = new Map<string, string>();
  return {
    async getItemAsync(key) {
      return m.has(key) ? (m.get(key) as string) : null;
    },
    async setItemAsync(key, value) {
      m.set(key, value);
    },
    async deleteItemAsync(key) {
      m.delete(key);
    },
    dump: () => Object.fromEntries(m),
  };
}

const sampleTokens = {
  accessToken: "at_123",
  refreshToken: "rt_456",
  expiresAt: 1_900_000_000_000,
  tokenType: "Bearer",
};

test("load() returns null when nothing is stored", async () => {
  const store = new SecureStoreTokenStore({ backend: memoryStore() });
  assert.equal(await store.load(), null);
});

test("save() then load() round-trips the TokenSet via JSON", async () => {
  const backend = memoryStore();
  const store = new SecureStoreTokenStore({ backend });
  await store.save(sampleTokens);
  // Stored as a JSON string under the default key.
  assert.equal(backend.dump()["mailkite.tokens"], JSON.stringify(sampleTokens));
  assert.deepEqual(await store.load(), sampleTokens);
});

test("clear() removes the stored TokenSet", async () => {
  const store = new SecureStoreTokenStore({ backend: memoryStore() });
  await store.save(sampleTokens);
  await store.clear();
  assert.equal(await store.load(), null);
});

test("custom key is honored", async () => {
  const backend = memoryStore();
  const store = new SecureStoreTokenStore({ key: "my.key", backend });
  await store.save(sampleTokens);
  assert.ok(backend.dump()["my.key"]);
  assert.equal(backend.dump()["mailkite.tokens"], undefined);
});

test("load() tolerates corrupt JSON (returns null, no throw)", async () => {
  const backend = memoryStore();
  await backend.setItemAsync("mailkite.tokens", "{not json");
  const store = new SecureStoreTokenStore({ backend });
  assert.equal(await store.load(), null);
});
