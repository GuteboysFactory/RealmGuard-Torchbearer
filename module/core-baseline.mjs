const NS = "realm-guard";

export const CORE_SCHEMA_VERSION = 1;
export const CORE_ARCHITECTURE_VERSION = "0.1";
export const LEGACY_PROFILE_ID = "realm-guard-legacy-mixed";
export const LEGACY_PROFILE_VERSION = 1;
export const M0_MIGRATION_ID = "m0-core-baseline-v1";

const SETTINGS = Object.freeze({
  schema: "systemSchemaVersion",
  architecture: "coreArchitectureVersion",
  profileId: "activeRulesProfileId",
  profileVersion: "activeRulesProfileVersion",
  history: "migrationHistory",
  lastError: "migrationLastError"
});

function parseHistory(raw) {
  try {
    const value = JSON.parse(String(raw || "[]"));
    return Array.isArray(value) ? value : [];
  } catch (_error) {
    return [];
  }
}

function activeGmAuthority() {
  const activeGms = (game.users?.contents ?? [])
    .filter(user => user.active && user.isGM)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return !activeGms.length || activeGms[0].id === game.user?.id;
}

export function getCoreBaselineStatus() {
  const schemaVersion = Number(game.settings.get(NS, SETTINGS.schema) ?? 0);
  const architectureVersion = String(game.settings.get(NS, SETTINGS.architecture) ?? "");
  const profileId = String(game.settings.get(NS, SETTINGS.profileId) ?? "");
  const profileVersion = Number(game.settings.get(NS, SETTINGS.profileVersion) ?? 0);
  const migrationHistory = parseHistory(game.settings.get(NS, SETTINGS.history));
  const lastError = String(game.settings.get(NS, SETTINGS.lastError) ?? "");
  return {
    schemaVersion,
    architectureVersion,
    profileId,
    profileVersion,
    migrationHistory,
    migrationCount: migrationHistory.length,
    lastMigration: migrationHistory.at(-1) ?? null,
    lastError,
    ready: schemaVersion >= CORE_SCHEMA_VERSION
      && architectureVersion === CORE_ARCHITECTURE_VERSION
      && profileId === LEGACY_PROFILE_ID
      && profileVersion >= LEGACY_PROFILE_VERSION
  };
}

async function setIfDifferent(key, value) {
  const current = game.settings.get(NS, key);
  if (current === value) return false;
  await game.settings.set(NS, key, value);
  return true;
}

async function appendMigrationHistory(entry) {
  const history = parseHistory(game.settings.get(NS, SETTINGS.history));
  const withoutDuplicate = history.filter(row => String(row?.id ?? "") !== String(entry.id));
  withoutDuplicate.push(entry);
  const bounded = withoutDuplicate.slice(-100);
  await game.settings.set(NS, SETTINGS.history, JSON.stringify(bounded));
}

export async function runCoreBaselineMigration() {
  if (!game.user?.isGM || !activeGmAuthority()) return { applied: false, reason: "not-authority" };

  const before = getCoreBaselineStatus();
  if (before.ready && before.migrationHistory.some(row => row?.id === M0_MIGRATION_ID)) {
    if (before.lastError) await game.settings.set(NS, SETTINGS.lastError, "");
    return { applied: false, reason: "already-current", before, after: before };
  }

  try {
    const appliedAt = Date.now();
    const systemVersion = String(game.system?.version ?? "unknown");

    // M0 is metadata-only. Do not mutate Actors, Items, Scenes, Journals, Packs or runtime rules.
    await setIfDifferent(SETTINGS.architecture, CORE_ARCHITECTURE_VERSION);
    await setIfDifferent(SETTINGS.profileId, LEGACY_PROFILE_ID);
    await setIfDifferent(SETTINGS.profileVersion, LEGACY_PROFILE_VERSION);

    await appendMigrationHistory({
      id: M0_MIGRATION_ID,
      phase: "M0",
      fromSchema: before.schemaVersion,
      toSchema: CORE_SCHEMA_VERSION,
      architectureVersion: CORE_ARCHITECTURE_VERSION,
      profileId: LEGACY_PROFILE_ID,
      profileVersion: LEGACY_PROFILE_VERSION,
      systemVersion,
      appliedAt,
      destructive: false,
      actorItemWrites: 0
    });

    // Schema version is written last so an interrupted migration can safely retry.
    await setIfDifferent(SETTINGS.schema, CORE_SCHEMA_VERSION);
    await game.settings.set(NS, SETTINGS.lastError, "");

    const after = getCoreBaselineStatus();
    console.log(`${NS} | CORE M0 baseline ready`, after);
    return { applied: true, before, after };
  } catch (error) {
    const message = String(error?.stack || error?.message || error);
    console.error(`${NS} | CORE M0 baseline migration failed`, error);
    try { await game.settings.set(NS, SETTINGS.lastError, message.slice(0, 8000)); } catch (_ignored) {}
    return { applied: false, reason: "error", error };
  }
}

export function installCoreBaseline() {
  game.settings.register(NS, SETTINGS.schema, {
    name: "Realm Guard System Schema Version",
    hint: "Internal non-destructive schema/migration version for the MG-family CORE transition.",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
  game.settings.register(NS, SETTINGS.architecture, {
    name: "MG-Family CORE Architecture Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
  game.settings.register(NS, SETTINGS.profileId, {
    name: "Active Rules Profile Id",
    hint: "M0 metadata only. Existing worlds are tagged as Legacy Mixed; this setting does not change live rules yet.",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
  game.settings.register(NS, SETTINGS.profileVersion, {
    name: "Active Rules Profile Version",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
  game.settings.register(NS, SETTINGS.history, {
    name: "Realm Guard Migration History",
    scope: "world",
    config: false,
    type: String,
    default: "[]"
  });
  game.settings.register(NS, SETTINGS.lastError, {
    name: "Realm Guard Last Migration Error",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  Hooks.once("ready", () => { void runCoreBaselineMigration(); });
}
