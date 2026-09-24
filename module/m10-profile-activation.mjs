import { LEGACY_PROFILE_ID, LEGACY_PROFILE_VERSION } from "./core-baseline.mjs";
import { getRulesProfileRuntime, refreshRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";

const NS = "realm-guard";
const PROFILE_ID_KEY = "activeRulesProfileId";
const PROFILE_VERSION_KEY = "activeRulesProfileVersion";

export const STRICT_PROFILE_ID = "realm-guard-strict";

function qaRuntime() {
  return String(globalThis.game?.system?.version ?? "").includes("-qa.");
}

export function activeRulesProfileId() {
  try {
    return String(globalThis.game?.settings?.get?.(NS, PROFILE_ID_KEY) ?? "") || LEGACY_PROFILE_ID;
  } catch (_error) {
    return LEGACY_PROFILE_ID;
  }
}

export function activeRulesProfileVersion() {
  try {
    return Number(globalThis.game?.settings?.get?.(NS, PROFILE_VERSION_KEY) ?? LEGACY_PROFILE_VERSION);
  } catch (_error) {
    return LEGACY_PROFILE_VERSION;
  }
}

export function isStrictRealmGuard() {
  return activeRulesProfileId() === STRICT_PROFILE_ID;
}

export function isLegacyMixed() {
  return activeRulesProfileId() === LEGACY_PROFILE_ID;
}

export function strictActivationAvailable() {
  const strict = resolveRulesProfile(STRICT_PROFILE_ID).profile;
  return Boolean(
    qaRuntime()
    && strict?.metadata?.selectable !== false
    && strict?.metadata?.supported !== false
    && strict?.metadata?.activationState === "QA_ACTIVE"
  );
}

export function profileActivationStatus() {
  const active = getRulesProfileRuntime().profile;
  const strict = resolveRulesProfile(STRICT_PROFILE_ID).profile;
  return Object.freeze({
    phase: "M10A.8",
    activeProfileId: active.id,
    activeProfileVersion: active.version,
    activeSnapshotHash: active.rulesSnapshotHash,
    strictProfileId: strict.id,
    strictProfileVersion: strict.version,
    strictActivationState: strict.metadata?.activationState ?? "",
    strictSelectable: strict.metadata?.selectable !== false,
    strictSupported: strict.metadata?.supported !== false,
    strictRulesLive: isStrictRealmGuard(),
    qaSwitchAvailable: strictActivationAvailable(),
    switchBackToLegacyAvailable: active.id !== LEGACY_PROFILE_ID,
    actorWritesOnSwitch: 0,
    itemWritesOnSwitch: 0,
    journalWritesOnSwitch: 0,
    worldSettingWritesOnSwitch: active.id === LEGACY_PROFILE_ID ? 2 : 2,
    reloadRecommended: true
  });
}

async function writeProfileSettings(profile) {
  await globalThis.game.settings.set(NS, PROFILE_ID_KEY, profile.id);
  await globalThis.game.settings.set(NS, PROFILE_VERSION_KEY, profile.version);
}

async function restoreProfileSettings(id, version) {
  await globalThis.game.settings.set(NS, PROFILE_ID_KEY, id);
  await globalThis.game.settings.set(NS, PROFILE_VERSION_KEY, version);
}

export async function switchRulesProfile(targetProfileId, { requireQa = true } = {}) {
  if (!globalThis.game?.user?.isGM) throw new Error("Rules Profile switching is GM-only.");
  const targetId = String(targetProfileId ?? "").trim();
  if (![LEGACY_PROFILE_ID, STRICT_PROFILE_ID].includes(targetId)) throw new Error(`Unsupported Rules Profile '${targetId}'.`);
  if (targetId === STRICT_PROFILE_ID && requireQa && !qaRuntime()) throw new Error("Strict Realm Guard activation is QA-only in M10A.8.");

  const target = resolveRulesProfile(targetId).profile;
  if (target.metadata?.selectable === false) throw new Error(`${target.name} is not selectable.`);
  if (target.metadata?.supported === false) throw new Error(`${target.name} is not marked supported.`);

  const beforeId = activeRulesProfileId();
  const beforeVersion = activeRulesProfileVersion();
  const before = resolveRulesProfile(beforeId).profile;

  if (before.id === target.id && beforeVersion === target.version) {
    return Object.freeze({
      changed:false,
      from:{id:before.id,version:beforeVersion},
      to:{id:target.id,version:target.version},
      reloadRecommended:true
    });
  }

  try {
    await writeProfileSettings(target);
    const runtime = refreshRulesProfileRuntime();
    const event = Object.freeze({
      phase:"M10A.8",
      fromProfileId:before.id,
      fromProfileVersion:beforeVersion,
      toProfileId:runtime.profile.id,
      toProfileVersion:runtime.profile.version,
      rulesSnapshotHash:runtime.profile.rulesSnapshotHash,
      actorWrites:0,
      itemWrites:0,
      journalWrites:0,
      settingWrites:2,
      reloadRecommended:true,
      at:Date.now()
    });
    try { globalThis.Hooks?.callAll?.("realmGuardRulesProfileChanged", event); } catch (_ignored) {}
    return Object.freeze({ changed:true, ...event });
  } catch (error) {
    try {
      await restoreProfileSettings(beforeId, beforeVersion);
      refreshRulesProfileRuntime();
    } catch (rollbackError) {
      const wrapped = new Error(`Rules Profile switch failed and rollback also failed: ${rollbackError?.message ?? rollbackError}`);
      wrapped.cause = error;
      throw wrapped;
    }
    throw error;
  }
}

export async function switchToStrictRealmGuard() {
  return switchRulesProfile(STRICT_PROFILE_ID, { requireQa:true });
}

export async function switchToLegacyMixed() {
  return switchRulesProfile(LEGACY_PROFILE_ID, { requireQa:false });
}
