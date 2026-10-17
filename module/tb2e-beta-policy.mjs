import { tb2eConditionTestEffectPlan, tb2eConditionInfo } from "./m10d-tb2e-conditions-shadow.mjs";
import { TB2E_CONDITIONS } from "./profiles/torchbearer2e-beta-creation.mjs";

export function isTb2eBeta() {
  try { return globalThis.game?.settings?.get("realm-guard", "activeRulesProfileId") === "torchbearer2e-beta"; }
  catch { return false; }
}
export function isTb2eCharacter(actor) { return actor?.getFlag?.("realm-guard", "tb2eBeta") === true || actor?.flags?.["realm-guard"]?.tb2eBeta === true; }
export function tb2eConditionDefinition(definition, actor) {
  if (!definition || !isTb2eCharacter(actor)) return definition;
  const info = tb2eConditionInfo(definition.name);
  const recovery = info.recoveryReference;
  if (!recovery) return definition;
  return { ...definition, recoveryAbility: recovery.ability.toLowerCase(), recoveryObstacle: recovery.obstacle,
    recoveryNote: `Torchbearer 2E: ${recovery.ability} Ob ${recovery.obstacle} recovery in Camp/Town. Use the TB2E recovery control for phase, order and Check costs.`,
    description: `Torchbearer 2E ${definition.name}. ${definition.name === "Sick" ? "-1D to skills, Nature, Will and Health; stacks with Injured. No advancement logging while Sick." : "Effects follow the active TB2E profile."}` };
}
export function tb2eTestBlocker(actor, name, rating, isSkill) {
  if (!isTb2eBeta()) return null;
  if (actor.conditions?.some(item => item.name === "Dead" && item.system.active)) return "A dead character cannot make a test.";
  if (!["resources", "circles"].includes(String(name).toLowerCase()) && Number(rating) + tb2eConditionRollData(actor, name, { isSkill }).dice <= 0) return "Conditions reduced this rating to zero. Use an eligible Nature action or recover first.";
  return null;
}
export function tb2eConditionRollData(actor, rollName, { isSkill = true } = {}) {
  const active = (actor?.conditions ?? []).filter(item => item.system?.active && TB2E_CONDITIONS.includes(item.name));
  const plan = tb2eConditionTestEffectPlan({ conditions: active.map(item => item.name), test: isSkill ? "SKILL" : String(rollName).toUpperCase() });
  if (!plan.ok) return { active: [], dice: 0 };
  return { active: active.filter(item => ["Fresh", "Sick", "Injured"].includes(item.name) && (isSkill || !["resources", "circles"].includes(String(rollName).toLowerCase()))), dice: plan.diceModifier };
}
