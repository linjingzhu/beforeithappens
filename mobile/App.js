import { useEffect, useRef, useState } from "react";
import { Linking, Share } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SPLASH_MS } from "./src/copy.js";
import { colors } from "./src/theme.js";
import {
  AccountScreen,
  CertificateScreen,
  ComingSoonScreen,
  EmailBindScreen,
  InviteScreen,
  NoticeScreen,
  PackListScreen,
  PartnerWaitScreen,
  SampleQuestionScreen,
  SampleResultScreen,
  SentScreen,
  SignupScreen,
  SplashScreenView,
  UnlockRestScreen,
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
  backFromCertificate,
  backFromComingSoon,
  backFromInvite,
  backFromPackDetail,
  cancelLogin,
  backToSignup,
  connectPartnerCode,
  copyMyPairCode,
  currentSampleQuestion,
  dismissShop,
  finishSplash,
  isFirstRunLogin,
  loadInvitePairCode,
  openAccount,
  openComingSoonFromList,
  openMarriageFromList,
  openSendLink,
  openTogetherFromSample,
  purchaseShopHearts,
  requestLinkStarted,
  setEmail,
  setPartnerCode,
  setSampleChoice,
  setSampleReason,
  shareMeasurementInvite,
  submitSampleAnswer,
  tapUnlock
} from "./s0-s2-s3-flow.js";
import { packListLabel } from "./src/copy.js";
import { countSampleLabels, sampleCounterLabel, SAMPLE_SIZE } from "../src/marriage-sample.js";
import { FONT_ASSETS } from "./src/fonts.js";
import * as Font from "expo-font";
import { APP_S4_SCREEN, APP_SAME_SESSION_SCREEN } from "./s4-invite/flow.js";
import { createHostInviteApi, finishHostOpen, logoutAndContinueFromS4, logoutFromS4Home, openS4FromWorkspace, sendS4Invite, shareS4FromHost } from "./s4-invite/host-mount.js";
import { InviteWaitingScreen, SameSessionFailScreen } from "./s4-invite/screens.js";

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
      await Font.loadAsync(FONT_ASSETS).catch(() => {});
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
        <StatusBar style="dark" backgroundColor={colors.babyPink} />
        {paywallPreview === "partner"
          ? <PartnerWaitScreen />
          : (
            <UnlockRestScreen
              hearts={0}
              shopOpen={paywallPreview === "shop"}
              onUnlock={() => {}}
              onBuy={() => {}}
              onLater={() => {}}
            />
          )}
      </>
    );
  }

  const sampleQuestion = currentSampleQuestion(state);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.babyPink} />
      {state.screen === "splash" ? <SplashScreenView /> : null}
      {state.screen === "pack-list" ? (
        <PackListScreen
          hearts={state.hearts}
          session={state.session}
          onOpenMarriage={() => setState(openMarriageFromList(state))}
          onOpenComingSoon={(packId) => setState(openComingSoonFromList(state, packId))}
          onOpenAccount={() => setState(openAccount(state))}
        />
      ) : null}
      {state.screen === "coming-soon" ? (
        <ComingSoonScreen
          packId={state.comingSoonId}
          onBackToList={() => setState(backFromComingSoon(state))}
        />
      ) : null}
      {state.screen === "sample-q" ? (
        <SampleQuestionScreen
          question={sampleQuestion}
          choiceId={state.sampleChoice}
          reason={state.sampleReason}
          error={state.error}
          progressLabel={sampleCounterLabel(state.samplePackId, state.sampleIndex, SAMPLE_SIZE)}
          onChangeChoice={(id) => setState(setSampleChoice(state, id))}
          onChangeReason={(value) => setState(setSampleReason(state, value))}
          onSubmit={() => setState(submitSampleAnswer(state))}
          onBack={() => setState(backFromPackDetail(state))}
        />
      ) : null}
      {state.screen === "sample-result" ? (
        <SampleResultScreen
          question={state.sampleQuestions?.[state.sampleQuestions.length - 1]}
          myChoice={state.sampleQuestions?.[state.sampleQuestions.length - 1]?.choices?.find((choice) => choice.id === state.sampleAnswers?.at?.(-1)?.choiceId)}
          partnerChoice={state.samplePartner}
          onTogether={() => setState(openTogetherFromSample(state))}
        />
      ) : null}
      {state.screen === "unlock" ? (
        <UnlockRestScreen
          hearts={state.hearts}
          shopOpen={state.shopOpen}
          onUnlock={() => setState(tapUnlock(state))}
          onBuy={() => setState(purchaseShopHearts(state))}
          onLater={() => setState(dismissShop(state))}
        />
      ) : null}
      {state.screen === "partner-wait" ? <PartnerWaitScreen /> : null}
      {state.screen === "certificate" ? (
        <CertificateScreen
          packLabel={packListLabel(state.samplePackId) || "결혼"}
          counts={countSampleLabels(state.sampleAnswers, state.sampleQuestions)}
          onHome={() => setState(backFromCertificate(state))}
        />
      ) : null}
      {state.screen === "account" ? (
        <AccountScreen
          email={state.session?.user?.email || ""}
          partnerEmail={state.session?.workspace?.partnerEmail || ""}
          acceptedPartner={Boolean(state.session?.workspace?.acceptedPartner)}
          guest={!state.session?.user}
          busy={state.busy}
          onBack={() => setState(backFromAccount(state))}
          onLogout={async () => setState(await logoutHost(state, api))}
          onLogin={() => setState(openAccount(state))}
          onInvite={async () => setState(await loadInvitePairCode(openSendLink(state), api))}
        />
      ) : null}
      {state.screen === "signup" ? (
        <SignupScreen
          email={state.email}
          error={state.error}
          busy={state.busy}
          firstRun={isFirstRunLogin(state)}
          onBack={() => setState(cancelLogin(state))}
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
