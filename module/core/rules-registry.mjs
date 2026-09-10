function freezeEntry(entry) {
  return Object.freeze({ ...entry });
}

export class RulesRegistry {
  constructor(resolvedProfile) {
    if (!resolvedProfile?.id || !Array.isArray(resolvedProfile.registry)) {
      throw new Error("RulesRegistry requires a resolved RulesProfile.");
    }
    this.profileId = resolvedProfile.id;
    this.profileVersion = resolvedProfile.version;
    this.rulesSnapshotHash = resolvedProfile.rulesSnapshotHash;
    this._entries = new Map();

    for (const raw of resolvedProfile.registry) {
      if (!raw?.id || !raw?.domain || !raw?.title) {
        throw new Error(`Invalid RuleEntry in profile '${resolvedProfile.id}'.`);
      }
      const entry = freezeEntry({
        activeValue: "UNSPECIFIED",
        classification: "PROFILE RULE",
        automation: "MANUAL",
        source: "Project implementation",
        sourceVersion: resolvedProfile.version,
        overrideReason: "",
        status: "ACTIVE",
        inheritedFrom: null,
        ...raw
      });
      this._entries.set(entry.id, entry);
    }
    Object.freeze(this);
  }

  has(id) {
    return this._entries.has(String(id ?? ""));
  }

  get(id) {
    return this._entries.get(String(id ?? "")) ?? null;
  }

  list() {
    return [...this._entries.values()];
  }

  byDomain(domain) {
    const key = String(domain ?? "");
    return this.list().filter(entry => entry.domain === key);
  }

  explain(id) {
    const entry = this.get(id);
    if (!entry) return null;
    return Object.freeze({
      id: entry.id,
      title: entry.title,
      activeValue: entry.activeValue,
      providerProfile: entry.providerProfile,
      inheritedFrom: entry.inheritedFrom,
      source: entry.source,
      sourceVersion: entry.sourceVersion,
      classification: entry.classification,
      automation: entry.automation,
      overrideReason: entry.overrideReason,
      status: entry.status
    });
  }
}
