import { resolveRulesProfile } from "./rules-profile-service.mjs";
import { MG1E_NATURAL_ORDER_DEFINITION } from "./profiles/mg1e-natural-order.mjs";
import { MG2E_NATURAL_ORDER_DEFINITION } from "./profiles/mg2e-natural-order.mjs";
import { REALM_GUARD_STRICT_SCALE_DEFINITION } from "./profiles/realm-guard-strict-scale.mjs";

const DEFINITIONS = new Map([
  ["mg1e", MG1E_NATURAL_ORDER_DEFINITION],
  ["mg2e", MG2E_NATURAL_ORDER_DEFINITION],
  ["realm-guard-strict", REALM_GUARD_STRICT_SCALE_DEFINITION]
]);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function norm(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
}

function clampRank(value, min, max) {
  const rank = Math.trunc(Number(value ?? 0));
  return Number.isFinite(rank) && rank >= min && rank <= max ? rank : null;
}

function definitionFor(profileId = null) {
  const { profile } = resolveRulesProfile(profileId);
  return { profile, definition: DEFINITIONS.get(profile.id) ?? null };
}

function canonicalName(definition, value) {
  const raw = String(value ?? "").trim();
  if (!raw || !definition) return "";
  const alias = definition.aliases?.[norm(raw)];
  return alias ?? raw;
}

export function resolveComparativeScaleDefinition(profileId = null) {
  return definitionFor(profileId).definition;
}

export function resolveM10BComparativeScalePolicy(profileId = null) {
  const { profile, definition } = definitionFor(profileId);
  const foundationOnly = profile.metadata?.foundationOnly === true;
  return freeze({
    phase: "M10B.8",
    profileId: profile.id,
    profileVersion: profile.version,
    rulesSnapshotHash: profile.rulesSnapshotHash,
    foundationOnly,
    selectable: profile.metadata?.selectable !== false,
    supported: profile.metadata?.supported !== false,
    enabled: Boolean(definition),
    scaleId: definition?.id ?? "",
    name: definition?.name ?? "",
    profileDomain: definition?.domain ?? "",
    mode: definition ? "PROFILE_DEFINED" : "NONE",
    source: definition?.source ?? "",
    sourceVersion: definition?.sourceVersion ?? "",
    rankMin: definition?.rankMin ?? 0,
    rankMax: definition?.rankMax ?? 0,
    baseActorKind: definition?.baseActorKind ?? "",
    baseRank: definition?.baseRank ?? null,
    outcomePolicy: definition ? "RANK_DIFFERENCE" : "NONE",
    groupWarMode: definition?.groupWar?.skill ? "PROFILE_DEFINED" : "NONE",
    specialSkillMode: definition?.special?.mode ?? "NONE",
    effectiveRankMode: definition?.effectiveRank?.mode ?? "NONE",
    itemScaleGuidance: definition?.itemScale?.mode ?? "NONE",
    liveApplication: false,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 }
  });
}

export function familyScaleRankFor(profileId, value) {
  const definition = resolveComparativeScaleDefinition(profileId);
  if (!definition) return null;
  const numeric = clampRank(value, definition.rankMin, definition.rankMax);
  if (numeric) return numeric;
  const target = norm(canonicalName(definition, value));
  for (const [rankText, entries] of Object.entries(definition.orderedRanks ?? {})) {
    if ((entries ?? []).some(name => norm(name) === target)) return Number(rankText);
  }
  return null;
}

export function familyScaleEntry(profileId, value) {
  const definition = resolveComparativeScaleDefinition(profileId);
  if (!definition) return freeze({
    ok: false,
    profileId: String(profileId ?? ""),
    input: String(value ?? ""),
    name: "",
    rank: null,
    reasonCode: "NO_COMPARATIVE_SCALE",
    liveApplication: false
  });
  const name = canonicalName(definition, value);
  const rank = familyScaleRankFor(profileId, name);
  return freeze({
    ok: Boolean(rank),
    profileId: definition.profileId,
    scaleId: definition.id,
    input: String(value ?? ""),
    name: rank ? name : "",
    rank,
    source: definition.source,
    sourceVersion: definition.sourceVersion,
    manualIfUnknown: !rank,
    liveApplication: false
  });
}

export function familyScaleOutcomePlan(profileId, { actorRank = null, actorType = null, targetRank = null, targetType = null } = {}) {
  const definition = resolveComparativeScaleDefinition(profileId);
  if (!definition) return freeze({ ok:false, reasonCode:"NO_COMPARATIVE_SCALE", liveApplication:false });
  const fromRank = clampRank(actorRank, definition.rankMin, definition.rankMax)
    ?? familyScaleRankFor(profileId, actorType || definition.baseActorKind);
  const toRank = clampRank(targetRank, definition.rankMin, definition.rankMax)
    ?? familyScaleRankFor(profileId, targetType);
  if (!fromRank || !toRank) return freeze({
    ok:false,
    reasonCode:"UNKNOWN_SCALE_RANK",
    actorRank:fromRank,
    targetRank:toRank,
    source:definition.source,
    liveApplication:false
  });
  const difference = toRank - fromRank;
  const rules = definition.outcomeRules;
  return freeze({
    ok:true,
    profileId:definition.profileId,
    scaleId:definition.id,
    source:definition.source,
    sourceVersion:definition.sourceVersion,
    skillScope:[...(rules?.skills ?? [])],
    actorRank:fromRank,
    targetRank:toRank,
    rankDifference:difference,
    killAllowed:difference <= Number(rules?.killMaximumHigherRanks ?? 1),
    captureAllowed:difference <= Number(rules?.captureMaximumHigherRanks ?? 2),
    injureAllowed:difference <= Number(rules?.injureMaximumHigherRanks ?? 2),
    runOffAllowed:rules?.runOffAlwaysAllowed !== false,
    tableFictionStillRequired:true,
    liveApplication:false
  });
}

export function familyScaleGroupWarPlan(profileId, { armyRank = null, armyType = null, targetRank = null, targetType = null, forceSize = 0 } = {}) {
  const definition = resolveComparativeScaleDefinition(profileId);
  const war = definition?.groupWar;
  if (!definition || !war) return freeze({ ok:false, reasonCode:"NO_GROUP_WAR_RULE", liveApplication:false });
  const fromRank = clampRank(armyRank, definition.rankMin, definition.rankMax)
    ?? familyScaleRankFor(profileId, armyType || war.baseActorKind || definition.baseActorKind);
  const toRank = clampRank(targetRank, definition.rankMin, definition.rankMax)
    ?? familyScaleRankFor(profileId, targetType);
  if (!fromRank || !toRank) return freeze({
    ok:false, reasonCode:"UNKNOWN_SCALE_RANK", armyRank:fromRank, targetRank:toRank, source:definition.source, liveApplication:false
  });
  const difference = toRank - fromRank;
  const force = Math.max(0, Math.trunc(Number(forceSize ?? 0)));
  const specialRequired = difference >= Number(war.specialFromDifference ?? 2);
  const minimumForce = specialRequired ? Number(war.minimumForceByDifference?.[difference] ?? 0) : 0;
  const thresholdDefined = !specialRequired || minimumForce > 0;
  return freeze({
    ok:true,
    profileId:definition.profileId,
    scaleId:definition.id,
    source:definition.source,
    skill:war.skill,
    armyRank:fromRank,
    targetRank:toRank,
    rankDifference:difference,
    majorityCreatureTypeDeterminesArmyRank:war.majorityCreatureTypeDeterminesArmyRank === true,
    specialRequired,
    minimumForce,
    thresholdDefined,
    forceSize:force,
    eligible:!specialRequired || (thresholdDefined && force >= minimumForce),
    reasonCode:!specialRequired ? "NORMAL_SCALE_RANGE" : !thresholdDefined ? "NO_SOURCE_THRESHOLD" : force >= minimumForce ? "FORCE_SUFFICIENT" : "INSUFFICIENT_FORCE",
    liveApplication:false
  });
}

export function familyScaleSpecialPlan(profileId, { actorRank = null, actorType = null, targetRank = null, targetType = null, targetNature = 0 } = {}) {
  const definition = resolveComparativeScaleDefinition(profileId);
  const special = definition?.special;
  if (!definition || !special || special.mode === "NONE") return freeze({ ok:false, reasonCode:"NO_SPECIAL_SCALE_RULE", liveApplication:false });
  const fromRank = clampRank(actorRank, definition.rankMin, definition.rankMax)
    ?? familyScaleRankFor(profileId, actorType || definition.baseActorKind);
  const toRank = clampRank(targetRank, definition.rankMin, definition.rankMax)
    ?? familyScaleRankFor(profileId, targetType);
  if (!fromRank || !toRank) return freeze({ ok:false, reasonCode:"UNKNOWN_SCALE_RANK", liveApplication:false });
  const difference = toRank - fromRank;

  if (["MG1E_SCIENTIST", "MG2E_SCIENTIST"].includes(special.mode)) {
    const eligible = difference >= Number(special.eligibleFromDifference ?? 2);
    return freeze({
      ok:true,
      profileId:definition.profileId,
      mode:special.mode,
      skill:special.skill,
      actorRank:fromRank,
      targetRank:toRank,
      rankDifference:difference,
      eligible,
      permittedOutcomes:[...(special.permittedOutcomes ?? [])],
      resourcesObstacle:Math.max(0, Math.trunc(Number(targetNature ?? 0))),
      resourcesObstacleSource:"TARGET_NATURE",
      conflict:{
        attack:[...(special.conflict?.attack ?? [])],
        maneuver:[...(special.conflict?.maneuver ?? [])],
        defend:[...(special.conflict?.defend ?? [])],
        feint:[...(special.conflict?.feint ?? [])],
        suggestedCrafts:[...(special.conflict?.suggestedCrafts ?? [])],
        animalDisposition:special.conflict?.animalDisposition,
        animalActions:special.conflict?.animalActions
      },
      liveApplication:false
    });
  }

  return freeze({
    ok:true,
    profileId:definition.profileId,
    mode:special.mode,
    skill:special.skill,
    opposedBy:special.opposedBy ?? "",
    actorRank:fromRank,
    targetRank:toRank,
    rankDifference:difference,
    liveApplication:false
  });
}

export function familyScaleEffectiveRankPlan(profileId, { baseRank = null, actorType = null, successMargin = 0 } = {}) {
  const definition = resolveComparativeScaleDefinition(profileId);
  const policy = definition?.effectiveRank;
  if (!definition || !policy || policy.mode === "NONE") return freeze({ ok:false, reasonCode:"NO_EFFECTIVE_RANK_RULE", liveApplication:false });
  const rank = clampRank(baseRank, definition.rankMin, definition.rankMax)
    ?? familyScaleRankFor(profileId, actorType || definition.baseActorKind);
  if (!rank) return freeze({ ok:false, reasonCode:"UNKNOWN_SCALE_RANK", liveApplication:false });
  const margin = Math.max(0, Math.trunc(Number(successMargin ?? 0)));
  const uncappedEffectiveRank = rank + margin;
  return freeze({
    ok:true,
    profileId:definition.profileId,
    source:definition.source,
    skill:policy.skill,
    opposedBy:policy.opposedBy,
    baseRank:rank,
    successMargin:margin,
    ranksGained:policy.ranksGained === "SUCCESS_MARGIN" ? margin : 0,
    uncappedEffectiveRank,
    effectiveRank:policy.capAtScaleMaximum === false ? uncappedEffectiveRank : Math.min(definition.rankMax, uncappedEffectiveRank),
    scaleMax:definition.rankMax,
    liveApplication:false
  });
}

export function familyScaleItemGuidance(profileId, { tokenLevel = 0, applicable = false } = {}) {
  const definition = resolveComparativeScaleDefinition(profileId);
  const policy = definition?.itemScale;
  if (!definition || !policy || policy.mode === "NONE") return freeze({
    ok:false, reasonCode:"NO_ITEM_SCALE_RULE", profileId:definition?.profileId ?? String(profileId ?? ""), liveApplication:false
  });
  const level = Math.max(0, Math.min(3, Math.trunc(Number(tokenLevel ?? 0))));
  return freeze({
    ok:true,
    profileId:definition.profileId,
    source:definition.source,
    mode:policy.mode,
    applicable:Boolean(applicable),
    tokenLevel:level,
    useHighestApplicableToken:policy.useHighestApplicable === true,
    exactNumericAutomation:policy.exactNumericAutomation === true,
    level3PublishedExample: level === 3 ? { ...(policy.publishedLevel3Example ?? {}) } : null,
    guidance:Boolean(applicable)
      ? "An appropriate Token of Power may raise effective Scale for this conflict. The table confirms fictional applicability; only source-explicit examples are encoded numerically."
      : "No Scale adjustment is planned until the table confirms that the Token is appropriate to this conflict.",
    liveApplication:false
  });
}

export function getM10B8ComparativeScaleStatus() {
  const legacy = resolveM10BComparativeScalePolicy("realm-guard-legacy-mixed");
  const strict = resolveM10BComparativeScalePolicy("realm-guard-strict");
  const mg1e = resolveM10BComparativeScalePolicy("mg1e");
  const mg2e = resolveM10BComparativeScalePolicy("mg2e");
  return freeze({
    phase:"M10C.2",
    mode:"GENERIC_COMPARATIVE_SCALE",
    profiles:{legacy,strict,mg1e,mg2e},
    writesActors:false,
    writesItems:false,
    writesJournals:false,
    writesWorldSettings:false,
    liveApplication:false,
    automaticActorRankInference:false
  });
}
