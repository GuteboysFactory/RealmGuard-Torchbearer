import { CharacterCreationProfile } from "../core/m9-creation.mjs";

export const MG2E_CREATION_PROFILE_ID = "mg2e";
export const MG2E_CREATION_PROFILE_VERSION = 3;

const SOURCE = "Mouse Guard Roleplaying Game: Second Edition (2015)";

const RANKS = Object.freeze({
  tenderpaw: Object.freeze({
    label: "Tenderpaw", will: 2, health: 6, resources: 1, circles: 1, age: [14,17],
    skills: Object.freeze({ Pathfinder:2, Scout:2, Laborer:2 }),
    wiseCount: 1, naturalTalentCount: 2, convincingCount: 1, mentorTrainingCount: 1, specialtyCount: 0
  }),
  guardmouse: Object.freeze({
    label: "Guardmouse", will: 3, health: 5, resources: 2, circles: 2, age: [18,25],
    skills: Object.freeze({ Fighter:3, Haggler:2, Scout:2, Pathfinder:3, Survivalist:2 }),
    wiseCount: 1, naturalTalentCount: 1, convincingCount: 1, mentorTrainingCount: 1, specialtyCount: 1
  }),
  patrolGuard: Object.freeze({
    label: "Patrol Guard", will: 4, health: 4, resources: 3, circles: 3, age: [21,50],
    skills: Object.freeze({ Cook:2, Fighter:3, Hunter:3, Scout:2, Healer:2, Pathfinder:2, Survivalist:2, "Weather Watcher":2 }),
    wiseCount: 2, naturalTalentCount: 1, convincingCount: 1, mentorTrainingCount: 1, specialtyCount: 1
  }),
  patrolLeader: Object.freeze({
    label: "Patrol Leader", will: 5, health: 4, resources: 4, circles: 3, age: [21,60],
    skills: Object.freeze({ Fighter:3, Hunter:3, Instructor:2, Loremouse:2, Persuader:2, Pathfinder:3, Scout:2, Survivalist:3, "Weather Watcher":2 }),
    wiseCount: 3, naturalTalentCount: 1, convincingCount: 2, mentorTrainingCount: 2, specialtyCount: 1
  }),
  guardCaptain: Object.freeze({
    label: "Guard Captain", will: 6, health: 3, resources: 5, circles: 4, age: [41,60],
    skills: Object.freeze({ Administrator:3, Fighter:3, Healer:2, Hunter:3, Instructor:2, Militarist:3, Orator:2, Pathfinder:3, Scout:3, Survivalist:3, "Weather Watcher":3 }),
    wiseCount: 4, naturalTalentCount: 2, convincingCount: 2, mentorTrainingCount: 1, specialtyCount: 1
  })
});

const HOMETOWNS = Object.freeze({
  Barkstone: Object.freeze({ skills:["Carpenter","Potter","Glazier"], traits:["Steady Paw"] }),
  Copperwood: Object.freeze({ skills:["Smith","Haggler"], traits:["Independent"] }),
  Elmoss: Object.freeze({ skills:["Carpenter","Harvester"], traits:["Alert"] }),
  Ivydale: Object.freeze({ skills:["Harvester","Baker"], traits:["Hard Worker"] }),
  Lockhaven: Object.freeze({ skills:["Weaver","Armorer"], traits:["Generous","Guard's Honor"] }),
  "Port Sumac": Object.freeze({ skills:["Boatcrafter","Weather Watcher"], traits:["Tough","Weather Sense"] }),
  Shaleburrow: Object.freeze({ skills:["Mason","Harvester","Miller"], traits:["Open-Minded"] }),
  Sprucetuck: Object.freeze({ skills:["Scientist","Loremouse"], traits:["Inquisitive","Rational"] })
});

const NATURAL_TALENT_SKILLS = Object.freeze([
  "Administrator","Apiarist","Archivist","Armorer","Baker","Boatcrafter","Brewer","Carpenter",
  "Cartographer","Cook","Manipulator","Fighter","Glazier","Haggler","Harvester","Healer","Hunter",
  "Insectrist","Instructor","Laborer","Loremouse","Militarist","Miller","Orator","Pathfinder",
  "Persuader","Potter","Scientist","Scout","Smith","Stonemason","Survivalist","Weather Watcher","Weaver"
]);

const TRADE_SKILLS = Object.freeze([
  "Apiarist","Archivist","Armorer","Baker","Boatcrafter","Brewer","Carpenter","Cartographer",
  "Glazier","Harvester","Insectrist","Miller","Potter","Smith","Stonemason","Weaver"
]);

const SENIOR_ARTISAN_SKILLS = Object.freeze([
  "Apiarist","Archivist","Armorer","Baker","Brewer","Carpenter","Cartographer","Cook","Glazier",
  "Harvester","Healer","Insectrist","Laborer","Miller","Potter","Smith","Stonemason","Weaver"
]);

const CONVINCING_SKILLS = Object.freeze(["Manipulator","Orator","Persuader"]);
const MENTOR_SKILLS = Object.freeze(["Fighter","Healer","Hunter","Instructor","Pathfinder","Scout","Survivalist","Weather Watcher"]);
const SPECIALTY_SKILLS = MENTOR_SKILLS;
const TENDERPAW_WISES = Object.freeze(["Code of the Guard-wise","Legends of the Guard-wise"]);
const CAPTAIN_REQUIRED_WISES = Object.freeze(["Lockhaven-wise","Matriarch-wise"]);
const WEAPONS = Object.freeze(["Shield","Knife","Sword","Staff","Spear","Hook and Line","Halberd","Sling","Bow"]);

const BORN_TRAITS = Object.freeze([
  "Bigpaw","Bitter","Bodyguard","Bold","Brave","Calm","Clever","Compassionate","Cunning","Curious",
  "Deep Ear","Defender","Determined","Driven","Early Riser","Extrovert","Fat","Fearful","Fearless",
  "Fiery","Generous","Graceful","Guard's Honor","Innocent","Jaded","Leader","Longtail","Lost",
  "Natural Bearings","Nimble","Nocturnal","Oldfur","Quick-Witted","Quiet","Scarred","Sharp-Eyed",
  "Sharptooth","Short","Skeptical","Skinny","Stoic","Stubborn","Suspicious","Tall","Thoughtful",
  "Tough","Weather Sense","Wise","Wolf's Snout","Young"
]);

const PARENT_TRAITS = Object.freeze([
  "Bigpaw","Brave","Calm","Clever","Compassionate","Curious","Deep Ear","Defender","Determined",
  "Early Riser","Extrovert","Fearful","Fearless","Fiery","Generous","Graceful","Longtail","Lost",
  "Natural Bearings","Nimble","Quick-Witted","Quiet","Scarred","Sharptooth","Short","Skeptical",
  "Skinny","Stubborn","Suspicious","Tall","Tough","Wolf's Snout"
]);

const ROAD_TRAITS = Object.freeze([
  "Bitter","Bodyguard","Brave","Calm","Clever","Compassionate","Cunning","Curious","Defender",
  "Driven","Early Riser","Fearful","Fearless","Jaded","Leader","Natural Bearings","Nocturnal",
  "Oldfur","Quiet","Scarred","Sharp-Eyed","Skeptical","Skinny","Stoic","Thoughtful","Tough",
  "Weather Sense","Wise"
]);

const WINTER_NATURE_TRAITS = Object.freeze(["Bold","Generous","Impetuous"]);
const PREDATOR_NATURE_TRAITS = Object.freeze(["Fearless","Brave","Foolish"]);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function list(value) {
  if (Array.isArray(value)) return value.map(v => String(v ?? "").trim()).filter(Boolean);
  const single = String(value ?? "").trim();
  return single ? [single] : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value ?? min)));
}

function incrementSkill(ratings, name) {
  const key = String(name ?? "").trim();
  if (!key) return;
  ratings[key] = ratings[key] == null ? 2 : Math.min(6, Number(ratings[key]) + 1);
}

function addTrait(checks, name) {
  const key = String(name ?? "").trim();
  if (!key) return;
  checks[key] = Math.min(3, Number(checks[key] ?? 0) + 1);
}

function cleanPerson(value) {
  if (!value) return { name:"", actorId:"", role:"", notes:"", olderMouse:false, traits:[] };
  if (typeof value === "string") return { name:value.trim(), actorId:"", role:"", notes:"", olderMouse:false, traits:[] };
  return {
    name:String(value.name ?? "").trim(),
    actorId:String(value.actorId ?? "").trim(),
    role:String(value.role ?? value.profession ?? "").trim(),
    notes:String(value.notes ?? "").trim(),
    olderMouse:value.olderMouse === true,
    traits:Array.isArray(value.traits) ? value.traits.map(t => String(t?.name ?? t ?? "").trim()).filter(Boolean) : []
  };
}

function personText(person) {
  return [person.name, person.role].filter(Boolean).join(" — ");
}

function normalizedRelationships(answers) {
  const rel = answers.relationships ?? {};
  return {
    parents: (Array.isArray(rel.parents) ? rel.parents : []).map(cleanPerson).filter(p => p.name),
    seniorArtisan: cleanPerson(rel.seniorArtisan),
    mentor: cleanPerson(rel.mentor),
    friend: cleanPerson(rel.friend),
    enemy: cleanPerson(rel.enemy)
  };
}

function gearDoc(name, category = "Gear") {
  return {
    name:String(name ?? "").trim(),
    type:"gear",
    flags:{ "realm-guard":{ recruitmentGear:true, mg2eCreation:true } },
    system:{
      category,
      location:"unassigned",
      equipped:false,
      description:"Mouse Guard 2E Recruitment gear."
    }
  };
}

function derive({ answers = {}, allocations = {} } = {}) {
  const rankId = String(answers.rank ?? "").trim();
  const rank = RANKS[rankId] ?? null;
  const allocation = allocations ?? {};
  const ratings = { ...(rank?.skills ?? {}) };
  const traitChecks = {};
  const hometown = HOMETOWNS[String(answers.hometown ?? "").trim()] ?? null;

  incrementSkill(ratings, answers.hometownSkill);
  addTrait(traitChecks, answers.hometownTrait);

  for (const name of list(allocation.naturalTalent)) incrementSkill(ratings, name);
  incrementSkill(ratings, allocation.parentsTrade);
  for (const name of list(allocation.convincing)) incrementSkill(ratings, name);
  incrementSkill(ratings, allocation.seniorArtisanTrade);
  for (const name of list(allocation.mentorTraining)) incrementSkill(ratings, name);
  incrementSkill(ratings, allocation.specialty);

  let nature = 3;
  const natureAnswers = answers.natureAnswers ?? {};
  if (natureAnswers.saveForWinter === true) nature += 1;
  if (natureAnswers.runAndHide === true) {
    nature += 1;
    if (ratings.Fighter != null) ratings.Fighter = Math.max(1, Number(ratings.Fighter) - 1);
  }
  if (natureAnswers.fearPredators === true) nature += 1;
  nature = clamp(nature, 2, 6);

  if (natureAnswers.saveForWinter === false && answers.winterTrait) addTrait(traitChecks, answers.winterTrait);
  if (natureAnswers.fearPredators === false && answers.natureTrait) addTrait(traitChecks, answers.natureTrait);

  addTrait(traitChecks, answers.bornTrait);
  if (rankId === "tenderpaw") addTrait(traitChecks, answers.parentTrait);
  if (["patrolLeader","guardCaptain"].includes(rankId)) addTrait(traitChecks, answers.roadTrait);
  for (const entry of list(allocation.traits)) addTrait(traitChecks, entry);

  const wises = [...new Set(list(allocation.wises))];
  const gear = [];
  if (answers.weapon) gear.push({name:String(answers.weapon),kind:"Weapon"});
  for (const name of list(answers.jobTools)) gear.push({name,kind:"Gear"});

  return {
    derivedValues: {
    identity:{
      name:String(answers.name ?? "").trim(),
      concept:String(answers.concept ?? "").trim(),
      rank:rankId,
      age:Number(answers.age ?? 0),
      hometown:String(answers.hometown ?? "").trim(),
      furColor:String(answers.furColor ?? "").trim(),
      cloakColor:rankId === "tenderpaw" ? "" : String(answers.cloakColor ?? "").trim()
    },
    nature,
    abilities:{
      nature,
      will:Number(rank?.will ?? 0),
      health:Number(rank?.health ?? 0),
      resources:Number(rank?.resources ?? 0),
      circles:Number(rank?.circles ?? 0)
    },
    skillRatings:ratings,
    traitChecks,
    wises,
    resources:{ fate:1, persona:1, checks:0 },
    gear,
    rankRule:rank ? {
      wiseCount:rank.wiseCount,
      naturalTalentCount:rank.naturalTalentCount,
      convincingCount:rank.convincingCount,
      mentorTrainingCount:rank.mentorTrainingCount,
      specialtyCount:rank.specialtyCount
    } : null,
    hometownRule:hometown,
    skillChecks:{},
    wiseChecks:{},
    grants:[
      { type:"RESOURCE", key:"fate", value:1 },
      { type:"RESOURCE", key:"persona", value:1 }
    ],
    creationPolicy:{
      source:SOURCE,
      wiseMode:"UNRATED",
      startingSkillRating:2,
      startingSkillCap:6,
      inventoryPolicy:"LOOSE",
      automaticNpcCreation:false,
      liveAuthority:"CORE_M9_WHEN_ACTIVE"
    }
    },
    warnings:[]
  };
}

function issue(code, field, message, value = null) {
  return { code, field, message, value };
}


function partyRows(partyContext) {
  return [...(partyContext?.existingCharacters ?? []), ...(partyContext?.otherDraftCharacters ?? [])];
}

function partyRank(row) {
  return String(row?.rank ?? row?.answers?.rank ?? "");
}

function partyTraits(row) {
  return new Set((row?.traits ?? []).map(t => String(t?.name ?? t ?? "").trim().toLowerCase()).filter(Boolean));
}

function validatePartyRank(rankId, answers, partyContext, errors) {
  const rows = partyRows(partyContext);
  if (rankId === "guardCaptain") {
    if (answers.guardCaptainApproved !== true) {
      errors.push(issue("MG2E_GUARD_CAPTAIN_GROUP_APPROVAL","guardCaptainApproved","A Guard Captain requires group approval."));
    }
    if (rows.some(row => partyRank(row) === "guardCaptain")) {
      errors.push(issue("MG2E_GUARD_CAPTAIN_UNIQUE","rank","There may only be one Guard Captain in the group."));
    }
  }

  if (rankId === "patrolLeader") {
    const ranks = [...rows.map(partyRank), rankId];
    const leaders = ranks.filter(rank => rank === "patrolLeader").length;
    if (leaders > 1) {
      const tenderpaws = ranks.filter(rank => rank === "tenderpaw").length;
      if (!(ranks.length === 4 && leaders === 2 && tenderpaws === 2)) {
        errors.push(issue("MG2E_PATROL_LEADER_LIMIT","rank","A second Patrol Leader is only allowed in a four-player group when the other two characters are Tenderpaws."));
      }
    }
  }
}

function validateStep({ stepId, draft, partyContext }) {
  const a = draft.answers ?? {};
  const d = draft.derivedValues ?? {};
  const rankId = String(a.rank ?? "");
  const rank = RANKS[rankId];
  const allocation = draft.allocations ?? {};
  const errors = [];
  const warnings = [];

  if (["identity","rank-age"].includes(stepId)) {
    if (!String(a.name ?? "").trim()) errors.push(issue("NAME_REQUIRED","name","Enter the guardmouse's name."));
    if (!rank) errors.push(issue("MG2E_RANK_REQUIRED","rank","Choose a Mouse Guard rank."));
    if (rank && (Number(a.age) < rank.age[0] || Number(a.age) > rank.age[1])) {
      errors.push(issue("MG2E_AGE_RANGE","age",rank.label + " age must be " + rank.age[0] + "-" + rank.age[1] + ".",a.age));
    }
    if (rank) validatePartyRank(rankId, a, partyContext, errors);
  }

  if (stepId === "hometown") {
    const town = HOMETOWNS[String(a.hometown ?? "")];
    if (!town) errors.push(issue("MG2E_HOMETOWN_REQUIRED","hometown","Choose one of the eight principal Recruitment hometowns."));
    if (town && !town.skills.includes(String(a.hometownSkill ?? ""))) {
      errors.push(issue("MG2E_HOMETOWN_SKILL","hometownSkill","Choose one Skill from the selected hometown package.",a.hometownSkill));
    }
    if (town && !town.traits.includes(String(a.hometownTrait ?? ""))) {
      errors.push(issue("MG2E_HOMETOWN_TRAIT","hometownTrait","Choose one Trait from the selected hometown package.",a.hometownTrait));
    }
  }

  if (stepId === "life-experience" && rank) {
    const natural = list(allocation.naturalTalent);
    const convincing = list(allocation.convincing);
    const mentor = list(allocation.mentorTraining);
    if (natural.length !== rank.naturalTalentCount || natural.some(x => !NATURAL_TALENT_SKILLS.includes(x))) {
      errors.push(issue("MG2E_NATURAL_TALENT_COUNT","allocations.naturalTalent","Natural Talent selections do not match rank allowance.",natural));
    }
    if (!TRADE_SKILLS.includes(String(allocation.parentsTrade ?? ""))) {
      errors.push(issue("MG2E_PARENTS_TRADE","allocations.parentsTrade","Choose one Parents' Trade Skill.",allocation.parentsTrade));
    }
    if (convincing.length !== rank.convincingCount || convincing.some(x => !CONVINCING_SKILLS.includes(x))) {
      errors.push(issue("MG2E_CONVINCING_COUNT","allocations.convincing","Convincing selections do not match rank allowance.",convincing));
    }
    if (!SENIOR_ARTISAN_SKILLS.includes(String(allocation.seniorArtisanTrade ?? ""))) {
      errors.push(issue("MG2E_SENIOR_ARTISAN_TRADE","allocations.seniorArtisanTrade","Choose one Senior Artisan trade Skill.",allocation.seniorArtisanTrade));
    }
    if (mentor.length !== rank.mentorTrainingCount || mentor.some(x => !MENTOR_SKILLS.includes(x))) {
      errors.push(issue("MG2E_MENTOR_TRAINING_COUNT","allocations.mentorTraining","Mentor Training selections do not match rank allowance.",mentor));
    }
  }

  if (stepId === "specialty" && rank) {
    const specialty = String(allocation.specialty ?? "").trim();
    if (rank.specialtyCount === 0 && specialty) errors.push(issue("MG2E_TENDERPAW_NO_SPECIALTY","allocations.specialty","Tenderpaws do not choose a Specialty.",specialty));
    if (rank.specialtyCount === 1 && !SPECIALTY_SKILLS.includes(specialty)) errors.push(issue("MG2E_SPECIALTY_REQUIRED","allocations.specialty","Choose one valid Guard Specialty.",specialty));
    if (specialty) {
      const other = [...(partyContext?.existingCharacters ?? []), ...(partyContext?.otherDraftCharacters ?? [])]
        .find(row => String(row?.specialty ?? "") === specialty && String(row?.name ?? "") !== String(a.name ?? ""));
      if (other) errors.push(issue("MG2E_SPECIALTY_UNIQUE","allocations.specialty","Specialty must be unique within the patrol.",specialty));
    }
  }

  if (stepId === "nature") {
    const n = a.natureAnswers ?? {};
    for (const key of ["saveForWinter","runAndHide","fearPredators"]) {
      if (typeof n[key] !== "boolean") errors.push(issue("MG2E_NATURE_QUESTION","natureAnswers." + key,"Answer all three Mouse Nature questions.",n[key]));
    }
    if (n.saveForWinter === false && !WINTER_NATURE_TRAITS.includes(String(a.winterTrait ?? ""))) {
      errors.push(issue("MG2E_WINTER_NATURE_TRAIT","winterTrait","If the mouse does not save for winter, choose Bold, Generous or Impetuous at level 1.",a.winterTrait));
    }
    if (n.fearPredators === false && !PREDATOR_NATURE_TRAITS.includes(String(a.natureTrait ?? ""))) {
      errors.push(issue("MG2E_NATURE_TRAIT","natureTrait","If the mouse does not fear owls, weasels and wolves, choose Fearless, Brave or Foolish.",a.natureTrait));
    }
  }

  if (stepId === "wises" && rank) {
    const wises = list(allocation.wises);
    if (wises.length !== rank.wiseCount) errors.push(issue("MG2E_WISE_COUNT","allocations.wises","Wise count does not match Guard rank.",wises.length));
    if (rankId === "tenderpaw" && wises.some(x => !TENDERPAW_WISES.includes(x))) {
      errors.push(issue("MG2E_TENDERPAW_WISE","allocations.wises","Tenderpaws choose Code of the Guard-wise or Legends of the Guard-wise.",wises));
    }
    if (rankId === "guardCaptain" && !wises.some(x => CAPTAIN_REQUIRED_WISES.includes(x))) {
      errors.push(issue("MG2E_CAPTAIN_REQUIRED_WISE","allocations.wises","Guard Captains must include Lockhaven-wise or Matriarch-wise.",wises));
    }
  }

  if (stepId === "traits") {
    if (!BORN_TRAITS.includes(String(a.bornTrait ?? ""))) {
      errors.push(issue("MG2E_BORN_TRAIT","bornTrait","Choose one source-listed quality the mouse was born with.",a.bornTrait));
    }
    if (rankId === "tenderpaw" && !PARENT_TRAITS.includes(String(a.parentTrait ?? ""))) {
      errors.push(issue("MG2E_PARENT_TRAIT","parentTrait","Tenderpaws choose one source-listed Trait learned or inherited from their parents.",a.parentTrait));
    }
    if (["patrolLeader","guardCaptain"].includes(rankId) && !ROAD_TRAITS.includes(String(a.roadTrait ?? ""))) {
      errors.push(issue("MG2E_ROAD_TRAIT","roadTrait","Patrol Leaders and Guard Captains choose one Life on the Road Trait.",a.roadTrait));
    }
    for (const [name,rating] of Object.entries(d.traitChecks ?? {})) {
      if (Number(rating) < 1 || Number(rating) > 3) errors.push(issue("MG2E_TRAIT_CAP","traits","Trait rating must be 1-3.",{name,rating}));
    }
  }

  if (stepId === "relationships") {
    const rel = normalizedRelationships(a);
    if (!rel.parents.length) errors.push(issue("MG2E_PARENT_REQUIRED","relationships.parents","Name at least one parent."));
    if (!rel.seniorArtisan.name) errors.push(issue("MG2E_SENIOR_ARTISAN_REQUIRED","relationships.seniorArtisan","Name the Senior Artisan."));
    if (!rel.mentor.name) errors.push(issue("MG2E_MENTOR_REQUIRED","relationships.mentor","Recruitment requires a Guard mentor."));
    if (rankId === "tenderpaw" && rel.mentor.name) {
      const mentorPc = partyRows(partyContext).find(row => String(row?.actorId ?? "") === rel.mentor.actorId || String(row?.name ?? "") === rel.mentor.name);
      if (!mentorPc && rel.mentor.olderMouse !== true) {
        errors.push(issue("MG2E_TENDERPAW_MENTOR","relationships.mentor","A Tenderpaw mentor should be a current player character, preferably a Patrol Leader; otherwise mark the NPC mentor as an older mouse.",rel.mentor.name));
      }
    }
    if (rankId !== "tenderpaw" && rel.mentor.actorId) {
      const mentorPc = partyRows(partyContext).find(row => String(row?.actorId ?? "") === rel.mentor.actorId);
      const oldfur = mentorPc ? partyTraits(mentorPc).has("oldfur") : rel.mentor.traits.map(x => x.toLowerCase()).includes("oldfur");
      if (mentorPc && !oldfur) errors.push(issue("MG2E_EXPERIENCED_MENTOR_OLDFUR","relationships.mentor","An experienced mouse may use a player-character mentor only if that mentor has Oldfur.",rel.mentor.name));
    }
  }

  if (stepId === "cloak") {
    if (rankId === "tenderpaw" && String(a.cloakColor ?? "").trim()) {
      errors.push(issue("MG2E_TENDERPAW_NO_CLOAK","cloakColor","Tenderpaws do not start with a cloak.",a.cloakColor));
    }
    if (rankId !== "tenderpaw" && rank && !String(a.cloakColor ?? "").trim()) {
      errors.push(issue("MG2E_CLOAK_REQUIRED","cloakColor","Experienced Guard ranks choose a cloak color.",a.cloakColor));
    }
  }

  if (["belief","goal","instinct"].includes(stepId)) {
    const key = stepId;
    if (!String(a.drives?.[key] ?? "").trim()) errors.push(issue("MG2E_DRIVE_REQUIRED","drives." + key,"Write the character's " + key + "."));
  }

  if (stepId === "gear-rewards") {
    if (!WEAPONS.includes(String(a.weapon ?? ""))) errors.push(issue("MG2E_STARTING_WEAPON","weapon","Choose one Recruitment weapon.",a.weapon));
  }

  return { errors, warnings };
}

function buildCommitSpec({ draft }) {
  const a = draft.answers ?? {};
  const d = draft.derivedValues ?? {};
  const identity = d.identity ?? {};
  const abilities = d.abilities ?? {};
  const rel = normalizedRelationships(a);

  const skills = Object.fromEntries(Object.entries(d.skillRatings ?? {}).map(([name,rating]) => [
    name,
    { rating:Number(rating), learning:{ passed:0, failed:0 }, beginnerAttempts:0 }
  ]));

  const traits = Object.entries(d.traitChecks ?? {}).map(([name,rating]) => ({
    name,
    type:"trait",
    flags:{ "realm-guard":{ recruitmentTrait:true, mg2eCreation:true } },
    system:{ rating:Number(rating), description:"Mouse Guard 2E Recruitment Trait." }
  }));

  const wises = (d.wises ?? []).map(name => ({
    name,
    type:"wise",
    flags:{ "realm-guard":{ recruitmentWise:true, mg2eCreation:true, mg2eUnratedWise:true } },
    system:{ rating:0, description:"Mouse Guard 2E unrated Wise." }
  }));

  const gear = (d.gear ?? []).map(entry => gearDoc(entry.name, entry.kind));

  return {
    actor:{
      name:identity.name,
      type:"character",
      folder:{ documentName:"Actor", name:"PC" },
      ownershipPolicy:"CREATOR_OWNER_IF_NON_GM",
      createOptions:{ realmGuardSkipRecruitmentProvisioning:true },
      system:{
        biographySource:String(a.background ?? ""),
        notes:"",
        concept:identity.concept,
        rank:identity.rank,
        homeland:identity.hometown,
        age:String(identity.age),
        lineage:"",
        insignia:"",
        seniorArtisan:personText(rel.seniorArtisan),
        friend:personText(rel.friend),
        cloak:identity.cloakColor,
        weapon:"",
        mentor:personText(rel.mentor),
        enemy:personText(rel.enemy),
        parents:rel.parents.map(personText).join("; "),
        belief:String(a.drives?.belief ?? ""),
        goal:String(a.drives?.goal ?? ""),
        instinct:String(a.drives?.instinct ?? ""),
        attributes:{
          nature:{ value:Number(abilities.nature ?? 0), maximum:Number(abilities.nature ?? 0) },
          will:{ value:Number(abilities.will ?? 0), max:6 },
          health:{ value:Number(abilities.health ?? 0), max:6 },
          resources:{ value:Number(abilities.resources ?? 0), max:10 },
          circles:{ value:Number(abilities.circles ?? 0), max:10 }
        },
        resources:{
          fate:{ value:1, max:5 },
          persona:{ value:1, max:5 },
          checks:{ value:0, max:9 }
        },
        roll:{ versus:false, obstacle:1, modifier:0 }
      },
      flags:{
        "realm-guard":{
          mg2eCreationPreview:true,
          recruitmentVersion:"MG2E_M10C5",
          creationRelationships:rel,
          recruitmentNatureAnswers:{ ...(a.natureAnswers ?? {}) },
          recruitmentWiseNames:[...(d.wises ?? [])],
          recruitmentHometown:String(a.hometown ?? ""),
          recruitmentSpecialty:String(draft.allocations?.specialty ?? "")
        }
      }
    },
    provisioning:{
      canonicalSkills:{ mode:"PROFILE_SET", names:[...new Set([...NATURAL_TALENT_SKILLS,...Object.keys(skills)])], ratings:skills },
      traits,
      wises,
      gear,
      canonicalConditions:{
        mode:"MG2E_PROFILE_SET",
        names:["Hungry & Thirsty","Angry","Tired","Injured","Sick"]
      },
      inventory:{ policy:"LOOSE", slotPlacementAuthority:false, preservePlacementAsPresentation:true }
    },
    relationships:{
      normalized:rel,
      liveWrite:false,
      readyWhenActive:true,
      plannedLiveService:"CORE_M8_ON_ACTIVE_MG2E"
    },
    postCommit:[],
    transaction:{
      mode:"COMPENSATING_ROLLBACK",
      liveExecution:false,
      readyWhenActive:true,
      atomicBoundary:"ACTOR_AND_EMBEDDED_DOCUMENTS",
      criticalPhases:["CREATE_ACTOR","PROVISION_SKILLS","CREATE_ITEMS","PROVISION_CONDITIONS","NORMALIZE_RELATIONSHIPS","WRITE_PROVENANCE"],
      compensation:[{ onFailureAfter:"CREATE_ACTOR", action:"DELETE_CREATED_ACTOR" }],
      provenanceWrite:false,
      relationshipWrite:false,
      previewOnly:true,
      activationReadiness:"READY_WHEN_ACTIVE",
      activationRequired:"mg2e"
    }
  };
}

export const MG2E_CREATION_PROFILE = new CharacterCreationProfile({
  id:MG2E_CREATION_PROFILE_ID,
  version:MG2E_CREATION_PROFILE_VERSION,
  name:"Mouse Guard 2E — Recruitment",
  dimensions:[
    { id:"guard-rank", label:"Guard Rank", options:Object.fromEntries(Object.entries(RANKS).map(([id,row]) => [id,row.label])) },
    { id:"hometown", label:"Hometown", options:Object.keys(HOMETOWNS) }
  ],
  steps:[
    { id:"identity", type:"CHOICE", sourceStep:"Concept" },
    { id:"rank-age", type:"CHOICE", sourceStep:"Guard Rank / Mouse Age and Ability" },
    { id:"hometown", type:"CHOICE", sourceStep:"Where Were You Born?" },
    { id:"life-experience", type:"ALLOCATION", sourceStep:"Life Experience" },
    { id:"specialty", type:"ALLOCATION", sourceStep:"What's Your Specialty?" },
    { id:"nature", type:"QUESTION", sourceStep:"Mouse Nature" },
    { id:"wises", type:"ALLOCATION", sourceStep:"Being Wise" },
    { id:"resources-circles", type:"REVIEW", sourceStep:"Guard Resources / Guard Circles" },
    { id:"traits", type:"ALLOCATION", sourceStep:"Mouse Traits — born quality / Tenderpaw parent Trait / veteran Life on the Road Trait" },
    { id:"name-fur", type:"CHOICE", sourceStep:"Name / Fur Color" },
    { id:"relationships", type:"RELATIONSHIP", sourceStep:"Parents / Senior Artisan / Mentor / Friend / Enemy" },
    { id:"cloak", type:"CHOICE", sourceStep:"Cloak Color" },
    { id:"belief", type:"TEXT", sourceStep:"Belief" },
    { id:"goal", type:"TEXT", sourceStep:"Goal" },
    { id:"instinct", type:"TEXT", sourceStep:"Instinct" },
    { id:"gear-rewards", type:"GEAR", sourceStep:"Gear / Starting Rewards" }
  ],
  rules:{
    source:SOURCE,
    recruitmentSteps:21,
    wiseMode:"UNRATED",
    startingSkillRating:2,
    startingSkillCap:6,
    inventoryPolicy:"LOOSE",
    startingNature:3,
    natureDescriptors:["Escaping","Climbing","Hiding","Foraging"],
    resourcesByRank:Object.fromEntries(Object.entries(RANKS).map(([id,row]) => [id,row.resources])),
    circlesByRank:Object.fromEntries(Object.entries(RANKS).map(([id,row]) => [id,row.circles])),
    tenderpawWiseChoices:[...TENDERPAW_WISES],
    guardCaptainRequiredWiseChoices:[...CAPTAIN_REQUIRED_WISES],
    mentorValidation:"MG2E_SOURCE_RULES",
    enemyValidation:"MG2E_OPTIONAL_ANY_APPROPRIATE_ENEMY",
    enemyHouseRuleAllowed:false,
    automaticNpcCreation:false,
    partyConstraints:["PATROL_LEADER_LIMIT","GUARD_CAPTAIN_UNIQUE_AND_GROUP_APPROVED","TENDERPAW_MENTOR","UNIQUE_SPECIALTY"],
    natureQuestionTraits:{
      saveForWinterNo:[...WINTER_NATURE_TRAITS],
      fearPredatorsNo:[...PREDATOR_NATURE_TRAITS]
    },
    traitSelection:{
      born:[...BORN_TRAITS],
      tenderpawParent:[...PARENT_TRAITS],
      patrolLeaderGuardCaptainRoad:[...ROAD_TRAITS]
    }
  },
  grants:{ fate:1, persona:1, checks:0 },
  metadata:{
    source:SOURCE,
    coreEngine:"CORE_M9",
    liveAuthority:"CORE_M9_WHEN_ACTIVE",
    commitAuthority:"CORE_M9_WHEN_ACTIVE",
    mode:"READY_WHEN_ACTIVE",
    foundationOnly:false,
    readyWhenActive:true,
    activationRequired:"mg2e",
    automaticNpcCreation:false,
    profileRoutingKind:"MG2E_SOURCE_OWNED",
    wisesUnrated:true
  },
  derive,
  validateStep,
  buildCommitSpec
});

export const MG2E_CREATION_RANKS = RANKS;
export const MG2E_CREATION_HOMETOWNS = HOMETOWNS;
export const MG2E_CREATION_WEAPONS = WEAPONS;
export const MG2E_CREATION_SKILL_LISTS = freeze({
  naturalTalent:[...NATURAL_TALENT_SKILLS],
  parentsTrade:[...TRADE_SKILLS],
  seniorArtisan:[...SENIOR_ARTISAN_SKILLS],
  convincing:[...CONVINCING_SKILLS],
  mentorTraining:[...MENTOR_SKILLS],
  specialty:[...SPECIALTY_SKILLS]
});
