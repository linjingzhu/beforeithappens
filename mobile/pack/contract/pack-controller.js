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

  /** 완주: every question in the pack ended in a public lock, so there is nothing left to open. */
  function packCompleted() {
    const ids = pack?.questionIds || (pack?.questions || []).map((question) => question.id);
    if (!state || ids.length === 0) return false;
    return ids.every((id) => Boolean(state.questions?.[id]?.lock));
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
      completed: packCompleted(),
      // The last question has no next: the native packs bound this by the pack length too,
      // and without it the reader is offered a "다음 질문" link that goes nowhere.
      canGoNext: question
        ? canOpenQuestion((question.index ?? 0) + 1, { entitled: gate.entitled })
          && (question.index ?? 0) + 1 < (pack?.questions?.length ?? 0)
        : false
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

    /**
     * Re-reads server state without moving the reader. Entitlement is a workspace fact, so
     * this is the only way the partner's screen reopens after the buyer pays — the partner
     * gate carries no button of its own. A failed poll is silent: it leaves the current
     * view, save status and error line exactly as they were.
     */
    async refresh() {
      if (!state) return view();
      const result = await client.getState();
      if (!result?.ok || !result.state) return view();
      const keepIndex = Number.isInteger(state.index) ? state.index : result.state.index;
      applyState({ ...result.state, index: keepIndex });
      paywall.applyPackState(state);
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
