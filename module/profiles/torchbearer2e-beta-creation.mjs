import { CharacterCreationProfile } from "../core/m9-creation.mjs";
import { tb2eCreationModel, tb2eClassStockPlan, tb2eHomePlan, tb2eHumanUpbringingPlan, tb2eSocialGracePlan, tb2eSpecialtyPlan, tb2eStartingWisesPlan, tb2eNatureQuestionnairePlan, tb2eFinalDetailsPlan } from "../m10d-tb2e-creation-shadow.mjs";
import { tb2eStartingRelationshipsPlan } from "../m10d-tb2e-circles-shadow.mjs";
import { tb2eAbilitySkillModel } from "../m10d-tb2e-abilities-shadow.mjs";

export const TB2E_BETA_ID = "torchbearer2e-beta";
export const tb2eLabel = value => String(value ?? "").toLowerCase().replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
export const TB2E_SKILLS = tb2eAbilitySkillModel().skills.names;
export const TB2E_CONDITIONS = ["Fresh", "Hungry & Thirsty", "Exhausted", "Angry", "Sick", "Injured", "Afraid", "Dead"];

export function deriveTb2eBeta(answers = {}) {
  const a = answers, errors = [], plans = {};
  const take = (name, plan) => { plans[name] = plan; if (!plan.ok) errors.push({ code: plan.reasonCode, field: name, message: `${tb2eLabel(name)}: ${tb2eLabel(plan.reasonCode)}` }); return plan; };
  const cls = take("class", tb2eClassStockPlan({ className: a.rank, will: a.will, health: a.health }));
  const stock = cls.stock ?? "";
  const skills = { ...(cls.skills ?? {}) };
  const raise = (name, plan) => { take(name, plan); if (plan.ok) skills[plan.skill] = plan.finalRating; };
  if (stock === "HUMAN") raise("upbringing", tb2eHumanUpbringingPlan({ skill: a.upbringing, currentRating: skills[a.upbringing] ?? 0 }));
  const home = take("home", tb2eHomePlan({ stock, home: a.home, skill: a.homeSkill, trait: a.homeTrait, currentSkillRating: skills[a.homeSkill] ?? 0 }));
  if (home.ok) skills[home.skill] = home.finalSkillRating;
  raise("social", tb2eSocialGracePlan({ skill: a.social, currentRating: skills[a.social] ?? 0 }));
  raise("specialty", tb2eSpecialtyPlan({ skill: a.specialty, currentRating: skills[a.specialty] ?? 0 }));
  const nature = take("nature", tb2eNatureQuestionnairePlan({ stock, answers: { q1: a.q1, q2: a.q2, q3: a.q3 }, replacementTrait: a.replacementTrait, secondWise: a.secondWise }));
  const wises = take("wises", tb2eStartingWisesPlan({ stock, stockWise: a.stockWise, customWise: a.customWise }));
  const loner = a.relationshipRoute === "LONER";
  const rel = take("relationships", tb2eStartingRelationshipsPlan({ characterClass: a.rank, loner, friend: !loner && Boolean(a.friend), parents: !loner && Boolean(a.parents), mentor: !loner && Boolean(a.mentor), enemy: !loner && Boolean(a.enemy), lonerTraitAlreadyOwned: nature.homeTraitReplacement === "LONER" }));
  if (loner && !String(a.enemy ?? "").trim()) errors.push({ code: "LONER_ENEMY_REQUIRED", field: "enemy", message: "Name your Loner's enemy." });
  take("details", tb2eFinalDetailsPlan({ stock, name: a.name, age: a.age, raiment: a.raiment }));
  const traits = {};
  if (cls.trait) traits[tb2eLabel(cls.trait)] = nature.classTraitLevelPreview ?? 1;
  if (home.trait) traits[tb2eLabel(nature.homeTraitReplacement ?? home.trait)] = 1;
  if (loner) traits.Loner = (traits.Loner ?? 0) + 1;
  const wiseNames = [...(wises.startingWises ?? []), ...(nature.wisePreview ? [nature.wisePreview] : [])].map(name => name.includes("_") ? tb2eLabel(name) : name);
  const skillChecks = Object.fromEntries(Object.entries(skills).map(([key, value]) => [tb2eLabel(key), value]));
  const abilities = { will: cls.will ?? 0, health: cls.health ?? 0, nature: nature.startingNaturePreview ?? 0, resources: nature.resourcesPreview ?? 0, circles: rel.startingCirclesPreview ?? 1 };
  return { derivedValues: { nature: abilities.nature, identity: { name: a.name, rank: a.rank, stock, age: a.age }, abilities, skillChecks, traitChecks: traits, wiseChecks: Object.fromEntries(wiseNames.map(name => [name, 1])), descriptors: (nature.descriptorsPreview ?? []).map(tb2eLabel).join(", "), errors, plans }, warnings: ["Choose starting equipment from existing Items with the GM. Spell/relic selection and class benefits are manual in this beta."] };
}

export const TORCHBEARER2E_BETA_CREATION_PROFILE = new CharacterCreationProfile({
  id: TB2E_BETA_ID, version: 1, name: "Torchbearer 2E - Beta Character Creation",
  dimensions: [{ id: "class", options: tb2eCreationModel().classes }],
  steps: [{ id: "tb2e", type: "CHOICE", sourceStep: "Character Creation guide CC 2-48" }],
  metadata: { source: "TB2E project character creation guide", liveCommit: true },
  derive: ({ answers }) => deriveTb2eBeta(answers),
  validateStep: ({ draft }) => ({ errors: draft.derivedValues.errors ?? [], warnings: [] }),
  buildCommitSpec: ({ draft }) => {
    const a = draft.answers, d = draft.derivedValues;
    if (d.errors.length) throw Error(d.errors[0].message);
    const attributes = Object.fromEntries(Object.entries(d.abilities).map(([key, value]) => [key, key === "nature" ? { value, maximum: value } : { value, max: ["resources", "circles"].includes(key) ? 10 : 6 }]));
    const item = (name, type, rating) => ({ name, type, system: { rating } });
    return {
      actor: { name: String(a.name).trim(), type: "character", folder: { documentName: "Actor", name: "PC" }, ownershipPolicy: "CREATOR_OWNER_IF_NON_GM", createOptions: { realmGuardSkipRecruitmentProvisioning: true },
        system: { rank: tb2eLabel(a.rank), ancestry: tb2eLabel(d.identity.stock), age: String(a.age), homeland: tb2eLabel(a.home), natureDescriptors: d.descriptors, belief: a.belief ?? "", goal: a.goal ?? "", instinct: a.instinct ?? "", creed: a.creed ?? "", friend: a.relationshipRoute === "LONER" ? "" : a.friend ?? "", parents: a.relationshipRoute === "LONER" ? "" : a.parents ?? "", mentor: a.relationshipRoute === "LONER" ? "" : a.mentor ?? "", enemy: a.enemy ?? "", attributes },
        flags: { "realm-guard": { tb2eBeta: true, tb2eSpecialty: a.specialty } } },
      provisioning: {
        canonicalSkills: { names: TB2E_SKILLS, ratings: Object.fromEntries(Object.entries(d.skillChecks).map(([name, rating]) => [name, { rating }])) },
        traits: Object.entries(d.traitChecks).map(([name, rating]) => item(name, "trait", rating)),
        wises: Object.keys(d.wiseChecks).map(name => item(name, "wise", 0)),
        gear: [], canonicalConditions: { names: TB2E_CONDITIONS, activeNames: ["Fresh"] }
      },
      relationships: { normalized: {}, liveWrite: false },
      transaction: { readyWhenActive: true, liveExecution: false, provenanceWrite: true }
    };
  }
});
