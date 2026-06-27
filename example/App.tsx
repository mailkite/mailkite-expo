// Docs: docs/architecture/client-side-oauth-libraries.md
//
// Minimal Expo screen: sign the user into their own MailKite account, then send.
// Requires `"scheme": "mailkite-app"` in app.json (see README). Install the peer
// deps: npx expo install expo-secure-store expo-web-browser expo-auth-session
import { useState } from "react";
import { Button, Text, View } from "react-native";
import { createMailKiteClient } from "@mailkite/expo";

// One client for the app. The token (which IS the signed-in user) is persisted
// in the device secure enclave, so this survives restarts.
const mk = createMailKiteClient({ redirectUri: "mailkite-app://redirect" });

export default function App() {
  const [status, setStatus] = useState("Signed out");

  async function signInAndSend() {
    try {
      setStatus("Opening sign-in…");
      await mk.login(); // opens the system auth view, catches the redirect, stores tokens
      setStatus("Sending…");
      const res = await mk.send({
        from: "you@yourdomain.com",
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
      <Button title="Sign in & send" onPress={signInAndSend} />
      <Button title="Sign out" onPress={() => mk.logout().then(() => setStatus("Signed out"))} />
    </View>
  );
}
