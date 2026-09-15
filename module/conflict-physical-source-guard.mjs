const SYSTEM_ID = "realm-guard";
const CONFLICT_SETTING = "conflictState";

export const PHYSICAL_CONFLICT_WEAPON_NAMES = Object.freeze(new Set([
  "axe", "bow", "halberd", "whip", "hook and line", "knife", "shield", "sling", "spear", "staff", "sword"
]));

function normalizedName(value) {
  return String(value ?? "").trim().toLowerCase();
}

function currentConflictType() {
  try {
    const raw = globalThis.game?.settings?.get?.(SYSTEM_ID, CONFLICT_SETTING);
    const state = raw ? JSON.parse(raw) : null;
    return state?.active ? String(state.type ?? "") : "";
  } catch (_error) {
    return "";
  }
}

function appliesToConflict(tool, conflictType) {
  const types = Array.isArray(tool?.conflictTypes) ? tool.conflictTypes : [tool?.conflictType || "*"];
  return types.map(type => String(type ?? "")).some(type => type === "*" || type === conflictType);
}

export function isGhostPhysicalFightTool(tool, conflictType = currentConflictType()) {
  if (!["fight", "fightCreature"].includes(String(conflictType))) return false;
  if (!tool || !PHYSICAL_CONFLICT_WEAPON_NAMES.has(normalizedName(tool.name))) return false;
  return appliesToConflict(tool, conflictType);
}

export function filterConflictToolsForPhysicalSource(tools, conflictType = currentConflictType()) {
  if (!Array.isArray(tools)) return tools;
  return tools.filter(tool => !isGhostPhysicalFightTool(tool, conflictType));
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
