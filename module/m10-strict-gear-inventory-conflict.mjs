import { createM5Services, INVENTORY_MODES } from "./core/m5-services.mjs";

const ACTIONS = Object.freeze(["attack", "defend", "feint", "maneuver"]);
const RANGE_ORDER = Object.freeze({ normal: 0, spear: 1, thrown: 2, missile: 3 });
const STRICT_PROFILE_STUB = Object.freeze({
  id: "realm-guard-strict",
  domains: Object.freeze({ inventory: Object.freeze({ policy: INVENTORY_MODES.LOOSE }) })
});

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

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

function canonicalWeaponName(name) {
  const key = normalize(name);
  if (["hook and line", "hook & line", "whip"].includes(key)) return "whip";
  return key;
}

export const STRICT_WEAPON_CATALOG = freeze({
  axe: {
    name: "Axe",
    source: "MG1E",
    range: "normal",
    qualities: ["Deadly", "Slow"]
  },
  bow: {
    name: "Bow",
    source: "MG1E",
    range: "missile",
    qualities: ["Missile", "Long Range", "Hard to Defend"]
  },
  halberd: {
    name: "Halberd",
    source: "MG1E",
    range: "choice",
    qualities: ["Versatile"],
    modes: ["axe", "spear"],
    modeScope: "ACTION_SET"
  },
  whip: {
    name: "Whip",
    source: "REALM_GUARD_V1_6_ALIAS_OF_MG1E_HOOK_AND_LINE",
    range: "normal",
    qualities: ["Hooked", "Unwieldy"],
    inheritedName: "Hook and Line"
  },
  knife: {
    name: "Knife",
    source: "MG1E",
    range: "normal",
    thrownRange: "thrown",
    qualities: ["Short and Quick", "Thrown"]
  },
  shield: {
    name: "Shield",
    source: "MG1E",
    range: "normal",
    qualities: ["Protection", "Heavy"]
  },
  sling: {
    name: "Sling",
    source: "MG1E",
    range: "missile",
    qualities: ["Missile", "Medium Range"]
  },
  spear: {
    name: "Spear",
    source: "MG1E",
    range: "spear",
    qualities: ["Spear"]
  },
  staff: {
    name: "Staff",
    source: "MG1E",
    range: "normal",
    thrownRange: "thrown",
    qualities: ["Handy", "Thrown"]
  },
  sword: {
    name: "Sword",
    source: "MG1E",
    range: "normal",
    qualities: ["Useful"],
    usefulScope: "FIGHT"
  }
});

export const STRICT_ARMOR_CATALOG = freeze({
  "leather armor": {
    name: "Leather Armor",
    source: "REALM_GUARD_V1_6_INHERITS_MG1E_LIGHT_ARMOR",
    dispositionDiceFight: 1,
    dispositionSuccessFight: 0,
    maneuverDiceFight: 0,
    feintDiceFight: 0,
    scoutDice: 0,
    survivalistDice: 0,
    stealthNatureDice: 0,
    fatigueRecoveryHealthDice: -1
  },
  "chainmail armor": {
    name: "Chainmail Armor",
    source: "REALM_GUARD_V1_6_INHERITS_MG1E_HEAVY_ARMOR",
    dispositionDiceFight: 0,
    dispositionSuccessFight: 1,
    maneuverDiceFight: -1,
    feintDiceFight: 0,
    scoutDice: -1,
    survivalistDice: 0,
    stealthNatureDice: -1,
    fatigueRecoveryHealthDice: -1
  },
  "plated armor": {
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
  }
});

export const STRICT_WEAPONS_OF_WIT = freeze({
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

function armorKey(name) {
  const key = normalize(name);
  if (["leather armor", "light armor"].includes(key)) return "leather armor";
  if (["chainmail", "chainmail armor", "heavy armor"].includes(key)) return "chainmail armor";
  if (key === "plated armor") return "plated armor";
  return "";
}

export function strictWeaponDefinition(name, { halberdMode = "" } = {}) {
  const key = canonicalWeaponName(name);
  const base = STRICT_WEAPON_CATALOG[key];
  if (!base) return null;
  if (key !== "halberd") return freeze({ key, ...base });
  const mode = canonicalWeaponName(halberdMode);
  if (!["axe", "spear"].includes(mode)) {
    return freeze({
      key,
      ...base,
      requiresModeChoice: true,
      selectedMode: "",
      modeOptions: ["axe", "spear"]
    });
  }
  return freeze({
    key,
    ...base,
    requiresModeChoice: false,
    selectedMode: mode,
    delegatedDefinition: strictWeaponDefinition(mode)
  });
}

function shorterThanMissile(range) {
  return Object.prototype.hasOwnProperty.call(RANGE_ORDER, range) && RANGE_ORDER[range] < RANGE_ORDER.missile;
}

function normalOrSpear(range) {
  return ["normal", "spear"].includes(String(range ?? ""));
}

export function strictWeaponActionPlan(name, action, context = {}) {
  const normalizedAction = ACTIONS.includes(normalize(action)) ? normalize(action) : "attack";
  const halberdMode = normalize(context.halberdMode ?? context.mode ?? "");
  const def = strictWeaponDefinition(name, { halberdMode });
  if (!def) return freeze({
    ok: false,
    reasonCode: "UNKNOWN_STRICT_WEAPON",
    weaponName: String(name ?? ""),
    action: normalizedAction,
    liveApplication: false
  });

  if (def.key === "halberd") {
    if (def.requiresModeChoice) return freeze({
      ok: false,
      reasonCode: "HALBERD_MODE_REQUIRED",
      weaponName: def.name,
      action: normalizedAction,
      modeScope: "ACTION_SET",
      modeOptions: [...def.modeOptions],
      liveApplication: false
    });
    const delegated = strictWeaponActionPlan(def.selectedMode, normalizedAction, context);
    return freeze({
      ...delegated,
      ok: true,
      weaponName: def.name,
      source: def.source,
      halberdMode: def.selectedMode,
      modeScope: "ACTION_SET",
      delegatedWeapon: delegated.weaponName,
      notes: ["Halberd uses the selected MG1E Axe or Spear qualities for the whole action set.", ...(delegated.notes ?? [])],
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

  switch (def.key) {
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
    case "whip":
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

  if (def.key === "shield" && Boolean(context.usedPreviousTurn)) notes.push("Shield Heavy: -1D Health to recover from fatigue.");
  if (def.key === "sword" && !swordUsefulAction) notes.push("Sword Useful requires one action choice for the remainder of the fight.");

  return freeze({
    ok: true,
    weaponKey: def.key,
    weaponName: def.name,
    source: def.source,
    action: normalizedAction,
    range: thrown && def.thrownRange ? def.thrownRange : def.range,
    dice,
    conditionalSuccess,
    interactionOverride,
    autoDisarm,
    expendedAfterAction,
    swordUsefulChoiceRequired: def.key === "sword" && !swordUsefulAction,
    swordUsefulAction,
    notes,
    liveApplication: false
  });
}

export function strictArmorPlan(name, context = {}) {
  const key = armorKey(name);
  const def = key ? STRICT_ARMOR_CATALOG[key] : null;
  if (!def) return freeze({ ok: false, reasonCode: "UNKNOWN_STRICT_ARMOR", armorName: String(name ?? ""), liveApplication: false });
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
    armorKey: key,
    armorName: def.name,
    source: def.source,
    dispositionDice: inFight ? Number(def.dispositionDiceFight ?? 0) : 0,
    dispositionSuccess: inFight ? Number(def.dispositionSuccessFight ?? 0) : 0,
    dice,
    conditionalSuccess,
    liveApplication: false
  });
}

export function strictInventoryPolicyPlan(actor) {
  const gear = itemsOf(actor).filter(item => item?.type === "gear");
  const withPlacementMetadata = gear.filter(item => {
    const inv = item?.system?.inventory ?? {};
    return normalize(inv.mode ?? "unassigned") !== "unassigned" || Boolean(inv.location) || Boolean(inv.containerId);
  });
  return freeze({
    policy: INVENTORY_MODES.LOOSE,
    slotPlacementAuthority: false,
    paperDollPresentationAllowed: true,
    preservePlacementMetadata: true,
    gearItems: gear.length,
    gearItemsWithPlacementMetadata: withPlacementMetadata.length,
    writesPlanned: 0,
    destructive: false,
    liveApplication: false
  });
}

function strictServices() {
  return createM5Services(STRICT_PROFILE_STUB);
}

export function strictAvailableConflictTools(actor, options = {}) {
  const services = strictServices();
  const rows = services.conflictTools.list(actor, options).map(tool => {
    if (tool.source === "physical-gear") {
      return freeze({
        ...tool,
        effects: [],
        strictWeapon: strictWeaponDefinition(tool.name),
        placementAuthority: false
      });
    }
    return freeze({ ...tool, placementAuthority: false });
  });
  return freeze(rows);
}

export function strictConflictToolPlan(actor, {
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
} = {}) {
  const services = strictServices();
  if (!toolId) return freeze({
    ok: true,
    tool: null,
    dice: 0,
    conditionalSuccess: 0,
    successPenalty: 0,
    notes: ["Strict Realm Guard: no universal unarmed / no-tool penalty."],
    coreDefaultUnarmedPenalty: 0,
    activeProfileUnarmedPenalty: 0,
    liveApplication: false
  });

  const tool = services.conflictTools.resolve(actor, toolId, { conflictType, conflictId, disabled });
  if (!tool) return freeze({
    ok: false,
    reasonCode: "STRICT_CONFLICT_TOOL_NOT_AVAILABLE",
    toolId: String(toolId),
    dice: 0,
    conditionalSuccess: 0,
    successPenalty: 0,
    liveApplication: false
  });

  if (tool.source === "physical-gear") {
    const weapon = strictWeaponActionPlan(tool.name, action, {
      opponentRange,
      opponentAction,
      successful,
      thrown,
      swordUsefulAction,
      halberdMode
    });
    return freeze({
      ok: weapon.ok,
      tool,
      ...weapon,
      successPenalty: 0,
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
  return freeze({ ok: true, ...evaluated, liveApplication: false });
}

export function strictGearRelevancePlan(item, { gmApproved = false } = {}) {
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
    liveApplication: false
  });
}

export function strictDisarmTargets(actor, options = {}) {
  const services = strictServices();
  const base = services.conflictTools.disableTargets(actor, options).map(row => ({ ...row }));
  const byProvider = new Map(base.map(row => [String(row.providerId), row]));

  for (const gear of itemsOf(actor).filter(item => item?.type === "gear")) {
    const rawId = itemId(gear);
    const providerId = `gear:${rawId}`;
    if (!rawId || byProvider.has(providerId)) continue;
    byProvider.set(providerId, {
      providerId,
      rawId,
      name: String(gear?.name ?? "Gear"),
      kind: "gear"
    });
  }

  const targets = [...byProvider.values()].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return freeze({
    targets,
    targetKinds: [...new Set(targets.map(row => row.kind))],
    gmChoiceRequired: targets.length > 0,
    duration: "REMAINDER_OF_CONFLICT",
    allowWeapon: true,
    allowGear: true,
    allowTrait: true,
    allowNaturalWeapon: true,
    writesPlanned: 0,
    liveApplication: false
  });
}

export function strictWeaponOfWitPlan(name, action, context = {}) {
  const key = normalize(name);
  const def = STRICT_WEAPONS_OF_WIT[key];
  const normalizedAction = ACTIONS.includes(normalize(action)) ? normalize(action) : "attack";
  if (!def) return freeze({ ok: false, reasonCode: "UNKNOWN_WEAPON_OF_WIT", name: String(name ?? ""), action: normalizedAction, liveApplication: false });

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
    liveApplication: false
  });
}

export function getStrictGearInventoryConflictStatus() {
  return freeze({
    phase: "M10A.4",
    liveAuthority: false,
    activeProfileRequired: "realm-guard-strict",
    inventory: {
      policy: "LOOSE",
      slotPlacementAuthority: false,
      preservePlacementMetadata: true,
      paperDollPresentationAllowed: true
    },
    conflict: {
      source: "MG1E_2008_PLUS_REALM_GUARD_V1_6_OVERRIDES",
      weaponScope: "ACTION_SET",
      whipAliasOfHookAndLine: true,
      unarmedDefaultDice: 0,
      multipleToolEffects: true,
      weaponsOfWit: true,
      disarmTargets: ["weapon", "gear", "trait", "natural"]
    },
    armor: {
      leather: "MG1E_LIGHT_ARMOR",
      chainmail: "MG1E_HEAVY_ARMOR",
      plated: "REALM_GUARD_V1_6"
    },
    writesActors: false,
    writesItems: false,
    liveApplication: false,
    nextStep: "M10A.5 Session / Circles / Progression"
  });
}
