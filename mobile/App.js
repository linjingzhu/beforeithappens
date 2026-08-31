import { useEffect, useRef, useState } from "react";
import { Linking, Share } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SPLASH_MS } from "./src/copy.js";
import {
  AccountScreen,
  ComingSoonScreen,
  EmailBindScreen,
  InviteScreen,
  NoticeScreen,
  PackDetailScreen,
  PackListScreen,
  SentScreen,
  SignupScreen,
  SplashScreenView,
  TasteResultScreen,
  WorkspaceScreen
} from "./src/screens.js";
import {
  ackHostNotice,
  createHostApi,
  finishHostSplash,
  hostCookieAccess,
  logoutHost,
  sendHostEmailBind,
  sendHostMagicLink,
  splashOpenResult,
  startHostFlow
} from "./src/session.js";
import {
  backFromAccount,
  backFromComingSoon,
  backFromInvite,
  backFromPackDetail,
  backToPackList,
  backToSignup,
  connectPartnerCode,
  copyMyPairCode,
  finishSplash,
  loadInvitePairCode,
  openAccount,
  openComingSoonFromList,
  openMarriageFromList,
  openSendLink,
  openTasteResult,
  requestLinkStarted,
  setEmail,
  setPartnerCode,
  shareMeasurementInvite
} from "./s0-s2-s3-flow.js";
import { colors } from "./src/theme.js";
import { APP_S4_SCREEN, APP_SAME_SESSION_SCREEN } from "./s4-invite/flow.js";
import { createHostInviteApi, finishHostOpen, logoutAndContinueFromS4, logoutFromS4Home, openS4FromWorkspace, sendS4Invite, shareS4FromHost } from "./s4-invite/host-mount.js";
import { InviteWaitingScreen, SameSessionFailScreen } from "./s4-invite/screens.js";
import { PaywallBuyerScreen, PaywallPartnerScreen } from "./paywall/screens.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

function shareIo() {
  return {
    share: async (payload) => Share.share({ message: payload.url, url: payload.url }),
    clipboard: {
      writeText: async (text) => {
        await Share.share({ message: String(text || "") });
      }
    }
  };
}

export default function App() {
  const [state, setState] = useState(() => startHostFlow());
  const stateRef = useRef(state);
  stateRef.current = state;
  const api = createHostApi();
  const inviteApi = createHostInviteApi(hostCookieAccess());

  useEffect(() => {
    let cancelled = false;
    let timer;
    let sub;
    (async () => {
      await SplashScreen.hideAsync().catch(() => {});
      if (cancelled) return;
      const opened = startHostFlow();
      const initialUrl = await Linking.getInitialURL().catch(() => null);
      const loc = typeof location !== "undefined"
        ? location
        : (initialUrl ? { href: initialUrl, search: "", pathname: "" } : null);
      const openWork = finishHostOpen(opened, api, inviteApi, loc);
      timer = setTimeout(async () => {
        if (cancelled) return;
        try {
          const next = await openWork;
          if (cancelled) return;
          let resolved = next.screen ? splashOpenResult(opened, next) : await finishHostSplash(opened, api);
          if (resolved.screen === "invite" && !resolved.pairCode) {
            resolved = await loadInvitePairCode(resolved, api);
          }
          if (!cancelled) setState(resolved);
        } catch {
          if (!cancelled) setState(finishSplash(opened));
        }
      }, SPLASH_MS);
      sub = Linking.addEventListener("url", async ({ url }) => {
        const next = await finishHostOpen(stateRef.current, api, inviteApi, { href: url });
        if (!cancelled) setState(next);
      });
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub?.remove?.();
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
      {state.screen === "pack-list" ? (
        <PackListScreen
          onOpenMarriage={() => setState(openMarriageFromList(state))}
          onOpenComingSoon={(packId) => setState(openComingSoonFromList(state, packId))}
          onOpenAccount={() => setState(openAccount(state))}
        />
      ) : null}
      {state.screen === "coming-soon" ? (
        <ComingSoonScreen
          packId={state.comingSoonId}
          onTasteResult={() => setState(openTasteResult(state))}
          onBackToList={() => setState(backFromComingSoon(state))}
        />
      ) : null}
      {state.screen === "taste-result" ? (
        <TasteResultScreen onBackToList={() => setState(backToPackList(state))} />
      ) : null}
      {state.screen === "pack-detail" ? (
        <PackDetailScreen
          onBack={() => setState(backFromPackDetail(state))}
          onSendLink={async () => setState(await loadInvitePairCode(openSendLink(state), api))}
        />
      ) : null}
      {state.screen === "account" ? (
        <AccountScreen
          email={state.session?.user?.email || ""}
          busy={state.busy}
          onBack={() => setState(backFromAccount(state))}
          onLogout={async () => setState(await logoutHost(state, api))}
        />
      ) : null}
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
      {state.screen === "invite" ? (
        <InviteScreen
          pairCodeDisplay={state.pairCodeDisplay || state.pairCode}
          partnerCode={state.partnerCode || ""}
          copied={state.copied}
          codeCopied={state.codeCopied}
          error={state.error}
          busy={state.busy}
          onBack={() => setState(backFromInvite(state))}
          onChangePartnerCode={(value) => setState(setPartnerCode(state, value))}
          onCopyLink={async () => setState(await shareMeasurementInvite(state, "copy", shareIo()))}
          onShareInstagram={async () => setState(await shareMeasurementInvite(state, "instagram", shareIo()))}
          onShareKakao={async () => setState(await shareMeasurementInvite(state, "kakao", shareIo()))}
          onCopyCode={async () => setState(await copyMyPairCode(state, shareIo()))}
          onConnect={async () => setState(await connectPartnerCode(state, api))}
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
