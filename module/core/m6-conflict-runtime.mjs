function num(value) { return Number(value ?? 0); }
function clamp0(value) { return Math.max(0, num(value)); }
function clone(value) {
  if (value === undefined) return undefined;
  if (typeof globalThis.structuredClone === "function") return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
function sortedUnique(values = []) { return [...new Set((values ?? []).filter(Boolean).map(String))].sort(); }

export function createM6ConflictRuntimeRepository({ read, write } = {}) {
  if (typeof read !== "function" || typeof write !== "function") throw new Error("M6 RuntimeStateRepository requires read/write adapters.");
  return Object.freeze({
    read: () => read(),
    write: state => write(state),
    snapshot: () => adaptLegacyConflictState(read())
  });
}

export function adaptLegacyConflictState(state = null) {
  if (!state) return null;
  const rangerIds = [...(state?.ranger?.participantIds ?? [])].map(String);
  const gmId = String(state?.gm?.actorId ?? "");
  const participants = [
    ...(gmId ? [{ actorId: gmId, sideId: "gm", teamId: "gm" }] : []),
    ...rangerIds.map(actorId => ({ actorId, sideId: "ranger", teamId: "ranger" }))
  ];
  const assignments = (state?.revealed ?? []).map(entry => ({
    index: num(entry?.index),
    gm: { action: String(entry?.gmAction ?? ""), actorId: gmId },
    ranger: { action: String(entry?.rangerAction ?? ""), actorId: String(entry?.rangerActorId ?? "") }
  }));
  return Object.freeze({
    schema: "M6_CONFLICT_RUNTIME_V1",
    id: String(state?.id ?? ""),
    active: Boolean(state?.active),
    name: String(state?.name ?? ""),
    type: String(state?.type ?? ""),
    stage: String(state?.stage ?? ""),
    exchange: Math.max(1, num(state?.exchange || 1)),
    currentActionIndex: Math.max(0, num(state?.currentIndex)),
    sides: Object.freeze({
      gm: Object.freeze({
        id: "gm", teamId: "gm", goal: String(state?.gm?.goal ?? ""),
        disposition: Object.freeze({ start: clamp0(state?.gm?.disposition?.start), current: clamp0(state?.gm?.disposition?.current) })
      }),
      ranger: Object.freeze({
        id: "ranger", teamId: "ranger", goal: String(state?.ranger?.goal ?? ""),
        disposition: Object.freeze({ start: clamp0(state?.ranger?.disposition?.start), current: clamp0(state?.ranger?.disposition?.current) })
      })
    }),
    teams: Object.freeze({
      gm: Object.freeze({ id: "gm", captainId: gmId, participantIds: Object.freeze(gmId ? [gmId] : []) }),
      ranger: Object.freeze({ id: "ranger", captainId: String(state?.ranger?.captainId ?? ""), participantIds: Object.freeze(rangerIds) })
    }),
    participants: Object.freeze(participants.map(row => Object.freeze(row))),
    actionSet: Object.freeze({
      exchange: Math.max(1, num(state?.exchange || 1)),
      currentIndex: Math.max(0, num(state?.currentIndex)),
      locks: Object.freeze({ gm: Boolean(state?.locks?.gm), ranger: Boolean(state?.locks?.ranger) }),
      assignments: Object.freeze(assignments.map(row => Object.freeze(row))),
      weaponIds: Object.freeze({ ...(state?.weaponIds ?? {}) })
    }),
    effects: Object.freeze({
      gm: Object.freeze({ nextDice: num(state?.effects?.gm?.nextDice), disabledGearIds: Object.freeze(sortedUnique(state?.effects?.gm?.disabledGearIds)) }),
      ranger: Object.freeze({ nextDice: num(state?.effects?.ranger?.nextDice), disabledGearIds: Object.freeze(sortedUnique(state?.effects?.ranger?.disabledGearIds)) })
    }),
    outcome: state?.outcome ? Object.freeze(clone(state.outcome)) : null,
    compromise: state?.compromise ? Object.freeze(clone(state.compromise)) : null
  });
}

export function projectM6ConflictState(state = null) {
  if (!state) return null;
  const normalizeQueue = queue => (queue ?? []).map(row => ({ side: String(row?.side ?? ""), margin: Math.max(0, num(row?.margin)) }));
  const normalizeCounts = counts => Object.fromEntries(Object.entries(counts ?? {}).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k, Math.max(0, num(v))]));
  return {
    active: Boolean(state.active),
    stage: String(state.stage ?? ""),
    exchange: Math.max(1, num(state.exchange || 1)),
    currentIndex: Math.max(0, num(state.currentIndex)),
    disposition: {
      gm: clamp0(state?.gm?.disposition?.current),
      ranger: clamp0(state?.ranger?.disposition?.current)
    },
    locks: { gm: Boolean(state?.locks?.gm), ranger: Boolean(state?.locks?.ranger) },
    pendingManeuver: state?.pendingManeuver ? { side: String(state.pendingManeuver.side ?? ""), margin: Math.max(0, num(state.pendingManeuver.margin)) } : null,
    pendingManeuverQueue: normalizeQueue(state?.pendingManeuverQueue),
    effects: {
      gm: { nextDice: num(state?.effects?.gm?.nextDice), disabledGearIds: sortedUnique(state?.effects?.gm?.disabledGearIds) },
      ranger: { nextDice: num(state?.effects?.ranger?.nextDice), disabledGearIds: sortedUnique(state?.effects?.ranger?.disabledGearIds) }
    },
    actionCounts: normalizeCounts(state?.actionCounts),
    pendingActionCounts: state?.pendingActionCounts == null ? null : normalizeCounts(state.pendingActionCounts),
    lastRangerActorId: String(state?.lastRangerActorId ?? ""),
    pendingLastRangerActorId: state?.pendingLastRangerActorId == null ? null : String(state.pendingLastRangerActorId ?? ""),
    revealedCount: Array.isArray(state?.revealed) ? state.revealed.length : 0,
    rollsCleared: !state?.rolls?.gm && !state?.rolls?.ranger,
    outcome: state?.outcome ? clone(state.outcome) : null,
    compromise: state?.compromise ? clone(state.compromise) : null
  };
}

export function m6CompromiseGrade(start, current) {
  const s = clamp0(start), c = clamp0(current);
  if (!s || c >= s) return "none";
  const lost = s - c;
  if (lost * 2 < s) return "minor";
  if (lost * 2 === s) return "compromise";
  return "major";
}

function capDisposition(value, start) { return Math.max(0, Math.min(clamp0(start), num(value))); }

export function m6ApplyPostResolutionState(baseState, { pair = {}, result = {}, gmRoll = null, rangerRoll = null } = {}) {
  const next = clone(baseState);
  const applyAction = (side, action, mode, passed, margin, effectiveSuccesses) => {
    if (mode === "trumped" || !passed) return;
    const own = next?.[side];
    const oppSide = side === "gm" ? "ranger" : "gm";
    const opp = next?.[oppSide];
    if (!own || !opp) return;
    if (["attack", "feint"].includes(action)) {
      const damage = mode === "independent" ? Math.max(0, num(effectiveSuccesses)) : Math.max(0, num(margin));
      opp.disposition.current = Math.max(0, num(opp.disposition.current) - damage);
    } else if (action === "defend") {
      own.disposition.current = capDisposition(num(own.disposition.current) + Math.max(0, num(margin)), own.disposition.start);
    }
  };
  applyAction("gm", pair.gmAction, pair.gmMode, Boolean(result.gmPassed), result.gmMargin, result.gmEffectiveSuccesses ?? gmRoll?.effectiveSuccesses);
  applyAction("ranger", pair.rangerAction, pair.rangerMode, Boolean(result.rangerPassed), result.rangerMargin, result.rangerEffectiveSuccesses ?? rangerRoll?.effectiveSuccesses);

  const queue = [];
  if (pair.gmAction === "maneuver" && pair.gmMode !== "trumped" && result.gmPassed && num(result.gmMargin) > 0) queue.push({ side: "gm", margin: Math.max(0, num(result.gmMargin)) });
  if (pair.rangerAction === "maneuver" && pair.rangerMode !== "trumped" && result.rangerPassed && num(result.rangerMargin) > 0) queue.push({ side: "ranger", margin: Math.max(0, num(result.rangerMargin)) });

  next.rolls = { gm: null, ranger: null };
  const gmZero = clamp0(next?.gm?.disposition?.current) <= 0;
  const rangerZero = clamp0(next?.ranger?.disposition?.current) <= 0;
  if (gmZero || rangerZero) {
    next.outcome = { winner: gmZero && rangerZero ? "tie" : gmZero ? "ranger" : "gm", endedExchange: num(next.exchange), endedAction: num(next.currentIndex) + 1 };
    next.stage = "compromise";
    next.pendingManeuver = null;
    next.pendingManeuverQueue = [];
    return next;
  }
  if (queue.length) {
    next.pendingManeuverQueue = queue;
    next.pendingManeuver = queue[0];
    next.stage = "maneuver";
    return next;
  }
  next.pendingManeuverQueue = [];
  next.pendingManeuver = null;
  next.stage = "action";
  return next;
}

export function m6AdvanceAfterActionState(baseState) {
  const next = clone(baseState);
  next.rolls = { gm: null, ranger: null };
  next.pendingManeuver = null;
  next.pendingManeuverQueue = [];
  if (num(next.currentIndex) < 2) {
    next.currentIndex = num(next.currentIndex) + 1;
    next.stage = "ready";
    return next;
  }
  next.actionCounts = next.pendingActionCounts ?? next.actionCounts;
  next.lastRangerActorId = next.pendingLastRangerActorId ?? next.lastRangerActorId;
  next.pendingActionCounts = null;
  next.pendingLastRangerActorId = null;
  next.exchange = Math.max(1, num(next.exchange || 1)) + 1;
  next.currentIndex = 0;
  next.locks = { gm: false, ranger: false };
  next.stage = "gmPlan";
  next.revealed = [];
  next.log = Array.isArray(next.log) ? next.log : [];
  next.log.push(`Exchange ${next.exchange} begins.`);
  return next;
}

export function m6ApplyManeuverState(baseState, { choice = "", disarmedGearId = "" } = {}) {
  const next = clone(baseState);
  const pending = next?.pendingManeuver;
  if (!pending || next?.stage !== "maneuver") return next;
  const side = String(pending.side ?? "");
  const opp = side === "gm" ? "ranger" : "gm";
  const margin = Math.max(0, num(pending.margin));
  const allowed = choice === "impede" ? margin >= 1 : choice === "position" ? margin >= 2 : ["disarm", "combo"].includes(choice) ? margin >= 3 : false;
  if (!allowed) return next;
  next.effects = next.effects ?? { gm: {}, ranger: {} };
  next.effects.gm = next.effects.gm ?? {};
  next.effects.ranger = next.effects.ranger ?? {};
  if (choice === "impede" || choice === "combo") next.effects[opp].nextDice = num(next.effects[opp].nextDice) - 1;
  if (choice === "position" || choice === "combo") next.effects[side].nextDice = num(next.effects[side].nextDice) + 2;
  if (choice === "disarm" && disarmedGearId) next.effects[opp].disabledGearIds = [...new Set([...(next.effects[opp].disabledGearIds ?? []), String(disarmedGearId)])];
  const queue = [...(next.pendingManeuverQueue ?? [])];
  queue.shift();
  next.pendingManeuverQueue = queue;
  next.pendingManeuver = queue[0] ?? null;
  return next;
}

export function m6FinishConflictState(baseState, { text = "" } = {}) {
  const next = clone(baseState);
  const winnerSide = next?.outcome?.winner === "ranger" ? next.ranger : next.gm;
  next.compromise = {
    text: String(text ?? ""),
    grade: next?.outcome?.winner === "tie" ? "tie" : m6CompromiseGrade(winnerSide?.disposition?.start, winnerSide?.disposition?.current)
  };
  next.stage = "complete";
  next.active = false;
  return next;
}
