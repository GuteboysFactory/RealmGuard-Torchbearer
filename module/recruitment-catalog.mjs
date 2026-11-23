export const HOMELANDS = Object.freeze({
  rhudaur: { label: "Rhudaur", text: "Formerly the eastern nation of Arnor, including Rivendell and villages between Bree and the Misty Mountains.", skills: ["Archivist", "Animal Handler", "Carpenter"], traits: ["Calm", "Natural Bearings"] },
  bree: { label: "Bree-land", text: "A quiet area whose populace keeps to their own business.", skills: ["Miller", "Farmer", "Brewer"], traits: ["Short", "Independent"] },
  esgaroth: { label: "Esgaroth & Dale", text: "The folk of this region ply the lake and river.", skills: ["Boatcrafter", "Carpenter", "Haggler"], traits: ["Sharp-Eyed", "Driven"] },
  gondor: { label: "Gondor", text: "Includes the capital, Lebennin and Lamedon.", skills: ["Archivist", "Stonemason", "Alchemist"], traits: ["Brave", "Wise"] },
  doren: { label: "Dor-en-Ernil", text: "Includes Dol Amroth, Belfalas and Anfalas.", skills: ["Rider", "Boatcrafter", "Orator"], traits: ["Graceful", "Tall"] },
  tharbad: { label: "Tharbad", text: "A trade town on the Bruinen and Greenway.", skills: ["Haggler", "Glazier", "Laborer"], traits: ["Rational", "Hard Worker"] },
  sarn: { label: "Sarn Ford", text: "A quiet, self-sufficient town named for the ford it straddles.", skills: ["Farmer", "Stonemason", "Miller"], traits: ["Steady Hand", "Quick-Witted"] },
  rhovanion: { label: "Rhovanion", text: "Villages and communities on the western border of Mirkwood.", skills: ["Baker", "Animal Handler", "Herdsman"], traits: ["Stoic", "Tough"] }
});

export const NATURAL_TALENT = Object.freeze([
  "Administrator", "Alchemist", "Animal Handler", "Archivist", "Armorer", "Baker", "Boatcrafter", "Brewer", "Carpenter", "Cartographer", "Cook", "Deceiver", "Farmer", "Fighter", "Glazier", "Haggler", "Healer", "Herdsman", "Hunter", "Instructor", "Laborer", "Militarist", "Miller", "Orator", "Pathfinder", "Persuader", "Potter", "Rider", "Scout", "Smith", "Stonemason", "Survivalist", "Weather Watcher", "Weaver"
]);

export const TRADE_SKILLS = Object.freeze(["Animal Handler", "Archivist", "Armorer", "Baker", "Boatcrafter", "Brewer", "Carpenter", "Cartographer", "Farmer", "Glazier", "Herdsman", "Miller", "Potter", "Smith", "Stonemason", "Weaver"]);

export const APPRENTICESHIP_SKILLS = Object.freeze(["Animal Handler", "Archivist", "Armorer", "Baker", "Brewer", "Carpenter", "Cartographer", "Farmer", "Glazier", "Herdsman", "Miller", "Potter", "Smith", "Stonemason", "Weaver"]);

export const CONVINCING_SKILLS = Object.freeze(["Deceiver", "Orator", "Persuader"]);

export const INNATE_TRAITS = Object.freeze([
  "Bitter", "Bodyguard", "Bold", "Brave", "Calm", "Clever", "Compassionate", "Cunning", "Curious", "Defender", "Determined", "Driven", "Early Riser", "Extrovert", "Fat", "Fearful", "Fearless", "Fiery", "Generous", "Graceful", "Greybeard", "Innocent", "Jaded", "Keen-Eared", "Leader", "Lost", "Natural Bearings", "Nimble", "Nocturnal", "Quick-Witted", "Quiet", "Realm's Honor", "Rough Hands", "Sharp-Eyed", "Short", "Skeptical", "Skinny", "Stern", "Stoic", "Stubborn", "Suspicious", "Tall", "Thoughtful", "Tough", "Weather Sense", "Wise", "Young"
]);

export const WISE_EXAMPLES = Object.freeze([
  "Anduin-wise", "Angmar-wise", "Armor-wise", "Arnor-wise", "Bandit-wise", "Bat-wise", "Barrow-wise", "Beer-wise", "Blizzard-wise", "Bree-land-wise", "Captain-wise", "Celebrations-wise", "Coast-wise", "Cold-wise", "Craft-wise", "Crop-wise", "Crow-wise", "Deadman's Dike-wise", "Drought-wise", "Dwarf-wise", "Dwarven rune-wise", "Eagle-wise", "Elf-wise", "Elven sanctuary-wise", "Epidemic-wise", "Erebor-wise", "Esgaroth-wise", "Escort-wise", "Famine-wise", "Fireworks-wise", "First Age-wise", "Flood-wise", "Forest-wise", "Funeral rites-wise", "Gondor-wise", "Governing-wise", "Heat-wise", "Herb-wise", "Herd-wise", "Hobbit-wise", "Horse-wise", "Inn-wise", "Ithilien-wise", "Lake-wise", "Lord-wise", "Lothlorien-wise", "Medicine-wise", "Minerals-wise", "Mirkwood-wise", "Mordor-wise", "Moria-wise", "Morgul-wise", "Mountain-wise", "Night-wise", "Open ground-wise", "Orc-wise", "Orthanc-wise", "Palantir-wise", "Path-wise", "Pipeweed-wise", "Poems-wise", "Poison-wise", "Rain-wise", "Rebellion-wise", "Recipe-wise", "Refuge-wise", "Reunited Realms-wise", "Rhovanion-wise", "River-wise", "Road-wise", "Rohan-wise", "Rumor-wise", "Sea-wise", "Second Age-wise", "Shield-wise", "Ship-wise", "Shire-wise", "Shore-wise", "Snow-wise", "Song-wise", "Spider-wise", "Star-wise", "Stream-wise", "Swamp-wise", "Tale-wise", "Third Age-wise", "Thunderstorm-wise", "Tide-wise", "Tokens of Power-wise", "Tradesman-wise", "Trail-wise", "Trap-wise", "Troll-wise", "Tunnel-wise", "War-wise", "Warg-wise", "Watchtower-wise", "Wight-wise", "Wilds-wise", "Wine-wise", "Wizard-wise"
]);

export const WEAPONS = Object.freeze([
  { name: "Shield", hands: 1 }, { name: "Knife", hands: 1 }, { name: "Sword", hands: 1 }, { name: "Staff", hands: 2 }, { name: "Spear", hands: 2 }, { name: "Whip", hands: 1 }, { name: "Halberd", hands: 2 }, { name: "Sling", hands: 1 }, { name: "Bow", hands: 2 }
]);

export const RELATIONSHIP_LOCATIONS = Object.freeze([
  "Bree", "Bree-land", "Arnor", "Rhudaur", "Fornost", "Deadman's Dike", "Tharbad", "Sarn Ford",
  "Rivendell", "Esgaroth", "Dale", "Rhovanion", "Mirkwood", "Gondor", "Dor-en-Ernil", "Dol Amroth",
  "Rohan", "The Shire", "Dunland", "Harad", "The East", "Angmar"
]);

export function normalizeWise(name) {
  const clean = String(name ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return "";
  return /-wise$/i.test(clean) ? clean : `${clean}-wise`;
}

export function learningForRating(rating) {
  const r = Number(rating ?? 0);
  if (r <= 0) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 1 };
  if (r === 1) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 0 };
  return { passed: 0, failed: 0, passNeeded: r, failNeeded: r - 1 };
}

export function gearDocument(name, { hands = 0, location = "", mode = "unassigned", description = "Created during Realm Guard Recruitment." } = {}) {
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
