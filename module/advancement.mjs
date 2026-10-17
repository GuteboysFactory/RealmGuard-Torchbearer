const NS = "realm-guard";

export const ABILITY_KEYS = ["nature", "will", "health", "resources", "circles"];

export function abilityLabel(key) {
  return ({ nature: "Nature", will: "Will", health: "Health", resources: "Resources", circles: "Circles" })[String(key)] ?? String(key ?? "Ability");
}

export function advancementRequirements(rating) {
  const r = Math.max(0, Math.trunc(Number(rating ?? 0)));
  if (r <= 1) return { passNeeded: 1, failNeeded: 0 };
  return { passNeeded: r, failNeeded: r - 1 };
}

export function abilityCap(key) {
  return ({ nature: 7, will: 6, health: 6, resources: 10, circles: 10 })[String(key)] ?? 6;
}

export function abilityRating(actor, key) {
  const data = actor?.system?.attributes?.[key];
  if (!data) return 0;
  if (key === "nature") return Math.max(0, Number(data.maximum ?? data.value ?? 0));
  return Math.max(0, Number(data.value ?? 0));
}

function learningRoot(actor) {
  return foundry.utils.deepClone(actor?.getFlag?.(NS, "abilityLearning") ?? {});
}

export function abilityLearning(actor, key) {
  const rating = abilityRating(actor, key);
  const req = advancementRequirements(rating);
  const stored = learningRoot(actor)?.[key] ?? {};
  const passed = Math.max(0, Math.min(req.passNeeded, Number(stored.passed ?? 0)));
  const failed = Math.max(0, Math.min(req.failNeeded, Number(stored.failed ?? 0)));
  const cap = abilityCap(key);
  return {
    key,
    label: abilityLabel(key),
    rating,
    cap,
    passed,
    failed,
    passNeeded: req.passNeeded,
    failNeeded: req.failNeeded,
    passProgress: req.passNeeded ? Math.min(100, Math.round((passed / req.passNeeded) * 100)) : 100,
    failProgress: req.failNeeded ? Math.min(100, Math.round((failed / req.failNeeded) * 100)) : 100,
    maxRating: rating >= cap,
    ready: rating < cap && passed >= req.passNeeded && failed >= req.failNeeded
  };
}

async function setAbilityLearning(actor, key, passed, failed) {
  const root = learningRoot(actor);
  root[key] = { passed: Math.max(0, Math.trunc(passed)), failed: Math.max(0, Math.trunc(failed)) };
  await actor.setFlag(NS, "abilityLearning", root);
}

async function postAbilityAdvanceChat(actor, key, oldRating, newRating) {
  const next = advancementRequirements(newRating);
  const esc = foundry.utils.escapeHTML;
  const label = abilityLabel(key);
  const content = `<div class="realm-guard rg-advancement-chat rg-celebration-chat rg-ability-advancement-chat"><div class="rg-celebration-kicker">ABILITY ADVANCEMENT!</div><h2>${esc(actor.name)} advances ${esc(label)}!</h2><div class="rg-level-jump"><span>${esc(label.toUpperCase())} ${oldRating}</span><i class="fa-solid fa-arrow-right"></i><strong>${esc(label.toUpperCase())} ${newRating}</strong></div><p><b>Well done, Ranger.</b> Passes and failures have turned experience into growth.</p><p>New advancement track: <b>${next.passNeeded} Pass / ${next.failNeeded} Fail</b>.</p></div>`;
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
}

export async function autoAdvanceAbility(actor, key) {
  if (!actor || !ABILITY_KEYS.includes(String(key))) return false;
  const view = abilityLearning(actor, key);
  if (!view.ready || view.maxRating) return false;
  const oldRating = view.rating;
  const newRating = Math.min(view.cap, oldRating + 1);
  if (key === "nature") {
    const current = Math.max(0, Number(actor.system.attributes?.nature?.value ?? 0));
    await actor.update({
      "system.attributes.nature.maximum": newRating,
      "system.attributes.nature.value": Math.min(newRating, current + 1)
    }, { realmGuardAbilityAdvancement: true });
  } else {
    await actor.update({ [`system.attributes.${key}.value`]: newRating }, { realmGuardAbilityAdvancement: true });
  }
  await setAbilityLearning(actor, key, 0, 0);
  await postAbilityAdvanceChat(actor, key, oldRating, newRating);
  ui.notifications.info(`Realm Guard: ${actor.name} advanced ${abilityLabel(key)} ${oldRating} → ${newRating}.`);
  return true;
}

export async function recordAbilityTest(actor, key, passed, { count = true } = {}) {
  if (!count || !actor || !ABILITY_KEYS.includes(String(key))) return false;
  const view = abilityLearning(actor, key);
  if (view.maxRating) return false;
  const nextPassed = passed ? Math.min(view.passNeeded, view.passed + 1) : view.passed;
  const nextFailed = passed ? view.failed : Math.min(view.failNeeded, view.failed + 1);
  await setAbilityLearning(actor, key, nextPassed, nextFailed);
  return autoAdvanceAbility(actor, key);
}

export async function adjustAbilityLearning(actor, key, field, delta) {
  if (!actor || !ABILITY_KEYS.includes(String(key)) || !["passed", "failed"].includes(field)) return false;
  const view = abilityLearning(actor, key);
  if (view.maxRating) return false;
  const limit = field === "passed" ? view.passNeeded : view.failNeeded;
  const current = field === "passed" ? view.passed : view.failed;
  const value = Math.max(0, Math.min(limit, current + Math.trunc(Number(delta ?? 0))));
  await setAbilityLearning(actor, key, field === "passed" ? value : view.passed, field === "failed" ? value : view.failed);
  if (delta > 0) return autoAdvanceAbility(actor, key);
  return false;
}

async function postSkillAdvanceChat(actor, role, oldRating, newRating) {
  const req = advancementRequirements(newRating);
  const esc = foundry.utils.escapeHTML;
  const content = `<div class="realm-guard rg-advancement-chat rg-celebration-chat"><div class="rg-celebration-kicker">SKILL ADVANCEMENT!</div><h2>${esc(actor.name)} advances ${esc(role.name)}!</h2><div class="rg-level-jump"><span>${esc(role.name)} ${oldRating}</span><i class="fa-solid fa-arrow-right"></i><strong>${esc(role.name)} ${newRating}</strong></div><p>New advancement track: <b>${req.passNeeded} Pass / ${req.failNeeded} Fail</b>.</p></div>`;
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
}

export async function recordHelperSkillTest(actor, roleId, passed) {
  const role = actor?.items?.get?.(roleId);
  if (!role || role.type !== "role") return false;
  const rating = Math.max(0, Number(role.system?.rating ?? 0));
  if (rating <= 0 || rating >= 6) return false;
  const req = advancementRequirements(rating);
  const learning = role.system?.learning ?? {};
  const field = passed ? "passed" : "failed";
  const limit = passed ? req.passNeeded : req.failNeeded;
  const current = Math.max(0, Number(learning[field] ?? 0));
  if (current < limit) await role.update({ [`system.learning.${field}`]: Math.min(limit, current + 1) });
  const fresh = actor.items.get(roleId);
  const p = Math.max(0, Number(fresh.system?.learning?.passed ?? 0));
  const f = Math.max(0, Number(fresh.system?.learning?.failed ?? 0));
  if (p < req.passNeeded || f < req.failNeeded) return false;
  const nextRating = Math.min(6, rating + 1);
  const nextReq = advancementRequirements(nextRating);
  await fresh.update({
    "system.rating": nextRating,
    "system.learning.passed": 0,
    "system.learning.failed": 0,
    "system.learning.passNeeded": nextReq.passNeeded,
    "system.learning.failNeeded": nextReq.failNeeded
  });
  await postSkillAdvanceChat(actor, fresh, rating, nextRating);
  return true;
}
