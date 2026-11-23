import { FoundryCreationCommitAdapter } from "./m9-creation-commit-adapter.mjs";
import { LEGACY_PEOPLES, LEGACY_RELATIONS, NATURE_ADJUSTMENTS, legacyStartingNature } from "./legacy-people.mjs";
import { BACKGROUNDS, OCCUPATIONS, PLACES, RELATION_PEOPLES, CREATION_SKILLS, TRAITS, EXPERIENCE_FIELDS, EXPERIENCE_CHECKS, WISE_CHECKS,
  RESOURCE_QUESTIONS, CIRCLE_QUESTIONS, backgroundFor, homelandChoices } from "./legacy-people-catalog.mjs";
import { WISE_EXAMPLES, WEAPONS, TRADE_SKILLS, normalizeWise, learningForRating, gearDocument } from "./recruitment-catalog.mjs";
import { submitRangerRecruitment } from "./recruitment-authority.mjs";
import { fitWindowToViewport } from "./window-position-service.mjs";
import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";
import { getActiveRulesSnapshot } from "./rules-profile-service.mjs";

const PROFILE = "realm-guard-legacy-mixed";
export const PEOPLE_CREATION = "legacy-peoples";
const adapter = new FoundryCreationCommitAdapter({ shadowOnly: false });
const artPath = "systems/realm-guard/assets/actors/default-npcs/";
const string = (value, max = 120) => typeof value === "string" ? value.trim().slice(0, max) : "";
const escape = value => foundry.utils.escapeHTML(String(value ?? ""));
export const legacyPeopleCreationEnabled = legacyMixedPolishEnabled;
const relationSlots = { mother: "parent-mother", father: "parent-father", seniorArtisan: "senior-artisan" };
const tieChoices = [["family", "Family ties"], ["mentor", "A close mentor"]];
const startingAbilities = { will: 3, health: 4, resources: 2, circles: 2 };

function cleanDraft(draft) {
  const texts = ["people", "background", "name", "concept", "homeland", "homelandSkill", "homelandTrait", "specialty",
    "resourceTrade", "parentsResourceProfession", "tieBasis", "reputationNote", "innateTrait", "lineage", "insignia", "weapon", "armor"];
  const longTexts = ["biography", "belief", "goal", "instinct", "distinctiveGear"];
  return {
    ...Object.fromEntries(texts.map(key => [key, string(draft?.[key])])),
    ...Object.fromEntries(longTexts.map(key => [key, string(draft?.[key], key === "biography" ? 2000 : 500)])),
    age: Number(draft?.age),
    answers: Array.from({ length: 3 }, (_, i) => draft?.answers?.[i]),
    experience: Object.fromEntries(EXPERIENCE_FIELDS.map(([key]) => [key, string(draft?.experience?.[key])])),
    allocation: Object.fromEntries(CREATION_SKILLS.map(skill => [skill, draft?.allocation?.[skill] ?? 0])),
    wises: Array.from({ length: WISE_CHECKS }, (_, i) => normalizeWise(string(draft?.wises?.[i]))),
    resourceAnswers: Object.fromEntries(RESOURCE_QUESTIONS.map(([key]) => [key, draft?.resourceAnswers?.[key] === true])),
    circleAnswers: Object.fromEntries(CIRCLE_QUESTIONS.map(([key]) => [key, draft?.circleAnswers?.[key] === true])),
    relations: Object.fromEntries(LEGACY_RELATIONS.map(([key]) => {
      const relation = draft?.relations?.[key];
      return [key, { name: string(relation?.name), profession: string(relation?.profession),
        location: string(relation?.location), people: string(relation?.people), notes: string(relation?.notes, 500) }];
    })),
    openSheet: draft?.openSheet === true
  };
}

const sum = values => values.reduce((total, amount) => total + amount, 0);
const countChecks = values => {
  const counts = new Map();
  for (const name of values.filter(Boolean)) counts.set(name, (counts.get(name) ?? 0) + 1);
  return Object.fromEntries(counts);
};
const adjustedAbility = (base, min, questions, answers) => Math.max(min, base + sum(questions.map(([key, , delta]) => answers[key] ? delta : 0)));
const unavailableTraits = draft => new Set([
  ...RESOURCE_QUESTIONS.filter(([key]) => draft.resourceAnswers[key]),
  ...CIRCLE_QUESTIONS.filter(([key]) => draft.circleAnswers[key])
].flatMap(([, , , traits]) => traits));

function characterValues(draft) {
  const skillChecks = countChecks([draft.homelandSkill, ...Object.values(draft.experience), draft.specialty]);
  for (const [name, checks] of Object.entries(draft.allocation)) if (checks > 0) skillChecks[name] = (skillChecks[name] ?? 0) + checks;
  return {
    nature: legacyStartingNature(draft.answers),
    resources: adjustedAbility(startingAbilities.resources, 0, RESOURCE_QUESTIONS, draft.resourceAnswers),
    circles: adjustedAbility(startingAbilities.circles, 1, CIRCLE_QUESTIONS, draft.circleAnswers),
    skillChecks,
    traitChecks: countChecks([draft.homelandTrait, draft.innateTrait]),
    wiseChecks: countChecks(draft.wises)
  };
}

function relationProblem(draft) {
  if (!draft.lineage || !draft.insignia || !(draft.relations.mother.name || draft.relations.father.name)
      || ["seniorArtisan", "mentor", "friend", "enemy"].some(key => !draft.relations[key].name)) {
    return "Enter a house, insignia, at least one family member, a master artisan, mentor, friend, and rival.";
  }
  for (const [key, relation] of Object.entries(draft.relations)) {
    if (!relation.name) continue;
    if (!PLACES.includes(relation.location) || (key !== "enemy" || relation.profession) && !OCCUPATIONS.includes(relation.profession)) {
      return "Choose a Location for each named contact and an Occupation for each contact other than the Rival.";
    }
    if (key === "enemy" && !RELATION_PEOPLES.includes(relation.people)) return "Choose the Rival's People / Type.";
  }
  if (draft.circleAnswers.communityTies && draft.tieBasis === "family"
    && ![draft.relations.mother, draft.relations.father].some(parent => parent.name && parent.notes)) {
    return "Describe one family member's community connection under What connects you?";
  }
  if (draft.circleAnswers.communityTies && draft.tieBasis === "mentor" && !draft.relations.mentor.notes) {
    return "Describe your mentor's community connection under What connects you?";
  }
  return "";
}

const validations = [
  draft => !Object.hasOwn(LEGACY_PEOPLES, draft.people) || !BACKGROUNDS.includes(draft.background) || !draft.name
    || !Number.isInteger(draft.age) || draft.age < 1 || draft.age > 9999 ? "Choose a People and Background, and enter a name and valid age." : "",
  draft => draft.answers.some(answer => !Number.isInteger(answer) || answer < 0 || answer >= NATURE_ADJUSTMENTS.length)
    ? "Answer all three Nature questions." : "",
  draft => !PLACES.includes(draft.homeland) || !homelandChoices(draft.homeland).skills.includes(draft.homelandSkill)
    || !homelandChoices(draft.homeland).traits.includes(draft.homelandTrait) ? "Choose a Homeland and one of its Skills and Traits." : "",
  draft => EXPERIENCE_FIELDS.some(([key, , choices]) => !choices.includes(draft.experience[key]))
    ? "Complete each Life Experience choice." : "",
  draft => Object.values(draft.allocation).some(amount => !Number.isInteger(amount) || amount < 0 || amount > EXPERIENCE_CHECKS)
    || sum(Object.values(draft.allocation)) !== EXPERIENCE_CHECKS || !CREATION_SKILLS.includes(draft.specialty)
    ? "Allocate exactly six Experience Checks and choose one Specialty." : "",
  draft => draft.wises.some(wise => !wise) ? "Choose both Wise checks." : "",
  draft => {
    if (draft.resourceAnswers.trade && (!TRADE_SKILLS.includes(draft.resourceTrade) || !characterValues(draft).skillChecks[draft.resourceTrade])) {
      return "Choose a trained Trade Skill or clear the corresponding Resources answer.";
    }
    if (draft.resourceAnswers.parentsWealth && !OCCUPATIONS.includes(draft.parentsResourceProfession)) return "Choose the family's occupation.";
    if (draft.circleAnswers.communityTies && !tieChoices.some(([value]) => value === draft.tieBasis)) return "Choose the basis for your community ties.";
    return "";
  },
  draft => {
    const unavailable = unavailableTraits(draft);
    if (unavailable.has(draft.homelandTrait)) return "Your Homeland Trait conflicts with an answer. Go back and change the Trait or answer.";
    return !TRAITS.includes(draft.innateTrait) || unavailable.has(draft.innateTrait) ? "Choose an available Innate Quality." : "";
  },
  relationProblem,
  draft => !draft.belief || !draft.goal || !draft.instinct || !WEAPONS.some(weapon => weapon.name === draft.weapon)
    ? "Write Belief, Goal, and Instinct, and choose a weapon." : ""
];

function startingGear(draft) {
  const weapon = WEAPONS.find(entry => entry.name === draft.weapon);
  const gear = [gearDocument(weapon.name, { hands: weapon.hands, mode: "hand", location: "right-hand" })];
  if (draft.armor) gear.push(gearDocument(draft.armor, { mode: "worn", location: "torso" }));
  const extra = new Set([draft.weapon.toLowerCase(), draft.armor.toLowerCase()]);
  for (const name of [...backgroundFor(draft.background).gear, ...draft.distinctiveGear.split(",").map(entry => entry.trim())]) {
    if (!name || extra.has(name.toLowerCase())) continue;
    extra.add(name.toLowerCase());
    gear.push(gearDocument(name));
  }
  return gear;
}

export function buildLegacyPeoplePlan(input, rules) {
  if (rules?.profileId !== PROFILE) throw new Error("Character creation for other peoples requires Legacy Mixed.");
  const draft = cleanDraft(input);
  for (const validate of validations) {
    const reason = validate(draft);
    if (reason) throw new Error(reason);
  }
  const people = LEGACY_PEOPLES[draft.people];
  const { nature, resources, circles, skillChecks, traitChecks, wiseChecks } = characterValues(draft);
  const choices = people.questions.map(entry => entry.theme);
  const relationships = LEGACY_RELATIONS.filter(([key]) => draft.relations[key].name)
    .map(([key, , role, status]) => ({ slot: relationSlots[key] ?? key, role, status, person: draft.relations[key] }));
  const ability = (value, max = 6) => ({ value, max });
  const ratings = Object.fromEntries(Object.entries(skillChecks).map(([name, checks]) => {
    const rating = Math.min(6, checks + 1);
    return [name, { rating, learning: learningForRating(rating) }];
  }));
  return {
    kind: "CreationCommitPlan", profileId: PROFILE, profileVersion: rules.profileVersion,
    validation: { valid: true }, transaction: { liveExecution: true, mode: "COMPENSATING_ROLLBACK" },
    provenance: { creationGuide: PEOPLE_CREATION },
    actor: {
      name: draft.name, type: "character", folder: { name: "PC", documentName: "Actor" },
      img: `${artPath}${people.art}`, prototypeToken: { texture: { src: `${artPath}${people.art}` } },
      createOptions: { realmGuardSkipRecruitmentProvisioning: true },
      system: {
        ancestry: draft.people, homeland: draft.homeland, age: String(draft.age), concept: draft.concept || draft.background,
        biographySource: draft.biography, lineage: draft.lineage, insignia: draft.insignia, natureDescriptors: choices.join(", "),
        belief: draft.belief, goal: draft.goal, instinct: draft.instinct,
        attributes: { nature: { value: nature, maximum: nature }, will: ability(startingAbilities.will), health: ability(startingAbilities.health),
          resources: ability(resources, 10), circles: ability(circles, 10) },
        resources: { fate: ability(1, 5), persona: ability(1, 5), checks: ability(0, 9) },
        roll: { versus: false, obstacle: 1, modifier: 0 }
      },
      flags: { "realm-guard": {
        recruitmentVersion: PEOPLE_CREATION, communityBackground: draft.background, communitySpecialty: draft.specialty,
        recruitmentSkillChecks: skillChecks, recruitmentWiseChecks: wiseChecks,
        recruitmentNatureAnswers: draft.answers, recruitmentResourceAnswers: draft.resourceAnswers, recruitmentCircleAnswers: draft.circleAnswers,
        communityConnections: { trade: draft.resourceTrade, familyOccupation: draft.parentsResourceProfession, tieBasis: draft.tieBasis, reputation: draft.reputationNote },
        creationRelationships: relationships
      } }
    },
    relationships: { normalized: relationships },
    provisioning: {
      canonicalSkills: { ratings },
      traits: Object.entries(traitChecks).map(([name, rating]) => ({ name, type: "trait", system: { rating } })),
      wises: Object.keys(wiseChecks).map(name => ({ name, type: "wise", system: {} })),
      gear: startingGear(draft)
    }
  };
}

export async function commitLegacyPeople(draft, creator, requestId = "") {
  const rules = getActiveRulesSnapshot();
  const plan = buildLegacyPeoplePlan(draft, rules);
  const { actor } = await adapter.execute(plan, { rulesSnapshot: rules, isGM: creator.isGM, userId: creator.id, requestId });
  return actor;
}
function options(values, selected, placeholder = "Choose…") {
  return (placeholder ? `<option value="">${escape(placeholder)}</option>` : "") + values.map(entry => {
    const [value, label] = Array.isArray(entry) ? entry : [entry, entry];
    return `<option value="${escape(value)}"${value === selected ? " selected" : ""}>${escape(label)}</option>`;
  }).join("");
}

function field(label, name, value, attrs = 'maxlength="120"') {
  return `<label>${label}<input name="${name}" value="${escape(value)}" ${attrs}></label>`;
}

function textarea(label, name, value, limit = 500) {
  return `<label>${label}<textarea name="${name}" rows="2" maxlength="${limit}">${escape(value)}</textarea></label>`;
}

function select(label, name, choices, selected, placeholder) {
  return `<label>${label}<select name="${escape(name)}">${options(choices, selected, placeholder)}</select></label>`;
}

function question(label, name, checked, effect = "") {
  return `<label class="rg-people-choice"><input type="checkbox" name="${name}" ${checked ? "checked" : ""}>
    <span class="rg-people-control" aria-hidden="true"></span><span>${escape(label)}${effect ? `<small>${escape(effect)}</small>` : ""}</span></label>`;
}

const grid = html => `<div class="rg-recruit-grid two">${html}</div>`;
const section = (title, content) => `<fieldset class="rg-people-question"><legend>${escape(title)}</legend>${content}</fieldset>`;
const titles = ["People and Background", "Nature", "Homeland", "Life Experience", "Experience and Specialty", "Knowledge and Wises",
  "Resources and Circles", "Traits", "House and Relationships", "Drives and Gear", "Review Your Character"];

function homelandFields(draft) {
  if (!draft.homeland) return "";
  const { skills, traits } = homelandChoices(draft.homeland);
  return grid(select("Homeland Skill", "homelandSkill", skills, draft.homelandSkill)
    + select("Homeland Trait", "homelandTrait", traits, draft.homelandTrait));
}

function choices(draft, questions, prefix, ability) {
  return questions.map(([key, label, delta, traits]) => {
    const effect = `${delta > 0 ? "+" : "−"}1 ${ability}${traits.length ? ` · Unavailable Traits: ${traits.join(", ")}` : ""}`;
    return question(label, `${prefix}-${key}`, draft[key], effect);
  }).join("");
}

function readReviewList(values, format = (name, count) => `${name} (${count})`) {
  return escape(Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => format(name, count)).join(" · "));
}

function panel(index, draft) {
  const people = LEGACY_PEOPLES[draft.people];
  switch (index) {
    case 0:
      return `<p>Choose your people, former occupation, and the kind of character you want to play.</p>
        ${grid(select("People", "people", Object.entries(LEGACY_PEOPLES).map(([id, entry]) => [id, entry.label]), draft.people)
          + select("Background", "background", BACKGROUNDS, draft.background)
          + field("Name", "name", draft.name, 'maxlength="120" autofocus')
          + field("Age", "age", draft.age || "", 'type="number" min="1" max="9999"'))}
        ${field("Concept", "concept", draft.concept)}
        ${textarea("Biography / Background", "biography", draft.biography, 2000)}`;
    case 1:
      return `<div class="rg-people-nature-intro"><img src="${artPath}${people.art}" alt=""><div>
        <h3>${escape(draft.name)}</h3><p>${escape(people.label)} · ${escape(draft.background)}</p>
        <p>Start at Nature 3. Answer all three questions. Starting Nature stays between 2 and 6.</p>
        <output data-people-nature aria-live="polite">Nature ${legacyStartingNature(draft.answers)}</output></div></div>
        ${people.questions.map(({ theme, scene, answers }, i) => section(theme, `<p>${escape(scene)}</p>
          ${answers.map((answer, j) => `<label class="rg-people-choice"><input type="radio" name="nature-${i}" value="${j}"
             ${draft.answers[i] === j ? "checked" : ""}><span class="rg-people-control" aria-hidden="true"></span>
             <span>${escape(answer)}</span><b>${["＋1", "0", "−1"][j]}</b></label>`).join("")}`)).join("")}`;
    case 2:
      return `<p>Choose where you grew up, then take one Skill check and one Trait check from that homeland.</p>
        <p>Suggested homelands: ${escape(people.homes.join(", "))}</p>
        ${select("Homeland", "homeland", [...people.homes, ...PLACES.filter(place => !people.homes.includes(place))], draft.homeland)}
        <div data-people-homeland>${homelandFields(draft)}</div>`;
    case 3: {
      const suggestions = backgroundFor(draft.background).skills;
      return `<p>Each choice adds one Skill check. Checks on the same Skill stack. Starting rating is checks + 1, up to 6D.</p>
        ${suggestions.length ? `<p><b>${escape(draft.background)} suggestions</b> ${escape(suggestions.join(" · "))}</p>` : ""}
        ${grid(EXPERIENCE_FIELDS.map(([key, label, list]) => select(label, key, list, draft.experience[key])).join(""))}`;
    }
    case 4: {
      const counts = Array.from({ length: EXPERIENCE_CHECKS + 1 }, (_, i) => [i, i]);
      return `<p>Distribute exactly ${EXPERIENCE_CHECKS} Experience Checks. Your Specialty adds a separate check.</p>
        <output data-people-allocated aria-live="polite">${sum(Object.values(draft.allocation))} / ${EXPERIENCE_CHECKS} allocated</output>
        <div class="rg-service-grid">${CREATION_SKILLS.map(name => select(escape(name), `experience-${name}`, counts, draft.allocation[name], "")).join("")}</div>
        ${select("Specialty", "specialty", CREATION_SKILLS, draft.specialty)}`;
    }
    case 5:
      return `<p>Choose ${WISE_CHECKS} Wise checks. A custom Wise takes priority over the example. Repeat a Wise to put both checks into it. Wises are unrated in Legacy Mixed.</p>
        ${draft.wises.map((wise, i) => grid(select(`Wise check ${i + 1}`, `wise-${i}`, WISE_EXAMPLES, wise)
          + field("Or type a custom Wise", `wise-custom-${i}`, WISE_EXAMPLES.includes(wise) ? "" : wise))).join("")}`;
    case 6: {
      const trained = characterValues(draft).skillChecks;
      return `<p>Start with Resources 2 and Circles 2. Check each statement that applies. Some answers restrict your Trait choices.</p>
        ${grid(section("Resources", choices(draft.resourceAnswers, RESOURCE_QUESTIONS, "resource", "Resources")
          + select("Practiced Trade Skill", "resourceTrade", TRADE_SKILLS.filter(name => trained[name]), draft.resourceTrade)
          + select("Family Occupation", "parentsResourceProfession", OCCUPATIONS, draft.parentsResourceProfession))
        + section("Circles", choices(draft.circleAnswers, CIRCLE_QUESTIONS, "circle", "Circles")
          + select("Basis for Community Ties", "tieBasis", tieChoices, draft.tieBasis) + field("Reputation Note", "reputationNote", draft.reputationNote)))}
        <output data-people-abilities aria-live="polite"></output>`;
    }
    case 7: {
      const excluded = unavailableTraits(draft);
      return `<p>Your Homeland Trait is <b>${escape(draft.homelandTrait)}</b>. Choose an Innate Quality. Choosing the same Trait gives it level 2.</p>
        ${excluded.size ? `<p>Unavailable from your answers: ${escape([...excluded].sort().join(", "))}</p>` : ""}
        ${select("Innate Quality", "innateTrait", TRAITS.filter(trait => !excluded.has(trait)), draft.innateTrait)}`;
    }
    case 8:
      return `<p>Choose at least one family member, a Master Artisan or Teacher, a Mentor, a Friend and a Rival. Name each person and say where to find them.</p>
        ${grid(field("House or Lineage", "lineage", draft.lineage) + field("Insignia", "insignia", draft.insignia))}
        ${LEGACY_RELATIONS.map(([key, label]) => {
          const person = draft.relations[key];
          return section(label, grid(field("Name", `${key}-name`, person.name)
            + select("Occupation", `${key}-profession`, OCCUPATIONS, person.profession, key === "enemy" ? "Optional" : "Choose…")
            + select("Location", `${key}-location`, PLACES, person.location)
            + field("What connects you?", `${key}-notes`, person.notes, 'maxlength="500"')
            + (key === "enemy" ? select("People / Type", "enemy-people", RELATION_PEOPLES, person.people) : "")));
        }).join("")}`;
    case 9:
      return `<p>Belief says what matters to you, Goal says what you want to achieve next, and Instinct says what you always do in a particular situation.</p>
        ${textarea("Belief", "belief", draft.belief)}${textarea("Goal", "goal", draft.goal)}${textarea("Instinct", "instinct", draft.instinct)}
        ${grid(select("Weapon", "weapon", WEAPONS.map(entry => entry.name), draft.weapon)
          + field("Armor (if worn)", "armor", draft.armor))}${textarea("Distinctive Gear (comma separated)", "distinctiveGear", draft.distinctiveGear)}
        <p><b>Background Gear</b> ${escape(backgroundFor(draft.background).gear.join(" · ") || "None")}</p><p><b>Starting Rewards</b> Fate 1 · Persona 1</p>`;
    default: {
      const { nature, resources, circles, skillChecks, traitChecks, wiseChecks } = characterValues(draft);
      return `<div class="rg-people-nature-intro"><img src="${artPath}${people.art}" alt=""><div><h3>${escape(draft.name)}</h3>
        <p>${escape([people.label, draft.homeland, draft.background, `Age ${draft.age}`].join(" · "))}</p>
        <p>${escape(draft.concept || draft.background)}</p></div></div>
        <p><b>Nature ${nature}/${nature}</b> · ${escape(people.questions.map(entry => entry.theme).join(" · "))}</p>
        <p>Will ${startingAbilities.will} · Health ${startingAbilities.health} · Resources ${resources} · Circles ${circles} · Fate 1 · Persona 1</p>
        ${draft.biography ? `<p><b>Biography</b> ${escape(draft.biography)}</p>` : ""}
        <p><b>Skills</b> ${readReviewList(skillChecks, (name, count) => `${name} ${Math.min(6, count + 1)}D`)}</p>
        <p><b>Specialty</b> ${escape(draft.specialty)}</p>
        <p><b>Traits</b> ${readReviewList(traitChecks, (name, count) => `${name} level ${count}`)}</p>
        <p><b>Wises</b> ${readReviewList(wiseChecks, (name, count) => count === 1 ? name : `${name} (${count} checks)`)}</p>
        ${draft.reputationNote ? `<p><b>Reputation</b> ${escape(draft.reputationNote)}</p>` : ""}
        <h4>House and Relationships</h4><p>${escape(draft.lineage)} · ${escape(draft.insignia)}</p>
        <ul>${LEGACY_RELATIONS.map(([key, label]) => {
          const person = draft.relations[key];
          return person.name ? `<li><b>${label}</b> · ${escape([person.name, person.people, person.profession, person.location, person.notes].filter(Boolean).join(" · "))}</li>` : "";
        }).join("")}</ul>
        <p><b>Belief</b> ${escape(draft.belief)}</p><p><b>Goal</b> ${escape(draft.goal)}</p><p><b>Instinct</b> ${escape(draft.instinct)}</p>
        <p><b>Gear</b> ${escape(startingGear(draft).map(item => item.name).join(" · "))}</p>
        ${question("Open character sheet after creation", "openSheet", draft.openSheet)}`;
    }
  }
}

function readStep(index, draft, form) {
  const get = name => form.elements.namedItem(name)?.value ?? "";
  const checked = name => form.elements.namedItem(name)?.checked === true;
  const read = keys => Object.assign(draft, Object.fromEntries(keys.map(key => [key, get(key)])));
  switch (index) {
    case 0: {
      const changedPeople = draft.people !== get("people");
      read(["name", "people", "background", "age", "concept", "biography"]);
      if (changedPeople) draft.answers = [];
      return;
    }
    case 1:
      draft.answers = Array.from({ length: 3 }, (_, idx) => get(`nature-${idx}`) === "" ? null : Number(get(`nature-${idx}`)));
      return;
    case 2:
      read(["homeland", "homelandSkill", "homelandTrait"]);
      return;
    case 3:
      draft.experience = Object.fromEntries(EXPERIENCE_FIELDS.map(([key]) => [key, get(key)]));
      return;
    case 4:
      draft.allocation = Object.fromEntries(CREATION_SKILLS.map(skill => [skill, Number(get(`experience-${skill}`))]));
      read(["specialty"]);
      return;
    case 5:
      draft.wises = Array.from({ length: WISE_CHECKS }, (_, i) => get(`wise-custom-${i}`).trim() || get(`wise-${i}`));
      return;
    case 6:
      draft.resourceAnswers = Object.fromEntries(RESOURCE_QUESTIONS.map(([key]) => [key, checked(`resource-${key}`)]));
      draft.circleAnswers = Object.fromEntries(CIRCLE_QUESTIONS.map(([key]) => [key, checked(`circle-${key}`)]));
      read(["resourceTrade", "parentsResourceProfession", "tieBasis", "reputationNote"]);
      return;
    case 7:
      read(["innateTrait"]);
      return;
    case 8:
      read(["lineage", "insignia"]);
      draft.relations = Object.fromEntries(LEGACY_RELATIONS.map(([key]) => [key, Object.fromEntries(
        ["name", "profession", "location", "people", "notes"].map(part => [part, get(`${key}-${part}`)]))]));
      return;
    case 9:
      read(["belief", "goal", "instinct", "weapon", "armor", "distinctiveGear"]);
      return;
    default:
      draft.openSheet = checked("openSheet");
  }
}

function bindStep(index, dialog, draft) {
  const form = dialog.element.querySelector("form");
  if (!form) return;
  if (index === 2) {
    form.elements.namedItem("homeland").addEventListener("change", event => {
      form.querySelector("[data-people-homeland]").innerHTML = homelandFields({ homeland: event.target.value });
    });
  }
  const output = form.querySelector("output");
  if (!output || ![1, 4, 6].includes(index)) return;
  const update = () => {
    const current = { ...draft };
    readStep(index, current, form);
    const summary = characterValues(cleanDraft(current));
    if (index === 1) output.textContent = `Nature ${summary.nature}`;
    if (index === 4) output.textContent = `${sum(Object.values(current.allocation))} / ${EXPERIENCE_CHECKS} allocated`;
    if (index === 6) output.textContent = `Resources ${summary.resources} · Circles ${summary.circles}`;
  };
  form.addEventListener("change", update);
  update();
}

export async function openLegacyPeopleCreation({ people = "human", reviewRelationships } = {}) {
  if (!legacyPeopleCreationEnabled() || !game.user.hasRole("PLAYER")) return null;
  const rules = getActiveRulesSnapshot();
  const draft = { people: Object.hasOwn(LEGACY_PEOPLES, people) ? people : "human", answers: [], openSheet: true, weapon: "Sword" };
  for (let index = 0; index < titles.length;) {
    const save = (_event, button) => readStep(index, draft, button.form);
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: `Realm Guard · ${titles[index]}`, resizable: true },
      position: fitWindowToViewport(760, 720), classes: ["rg-people-dialog", "rg-scrollable-wizard"], modal: false, rejectClose: false,
      content: `<div class="realm-guard rg-recruitment rg-people-creation">
        <header class="rg-people-step"><h2>${titles[index]}</h2><span>Step ${index + 1} of ${titles.length}</span></header>${panel(index, cleanDraft(draft))}</div>`,
      render: (_event, dialog) => bindStep(index, dialog, draft),
      buttons: [
        ...(index ? [{ action: "back", label: "Back", callback: (...args) => { save(...args); return "back"; } }] : []),
        { action: "next", label: index === titles.length - 1 ? "Create Character" : "Next", default: true, callback: (...args) => { save(...args); return "next"; } },
        { action: "cancel", label: "Cancel" }
      ]
    });
    if (!result || result === "cancel") return null;
    if (result === "back") { index--; continue; }
    const problem = validations[index]?.(cleanDraft(draft));
    if (problem) { ui.notifications.warn(problem); continue; }
    index++;
  }
  let actor;
  try {
    if (getActiveRulesSnapshot().rulesSnapshotHash !== rules.rulesSnapshotHash) throw new Error("The rules profile has changed. Restart character creation.");
    const payload = cleanDraft(draft);
    if (!game.user.isGM) {
      buildLegacyPeoplePlan(payload, rules);
      await submitRangerRecruitment(payload, rules.rulesSnapshotHash, PEOPLE_CREATION);
      ui.notifications.info("Your character will be created automatically when a GM is connected.");
      return null;
    }
    actor = await commitLegacyPeople(payload, game.user);
  } catch (error) {
    console.error("Realm Guard | Character creation failed", error);
    ui.notifications.error(error.message);
    return null;
  }
  ui.notifications.info(`${actor.name} was created in Actors → PC.`);
  try { await reviewRelationships?.(actor, draft); }
  catch (error) { console.warn("Realm Guard | Relationship NPC review failed", error); }
  if (draft.openSheet) actor.sheet.render(true);
  return actor;
}
