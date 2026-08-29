import test from "node:test";
import assert from "node:assert/strict";
import { loadMarriagePack } from "../contract/pack-catalog.js";
import {
  agreementAction,
  comparisonLabel,
  isReanswerDraft,
  projectQuestionScreen,
  shouldOpenNewRound
} from "../contract/pack-projection.js";

const pack = loadMarriagePack();

function questionState({ mine = {}, theirs = {}, lock = null, shared = { proposal: "", status: "none" } } = {}) {
  return {
    index: 0,
    activeRole: "a",
    questions: {
      [pack.questionIds[0]]: {
        round: lock?.roundNumber || 1,
        lock,
        roles: {
          a: { draftChoice: null, privateNote: "", submittedChoice: null, ...mine },
          b: { draftChoice: null, privateNote: "", submittedChoice: null, completed: false, ...theirs }
        },
        shared
      }
    }
  };
}

test("S7 shows one question and marks drafts 나만 보임", () => {
  const view = projectQuestionScreen({
    pack,
    state: questionState({ mine: { draftChoice: "home-rest", privateNote: "비밀" } }),
    session: { workspace: { role: "buyer", acceptedPartner: true } }
  });
  assert.equal(view.screen, "question");
  assert.equal(view.question.id, pack.questionIds[0]);
  assert.equal(view.privacyBadge, "나만 보임");
  assert.equal(view.mine.privateNote, "비밀");
  assert.equal(view.theirs.privateNote, "");
  assert.equal(view.canEditDraft, true);
  assert.equal(view.canSubmit, true);
});

test("S8 lock snapshot and 합의/다음에 미룸 never reopen the same lock", () => {
  const lock = {
    id: "lock_1",
    roundNumber: 1,
    submittedChoices: { a: "home-rest", b: "home-social" }
  };
  const view = projectQuestionScreen({
    pack,
    state: questionState({
      mine: { submittedChoice: "home-rest", privateNote: "비밀" },
      theirs: { submittedChoice: "home-social", completed: true },
      lock,
      shared: { proposal: "주말은 집에서", status: "none" }
    }),
    session: { workspace: { role: "buyer", acceptedPartner: true } }
  });
  assert.equal(view.screen, "reveal");
  assert.equal(view.privacyBadge, "공개 잠금");
  assert.equal(view.agreeLabel, "합의");
  assert.equal(view.holdLabel, "다음에 미룸");
  assert.equal(view.canReanswer, true);
  assert.equal(view.lock.roundNumber, 1);
  assert.equal(shouldOpenNewRound(lock, "a", "home-rest"), false);
  assert.equal(shouldOpenNewRound(lock, "a", "home-growth"), true);
  assert.equal(isReanswerDraft(lock, "a", "home-growth"), true);
  assert.equal(isReanswerDraft(lock, "a", "home-rest"), false);
  assert.equal(agreementAction(view.shared, "a"), "propose");
  assert.equal(agreementAction({ status: "pending", proposedBy: "a" }, "b"), "approve");
});

test("re-answer mode returns to a private draft badge on a new round", () => {
  const view = projectQuestionScreen({
    pack,
    state: questionState({
      mine: { draftChoice: "home-growth", privateNote: "새 메모", submittedChoice: "home-rest" },
      lock: { id: "lock_1", roundNumber: 1, submittedChoices: { a: "home-rest", b: "home-social" } }
    }),
    session: { workspace: { role: "buyer", acceptedPartner: true } },
    reanswering: true
  });
  assert.equal(view.screen, "question");
  assert.equal(view.privacyBadge, "나만 보임");
  assert.equal(view.canEditDraft, true);
  assert.equal(view.lock.roundNumber, 1);
});

test("comparison labels are ALIGNED, CLOSE, or DISCUSS only", () => {
  assert.equal(comparisonLabel({ comparison: { key: "aligned" } }), "ALIGNED");
  assert.equal(comparisonLabel({ comparison: { key: "close" } }), "CLOSE");
  assert.equal(comparisonLabel({ comparison: { key: "discuss" } }), "DISCUSS");
  assert.equal(comparisonLabel({ submittedChoices: { a: "home-rest", b: "home-rest" } }), "ALIGNED");
  assert.equal(comparisonLabel({ submittedChoices: { a: "home-rest", b: "home-social" } }), "DISCUSS");
  assert.equal(comparisonLabel({ comparison: { key: "broken", label: "관계가 틀렸다" } }, {
    roles: { a: { submittedChoice: "home-rest" }, b: { submittedChoice: "home-social" } }
  }), "DISCUSS");
  const view = projectQuestionScreen({
    pack,
    state: questionState({
      mine: { submittedChoice: "home-rest" },
      theirs: { submittedChoice: "home-rest", completed: true },
      lock: { id: "lock_1", roundNumber: 1, submittedChoices: { a: "home-rest", b: "home-rest" }, comparison: { key: "aligned" } }
    }),
    session: { workspace: { role: "buyer", acceptedPartner: true } }
  });
  assert.equal(view.comparisonLabel, "ALIGNED");
  assert.equal(["ALIGNED", "CLOSE", "DISCUSS"].includes(view.comparisonLabel), true);
  assert.equal(view.comparisonLabel.includes("틀렸다"), false);
});
