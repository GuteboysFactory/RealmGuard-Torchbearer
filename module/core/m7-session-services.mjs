const SYSTEM_ID = "realm-guard";

function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freeze));
  if (value && typeof value === "object") {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freeze(entry)])));
  }
  return value;
}

export class PhaseDefinition {
  constructor({ id, label, freeAllowance = 0, actionCurrencyId = "checks" } = {}) {
    this.id = String(id ?? "");
    this.label = String(label ?? this.id);
    this.freeAllowance = Math.max(0, Number(freeAllowance ?? 0));
    this.actionCurrencyId = String(actionCurrencyId ?? "checks");
    Object.freeze(this);
  }
}

export class SessionState {
  constructor({ enabled = true, phase = "gm", cycleId = 1, lastActorId = "", actors = [] } = {}) {
    this.enabled = Boolean(enabled);
    this.phase = String(phase || "gm") === "player" ? "player" : "gm";
    this.cycleId = Math.max(1, Number(cycleId || 1));
    this.lastActorId = String(lastActorId ?? "");
    this.actors = freeze(actors);
    Object.freeze(this);
  }
}

export class ActionCurrencyService {
  current(actor, currencyId = "checks") {
    if (currencyId !== "checks") return 0;
    return Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
  }

  previewSpend(actor, amount = 1, currencyId = "checks") {
    const current = this.current(actor, currencyId);
    const cost = Math.max(0, Number(amount ?? 0));
    return freeze({ currencyId, current, cost, after: Math.max(0, current - cost), affordable: current >= cost });
  }

  previewTransfer(donor, recipient, amount = 1, currencyId = "checks") {
    const qty = Math.max(1, Math.floor(Number(amount || 1)));
    const donorCurrent = this.current(donor, currencyId);
    const recipientCurrent = this.current(recipient, currencyId);
    return freeze({
      currencyId,
      amount: qty,
      donorCurrent,
      recipientCurrent,
      donorAfter: donorCurrent - qty,
      recipientAfter: recipientCurrent + qty,
      legal: donorCurrent >= qty && recipientCurrent <= 0 && donor?.id !== recipient?.id
    });
  }
}

export class PhaseAllowanceService {
  constructor({ playerFreeTests = 1 } = {}) {
    this.playerFreeTests = Math.max(0, Number(playerFreeTests ?? 1));
  }

  preview(actorState = {}, phase = "gm") {
    const playerPhase = phase === "player";
    const used = Boolean(actorState?.freeUsed);
    return freeze({
      id: "players-turn-free-test",
      phase,
      maximum: playerPhase ? this.playerFreeTests : 0,
      used: used ? 1 : 0,
      remaining: playerPhase && !used ? this.playerFreeTests : 0,
      available: playerPhase && !used
    });
  }
}

export class RewardAuthority {
  constructor({ mode = "GROUP_CONSENSUS_GM_COMMIT" } = {}) {
    this.mode = String(mode);
    Object.freeze(this);
  }
}

export class RewardEngine {
  constructor({ authority = new RewardAuthority() } = {}) {
    this.authority = authority;
  }

  proposal({ actorId = "", criteria = {}, mvpId = "", workhorseId = "" } = {}) {
    const accomplishedGoal = Boolean(criteria.personaGoal);
    const fate = Math.min(3,
      Number(Boolean(criteria.fateBelief)) +
      Number(Boolean(criteria.fateGoal) && !accomplishedGoal) +
      Number(Boolean(criteria.fateInstinct))
    );
    const personaRaw =
      Number(accomplishedGoal) +
      Number(Boolean(criteria.personaAgainstBelief)) +
      Number(Boolean(criteria.personaEmbodiment)) +
      Number(String(actorId) === String(mvpId) && Boolean(mvpId)) +
      Number(String(actorId) === String(workhorseId) && Boolean(workhorseId));
    return freeze({
      fate,
      persona: Math.min(4, personaRaw),
      personaRaw,
      goalFateSuppressed: Boolean(criteria.fateGoal) && accomplishedGoal,
      authority: this.authority.mode
    });
  }
}

export class SessionEngine {
  constructor({ actionCurrency = new ActionCurrencyService(), phaseAllowance = new PhaseAllowanceService() } = {}) {
    this.actionCurrency = actionCurrency;
    this.phaseAllowance = phaseAllowance;
  }

  previewTestClaim({ actor, actorState = {}, sessionState } = {}) {
    const state = sessionState instanceof SessionState ? sessionState : new SessionState(sessionState);
    if (!state.enabled) return freeze({ ok: true, tracked: false, source: "free-play", cost: 0 });
    if (actor?.type !== "character") return freeze({ ok: true, tracked: false, source: "npc", cost: 0 });
    if (state.phase !== "player") return freeze({ ok: true, tracked: false, source: "none", cost: 0 });
    if (Boolean(actorState?.done)) return freeze({ ok: false, reason: "done" });

    const active = state.actors.filter(entry => !entry.done);
    const solo = active.length <= 1;
    if (!solo && state.lastActorId && state.lastActorId === actor?.id) return freeze({ ok: false, reason: "alternation" });

    const allowance = this.phaseAllowance.preview(actorState, state.phase);
    if (allowance.available) return freeze({ ok: true, tracked: true, source: "free", cost: 0 });

    const spend = this.actionCurrency.previewSpend(actor, 1, "checks");
    if (!spend.affordable) return freeze({ ok: false, reason: "no-checks" });
    return freeze({ ok: true, tracked: true, source: "check", cost: 1, before: spend.current, after: spend.after });
  }
}

export function legacySessionSnapshot(gameRef = globalThis.game) {
  const game = gameRef;
  const read = (key, fallback) => {
    try { return game?.settings?.get?.(SYSTEM_ID, key) ?? fallback; }
    catch (_error) { return fallback; }
  };
  const cycleId = Math.max(1, Number(read("turnCycleId", 1) || 1));
  const actors = (game?.actors ?? []).filter?.(actor => actor.type === "character") ?? [];
  return new SessionState({
    enabled: Boolean(read("useTurnManager", true)),
    phase: read("turnPhase", "gm"),
    cycleId,
    lastActorId: String(read("playerTurnLastActor", "") || ""),
    actors: actors.map(actor => {
      const raw = actor?.getFlag?.(SYSTEM_ID, "playerTurnState") ?? {};
      const active = Number(raw?.turnId ?? 0) === cycleId;
      return {
        id: actor.id,
        name: actor.name,
        freeUsed: active ? Boolean(raw.freeUsed) : false,
        testsTaken: active ? Math.max(0, Number(raw.testsTaken ?? 0)) : 0,
        checksSpent: active ? Math.max(0, Number(raw.checksSpent ?? 0)) : 0,
        donatedGiven: active ? Math.max(0, Number(raw.donatedGiven ?? 0)) : 0,
        donatedReceived: active ? Math.max(0, Number(raw.donatedReceived ?? 0)) : 0,
        done: active ? Boolean(raw.done) : false,
        checks: Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0))
      };
    })
  });
}

export function createM7Services() {
  const actionCurrency = new ActionCurrencyService();
  const phaseAllowance = new PhaseAllowanceService();
  const rewardAuthority = new RewardAuthority();
  const rewardEngine = new RewardEngine({ authority: rewardAuthority });
  const sessionEngine = new SessionEngine({ actionCurrency, phaseAllowance });
  return Object.freeze({ actionCurrency, phaseAllowance, rewardAuthority, rewardEngine, sessionEngine });
}
