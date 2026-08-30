import { useEffect, useRef, useState } from "react";
import { Linking, Share } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SPLASH_MS } from "./src/copy.js";
import {
  CoverScreen,
  EmailBindScreen,
  InviteScreen,
  NoticeScreen,
  PackListScreen,
  PreviewQ1Screen,
  SentScreen,
  SignupScreen,
  SplashScreenView,
  WorkspaceScreen
} from "./src/screens.js";
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
import {
  backToSignup,
  connectPartnerCode,
  copyMyPairCode,
  finishSplash,
  keepPreviewAnswer,
  loadInvitePairCode,
  openMarriageFromList,
  openPreviewQ1,
  requestLinkStarted,
  savePreviewAndOpenInvite,
  selectPreviewChoice,
  setEmail,
  setPartnerCode,
  shareMeasurementInvite
} from "./s0-s2-s3-flow.js";
import { createPersistingPreviewStorage, defaultPreviewStorage, hydratePreviewStorage, previewQ1Question } from "./preview-q1.js";
import { colors } from "./src/theme.js";
import { APP_S4_SCREEN, APP_SAME_SESSION_SCREEN } from "./s4-invite/flow.js";
import { createHostInviteApi, finishHostOpen, logoutAndContinueFromS4, logoutFromS4Home, openS4FromWorkspace, sendS4Invite, shareS4FromHost } from "./s4-invite/host-mount.js";
import { InviteWaitingScreen, SameSessionFailScreen } from "./s4-invite/screens.js";
import { PaywallBuyerScreen, PaywallPartnerScreen } from "./paywall/screens.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

const previewStorage = createPersistingPreviewStorage(defaultPreviewStorage());

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
  const [state, setState] = useState(() => startHostFlow(previewStorage));
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
      await hydratePreviewStorage(previewStorage);
      if (cancelled) return;
      const opened = startHostFlow(previewStorage);
      const initialUrl = await Linking.getInitialURL().catch(() => null);
      const loc = typeof location !== "undefined"
        ? location
        : (initialUrl ? { href: initialUrl, search: "", pathname: "" } : null);
      const openWork = finishHostOpen(opened, api, inviteApi, loc, previewStorage);
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
        const next = await finishHostOpen(stateRef.current, api, inviteApi, { href: url }, previewStorage);
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
      {state.screen === "cover" ? (
        <CoverScreen onPreviewQuestion={() => setState(openPreviewQ1(state, previewStorage))} />
      ) : null}
      {state.screen === "pack-list" ? (
        <PackListScreen onOpenMarriage={() => setState(openMarriageFromList(state, previewStorage))} />
      ) : null}
      {state.screen === "preview-q1" ? (
        <PreviewQ1Screen
          question={previewQ1Question()}
          choiceId={state.previewQ1?.choiceId || ""}
          loggedIn={Boolean(state.session?.user)}
          onSelectChoice={(choiceId) => setState(selectPreviewChoice(state, choiceId, previewStorage))}
          onKeepAnswer={() => {
            if (!state.previewQ1?.choiceId) return;
            setState(keepPreviewAnswer(state, previewStorage));
          }}
          onContinue={async () => setState(await savePreviewAndOpenInviteThenLoad(state, api))}
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

async function savePreviewAndOpenInviteThenLoad(state, api) {
  const next = await savePreviewAndOpenInvite(state, api, previewStorage);
  if (next.screen !== "invite") return next;
  return loadInvitePairCode(next, api);
}
