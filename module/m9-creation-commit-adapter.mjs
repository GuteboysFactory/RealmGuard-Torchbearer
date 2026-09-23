import { ensureDefaultSkills, RG_DEFAULT_SKILLS } from "./default-skills.mjs";
import { ensureDefaultConditions, RG_DEFAULT_CONDITIONS } from "./conditions.mjs";
import { ensureM8RecruitmentNetwork } from "./m8-social-network-service.mjs";

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

function escapeHtml(value = "") {
  if (globalThis.foundry?.utils?.escapeHTML) return globalThis.foundry.utils.escapeHTML(String(value ?? ""));
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

async function defaultEnsureFolder(spec = {}) {
  const name = String(spec?.name || "PC").trim() || "PC";
  const documentName = String(spec?.documentName || "Actor").trim() || "Actor";
  let folder = globalThis.game?.folders?.find?.(entry =>
    entry.type === documentName && String(entry.name ?? "").trim().toLowerCase() === name.toLowerCase()
  );
  if (folder) return folder;

  folder = await globalThis.Folder?.create?.({
    name,
    type: documentName,
    color: "#6f7f43",
    flags: { "realm-guard": { recruitmentPcFolder: true } }
  });
  if (!folder) throw new Error(`Realm Guard: Could not create the ${name} ${documentName} folder.`);
  return folder;
}

async function defaultCreateActor(data, options) {
  const actor = await globalThis.Actor?.create?.(data, options);
  if (!actor) throw new Error("Actor.create returned no Actor.");
  return actor;
}

function materializeActorData(plan, folder, { isGM = true, userId = "" } = {}) {
  const system = clone(plan.actor?.system ?? {});
  const biographySource = String(system.biographySource ?? "");
  delete system.biographySource;
  system.biography = biographySource ? `<p>${escapeHtml(biographySource)}</p>` : "";

  const none = globalThis.CONST?.DOCUMENT_OWNERSHIP_LEVELS?.NONE ?? 0;
  const owner = globalThis.CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;
  const ownership = !isGM && userId ? { default: none, [String(userId)]: owner } : undefined;

  return {
    name: String(plan.actor?.name ?? ""),
    type: String(plan.actor?.type ?? "character"),
    system,
    flags: clone(plan.actor?.flags ?? {}),
    folder: folder?.id ?? folder ?? null,
    ...(ownership ? { ownership } : {})
  };
}

function materializeProvenance(plan, rulesSnapshot) {
  return freeze({
    ...clone(plan.provenance ?? {}),
    createdAt: plan.provenance?.createdAt || new Date().toISOString(),
    rulesProfileId: String(rulesSnapshot?.profileId ?? ""),
    rulesProfileVersion: Number(rulesSnapshot?.profileVersion ?? 0),
    rulesSnapshotHash: String(rulesSnapshot?.rulesSnapshotHash ?? "")
  });
}

function fault(armedPhase, phase) {
  if (String(armedPhase || "").toUpperCase() !== phase) return;
  const error = new Error(`Injected M9 QA commit failure at ${phase}.`);
  error.realmGuardInjectedCommitFailure = true;
  throw error;
}

async function applySkillRatings(actor, plan) {
  await ensureDefaultSkills(actor);
  const ratings = plan.provisioning?.canonicalSkills?.ratings ?? {};
  const updates = [];
  for (const item of Array.from(actor?.items ?? []).filter(entry => entry.type === "role")) {
    const planned = ratings[item.name];
    if (!planned) continue;
    updates.push({
      _id: item.id,
      "system.rating": Number(planned.rating ?? 0),
      "system.learning": clone(planned.learning ?? { passed: 0, failed: 0, passNeeded: 1, failNeeded: 1 }),
      "system.beginnerAttempts": Number(planned.beginnerAttempts ?? 0)
    });
  }
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates);
  return updates.length;
}

async function createPlannedItems(actor, plan) {
  const docs = [
    ...clone(plan.provisioning?.traits ?? []),
    ...clone(plan.provisioning?.wises ?? []),
    ...clone(plan.provisioning?.gear ?? [])
  ];
  return docs.length ? actor.createEmbeddedDocuments("Item", docs) : [];
}

const DEFAULT_RUNTIME = Object.freeze({
  ensureFolder: defaultEnsureFolder,
  createActor: defaultCreateActor,
  applySkillRatings,
  createPlannedItems,
  ensureConditions: ensureDefaultConditions,
  normalizeRelationships: ensureM8RecruitmentNetwork
});

export class FoundryCreationCommitAdapter {
  constructor({ shadowOnly = true, runtime = {} } = {}) {
    this.shadowOnly = shadowOnly !== false;
    this.runtime = Object.freeze({ ...DEFAULT_RUNTIME, ...runtime });
    Object.freeze(this);
  }

  validatePlan(plan) {
    const errors = [];
    if (plan?.kind !== "CreationCommitPlan") errors.push("Not a CreationCommitPlan.");
    if (!plan?.actor?.name) errors.push("Actor name is missing.");
    if (plan?.actor?.type !== "character") errors.push("Actor type must be character.");
    if (plan?.validation?.valid === false) errors.push("CreationCommitPlan validation failed.");
    if (plan?.transaction?.mode !== "COMPENSATING_ROLLBACK") errors.push("CreationCommitPlan must use COMPENSATING_ROLLBACK.");
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
      conditions: Array.isArray(plan.provisioning?.canonicalConditions?.names)
        ? [...plan.provisioning.canonicalConditions.names]
        : RG_DEFAULT_CONDITIONS.map(entry => entry.name),
      relationships: clone(plan.relationships ?? {}),
      provenance: {
        profileId: plan.provenance?.profileId ?? plan.profileId,
        profileVersion: plan.provenance?.profileVersion ?? plan.profileVersion,
        writeLive: Boolean(plan.transaction?.provenanceWrite)
      }
    });

    const enabled = Boolean(plan.transaction?.liveExecution) && !this.shadowOnly;
    const operations = freeze([
      { phase: "PREPARE", operation: "ENSURE_ACTOR_FOLDER", target: plan.actor.folder?.name ?? "PC", critical: true, enabled },
      { phase: "CREATE_ACTOR", operation: "Actor.create", critical: true, enabled },
      { phase: "PROVISION_SKILLS", operation: "ENSURE_DEFAULT_SKILLS_AND_APPLY_RATINGS", count: projection.skills.length, critical: true, enabled },
      { phase: "CREATE_ITEMS", operation: "CREATE_TRAITS_WISES_GEAR", count: projection.traits.length + projection.wises.length + projection.gear.length, critical: true, enabled },
      { phase: "PROVISION_CONDITIONS", operation: "ENSURE_DEFAULT_CONDITIONS", count: projection.conditions.length, critical: true, enabled },
      { phase: "NORMALIZE_RELATIONSHIPS", operation: "CORE_M8_SOCIAL_NETWORK", count: plan.relationships?.normalized?.length ?? 0, critical: true, enabled },
      { phase: "WRITE_PROVENANCE", operation: "WRITE_CREATION_PROVENANCE", critical: true, enabled },
      { phase: "POST_COMMIT", operation: "CHAT_RECRUITED", critical: false, enabled: false },
      { phase: "POST_COMMIT", operation: "RELATIONSHIP_NPC_REVIEW", critical: false, enabled: false }
    ]);

    return freeze({
      kind: "FoundryCreationCommitPreview",
      shadowOnly: this.shadowOnly,
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
    if (this.shadowOnly) throw new Error("Realm Guard M9 FoundryCreationCommitAdapter is shadow-only.");
    if (!plan?.transaction?.liveExecution) throw new Error("CreationCommitPlan is not enabled for live execution.");
    return this._executeLive(plan, options);
  }

  async _executeLive(plan, { isGM = true, userId = "", rulesSnapshot = null, faultPhase = "" } = {}) {
    const validation = this.validatePlan(plan);
    if (!validation.valid) throw new Error(`Invalid CreationCommitPlan: ${validation.errors.join(" ")}`);
    if (!rulesSnapshot?.profileId || !rulesSnapshot?.profileVersion || !rulesSnapshot?.rulesSnapshotHash) {
      throw new Error("CORE M9 live commit requires an active Rules Profile snapshot before mutation.");
    }

    let actor = null;
    let phase = "PREPARE";
    let relationshipMigration = null;
    let provenance = null;
    const completedPhases = [];

    try {
      const folder = await this.runtime.ensureFolder(plan.actor?.folder ?? { documentName: "Actor", name: "PC" });
      completedPhases.push("PREPARE");

      phase = "CREATE_ACTOR";
      fault(faultPhase, phase);
      const actorData = materializeActorData(plan, folder, { isGM, userId });
      actor = await this.runtime.createActor(actorData, clone(plan.actor?.createOptions ?? {}));
      completedPhases.push(phase);

      phase = "PROVISION_SKILLS";
      fault(faultPhase, phase);
      await this.runtime.applySkillRatings(actor, plan);
      completedPhases.push(phase);

      phase = "CREATE_ITEMS";
      fault(faultPhase, phase);
      await this.runtime.createPlannedItems(actor, plan);
      completedPhases.push(phase);

      phase = "PROVISION_CONDITIONS";
      fault(faultPhase, phase);
      await this.runtime.ensureConditions(actor);
      completedPhases.push(phase);

      phase = "NORMALIZE_RELATIONSHIPS";
      fault(faultPhase, phase);
      relationshipMigration = await this.runtime.normalizeRelationships(actor);
      completedPhases.push(phase);

      phase = "WRITE_PROVENANCE";
      fault(faultPhase, phase);
      provenance = materializeProvenance(plan, rulesSnapshot);
      await actor.setFlag("realm-guard", "creationProvenance", clone(provenance));
      completedPhases.push(phase);

      return {
        kind: "FoundryCreationCommitResult",
        actor,
        provenance,
        relationshipMigration,
        completedPhases: Object.freeze([...completedPhases]),
        rolledBack: false
      };
    } catch (cause) {
      let rolledBack = false;
      let rollbackError = null;
      const actorId = actor?.id ?? "";
      if (actor?.delete) {
        try {
          await actor.delete({ realmGuardM9Rollback: true, realmGuardCommitPhase: phase });
          rolledBack = true;
        } catch (error) {
          rollbackError = error;
        }
      }

      const error = new Error(
        rollbackError
          ? `CORE M9 commit failed at ${phase}; rollback also failed: ${rollbackError?.message ?? rollbackError}`
          : `CORE M9 commit failed at ${phase}${rolledBack ? " and the new Ranger was rolled back" : ""}: ${cause?.message ?? cause}`
      );
      error.cause = cause;
      error.realmGuardCommit = {
        phase,
        actorId,
        rolledBack,
        rollbackError: rollbackError ? String(rollbackError?.message ?? rollbackError) : "",
        injected: Boolean(cause?.realmGuardInjectedCommitFailure)
      };
      throw error;
    }
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
