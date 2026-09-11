const CUSTOM_TYPES = Object.freeze(["role", "trait", "wise", "talent", "tokenOfPower"]);
const CARRY_FORWARD = Object.freeze({ condition: "M4", gear: "M5" });

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const entry of Object.values(value)) freeze(entry);
  return Object.freeze(value);
}

function resolveItem(actor, itemId) {
  if (!actor || !itemId) return null;
  return actor.items?.get?.(itemId) ?? Array.from(actor.items ?? []).find(item => item?.id === itemId) ?? null;
}

function itemView(item) {
  if (!item) return null;
  return Object.freeze({
    id: item.id,
    name: item.name,
    type: item.type,
    defaultSkill: item.type === "role" ? Boolean(item.getFlag?.("realm-guard", "defaultSkill")) : null,
    sourceKey: item.type === "talent" ? String(item.system?.sourceKey ?? "") : null
  });
}

function effectsApi() {
  const api = game.realmGuard?.core?.effects;
  if (!api) throw new Error("CORE Effect Engine API is not ready.");
  return api;
}

function parityApi() {
  const api = game.realmGuard?.core?.testParity;
  if (!api) throw new Error("CORE Test parity API is not ready.");
  return api;
}

export function getCustomContentCompatibilityStatus() {
  return freeze({
    phase: "M3",
    mode: "SHADOW_COMPATIBILITY_QA",
    liveApplication: false,
    authority: "LEGACY_MIXED",
    principle: "TYPE_AND_DATA_DRIVEN_NOT_NAME_DRIVEN",
    runtimeQaTypes: [...CUSTOM_TYPES],
    carryForward: { ...CARRY_FORWARD },
    freeTextBoundary: "MANUAL_UNLESS_STRUCTURED_EFFECT_EXISTS",
    canonicalIdRequired: false,
    canonicalNameRequired: false,
    promotionGate: "CUSTOM_CONTENT_MATRIX_MUST_PASS_BEFORE_M3_VERIFIED"
  });
}

export function inspectCustomContent(actor) {
  if (!actor) throw new Error("inspectCustomContent requires an Actor.");
  const items = Array.from(actor.items ?? []);
  const byType = Object.fromEntries(CUSTOM_TYPES.map(type => [
    type,
    items.filter(item => item.type === type).map(itemView)
  ]));
  const customSkills = items
    .filter(item => item.type === "role" && !Boolean(item.getFlag?.("realm-guard", "defaultSkill")))
    .map(itemView);
  return freeze({
    actorId: actor.id,
    actorName: actor.name,
    customSkills,
    byType,
    status: getCustomContentCompatibilityStatus()
  });
}

export function verifyNamedCustomItems(actor, names = {}) {
  if (!actor) throw new Error("verifyNamedCustomItems requires an Actor.");
  const items = Array.from(actor.items ?? []);
  const result = {};
  for (const [key, name] of Object.entries(names ?? {})) {
    const wanted = String(name ?? "").trim();
    const item = items.find(entry => entry.name === wanted) ?? null;
    result[key] = Object.freeze({
      requestedName: wanted,
      present: Boolean(item),
      item: itemView(item)
    });
  }
  return freeze({ actorId: actor.id, actorName: actor.name, items: result });
}

export function compareCustomSkillLatest(actor, skillId) {
  const item = resolveItem(actor, skillId);
  if (!item || item.type !== "role") throw new Error("compareCustomSkillLatest requires a Role/Skill Item on the Actor.");
  const latest = parityApi().getLatest();
  const legacy = latest?.comparison?.legacy ?? null;
  const isCustom = !Boolean(item.getFlag?.("realm-guard", "defaultSkill"));
  const sourceMatches = Boolean(legacy && legacy.sourceId === item.id && legacy.sourceName === item.name);
  return freeze({
    item: itemView(item),
    isCustom,
    latestStatus: latest?.status ?? null,
    latestMethod: latest?.method ?? null,
    context: latest?.comparison?.context ?? null,
    sourceMatches,
    parity: latest?.comparison?.parity ?? null,
    match: Boolean(isCustom && sourceMatches && latest?.status === "MATCH" && latest?.comparison?.parity?.all)
  });
}

export function compareCustomTrait(actor, traitId, traitMode = "help", options = {}) {
  const item = resolveItem(actor, traitId);
  if (!item || item.type !== "trait") throw new Error("compareCustomTrait requires a Trait Item on the Actor.");
  const result = effectsApi().compareTraitEffects(actor, item.id, traitMode, options);
  return freeze({ item: itemView(item), ...result });
}

export function compareCustomWise(actor, wiseId, options = {}) {
  const item = resolveItem(actor, wiseId);
  if (!item || item.type !== "wise") throw new Error("compareCustomWise requires a Wise Item on the Actor.");
  const result = effectsApi().compareWiseEffects(actor, item.id, options);
  return freeze({ item: itemView(item), ...result });
}

export function compareCustomTalent(actor, talentId, sourceName, options = {}) {
  const item = resolveItem(actor, talentId);
  if (!item || item.type !== "talent") throw new Error("compareCustomTalent requires a Talent Item on the Actor.");
  const result = effectsApi().compareTalentEffects(actor, item.id, sourceName, options);
  return freeze({ item: itemView(item), ...result });
}

export function compareCustomTokenPower(actor, tokenId, sourceName, options = {}) {
  const item = resolveItem(actor, tokenId);
  if (!item || item.type !== "tokenOfPower") throw new Error("compareCustomTokenPower requires a Token of Power Item on the Actor.");
  const result = effectsApi().compareTokenPowerEffects(actor, item.id, sourceName, options);
  return freeze({ item: itemView(item), ...result });
}

function exposeApi() {
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  game.realmGuard.core.customContent = Object.freeze({
    getStatus: getCustomContentCompatibilityStatus,
    inspectActor: inspectCustomContent,
    verifyNamedItems: verifyNamedCustomItems,
    compareSkillLatest: compareCustomSkillLatest,
    compareTrait: compareCustomTrait,
    compareWise: compareCustomWise,
    compareTalent: compareCustomTalent,
    compareTokenPower: compareCustomTokenPower
  });
}

export function installCustomContentCompatibilityQa() {
  Hooks.once("ready", () => {
    exposeApi();
    console.log("realm-guard | CORE M3 Custom Content Compatibility QA ready", getCustomContentCompatibilityStatus());
  });
}
