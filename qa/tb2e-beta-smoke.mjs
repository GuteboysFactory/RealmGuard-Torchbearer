import assert from "node:assert/strict";
import fs from "node:fs";
import { TB2E_BETA_ID, TB2E_CONDITIONS, deriveTb2eBeta } from "../module/profiles/torchbearer2e-beta-creation.mjs";
const settings = new Map([["activeRulesProfileId", TB2E_BETA_ID], ["activeRulesProfileVersion", 1]]);
globalThis.game = { system: { version: "1.13.0-qa.26" }, user: { id: "gm", isGM: true }, actors: { contents: [] }, settings: { get: (_ns, key) => settings.get(key), set: async (_ns, key, value) => settings.set(key, value) } };
globalThis.foundry = { utils: { deepClone: structuredClone, escapeHTML: value => String(value).replaceAll("<", "&lt;").replaceAll(">", "&gt;") } };
const { createProfileCreationDraft, validateProfileCreation, profileCreationCommitPlan } = await import("../module/m10b-character-creation.mjs");
const { refreshRulesProfileRuntime, getActiveRulesSnapshot } = await import("../module/rules-profile-service.mjs");
const { profileActivationAvailable } = await import("../module/m10-profile-activation.mjs");
const { FoundryCreationCommitAdapter } = await import("../module/m9-creation-commit-adapter.mjs");
const { conditionRollData } = await import("../module/conditions.mjs");
const { turnManagerEnabled } = await import("../module/turns.mjs");
assert.equal(profileActivationAvailable(TB2E_BETA_ID), true);
game.system.version = "1.13.0";
assert.equal(profileActivationAvailable(TB2E_BETA_ID), false);
game.system.version = "1.13.0-qa.26";
assert.equal(profileActivationAvailable("torchbearer2e"), false, "historical foundation remains locked");
assert.equal(turnManagerEnabled(), false, "MG turn economy cannot charge a TB2E roll");
const answers = { name: "Beta test", rank: "WARRIOR", will: 4, health: 4, age: 18, home: "REMOTE_VILLAGE", homeSkill: "CARPENTER", homeTrait: "EARLY_RISER", social: "PERSUADER", specialty: "SCOUT", upbringing: "LABORER", q1: "BOAST", q2: "DEMAND_RIGHTS", q3: "FLEE_HIDE", customWise: "Ruins-wise", friend: "Friend", parents: "Parents", mentor: "Mentor", belief: "Belief", goal: "Goal", instinct: "Instinct", creed: "Creed" };
for (const [rank, extra] of Object.entries({
  WARRIOR: {}, MAGICIAN: {}, THEURGE: {},
  BURGLAR: { age: 27, q1: "FEAST", q2: "RIDDLE", q3: "SNEAK", stockWise: "HOME" },
  OUTCAST: { age: 35, q1: "REVENGE", q2: "DIG_DEEPER", q3: "CRAFT", stockWise: "DWARVEN_CHRONICLES" },
  RANGER: { age: 65, q1: "SING", q2: "RETREAT_HIDE", q3: "JOURNEY_WEST", stockWise: "ELVEN_LORE" }
})) {
  const draft = createProfileCreationDraft(TB2E_BETA_ID, { answers: { ...answers, rank, ...extra } });
  assert.equal(validateProfileCreation(TB2E_BETA_ID, draft).valid, true, rank);
  assert.equal(draft.derivedValues.nature, 6);
}
const invalid = createProfileCreationDraft(TB2E_BETA_ID, { answers: { ...answers, will: 6, health: 6 } });
assert.throws(() => profileCreationCommitPlan(TB2E_BETA_ID, invalid), /preflight/);
assert(deriveTb2eBeta({ ...answers, rank: "MAGICIAN", mentor: "" }).derivedValues.errors.some(e => e.code === "MAGICIAN_MUST_SELECT_MENTOR"));
const draft = createProfileCreationDraft(TB2E_BETA_ID, { answers });
const plan = profileCreationCommitPlan(TB2E_BETA_ID, draft);
assert.equal(plan.transaction.liveExecution, true);
assert.equal(plan.actor.system.natureDescriptors, "Boasting, Demanding, Running");
assert.equal(plan.actor.system.creed, "Creed");
assert.deepEqual(plan.actor.system.attributes.nature, { value: 6, maximum: 6 });
assert.equal(plan.provisioning.canonicalSkills.ratings.Fighter.rating, 4);
assert.equal(plan.provisioning.canonicalSkills.ratings.Scout.rating, 3);
assert.deepEqual(plan.provisioning.canonicalConditions.names, TB2E_CONDITIONS);
assert.deepEqual(plan.provisioning.canonicalConditions.activeNames, ["Fresh"]);

let created, deleted = false;
const runtime = {
  ensureFolder: async () => ({ id: "folder" }),
  createActor: async data => {
    const actor = { ...data, id: "new", items: [], flags: structuredClone(data.flags),
      get conditions() { return this.items.filter(item => item.type === "condition"); },
      async createEmbeddedDocuments(_type, docs) { const rows = docs.map(data => ({ ...structuredClone(data), id: `item-${this.items.length++}`, getFlag(ns, key) { return this.flags?.[ns]?.[key]; } })); this.items = this.items.filter(Boolean).concat(rows); return rows; },
      async updateEmbeddedDocuments(_type, updates) { for (const update of updates) { const item = this.items.find(i => i.id === update._id); for (const [path, value] of Object.entries(update)) { if (path === "system.rating") item.system.rating = value; } } },
      async setFlag(ns, key, value) { this.flags[ns] ??= {}; this.flags[ns][key] = value; },
      async delete() { deleted = true; }
    }; created = actor; return actor;
  },
  normalizeRelationships: async () => ({})
};
const adapter = new FoundryCreationCommitAdapter({ shadowOnly: false, runtime });
await adapter.execute(plan, { rulesSnapshot: getActiveRulesSnapshot() });
assert.equal(created.system.creed, "Creed");
assert.equal(created.items.find(i => i.name === "Fresh").system.active, true);
assert.equal(created.items.find(i => i.name === "Sick").system.active, false);
assert.equal(created.items.find(i => i.name === "Fighter").system.rating, 4);
assert.equal(created.flags["realm-guard"].creationProvenance.profileId, TB2E_BETA_ID);
await assert.rejects(() => adapter.execute(plan, { rulesSnapshot: getActiveRulesSnapshot(), faultPhase: "CREATE_ITEMS" }), /rolled back/);
assert.equal(deleted, true);
const conditionActor = { conditions: [{ name: "Sick", system: { active: true } }, { name: "Injured", system: { active: true } }, { name: "Strained", system: { active: true } }] };
assert.equal(conditionRollData(conditionActor, "Fighter").dice, -2, "dormant RG Strained must not alter TB2E");
assert.equal(conditionRollData(conditionActor, "Resources", { isSkill: false }).dice, 0);
// Exercise the real recovery adapter: persisted attempt, spending, success and failed roll refunds.
globalThis.canvas = { ready: false };
globalThis.ui = { notifications: { warn() {}, info() {} } };
foundry.applications = { api: { DialogV2: { confirm: async () => true } } };
settings.set("tb2eBetaSession", { phase: "CAMP", turn: 1, cycle: 5 });
const { recoverTb2eCondition } = await import("../module/tb2e-beta-session.mjs");
const angry = { id: "angry", type: "condition", name: "Angry", system: { active: true }, async update(data) { this.system.active = data["system.active"]; } };
const recoveryActor = { uuid: "Actor.test", isOwner: true, conditions: [angry], effects: [], system: { resources: { checks: { value: 2 } } }, flags: {},
  getFlag(_ns, key) { return this.flags[key]; }, async setFlag(_ns, key, value) { this.flags[key] = value; },
  async update(data) { this.system.resources.checks.value = data["system.resources.checks.value"]; },
  async rollAbility(key, options) { assert.equal(key, "will"); assert.equal(options.obstacle, 2); return { passed: true }; }
};
await recoverTb2eCondition(recoveryActor, angry);
assert.equal(angry.system.active, false);
assert.equal(recoveryActor.system.resources.checks.value, 1);
assert.equal(recoveryActor.flags.tb2eRecoveryAttempts.angry, 5);
angry.system.active = true;
await recoverTb2eCondition(recoveryActor, angry);
assert.equal(recoveryActor.system.resources.checks.value, 1, "same-phase repeat must not spend again");
settings.set("tb2eBetaSession", { phase: "CAMP", turn: 1, cycle: 6 });
recoveryActor.rollAbility = async () => { throw Error("dice unavailable"); };
await assert.rejects(() => recoverTb2eCondition(recoveryActor, angry), /dice unavailable/);
assert.equal(recoveryActor.system.resources.checks.value, 1, "failed execution refunds the Check");
// TB2E uses its own Wise plan through the existing paid-reroll adapter.
const { applyMg2eWiseEffect } = await import("../module/m10c-mg2e-live-wises.mjs");
const { tb2eWiseUsePlan } = await import("../module/m10d-tb2e-wise-shadow.mjs");
globalThis.Roll = class { constructor(formula) { this.count = Number(formula.split("d")[0]); } async evaluate() { this.dice = [{ results: Array.from({ length: this.count }, () => ({ result: 4 })) }]; return this; } };
const payer = { system: { resources: { fate: { value: 1 }, persona: { value: 1 } } }, async spendTrackedResource(kind, amount) { this.system.resources[kind].value -= amount; return { ok: true }; } };
const wiseResult = await applyMg2eWiseEffect(payer, [1, 2, 4], { type: "wise", name: "Ruins-wise" }, { usePlan: tb2eWiseUsePlan, choose: async () => ({ effect: "Of Course" }) });
assert.deepEqual(wiseResult.faces, [4, 4, 4]);
assert.equal(payer.system.resources.persona.value, 0);
settings.set("activeRulesProfileId", "realm-guard-legacy-mixed");
refreshRulesProfileRuntime();
const inactivePlan = profileCreationCommitPlan(TB2E_BETA_ID, draft);
assert.equal(inactivePlan.transaction.liveExecution, false);
assert.throws(() => adapter.execute(inactivePlan), /not enabled/);
const template = fs.readFileSync("templates/actor/character.hbs", "utf8");
const fields = ["natureDescriptors", "belief", "goal", "instinct", "creed"].map(key => template.indexOf(`name="system.${key}"`));
assert(fields.every((position, i) => position >= 0 && (i === 0 || position > fields[i - 1])));
console.log("PASS TB2E beta: QA gate, six class drafts, validation, live M9 provisioning, rollback, conditions, profile isolation and Overview fields");
