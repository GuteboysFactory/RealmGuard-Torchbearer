const SYSTEM_ID = "realm-guard";

export const PHYSICAL_CONFLICT_WEAPON_NAMES = Object.freeze(new Set([
  "axe", "bow", "halberd", "whip", "hook and line", "knife", "shield", "sling", "spear", "staff", "sword"
]));

function normalizedName(value) {
  return String(value ?? "").trim().toLowerCase();
}

function conflictTypes(tool) {
  const raw = Array.isArray(tool?.conflictTypes) ? tool.conflictTypes : [tool?.conflictType || "*"];
  return raw.map(type => String(type ?? "").trim());
}

export function isPhysicalNameFightTool(tool) {
  if (!tool || !PHYSICAL_CONFLICT_WEAPON_NAMES.has(normalizedName(tool.name))) return false;
  const types = conflictTypes(tool);
  return types.includes("*") || types.includes("fight") || types.includes("fightCreature");
}

export function filterConflictToolsForPhysicalSource(tools) {
  if (!Array.isArray(tools)) return tools;
  return tools.filter(tool => !isPhysicalNameFightTool(tool));
}

export function installConflictPhysicalSourceGuard(ActorClass) {
  const proto = ActorClass?.prototype;
  if (!proto?.getFlag || proto.__rgPhysicalConflictSourceGuard) return false;

  const originalGetFlag = proto.getFlag;
  Object.defineProperty(proto, "__rgPhysicalConflictSourceGuard", { value: true, configurable: false });
  proto.getFlag = function realmGuardPhysicalConflictSourceGetFlag(namespace, key, ...rest) {
    const value = originalGetFlag.call(this, namespace, key, ...rest);
    if (namespace !== SYSTEM_ID || key !== "conflictTools") return value;
    return filterConflictToolsForPhysicalSource(value);
  };
  return true;
}
