import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SPLASH_MS } from "./src/copy.js";
import { EmailBindScreen, NoticeScreen, SentScreen, SignupScreen, SplashScreenView, WorkspaceScreen } from "./src/screens.js";
import {
  ackHostNotice,
  createHostApi,
  finishHostSplash,
  hostCookieAccess,
  sendHostEmailBind,
  sendHostMagicLink,
  splashOpenResult,
  startHostFlow
} from "./src/session.js";
import { backToSignup, finishSplash, requestLinkStarted, setEmail } from "./s0-s2-s3-flow.js";
import { colors } from "./src/theme.js";
import { APP_S4_SCREEN, APP_SAME_SESSION_SCREEN } from "./s4-invite/flow.js";
import { createHostInviteApi, finishHostOpen, logoutAndContinueFromS4, logoutFromS4Home, openS4FromWorkspace, sendS4Invite, shareS4FromHost } from "./s4-invite/host-mount.js";
import { InviteWaitingScreen, SameSessionFailScreen } from "./s4-invite/screens.js";
import { PaywallBuyerScreen, PaywallPartnerScreen } from "./paywall/screens.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [state, setState] = useState(startHostFlow);
  const api = createHostApi();
  const inviteApi = createHostInviteApi(hostCookieAccess());

  useEffect(() => {
    let cancelled = false;
    let timer;
    (async () => {
      await SplashScreen.hideAsync().catch(() => {});
      if (cancelled) return;
      const opened = startHostFlow();
      const openWork = finishHostOpen(opened, api, inviteApi, typeof location !== "undefined" ? location : null);
      timer = setTimeout(async () => {
        if (cancelled) return;
        try {
          const next = await openWork;
          if (cancelled) return;
          setState(next.screen ? splashOpenResult(opened, next) : await finishHostSplash(opened, api));
        } catch {
          if (!cancelled) setState(finishSplash(opened));
        }
      }, SPLASH_MS);
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const paywallPreview = typeof location !== "undefined"
    ? new URLSearchParams(location.search || "").get("paywall")
    : "";

  if (paywallPreview === "buyer" || paywallPreview === "partner") {
    return (
      <>
        <StatusBar style="dark" backgroundColor={colors.paper} />
        {paywallPreview === "partner" ? <PaywallPartnerScreen /> : <PaywallBuyerScreen />}
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      {state.screen === "splash" ? <SplashScreenView /> : null}
      {state.screen === "signup" ? (
        <SignupScreen
          email={state.email}
          error={state.error}
          busy={state.busy}
          onSubmitEmail={async (email) => {
            const started = requestLinkStarted(setEmail(state, email));
            setState(started);
            if (!started.busy) return;
            setState(await sendHostMagicLink(started, api));
          }}
        />
      ) : null}
      {state.screen === "bind" ? (
        <EmailBindScreen
          email={state.email}
          error={state.error}
          busy={state.busy}
          onSubmitEmail={async (email) => {
            const started = requestLinkStarted(setEmail(state, email));
            setState(started);
            if (!started.busy) return;
            setState(await sendHostEmailBind(started, api));
          }}
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
          onInvitePartner={() => setState(openS4FromWorkspace(state))}
        />
      ) : null}
      {state.screen === APP_S4_SCREEN ? (
        <InviteWaitingScreen
          email={state.session?.user?.email || ""}
          partnerEmail={state.partnerEmail || ""}
          invite={state.invite}
          copied={state.copied}
          error={state.error}
          onCopy={async () => setState(await shareS4FromHost(state, "copy"))}
          onShareInstagram={async () => setState(await shareS4FromHost(state, "instagram"))}
          onShareChat={async () => setState(await shareS4FromHost(state, "kakao"))}
          onSendOrResend={async (email) => setState(await sendS4Invite(state, email, inviteApi))}
          onLogout={async () => setState(await logoutFromS4Home(state, inviteApi))}
        />
      ) : null}
      {state.screen === APP_SAME_SESSION_SCREEN ? (
        <SameSessionFailScreen
          onLogoutAndContinue={async () => setState(await logoutAndContinueFromS4(state, inviteApi))}
        />
      ) : null}
    </>
  );
}
