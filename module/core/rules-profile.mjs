function clonePlain(value) {
  if (Array.isArray(value)) return value.map(clonePlain);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = clonePlain(child);
    return out;
  }
  return value;
}

function deepMerge(base, override) {
  if (override === undefined) return clonePlain(base);
  if (Array.isArray(override)) return clonePlain(override);
  if (!override || typeof override !== "object") return override;

  const result = base && typeof base === "object" && !Array.isArray(base) ? clonePlain(base) : {};
  for (const [key, value] of Object.entries(override)) {
    const prior = result[key];
    result[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(prior, value)
      : clonePlain(value);
  }
  return result;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  }
  return value;
}

function snapshotHash(value) {
  const input = JSON.stringify(stableValue(value));
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a-${hash.toString(16).padStart(8, "0")}`;
}

export class RulesProfile {
  constructor({ id, version, name, parent = null, classification = "PROFILE", domains = {}, registry = [], metadata = {} } = {}) {
    if (!id || typeof id !== "string") throw new Error("RulesProfile requires a string id.");
    if (!Number.isInteger(Number(version)) || Number(version) < 1) throw new Error(`RulesProfile '${id}' requires an integer version >= 1.`);
    if (!name || typeof name !== "string") throw new Error(`RulesProfile '${id}' requires a display name.`);
    if (!Array.isArray(registry)) throw new Error(`RulesProfile '${id}' registry must be an array.`);

    this.id = id;
    this.version = Number(version);
    this.name = name;
    this.parent = parent || null;
    this.classification = classification;
    this.domains = clonePlain(domains);
    this.registry = clonePlain(registry);
    this.metadata = clonePlain(metadata);
    deepFreeze(this);
  }
}

export class ProfileResolver {
  constructor(profiles = []) {
    this._profiles = new Map();
    for (const profile of profiles) this.register(profile);
  }

  register(profile) {
    if (!(profile instanceof RulesProfile)) throw new Error("ProfileResolver.register requires a RulesProfile.");
    if (this._profiles.has(profile.id)) throw new Error(`RulesProfile '${profile.id}' is already registered.`);
    this._profiles.set(profile.id, profile);
    return profile;
  }

  has(id) {
    return this._profiles.has(String(id ?? ""));
  }

  get(id) {
    return this._profiles.get(String(id ?? "")) ?? null;
  }

  list() {
    return [...this._profiles.values()];
  }

  resolve(id) {
    const targetId = String(id ?? "");
    if (!this._profiles.has(targetId)) throw new Error(`Unknown RulesProfile '${targetId}'.`);

    const lineage = [];
    const seen = new Set();
    let cursor = this._profiles.get(targetId);
    while (cursor) {
      if (seen.has(cursor.id)) throw new Error(`RulesProfile inheritance cycle detected at '${cursor.id}'.`);
      seen.add(cursor.id);
      lineage.unshift(cursor);
      cursor = cursor.parent ? this._profiles.get(cursor.parent) : null;
      if (lineage[0]?.parent && !cursor) throw new Error(`RulesProfile '${lineage[0].id}' references missing parent '${lineage[0].parent}'.`);
    }

    let domains = {};
    const registry = new Map();
    for (const profile of lineage) {
      domains = deepMerge(domains, profile.domains);
      for (const raw of profile.registry) {
        if (!raw?.id) throw new Error(`RulesProfile '${profile.id}' contains a registry entry without id.`);
        const previous = registry.get(raw.id) ?? null;
        registry.set(raw.id, {
          ...(previous ? clonePlain(previous) : {}),
          ...clonePlain(raw),
          providerProfile: profile.id,
          inheritedFrom: previous?.providerProfile ?? null
        });
      }
    }

    const resolved = {
      id: lineage.at(-1).id,
      version: lineage.at(-1).version,
      name: lineage.at(-1).name,
      classification: lineage.at(-1).classification,
      parent: lineage.at(-1).parent,
      lineage: lineage.map(profile => ({ id: profile.id, version: profile.version, name: profile.name })),
      domains,
      registry: [...registry.values()],
      metadata: lineage.reduce((acc, profile) => deepMerge(acc, profile.metadata), {})
    };
    resolved.rulesSnapshotHash = snapshotHash(resolved);
    return deepFreeze(resolved);
  }
}

export function createProfileSnapshot(resolvedProfile) {
  if (!resolvedProfile?.id || !resolvedProfile?.rulesSnapshotHash) throw new Error("createProfileSnapshot requires a resolved profile.");
  return deepFreeze({
    profileId: resolvedProfile.id,
    profileVersion: resolvedProfile.version,
    rulesSnapshotHash: resolvedProfile.rulesSnapshotHash
  });
}
