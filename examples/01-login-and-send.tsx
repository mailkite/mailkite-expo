// Sign the end user into THEIR OWN MailKite account (system browser + secure token storage), then send an email. Run: drop into an Expo app with `"scheme": "mailkite-app"` in app.json; deps: npx expo install expo-secure-store expo-web-browser expo-auth-session && npm install @mailkite/expo @mailkite/client
import { useState } from "react";
import { Button, Text, View } from "react-native";
import { createMailKiteClient } from "@mailkite/expo";

// One client for the app. login() opens the system auth view so the user signs
// into their own MailKite account; the resulting OAuth tokens (which ARE the
// signed-in user) are persisted in the device secure enclave via expo-secure-store,
// so this survives app restarts. redirectUri must match the app scheme in app.json.
const mk = createMailKiteClient({ redirectUri: "mailkite-app://redirect" });

export default function LoginAndSend() {
  const [status, setStatus] = useState("Signed out");

  async function signInAndSend() {
    try {
      setStatus("Opening sign-in…");
      // Opens the system browser, catches the OAuth redirect, stores the tokens.
      await mk.login();

      setStatus("Sending…");
      const res = await mk.send({
        from: "you@yourdomain.com",   // a domain you've verified in MailKite
        to: "friend@example.com",
        subject: "Hello from Expo",
        text: "Sent with @mailkite/expo 🚀",
      });

      setStatus(`Sent ${res.id}`);
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Text>{status}</Text>
      <Button title="Sign in with MailKite & send" onPress={signInAndSend} />
      <Button title="Sign out" onPress={() => mk.logout().then(() => setStatus("Signed out"))} />
    </View>
  );
}
