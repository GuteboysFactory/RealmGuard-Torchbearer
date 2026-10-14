import { resolveRulesProfile, getRulesProfileRuntime } from "./rules-profile-service.mjs";
import { profileActivationAvailable, qaProfileActivationRuntime } from "./m10-profile-activation.mjs";
import { tb2eWiseUsePlan } from "./m10d-tb2e-wise-shadow.mjs";

const PHASE = "M10D.18";
const PROFILE_ID = "torchbearer2e";
const evidence = new Map();
let sequence = 0;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z]/g, "");
}

function currentGate() {
  const qaRuntime = qaProfileActivationRuntime();
  const gmOnly = globalThis.game?.user?.isGM === true;
  const profile = resolveRulesProfile(PROFILE_ID).profile;
  const foundationLocked = profile.metadata?.foundationOnly === true
    && profile.metadata?.selectable === false
    && profile.metadata?.supported === false
    && profile.metadata?.liveRuleAuthority === false
    && profile.metadata?.explicitActivationAuthorized === false
    && profileActivationAvailable(PROFILE_ID) === false;
  const activeProfileId = getRulesProfileRuntime().profile.id;
  if (!qaRuntime) return { ok:false, reasonCode:"QA_RUNTIME_REQUIRED", qaRuntime, gmOnly, foundationLocked, activeProfileId };
  if (!gmOnly) return { ok:false, reasonCode:"GM_ONLY", qaRuntime, gmOnly, foundationLocked, activeProfileId };
  if (!foundationLocked) return { ok:false, reasonCode:"TB2E_PROFILE_NOT_LOCKED", qaRuntime, gmOnly, foundationLocked, activeProfileId };
  return { ok:true, qaRuntime, gmOnly, foundationLocked, activeProfileId };
}

function inputComplete(effect, options) {
  if (typeof options?.hasWise !== "boolean" || typeof options?.related !== "boolean") return false;
  const key = normalize(effect);
  if (["iamwise", "wiseaid"].includes(key)) return typeof options.actingOnInstinct === "boolean";
  if (["deeperunderstanding", "deeper"].includes(key)) {
    return Number.isInteger(options.failedDice) && options.failedDice >= 0
      && Number.isInteger(options.alreadyRerolledFailedDice) && options.alreadyRerolledFailedDice >= 0
      && typeof options.hasFate === "boolean";
  }
  if (["ofcourse", "ahofcourse", "course"].includes(key)) {
    return Number.isFinite(options.failedDice) && options.failedDice >= 0
      && typeof options.hasPersona === "boolean";
  }
  return true;
}

export function tb2eControlledWiseHandoffStatus() {
  const gate = currentGate();
  const records = [...evidence.values()];
  return freeze({
    phase:PHASE,
    mode:"TB2E_WISES_CONTROLLED_QA_HANDOFF",
    profileId:PROFILE_ID,
    qaOnly:true,
    gmOnly:true,
    foundationLocked:gate.foundationLocked,
    activationAvailable:profileActivationAvailable(PROFILE_ID),
    profileSwitch:false,
    liveRuleAuthority:false,
    liveEffectApplied:false,
    rollEvaluated:false,
    resourceSpendCommitted:false,
    evidenceStorage:"IN_MEMORY_ONLY",
    evidenceCount:records.length,
    passedPlanCount:records.filter(record => record.planAccepted).length,
    rejectedPlanCount:records.filter(record => !record.planAccepted).length,
    writes:{actors:0,items:0,journals:0,settings:0},
    nextStep:"Run bounded Wises handoff cases in Foundry; no live roll, resource spend, or profile activation"
  });
}

export function tb2eControlledWiseHandoffMatrix() {
  return freeze([
    {id:"I_AM_WISE",state:"ROUTABLE_NOT_APPLIED",source:"TB2E_WISE_SHADOW"},
    {id:"DEEPER_UNDERSTANDING",state:"ROUTABLE_NOT_APPLIED",source:"TB2E_WISE_SHADOW"},
    {id:"OF_COURSE",state:"ROUTABLE_NOT_APPLIED",source:"TB2E_WISE_SHADOW"}
  ]);
}

export function runTb2eControlledWiseHandoff(effect, options = {}) {
  const gate = currentGate();
  if (!gate.ok) return freeze({
    ok:false,phase:PHASE,profileId:PROFILE_ID,reasonCode:gate.reasonCode,
    liveEffectApplied:false,rollEvaluated:false,resourceSpendCommitted:false,
    writes:{actors:0,items:0,journals:0,settings:0}
  });
  if (!inputComplete(effect, options)) return freeze({
    ok:false,phase:PHASE,profileId:PROFILE_ID,reasonCode:"INCOMPLETE_HANDOFF_CONTEXT",
    liveEffectApplied:false,rollEvaluated:false,resourceSpendCommitted:false,
    writes:{actors:0,items:0,journals:0,settings:0}
  });

  const plan = tb2eWiseUsePlan(effect, options);
  const afterProfileId = getRulesProfileRuntime().profile.id;
  if (afterProfileId !== gate.activeProfileId) return freeze({
    ok:false,phase:PHASE,profileId:PROFILE_ID,reasonCode:"ACTIVE_PROFILE_CHANGED_DURING_HANDOFF",
    liveEffectApplied:false,rollEvaluated:false,resourceSpendCommitted:false,
    writes:{actors:0,items:0,journals:0,settings:0}
  });

  const id = ++sequence;
  const record = freeze({
    id,phase:PHASE,effect:String(effect ?? ""),planAccepted:plan.ok === true,
    reasonCode:plan.reasonCode ?? null,activeProfileId:gate.activeProfileId,
    capturedAt:Date.now()
  });
  evidence.set(id, record);
  return freeze({
    ok:plan.ok === true,
    phase:PHASE,
    profileId:PROFILE_ID,
    decision:plan.ok === true ? "PLAN_ROUTED_NOT_APPLIED" : "PLAN_REJECTED",
    source:"TB2E_WISE_SHADOW",
    reasonCode:plan.reasonCode ?? null,
    plan,
    evidence:record,
    liveEffectApplied:false,
    rollEvaluated:false,
    resourceSpendCommitted:false,
    writes:{actors:0,items:0,journals:0,settings:0}
  });
}

export function resetTb2eControlledWiseHandoffEvidence() {
  const gate = currentGate();
  if (!gate.ok) return freeze({ok:false,phase:PHASE,reasonCode:gate.reasonCode,evidenceCount:evidence.size});
  evidence.clear();
  sequence = 0;
  return freeze({ok:true,phase:PHASE,evidenceCount:0,evidenceStorage:"IN_MEMORY_ONLY"});
}
