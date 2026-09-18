const CHANNEL = "system.realm-guard";
const SCOPE = "TURN_AUTHORITY";
const REQUEST_TIMEOUT_MS = 8000;

let installed = false;
let sequence = 0;
let handlers = {};
let gmQueue = Promise.resolve();
const pending = new Map();

function activeUsers() {
  return Array.from(globalThis.game?.users ?? []);
}

export function primaryActiveGm(gameRef = globalThis.game) {
  return Array.from(gameRef?.users ?? [])
    .filter(user => Boolean(user?.active) && Boolean(user?.isGM))
    .sort((a, b) => String(a.id ?? "").localeCompare(String(b.id ?? "")))[0] ?? null;
}

export function turnAuthorityStatus(gameRef = globalThis.game) {
  const primary = primaryActiveGm(gameRef);
  return Object.freeze({
    mode: gameRef?.user?.isGM ? "LOCAL_GM_COMMIT" : "GM_PROXY_COMMIT",
    primaryGmId: String(primary?.id ?? ""),
    primaryGmName: String(primary?.name ?? ""),
    available: Boolean(gameRef?.user?.isGM || primary),
    liveRulesAuthority: "CORE_M7_CLAIM_LEGACY_SESSION",
    coreLiveApplication: true,
    liveCoreScope: Object.freeze(["CLAIM_TEST"])
  });
}

function emit(message) {
  globalThis.game?.socket?.emit?.(CHANNEL, { scope: SCOPE, ...message });
}

async function executeRequest(message) {
  const handler = handlers[message.operation];
  let result;
  if (typeof handler !== "function") {
    result = { ok: false, reason: `Unknown Turn authority operation: ${message.operation}` };
  } else {
    try {
      const requester = globalThis.game?.users?.get?.(message.senderUserId) ?? null;
      result = await handler(message.payload ?? {}, { requester, message });
      if (result == null) result = { ok: true };
    } catch (error) {
      console.error("realm-guard | Turn authority request failed", error);
      result = { ok: false, reason: String(error?.message ?? error ?? "Turn authority request failed.") };
    }
  }

  emit({
    type: "RESPONSE",
    requestId: message.requestId,
    targetUserId: message.senderUserId,
    senderUserId: globalThis.game?.user?.id ?? "",
    result
  });
}

function onSocket(message) {
  if (!message || message.scope !== SCOPE) return;

  if (message.type === "RESPONSE") {
    if (String(message.targetUserId ?? "") !== String(globalThis.game?.user?.id ?? "")) return;
    const waiter = pending.get(message.requestId);
    if (!waiter) return;
    pending.delete(message.requestId);
    clearTimeout(waiter.timer);
    waiter.resolve(message.result ?? { ok: false, reason: "Empty Turn authority response." });
    return;
  }

  if (message.type !== "REQUEST" || !globalThis.game?.user?.isGM) return;
  const primary = primaryActiveGm();
  if (!primary || String(primary.id) !== String(globalThis.game.user.id)) return;
  if (message.targetGmId && String(message.targetGmId) !== String(globalThis.game.user.id)) return;

  // Serialize Legacy Mixed session mutations on one active GM so simultaneous player
  // requests cannot race the shared phase/alternation state.
  gmQueue = gmQueue
    .then(() => executeRequest(message))
    .catch(error => console.error("realm-guard | Turn authority queue failed", error));
}

export function installTurnAuthorityBridge(nextHandlers = {}) {
  handlers = { ...handlers, ...nextHandlers };
  if (installed) return;
  installed = true;

  const attach = () => globalThis.game?.socket?.on?.(CHANNEL, onSocket);
  if (globalThis.game?.ready) attach();
  else globalThis.Hooks?.once?.("ready", attach);
}

export async function requestTurnAuthority(operation, payload = {}, { timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  if (globalThis.game?.user?.isGM) {
    const handler = handlers[operation];
    if (typeof handler !== "function") return { ok: false, reason: `Unknown Turn authority operation: ${operation}` };
    return handler(payload, { requester: globalThis.game.user, local: true });
  }

  const primary = primaryActiveGm();
  if (!primary) {
    return { ok: false, reason: "No active GM is available to commit structured Turn state." };
  }

  const requestId = `${globalThis.game?.user?.id ?? "user"}:${Date.now()}:${++sequence}`;
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      pending.delete(requestId);
      resolve({ ok: false, reason: "Timed out waiting for the GM to commit structured Turn state." });
    }, Math.max(1000, Number(timeoutMs || REQUEST_TIMEOUT_MS)));

    pending.set(requestId, { resolve, timer });
    emit({
      type: "REQUEST",
      requestId,
      operation: String(operation ?? ""),
      senderUserId: globalThis.game?.user?.id ?? "",
      targetGmId: primary.id,
      payload
    });
  });
}
