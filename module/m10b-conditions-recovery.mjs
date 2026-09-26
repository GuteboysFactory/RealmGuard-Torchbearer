import { getActiveProfileCapabilities, resolveProfileCapabilities } from "./rules-profile-service.mjs";

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

function method(kind, name, obstacle, dice, extra = {}) {
  return freeze({ kind, name, obstacle: Math.max(0, Number(obstacle ?? 0)), dice: Math.max(0, Number(dice ?? 0)), ...extra });
}

export const MG1E_FAMILY_CONDITION_DEFINITIONS = freeze({
  "Hungry & Thirsty": { name: "Hungry & Thirsty", source: "MG1E", rollModifier: 0, appliesTo: "none", disposition: { mode: "ALL_CONFLICTS", modifier: -1 } },
  Angry: { name: "Angry", source: "MG1E", rollModifier: 0, appliesTo: "none", disposition: { mode: "WILL_BASED_CONFLICTS", modifier: -1 } },
  Tired: { name: "Tired", source: "MG1E", rollModifier: 0, appliesTo: "none", disposition: { mode: "ALL_CONFLICTS", modifier: -1 } },
  Injured: { name: "Injured", source: "MG1E", rollModifier: -1, appliesTo: ["skills", "nature", "will", "health"], recoveryExemptions: ["will", "health"], excludedAbilities: ["resources", "circles"] },
  Sick: { name: "Sick", source: "MG1E", rollModifier: -1, appliesTo: ["skills", "nature", "will", "health"], recoveryExemptions: ["will", "health"], excludedAbilities: ["resources", "circles"] },
  Strained: { name: "Strained", source: "REALM_GUARD_V1_6", replaces: "Sick", rollModifier: -1, appliesTo: ["skills", "nature", "will", "health"], recoveryExemptions: ["will", "health"], excludedAbilities: ["resources", "circles"] }
});

export function buildM10BConditionRecoveryPolicy(capabilities) {
  const rules = capabilities?.rules ?? {};
  const conditionSet = Array.isArray(rules.conditions?.names) ? [...rules.conditions.names] : [];
  const recoveryOrder = Array.isArray(rules.recovery?.order) ? [...rules.recovery.order] : [];
  const adverseConditions = conditionSet.filter(name => normalize(name) !== "healthy");
  return freeze({
    phase: "M10B.4",
    profileId: String(capabilities?.profile?.id ?? ""),
    profileVersion: Number(capabilities?.profile?.version ?? 0),
    familySemantics: rules.recovery?.familySemantics === true && conditionSet.length > 0,
    conditionMode: String(rules.conditions?.mode ?? "PROFILE_DEFINED"),
    recoveryMode: String(rules.recovery?.mode ?? "PROFILE_DEFINED"),
    conditionSet,
    adverseConditions,
    recoveryOrder,
    replacements: rules.conditions?.replaces && typeof rules.conditions.replaces === "object" ? { ...rules.conditions.replaces } : {},
    excludedDefaults: Array.isArray(rules.conditions?.excludedDefaults) ? [...rules.conditions.excludedDefaults] : [],
    oneRecoveryTestPerConditionPerTurn: rules.recovery?.oneRecoveryTestPerConditionPerTurn === true,
    gmTurnCheckCost: Math.max(0, Number(rules.recovery?.gmTurnCheckCost ?? 2)),
    recovery: {
      hungryMethods: Array.isArray(rules.recovery?.hungryMethods) ? [...rules.recovery.hungryMethods] : [],
      hungry: rules.recovery?.hungry ? { ...rules.recovery.hungry } : null,
      angry: rules.recovery?.angry ? { ...rules.recovery.angry } : null,
      tired: rules.recovery?.tired ? { ...rules.recovery.tired } : null,
      injured: rules.recovery?.injured ? { ...rules.recovery.injured } : null,
      sick: rules.recovery?.sick ? { ...rules.recovery.sick } : null,
      strained: rules.recovery?.strained ? { ...rules.recovery.strained } : null
    },
    preserveDormantConditions: true,
    destructiveConversion: false
  });
}

export function getActiveM10BConditionRecoveryPolicy() {
  return buildM10BConditionRecoveryPolicy(getActiveProfileCapabilities());
}

export function resolveM10BConditionRecoveryPolicy(profileId) {
  return buildM10BConditionRecoveryPolicy(resolveProfileCapabilities(profileId));
}

export function familyHealthyState(actor, policy = getActiveM10BConditionRecoveryPolicy()) {
  const active = activeConditionNames(actor);
  const adverse = active.filter(name => policy.adverseConditions.some(entry => normalize(entry) === normalize(name)));
  const ignoredPreserved = active.filter(name => normalize(name) !== "healthy" && !policy.adverseConditions.some(entry => normalize(entry) === normalize(name)));
  return freeze({ healthy: adverse.length === 0, derived: true, activeAdverse: adverse, ignoredPreserved, healthyItemRequired: false });
}

export function familyConditionProvisionPlan(actor, policy = getActiveM10BConditionRecoveryPolicy()) {
  const items = itemsOf(actor).filter(item => item?.type === "condition");
  const byName = new Map(items.map(item => [normalize(item?.name), item]));
  const create = policy.adverseConditions.filter(name => !byName.has(normalize(name))).map(name => ({ name, definition: MG1E_FAMILY_CONDITION_DEFINITIONS[name] ?? null }));
  const preserveIgnored = items.filter(item => !policy.conditionSet.some(name => normalize(name) === normalize(item?.name)))
    .map(item => ({ id: item.id ?? null, name: String(item.name ?? ""), action: "PRESERVE_DORMANT_PROFILE_DATA" }));
  return freeze({ mode: "READ_ONLY_PROVISION_PLAN", writesPlanned: 0, create, preserveIgnored, healthy: familyHealthyState(actor, policy), destructive: false });
}

export function familyConditionRollEffects(actor, rollName, { isSkill = true, recovery = false } = {}, policy = getActiveM10BConditionRecoveryPolicy()) {
  const key = normalize(rollName);
  const applied = [];
  const ignored = [];
  for (const name of activeConditionNames(actor)) {
    const canonical = policy.adverseConditions.find(entry => normalize(entry) === normalize(name));
    if (!canonical) { ignored.push({ name, reason: "PRESERVED_DORMANT_PROFILE_CONDITION" }); continue; }
    const def = MG1E_FAMILY_CONDITION_DEFINITIONS[canonical];
    if (!def || Number(def.rollModifier ?? 0) === 0) continue;
    if (def.excludedAbilities?.some(entry => normalize(entry) === key)) continue;
    if (recovery && def.recoveryExemptions?.some(entry => normalize(entry) === key)) continue;
    const applies = Boolean(isSkill && def.appliesTo?.includes?.("skills")) || def.appliesTo?.some?.(entry => normalize(entry) === key);
    if (applies) applied.push({ name: canonical, dice: Number(def.rollModifier ?? 0) });
  }
  return freeze({ diceModifier: applied.reduce((sum, entry) => sum + entry.dice, 0), applied, ignored, healthy: familyHealthyState(actor, policy).healthy, liveApplication: false, profileId: policy.profileId });
}

export function familyConditionDispositionEffects(actor, { baseAbility = "" } = {}, policy = getActiveM10BConditionRecoveryPolicy()) {
  const effects = [];
  for (const name of activeConditionNames(actor)) {
    const canonical = policy.adverseConditions.find(entry => normalize(entry) === normalize(name));
    const rule = canonical ? MG1E_FAMILY_CONDITION_DEFINITIONS[canonical]?.disposition : null;
    if (rule && (rule.mode === "ALL_CONFLICTS" || (rule.mode === "WILL_BASED_CONFLICTS" && normalize(baseAbility) === "will"))) {
      effects.push({ name: canonical, disposition: Number(rule.modifier ?? 0), mode: rule.mode });
    }
  }
  return freeze({ dispositionModifier: effects.reduce((sum, entry) => sum + entry.disposition, 0), effects, liveApplication: false, profileId: policy.profileId });
}

export function familyZeroRatingPolicy({ baseRating = 0, conditionDice = 0 } = {}) {
  const base = Math.max(0, Number(baseRating ?? 0));
  const modified = Math.max(0, base + Number(conditionDice ?? 0));
  const zeroedByCondition = base > 0 && modified <= 0 && Number(conditionDice ?? 0) < 0;
  return freeze({ baseRating: base, conditionDice: Number(conditionDice ?? 0), modifiedRating: modified, zeroedByCondition, canTestNormally: modified > 0, teamworkAllowed: !zeroedByCondition, selfHelpAllowed: !zeroedByCondition, personaAllowed: !zeroedByCondition, beginnerLuckAllowed: !zeroedByCondition, natureRequiredIfTested: zeroedByCondition });
}

function recoveryRuleFor(conditionName, policy) {
  const key = normalize(conditionName);
  if (key === "hungry & thirsty") return policy.recovery.hungry;
  if (key === "angry") return policy.recovery.angry;
  if (key === "tired") return policy.recovery.tired;
  if (key === "injured") return policy.recovery.injured;
  if (key === "sick") return policy.recovery.sick;
  if (key === "strained") return policy.recovery.strained;
  return null;
}

export function familyRecoveryMethods(actor, conditionName, policy = getActiveM10BConditionRecoveryPolicy()) {
  if (!policy.familySemantics) return Object.freeze([]);
  const key = normalize(conditionName);
  if (key === "hungry & thirsty") {
    const names = policy.recovery.hungryMethods.length ? policy.recovery.hungryMethods : ["Harvester", "Cook", "Brewer", "Baker", "Resources"];
    const obstacle = Math.max(0, Number(policy.recovery.hungry?.obstacle ?? 1));
    return freeze(names.map(name => {
      if (normalize(name) === "resources") return method("ability", "Resources", obstacle, abilityRating(actor, "Resources"), { helpAllowed: true });
      if (normalize(name).startsWith("narrative")) return method("narrative", "Fed by family, friend or mentor", 0, 0, { testRequired: false, helpAllowed: false });
      return method("skill", name, obstacle, roleRating(actor, name), { helpAllowed: true });
    }));
  }
  if (key === "tired") {
    const rule = recoveryRuleFor(conditionName, policy) ?? {};
    const out = [method("ability", rule.recoveryAbility ?? "Health", rule.obstacle ?? 3, abilityRating(actor, rule.recoveryAbility ?? "Health"), { helpAllowed: rule.helpAllowed !== false })];
    if (rule.goodRest) {
      out.push(method("ability", "Resources", rule.resourcesObstacle ?? 2, abilityRating(actor, "Resources"), { purpose: "GOOD_NIGHTS_REST", helpAllowed: true }));
      out.push(method("narrative", "Good night's rest from an appropriate host", 0, 0, { purpose: "GOOD_NIGHTS_REST", testRequired: false, helpAllowed: false }));
    }
    return freeze(out);
  }
  const rule = recoveryRuleFor(conditionName, policy);
  if (!rule?.recoveryAbility) return Object.freeze([]);
  return freeze([method("ability", rule.recoveryAbility, rule.obstacle ?? 0, abilityRating(actor, rule.recoveryAbility), { helpAllowed: rule.helpAllowed !== false })]);
}

export function familyRecoveryHelpPolicy({ methodKind = "", methodName = "" } = {}) {
  const blocked = normalize(methodKind) === "ability" && ["will", "health"].includes(normalize(methodName));
  return freeze({ helpAllowed: !blocked, reasonCode: blocked ? "NO_HELP_ON_WILL_HEALTH_RECOVERY" : "NORMAL_HELP_RULES", synergyAllowed: false });
}

export function familyRecoveryBlocker(actor, conditionName, policy = getActiveM10BConditionRecoveryPolicy()) {
  const targetIndex = policy.recoveryOrder.findIndex(name => normalize(name) === normalize(conditionName));
  if (targetIndex < 0) return null;
  const active = activeConditionNames(actor);
  for (let i = 0; i < targetIndex; i += 1) {
    const blocker = active.find(name => normalize(name) === normalize(policy.recoveryOrder[i]));
    if (blocker) return freeze({ name: policy.recoveryOrder[i], reasonCode: "RECOVERY_ORDER" });
  }
  return null;
}

export function familyRecoveryEconomy({ phase = "free", turnManagerEnabled = false, checks = 0, kind = "TEST" } = {}, policy = getActiveM10BConditionRecoveryPolicy()) {
  const available = Math.max(0, Number(checks ?? 0));
  if (!turnManagerEnabled) return freeze({ phase: "free", kind, costChecks: 0, availableChecks: available, affordable: true, source: "FREE_PLAY" });
  if (String(phase) === "gm") {
    const cost = Math.max(0, Number(policy.gmTurnCheckCost ?? 2));
    return freeze({ phase: "gm", kind, costChecks: cost, availableChecks: available, affordable: available >= cost, source: kind === "COUNSEL" ? "GM_COUNSEL_CHECKS" : "GM_RECOVERY_CHECKS" });
  }
  return freeze({ phase: "player", kind, costChecks: null, availableChecks: available, affordable: true, source: "PLAYERS_TURN_NORMAL_TEST_ECONOMY" });
}

export function familyRecoveryState(conditionName, { priorState = "NORMAL", passed = null, route = "PRIMARY", phase = "free", turnManagerEnabled = false, checks = 0 } = {}, policy = getActiveM10BConditionRecoveryPolicy()) {
  const key = normalize(conditionName);
  const state = String(priorState ?? "NORMAL").toUpperCase();
  if (!(passed === true || passed === false)) return freeze({ conditionName, state, activeAfter: true, nextAction: "TEST_OR_ROUTE_REQUIRED", liveApplication: false, profileId: policy.profileId });
  const rule = recoveryRuleFor(conditionName, policy) ?? {};
  const healerFlow = ["injured", "sick"].includes(key) && String(rule.failedRecovery ?? "").toUpperCase() === "HEALER_REQUIRED";
  if (healerFlow) {
    if (String(route).toUpperCase() === "HEALER") {
      return passed
        ? freeze({ conditionName, state: "RECOVERED", activeAfter: false, nextAction: "NONE", liveApplication: false, profileId: policy.profileId })
        : freeze({ conditionName, state: "PERMANENT_REDUCTION_REQUIRED", activeAfter: false, nextAction: "GM_SELECT_PERMANENT_REDUCTION", excludedTargets: [...(rule.permanentReductionExcludes ?? ["Resources", "Circles"])], liveApplication: false, profileId: policy.profileId });
    }
    return passed
      ? freeze({ conditionName, state: "RECOVERED", activeAfter: false, nextAction: "NONE", liveApplication: false, profileId: policy.profileId })
      : freeze({ conditionName, state: "HEALER_REQUIRED", activeAfter: true, nextAction: "HEALER_OB3_OR_PLAYERS_TURN_WAIVE", healerObstacle: Number(rule.healerObstacle ?? 3), liveApplication: false, profileId: policy.profileId });
  }
  if (key === "strained" && String(rule.failedRecovery ?? "").toUpperCase() === "COUNSEL_FROM_FRIEND") {
    if (String(route).toUpperCase() === "COUNSEL") {
      const economy = familyRecoveryEconomy({ phase, turnManagerEnabled, checks, kind: "COUNSEL" }, policy);
      return freeze({ conditionName, state: economy.affordable ? "RECOVERED" : "COUNSEL_REQUIRED", activeAfter: !economy.affordable, nextAction: economy.affordable ? "NONE" : "NEED_2_CHECKS_IN_GM_TURN", economy, liveApplication: false, profileId: policy.profileId });
    }
    return passed
      ? freeze({ conditionName, state: "RECOVERED", activeAfter: false, nextAction: "NONE", liveApplication: false, profileId: policy.profileId })
      : freeze({ conditionName, state: "COUNSEL_REQUIRED", activeAfter: true, nextAction: "SEEK_COUNSEL_FROM_FRIEND", liveApplication: false, profileId: policy.profileId });
  }
  return passed
    ? freeze({ conditionName, state: "RECOVERED", activeAfter: false, nextAction: "NONE", liveApplication: false, profileId: policy.profileId })
    : freeze({ conditionName, state: state === "NORMAL" ? "REMAINS_ACTIVE" : state, activeAfter: true, nextAction: "RETRY_WHEN_ALLOWED", liveApplication: false, profileId: policy.profileId });
}

export function familyPermanentConditionWaiverPlan(conditionName, { phase = "free" } = {}, policy = getActiveM10BConditionRecoveryPolicy()) {
  const rule = recoveryRuleFor(conditionName, policy) ?? {};
  const allowed = String(phase) === "player" && rule.playersTurnWaiver !== false;
  return freeze({ conditionName, allowed, phase: String(phase), checkCost: allowed ? 0 : null, testRequired: false, clearCondition: allowed, nextState: allowed ? "PERMANENT_REDUCTION_REQUIRED" : "HEALER_REQUIRED", excludedTargets: [...(rule.permanentReductionExcludes ?? ["Resources", "Circles"])], liveApplication: false, profileId: policy.profileId });
}

export function familyPermanentReductionTargets(actor) {
  const abilities = ["Nature", "Will", "Health"].map(name => ({ kind: "ability", name, rating: abilityRating(actor, name) })).filter(entry => entry.rating > 0);
  const skills = itemsOf(actor).filter(item => item?.type === "role" && Number(item?.system?.rating ?? 0) > 0).map(item => ({ kind: "skill", id: item.id ?? null, name: String(item.name ?? "Skill"), rating: Number(item.system.rating ?? 0) }));
  return freeze({ abilities, skills, excluded: ["Resources", "Circles"], gmChoiceRequired: true, autoSelect: false });
}

export function familyLesserConditionOptions(mainConditionName, policy = getActiveM10BConditionRecoveryPolicy()) {
  const index = policy.recoveryOrder.findIndex(name => normalize(name) === normalize(mainConditionName));
  const options = index > 0 ? policy.recoveryOrder.slice(0, index) : [];
  return freeze({ mainCondition: String(mainConditionName ?? ""), options, gmChoiceRequired: options.length > 0, autoApply: false, freshAllowed: false, afraidAllowed: false });
}

export function familyHelperConsequenceResolution(contract, { mainConditionName = "" } = {}, policy = getActiveM10BConditionRecoveryPolicy()) {
  const active = Boolean(contract?.active);
  const lesser = familyLesserConditionOptions(mainConditionName, policy);
  return freeze({ kind: "MG1E_FAMILY_HELPER_CONSEQUENCE_RESOLUTION", active, helperActorId: String(contract?.helperActorId ?? ""), helperActorName: String(contract?.helperActorName ?? ""), mainConditionName: String(mainConditionName ?? ""), options: active ? lesser.options : [], gmChoiceRequired: active && lesser.gmChoiceRequired, autoApply: false, liveApplication: false, profileId: policy.profileId });
}

export function getM10B4ConditionsRecoveryStatus() {
  const policy = getActiveM10BConditionRecoveryPolicy();
  return freeze({ phase: "M10B.4", activeProfileId: policy.profileId, familySemantics: policy.familySemantics, conditionSet: policy.conditionSet, recoveryOrder: policy.recoveryOrder, gmTurnCheckCost: policy.gmTurnCheckCost, destructiveConversion: false, preserveDormantConditions: true });
}
