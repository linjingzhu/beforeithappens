import { canOpenQuestion, isBuyerRole, paywallScreen, sampleLockCount, shouldShowPaywall } from "./paywall-gate.js";

export function createPaywallController({
  pack,
  session = { user: null, workspace: { acceptedPartner: false, role: "buyer" } },
  client,
  packState = null
} = {}) {
  let state = packState;
  let dismissed = false;
  let busy = false;
  let error = "";

  function entitled() {
    return Boolean(state?.entitlement?.entitled);
  }

  function locks() {
    return Number.isInteger(state?.sampleLockCount)
      ? state.sampleLockCount
      : sampleLockCount(state, pack?.questionIds || []);
  }

  function gate() {
    return paywallScreen({
      session,
      sampleLocks: locks(),
      entitled: entitled(),
      dismissed,
      index: Number.isInteger(state?.index) ? state.index : 0
    });
  }

  function view() {
    const screen = gate();
    return {
      visible: screen.visible,
      variant: screen.variant,
      canPurchase: screen.canPurchase,
      title: screen.title,
      body: screen.body,
      cta: screen.cta,
      secondary: screen.secondary,
      labels: screen.labels,
      dismissed,
      entitled: entitled(),
      remainingLocked: !entitled(),
      sampleLockCount: locks(),
      busy,
      error,
      comparisonVisible: true
    };
  }

  return {
    view,
    shouldShow: () => shouldShowPaywall({
      session,
      sampleLocks: locks(),
      entitled: entitled(),
      dismissed,
      index: Number.isInteger(state?.index) ? state.index : 0
    }),
    canOpenQuestion: (index) => canOpenQuestion(index, { entitled: entitled() }),
    applyPackState(next) {
      if (next) state = next;
      if (entitled()) dismissed = false;
      return view();
    },
    later() {
      dismissed = true;
      error = "";
      return view();
    },
    async purchase() {
      if (!isBuyerRole(session) || entitled()) {
        error = "";
        return view();
      }
      if (!client?.purchase) {
        error = "failed";
        return view();
      }
      busy = true;
      const result = await client.purchase();
      busy = false;
      if (!result?.ok) {
        error = result?.error || "failed";
        return view();
      }
      error = "";
      dismissed = false;
      state = {
        ...(state || {}),
        entitlement: {
          entitled: true,
          role: "buyer",
          canPurchase: false,
          amount: result.amount,
          currency: result.currency
        },
        remainingLocked: false,
        paywallRequired: false
      };
      return view();
    }
  };
}
