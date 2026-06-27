// Docs: docs/architecture/client-side-oauth-libraries.md
//
// SecureStoreTokenStore — the native end of @mailkite/client's TokenStore
// contract. The OAuth TokenSet (short-lived access token + rotating refresh
// token) is JSON-serialized into the OS secure enclave via expo-secure-store
// (Keychain on iOS, Keystore-backed on Android). No PKCE/transport logic here:
// the shared core in @mailkite/client owns all of that; this just persists.

import type { TokenSet, TokenStore } from "@mailkite/client";

/** The slice of `expo-secure-store` we use. Injectable so the store can be
 *  unit-tested with an in-memory backend (and so the native module is loaded
 *  lazily, never at import time). */
export interface SecureStoreLike {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export interface SecureStoreTokenStoreOptions {
  /** SecureStore key the TokenSet is stored under. */
  key?: string;
  /** Override the backend (defaults to lazily-imported `expo-secure-store`). */
  backend?: SecureStoreLike;
}

const DEFAULT_KEY = "mailkite.tokens";

/** A TokenStore backed by `expo-secure-store`. */
export class SecureStoreTokenStore implements TokenStore {
  private readonly key: string;
  private backend?: SecureStoreLike;

  constructor(opts: SecureStoreTokenStoreOptions = {}) {
    this.key = opts.key ?? DEFAULT_KEY;
    this.backend = opts.backend;
  }

  /** Resolve the SecureStore backend, importing the native module on first use. */
  private async store(): Promise<SecureStoreLike> {
    if (!this.backend) this.backend = (await import("expo-secure-store")) as SecureStoreLike;
    return this.backend;
  }

  async load(): Promise<TokenSet | null> {
    const raw = await (await this.store()).getItemAsync(this.key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as TokenSet;
    } catch {
      return null;
    }
  }

  async save(tokens: TokenSet): Promise<void> {
    await (await this.store()).setItemAsync(this.key, JSON.stringify(tokens));
  }

  async clear(): Promise<void> {
    await (await this.store()).deleteItemAsync(this.key);
  }
}
