import { RG_DEFAULT_SKILLS } from "./default-skills.mjs";
import { RG_DEFAULT_CONDITIONS } from "./conditions.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freeze));
  if (value && typeof value === "object") return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freeze(entry)])));
  return value;
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    const rows = value.map(canonicalize);
    if (rows.every(entry => typeof entry === "string")) return rows.sort((a, b) => a.localeCompare(b));
    if (rows.every(entry => entry && typeof entry === "object" && "name" in entry)) {
      return rows.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }
    return rows;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
  }
  return value;
}

function comparable(value) {
  return JSON.stringify(canonicalize(value));
}

function skillProjection(plan) {
  const ratings = plan.provisioning?.canonicalSkills?.ratings ?? {};
  return RG_DEFAULT_SKILLS.map(name => ({
    name,
    rating: Number(ratings[name]?.rating ?? 0),
    learning: clone(ratings[name]?.learning ?? { passed: 0, failed: 0, passNeeded: 1, failNeeded: 1 }),
    beginnerAttempts: Number(ratings[name]?.beginnerAttempts ?? 0)
  }));
}

export class FoundryCreationCommitAdapter {
  constructor({ shadowOnly = true } = {}) {
    this.shadowOnly = shadowOnly !== false;
    Object.freeze(this);
  }

  validatePlan(plan) {
    const errors = [];
    if (plan?.kind !== "CreationCommitPlan") errors.push("Not a CreationCommitPlan.");
    if (!plan?.actor?.name) errors.push("Actor name is missing.");
    if (plan?.actor?.type !== "character") errors.push("Actor type must be character.");
    if (plan?.transaction?.liveExecution !== false) errors.push("qa.3 requires liveExecution=false.");
    return freeze({ valid: errors.length === 0, errors });
  }

  preview(plan, { isGM = true, userId = "" } = {}) {
    const validation = this.validatePlan(plan);
    if (!validation.valid) throw new Error(`Invalid CreationCommitPlan: ${validation.errors.join(" ")}`);

    const ownership = !isGM && userId
      ? { default: 0, [String(userId)]: 3 }
      : null;

    const projection = freeze({
      actor: {
        name: plan.actor.name,
        type: plan.actor.type,
        folder: plan.actor.folder?.name ?? "PC",
        ownershipPolicy: plan.actor.ownershipPolicy,
        ownership,
        system: clone(plan.actor.system ?? {}),
        flags: clone(plan.actor.flags ?? {})
      },
      skills: skillProjection(plan),
      traits: clone(plan.provisioning?.traits ?? []),
      wises: clone(plan.provisioning?.wises ?? []),
      gear: clone(plan.provisioning?.gear ?? []),
      conditions: RG_DEFAULT_CONDITIONS.map(entry => entry.name),
      relationships: clone(plan.relationships ?? {}),
      provenance: {
        profileId: plan.provenance?.profileId ?? plan.profileId,
        profileVersion: plan.provenance?.profileVersion ?? plan.profileVersion,
        writeLive: Boolean(plan.transaction?.provenanceWrite)
      }
    });

    const operations = freeze([
      { phase: "PREPARE", operation: "ENSURE_ACTOR_FOLDER", target: plan.actor.folder?.name ?? "PC", critical: true },
      { phase: "CREATE_ACTOR", operation: "Actor.create", critical: true, enabled: false },
      { phase: "PROVISION_SKILLS", operation: "ENSURE_DEFAULT_SKILLS_AND_APPLY_RATINGS", count: projection.skills.length, critical: true, enabled: false },
      { phase: "CREATE_ITEMS", operation: "CREATE_TRAITS_WISES_GEAR", count: projection.traits.length + projection.wises.length + projection.gear.length, critical: true, enabled: false },
      { phase: "PROVISION_CONDITIONS", operation: "ENSURE_DEFAULT_CONDITIONS", count: projection.conditions.length, critical: true, enabled: false },
      { phase: "NORMALIZE_RELATIONSHIPS", operation: "CORE_M8_SOCIAL_NETWORK", count: plan.relationships?.normalized?.length ?? 0, critical: true, enabled: false },
      { phase: "FINALIZE", operation: "WRITE_CREATION_PROVENANCE", critical: true, enabled: false },
      { phase: "POST_COMMIT", operation: "CHAT_RECRUITED", critical: false, enabled: false },
      { phase: "POST_COMMIT", operation: "RELATIONSHIP_NPC_REVIEW", critical: false, enabled: false }
    ]);

    return freeze({
      kind: "FoundryCreationCommitPreview",
      shadowOnly: true,
      liveMutation: false,
      projection,
      operations,
      rollback: {
        strategy: "COMPENSATING_ROLLBACK",
        trigger: "ANY_CRITICAL_FAILURE_AFTER_ACTOR_CREATE",
        compensation: "DELETE_CREATED_ACTOR",
        postCommitExcluded: ["CHAT_RECRUITED", "RELATIONSHIP_NPC_REVIEW"]
      }
    });
  }

  execute(plan, options = {}) {
    if (options?.dryRun === true) return this.preview(plan, options);
    throw new Error("Realm Guard M9 qa.3 FoundryCreationCommitAdapter is shadow-only; live mutation is disabled.");
  }
}

export function compareCommitProjections(coreProjection = {}, legacyProjection = {}) {
  const fields = [...new Set([...Object.keys(coreProjection ?? {}), ...Object.keys(legacyProjection ?? {})])].sort();
  const mismatchedFields = fields.filter(field => comparable(coreProjection?.[field]) !== comparable(legacyProjection?.[field]));
  return freeze({
    parity: mismatchedFields.length === 0,
    mismatchedFields,
    core: canonicalize(clone(coreProjection)),
    legacy: canonicalize(clone(legacyProjection))
  });
}
