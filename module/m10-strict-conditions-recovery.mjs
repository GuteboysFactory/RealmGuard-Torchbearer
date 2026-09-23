const STRICT_ADVERSE_CONDITIONS = Object.freeze([
  "Hungry & Thirsty",
  "Angry",
  "Tired",
  "Injured",
  "Strained"
]);

export const STRICT_CONDITION_SET = Object.freeze([
  "Healthy",
  ...STRICT_ADVERSE_CONDITIONS
]);

export const STRICT_RECOVERY_ORDER = Object.freeze([...STRICT_ADVERSE_CONDITIONS]);

export const STRICT_IGNORED_LEGACY_CONDITIONS = Object.freeze(["Fresh", "Afraid"]);

export const STRICT_CONDITION_DEFINITIONS = Object.freeze({
  "Hungry & Thirsty": Object.freeze({
    name: "Hungry & Thirsty",
    source: "MG1E",
    rollModifier: 0,
    appliesTo: "none",
    disposition: Object.freeze({ mode: "ALL_CONFLICTS", modifier: -1 })
  }),
  Angry: Object.freeze({
    name: "Angry",
    source: "MG1E",
    rollModifier: 0,
    appliesTo: "none",
    disposition: Object.freeze({ mode: "WILL_BASED_CONFLICTS", modifier: -1 })
  }),
  Tired: Object.freeze({
    name: "Tired",
    source: "MG1E",
    rollModifier: 0,
    appliesTo: "none",
    disposition: Object.freeze({ mode: "ALL_CONFLICTS", modifier: -1 })
  }),
  Injured: Object.freeze({
    name: "Injured",
    source: "MG1E",
    rollModifier: -1,
    appliesTo: Object.freeze(["skills", "nature", "will", "health"]),
    recoveryExemptions: Object.freeze(["will", "health"]),
    excludedAbilities: Object.freeze(["resources", "circles"])
  }),
  Strained: Object.freeze({
    name: "Strained",
    source: "REALM_GUARD_V1_6",
    replaces: "Sick",
    rollModifier: -1,
    appliesTo: Object.freeze(["skills", "nature", "will", "health"]),
    recoveryExemptions: Object.freeze(["will", "health"]),
    excludedAbilities: Object.freeze(["resources", "circles"])
  })
});

const normalize = value => String(value ?? "").trim().toLowerCase();

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function itemsOf(actor) {
  if (Array.isArray(actor?.items?.contents)) return actor.items.contents;
  try { return Array.from(actor?.items ?? []); } catch (_error) { return []; }
}

function activeConditionNames(actor) {
  return itemsOf(actor)
    .filter(item => item?.type === "condition" && Boolean(item?.system?.active))
    .map(item => String(item?.name ?? ""));
}

function roleRating(actor, name) {
  const role = itemsOf(actor).find(item => item?.type === "role" && normalize(item?.name) === normalize(name));
  return Math.max(0, Number(role?.system?.rating ?? 0));
}

function abilityRating(actor, name) {
  return Math.max(0, Number(actor?.system?.attributes?.[normalize(name)]?.value ?? 0));
}

export function strictHealthyState(actor) {
  const active = activeConditionNames(actor);
  const adverse = active.filter(name => STRICT_ADVERSE_CONDITIONS.some(strict => normalize(strict) === normalize(name)));
  const ignoredPreserved = active.filter(name => STRICT_IGNORED_LEGACY_CONDITIONS.some(strict => normalize(strict) === normalize(name)));
  return freeze({
    healthy: adverse.length === 0,
    derived: true,
    activeAdverse: adverse,
    ignoredPreserved,
    healthyItemRequired: false
  });
}

export function strictConditionProvisionPlan(actor) {
  const items = itemsOf(actor).filter(item => item?.type === "condition");
  const byName = new Map(items.map(item => [normalize(item?.name), item]));
  const create = STRICT_ADVERSE_CONDITIONS
    .filter(name => !byName.has(normalize(name)))
    .map(name => ({ name, definition: STRICT_CONDITION_DEFINITIONS[name] }));
  const preserveIgnored = STRICT_IGNORED_LEGACY_CONDITIONS
    .filter(name => byName.has(normalize(name)))
    .map(name => ({ id: byName.get(normalize(name))?.id ?? null, name, action: "PRESERVE_NO_STRICT_EFFECT" }));
  const sick = byName.get("sick");
  return freeze({
    mode: "READ_ONLY_PROVISION_PLAN",
    writesPlanned: 0,
    create,
    preserveIgnored,
    sick: sick ? { id: sick.id ?? null, name: String(sick.name ?? "Sick"), action: "PRESERVE_FOR_EXPLICIT_CONVERSION_REVIEW" } : null,
    healthy: strictHealthyState(actor),
    destructive: false
  });
}

export function strictConditionRollEffects(actor, rollName, { isSkill = true, recovery = false } = {}) {
  const key = normalize(rollName);
  const active = activeConditionNames(actor);
  const applied = [];
  const ignored = [];

  for (const name of active) {
    if (STRICT_IGNORED_LEGACY_CONDITIONS.some(entry => normalize(entry) === normalize(name))) {
      ignored.push({ name, reason: "PRESERVED_LEGACY_NON_STRICT_CONDITION" });
      continue;
    }
    const canonical = STRICT_ADVERSE_CONDITIONS.find(entry => normalize(entry) === normalize(name));
    if (!canonical) continue;
    const def = STRICT_CONDITION_DEFINITIONS[canonical];
    if (!def || Number(def.rollModifier ?? 0) === 0) continue;
    if (def.excludedAbilities?.some(entry => normalize(entry) === key)) continue;
    if (recovery && def.recoveryExemptions?.some(entry => normalize(entry) === key)) continue;
    const applies = Boolean(isSkill && def.appliesTo?.includes?.("skills"))
      || def.appliesTo?.some?.(entry => normalize(entry) === key);
    if (!applies) continue;
    applied.push({ name: canonical, dice: Number(def.rollModifier ?? 0) });
  }

  return freeze({
    diceModifier: applied.reduce((sum, entry) => sum + entry.dice, 0),
    applied,
    ignored,
    healthy: strictHealthyState(actor).healthy,
    liveApplication: false
  });
}

export function strictConditionDispositionEffects(actor, { baseAbility = "" } = {}) {
  const active = activeConditionNames(actor);
  const effects = [];
  for (const name of active) {
    const canonical = STRICT_ADVERSE_CONDITIONS.find(entry => normalize(entry) === normalize(name));
    const rule = canonical ? STRICT_CONDITION_DEFINITIONS[canonical]?.disposition : null;
    if (!rule) continue;
    if (rule.mode === "ALL_CONFLICTS" || (rule.mode === "WILL_BASED_CONFLICTS" && normalize(baseAbility) === "will")) {
      effects.push({ name: canonical, disposition: Number(rule.modifier ?? 0), mode: rule.mode });
    }
  }
  return freeze({
    dispositionModifier: effects.reduce((sum, entry) => sum + entry.disposition, 0),
    effects,
    liveApplication: false
  });
}

export function strictZeroRatingPolicy({ baseRating = 0, conditionDice = 0 } = {}) {
  const base = Math.max(0, Number(baseRating ?? 0));
  const modified = Math.max(0, base + Number(conditionDice ?? 0));
  const zeroedByCondition = base > 0 && modified <= 0 && Number(conditionDice ?? 0) < 0;
  return freeze({
    baseRating: base,
    conditionDice: Number(conditionDice ?? 0),
    modifiedRating: modified,
    zeroedByCondition,
    canTestNormally: modified > 0,
    teamworkAllowed: !zeroedByCondition,
    selfHelpAllowed: !zeroedByCondition,
    personaAllowed: !zeroedByCondition,
    beginnerLuckAllowed: !zeroedByCondition,
    natureRequiredIfTested: zeroedByCondition
  });
}

function method(kind, name, obstacle, dice, extra = {}) {
  return freeze({
    kind,
    name,
    obstacle,
    dice: Math.max(0, Number(dice ?? 0)),
    ...extra
  });
}

export function strictRecoveryMethods(actor, conditionName) {
  const key = normalize(conditionName);
  if (key === "hungry & thirsty") {
    return freeze([
      method("skill", "Harvester", 1, roleRating(actor, "Harvester"), { helpAllowed: true }),
      method("skill", "Cook", 1, roleRating(actor, "Cook"), { helpAllowed: true }),
      method("skill", "Brewer", 1, roleRating(actor, "Brewer"), { helpAllowed: true }),
      method("skill", "Baker", 1, roleRating(actor, "Baker"), { helpAllowed: true }),
      method("ability", "Resources", 1, abilityRating(actor, "Resources"), { helpAllowed: true }),
      method("narrative", "Fed by family, friend or mentor", 0, 0, { testRequired: false, helpAllowed: false })
    ]);
  }
  if (key === "angry") return freeze([method("ability", "Will", 2, abilityRating(actor, "Will"), { helpAllowed: false })]);
  if (key === "tired") {
    return freeze([
      method("ability", "Health", 3, abilityRating(actor, "Health"), { helpAllowed: false }),
      method("ability", "Resources", 2, abilityRating(actor, "Resources"), { purpose: "GOOD_NIGHTS_REST", helpAllowed: true }),
      method("narrative", "Good night's rest from an appropriate host", 0, 0, { purpose: "GOOD_NIGHTS_REST", testRequired: false, helpAllowed: false })
    ]);
  }
  if (key === "injured") return freeze([method("ability", "Health", 4, abilityRating(actor, "Health"), { helpAllowed: false })]);
  if (key === "strained") return freeze([method("ability", "Will", 4, abilityRating(actor, "Will"), { helpAllowed: false })]);
  return Object.freeze([]);
}

export function strictRecoveryHelpPolicy({ methodKind = "", methodName = "" } = {}) {
  const kind = normalize(methodKind);
  const name = normalize(methodName);
  const blocked = kind === "ability" && (name === "will" || name === "health");
  return freeze({
    helpAllowed: !blocked,
    reasonCode: blocked ? "NO_HELP_ON_WILL_HEALTH_RECOVERY" : "NORMAL_HELP_RULES",
    synergyAllowed: false
  });
}

export function strictRecoveryBlocker(actor, conditionName) {
  const targetIndex = STRICT_RECOVERY_ORDER.findIndex(name => normalize(name) === normalize(conditionName));
  if (targetIndex < 0) return null;
  const active = activeConditionNames(actor);
  for (let i = 0; i < targetIndex; i += 1) {
    const blocker = active.find(name => normalize(name) === normalize(STRICT_RECOVERY_ORDER[i]));
    if (blocker) return freeze({ name: STRICT_RECOVERY_ORDER[i], reasonCode: "RECOVERY_ORDER" });
  }
  return null;
}

export function strictRecoveryEconomy({ phase = "free", turnManagerEnabled = false, checks = 0, kind = "TEST" } = {}) {
  const available = Math.max(0, Number(checks ?? 0));
  if (!turnManagerEnabled) return freeze({ phase: "free", kind, costChecks: 0, availableChecks: available, affordable: true, source: "FREE_PLAY" });
  if (String(phase) === "gm") {
    const cost = 2;
    return freeze({ phase: "gm", kind, costChecks: cost, availableChecks: available, affordable: available >= cost, source: kind === "COUNSEL" ? "GM_COUNSEL_CHECKS" : "GM_RECOVERY_CHECKS" });
  }
  return freeze({ phase: "player", kind, costChecks: null, availableChecks: available, affordable: true, source: "PLAYERS_TURN_NORMAL_TEST_ECONOMY" });
}

export function strictRecoveryState(conditionName, { priorState = "NORMAL", passed = null, route = "PRIMARY", phase = "free", turnManagerEnabled = false, checks = 0 } = {}) {
  const key = normalize(conditionName);
  const state = String(priorState ?? "NORMAL").toUpperCase();
  const resultKnown = passed === true || passed === false;
  if (!resultKnown) return freeze({ conditionName, state, activeAfter: true, nextAction: "TEST_OR_ROUTE_REQUIRED", liveApplication: false });

  if (key === "injured") {
    if (route === "HEALER") {
      return passed
        ? freeze({ conditionName: "Injured", state: "RECOVERED", activeAfter: false, nextAction: "NONE", liveApplication: false })
        : freeze({ conditionName: "Injured", state: "PERMANENT_REDUCTION_REQUIRED", activeAfter: false, nextAction: "GM_SELECT_PERMANENT_REDUCTION", excludedTargets: ["Resources", "Circles"], liveApplication: false });
    }
    return passed
      ? freeze({ conditionName: "Injured", state: "RECOVERED", activeAfter: false, nextAction: "NONE", liveApplication: false })
      : freeze({ conditionName: "Injured", state: "HEALER_REQUIRED", activeAfter: true, nextAction: "HEALER_OB3_OR_PLAYERS_TURN_WAIVE", healerObstacle: 3, liveApplication: false });
  }

  if (key === "strained") {
    if (route === "COUNSEL") {
      const economy = strictRecoveryEconomy({ phase, turnManagerEnabled, checks, kind: "COUNSEL" });
      return freeze({
        conditionName: "Strained",
        state: economy.affordable ? "RECOVERED" : "COUNSEL_REQUIRED",
        activeAfter: !economy.affordable,
        nextAction: economy.affordable ? "NONE" : "NEED_2_CHECKS_IN_GM_TURN",
        economy,
        liveApplication: false
      });
    }
    return passed
      ? freeze({ conditionName: "Strained", state: "RECOVERED", activeAfter: false, nextAction: "NONE", liveApplication: false })
      : freeze({ conditionName: "Strained", state: "COUNSEL_REQUIRED", activeAfter: true, nextAction: "SEEK_COUNSEL_FROM_FRIEND", liveApplication: false });
  }

  return passed
    ? freeze({ conditionName, state: "RECOVERED", activeAfter: false, nextAction: "NONE", liveApplication: false })
    : freeze({ conditionName, state: state === "NORMAL" ? "REMAINS_ACTIVE" : state, activeAfter: true, nextAction: "RETRY_WHEN_ALLOWED", liveApplication: false });
}

export function strictInjuryWaiverPlan({ phase = "free" } = {}) {
  const allowed = String(phase) === "player";
  return freeze({
    allowed,
    phase: String(phase),
    checkCost: allowed ? 0 : null,
    testRequired: false,
    clearInjured: allowed,
    nextState: allowed ? "PERMANENT_REDUCTION_REQUIRED" : "HEALER_REQUIRED",
    excludedTargets: ["Resources", "Circles"],
    liveApplication: false
  });
}

export function strictPermanentReductionTargets(actor) {
  const abilities = ["Nature", "Will", "Health"]
    .map(name => ({ kind: "ability", name, rating: abilityRating(actor, name) }))
    .filter(entry => entry.rating > 0);
  const skills = itemsOf(actor)
    .filter(item => item?.type === "role" && Number(item?.system?.rating ?? 0) > 0)
    .map(item => ({ kind: "skill", id: item.id ?? null, name: String(item.name ?? "Skill"), rating: Number(item.system.rating ?? 0) }));
  return freeze({
    abilities,
    skills,
    excluded: ["Resources", "Circles"],
    gmChoiceRequired: true,
    autoSelect: false
  });
}

const LESSER_BY_MAIN = Object.freeze({
  "hungry & thirsty": Object.freeze([]),
  angry: Object.freeze(["Hungry & Thirsty"]),
  tired: Object.freeze(["Hungry & Thirsty", "Angry"]),
  injured: Object.freeze(["Hungry & Thirsty", "Angry", "Tired"]),
  strained: Object.freeze(["Hungry & Thirsty", "Angry", "Tired", "Injured"])
});

export function strictLesserConditionOptions(mainConditionName) {
  const options = LESSER_BY_MAIN[normalize(mainConditionName)] ?? Object.freeze([]);
  return freeze({
    mainCondition: String(mainConditionName ?? ""),
    options: [...options],
    gmChoiceRequired: options.length > 0,
    autoApply: false,
    freshAllowed: false,
    afraidAllowed: false
  });
}

export function strictHelperConsequenceResolution(contract, { mainConditionName = "" } = {}) {
  const active = Boolean(contract?.active);
  const lesser = strictLesserConditionOptions(mainConditionName);
  return freeze({
    kind: "STRICT_HELPER_CONSEQUENCE_RESOLUTION",
    active,
    helperActorId: String(contract?.helperActorId ?? ""),
    helperActorName: String(contract?.helperActorName ?? ""),
    mainConditionName: String(mainConditionName ?? ""),
    options: active ? lesser.options : [],
    gmChoiceRequired: active && lesser.gmChoiceRequired,
    autoApply: false,
    liveApplication: false
  });
}

export function getStrictConditionsRecoveryStatus() {
  return freeze({
    phase: "M10A.3",
    liveAuthority: false,
    activeProfileRequired: "realm-guard-strict",
    conditions: {
      healthy: "DERIVED",
      adverse: [...STRICT_ADVERSE_CONDITIONS],
      ignoredLegacyPreserved: [...STRICT_IGNORED_LEGACY_CONDITIONS],
      sickReplacement: "Strained"
    },
    recovery: {
      order: [...STRICT_RECOVERY_ORDER],
      hungryIncludesHarvester: true,
      tiredGoodRest: true,
      injuredHealerFlow: true,
      strainedCounselFlow: true,
      willHealthRecoveryHelp: false,
      gmTurnRecoveryCheckCost: 2,
      helperLesserConditionResolver: true
    },
    writesActors: false,
    writesItems: false,
    nextStep: "M10A.4 Gear / Inventory / Conflict Ownership"
  });
}
