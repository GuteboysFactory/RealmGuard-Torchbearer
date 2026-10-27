export const TB2E_WIZARD_QA_SETTING = "tb2eWizardQaEnabled";

export function tb2eWizardQaEnabled() {
  if (!/-qa(?:\.|-|$)/i.test(String(globalThis.game?.system?.version ?? ""))) return false;
  try { return globalThis.game?.settings?.get?.("realm-guard", TB2E_WIZARD_QA_SETTING) === true; }
  catch (_error) { return false; }
}

export function isTb2eWizardActor(actor) {
  return (actor?.getFlag?.("realm-guard", "recruitmentVersion") ?? actor?.flags?.["realm-guard"]?.recruitmentVersion) === "TB2E_WIZARD_M10D8";
}
