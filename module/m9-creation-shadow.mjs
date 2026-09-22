import {
  CharacterCreationEngine,
  CreationPartyContext,
  comparableCreationSnapshot
} from "./core/m9-creation.mjs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "./profiles/realm-guard-legacy-mixed-creation.mjs";

const engine = new CharacterCreationEngine(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE);
const history = [];
const MAX_HISTORY = 100;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function fromLegacyState(state = {}) {
  return engine.createDraft({
    mode: state.mode ?? "guided",
    answers: {
      name: state.name,
      concept: state.concept,
      background: state.background,
      rank: state.rank,
      age: state.age,
      natureAnswers: state.natureAnswers,
      homelandKey: state.homelandKey,
      homelandSkill: state.homelandSkill,
      homelandTrait: state.homelandTrait,
      apprenticeship: state.apprenticeship,
      mentorTraining: state.mentorTraining,
      specialty: state.specialty,
      resourceAnswers: state.resourceAnswers,
      circleAnswers: state.circleAnswers,
      innateTrait: state.innateTrait,
      inheritedTrait: state.inheritedTrait,
      roadTrait: state.roadTrait,
      relationships: {
        lineage: state.lineage,
        insignia: state.insignia,
        mother: { name: state.mom, profession: state.momProfession, location: state.momLocation },
        father: { name: state.dad, profession: state.dadProfession, location: state.dadLocation },
        seniorArtisan: { name: state.seniorArtisan, profession: state.seniorArtisanProfession, location: state.seniorArtisanLocation },
        mentor: { name: state.mentor, role: state.mentorRole, location: state.mentorLocation },
        friend: { name: state.friend, profession: state.friendProfession, location: state.friendLocation },
        enemy: { name: state.enemyName, people: state.enemyPeople, profession: state.enemyProfession, location: state.enemyLocation }
      },
      drives: { belief: state.belief, goal: state.goal, instinct: state.instinct },
      weapon: state.weapon,
      armor: state.armor,
      distinctiveGear: state.distinctiveGear
    },
    allocations: {
      naturalTalent: state.naturalTalent,
      parentsTrade: state.parentsTrade,
      convincing: state.convincing,
      serviceAlloc: state.serviceAlloc,
      wiseChoices: state.wiseChoices
    },
    metadata: {
      overrides: state.allowEnemyServant ? ["ALLOW_ENEMY_SERVANT"] : [],
      optionalRules: state.allowEnemyServant ? ["ENEMY_SERVANT_HOUSE_RULE"] : []
    }
  });
}

function coreSnapshot(draft) {
  const d = draft.derivedValues;
  return comparableCreationSnapshot({
    rank: d.identity?.rank,
    age: d.identity?.age,
    homelandKey: d.identity?.homelandKey,
    nature: d.abilities?.nature,
    will: d.abilities?.will,
    health: d.abilities?.health,
    resources: d.abilities?.resources,
    circles: d.abilities?.circles,
    fate: d.resources?.fate,
    persona: d.resources?.persona,
    skillChecks: d.skillChecks,
    traitChecks: d.traitChecks,
    wiseChecks: d.wiseChecks,
    gear: d.gear
  });
}

function partyContext() {
  const actors = globalThis.game?.actors?.contents ?? [];
  return new CreationPartyContext({
    existingCharacters: actors
      .filter(actor => actor.type === "character")
      .map(actor => ({
        name: actor.name,
        specialty: String(actor.getFlag?.("realm-guard", "recruitmentSpecialty") ?? "")
      }))
  });
}

export function observeM9RecruitmentDraft(state, legacyProjection = {}) {
  const draft = fromLegacyState(state);
  const core = coreSnapshot(draft);
  const legacy = comparableCreationSnapshot(legacyProjection);
  const fields = Object.keys(core);
  const mismatchedFields = fields.filter(key => JSON.stringify(core[key]) !== JSON.stringify(legacy[key]));
  const commitPlan = engine.buildCommitPlan(draft, partyContext());
  const event = freeze({
    at: new Date().toISOString(),
    scope: "M9_CREATION_SHADOW",
    authority: "LEGACY_RECRUITMENT",
    liveApplication: false,
    parity: mismatchedFields.length === 0,
    mismatchedFields,
    legacy,
    core,
    commitPlan
  });
  history.push(event);
  if (history.length > MAX_HISTORY) history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM9CreationShadow", event); } catch (_error) { /* observer only */ }
  return event;
}

export function getM9CreationShadowStatus() {
  const rows = [...history];
  return freeze({
    phase: "M9",
    buildScope: "GENERIC_CHARACTER_CREATION_FOUNDATION",
    mode: "SHADOW_ONLY",
    authority: "LEGACY_RECRUITMENT",
    liveApplication: false,
    profileId: REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.id,
    profileVersion: REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.version,
    observations: rows.length,
    mismatches: rows.filter(row => !row.parity).length,
    allParity: rows.length > 0 && rows.every(row => row.parity),
    capabilities: [
      "CreationDraft",
      "CharacterCreationProfile",
      "CreationStep",
      "CreationQuestion",
      "CreationAllocation",
      "CreationRestriction",
      "CreationPartyContext",
      "CreationValidator",
      "CreationReview",
      "CreationCommitPlan",
      "CreationProvenance"
    ]
  });
}

export function installM9CreationShadow() {
  globalThis.Hooks?.once?.("ready", () => {
    globalThis.game.realmGuard ??= {};
    globalThis.game.realmGuard.core ??= {};
    globalThis.game.realmGuard.core.m9 ??= {};
    Object.assign(globalThis.game.realmGuard.core.m9, {
      getStatus: getM9CreationShadowStatus,
      history: () => Object.freeze([...history]),
      clear: () => { history.length = 0; return getM9CreationShadowStatus(); },
      profile: () => REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE,
      createDraftFromLegacyState: fromLegacyState,
      buildCommitPlanFromLegacyState: state => engine.buildCommitPlan(fromLegacyState(state), partyContext())
    });
    console.log("realm-guard | CORE M9 Generic Character Creation shadow foundation ready", getM9CreationShadowStatus());
  });
}
