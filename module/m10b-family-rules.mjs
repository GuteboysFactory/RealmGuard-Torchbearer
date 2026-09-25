import { getActiveProfileCapabilities } from "./rules-profile-service.mjs";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function normalizedKind(value) {
  const key = String(value ?? "").trim().toLowerCase();
  if (key === "ability") return "Ability";
  if (key === "skill" || key === "role") return "Skill";
  if (key === "wise") return "Wise";
  return "";
}

export function buildM10BFamilyRulePolicy(capabilities) {
  const rules = capabilities?.rules ?? {};
  const ratedWises = rules.wises?.rated === true;
  const mg1eTraits = rules.traits?.mg1eLevelSemantics === true;
  const helperSourcePolicy = String(rules.help?.sourcePolicy ?? "LEGACY_OPEN").toUpperCase();
  const descriptors = Array.isArray(rules.nature?.descriptors) ? [...rules.nature.descriptors] : [];
  return freeze({
    phase: "M10B.3",
    profileId: String(capabilities?.profile?.id ?? ""),
    profileVersion: Number(capabilities?.profile?.version ?? 0),
    ratedWises,
    wiseSelfUse: String(rules.wises?.selfUse ?? "PROFILE_DEFINED"),
    wiseHelperUse: String(rules.wises?.helperUse ?? "PROFILE_DEFINED"),
    mg1eTraits,
    teamwork: rules.help?.teamwork === true,
    synergyEnabled: rules.help?.synergyEnabled === true,
    helperConsequences: rules.help?.helperConsequences === true,
    afraidBlocksHelp: rules.help?.afraidBlocksHelp === true,
    helperSourcePolicy,
    nature: {
      mode: String(rules.nature?.mode ?? "PROFILE_DEFINED"),
      descriptors,
      label: String(rules.nature?.label ?? "Nature"),
      tax: rules.nature?.tax === true,
      tapNature: rules.nature?.tapNature === true,
      doubleTapNature: rules.nature?.doubleTapNature === true,
      tapExcludedAbilities: Array.isArray(rules.nature?.tapExcludedAbilities) ? [...rules.nature.tapExcludedAbilities] : []
    }
  });
}

export function getActiveM10BFamilyRulePolicy() {
  return buildM10BFamilyRulePolicy(getActiveProfileCapabilities());
}

export function allowedHelperKindsForTest(testKind, policy = getActiveM10BFamilyRulePolicy()) {
  const kind = normalizedKind(testKind);
  if (policy.helperSourcePolicy !== "MG1E_TYPED") return freeze(["Skill", "Ability", "Wise"]);
  if (kind === "Ability") return freeze(["Ability"]);
  if (kind === "Skill" || kind === "Wise") return freeze(["Skill", "Wise"]);
  return freeze(["Skill", "Wise", "Ability"]);
}

export function helperSourceAllowedForTest(sourceKind, testKind, policy = getActiveM10BFamilyRulePolicy()) {
  const source = normalizedKind(sourceKind);
  return Boolean(source && allowedHelperKindsForTest(testKind, policy).includes(source));
}

export function natureDescriptorText(policy = getActiveM10BFamilyRulePolicy()) {
  return policy.nature.descriptors.join(" · ");
}

export function natureProfileLabel(policy = getActiveM10BFamilyRulePolicy()) {
  if (String(policy.nature.mode).toUpperCase().startsWith("MG1E") && policy.profileId === "mg1e") return "Nature (Mouse)";
  return "Nature";
}

export function getM10BFamilyRuleStatus() {
  const policy = getActiveM10BFamilyRulePolicy();
  return freeze({
    phase: "M10B.3",
    activeProfileId: policy.profileId,
    ratedWises: policy.ratedWises,
    mg1eTraits: policy.mg1eTraits,
    helperSourcePolicy: policy.helperSourcePolicy,
    synergyEnabled: policy.synergyEnabled,
    afraidBlocksHelp: policy.afraidBlocksHelp,
    nature: policy.nature
  });
}
