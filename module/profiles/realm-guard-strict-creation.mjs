import { CharacterCreationProfile } from "../core/m9-creation.mjs";
import {
  LEGACY_CREATION_HOMELANDS,
  LEGACY_CREATION_STATIONS,
  LEGACY_CREATION_WEAPON_NAMES,
  legacyCreationBuildCommitSpec,
  legacyCreationDerive,
  legacyCreationValidateStep
} from "./realm-guard-legacy-mixed-creation.mjs";
import { STRICT_ADVERSE_CONDITIONS } from "../m10-strict-conditions-recovery.mjs";

export const STRICT_CREATION_PROFILE_ID = "realm-guard-strict";
export const STRICT_CREATION_PROFILE_VERSION = 1;
export const STRICT_ENEMY_PEOPLES = Object.freeze(["Dúnadan", "Dunadan", "Dwarf", "Elf", "Hobbit", "Man"]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function error(code, message, field = "") {
  return { code, message, field };
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function skillLearningForRating(rating) {
  const r = Math.max(0, Number(rating ?? 0));
  if (r <= 1) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 0 };
  return { passed: 0, failed: 0, passNeeded: r, failNeeded: r - 1 };
}

function ratedWiseDocs(wiseChecks = {}) {
  return Object.entries(wiseChecks ?? {}).map(([name, checks]) => {
    const rating = Math.min(6, Math.max(0, Number(checks ?? 0)) + 1);
    return {
      name,
      type: "wise",
      flags: {
        "realm-guard": {
          recruitmentWise: true,
          strictRatedWise: true
        }
      },
      system: {
        rating,
        learning: skillLearningForRating(rating),
        description: "Selected during Strict Realm Guard Recruitment. Rated Wise; tests and advances like a Skill."
      }
    };
  });
}

function mentorPartyRecord(draft, partyContext) {
  const mentor = draft?.answers?.relationships?.mentor ?? {};
  const actorId = String(mentor.actorId ?? "").trim();
  const mentorName = normalize(mentor.name);
  return (partyContext?.existingCharacters ?? []).find(entry => {
    if (actorId && String(entry?.actorId ?? entry?.id ?? "") === actorId) return true;
    return mentorName && normalize(entry?.name) === mentorName;
  }) ?? null;
}

function traitsOf(entry, mentor = {}) {
  const values = [
    ...(entry?.traits ?? []),
    ...(mentor?.traits ?? [])
  ].map(value => normalize(value?.name ?? value)).filter(Boolean);
  return new Set(values);
}

function validateStrictMentor(draft, partyContext) {
  const a = draft.answers ?? {};
  const rank = String(a.rank ?? "").toLowerCase();
  const rangerAge = Number(a.age ?? 0);
  const mentor = a.relationships?.mentor ?? {};
  const match = mentorPartyRecord(draft, partyContext);
  const mentorStation = normalize(match?.station ?? match?.rank ?? mentor.station ?? mentor.role);
  const mentorAge = Number(match?.age ?? mentor.age ?? 0);
  const mentorTraits = traitsOf(match, mentor);
  const errors = [];

  if (rank === "recruit") {
    if (!match) {
      errors.push(error(
        "STRICT_RECRUIT_MENTOR_PC_REQUIRED",
        "A Recruit's mentor must be another player character of Veteran or Captain station.",
        "mentor"
      ));
    } else if (!["veteran", "captain"].includes(mentorStation)) {
      errors.push(error(
        "STRICT_RECRUIT_MENTOR_STATION",
        "A Recruit's mentor must be another player character of Veteran or Captain station.",
        "mentor"
      ));
    }
  } else if (["scout", "veteran"].includes(rank)) {
    if (!(mentorAge > rangerAge)) {
      errors.push(error(
        "STRICT_MENTOR_OLDER_REQUIRED",
        "A Scout or Veteran must have an older mentor character.",
        "mentor"
      ));
    }
  } else if (["captain", "lord"].includes(rank)) {
    if (!mentorTraits.has("greybeard")) {
      errors.push(error(
        "STRICT_MENTOR_GREYBEARD_REQUIRED",
        "A Captain or Lord must have an NPC or player-character mentor with the Greybeard trait.",
        "mentor"
      ));
    }
  }

  return errors;
}

function deriveStrict(args = {}) {
  const result = legacyCreationDerive(args);
  const derivedValues = clone(result?.derivedValues ?? {});
  const wiseChecks = derivedValues.wiseChecks ?? {};
  derivedValues.wiseRatings = Object.fromEntries(
    Object.entries(wiseChecks).map(([name, checks]) => [
      name,
      Math.min(6, Math.max(0, Number(checks ?? 0)) + 1)
    ])
  );
  derivedValues.creationPolicy = {
    profileId: STRICT_CREATION_PROFILE_ID,
    ratedWises: true,
    startingSkillWiseCap: 6,
    levels: false,
    talents: false,
    inventoryPolicy: "LOOSE",
    conditionSet: [...STRICT_ADVERSE_CONDITIONS],
    healthyDerived: true,
    enemyServantHouseRule: false
  };
  return {
    derivedValues,
    warnings: [...(result?.warnings ?? [])]
  };
}

function validateStrictStep({ stepId, draft, partyContext, profile }) {
  const base = legacyCreationValidateStep({ stepId, draft, partyContext, profile }) ?? { errors: [], warnings: [] };
  const errors = [...(base.errors ?? [])].filter(entry => entry?.code !== "ENEMY_HOUSE_RULE_REQUIRED");
  const warnings = [...(base.warnings ?? [])];
  const a = draft.answers ?? {};
  const d = draft.derivedValues ?? {};

  if (stepId === "wises" || stepId === "review") {
    for (const [name, rating] of Object.entries(d.wiseRatings ?? {})) {
      if (Number(rating) < 2 || Number(rating) > 6) {
        errors.push(error("STRICT_WISE_STARTING_RATING_RANGE", `${name} must begin between rating 2 and 6.`, "wiseChoices"));
      }
    }
  }

  if (stepId === "relationships" || stepId === "review") {
    const enemy = a.relationships?.enemy ?? {};
    const enemyPeople = normalize(enemy.people);
    const allowed = STRICT_ENEMY_PEOPLES.some(value => normalize(value) === enemyPeople);
    if (!allowed) {
      errors.push(error(
        "STRICT_ENEMY_PEOPLE_INVALID",
        "A Strict Realm Guard personal Enemy must be a Dúnadan, Dwarf, Elf, Hobbit or Man; servants of the Enemy are not valid personal Enemies.",
        "enemyPeople"
      ));
    }
    if (Boolean(a.allowEnemyServant)) {
      errors.push(error(
        "STRICT_ENEMY_HOUSE_RULE_DISABLED",
        "The Legacy Enemy-servant house rule is not available in Strict Realm Guard.",
        "allowEnemyServant"
      ));
    }
    errors.push(...validateStrictMentor(draft, partyContext));
  }

  return { errors, warnings };
}

function buildStrictCommitSpec(args = {}) {
  const base = clone(legacyCreationBuildCommitSpec(args));
  const draft = args?.draft;
  const d = draft?.derivedValues ?? {};
  const flags = base.actor?.flags?.["realm-guard"] ?? {};

  delete flags.recruitmentEnemyHouseRule;
  flags.strictCreationProfile = true;
  flags.strictCreationProfileId = STRICT_CREATION_PROFILE_ID;
  flags.strictCreationProfileVersion = STRICT_CREATION_PROFILE_VERSION;
  flags.strictRatedWises = true;
  flags.strictInventoryPolicy = "LOOSE";

  base.actor.flags["realm-guard"] = flags;
  base.provisioning.wises = ratedWiseDocs(d.wiseChecks ?? {});
  base.provisioning.canonicalConditions = {
    mode: "REALM_GUARD_STRICT_SET",
    profileId: STRICT_CREATION_PROFILE_ID,
    healthy: "DERIVED",
    names: [...STRICT_ADVERSE_CONDITIONS],
    excludes: ["Fresh", "Afraid", "Sick"]
  };
  base.provisioning.inventory = {
    policy: "LOOSE",
    slotPlacementAuthority: false,
    preservePlacementAsPresentation: true
  };

  for (const gear of base.provisioning.gear ?? []) {
    gear.flags ??= {};
    gear.flags["realm-guard"] ??= {};
    gear.flags["realm-guard"].strictPlacementPresentationOnly = true;
  }

  base.relationships.liveWrite = false;
  base.relationships.plannedLiveService = "CORE_M8_SOCIAL_NETWORK_ON_STRICT_ACTIVATION";
  for (const row of base.relationships.normalized ?? []) {
    row.writeMode = "CORE_M8_SERVICE_ON_STRICT_ACTIVATION";
  }

  base.transaction.liveExecution = false;
  base.transaction.provenanceWrite = false;
  base.transaction.relationshipWrite = false;
  base.transaction.previewOnly = true;
  base.transaction.activationRequired = STRICT_CREATION_PROFILE_ID;

  return base;
}

export const REALM_GUARD_STRICT_CREATION_PROFILE = new CharacterCreationProfile({
  id: STRICT_CREATION_PROFILE_ID,
  version: STRICT_CREATION_PROFILE_VERSION,
  name: "Realm Guard — Strict Recruitment",
  dimensions: [
    { id: "station", label: "Station", options: LEGACY_CREATION_STATIONS },
    { id: "homeland", label: "Homeland", options: LEGACY_CREATION_HOMELANDS }
  ],
  steps: [
    { id: "identity", type: "CHOICE", legacyStep: 1 },
    { id: "nature", type: "QUESTION", legacyStep: 2 },
    { id: "homeland", type: "CHOICE", legacyStep: 3 },
    { id: "life-experience", type: "ALLOCATION", legacyStep: 4 },
    { id: "service-specialty", type: "ALLOCATION", legacyStep: 5 },
    { id: "wises", type: "ALLOCATION", legacyStep: 6 },
    { id: "resources-circles", type: "QUESTION", legacyStep: 7 },
    { id: "traits", type: "ALLOCATION", legacyStep: 8 },
    { id: "relationships", type: "RELATIONSHIP", legacyStep: 9 },
    { id: "drives-gear", type: "GEAR", legacyStep: 10 },
    { id: "review", type: "REVIEW", legacyStep: 11 }
  ],
  rules: {
    source: "REALM_GUARD_V1_6",
    inheritedFrom: "MG1E_2008",
    wiseMode: "RATED",
    startingSkillWiseCap: 6,
    inventoryPolicy: "LOOSE",
    startingNature: 3,
    natureDescriptors: ["Tradition", "Family", "Grief"],
    levels: false,
    talents: false,
    enemyServantHouseRule: false,
    allowedEnemyPeoples: ["Dúnadan", "Dwarf", "Elf", "Hobbit", "Man"],
    mentorValidation: "STRICT_SOURCE_RULES",
    relationshipOrigin: "RECRUITMENT"
  },
  grants: { fate: 1, persona: 1, checks: 0 },
  metadata: {
    liveAuthority: "NONE",
    commitAuthority: "NONE",
    coreEngine: "CORE_M9",
    mode: "READ_ONLY_PREVIEW",
    source: "Realm Guard v1.6 + Mouse Guard RPG 2008 / 1E inheritance",
    strictRealmGuard: true,
    ratedWises: true,
    levelsTalents: false,
    automaticNpcCreation: false,
    activationRequired: STRICT_CREATION_PROFILE_ID
  },
  derive: deriveStrict,
  validateStep: validateStrictStep,
  buildCommitSpec: buildStrictCommitSpec
});

export const STRICT_CREATION_WEAPON_NAMES = Object.freeze([...LEGACY_CREATION_WEAPON_NAMES]);
