import { canStartPack, packReadyScreen, startPackDecision } from "./pack-gate.js";
import { neverMigrateLocalSim } from "./pack-client.js";
import { nextIndex, projectQuestionScreen, viewerRole } from "./pack-projection.js";
import { PACK_COPY } from "./pack-copy.js";
import { canOpenQuestion } from "../../paywall/contract/paywall-gate.js";
import { createPaywallController } from "../../paywall/contract/paywall-controller.js";

export function createPackController({
  pack,
  client,
  session = { user: null, workspace: { acceptedPartner: false } },
  storage = null,
  paywallClient = null
} = {}) {
  let state = null;
  let screen = packReadyScreen(session).screen;
  let saveStatus = "saved";
  let reanswering = false;
  let error = "";
  const paywall = createPaywallController({ pack, session, client: paywallClient });

  function applyState(next) {
    if (!next) return;
    state = {
      ...next,
      activeRole: next.activeRole || viewerRole(session)
    };
  }

  function view() {
    const ready = packReadyScreen(session);
    if (screen === "signed-out") {
      return { ...ready, screen: "signed-out", canStart: false, cta: "", saveStatus, error, question: null };
    }
    if (screen === "locked") {
      return {
        screen: "locked",
        canStart: false,
        cta: "",
        title: PACK_COPY.title,
        body: PACK_COPY.lockedBody,
        saveStatus,
        error,
        question: null
      };
    }
    if (screen === "ready") {
      return { ...ready, saveStatus, error, question: null };
    }
    const question = projectQuestionScreen({ pack, state, session, reanswering, saveStatus });
    const gate = paywall.view();
    return {
      screen: question?.screen || screen,
      canStart: false,
      cta: ready.cta,
      title: question?.question?.title || PACK_COPY.title,
      body: question?.privacyRule || "",
      saveStatus,
      error,
      question,
      state,
      paywall: gate,
      remainingLocked: gate.remainingLocked,
      canGoNext: question ? canOpenQuestion((question.index ?? 0) + 1, { entitled: gate.entitled }) : false
    };
  }

  return {
    view,
    canStartPack: () => canStartPack(session),
    migratedLocalSimKeys: () => neverMigrateLocalSim(storage),
    async startPack() {
      const ready = packReadyScreen(session);
      if (!ready.canStart) {
        screen = ready.screen;
        error = "";
        return view();
      }
      saveStatus = "saving";
      const result = await client.getState();
      const decision = startPackDecision(session, result);
      saveStatus = decision.ok ? "saved" : "failed";
      screen = decision.screen;
      if (decision.screen === "locked" || decision.screen === "signed-out") {
        error = "";
      } else {
        error = decision.ok ? "" : decision.error;
      }
      if (decision.ok) {
        applyState(decision.state);
        paywall.applyPackState(decision.state);
      }
      return view();
    },
    async saveDraft({ draftChoice, privateNote } = {}) {
      const current = projectQuestionScreen({ pack, state, session, reanswering, saveStatus });
      if (!current) return view();
      if (current.lock && !reanswering) return view();
      const incoming = draftChoice === undefined ? current.mine.draftChoice : draftChoice;
      saveStatus = "saving";
      const result = await client.saveDraft({
        questionId: current.question.id,
        draftChoice: incoming,
        privateNote: privateNote === undefined ? current.mine.privateNote : privateNote,
        index: current.index
      });
      if (!result.ok) {
        saveStatus = "failed";
        error = result.error || "failed";
        return view();
      }
      applyState(result.state);
      paywall.applyPackState(result.state);
      saveStatus = "saved";
      error = "";
      return view();
    },
    async submit() {
      const current = projectQuestionScreen({ pack, state, session, reanswering, saveStatus });
      if (!current?.canSubmit) {
        error = PACK_COPY.emptySubmit;
        return view();
      }
      saveStatus = "saving";
      const result = await client.submit({ questionId: current.question.id, index: current.index });
      if (!result.ok) {
        saveStatus = "failed";
        error = result.error || "failed";
        return view();
      }
      applyState(result.state);
      paywall.applyPackState(result.state);
      saveStatus = "saved";
      error = "";
      reanswering = false;
      screen = "question";
      return view();
    },
    async agree(proposal) {
      const current = projectQuestionScreen({ pack, state, session, reanswering, saveStatus });
      if (!current?.revealed) return view();
      saveStatus = "saving";
      const result = await client.saveAgreement({
        questionId: current.question.id,
        action: current.agreementAction,
        proposal: proposal ?? current.shared.proposal,
        index: current.index
      });
      if (!result.ok) {
        saveStatus = "failed";
        error = result.error || "failed";
        return view();
      }
      applyState(result.state);
      paywall.applyPackState(result.state);
      saveStatus = "saved";
      error = "";
      return view();
    },
    async hold() {
      const current = projectQuestionScreen({ pack, state, session, reanswering, saveStatus });
      if (!current?.revealed) return view();
      saveStatus = "saving";
      const result = await client.saveAgreement({
        questionId: current.question.id,
        action: "deferred",
        index: current.index
      });
      if (!result.ok) {
        saveStatus = "failed";
        error = result.error || "failed";
        return view();
      }
      applyState(result.state);
      paywall.applyPackState(result.state);
      saveStatus = "saved";
      error = "";
      return view();
    },
    beginReanswer() {
      const current = projectQuestionScreen({ pack, state, session, reanswering: false });
      if (!current?.lock) return view();
      reanswering = true;
      return view();
    },
    async go(delta) {
      if (!state) return view();
      const next = nextIndex(state, pack, delta);
      if (!canOpenQuestion(next, { entitled: Boolean(state.entitlement?.entitled) })) {
        return view();
      }
      state = { ...state, index: next };
      paywall.applyPackState(state);
      return view();
    },
    later() {
      return { ...view(), paywall: paywall.later() };
    },
    async purchase() {
      const next = await paywall.purchase();
      if (next.entitled && state) {
        state = {
          ...state,
          entitlement: { ...(state.entitlement || {}), entitled: true, canPurchase: false },
          remainingLocked: false,
          paywallRequired: false
        };
      }
      return view();
    }
  };
}
