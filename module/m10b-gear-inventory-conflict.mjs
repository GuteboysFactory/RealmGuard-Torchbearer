import { createM5Services, INVENTORY_MODES } from "./core/m5-services.mjs";
import { getActiveProfileCapabilities, resolveProfileCapabilities } from "./rules-profile-service.mjs";

const ACTIONS = Object.freeze(["attack", "defend", "feint", "maneuver"]);
const RANGE_ORDER = Object.freeze({ normal: 0, spear: 1, thrown: 2, missile: 3 });
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

function itemId(item) {
  return String(item?.id ?? item?._id ?? "");
}

function normalizeSkillList(value) {
  if (Array.isArray(value)) return value.map(String);
  if (value == null || value === "") return [];
  return [String(value)];
}

export const MG1E_WEAPON_CATALOG = freeze({
  axe: { name: "Axe", source: "MG1E", range: "normal", qualities: ["Deadly", "Slow"] },
  bow: { name: "Bow", source: "MG1E", range: "missile", qualities: ["Missile", "Long Range", "Hard to Defend"] },
  halberd: { name: "Halberd", source: "MG1E", range: "choice", qualities: ["Versatile"], modes: ["axe", "spear"], modeScope: "ACTION_SET" },
  "hook and line": { name: "Hook and Line", source: "MG1E", range: "normal", qualities: ["Hooked", "Unwieldy"] },
  knife: { name: "Knife", source: "MG1E", range: "normal", thrownRange: "thrown", qualities: ["Short and Quick", "Thrown"] },
  shield: { name: "Shield", source: "MG1E", range: "normal", qualities: ["Protection", "Heavy"] },
  sling: { name: "Sling", source: "MG1E", range: "missile", qualities: ["Missile", "Medium Range"] },
  spear: { name: "Spear", source: "MG1E", range: "spear", qualities: ["Spear"] },
  staff: { name: "Staff", source: "MG1E", range: "normal", thrownRange: "thrown", qualities: ["Handy", "Thrown"] },
  sword: { name: "Sword", source: "MG1E", range: "normal", qualities: ["Useful"], usefulScope: "FIGHT" }
});

export const MG1E_ARMOR_CATALOG = freeze({
  "light armor": {
    name: "Light Armor",
    source: "MG1E",
    dispositionDiceFight: 1,
    dispositionSuccessFight: 0,
    maneuverDiceFight: 0,
    feintDiceFight: 0,
    scoutDice: 0,
    survivalistDice: 0,
    stealthNatureDice: 0,
    fatigueRecoveryHealthDice: -1
  },
  "heavy armor": {
    name: "Heavy Armor",
    source: "MG1E",
    dispositionDiceFight: 0,
    dispositionSuccessFight: 1,
    maneuverDiceFight: -1,
    feintDiceFight: 0,
    scoutDice: -1,
    survivalistDice: 0,
    stealthNatureDice: -1,
    fatigueRecoveryHealthDice: -1
  }
});

export const REALM_GUARD_PLATED_ARMOR = freeze({
  name: "Plated Armor",
  source: "REALM_GUARD_V1_6",
  dispositionDiceFight: 0,
  dispositionSuccessFight: 1,
  maneuverDiceFight: -1,
  feintDiceFight: -1,
  scoutDice: -1,
  survivalistDice: -1,
  stealthNatureDice: 0,
  fatigueRecoveryHealthDice: -1,
  defendSuccessFight: 1
});

export const MG1E_WEAPONS_OF_WIT = freeze({
  "intimidation or deception": {
    name: "Intimidation or Deception",
    source: "MG1E",
    requiresRoleplay: true,
    actions: ["feint", "maneuver"],
    successBonus: 1
  },
  evidence: {
    name: "Evidence",
    source: "MG1E",
    requiresEvidence: true,
    actions: ["attack"],
    successBonus: 1
  },
  roleplay: {
    name: "Roleplay",
    source: "MG1E",
    requiresRoleplay: true,
    chooseAction: true,
    diceBonus: 1,
    scope: "ARGUMENT_OR_SPEECH"
  },
  promises: {
    name: "Promises",
    source: "MG1E",
    requiresPromise: true,
    actions: ["defend"],
    diceBonus: 1
  },
  "repeating yourself": {
    name: "Repeating Yourself",
    source: "MG1E",
    penalty: true,
    actions: [...ACTIONS],
    diceBonus: -1
  }
});

export function buildM10BGearInventoryConflictPolicy(capabilities) {
  const rules = capabilities?.rules ?? {};
  const inventory = rules.inventory ?? {};
  const conflict = rules.conflict ?? {};
  const actionSkills = conflict.actionSkills && typeof conflict.actionSkills === "object" ? conflict.actionSkills : {};
  const disposition = conflict.disposition && typeof conflict.disposition === "object" ? conflict.disposition : {};
  const alias = conflict.weaponAlias && typeof conflict.weaponAlias === "object" ? conflict.weaponAlias : {};
  const disarmTargetKinds = Array.isArray(conflict.disarmTargetKinds) ? [...conflict.disarmTargetKinds] : ["weapon", "gear", "trait", "natural"];
  const familySemantics = String(conflict.mode ?? "").toUpperCase().includes("MG1E");
  return freeze({
    phase: "M10B.5",
    profileId: String(capabilities?.profile?.id ?? ""),
    profileVersion: Number(capabilities?.profile?.version ?? 0),
    familySemantics,
    inventory: {
      policy: String(inventory.policy ?? "STRUCTURED").toUpperCase(),
      placementAuthority: inventory.placementAuthority !== false,
      placementPresentationOnly: inventory.placementPresentationOnly === true,
      capacityMode: String(inventory.capacityMode ?? "STRUCTURED_PLACEMENT"),
      preservePlacementMetadata: true,
      paperDollPresentationAllowed: true
    },
    conflict: {
      mode: String(conflict.mode ?? "PROFILE_DEFINED"),
      actionsPerExchange: Math.max(1, Number(conflict.actionsPerExchange ?? 3)),
      rotateParticipants: conflict.rotateParticipants !== false,
      helpAllowed: conflict.helpAllowed !== false,
      toolScope: String(conflict.toolScope ?? "PROFILE_DEFINED"),
      unarmedDefaultDice: Number(conflict.unarmedDefaultDice ?? (familySemantics ? 0 : -1)),
      toolContent: String(conflict.toolContent ?? (familySemantics ? "MG1E_2008" : "LEGACY_CURRENT")),
      armorContent: String(conflict.armorContent ?? (familySemantics ? "MG1E_LIGHT_HEAVY" : "LEGACY_CURRENT")),
      weaponAlias: { ...alias },
      weaponScope: String(conflict.weaponScope ?? conflict.toolScope ?? "PROFILE_DEFINED"),
      weaponsOfWit: conflict.weaponsOfWit !== false && familySemantics,
      disarmTargetKinds,
      scaleOfMightAware: conflict.scaleOfMightAware === true,
      actionSkills: Object.fromEntries(Object.entries(actionSkills).map(([type, row]) => [
        String(type),
        Object.fromEntries(ACTIONS.map(action => [action, normalizeSkillList(row?.[action])]))
      ])),
      disposition: Object.fromEntries(Object.entries(disposition).map(([type, row]) => [
        String(type),
        {
          skills: normalizeSkillList(row?.skills ?? row?.skill),
          bases: normalizeSkillList(row?.bases ?? row?.base),
          basePolicy: String(row?.basePolicy ?? "")
        }
      ]))
    },
    presentation: {
      ratedWises: rules.wises?.rated === true,
      mg1eTraitSemantics: rules.traits?.mg1eLevelSemantics === true,
      showTalents: capabilities?.presentation?.showTalents !== false,
      showTokensOfPower: capabilities?.presentation?.showTokensOfPower === true
    },
    preservePlacementMetadata: true,
    destructiveConversion: false
  });
}

export function getActiveM10BGearInventoryConflictPolicy() {
  return buildM10BGearInventoryConflictPolicy(getActiveProfileCapabilities());
}

export function resolveM10BGearInventoryConflictPolicy(profileId) {
  return buildM10BGearInventoryConflictPolicy(resolveProfileCapabilities(profileId));
}

function profileStub(policy) {
  return {
    id: policy.profileId || "profile",
    domains: { inventory: { policy: policy.inventory.policy } }
  };
}

function servicesFor(policy) {
  return createM5Services(profileStub(policy));
}

function aliasTarget(policy, name) {
  const key = normalize(name);
  for (const [from, to] of Object.entries(policy?.conflict?.weaponAlias ?? {})) {
    if (normalize(from) === key) return { from: String(from), to: String(to) };
    if (normalize(to) === key) return { from: String(from), to: String(to) };
  }
  return null;
}

function canonicalWeaponKey(name, policy) {
  const key = normalize(name);
  const alias = aliasTarget(policy, name);
  if (alias && normalize(alias.from) === "hook and line") return "hook and line";
  if (["hook and line", "hook & line", "whip"].includes(key)) return "hook and line";
  return key;
}

function weaponDisplayName(baseKey, policy) {
  if (baseKey === "hook and line") {
    const alias = Object.entries(policy?.conflict?.weaponAlias ?? {}).find(([from]) => normalize(from) === "hook and line");
    if (alias) return String(alias[1]);
  }
  return MG1E_WEAPON_CATALOG[baseKey]?.name ?? "";
}

function weaponPublicKey(baseKey, policy) {
  const display = normalize(weaponDisplayName(baseKey, policy));
  return baseKey === "hook and line" && display === "whip" ? "whip" : baseKey;
}

export function familyWeaponDefinition(name, { halberdMode = "" } = {}, policy = getActiveM10BGearInventoryConflictPolicy()) {
  if (!policy.familySemantics) return null;
  const baseKey = canonicalWeaponKey(name, policy);
  const base = MG1E_WEAPON_CATALOG[baseKey];
  if (!base) return null;
  const key = weaponPublicKey(baseKey, policy);
  const displayName = weaponDisplayName(baseKey, policy) || base.name;
  const source = baseKey === "hook and line" && displayName !== base.name
    ? "REALM_GUARD_V1_6_ALIAS_OF_MG1E_HOOK_AND_LINE"
    : base.source;
  const common = {
    key,
    baseKey,
    ...base,
    name: displayName,
    source,
    ...(displayName !== base.name ? { inheritedName: base.name } : {})
  };
  if (baseKey !== "halberd") return freeze(common);
  const mode = canonicalWeaponKey(halberdMode, policy);
  if (!["axe", "spear"].includes(mode)) {
    return freeze({ ...common, requiresModeChoice: true, selectedMode: "", modeOptions: ["axe", "spear"] });
  }
  return freeze({
    ...common,
    requiresModeChoice: false,
    selectedMode: mode,
    delegatedDefinition: familyWeaponDefinition(mode, {}, policy)
  });
}

function shorterThanMissile(range) {
  return Object.prototype.hasOwnProperty.call(RANGE_ORDER, range) && RANGE_ORDER[range] < RANGE_ORDER.missile;
}

function normalOrSpear(range) {
  return ["normal", "spear"].includes(String(range ?? ""));
}

export function familyWeaponActionPlan(name, action, context = {}, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const normalizedAction = ACTIONS.includes(normalize(action)) ? normalize(action) : "attack";
  const halberdMode = normalize(context.halberdMode ?? context.mode ?? "");
  const def = familyWeaponDefinition(name, { halberdMode }, policy);
  if (!def) return freeze({
    ok: false,
    reasonCode: "UNKNOWN_PROFILE_WEAPON",
    weaponName: String(name ?? ""),
    action: normalizedAction,
    profileId: policy.profileId,
    liveApplication: false
  });

  if (def.baseKey === "halberd") {
    if (def.requiresModeChoice) return freeze({
      ok: false,
      reasonCode: "HALBERD_MODE_REQUIRED",
      weaponName: def.name,
      action: normalizedAction,
      modeScope: "ACTION_SET",
      modeOptions: [...def.modeOptions],
      profileId: policy.profileId,
      liveApplication: false
    });
    const delegated = familyWeaponActionPlan(def.selectedMode, normalizedAction, context, policy);
    return freeze({
      ...delegated,
      ok: true,
      weaponName: def.name,
      source: def.source,
      halberdMode: def.selectedMode,
      modeScope: "ACTION_SET",
      delegatedWeapon: delegated.weaponName,
      notes: ["Halberd uses the selected MG1E Axe or Spear qualities for the whole action set.", ...(delegated.notes ?? [])],
      profileId: policy.profileId,
      liveApplication: false
    });
  }

  const opponentRange = normalize(context.opponentRange ?? "normal");
  const opponentAction = normalize(context.opponentAction ?? "");
  const successful = Boolean(context.successful);
  const thrown = Boolean(context.thrown);
  const swordUsefulAction = normalize(context.swordUsefulAction ?? "");
  let dice = 0;
  let conditionalSuccess = 0;
  let interactionOverride = null;
  let autoDisarm = false;
  let expendedAfterAction = false;
  const notes = [];

  switch (def.baseKey) {
    case "axe":
      if (normalizedAction === "attack" && successful) conditionalSuccess += 1;
      if (["defend", "feint"].includes(normalizedAction)) dice -= 1;
      break;
    case "bow":
      if (normalizedAction === "attack" && opponentAction === "attack" && shorterThanMissile(opponentRange)) interactionOverride = "versus";
      if (normalizedAction === "attack" && opponentAction === "maneuver" && shorterThanMissile(opponentRange)) interactionOverride = "independent";
      if (normalizedAction === "maneuver" && shorterThanMissile(opponentRange)) dice += 2;
      if (normalizedAction === "attack" && opponentAction === "defend") dice += 1;
      break;
    case "hook and line":
      if (normalizedAction === "maneuver") {
        dice += 1;
        if (successful) conditionalSuccess += 1;
      }
      if (normalizedAction === "attack") dice -= 1;
      break;
    case "knife":
      if (normalizedAction === "maneuver" && successful && ["spear", "thrown", "missile"].includes(opponentRange)) autoDisarm = true;
      if (thrown) {
        if (normalizedAction === "attack" && opponentAction === "attack" && normalOrSpear(opponentRange)) interactionOverride = "versus";
        if (normalizedAction === "attack" && opponentAction === "maneuver" && normalOrSpear(opponentRange)) interactionOverride = "independent";
        expendedAfterAction = true;
      }
      break;
    case "shield":
      if (normalizedAction === "defend") dice += 2;
      break;
    case "sling":
      if (normalizedAction === "attack" && opponentAction === "attack" && shorterThanMissile(opponentRange)) interactionOverride = "versus";
      if (normalizedAction === "attack" && opponentAction === "maneuver" && shorterThanMissile(opponentRange)) interactionOverride = "independent";
      if (normalizedAction === "maneuver") dice += 1;
      break;
    case "spear":
      if (normalizedAction === "attack" && opponentAction === "attack" && normalOrSpear(opponentRange)) interactionOverride = "versus";
      if (normalizedAction === "attack" && opponentAction === "maneuver" && normalOrSpear(opponentRange)) interactionOverride = "independent";
      if (normalizedAction === "maneuver" && opponentRange === "normal") dice += 1;
      break;
    case "staff":
      if (normalizedAction === "feint") dice += 1;
      if (thrown) {
        if (normalizedAction === "attack" && opponentAction === "attack" && normalOrSpear(opponentRange)) interactionOverride = "versus";
        if (normalizedAction === "attack" && opponentAction === "maneuver" && normalOrSpear(opponentRange)) interactionOverride = "independent";
        expendedAfterAction = true;
      }
      break;
    case "sword":
      if (swordUsefulAction && normalizedAction === swordUsefulAction) dice += 1;
      break;
    default:
      break;
  }

  const fatigueRecoveryHealthDice = def.baseKey === "shield" && Boolean(context.usedPreviousTurn) ? -1 : 0;
  if (fatigueRecoveryHealthDice) notes.push("Shield Heavy: -1D Health to recover from fatigue.");
  if (def.baseKey === "sword" && !swordUsefulAction) notes.push("Sword Useful requires one action choice for the remainder of the fight.");

  return freeze({
    ok: true,
    weaponKey: def.key,
    baseWeaponKey: def.baseKey,
    weaponName: def.name,
    source: def.source,
    action: normalizedAction,
    range: thrown && def.thrownRange ? def.thrownRange : def.range,
    dice,
    conditionalSuccess,
    interactionOverride,
    autoDisarm,
    expendedAfterAction,
    swordUsefulChoiceRequired: def.baseKey === "sword" && !swordUsefulAction,
    swordUsefulAction,
    fatigueRecoveryHealthDice,
    notes,
    profileId: policy.profileId,
    liveApplication: false
  });
}

function armorDefinition(name, policy) {
  const key = normalize(name);
  const isRealmGuard = String(policy?.conflict?.mode ?? "").toUpperCase().includes("REALM_GUARD");
  if (isRealmGuard) {
    if (["leather armor", "light armor"].includes(key)) return { key: "leather armor", baseKey: "light armor", ...MG1E_ARMOR_CATALOG["light armor"], name: "Leather Armor", source: "REALM_GUARD_V1_6_INHERITS_MG1E_LIGHT_ARMOR" };
    if (["chainmail", "chainmail armor", "heavy armor"].includes(key)) return { key: "chainmail armor", baseKey: "heavy armor", ...MG1E_ARMOR_CATALOG["heavy armor"], name: "Chainmail Armor", source: "REALM_GUARD_V1_6_INHERITS_MG1E_HEAVY_ARMOR" };
    if (key === "plated armor" && String(policy?.conflict?.armorContent ?? "").includes("PLATED")) return { key: "plated armor", baseKey: "plated armor", ...REALM_GUARD_PLATED_ARMOR };
    return null;
  }
  if (key === "light armor") return { key, baseKey: key, ...MG1E_ARMOR_CATALOG[key] };
  if (["heavy armor", "heavy"].includes(key)) return { key: "heavy armor", baseKey: "heavy armor", ...MG1E_ARMOR_CATALOG["heavy armor"] };
  return null;
}

export function familyArmorPlan(name, context = {}, policy = getActiveM10BGearInventoryConflictPolicy()) {
  if (!policy.familySemantics) return freeze({ ok: false, reasonCode: "PROFILE_ARMOR_NOT_ROUTED", armorName: String(name ?? ""), profileId: policy.profileId, liveApplication: false });
  const def = armorDefinition(name, policy);
  if (!def) return freeze({ ok: false, reasonCode: "UNKNOWN_PROFILE_ARMOR", armorName: String(name ?? ""), profileId: policy.profileId, liveApplication: false });
  const conflictType = normalize(context.conflictType ?? "");
  const action = normalize(context.action ?? "");
  const testName = normalize(context.testName ?? "");
  const purpose = normalize(context.purpose ?? "");
  const inFight = conflictType === "fight";
  let dice = 0;
  let conditionalSuccess = 0;

  if (inFight && action === "maneuver") dice += Number(def.maneuverDiceFight ?? 0);
  if (inFight && action === "feint") dice += Number(def.feintDiceFight ?? 0);
  if (inFight && action === "defend") conditionalSuccess += Number(def.defendSuccessFight ?? 0);
  if (testName === "scout") dice += Number(def.scoutDice ?? 0);
  if (testName === "survivalist") dice += Number(def.survivalistDice ?? 0);
  if (testName === "nature" && Boolean(context.sneakingOrHiding)) dice += Number(def.stealthNatureDice ?? 0);
  if (testName === "health" && purpose === "fatigue-recovery" && Boolean(context.usedPreviousTurn)) dice += Number(def.fatigueRecoveryHealthDice ?? 0);

  return freeze({
    ok: true,
    armorKey: def.key,
    baseArmorKey: def.baseKey,
    armorName: def.name,
    source: def.source,
    dispositionDice: inFight ? Number(def.dispositionDiceFight ?? 0) : 0,
    dispositionSuccess: inFight ? Number(def.dispositionSuccessFight ?? 0) : 0,
    dice,
    conditionalSuccess,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyInventoryPolicyPlan(actor, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const gear = itemsOf(actor).filter(item => item?.type === "gear");
  const withPlacementMetadata = gear.filter(item => {
    const inv = item?.system?.inventory ?? {};
    return normalize(inv.mode ?? "unassigned") !== "unassigned" || Boolean(inv.location) || Boolean(inv.containerId);
  });
  return freeze({
    policy: policy.inventory.policy,
    slotPlacementAuthority: policy.inventory.placementAuthority,
    paperDollPresentationAllowed: policy.inventory.paperDollPresentationAllowed,
    preservePlacementMetadata: true,
    capacityMode: policy.inventory.capacityMode,
    gearItems: gear.length,
    gearItemsWithPlacementMetadata: withPlacementMetadata.length,
    writesPlanned: 0,
    destructive: false,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyAvailableConflictTools(actor, options = {}, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const services = servicesFor(policy);
  const rows = services.conflictTools.list(actor, options).map(tool => {
    if (tool.source === "physical-gear") {
      return freeze({
        ...tool,
        effects: policy.familySemantics ? [] : tool.effects,
        profileWeapon: familyWeaponDefinition(tool.name, {}, policy),
        placementAuthority: policy.inventory.placementAuthority
      });
    }
    return freeze({ ...tool, placementAuthority: policy.inventory.placementAuthority });
  });
  return freeze(rows);
}

export function familyConflictToolPlan(actor, {
  toolId = "",
  action = "attack",
  conflictType = "fight",
  conflictId = "",
  disabled = [],
  requirementMet = true,
  swordUsefulAction = "",
  opponentRange = "normal",
  opponentAction = "",
  successful = false,
  thrown = false,
  halberdMode = ""
} = {}, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const services = servicesFor(policy);
  if (!toolId) return freeze({
    ok: true,
    tool: null,
    dice: Number(policy.conflict.unarmedDefaultDice ?? 0),
    conditionalSuccess: 0,
    successPenalty: 0,
    notes: [Number(policy.conflict.unarmedDefaultDice ?? 0) === 0
      ? "MG1E-family: no universal unarmed / no-tool penalty."
      : `Profile unarmed / no-tool modifier: ${Number(policy.conflict.unarmedDefaultDice)}D.`],
    coreDefaultUnarmedPenalty: Number(policy.conflict.unarmedDefaultDice ?? 0),
    activeProfileUnarmedPenalty: Number(policy.conflict.unarmedDefaultDice ?? 0),
    profileId: policy.profileId,
    liveApplication: false
  });

  const tool = services.conflictTools.resolve(actor, toolId, { conflictType, conflictId, disabled });
  if (!tool) return freeze({
    ok: false,
    reasonCode: "PROFILE_CONFLICT_TOOL_NOT_AVAILABLE",
    toolId: String(toolId),
    dice: 0,
    conditionalSuccess: 0,
    successPenalty: 0,
    profileId: policy.profileId,
    liveApplication: false
  });

  if (tool.source === "physical-gear" && policy.familySemantics) {
    const weapon = familyWeaponActionPlan(tool.name, action, {
      opponentRange,
      opponentAction,
      successful,
      thrown,
      swordUsefulAction,
      halberdMode
    }, policy);
    return freeze({
      ok: weapon.ok,
      tool,
      ...weapon,
      successPenalty: 0,
      profileId: policy.profileId,
      liveApplication: false
    });
  }

  const evaluated = services.conflictTools.evaluate(actor, {
    toolId,
    action,
    requirementMet,
    swordUsefulAction,
    disabled,
    conflictType,
    conflictId
  });
  return freeze({ ok: true, ...evaluated, profileId: policy.profileId, liveApplication: false });
}

export function familyGearRelevancePlan(item, { gmApproved = false } = {}, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const isGear = item?.type === "gear";
  return freeze({
    itemId: itemId(item) || null,
    itemName: String(item?.name ?? "Gear"),
    eligible: isGear,
    gmApprovalRequired: true,
    gmApproved: Boolean(gmApproved),
    automatic: false,
    dice: isGear && gmApproved ? 1 : 0,
    reasonCode: isGear
      ? (gmApproved ? "GM_APPROVED_RELEVANT_GEAR" : "GM_RELEVANCE_DECISION_REQUIRED")
      : "NOT_GEAR",
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyDisarmTargets(actor, options = {}, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const services = servicesFor(policy);
  const base = services.conflictTools.disableTargets(actor, options).map(row => ({ ...row }));
  const byProvider = new Map(base.map(row => [String(row.providerId), row]));

  for (const gear of itemsOf(actor).filter(item => item?.type === "gear")) {
    const rawId = itemId(gear);
    const providerId = `gear:${rawId}`;
    if (!rawId || byProvider.has(providerId)) continue;
    byProvider.set(providerId, { providerId, rawId, name: String(gear?.name ?? "Gear"), kind: "gear" });
  }

  const targets = [...byProvider.values()].filter(row => policy.conflict.disarmTargetKinds.includes(String(row.kind ?? "")))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return freeze({
    targets,
    targetKinds: [...new Set(targets.map(row => row.kind))],
    gmChoiceRequired: targets.length > 0,
    duration: "REMAINDER_OF_CONFLICT",
    allowWeapon: policy.conflict.disarmTargetKinds.includes("weapon"),
    allowGear: policy.conflict.disarmTargetKinds.includes("gear"),
    allowTrait: policy.conflict.disarmTargetKinds.includes("trait"),
    allowNaturalWeapon: policy.conflict.disarmTargetKinds.includes("natural"),
    writesPlanned: 0,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyWeaponOfWitPlan(name, action, context = {}, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const key = normalize(name);
  const def = MG1E_WEAPONS_OF_WIT[key];
  const normalizedAction = ACTIONS.includes(normalize(action)) ? normalize(action) : "attack";
  if (!policy.conflict.weaponsOfWit) return freeze({ ok: false, reasonCode: "WEAPONS_OF_WIT_DISABLED", name: String(name ?? ""), action: normalizedAction, profileId: policy.profileId, liveApplication: false });
  if (!def) return freeze({ ok: false, reasonCode: "UNKNOWN_WEAPON_OF_WIT", name: String(name ?? ""), action: normalizedAction, profileId: policy.profileId, liveApplication: false });

  const actionAllowed = !def.actions || def.actions.includes(normalizedAction);
  const requirementMet =
    (!def.requiresRoleplay || Boolean(context.playedOut ?? context.roleplayed))
    && (!def.requiresEvidence || Boolean(context.evidenceEstablished))
    && (!def.requiresPromise || Boolean(context.promiseMade))
    && (!def.chooseAction || normalize(context.chosenAction ?? "") === normalizedAction);

  const active = actionAllowed && (def.penalty ? Boolean(context.repeating) : requirementMet);
  return freeze({
    ok: true,
    name: def.name,
    source: def.source,
    action: normalizedAction,
    active,
    dice: active ? Number(def.diceBonus ?? 0) : 0,
    conditionalSuccess: active && Boolean(context.successful) ? Number(def.successBonus ?? 0) : 0,
    gmOrTableValidationRequired: !def.penalty,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyConflictActionSkills(conflictType, action, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const type = String(conflictType ?? "");
  const key = ACTIONS.includes(normalize(action)) ? normalize(action) : "attack";
  const skills = policy.conflict.actionSkills?.[type]?.[key] ?? [];
  return freeze({ profileId: policy.profileId, conflictType: type, action: key, skills: [...skills], source: policy.familySemantics ? "PROFILE" : "LEGACY_CURRENT" });
}

export function familyConflictDispositionPlan(conflictType, policy = getActiveM10BGearInventoryConflictPolicy()) {
  const type = String(conflictType ?? "");
  const row = policy.conflict.disposition?.[type] ?? { skills: [], bases: [], basePolicy: "" };
  return freeze({
    profileId: policy.profileId,
    conflictType: type,
    skills: [...(row.skills ?? [])],
    bases: [...(row.bases ?? [])],
    basePolicy: String(row.basePolicy ?? ""),
    source: policy.familySemantics ? "PROFILE" : "LEGACY_CURRENT"
  });
}

export function getM10B5GearInventoryConflictStatus() {
  const policy = getActiveM10BGearInventoryConflictPolicy();
  return freeze({
    phase: "M10B.5",
    activeProfileId: policy.profileId,
    familySemantics: policy.familySemantics,
    inventory: policy.inventory,
    conflict: {
      mode: policy.conflict.mode,
      actionsPerExchange: policy.conflict.actionsPerExchange,
      toolScope: policy.conflict.toolScope,
      unarmedDefaultDice: policy.conflict.unarmedDefaultDice,
      actionSkillTypes: Object.keys(policy.conflict.actionSkills),
      dispositionTypes: Object.keys(policy.conflict.disposition),
      weaponsOfWit: policy.conflict.weaponsOfWit,
      scaleOfMightAware: policy.conflict.scaleOfMightAware
    },
    preservePlacementMetadata: true,
    destructiveConversion: false
  });
}
