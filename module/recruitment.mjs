import { ensureDefaultSkills } from "./default-skills.mjs";
import { ensureDefaultConditions } from "./conditions.mjs";

const STATIONS = Object.freeze({
  recruit: { label: "Recruit", ageMin: 20, ageMax: 25, will: 2, health: 6, resources: 1, circles: 1, natural: 2, service: 3, wises: 1 },
  scout: { label: "Scout", ageMin: 25, ageMax: 45, will: 3, health: 5, resources: 2, circles: 2, natural: 1, service: 6, wises: 2 },
  veteran: { label: "Veteran", ageMin: 40, ageMax: 75, will: 4, health: 4, resources: 3, circles: 3, natural: 1, service: 8, wises: 3 },
  captain: { label: "Captain", ageMin: 50, ageMax: 90, will: 5, health: 4, resources: 4, circles: 3, natural: 1, service: 9, wises: 4 },
  lord: { label: "Lord", ageMin: 80, ageMax: 150, will: 6, health: 3, resources: 5, circles: 4, natural: 2, service: 12, wises: 6 }
});

const HOMELANDS = Object.freeze({
  rhudaur: { label: "Rhudaur", text: "Formerly the eastern nation of Arnor, including Rivendell and villages between Bree and the Misty Mountains.", skills: ["Archivist", "Animal Handler", "Carpenter"], traits: ["Calm", "Natural Bearings"] },
  bree: { label: "Bree-land", text: "A quiet area whose populace keeps to their own business.", skills: ["Miller", "Farmer", "Brewer"], traits: ["Short", "Independent"] },
  esgaroth: { label: "Esgaroth & Dale", text: "The folk of this region ply the lake and river.", skills: ["Boatcrafter", "Carpenter", "Haggler"], traits: ["Sharp-Eyed", "Driven"] },
  gondor: { label: "Gondor", text: "Includes the capital, Lebennin and Lamedon.", skills: ["Archivist", "Stonemason", "Alchemist"], traits: ["Brave", "Wise"] },
  doren: { label: "Dor-en-Ernil", text: "Includes Dol Amroth, Belfalas and Anfalas.", skills: ["Rider", "Boatcrafter", "Orator"], traits: ["Graceful", "Tall"] },
  tharbad: { label: "Tharbad", text: "A trade town on the Bruinen and Greenway.", skills: ["Haggler", "Glazier", "Laborer"], traits: ["Rational", "Hard Worker"] },
  sarn: { label: "Sarn Ford", text: "A quiet, self-sufficient town named for the ford it straddles.", skills: ["Farmer", "Stonemason", "Miller"], traits: ["Steady Hand", "Quick-Witted"] },
  rhovanion: { label: "Rhovanion", text: "Villages and communities on the western border of Mirkwood.", skills: ["Baker", "Animal Handler", "Herdsman"], traits: ["Stoic", "Tough"] }
});

const NATURAL_TALENT = Object.freeze([
  "Administrator", "Alchemist", "Animal Handler", "Archivist", "Armorer", "Baker", "Boatcrafter", "Brewer", "Carpenter", "Cartographer", "Cook", "Deceiver", "Farmer", "Fighter", "Glazier", "Haggler", "Healer", "Herdsman", "Hunter", "Instructor", "Laborer", "Militarist", "Miller", "Orator", "Pathfinder", "Persuader", "Potter", "Rider", "Scout", "Smith", "Stonemason", "Survivalist", "Weather Watcher", "Weaver"
]);
const TRADE_SKILLS = Object.freeze(["Animal Handler", "Archivist", "Armorer", "Baker", "Boatcrafter", "Brewer", "Carpenter", "Cartographer", "Farmer", "Glazier", "Herdsman", "Miller", "Potter", "Smith", "Stonemason", "Weaver"]);
const APPRENTICESHIP_SKILLS = Object.freeze(["Animal Handler", "Archivist", "Armorer", "Baker", "Brewer", "Carpenter", "Cartographer", "Farmer", "Glazier", "Herdsman", "Miller", "Potter", "Smith", "Stonemason", "Weaver"]);
const CONVINCING_SKILLS = Object.freeze(["Deceiver", "Orator", "Persuader"]);
const MENTOR_SKILLS = Object.freeze(["Fighter", "Healer", "Hunter", "Instructor", "Pathfinder", "Scout", "Survivalist", "Weather Watcher"]);
const SPECIALTY_SKILLS = MENTOR_SKILLS;

const ENEMY_FREE_PEOPLES = Object.freeze([
  { value: "Dunadan", label: "Dúnadan" },
  "Dwarf", "Elf", "Hobbit", "Man"
]);
const ENEMY_SERVANTS_HOUSE_RULE = Object.freeze([
  "Orc", "Troll", "Warg", "Spider", "Other servant of the Enemy"
]);

const INNATE_TRAITS = Object.freeze([
  "Bitter", "Bodyguard", "Bold", "Brave", "Calm", "Clever", "Compassionate", "Cunning", "Curious", "Defender", "Determined", "Driven", "Early Riser", "Extrovert", "Fat", "Fearful", "Fearless", "Fiery", "Generous", "Graceful", "Greybeard", "Innocent", "Jaded", "Keen-Eared", "Leader", "Lost", "Natural Bearings", "Nimble", "Nocturnal", "Quick-Witted", "Quiet", "Realm's Honor", "Rough Hands", "Sharp-Eyed", "Short", "Skeptical", "Skinny", "Stern", "Stoic", "Stubborn", "Suspicious", "Tall", "Thoughtful", "Tough", "Weather Sense", "Wise", "Young"
]);
const RECRUIT_TRAITS = Object.freeze([
  "Brave", "Calm", "Clever", "Compassionate", "Curious", "Defender", "Determined", "Early Riser", "Extrovert", "Fearful", "Fearless", "Fiery", "Generous", "Graceful", "Keen-Eared", "Lost", "Natural Bearings", "Nimble", "Quick-Witted", "Rough Hands", "Scarred", "Short", "Skeptical", "Skinny", "Stern", "Stubborn", "Suspicious", "Tall", "Tough"
]);
const ROAD_TRAITS = Object.freeze([
  "Bitter", "Bodyguard", "Brave", "Calm", "Clever", "Compassionate", "Cunning", "Curious", "Defender", "Driven", "Early Riser", "Fearful", "Fearless", "Greybeard", "Jaded", "Leader", "Natural Bearings", "Nocturnal", "Quiet", "Scarred", "Sharp-Eyed", "Skeptical", "Skinny", "Stern", "Stoic", "Thoughtful", "Tough", "Weather Sense", "Wise"
]);

const WISE_EXAMPLES = Object.freeze([
  "Anduin-wise", "Angmar-wise", "Armor-wise", "Arnor-wise", "Bandit-wise", "Bat-wise", "Barrow-wise", "Beer-wise", "Blizzard-wise", "Bree-land-wise", "Captain-wise", "Celebrations-wise", "Coast-wise", "Cold-wise", "Craft-wise", "Crop-wise", "Crow-wise", "Deadman's Dike-wise", "Drought-wise", "Dwarf-wise", "Dwarven rune-wise", "Eagle-wise", "Elf-wise", "Elven sanctuary-wise", "Epidemic-wise", "Erebor-wise", "Esgaroth-wise", "Escort-wise", "Famine-wise", "Fireworks-wise", "First Age-wise", "Flood-wise", "Forest-wise", "Funeral rites-wise", "Gondor-wise", "Governing-wise", "Heat-wise", "Herb-wise", "Herd-wise", "Hobbit-wise", "Horse-wise", "Inn-wise", "Ithilien-wise", "Lake-wise", "Lord-wise", "Lothlorien-wise", "Medicine-wise", "Minerals-wise", "Mirkwood-wise", "Mordor-wise", "Moria-wise", "Morgul-wise", "Mountain-wise", "Night-wise", "Open ground-wise", "Orc-wise", "Orthanc-wise", "Palantir-wise", "Path-wise", "Pipeweed-wise", "Poems-wise", "Poison-wise", "Rain-wise", "Rebellion-wise", "Recipe-wise", "Refuge-wise", "Reunited Realms-wise", "Rhovanion-wise", "River-wise", "Road-wise", "Rohan-wise", "Rumor-wise", "Sea-wise", "Second Age-wise", "Shield-wise", "Ship-wise", "Shire-wise", "Shore-wise", "Snow-wise", "Song-wise", "Spider-wise", "Star-wise", "Stream-wise", "Swamp-wise", "Tale-wise", "Third Age-wise", "Thunderstorm-wise", "Tide-wise", "Tokens of Power-wise", "Tradesman-wise", "Trail-wise", "Trap-wise", "Troll-wise", "Tunnel-wise", "War-wise", "Warg-wise", "Watchtower-wise", "Wight-wise", "Wilds-wise", "Wine-wise", "Wizard-wise"
]);

const WEAPONS = Object.freeze([
  { name: "Shield", hands: 1 }, { name: "Knife", hands: 1 }, { name: "Sword", hands: 1 }, { name: "Staff", hands: 2 }, { name: "Spear", hands: 2 }, { name: "Whip", hands: 1 }, { name: "Halberd", hands: 2 }, { name: "Sling", hands: 1 }, { name: "Bow", hands: 2 }
]);

const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const checked = (form, name) => Boolean(form?.elements?.[name]?.checked);
const value = (form, name, fallback = "") => String(form?.elements?.[name]?.value ?? fallback).trim();
const numberValue = (form, name, fallback = 0) => Number(form?.elements?.[name]?.value ?? fallback) || 0;
const station = state => STATIONS[state.rank] ?? STATIONS.scout;
const modeHelp = (state, html) => state.mode === "quick" ? "" : `<div class="rg-recruit-guide">${html}</div>`;

function normalizeWise(name) {
  const clean = String(name ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return "";
  return /-wise$/i.test(clean) ? clean : `${clean}-wise`;
}

function options(list, selected = "", { placeholder = "Choose...", disabled = new Map() } = {}) {
  const out = [`<option value="">${esc(placeholder)}</option>`];
  for (const entry of list) {
    const value = typeof entry === "string" ? entry : entry.value;
    const label = typeof entry === "string" ? entry : entry.label;
    const reason = disabled.get(value);
    out.push(`<option value="${esc(value)}" ${String(selected) === String(value) ? "selected" : ""} ${reason ? "disabled" : ""}>${esc(label)}${reason ? ` - ${esc(reason)}` : ""}</option>`);
  }
  return out.join("");
}

function stationOptions(selected) {
  return options(Object.entries(STATIONS).map(([value, s]) => ({ value, label: `${s.label} - age ${s.ageMin}-${s.ageMax}, Will ${s.will}, Health ${s.health}` })), selected, { placeholder: "Select Station..." });
}

function stepHeader(state, current, total, title, subtitle) {
  return `<header class="rg-recruit-hero"><div class="rg-recruit-progress"><span>RECRUITMENT 2.0</span><strong>STEP ${current}/${total}</strong></div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p><div class="rg-recruit-mode-pill"><i class="fa-solid ${state.mode === "quick" ? "fa-bolt" : "fa-book-open"}"></i>${state.mode === "quick" ? "QUICK" : "GUIDED"}</div></header>`;
}

async function showStep(state, { current, total = 11, title, subtitle, body, commit, validate = null, allowBack = true, nextLabel = "Continue", nextIcon = "fa-solid fa-arrow-right" }) {
  while (true) {
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: `Realm Guard · Recruitment · ${title}`, resizable: true },
      position: { width: 860 },
      content: `<form class="realm-guard rg-recruitment">${stepHeader(state, current, total, title, subtitle)}${body()}</form>`,
      modal: false,
      rejectClose: false,
      buttons: [
        ...(allowBack ? [{ action: "back", label: "Back", icon: "fa-solid fa-arrow-left", callback: (_event, button) => { commit?.(button.form); return "back"; } }] : []),
        { action: "next", label: nextLabel, icon: nextIcon, default: true, callback: (_event, button) => { commit?.(button.form); return "next"; } },
        { action: "cancel", label: "Cancel", callback: () => "cancel" }
      ]
    });
    if (!result || result === "cancel") return "cancel";
    if (result === "back") return "back";
    const error = validate?.();
    if (!error) return "next";
    ui.notifications.warn(`Realm Guard: ${error}`);
  }
}

function blankState() {
  return {
    mode: "guided",
    name: "",
    concept: "",
    background: "",
    rank: "scout",
    age: 25,
    natureAnswers: { danger: false, secondAge: false, loss: false, wilds: false, married: false, enemyFirst: false },
    nature: 3,
    homelandKey: "",
    homelandSkill: "",
    homelandTrait: "",
    naturalTalent: [],
    parentsTrade: [],
    convincing: [],
    apprenticeship: "",
    mentorTraining: "",
    serviceAlloc: {},
    specialty: "",
    wiseChoices: [],
    resourceAnswers: { trade: false, parentsWealth: false, gifts: false, thrifty: false, debt: false, pack: false },
    resourceTrade: "",
    parentsResourceProfession: "",
    resources: 2,
    circleAnswers: { gregarious: false, rangerTies: false, reputation: false, enemies: false, crime: false, loner: false },
    rangerTiesBasis: "",
    reputationNote: "",
    circles: 2,
    innateTrait: "",
    inheritedTrait: "",
    roadTrait: "",
    lineage: "",
    insignia: "",
    mom: "",
    dad: "",
    parents: "",
    seniorArtisan: "",
    mentor: "",
    mentorRuleConfirmed: false,
    friend: "",
    friendProfession: "",
    friendLocation: "",
    enemyName: "",
    enemyPeople: "",
    enemyLocation: "",
    allowEnemyServant: false,
    belief: "",
    goal: "",
    instinct: "",
    weapon: "Sword",
    armor: "",
    distinctiveGear: "",
    openSheet: true
  };
}

function computeNature(state) {
  let n = 3;
  if (state.natureAnswers.danger) n -= 1;
  if (state.natureAnswers.secondAge) n += 1;
  if (state.natureAnswers.loss) n += 1;
  if (state.natureAnswers.wilds) n -= 1;
  if (state.natureAnswers.married) n += 1;
  if (state.natureAnswers.enemyFirst) n -= 1;
  return n;
}

function computeResources(state) {
  let n = station(state).resources;
  if (state.resourceAnswers.trade) n += 1;
  if (state.resourceAnswers.parentsWealth) n += 1;
  if (state.resourceAnswers.gifts) n -= 1;
  if (state.resourceAnswers.thrifty) n += 1;
  if (state.resourceAnswers.debt) n -= 1;
  if (state.resourceAnswers.pack) n += 1;
  return Math.max(0, n);
}

function computeCircles(state) {
  let n = station(state).circles;
  if (state.circleAnswers.gregarious) n += 1;
  if (state.circleAnswers.rangerTies) n += 1;
  if (state.circleAnswers.reputation) n += 1;
  if (state.circleAnswers.enemies) n -= 1;
  if (state.circleAnswers.crime) n -= 1;
  if (state.circleAnswers.loner) n -= 1;
  return Math.max(1, n);
}

function bannedTraits(state) {
  const out = new Set();
  if (state.natureAnswers.danger) { out.add("Fearful"); out.add("Young"); }
  if (state.natureAnswers.loss) out.add("Innocent");
  if (state.natureAnswers.wilds) out.add("Open-Minded");
  if (state.natureAnswers.married) out.add("Independent");
  if (state.natureAnswers.enemyFirst) out.add("Compassionate");
  if (state.resourceAnswers.trade) out.add("Leader");
  if (state.resourceAnswers.thrifty) out.add("Generous");
  if (state.resourceAnswers.pack) { out.add("Bold"); out.add("Fiery"); }
  if (state.circleAnswers.gregarious) { out.add("Bitter"); out.add("Jaded"); }
  if (state.circleAnswers.loner) out.add("Extrovert");
  return out;
}

function serviceSkills(rank) {
  const list = ["Fighter", "Healer", "Hunter", "Pathfinder", "Rider", "Scout", "Survivalist", "Weather Watcher"];
  if (rank === "recruit") list.push("Laborer");
  if (rank === "scout") list.push("Haggler");
  if (rank === "veteran") list.push("Cook");
  if (rank === "captain") list.push("Persuader", "Instructor");
  if (rank === "lord") list.push("Orator", "Militarist", "Administrator");
  return list;
}

function computeSkillChecks(state) {
  const map = new Map();
  const add = (name, count = 1) => {
    if (!name || count <= 0) return;
    map.set(name, (map.get(name) ?? 0) + count);
  };
  add(state.homelandSkill);
  for (const name of state.naturalTalent) add(name);
  for (const name of state.parentsTrade) add(name);
  for (const name of state.convincing) add(name);
  add(state.apprenticeship);
  add(state.mentorTraining);
  for (const [name, count] of Object.entries(state.serviceAlloc ?? {})) add(name, Math.max(0, Number(count) || 0));
  add(state.specialty);
  return map;
}

function computeTraitChecks(state) {
  const map = new Map();
  const add = name => { if (name) map.set(name, (map.get(name) ?? 0) + 1); };
  add(state.homelandTrait);
  add(state.innateTrait);
  add(state.inheritedTrait);
  add(state.roadTrait);
  return map;
}

function trainedTradeOptions(state) {
  return [...computeSkillChecks(state).entries()].filter(([, checks]) => checks > 0).map(([name]) => name).sort((a, b) => a.localeCompare(b));
}

function takenSpecialties() {
  const map = new Map();
  for (const actor of game.actors?.contents ?? []) {
    if (actor.type !== "character") continue;
    const specialty = String(actor.getFlag?.("realm-guard", "recruitmentSpecialty") ?? "");
    if (specialty) map.set(specialty, actor.name);
  }
  return map;
}

async function identityStep(state) {
  return showStep(state, {
    current: 1, allowBack: false, title: "Step Upon the Path", subtitle: "Concept, Station and age",
    body: () => {
      const s = station(state);
      return `${modeHelp(state, `<p>Realm Guard Recruitment is intended to be taken question by question. Start with the kind of Ranger you want to play, then choose the Station that represents experience and responsibility.</p>`)}
      <div class="rg-recruit-mode-select"><label><input type="radio" name="mode" value="guided" ${state.mode === "guided" ? "checked" : ""}><span><b>GUIDED</b><small>Rule explanations and prompts on every step.</small></span></label><label><input type="radio" name="mode" value="quick" ${state.mode === "quick" ? "checked" : ""}><span><b>QUICK</b><small>Same rules, less explanatory text.</small></span></label></div>
      <div class="rg-recruit-grid two"><label>Ranger Name<input name="name" value="${esc(state.name)}" autofocus placeholder="Name"></label><label>Station<select name="rank">${stationOptions(state.rank)}</select></label><label>Age<input type="number" name="age" min="${s.ageMin}" max="${s.ageMax}" value="${esc(state.age)}"></label><label>Concept<input name="concept" value="${esc(state.concept)}" placeholder="Grizzled veteran, idealistic scout..."></label></div>
      <label>Biography / Background<textarea name="background" rows="4" placeholder="A short history or personality sketch">${esc(state.background)}</textarea></label>
      <div class="rg-recruit-summary"><span>Station values</span><b>${esc(s.label)} · Age ${s.ageMin}-${s.ageMax} · Will ${s.will} · Health ${s.health}</b></div>`;
    },
    commit: form => {
      state.mode = value(form, "mode", state.mode) || "guided";
      state.name = value(form, "name");
      const oldRank = state.rank;
      state.rank = value(form, "rank", state.rank) || "scout";
      const enteredAge = numberValue(form, "age", state.age);
      if (oldRank !== state.rank) {
        const ns = station(state);
        state.age = enteredAge >= ns.ageMin && enteredAge <= ns.ageMax ? enteredAge : ns.ageMin;
        state.resources = ns.resources;
        state.circles = ns.circles;
        state.naturalTalent = [];
        state.parentsTrade = [];
        state.convincing = [];
        state.serviceAlloc = {};
        state.specialty = "";
        state.wiseChoices = [];
        state.inheritedTrait = "";
        state.roadTrait = "";
      } else state.age = enteredAge;
      state.concept = value(form, "concept");
      state.background = value(form, "background");
    },
    validate: () => {
      const current = station(state);
      if (!state.name) return "Enter the Ranger's name.";
      if (!STATIONS[state.rank]) return "Choose a valid Station.";
      if (state.age < current.ageMin || state.age > current.ageMax) return `${current.label} starting age must be ${current.ageMin}-${current.ageMax}.`;
      return null;
    }
  });
}

async function natureStep(state) {
  return showStep(state, {
    current: 2, title: "Dunadan Nature", subtitle: "Answer six questions; Nature starts at 3",
    body: () => `${modeHelp(state, `<p>Dunadan Nature is <b>Tradition, Family and Grief</b>. Each YES answer below changes the starting value and may make a Trait unavailable. The creator enforces those restrictions later.</p>`)}
      <div class="rg-nature-question-list">
        ${natureQuestion("danger", "Have you killed a creature of the Enemy or survived something in the wilds that could have killed you?", "YES: Nature -1; Fearful and Young become unavailable.", state)}
        ${natureQuestion("secondAge", "Can you trace your lineage back to the Second Age?", "YES: Nature +1.", state)}
        ${natureQuestion("loss", "Have you ever lost someone close to you?", "YES: Nature +1; Innocent becomes unavailable.", state)}
        ${natureQuestion("wilds", "Do you call the wilds home?", "YES: Nature -1; Open-Minded becomes unavailable.", state)}
        ${natureQuestion("married", "Are you married?", "YES: Nature +1; Independent becomes unavailable.", state)}
        ${natureQuestion("enemyFirst", "Is fighting the Enemy more important than maintaining close ties with friends and family?", "YES: Nature -1; Compassionate becomes unavailable.", state)}
      </div>
      <div class="rg-recruit-summary"><span>Current result</span><b>Nature ${computeNature(state)} · Descriptors: Tradition · Family · Grief</b></div>`,
    commit: form => {
      for (const key of Object.keys(state.natureAnswers)) state.natureAnswers[key] = checked(form, key);
      state.nature = computeNature(state);
    },
    validate: () => state.nature < 2 || state.nature > 6 ? `These answers produce Nature ${state.nature}. A starting Ranger must have a playable starting Nature between 2 and 6; revise an answer.` : null
  });
}

function natureQuestion(name, question, effect, state) {
  return `<label class="rg-recruit-question"><input type="checkbox" name="${name}" ${state.natureAnswers[name] ? "checked" : ""}><span><b>${esc(question)}</b><small>${esc(effect)}</small></span></label>`;
}

async function homelandStep(state) {
  const banned = bannedTraits(state);
  const traitDisabled = new Map([...banned].map(name => [name, "Unavailable from your Nature answers"]));
  return showStep(state, {
    current: 3, title: "Homeland", subtitle: "Where were you born?",
    body: () => {
      const home = HOMELANDS[state.homelandKey] ?? null;
      return `${modeHelp(state, `<p>Choose a Realm Guard homeland. You gain <b>one Skill check</b> and <b>one Trait check</b> from that land. A Trait ruled out by Nature cannot be selected.</p>`)}
      <label>Homeland<select name="homelandKey">${options(Object.entries(HOMELANDS).map(([value, h]) => ({ value, label: h.label })), state.homelandKey, { placeholder: "Choose homeland..." })}</select></label>
      ${home ? `<div class="rg-home-card"><h3>${esc(home.label)}</h3><p>${esc(home.text)}</p><div class="rg-recruit-grid two"><label>Homeland Skill<select name="homelandSkill">${options(home.skills, state.homelandSkill)}</select></label><label>Homeland Trait<select name="homelandTrait">${options(home.traits, state.homelandTrait, { disabled: traitDisabled })}</select></label></div></div>` : `<div class="rg-recruit-note">Choose a homeland, click Continue, and this step will refresh with its Skill and Trait choices.</div>`}`;
    },
    commit: form => {
      const nextHome = value(form, "homelandKey");
      if (nextHome !== state.homelandKey) {
        state.homelandKey = nextHome;
        state.homelandSkill = "";
        state.homelandTrait = "";
      } else {
        state.homelandSkill = value(form, "homelandSkill");
        state.homelandTrait = value(form, "homelandTrait");
      }
    },
    validate: () => {
      const selected = HOMELANDS[state.homelandKey];
      if (!selected) return "Choose a homeland. The step will then show its Skill and Trait choices.";
      if (!selected.skills.includes(state.homelandSkill)) return "Choose one Skill from your homeland.";
      if (!selected.traits.includes(state.homelandTrait)) return "Choose one Trait from your homeland.";
      if (bannedTraits(state).has(state.homelandTrait)) return `${state.homelandTrait} is unavailable because of your Nature answers.`;
      return null;
    }
  });
}

function repeatedSelects(name, count, list, values, label) {
  return `<div class="rg-recruit-select-stack"><h4>${esc(label)} <span>${count} check${count === 1 ? "" : "s"}</span></h4>${Array.from({ length: count }, (_, i) => `<label>Choice ${i + 1}<select name="${name}-${i}">${options(list, values[i] ?? "")}</select></label>`).join("")}</div>`;
}

async function lifeExperienceStep(state) {
  const s = station(state);
  const parentCount = state.rank === "recruit" ? 2 : 1;
  const convincingCount = ["captain", "lord"].includes(state.rank) ? 2 : 1;
  return showStep(state, {
    current: 4, title: "Life Experience", subtitle: "Talent, family, apprenticeship and mentor training",
    body: () => `${modeHelp(state, `<p>Every selection adds a <b>check</b> to that Skill. Checks may stack on the same Skill. At the end, starting Skill rating is <b>checks + 1</b>, maximum 6.</p>`)}
      <div class="rg-recruit-columns">
        ${repeatedSelects("natural", s.natural, NATURAL_TALENT, state.naturalTalent, "Area of Natural Talent")}
        ${repeatedSelects("parent", parentCount, TRADE_SKILLS, state.parentsTrade, "Parents' Trade")}
        ${repeatedSelects("convince", convincingCount, CONVINCING_SKILLS, state.convincing, "Convincing Others")}
        <div class="rg-recruit-select-stack"><h4>Apprenticeship <span>1 check</span></h4><label>Senior Artisan's trade<select name="apprenticeship">${options(APPRENTICESHIP_SKILLS, state.apprenticeship)}</select></label></div>
        <div class="rg-recruit-select-stack"><h4>Mentor Training <span>1 check</span></h4><label>Training Skill<select name="mentorTraining">${options(MENTOR_SKILLS, state.mentorTraining)}</select></label></div>
      </div>`,
    commit: form => {
      state.naturalTalent = Array.from({ length: s.natural }, (_, i) => value(form, `natural-${i}`));
      state.parentsTrade = Array.from({ length: parentCount }, (_, i) => value(form, `parent-${i}`));
      state.convincing = Array.from({ length: convincingCount }, (_, i) => value(form, `convince-${i}`));
      state.apprenticeship = value(form, "apprenticeship");
      state.mentorTraining = value(form, "mentorTraining");
    },
    validate: () => {
      const all = [...state.naturalTalent, ...state.parentsTrade, ...state.convincing, state.apprenticeship, state.mentorTraining];
      return all.some(v => !v) ? "Complete every Life Experience choice before continuing." : null;
    }
  });
}

async function serviceStep(state) {
  const s = station(state);
  const skills = serviceSkills(state.rank);
  const totalAllocated = () => Object.values(state.serviceAlloc ?? {}).reduce((sum, v) => sum + Math.max(0, Number(v) || 0), 0);
  const taken = takenSpecialties();
  const disabled = new Map([...taken.entries()].map(([skill, actor]) => [skill, `already ${actor}'s Specialty`]));
  return showStep(state, {
    current: 5, title: "Service & Specialty", subtitle: "Distribute experience gained in service to the Realms",
    body: () => `${modeHelp(state, `<p>${esc(s.label)} receives <b>${s.service} service checks</b>. Put several checks into one Skill to specialize or spread them out. ${state.rank === "recruit" ? "Recruits do not choose a Specialty." : "Then choose one Specialty, which adds one more check. No two player Rangers may share a Specialty."}</p>`)}
      <div class="rg-service-grid">${skills.map(name => `<label><span>${esc(name)}</span><input type="number" name="service-${esc(name)}" min="0" max="${s.service}" value="${Math.max(0, Number(state.serviceAlloc[name] ?? 0))}"></label>`).join("")}</div>
      <div class="rg-recruit-summary"><span>Required service checks</span><b>${totalAllocated()} / ${s.service}</b></div>
      ${state.rank === "recruit" ? `<div class="rg-recruit-note"><b>Recruit:</b> no Specialty is chosen at character creation.</div>` : `<label>Specialty<select name="specialty">${options(SPECIALTY_SKILLS, state.specialty, { placeholder: "Choose a unique Specialty...", disabled })}</select></label>`}`,
    commit: form => {
      state.serviceAlloc = Object.fromEntries(skills.map(name => [name, Math.max(0, numberValue(form, `service-${name}`, 0))]));
      state.specialty = state.rank === "recruit" ? "" : value(form, "specialty");
    },
    validate: () => {
      const allocated = Object.values(state.serviceAlloc).reduce((sum, v) => sum + v, 0);
      if (allocated !== s.service) return `Allocate exactly ${s.service} service checks. You currently allocated ${allocated}.`;
      if (state.rank !== "recruit" && !state.specialty) return "Choose a Specialty.";
      const who = takenSpecialties().get(state.specialty);
      if (state.specialty && who) return `${state.specialty} is already the Specialty of ${who}. Choose another.`;
      return null;
    }
  });
}

async function wisesStep(state) {
  const count = station(state).wises;
  if (state.wiseChoices.length !== count) state.wiseChoices = Array.from({ length: count }, (_, i) => state.wiseChoices[i] ?? "");
  const wiseRow = i => {
    const current = state.wiseChoices[i] ?? "";
    const isExample = WISE_EXAMPLES.includes(current);
    return `<div class="rg-wise-choice-card">
      <label>Wise check ${i + 1} - browse examples
        <select name="wise-example-${i}">${options(WISE_EXAMPLES, isExample ? current : "", { placeholder: "Choose from the scrollable example list..." })}</select>
      </label>
      <label>Or type a custom Wise
        <input name="wise-custom-${i}" value="${esc(isExample ? "" : current)}" placeholder="e.g. Orc-wise or a custom Wise">
      </label>
    </div>`;
  };
  return showStep(state, {
    current: 6, title: "Knowledge & Wises", subtitle: `${count} Wise check${count === 1 ? "" : "s"} for a ${station(state).label}`,
    body: () => `${modeHelp(state, `<p>Realm Guard grants Wise <b>checks</b> during Recruitment. This Foundry project deliberately keeps the existing <b>unrated Wise mechanic</b>; the creator preserves your check allocation as Recruitment metadata without adding Wise ratings. Repeat a Wise name to put more than one Recruitment check into it.</p>`)}
      <div class="rg-wise-choice-grid">${Array.from({ length: count }, (_, i) => wiseRow(i)).join("")}</div>
      <div class="rg-recruit-note"><b>Wise browser:</b> each example selector is a normal scrollable Foundry/Chromium select list. You can also type any custom Wise; custom text takes priority over the example selector. If you omit <b>-wise</b>, the creator adds it automatically.</div>`,
    commit: form => {
      state.wiseChoices = Array.from({ length: count }, (_, i) => {
        const custom = value(form, `wise-custom-${i}`);
        const example = value(form, `wise-example-${i}`);
        return normalizeWise(custom || example);
      });
    },
    validate: () => state.wiseChoices.some(v => !v) ? `Choose all ${count} Wise checks.` : null
  });
}

async function resourcesCirclesStep(state) {
  const base = station(state);
  const trades = trainedTradeOptions(state);
  return showStep(state, {
    current: 7, title: "Resources & Circles", subtitle: "Answer the Recruitment questions that modify your starting abilities",
    body: () => `${modeHelp(state, `<p>Base values come from Station: <b>Resources ${base.resources}</b>, <b>Circles ${base.circles}</b>. Resources may reach 0; starting Circles never falls below 1. Several YES answers also rule out starting Traits.</p>`)}
      <div class="rg-recruit-columns two-wide"><section><h3>Resources</h3>
        ${simpleQuestion("res-trade", "Do you still practice a trade to help Ranger self-sufficiency?", "+1 Resources; requires that trade Skill; Leader unavailable.", state.resourceAnswers.trade)}
        <label class="rg-recruit-subfield">Trade Skill<select name="resourceTrade">${options(trades, state.resourceTrade, { placeholder: trades.length ? "Choose trained trade..." : "No trained trade available" })}</select></label>
        ${simpleQuestion("res-parents", "Are your parents politicians, instructors, innkeepers or merchants?", "+1 Resources; their profession must be noted.", state.resourceAnswers.parentsWealth)}
        <label class="rg-recruit-subfield">Parents' profession<input name="parentsResourceProfession" value="${esc(state.parentsResourceProfession)}" placeholder="Merchant, innkeeper..."></label>
        ${simpleQuestion("res-gifts", "Do you like to buy gifts for yourself and friends?", "-1 Resources.", state.resourceAnswers.gifts)}
        ${simpleQuestion("res-thrifty", "Are you thrifty?", "+1 Resources; Generous unavailable.", state.resourceAnswers.thrifty)}
        ${simpleQuestion("res-debt", "Have you been in debt or are you generally bad at managing money?", "-1 Resources.", state.resourceAnswers.debt)}
        ${simpleQuestion("res-pack", "Do you always pack carefully for a journey?", "+1 Resources; Bold and Fiery unavailable.", state.resourceAnswers.pack)}
      </section><section><h3>Circles</h3>
        ${simpleQuestion("cir-gregarious", "Are you gregarious and do you make friends easily?", "+1 Circles; Bitter and Jaded unavailable.", state.circleAnswers.gregarious)}
        ${simpleQuestion("cir-ties", "Do you have strong ties to the Rangers through family tradition or close allies?", "+1 Circles; parents must be Rangers or mentor must be family.", state.circleAnswers.rangerTies)}
        <label class="rg-recruit-subfield">Tie basis<select name="rangerTiesBasis">${options([{ value: "parents", label: "Parents are Rangers" }, { value: "mentor", label: "Mentor is family" }], state.rangerTiesBasis, { placeholder: "Choose if answer is YES..." })}</select></label>
        ${simpleQuestion("cir-reputation", "Have you accomplished a great task for the Rangers and gained a reputation?", "+1 Circles.", state.circleAnswers.reputation)}
        <label class="rg-recruit-subfield">Reputation note<input name="reputationNote" value="${esc(state.reputationNote)}" placeholder="Optional short description"></label>
        ${simpleQuestion("cir-enemies", "Do you have powerful enemies?", "-1 Circles.", state.circleAnswers.enemies)}
        ${simpleQuestion("cir-crime", "Have you been convicted of a crime?", "-1 Circles.", state.circleAnswers.crime)}
        ${simpleQuestion("cir-loner", "Are you a loner?", "-1 Circles; Extrovert unavailable.", state.circleAnswers.loner)}
      </section></div>
      <div class="rg-recruit-summary"><span>Starting result</span><b>Resources ${computeResources(state)} · Circles ${computeCircles(state)}</b></div>`,
    commit: form => {
      state.resourceAnswers = {
        trade: checked(form, "res-trade"), parentsWealth: checked(form, "res-parents"), gifts: checked(form, "res-gifts"), thrifty: checked(form, "res-thrifty"), debt: checked(form, "res-debt"), pack: checked(form, "res-pack")
      };
      state.resourceTrade = value(form, "resourceTrade");
      state.parentsResourceProfession = value(form, "parentsResourceProfession");
      state.circleAnswers = {
        gregarious: checked(form, "cir-gregarious"), rangerTies: checked(form, "cir-ties"), reputation: checked(form, "cir-reputation"), enemies: checked(form, "cir-enemies"), crime: checked(form, "cir-crime"), loner: checked(form, "cir-loner")
      };
      state.rangerTiesBasis = value(form, "rangerTiesBasis");
      state.reputationNote = value(form, "reputationNote");
      state.resources = computeResources(state);
      state.circles = computeCircles(state);
    },
    validate: () => {
      if (state.resourceAnswers.trade && !state.resourceTrade) return "Practicing a trade requires a trained trade Skill. Choose it or answer NO.";
      if (state.resourceAnswers.parentsWealth && !state.parentsResourceProfession) return "Note the parents' qualifying profession for the Resources bonus.";
      if (state.circleAnswers.rangerTies && !state.rangerTiesBasis) return "For strong Ranger ties, identify whether the basis is Ranger parents or a mentor who is family.";
      return null;
    }
  });
}

function simpleQuestion(name, question, effect, isChecked) {
  return `<label class="rg-recruit-question compact"><input type="checkbox" name="${name}" ${isChecked ? "checked" : ""}><span><b>${esc(question)}</b><small>${esc(effect)}</small></span></label>`;
}

async function traitsStep(state) {
  const banned = bannedTraits(state);
  const allowed = list => list.filter(name => !banned.has(name));
  const bannedText = [...banned].sort().join(", ") || "None";
  return showStep(state, {
    current: 8, title: "Dunadan Traits", subtitle: "Homeland, innate quality and Station-specific experience",
    body: () => `${modeHelp(state, `<p>Your homeland already supplied one Trait check: <b>${esc(state.homelandTrait)}</b>. Everyone gets one Innate Quality check. Recruits get one Inherited/Learned check; Captains and Lords get one Life on the Road check. Repeating a Trait increases its starting level, up to the normal Trait cap.</p>`)}
      <div class="rg-recruit-note"><b>Unavailable from your answers:</b> ${esc(bannedText)}</div>
      <div class="rg-recruit-grid two"><label>Innate Quality<select name="innateTrait">${options(allowed(INNATE_TRAITS), state.innateTrait)}</select></label>
      ${state.rank === "recruit" ? `<label>Inherited or Learned<select name="inheritedTrait">${options(allowed(RECRUIT_TRAITS), state.inheritedTrait)}</select></label>` : ""}
      ${["captain", "lord"].includes(state.rank) ? `<label>Life on the Road<select name="roadTrait">${options(allowed(ROAD_TRAITS), state.roadTrait)}</select></label>` : ""}</div>
      <div class="rg-recruit-summary"><span>Homeland Trait</span><b>${esc(state.homelandTrait)}</b></div>`,
    commit: form => {
      state.innateTrait = value(form, "innateTrait");
      state.inheritedTrait = state.rank === "recruit" ? value(form, "inheritedTrait") : "";
      state.roadTrait = ["captain", "lord"].includes(state.rank) ? value(form, "roadTrait") : "";
    },
    validate: () => {
      if (banned.has(state.homelandTrait)) return `${state.homelandTrait} is no longer legal after your Recruitment answers. Go back and change the conflicting answer or homeland Trait.`;
      if (!state.innateTrait) return "Choose an Innate Quality.";
      if (state.rank === "recruit" && !state.inheritedTrait) return "Recruits choose one Inherited or Learned Trait.";
      if (["captain", "lord"].includes(state.rank) && !state.roadTrait) return `${station(state).label}s choose one Life on the Road Trait.`;
      for (const name of [state.innateTrait, state.inheritedTrait, state.roadTrait]) if (name && banned.has(name)) return `${name} is unavailable because of an earlier Recruitment answer.`;
      return null;
    }
  });
}

function mentorRuleText(rank) {
  if (rank === "recruit") return "Recruit: mentor must be another player character of Veteran or Captain Station.";
  if (["scout", "veteran"].includes(rank)) return `${STATIONS[rank].label}: mentor must be an older character.`;
  return `${STATIONS[rank].label}: mentor must be an NPC or player character with the Greybeard Trait.`;
}

async function relationshipsStep(state) {
  const mentorRule = mentorRuleText(state.rank);
  return showStep(state, {
    current: 9, title: "Lineage & Relationships", subtitle: "Build the people and House around the Ranger",
    body: () => `${modeHelp(state, `<p>Realm Guard Recruitment explicitly creates a <b>Lineage, Parents, Senior Artisan, Mentor, Friend and Enemy</b>. By the printed Realm Guard rule, your personal Enemy is one of the Free Peoples and cannot be a servant of the Enemy such as an Orc. This Foundry system optionally allows that restriction to be relaxed as a clearly marked <b>House Rule</b>. The House Insignia is an heirloom, but explicitly <b>not a Token of Power</b>.</p>`)}
      <div class="rg-recruit-grid two"><label>Lineage / House<input name="lineage" value="${esc(state.lineage)}" placeholder="House of..."></label><label>House Insignia<input name="insignia" value="${esc(state.insignia)}" placeholder="Ring, brooch, diadem..."></label></div>
      <div class="rg-recruit-note"><b>House Insignia:</b> an heirloom of the House or company. It is explicitly not a Token of Power.</div>
      <div class="rg-recruit-family-block"><h3>Parents</h3><div class="rg-recruit-grid two"><label>Mom<input name="mom" value="${esc(state.mom)}" placeholder="Name · alive/dead · where she lives"></label><label>Dad<input name="dad" value="${esc(state.dad)}" placeholder="Name · alive/dead · where he lives"></label></div>${state.parentsResourceProfession ? `<small>Family profession noted earlier: ${esc(state.parentsResourceProfession)}</small>` : ""}</div>
      <label>Senior Artisan<input name="seniorArtisan" value="${esc(state.seniorArtisan)}" placeholder="Name · ${esc(state.apprenticeship)}"></label>
      <label>Mentor<input name="mentor" value="${esc(state.mentor)}" placeholder="Name · Station/age/relationship as appropriate"></label>
      <label class="rg-rule-confirm"><input type="checkbox" name="mentorRuleConfirmed" ${state.mentorRuleConfirmed ? "checked" : ""}><span><b>Confirm Mentor rule</b><small>${esc(mentorRule)}</small></span></label>
      <div class="rg-recruit-grid three"><label>Friend Name<input name="friend" value="${esc(state.friend)}"></label><label>Profession / Specialty<input name="friendProfession" value="${esc(state.friendProfession)}"></label><label>Typical Location<input name="friendLocation" value="${esc(state.friendLocation)}"></label></div>
      <label class="rg-rule-confirm"><input type="checkbox" name="allowEnemyServant" ${state.allowEnemyServant ? "checked" : ""}><span><b>Allow Servants of the Enemy as personal Enemies (House Rule)</b><small>Off by default. Enable this only if your table wants personal Enemies such as Orcs, Trolls, Wargs, Spiders or another servant of the Enemy.</small></span></label>
      <div class="rg-recruit-grid three"><label>Enemy Name<input name="enemyName" value="${esc(state.enemyName)}"></label><label>Enemy's People / Type<select name="enemyPeople">${options([...ENEMY_FREE_PEOPLES, ...ENEMY_SERVANTS_HOUSE_RULE.map(name => ({ value: name, label: `${name} (House Rule)` }))], state.enemyPeople)}</select><small>Who or what is this recurring personal Enemy?</small></label><label>Location<input name="enemyLocation" value="${esc(state.enemyLocation)}"></label></div>`,
    commit: form => {
      for (const key of ["lineage", "insignia", "mom", "dad", "seniorArtisan", "mentor", "friend", "friendProfession", "friendLocation", "enemyName", "enemyPeople", "enemyLocation"]) state[key] = value(form, key);
      state.parents = [state.mom ? `Mom: ${state.mom}` : "", state.dad ? `Dad: ${state.dad}` : ""].filter(Boolean).join(" · ");
      state.mentorRuleConfirmed = checked(form, "mentorRuleConfirmed");
      state.allowEnemyServant = checked(form, "allowEnemyServant");
    },
    validate: () => {
      if (!state.lineage || !state.insignia) return "Enter both Lineage / House and House Insignia.";
      if ((!state.mom && !state.dad) || !state.seniorArtisan || !state.mentor) return "Enter at least one parent, plus Senior Artisan and Mentor.";
      if (!state.mentorRuleConfirmed) return "Confirm that the Mentor follows the Station-specific Recruitment rule.";
      if (!state.friend || !state.friendProfession || !state.friendLocation) return "A Friend needs a name, profession/specialty and typical location.";
      if (!state.enemyName || !state.enemyPeople || !state.enemyLocation) return "An Enemy needs a name, people/type and location.";
      if (ENEMY_SERVANTS_HOUSE_RULE.includes(state.enemyPeople) && !state.allowEnemyServant) return `Enable the House Rule to choose ${state.enemyPeople} as a personal Enemy.`;
      return null;
    }
  });
}

async function bgiGearStep(state) {
  return showStep(state, {
    current: 10, title: "First Mission & Gear", subtitle: "Belief, Goal, Instinct and distinctive equipment",
    body: () => `${modeHelp(state, `<p><b>Belief</b> is your ethical or moral stance as a Dunadan Ranger. <b>Goal</b> is a near-term objective based on the current mission. <b>Instinct</b> is a trained or natural reaction. For Gear, Realm Guard tells you to record a weapon, armor if worn, and distinctive gear - not backpacks, ordinary clothing, boots or other fundamental equipment.</p>`)}
      <label>Belief<textarea name="belief" rows="2" placeholder="An ethical or moral stance">${esc(state.belief)}</textarea></label><label>Goal<textarea name="goal" rows="2" placeholder="A near-term mission objective">${esc(state.goal)}</textarea></label><label>Instinct<textarea name="instinct" rows="2" placeholder="A constant reaction or disposition">${esc(state.instinct)}</textarea></label>
      <div class="rg-recruit-grid three"><label>Weapon<select name="weapon">${options(WEAPONS.map(w => w.name), state.weapon)}</select></label><label>Armor (if worn)<input name="armor" value="${esc(state.armor)}" placeholder="e.g. Chain armor"></label><label>Distinctive Gear<input name="distinctiveGear" value="${esc(state.distinctiveGear)}" placeholder="Comma-separated items"></label></div>
      <div class="rg-recruit-note"><b>Weapon note:</b> Realm Guard uses <b>Whip</b> for Mouse Guard's Hook & Line entry.</div><div class="rg-recruit-summary"><span>Starting Rewards</span><b>Fate 1 · Persona 1</b></div>`,
    commit: form => {
      state.belief = value(form, "belief"); state.goal = value(form, "goal"); state.instinct = value(form, "instinct");
      state.weapon = value(form, "weapon"); state.armor = value(form, "armor"); state.distinctiveGear = value(form, "distinctiveGear");
    },
    validate: () => !state.belief || !state.goal || !state.instinct ? "Write Belief, Goal and Instinct before continuing." : !WEAPONS.some(w => w.name === state.weapon) ? "Choose a starting weapon." : null
  });
}

function skillSummary(state) {
  return [...computeSkillChecks(state).entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, checks]) => `${name} ${Math.min(6, checks + 1)} (${checks} check${checks === 1 ? "" : "s"})`);
}

function traitSummary(state) {
  return [...computeTraitChecks(state).entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, rating]) => `${name} ${Math.min(3, rating)}`);
}

function wiseCheckMap(state) {
  const map = new Map();
  for (const wise of state.wiseChoices.map(normalizeWise).filter(Boolean)) map.set(wise, (map.get(wise) ?? 0) + 1);
  return map;
}

async function reviewStep(state) {
  const home = HOMELANDS[state.homelandKey];
  state.nature = computeNature(state); state.resources = computeResources(state); state.circles = computeCircles(state);
  return showStep(state, {
    current: 11, title: "Review & Create", subtitle: "Create the finished Ranger Actor",
    nextLabel: "Create Ranger", nextIcon: "fa-solid fa-user-shield",
    body: () => `<div class="rg-recruit-review"><div class="rg-review-title"><span>${esc(station(state).label)} · ${esc(home?.label ?? "")}</span><h2>${esc(state.name)}</h2><p>${esc(state.concept)}</p></div>
      <div class="rg-review-stats"><span>Nature <b>${state.nature}</b></span><span>Will <b>${station(state).will}</b></span><span>Health <b>${station(state).health}</b></span><span>Resources <b>${state.resources}</b></span><span>Circles <b>${state.circles}</b></span><span>Fate <b>1</b></span><span>Persona <b>1</b></span></div>
      <section><h3>Skills</h3><p>${skillSummary(state).map(esc).join(" · ")}</p></section><section><h3>Traits</h3><p>${traitSummary(state).map(esc).join(" · ")}</p></section><section><h3>Wises</h3><p>${[...wiseCheckMap(state).entries()].map(([w, c]) => `${esc(w)}${c > 1 ? ` (${c} Recruitment checks)` : ""}`).join(" · ")}</p><small>Wises remain unrated in this Foundry build; Recruitment checks are preserved in metadata.</small></section>
      <section><h3>Belief · Goal · Instinct</h3><p><b>Belief:</b> ${esc(state.belief)}<br><b>Goal:</b> ${esc(state.goal)}<br><b>Instinct:</b> ${esc(state.instinct)}</p></section>
      <section><h3>Relationships</h3><p><b>House:</b> ${esc(state.lineage)} · <b>Insignia:</b> ${esc(state.insignia)}<br><b>Mom:</b> ${esc(state.mom || "—")} · <b>Dad:</b> ${esc(state.dad || "—")}<br><b>Senior Artisan:</b> ${esc(state.seniorArtisan)} · <b>Mentor:</b> ${esc(state.mentor)}<br><b>Friend:</b> ${esc(state.friend)}, ${esc(state.friendProfession)}, ${esc(state.friendLocation)}<br><b>Enemy:</b> ${esc(state.enemyName)}, ${esc(state.enemyPeople)}, ${esc(state.enemyLocation)}${state.allowEnemyServant ? ` <b>(House Rule enabled)</b>` : ""}</p></section>
      <section><h3>Gear</h3><p>${esc(state.weapon)}${state.armor ? ` · ${esc(state.armor)}` : ""}${state.distinctiveGear ? ` · ${esc(state.distinctiveGear)}` : ""}</p></section></div>
      <label class="rg-rule-confirm"><input type="checkbox" name="openSheet" ${state.openSheet ? "checked" : ""}><span><b>Open Ranger sheet after creation</b><small>The Actor, canonical Skills, Conditions, Traits, Wises and starting Gear are created together.</small></span></label>`,
    commit: form => { state.openSheet = checked(form, "openSheet"); },
    validate: () => {
      if (state.nature < 2 || state.nature > 6) return "Starting Nature is outside the valid Recruitment range.";
      if ([...bannedTraits(state)].some(t => computeTraitChecks(state).has(t))) return "A selected Trait conflicts with a Recruitment answer. Go back to Traits and correct it.";
      return null;
    }
  });
}

function learningForRating(rating) {
  const r = Number(rating ?? 0);
  if (r <= 0) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 1 };
  if (r === 1) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 0 };
  return { passed: 0, failed: 0, passNeeded: r, failNeeded: r - 1 };
}

function gearDocument(name, { hands = 0, location = "", mode = "unassigned", description = "Created during Realm Guard Recruitment." } = {}) {
  return {
    name,
    type: "gear",
    flags: { "realm-guard": { recruitmentGear: true } },
    system: {
      quantity: 1,
      description,
      inventory: { mode, location, containerId: "", slots: 1, bundle: 1, wieldHands: hands, containerType: "none", capacity: 0 }
    }
  };
}

const PC_FOLDER_NAME = "PC";

async function ensurePcActorFolder() {
  let folder = game.folders?.find?.(folder =>
    folder.type === "Actor" && String(folder.name ?? "").trim().toLowerCase() === PC_FOLDER_NAME.toLowerCase()
  );
  if (folder) return folder;

  folder = await Folder.create({
    name: PC_FOLDER_NAME,
    type: "Actor",
    color: "#6f7f43",
    flags: { "realm-guard": { recruitmentPcFolder: true } }
  });
  if (!folder) throw new Error("Realm Guard: Could not create the PC Actor folder.");
  return folder;
}

async function createRanger(state) {
  const s = station(state);
  const home = HOMELANDS[state.homelandKey];
  const enemy = `${state.enemyName}, ${state.enemyPeople}, ${state.enemyLocation}`;
  const friend = `${state.friend}, ${state.friendProfession}, ${state.friendLocation}`;
  const parentNames = [state.mom ? `Mom: ${state.mom}` : "", state.dad ? `Dad: ${state.dad}` : ""].filter(Boolean).join("; ");
  const parentsExtra = state.parentsResourceProfession ? `; profession: ${state.parentsResourceProfession}` : "";
  const parents = `${parentNames}${parentsExtra}`;
  const system = {
    biography: state.background ? `<p>${esc(state.background)}</p>` : "",
    notes: "",
    concept: state.concept,
    rank: state.rank,
    homeland: home.label,
    age: String(state.age),
    lineage: state.lineage,
    insignia: state.insignia,
    seniorArtisan: `${state.seniorArtisan} - ${state.apprenticeship}`,
    friend,
    cloak: "",
    weapon: "",
    mentor: state.mentor,
    enemy,
    parents,
    belief: state.belief,
    goal: state.goal,
    instinct: state.instinct,
    attributes: {
      nature: { value: state.nature, maximum: state.nature },
      will: { value: s.will, max: 6 },
      health: { value: s.health, max: 6 },
      resources: { value: state.resources, max: 10 },
      circles: { value: state.circles, max: 10 }
    },
    resources: { fate: { value: 1, max: 5 }, persona: { value: 1, max: 5 }, checks: { value: 0, max: 9 } },
    roll: { versus: false, obstacle: 1, modifier: 0 }
  };

  const flags = {
    "realm-guard": {
      recruitmentVersion: "0.19.0",
      recruitmentSpecialty: state.specialty || "",
      recruitmentWiseChecks: Object.fromEntries(wiseCheckMap(state)),
      recruitmentSkillChecks: Object.fromEntries(computeSkillChecks(state)),
      recruitmentNatureAnswers: foundry.utils.deepClone(state.natureAnswers),
      recruitmentResourceAnswers: foundry.utils.deepClone(state.resourceAnswers),
      recruitmentCircleAnswers: foundry.utils.deepClone(state.circleAnswers),
      recruitmentMentorRuleConfirmed: Boolean(state.mentorRuleConfirmed),
      recruitmentMother: state.mom || "",
      recruitmentFather: state.dad || "",
      recruitmentEnemyHouseRule: Boolean(state.allowEnemyServant)
    }
  };

  const ownership = !game.user.isGM ? { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE, [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER } : undefined;
  const pcFolder = await ensurePcActorFolder();
  const actor = await Actor.create({
    name: state.name,
    type: "character",
    system,
    flags,
    folder: pcFolder.id,
    ...(ownership ? { ownership } : {})
  }, { realmGuardSkipRecruitmentProvisioning: true });
  if (!actor) throw new Error("Actor.create returned no Actor.");

  await ensureDefaultSkills(actor);
  const skillChecks = computeSkillChecks(state);
  const updates = [];
  for (const item of actor.items.filter(i => i.type === "role")) {
    const checks = skillChecks.get(item.name) ?? 0;
    const rating = checks > 0 ? Math.min(6, checks + 1) : 0;
    updates.push({ _id: item.id, "system.rating": rating, "system.learning": learningForRating(rating), "system.beginnerAttempts": 0 });
  }
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates);

  const traitDocs = [...computeTraitChecks(state).entries()].map(([name, count]) => ({
    name, type: "trait", flags: { "realm-guard": { recruitmentTrait: true } }, system: { rating: Math.min(3, count), description: "Selected during Realm Guard Recruitment." }
  }));
  const wiseDocs = [...wiseCheckMap(state).keys()].map(name => ({
    name, type: "wise", flags: { "realm-guard": { recruitmentWise: true } }, system: { description: "Selected during Realm Guard Recruitment. Wise ratings are intentionally not added by this Foundry build." }
  }));

  const weapon = WEAPONS.find(w => w.name === state.weapon) ?? WEAPONS.find(w => w.name === "Sword");
  const gearDocs = [gearDocument(weapon.name, { hands: weapon.hands, mode: "hand", location: "right-hand", description: "Starting weapon chosen during Realm Guard Recruitment." })];
  if (state.armor) gearDocs.push(gearDocument(state.armor, { mode: "worn", location: "torso", description: "Armor recorded during Realm Guard Recruitment." }));
  for (const name of state.distinctiveGear.split(",").map(v => v.trim()).filter(Boolean)) gearDocs.push(gearDocument(name, { description: "Distinctive gear recorded during Realm Guard Recruitment." }));

  if (traitDocs.length || wiseDocs.length || gearDocs.length) await actor.createEmbeddedDocuments("Item", [...traitDocs, ...wiseDocs, ...gearDocs]);
  await ensureDefaultConditions(actor);

  await ChatMessage.create({
    content: `<div class="realm-guard rg-chat-card rg-recruit-chat"><span class="rg-kicker">RANGER RECRUITED</span><h3>${esc(actor.name)}</h3><p>${esc(s.label)} of ${esc(home.label)} · Nature ${state.nature} · Will ${s.will} · Health ${s.health} · Resources ${state.resources} · Circles ${state.circles}</p><p><b>${skillChecks.size} trained Skills</b> · ${traitDocs.length} Traits · ${wiseDocs.length} Wises · Fate 1 · Persona 1</p></div>`
  });
  return actor;
}

const STEPS = [identityStep, natureStep, homelandStep, lifeExperienceStep, serviceStep, wisesStep, resourcesCirclesStep, traitsStep, relationshipsStep, bgiGearStep, reviewStep];

export async function openRecruitmentWizard({ mode = null } = {}) {
  const state = blankState();
  if (["guided", "quick"].includes(String(mode))) state.mode = String(mode);
  let index = 0;
  while (index >= 0 && index < STEPS.length) {
    const action = await STEPS[index](state);
    if (action === "cancel") return null;
    if (action === "back") { index = Math.max(0, index - 1); continue; }
    index += 1;
  }
  if (index !== STEPS.length) return null;

  try {
    const actor = await createRanger(state);
    ui.notifications.info(`Realm Guard: ${actor.name} has completed Recruitment and was placed in Actors > ${PC_FOLDER_NAME}.`);
    if (state.openSheet) actor.sheet?.render(true);
    return actor;
  } catch (error) {
    console.error("Realm Guard | Recruitment 2.0 failed", error);
    ui.notifications.error("Realm Guard: Could not create the Ranger. Check Actor creation permission and the F12 Console.");
    return null;
  }
}

function guideContent() {
  return `<div class="realm-guard rg-recruit-guide-dialog"><header><span>REALM GUARD</span><h2>Recruitment Guide</h2><p>Guided character creation for Rangers of the North.</p></header>
    <div class="rg-guide-section"><h3>1. Concept & Station</h3><p>Choose Recruit, Scout, Veteran, Captain or Lord. Station sets the allowed starting age and starting Will/Health, and provides base Resources/Circles.</p><div class="rg-guide-station-table">${Object.values(STATIONS).map(s => `<span>${esc(s.label)}</span><span>${s.ageMin}-${s.ageMax}</span><span>W ${s.will}</span><span>H ${s.health}</span>`).join("")}</div></div>
    <div class="rg-guide-section"><h3>2. Dunadan Nature</h3><p>Start at Nature 3 and answer six questions. Answers modify Nature and can rule out specific Traits. The descriptors are <b>Tradition, Family and Grief</b>.</p></div>
    <div class="rg-guide-section"><h3>3. Homeland</h3><p>Choose one Skill and one Trait supplied by your birthplace. Nature restrictions are enforced.</p></div>
    <div class="rg-guide-section"><h3>4-5. Life Experience</h3><p>Natural Talent, Parents' Trade, Convincing Others, Apprenticeship, Mentor Training, Service and Specialty add Skill checks. Final starting Skill rating is checks + 1, maximum 6. Non-Recruits choose a unique Specialty.</p></div>
    <div class="rg-guide-section"><h3>6. Wises</h3><p>Recruitment grants Wise checks by Station. The Foundry project keeps Wises <b>unrated</b> by project decision; the creator stores the Recruitment check allocation as metadata and creates the chosen Wise Items without adding a rating system.</p></div>
    <div class="rg-guide-section"><h3>7-8. Resources, Circles & Traits</h3><p>Answer the rulebook questions to modify Resources and Circles. Some answers remove starting Trait options. Homeland, Innate Quality and Station-specific Trait checks can stack to raise Trait level.</p></div>
    <div class="rg-guide-section"><h3>9. Relationships</h3><p>Create Lineage, House Insignia, Parents, Senior Artisan, Mentor, Friend and Enemy. A Friend includes profession and location. By default, an Enemy must be Dúnadan, Dwarf, Elf, Hobbit or Man - not a servant of the Enemy. Tables that want otherwise may explicitly enable <b>Allow Servants of the Enemy as personal Enemies (House Rule)</b> and choose Orc, Troll, Warg, Spider or another servant of the Enemy. The House Insignia is explicitly not a Token of Power.</p></div>
    <div class="rg-guide-section"><h3>10. First Mission & Gear</h3><p>Write Belief, Goal and Instinct. Choose a weapon and record armor or distinctive gear. Do not list ordinary backpacks, clothing, boots or other fundamental gear. Every new Ranger begins with <b>1 Fate and 1 Persona</b>.</p></div>
    <div class="rg-guide-section"><h3>11. Review</h3><p>Review the complete Ranger before Foundry creates the Actor, canonical Skills, Conditions, Traits, Wises and Inventory Gear.</p></div>
  </div>`;
}

export async function openRecruitmentGuide() {
  return new foundry.applications.api.DialogV2({
    window: { title: "Realm Guard · Recruitment Guide", resizable: true },
    position: { width: 700, height: 720 },
    content: guideContent(),
    buttons: [
      ...(canCreateActors() ? [{ action: "start", label: "Create Ranger", icon: "fa-solid fa-user-shield", callback: () => { setTimeout(() => void openRecruitmentWizard(), 0); } }] : []),
      { action: "close", label: "Close", default: true }
    ],
    submit: () => null
  }).render(true);
}

function canCreateActors() {
  if (game.user?.isGM) return true;
  try { return Boolean(game.user?.can?.("ACTOR_CREATE")); }
  catch { return true; }
}

function actorDirectoryRoot(html) {
  return html instanceof HTMLElement ? html : html?.[0] ?? null;
}

function injectActorDirectoryRecruitmentTools(html) {
  const root = actorDirectoryRoot(html);
  if (!root || root.querySelector?.("[data-rg-actor-recruitment-tools]")) return;
  const header = root.querySelector?.(".directory-header .header-actions")
    ?? root.querySelector?.(".directory-header")
    ?? root.querySelector?.("header.directory-header")
    ?? root;
  const bar = document.createElement("div");
  bar.className = "rg-actor-recruitment-tools";
  bar.dataset.rgActorRecruitmentTools = "true";

  if (canCreateActors()) {
    const recruit = document.createElement("button");
    recruit.type = "button";
    recruit.className = "rg-actor-recruit primary";
    recruit.title = "Recruit Ranger — full guided Realm Guard Recruitment";
    recruit.innerHTML = `<i class="fa-solid fa-user-shield"></i><span>Recruit Ranger</span>`;
    recruit.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); void openRecruitmentWizard({ mode: "guided" }); });
    bar.append(recruit);

    const quick = document.createElement("button");
    quick.type = "button";
    quick.className = "rg-actor-recruit";
    quick.title = "Create Ranger — same Recruitment rules with less explanatory text";
    quick.innerHTML = `<i class="fa-solid fa-bolt"></i><span>Create Ranger</span>`;
    quick.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); void openRecruitmentWizard({ mode: "quick" }); });
    bar.append(quick);
  }

  const guide = document.createElement("button");
  guide.type = "button";
  guide.className = "rg-actor-recruit icon-only";
  guide.title = "Recruitment Guide";
  guide.setAttribute("aria-label", "Recruitment Guide");
  guide.innerHTML = `<i class="fa-solid fa-book-open"></i>`;
  guide.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); void openRecruitmentGuide(); });
  bar.append(guide);
  header.prepend(bar);

  // Players should use the rules-driven Ranger buttons, not Foundry's generic Actor creator.
  // Keep native Create Actor available to GMs/admins for unusual Actor work.
  if (!game.user?.isGM) {
    for (const button of root.querySelectorAll?.('[data-action="createEntry"], [data-action="createDocument"], button.create-document') ?? []) {
      button.classList.add("rg-native-actor-create-hidden");
    }
  }
}

async function migrateRecruitmentAbilityCaps() {
  if (!game.user?.isGM) return;
  const activeGMs = (game.users ?? []).filter(user => user.active && user.isGM).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  if (activeGMs.length && activeGMs[0].id !== game.user.id) return;
  let changed = 0;
  for (const actor of game.actors?.contents ?? []) {
    if (!["character", "npc"].includes(actor.type)) continue;
    const update = {};
    if (Number(actor.system?.attributes?.resources?.max ?? 0) < 10) update["system.attributes.resources.max"] = 10;
    if (Number(actor.system?.attributes?.circles?.max ?? 0) < 10) update["system.attributes.circles.max"] = 10;
    if (!Object.keys(update).length) continue;
    await actor.update(update);
    changed += 1;
  }
  if (changed) console.log(`Realm Guard | Recruitment 2.0 raised Resources/Circles caps on ${changed} existing Actor(s).`);
}

export function installRecruitment() {
  Hooks.on("renderActorDirectory", (_app, html) => injectActorDirectoryRecruitmentTools(html));
  Hooks.once("ready", () => {
    const actors = ui?.actors?.element ?? document.querySelector("#actors");
    if (actors) injectActorDirectoryRecruitmentTools(actors);
    void migrateRecruitmentAbilityCaps().catch(error => console.error("Realm Guard | Recruitment ability-cap migration failed", error));
  });
}
