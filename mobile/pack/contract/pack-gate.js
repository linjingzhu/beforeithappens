import { PACK_COPY } from "./pack-copy.js";

export function canStartPack(session) {
  return Boolean(session?.user && session.workspace?.acceptedPartner === true);
}

export function packReadyScreen(session) {
  if (!session?.user) {
    return { screen: "signed-out", canStart: false, cta: "", body: "" };
  }
  if (!canStartPack(session)) {
    return {
      screen: "locked",
      canStart: false,
      cta: "",
      title: PACK_COPY.title,
      body: PACK_COPY.lockedBody
    };
  }
  return {
    screen: "ready",
    canStart: true,
    cta: PACK_COPY.startPack,
    title: PACK_COPY.title,
    body: PACK_COPY.startBody
  };
}

export function startPackDecision(session, packStateResult) {
  const ready = packReadyScreen(session);
  if (!ready.canStart) {
    return { ok: false, screen: ready.screen, error: ready.screen === "signed-out" ? "unauthenticated" : "locked" };
  }
  if (!packStateResult?.ok) {
    const error = packStateResult?.error || "failed";
    if (error === "unauthenticated") return { ok: false, screen: "signed-out", error };
    if (error === "locked" || error === "forbidden") return { ok: false, screen: "locked", error };
    return { ok: false, screen: "ready", error };
  }
  return { ok: true, screen: "question", state: packStateResult.state };
}
