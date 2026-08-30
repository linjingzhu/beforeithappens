import { createPaywallClient } from "./contract/paywall-client.js";
import { createPaywallController } from "./contract/paywall-controller.js";
import { paywallScreen } from "./contract/paywall-gate.js";

export function createHostPaywall({ pack, session, cookieAccess = {}, packState = null } = {}) {
  const client = createPaywallClient({
    sessionId: cookieAccess.sessionId || "",
    fetchImpl: cookieAccess.fetchImpl
  });
  return createPaywallController({ pack, session, client, packState });
}

export function overlayFromPackView(packView, session) {
  return paywallScreen({
    session,
    sampleLocks: packView?.state?.sampleLockCount ?? 0,
    entitled: Boolean(packView?.state?.entitlement?.entitled),
    dismissed: Boolean(packView?.paywallDismissed),
    index: packView?.state?.index ?? packView?.question?.index ?? 0
  });
}
