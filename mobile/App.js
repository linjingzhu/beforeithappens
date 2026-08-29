import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SPLASH_MS } from "./src/copy.js";
import { NoticeScreen, SentScreen, SignupScreen, SplashScreenView, WorkspaceScreen } from "./src/screens.js";
import {
  ackHostNotice,
  consumeHostMagicLink,
  createHostApi,
  finishHostSplash,
  sendHostMagicLink,
  startHostFlow
} from "./src/session.js";
import { backToSignup, invitePartner, setEmail } from "./s0-s2-s3-flow.js";
import { colors } from "./src/theme.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [state, setState] = useState(startHostFlow);
  const api = createHostApi();

  useEffect(() => {
    let cancelled = false;
    let timer;
    (async () => {
      await SplashScreen.hideAsync().catch(() => {});
      if (cancelled) return;
      const params = typeof location !== "undefined" ? new URLSearchParams(location.search) : null;
      const token = params?.get("token") || "";
      const opened = startHostFlow();
      timer = setTimeout(async () => {
        if (cancelled) return;
        if (token) {
          setState(await consumeHostMagicLink(opened, token, api));
          return;
        }
        setState(await finishHostSplash(opened, api));
      }, SPLASH_MS);
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      {state.screen === "splash" ? <SplashScreenView /> : null}
      {state.screen === "signup" ? (
        <SignupScreen
          email={state.email}
          error={state.error}
          busy={state.busy}
          onSubmitEmail={async (email) => setState(await sendHostMagicLink(setEmail(state, email), api))}
        />
      ) : null}
      {state.screen === "sent" ? (
        <SentScreen email={state.sentEmail} onUseOtherEmail={() => setState(backToSignup(state))} />
      ) : null}
      {state.screen === "notice" ? (
        <NoticeScreen
          email={state.session?.user?.email || ""}
          error={state.error}
          busy={state.busy}
          onAcknowledgeNotice={async () => setState(await ackHostNotice(state, api))}
        />
      ) : null}
      {state.screen === "workspace" ? (
        <WorkspaceScreen
          email={state.session?.user?.email || ""}
          onInvitePartner={() => setState(invitePartner(state))}
        />
      ) : null}
    </>
  );
}
