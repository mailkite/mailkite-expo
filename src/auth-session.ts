// Docs: docs/architecture/client-side-oauth-libraries.md
//
// The native auth surface for @mailkite/client's `openAuthUrl` hook. The shared
// core builds the /oauth/authorize URL (PKCE + state) and hands it here; we open
// it in the system auth view via expo-web-browser and resolve to the redirect
// URL the browser came back with (`...?code=…&state=…`), which the core then
// verifies + exchanges. No PKCE, no token logic — purely "open + catch redirect".

/** Open `url` in the system auth view and resolve to the returned redirect URL.
 *  Matches @mailkite/client's `openAuthUrl: (url) => Promise<string>` contract.
 *
 *  `redirectUri` must be the SAME value registered with the OAuth client and
 *  passed to the client (e.g. `mailkite-<scheme>://redirect` or the result of
 *  {@link makeRedirectUri}); expo-web-browser uses it to know when to close. */
export function createExpoAuthOpener(redirectUri: string): (url: string) => Promise<string> {
  return async (url: string): Promise<string> => {
    // Lazily load the native module so importing this package (e.g. for the
    // factory or in tests) never requires expo-web-browser to be present.
    const WebBrowser = await import("expo-web-browser");
    const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
    if (result.type === "success" && result.url) return result.url;
    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("Login cancelled");
    }
    throw new Error(`Auth session did not complete (type: ${result.type})`);
  };
}

/** Thin pass-through to `AuthSession.makeRedirectUri()` for apps that prefer to
 *  let Expo derive the redirect URI from their app scheme. Lazily imported. */
export async function makeRedirectUri(
  options: { scheme?: string; path?: string } = { path: "redirect" },
): Promise<string> {
  const AuthSession = await import("expo-auth-session");
  return AuthSession.makeRedirectUri(options);
}
