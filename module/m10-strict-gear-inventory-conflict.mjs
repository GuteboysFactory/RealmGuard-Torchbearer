import {
  MG1E_WEAPON_CATALOG,
  MG1E_ARMOR_CATALOG,
  REALM_GUARD_PLATED_ARMOR,
  MG1E_WEAPONS_OF_WIT,
  resolveM10BGearInventoryConflictPolicy,
  familyWeaponDefinition,
  familyWeaponActionPlan,
  familyArmorPlan,
  familyInventoryPolicyPlan,
  familyAvailableConflictTools,
  familyConflictToolPlan,
  familyGearRelevancePlan,
  familyDisarmTargets,
  familyWeaponOfWitPlan
} from "./m10b-gear-inventory-conflict.mjs";

const strictPolicy = () => resolveM10BGearInventoryConflictPolicy("realm-guard-strict");

export const STRICT_WEAPON_CATALOG = Object.freeze({
  ...MG1E_WEAPON_CATALOG,
  whip: Object.freeze({
    ...MG1E_WEAPON_CATALOG["hook and line"],
    name: "Whip",
    source: "REALM_GUARD_V1_6_ALIAS_OF_MG1E_HOOK_AND_LINE",
    inheritedName: "Hook and Line"
  })
});

export const STRICT_ARMOR_CATALOG = Object.freeze({
  "leather armor": Object.freeze({
    ...MG1E_ARMOR_CATALOG["light armor"],
    name: "Leather Armor",
    source: "REALM_GUARD_V1_6_INHERITS_MG1E_LIGHT_ARMOR"
  }),
  "chainmail armor": Object.freeze({
    ...MG1E_ARMOR_CATALOG["heavy armor"],
    name: "Chainmail Armor",
    source: "REALM_GUARD_V1_6_INHERITS_MG1E_HEAVY_ARMOR"
  }),
  "plated armor": REALM_GUARD_PLATED_ARMOR
});

export const STRICT_WEAPONS_OF_WIT = MG1E_WEAPONS_OF_WIT;

export function strictWeaponDefinition(name, options = {}) {
  return familyWeaponDefinition(name, options, strictPolicy());
}

export function strictWeaponActionPlan(name, action, context = {}) {
  return familyWeaponActionPlan(name, action, context, strictPolicy());
}

export function strictArmorPlan(name, context = {}) {
  return familyArmorPlan(name, context, strictPolicy());
}

export function strictInventoryPolicyPlan(actor) {
  return familyInventoryPolicyPlan(actor, strictPolicy());
}

export function strictAvailableConflictTools(actor, options = {}) {
  return familyAvailableConflictTools(actor, options, strictPolicy()).map(tool => Object.freeze({
    ...tool,
    strictWeapon: tool.profileWeapon ?? null
  }));
}

export function strictConflictToolPlan(actor, options = {}) {
  return familyConflictToolPlan(actor, options, strictPolicy());
}

export function strictGearRelevancePlan(item, options = {}) {
  return familyGearRelevancePlan(item, options, strictPolicy());
}

export function strictDisarmTargets(actor, options = {}) {
  return familyDisarmTargets(actor, options, strictPolicy());
}

export function strictWeaponOfWitPlan(name, action, context = {}) {
  return familyWeaponOfWitPlan(name, action, context, strictPolicy());
}

export function getStrictGearInventoryConflictStatus() {
  const policy = strictPolicy();
  return Object.freeze({
    phase: "M10A.4_COMPAT_WRAPPER",
    compatibilityProvider: "M10B.5_GENERIC_FAMILY",
    liveAuthority: false,
    activeProfileRequired: "realm-guard-strict",
    inventory: Object.freeze({
      policy: policy.inventory.policy,
      slotPlacementAuthority: policy.inventory.placementAuthority,
      preservePlacementMetadata: true,
      paperDollPresentationAllowed: true
    }),
    conflict: Object.freeze({
      source: "MG1E_2008_PLUS_REALM_GUARD_V1_6_OVERRIDES",
      weaponScope: policy.conflict.weaponScope,
      whipAliasOfHookAndLine: policy.conflict.weaponAlias["Hook and Line"] === "Whip",
      unarmedDefaultDice: policy.conflict.unarmedDefaultDice,
      multipleToolEffects: true,
      weaponsOfWit: policy.conflict.weaponsOfWit,
      disarmTargets: [...policy.conflict.disarmTargetKinds]
    }),
    armor: Object.freeze({
      leather: "MG1E_LIGHT_ARMOR",
      chainmail: "MG1E_HEAVY_ARMOR",
      plated: "REALM_GUARD_V1_6"
    }),
    writesActors: false,
    writesItems: false,
    liveApplication: false,
    nextStep: "Compatibility wrapper delegates to M10B.5 generic Gear / Inventory / Conflict routing"
  });
}
