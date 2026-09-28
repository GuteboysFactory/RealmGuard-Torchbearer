import {
  familyScaleEffectiveRankPlan,
  familyScaleEntry,
  familyScaleGroupWarPlan,
  familyScaleItemGuidance,
  familyScaleOutcomePlan,
  familyScaleRankFor,
  resolveComparativeScaleDefinition,
  resolveM10BComparativeScalePolicy
} from "./m10b-comparative-scale.mjs";
import { REALM_GUARD_STRICT_SCALE_RANKS } from "./profiles/realm-guard-strict-scale.mjs";

export const STRICT_SCALE_RANKS = REALM_GUARD_STRICT_SCALE_RANKS;
const PROFILE_ID = "realm-guard-strict";

export function strictScaleRankFor(value) {
  return familyScaleRankFor(PROFILE_ID, value);
}

export function strictScaleEntry(value) {
  return familyScaleEntry(PROFILE_ID, value);
}

export function strictFighterHunterOutcomePlan(args = {}) {
  return familyScaleOutcomePlan(PROFILE_ID, {
    actorType: "Dúnadan",
    ...args
  });
}

export function strictMilitaristWarPlan(args = {}) {
  return familyScaleGroupWarPlan(PROFILE_ID, {
    armyType: "Man",
    ...args
  });
}

export function strictLoreMasterScalePlan(args = {}) {
  return familyScaleEffectiveRankPlan(PROFILE_ID, {
    actorType: "Dúnadan",
    ...args
  });
}

export function strictTokenScaleGuidance(args = {}) {
  const plan = familyScaleItemGuidance(PROFILE_ID, args);
  if (plan.ok === false) return plan;
  const { ok: _ok, profileId: _profileId, ...compat } = plan;
  return compat;
}

export function getStrictScaleStatus() {
  const definition = resolveComparativeScaleDefinition(PROFILE_ID);
  const policy = resolveM10BComparativeScalePolicy(PROFILE_ID);
  return Object.freeze({
    phase:"M10B.8_COMPAT_WRAPPER",
    compatibilityProvider:"M10B.8_GENERIC_COMPARATIVE_SCALE",
    source:definition?.source ?? "Realm Guard v1.6",
    mode:"MANUAL_GUIDED",
    liveAuthority:false,
    liveApplication:false,
    scaleMin:policy.rankMin,
    scaleMax:policy.rankMax,
    dunadanRank:policy.baseRank,
    ranks:STRICT_SCALE_RANKS,
    fighterHunter:true,
    militarist:true,
    loreMaster:true,
    tokensOfPower:"MANUAL_GUIDED",
    writesActors:false,
    writesItems:false,
    writesWorldSettings:false,
    nextStep:"M10B.8 Comparative Scale / Rules Reference Routing QA"
  });
}
