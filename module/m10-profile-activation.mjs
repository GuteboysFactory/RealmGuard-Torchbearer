import { LEGACY_PROFILE_ID, LEGACY_PROFILE_VERSION } from "./core-baseline.mjs";
import { getRulesProfileRuntime, refreshRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";

const NS = "realm-guard";
const PROFILE_ID_KEY = "activeRulesProfileId";
const PROFILE_VERSION_KEY = "activeRulesProfileVersion";
const LIVE_ACTIVATION_STATES = Object.freeze(["SUPPORTED", "STABLE", "ACTIVE", "QA_ACTIVE"]);

export const STRICT_PROFILE_ID = "realm-guard-strict";
export const MG1E_PROFILE_ID = "mg1e";
export const MG2E_PROFILE_ID = "mg2e";

export function qaProfileActivationRuntime() {
  const version = String(globalThis.game?.system?.version ?? "");
  return /-qa(?:\.|-|$)/i.test(version);
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

export function profileActivationAvailable(profileId) {
  const profile = resolveRulesProfile(profileId).profile;
  if (profile.id === LEGACY_PROFILE_ID) return true;
  const activationState = String(profile?.metadata?.activationState ?? "").toUpperCase();
  const qaOnly = profile?.metadata?.qaActivationOnly === true || activationState === "QA_ACTIVE";
  return Boolean(
    profile?.metadata?.foundationOnly !== true
    && profile?.metadata?.selectable !== false
    && profile?.metadata?.supported !== false
    && LIVE_ACTIVATION_STATES.includes(activationState)
    && (!qaOnly || qaProfileActivationRuntime())
    && (profile.id !== MG2E_PROFILE_ID || (profile.metadata?.explicitActivationAuthorized === true && profile.metadata?.liveParityVerified === true))
  );
}

export function strictActivationAvailable() {
  return profileActivationAvailable(STRICT_PROFILE_ID);
}

export function activationProfileSummary(profileId) {
  const profile = resolveRulesProfile(profileId).profile;
  return Object.freeze({
    id: profile.id,
    version: profile.version,
    name: profile.name,
    activationState: profile.metadata?.activationState ?? (profile.id === LEGACY_PROFILE_ID ? "COMPATIBILITY" : ""),
    foundationOnly: profile.metadata?.foundationOnly === true,
    selectable: profile.metadata?.selectable !== false,
    supported: profile.metadata?.supported !== false,
    active: activeRulesProfileId() === profile.id,
    activationAvailable: profileActivationAvailable(profile.id),
    conversionPreviewAvailable: profile.metadata?.conversionPreviewAvailable === true,
    qaActivationOnly: profile.metadata?.qaActivationOnly === true,
    qaRuntime: qaProfileActivationRuntime()
  });
}

export function profileActivationStatus() {
  const active = getRulesProfileRuntime().profile;
  const legacy = activationProfileSummary(LEGACY_PROFILE_ID);
  const strict = activationProfileSummary(STRICT_PROFILE_ID);
  const mg1e = activationProfileSummary(MG1E_PROFILE_ID);
  const mg2e = activationProfileSummary("mg2e");
  const switchAvailable = strict.activationAvailable;
  return Object.freeze({
    phase: "M10C.8",
    mode: "GENERIC_PROFILE_QA_ACTIVATION_GATE",
    activeProfileId: active.id,
    activeProfileVersion: active.version,
    activeSnapshotHash: active.rulesSnapshotHash,
    profiles: Object.freeze([legacy, strict, mg1e, mg2e]),
    strictProfileId: strict.id,
    strictProfileVersion: strict.version,
    strictActivationState: strict.activationState,
    strictSelectable: strict.selectable,
    strictSupported: strict.supported,
    strictRulesLive: strict.active,
    switchAvailable,
    qaSwitchAvailable: switchAvailable,
    switchBackToLegacyAvailable: active.id !== LEGACY_PROFILE_ID,
    mg1eSelectable: mg1e.selectable,
    mg1eSupported: mg1e.supported,
    mg1eActivationAvailable: mg1e.activationAvailable,
    mg2eSelectable: mg2e.selectable,
    mg2eSupported: mg2e.supported,
    mg2eActivationAvailable: mg2e.activationAvailable,
    mg2eActivationState: mg2e.activationState,
    mg2eActivationSurfaceRegistered: true,
    qaRuntime: qaProfileActivationRuntime(),
    actorWritesOnSwitch: 0,
    itemWritesOnSwitch: 0,
    journalWritesOnSwitch: 0,
    worldSettingWritesOnSwitch: 2,
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

export async function switchRulesProfile(targetProfileId, _options = {}) {
  if (!globalThis.game?.user?.isGM) throw new Error("Rules Profile switching is GM-only.");
  const targetId = String(targetProfileId ?? "").trim();
  if (!targetId) throw new Error("Rules Profile target is required.");

  const target = resolveRulesProfile(targetId).profile;
  if (!profileActivationAvailable(target.id)) {
    if (target.metadata?.foundationOnly === true) throw new Error(`${target.name} is foundation-only and cannot be activated.`);
    if (target.metadata?.selectable === false) throw new Error(`${target.name} is not selectable.`);
    if (target.metadata?.supported === false) throw new Error(`${target.name} is not marked supported.`);
    throw new Error(`${target.name} is not in an activatable state.`);
  }

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
      phase:"M10C.8",
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
  return switchRulesProfile(STRICT_PROFILE_ID);
}

export async function switchToMg1e() {
  return switchRulesProfile(MG1E_PROFILE_ID);
}

export async function switchToMg2e() {
  return switchRulesProfile(MG2E_PROFILE_ID);
}

export async function switchToLegacyMixed() {
  return switchRulesProfile(LEGACY_PROFILE_ID);
}
