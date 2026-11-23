import { RG_DEFAULT_SKILLS } from "./default-skills.mjs";
import { QUICK_NPC_TEMPLATE_SPECS } from "./quick-npc-library.mjs";
import { HOMELANDS, TRADE_SKILLS, APPRENTICESHIP_SKILLS, CONVINCING_SKILLS, INNATE_TRAITS, RELATIONSHIP_LOCATIONS } from "./recruitment-catalog.mjs";
import { LEGACY_BACKGROUNDS, LEGACY_PEOPLES } from "./legacy-people.mjs";

const sorted = values => [...new Set(values)].sort((a, b) => a.localeCompare(b));
const occupationalCategories = new Set(["Civilian", "Trade", "Social", "Learned", "Ranger", "Military", "Wilderness", "Criminal", "Shadow"]);
const templatesByOccupation = new Map();
for (const template of QUICK_NPC_TEMPLATE_SPECS) {
  const { category, occupation, competence } = template.metadata;
  if (!occupationalCategories.has(category)) continue;
  if (!templatesByOccupation.has(occupation) || competence === "Ordinary" && templatesByOccupation.get(occupation).metadata.competence !== "Ordinary") {
    templatesByOccupation.set(occupation, template);
  }
}

const established = new Map(Object.values(LEGACY_BACKGROUNDS).map(background => [background.label, background]));
export const BACKGROUNDS = sorted([...established.keys(), ...templatesByOccupation.keys(), ...RG_DEFAULT_SKILLS]);
export const OCCUPATIONS = BACKGROUNDS;
export const RELATION_PEOPLES = sorted(QUICK_NPC_TEMPLATE_SPECS.map(template => template.metadata.people).filter(Boolean).concat(["Human", "Dúnadan", "Dwarf", "Hobbit", "Elf"]));
export const PLACES = sorted([...RELATIONSHIP_LOCATIONS, ...Object.values(HOMELANDS).map(home => home.label),
  ...Object.values(LEGACY_PEOPLES).flatMap(people => people.homes)]);
export const CREATION_SKILLS = sorted(RG_DEFAULT_SKILLS);

export function backgroundFor(occupation) {
  const background = established.get(occupation);
  if (background) return background;
  const template = templatesByOccupation.get(occupation);
  const skills = [...new Set([occupation, ...(template?.skills ?? []).map(([name]) => name)])].filter(name => CREATION_SKILLS.includes(name));
  return { skills, gear: (template?.gear ?? []).map(item => item.name) };
}

const COMMUNITY_HOMELANDS = {
  Rohan: { skills: ["Rider", "Herdsman", "Animal Handler"], traits: ["Bold", "Natural Bearings"] },
  Erebor: { skills: ["Stonemason", "Smith", "Armorer"], traits: ["Proud", "Stubborn"] },
  "Iron Hills": { skills: ["Armorer", "Smith", "Fighter"], traits: ["Resolute", "Tough"] },
  "Blue Mountains": { skills: ["Stonemason", "Smith", "Haggler"], traits: ["Hard Worker", "Independent"] },
  Aglarond: { skills: ["Stonemason", "Glazier", "Cartographer"], traits: ["Driven", "Steady Hand"] },
  "The Shire": { skills: ["Farmer", "Cook", "Miller"], traits: ["Generous", "Short"] },
  Rivendell: { skills: ["Archivist", "Healer", "Lore Master"], traits: ["Thoughtful", "Wise"] },
  "Lothlórien": { skills: ["Scout", "Weaver", "Healer"], traits: ["Graceful", "Sharp-Eyed"] },
  "Woodland Realm": { skills: ["Hunter", "Pathfinder", "Scout"], traits: ["Keen-Eared", "Natural Bearings"] },
  "Grey Havens": { skills: ["Boatcrafter", "Carpenter", "Weather Watcher"], traits: ["Calm", "Thoughtful"] }
};
export const TRAITS = sorted([...INNATE_TRAITS, ...Object.values(HOMELANDS).flatMap(home => home.traits),
  ...Object.values(COMMUNITY_HOMELANDS).flatMap(home => home.traits)]);
const rangerHomesByLabel = new Map(Object.values(HOMELANDS).map(home => [home.label, home]));

export function homelandChoices(homeland) {
  return Object.hasOwn(COMMUNITY_HOMELANDS, homeland) ? COMMUNITY_HOMELANDS[homeland]
    : rangerHomesByLabel.get(homeland) ?? { skills: CREATION_SKILLS, traits: TRAITS };
}

export const EXPERIENCE_CHECKS = 6;
export const WISE_CHECKS = 2;
export const EXPERIENCE_FIELDS = [
  ["naturalTalent", "Area of Natural Talent", CREATION_SKILLS],
  ["familyTrade", "Family Trade", TRADE_SKILLS],
  ["convincing", "Convincing Others", CONVINCING_SKILLS],
  ["apprenticeship", "Apprenticeship", APPRENTICESHIP_SKILLS],
  ["mentorTraining", "Mentor Training", CREATION_SKILLS]
];
export const RESOURCE_QUESTIONS = [
  ["trade", "Do you still practice a learned trade?", 1, ["Leader"]],
  ["parentsWealth", "Did your family support you through a well-established profession?", 1, []],
  ["gifts", "Do you regularly spend money on gifts?", -1, []],
  ["thrifty", "Are you thrifty?", 1, ["Generous"]],
  ["debt", "Have you been in debt or struggled to manage money?", -1, []],
  ["pack", "Do you always pack carefully for a journey?", 1, ["Bold", "Fiery"]]
];
export const CIRCLE_QUESTIONS = [
  ["gregarious", "Do you make friends readily?", 1, ["Bitter", "Jaded"]],
  ["communityTies", "Do you have strong ties through family or a close mentor?", 1, []],
  ["reputation", "Have you earned a reputation for helping your community?", 1, []],
  ["enemies", "Do you have powerful enemies?", -1, []],
  ["crime", "Have you been convicted of a crime?", -1, []],
  ["loner", "Do you prefer to keep to yourself?", -1, ["Extrovert"]]
];
