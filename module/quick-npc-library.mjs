import { RG_DEFAULT_SKILLS } from "./default-skills.mjs";

export const QUICK_NPC_LIBRARY_VERSION = "2.2.0";
export const QUICK_NPC_SCHEMA_VERSION = 2;

const SKILLS = new Set(RG_DEFAULT_SKILLS);
const freeze = value => Object.freeze(value);
const clean = value => String(value ?? "").trim();

export function normalizeQuickNpcSearch(value = "") {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CULTURES = freeze({
  bree: freeze({ key: "bree", label: "Common", people: "Common Folk", tags: ["common", "town", "village", "road"] }),
  dunadan: freeze({ key: "dunadan", label: "Dúnadan", people: "Dúnedain", tags: ["arnor", "ranger", "north", "eriador"] }),
  gondor: freeze({ key: "gondor", label: "Gondorian", people: "Men of Gondor", tags: ["gondor", "south", "kingdom"] }),
  rohan: freeze({ key: "rohan", label: "Rohirric", people: "Rohirrim", tags: ["rohan", "horse-lord", "mark"] }),
  dwarf: freeze({ key: "dwarf", label: "Dwarven", people: "Dwarves", tags: ["dwarf", "mountain", "craft"] }),
  elf: freeze({ key: "elf", label: "Elven", people: "Elves", tags: ["elf", "firstborn", "woodland"] }),
  hobbit: freeze({ key: "hobbit", label: "Hobbit", people: "Hobbits", tags: ["hobbit", "shire", "halfling"] }),
  dunland: freeze({ key: "dunland", label: "Dunlending", people: "Dunlendings", tags: ["dunland", "hill", "clan"] }),
  northman: freeze({ key: "northman", label: "Northman", people: "Northmen", tags: ["rhovanion", "northman", "woodland"] }),
  harad: freeze({ key: "harad", label: "Haradrim", people: "Haradrim", tags: ["harad", "southron", "southern"] }),
  easterling: freeze({ key: "easterling", label: "Easterling", people: "Easterlings", tags: ["east", "easterling"] }),
  orc: freeze({ key: "orc", label: "Orc", people: "Orcs", tags: ["orc", "goblin", "shadow"] }),
  shadow: freeze({ key: "shadow", label: "Shadow", people: "Servants of Shadow", tags: ["shadow", "enemy", "dark"] }),
  undead: freeze({ key: "undead", label: "Undead", people: "Restless Dead", tags: ["undead", "spirit", "haunt"] }),
  beast: freeze({ key: "beast", label: "Wild", people: "Beasts", tags: ["beast", "creature", "wild"] })
});

const PROFILES = freeze({
  civilian: freeze({ nature: 3, will: 3, health: 3, resources: 2, circles: 2 }),
  laborer: freeze({ nature: 3, will: 2, health: 4, resources: 1, circles: 1 }),
  artisan: freeze({ nature: 3, will: 3, health: 3, resources: 3, circles: 2 }),
  social: freeze({ nature: 3, will: 4, health: 3, resources: 3, circles: 4 }),
  scholar: freeze({ nature: 3, will: 4, health: 2, resources: 3, circles: 3 }),
  noble: freeze({ nature: 3, will: 4, health: 3, resources: 5, circles: 5 }),
  military: freeze({ nature: 3, will: 3, health: 4, resources: 1, circles: 1 }),
  ranger: freeze({ nature: 4, will: 3, health: 5, resources: 2, circles: 2 }),
  wilderness: freeze({ nature: 4, will: 3, health: 4, resources: 1, circles: 1 }),
  criminal: freeze({ nature: 3, will: 3, health: 4, resources: 1, circles: 2 }),
  shadow: freeze({ nature: 4, will: 3, health: 4, resources: 0, circles: 1 }),
  leader: freeze({ nature: 4, will: 4, health: 5, resources: 3, circles: 4 }),
  creature: freeze({ nature: 5, will: 2, health: 5, resources: 0, circles: 0 }),
  undead: freeze({ nature: 5, will: 4, health: 4, resources: 0, circles: 0 })
});

const TIERS = freeze([
  freeze({ key: "ordinary", label: "Ordinary", skillBonus: 0, topBonus: 0, statBonus: 0, threat: "Low", aliases: ["common", "basic", "regular"] }),
  freeze({ key: "skilled", label: "Skilled", skillBonus: 1, topBonus: 0, statBonus: 0, threat: "Standard", aliases: ["experienced", "capable", "trained"] }),
  freeze({ key: "veteran", label: "Veteran", skillBonus: 1, topBonus: 1, statBonus: 1, threat: "High", aliases: ["veteran", "elite", "expert", "old hand"] })
]);

const CREATURE_TIERS = freeze([
  freeze({ key: "common", label: "Common", skillBonus: 0, topBonus: 0, statBonus: 0, threat: "Standard", aliases: ["common", "normal"] }),
  freeze({ key: "dangerous", label: "Dangerous", skillBonus: 1, topBonus: 0, statBonus: 0, threat: "High", aliases: ["dangerous", "aggressive", "large"] }),
  freeze({ key: "dire", label: "Dire", skillBonus: 1, topBonus: 1, statBonus: 1, threat: "Major", aliases: ["dire", "huge", "deadly", "monstrous"] })
]);

const g = (name, options = {}) => freeze({ name, ...options });
const s = (name, rating = 2) => freeze([name, rating]);

const DEFAULT_RELATIONSHIPS = freeze({
  Civilian: ["PARENT", "FRIEND", "CONTACT"],
  Trade: ["PARENT", "FRIEND", "SENIOR_ARTISAN", "CONTACT"],
  Social: ["PARENT", "FRIEND", "MENTOR", "CONTACT"],
  Learned: ["PARENT", "FRIEND", "MENTOR", "CONTACT"],
  Military: ["PARENT", "FRIEND", "MENTOR", "ENEMY", "CONTACT"],
  Ranger: ["PARENT", "FRIEND", "MENTOR", "ENEMY", "CONTACT"],
  Wilderness: ["PARENT", "FRIEND", "MENTOR", "CONTACT"],
  Criminal: ["FRIEND", "ENEMY", "CONTACT"],
  Shadow: ["ENEMY"],
  Undead: ["ENEMY"],
  Creature: ["ENEMY", "CONTACT"]
});


const groupMember = (label, query, competence = "Skilled", count = 1) => freeze({
  label: clean(label),
  query: clean(query),
  competence: clean(competence),
  count: Math.max(1, Number(count || 1))
});

const groupTemplate = ({ id, name, category = "Mixed", concept = "", members = [] }) => freeze({
  id: clean(id),
  name: clean(name),
  category: clean(category),
  concept: clean(concept),
  members: freeze(members)
});

export const QUICK_NPC_GROUP_LIBRARY_VERSION = "1.1.0";
export const QUICK_NPC_GROUP_TEMPLATE_SPECS = freeze([
  groupTemplate({
    id: "ranger-patrol",
    name: "Ranger Patrol",
    category: "Rangers",
    concept: "A balanced patrol of experienced Rangers for scouting, escort or investigation.",
    members: [
      groupMember("Ranger Veteran", "dunadan ranger veteran", "Veteran", 1),
      groupMember("Ranger Scout", "dunadan ranger scout", "Skilled", 2),
      groupMember("Ranger Healer", "dunadan ranger healer", "Skilled", 1)
    ]
  }),
  groupTemplate({
    id: "gondor-road-patrol",
    name: "Gondorian Road Patrol",
    category: "Gondor",
    concept: "A disciplined patrol for roads, gates or troubled settlements.",
    members: [
      groupMember("Captain", "gondorian captain", "Veteran", 1),
      groupMember("Soldier", "gondorian soldier", "Skilled", 3),
      groupMember("Archer", "gondorian archer", "Skilled", 1)
    ]
  }),
  groupTemplate({
    id: "rohan-rider-patrol",
    name: "Rohirric Rider Patrol",
    category: "Rohan",
    concept: "Mounted riders with an outrider for scouting the plains and borders.",
    members: [
      groupMember("Thane", "rohirric thane", "Skilled", 1),
      groupMember("Rider", "rohirric rider", "Skilled", 3),
      groupMember("Outrider", "rohirric outrider", "Skilled", 1)
    ]
  }),
  groupTemplate({
    id: "dwarf-caravan",
    name: "Dwarven Caravan Guard",
    category: "Dwarves",
    concept: "A merchant party protected by sturdy guards and an experienced route scout.",
    members: [
      groupMember("Merchant", "dwarven merchant", "Skilled", 1),
      groupMember("Guard", "dwarven guard", "Skilled", 2),
      groupMember("Tunnel Scout", "dwarven tunnel scout", "Skilled", 1)
    ]
  }),
  groupTemplate({
    id: "bree-road-caravan",
    name: "Road Caravan",
    category: "Travellers",
    concept: "A small merchant caravan with hired protection, a guide and a pack pony.",
    members: [
      groupMember("Merchant", "merchant", "Skilled", 1),
      groupMember("Mercenary", "mercenary", "Skilled", 2),
      groupMember("Guide", "guide", "Skilled", 1),
      groupMember("Pony", "wild pony", "Common", 1)
    ]
  }),
  groupTemplate({
    id: "dunland-warband",
    name: "Dunlending Warband",
    category: "Dunland",
    concept: "A hill-clan raiding band with warriors, a scout and a respected leader.",
    members: [
      groupMember("Clan Elder", "dunlending clan elder", "Skilled", 1),
      groupMember("Clan Warrior", "dunlending clan warrior", "Skilled", 4),
      groupMember("Hill Scout", "dunlending hill scout", "Skilled", 1)
    ]
  }),
  groupTemplate({
    id: "orc-scout-band",
    name: "Orc Scout Band",
    category: "Shadow",
    concept: "A mobile Orc scouting party used for pursuit, ambush and reconnaissance.",
    members: [
      groupMember("Orc Captain", "orc captain", "Skilled", 1),
      groupMember("Orc Scout", "orc scout", "Skilled", 3),
      groupMember("Orc Warrior", "orc warrior", "Ordinary", 2)
    ]
  }),
  groupTemplate({
    id: "orc-warband",
    name: "Orc Warband",
    category: "Shadow",
    concept: "A compact but dangerous Orc warband with command, muscle, infantry and archers.",
    members: [
      groupMember("Orc Captain", "orc captain", "Veteran", 1),
      groupMember("Orc Brute", "orc brute", "Skilled", 1),
      groupMember("Orc Warrior", "orc warrior", "Skilled", 4),
      groupMember("Orc Archer", "orc archer", "Skilled", 2)
    ]
  })
]);

export function quickNpcGroupTemplateCount() {
  return QUICK_NPC_GROUP_TEMPLATE_SPECS.length;
}

export function quickNpcGroupTemplateById(id) {
  const wanted = clean(id);
  return QUICK_NPC_GROUP_TEMPLATE_SPECS.find(entry => entry.id === wanted) ?? null;
}

function role({
  name, culture = "bree", category = "Civilian", subcategory = "", occupation = "",
  profile = "civilian", concept = "", aliases = [], tags = [], skills = [], gear = [],
  relationship = null, tiers = "people"
}) {
  return freeze({
    name, culture, category, subcategory, occupation: occupation || name, profile, concept,
    aliases: freeze(aliases), tags: freeze(tags), skills: freeze(skills), gear: freeze(gear),
    relationship: freeze(relationship ?? DEFAULT_RELATIONSHIPS[category] ?? ["CONTACT"]),
    tiers
  });
}

const ROLE_SEEDS = freeze([
  // Generic common folk, town and rural roles
  role({ name:"Innkeeper", culture:"bree", category:"Civilian", subcategory:"Hospitality", concept:"Local innkeeper, host and source of rumours", aliases:["bartender","barkeep","tavern keeper","publican"], tags:["inn","tavern","rumours","lodging"], skills:[s("Haggler",3),s("Cook",2),s("Persuader",2)], gear:[g("Knife"),g("Lantern")] }),
  role({ name:"Cook", culture:"bree", category:"Trade", subcategory:"Hospitality", profile:"artisan", concept:"Kitchen worker or household cook", aliases:["chef","kitchen worker"], tags:["food","inn"], skills:[s("Cook",3),s("Baker",2)], gear:[g("Knife")] }),
  role({ name:"Brewer", culture:"bree", category:"Trade", subcategory:"Hospitality", profile:"artisan", concept:"Brewer, alehouse supplier and cellar keeper", aliases:["ale brewer","beer maker"], tags:["beer","ale","cellar"], skills:[s("Brewer",3),s("Haggler",2)], gear:[] }),
  role({ name:"Baker", culture:"bree", category:"Trade", subcategory:"Food", profile:"artisan", concept:"Village or town baker", aliases:["bread maker"], tags:["bread","food"], skills:[s("Baker",3),s("Haggler",2)] }),
  role({ name:"Farmer", culture:"bree", category:"Civilian", subcategory:"Rural", profile:"laborer", concept:"Crop farmer from a village or rural district", aliases:["farmhand","crofter"], tags:["farm","field","crop"], skills:[s("Farmer",3),s("Laborer",2),s("Weather Watcher",2)], gear:[g("Staff")] }),
  role({ name:"Herdsman", culture:"bree", category:"Civilian", subcategory:"Rural", profile:"laborer", concept:"Keeper of sheep, cattle or goats", aliases:["shepherd","cowherd"], tags:["herd","livestock","sheep"], skills:[s("Herdsman",3),s("Animal Handler",3),s("Weather Watcher",2)] }),
  role({ name:"Miller", culture:"bree", category:"Trade", subcategory:"Food", profile:"artisan", concept:"Mill operator and grain trader", aliases:["grain miller"], tags:["mill","grain"], skills:[s("Miller",3),s("Haggler",2),s("Laborer",2)] }),
  role({ name:"Smith", culture:"bree", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Village blacksmith and repairer", aliases:["blacksmith","forge worker"], tags:["forge","metal","horseshoe"], skills:[s("Smith",3),s("Armorer",2),s("Haggler",2)], gear:[g("Hammer")] }),
  role({ name:"Armorer", culture:"bree", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Maker and repairer of armour and weapons", aliases:["armourer","weapon smith"], tags:["armor","armour","weapons","forge"], skills:[s("Armorer",3),s("Smith",3)], gear:[g("Hammer")] }),
  role({ name:"Carpenter", culture:"bree", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Carpenter, joiner and wagon repairer", aliases:["joiner","woodworker"], tags:["wood","building","wagon"], skills:[s("Carpenter",3),s("Laborer",2)] }),
  role({ name:"Stonemason", culture:"bree", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Stone cutter and builder", aliases:["mason","stoneworker"], tags:["stone","building"], skills:[s("Stonemason",3),s("Laborer",2)] }),
  role({ name:"Potter", culture:"bree", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Potter and kiln worker", aliases:["ceramicist"], tags:["clay","kiln"], skills:[s("Potter",3),s("Haggler",2)] }),
  role({ name:"Weaver", culture:"bree", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Weaver, tailor or cloth worker", aliases:["tailor","cloth worker","seamstress"], tags:["cloth","textile"], skills:[s("Weaver",3),s("Haggler",2)] }),
  role({ name:"Glazier", culture:"bree", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Glass worker and window maker", aliases:["glassworker"], tags:["glass","window"], skills:[s("Glazier",3),s("Haggler",2)] }),
  role({ name:"Stablemaster", culture:"bree", category:"Trade", subcategory:"Animals", profile:"artisan", concept:"Stable keeper and horse minder", aliases:["groom","stable hand","ostler"], tags:["horse","stable","mount"], skills:[s("Animal Handler",3),s("Rider",2),s("Haggler",2)] }),
  role({ name:"Merchant", culture:"bree", category:"Social", subcategory:"Commerce", profile:"social", concept:"Established merchant with local contacts", aliases:["trader","shopkeeper","dealer"], tags:["trade","shop","market"], skills:[s("Haggler",4),s("Persuader",3),s("Administrator",2)] }),
  role({ name:"Peddler", culture:"bree", category:"Civilian", subcategory:"Commerce", concept:"Travelling seller of small goods and gossip", aliases:["hawker","travelling merchant"], tags:["trade","road","rumours"], skills:[s("Haggler",3),s("Scout",2),s("Persuader",2)], gear:[g("Backpack")] }),
  role({ name:"Ferryman", culture:"bree", category:"Civilian", subcategory:"Travel", concept:"River or ford boatman", aliases:["boatman","ferry operator"], tags:["river","boat","crossing"], skills:[s("Boatcrafter",2),s("Weather Watcher",2),s("Haggler",2)] }),
  role({ name:"Messenger", culture:"bree", category:"Civilian", subcategory:"Travel", concept:"Courier carrying letters and news", aliases:["courier","runner"], tags:["message","road","news"], skills:[s("Pathfinder",3),s("Rider",2),s("Scout",2)], gear:[g("Satchel")] }),
  role({ name:"Healer", culture:"bree", category:"Learned", subcategory:"Healing", profile:"scholar", concept:"Local healer, chirurgeon or wise woman", aliases:["doctor","physician","wise woman","medic"], tags:["medicine","herbs","wounds"], skills:[s("Healer",4),s("Lore Master",2)], gear:[g("Healing Herbs"),g("Satchel")] }),
  role({ name:"Herbalist", culture:"bree", category:"Learned", subcategory:"Healing", profile:"scholar", concept:"Gatherer and preparer of medicinal herbs", aliases:["herb wife","apothecary"], tags:["herbs","medicine","plants"], skills:[s("Healer",3),s("Lore Master",2),s("Survivalist",2)], gear:[g("Healing Herbs"),g("Satchel")] }),
  role({ name:"Midwife", culture:"bree", category:"Learned", subcategory:"Healing", profile:"scholar", concept:"Experienced village midwife and caregiver", aliases:["birth attendant"], tags:["family","medicine","children"], skills:[s("Healer",3),s("Persuader",2)] }),
  role({ name:"Local Elder", culture:"bree", category:"Social", subcategory:"Community", profile:"social", concept:"Respected elder with local memory and influence", aliases:["elder","village elder","old timer"], tags:["rumours","local knowledge","leader"], skills:[s("Persuader",3),s("Lore Master",3),s("Orator",2)] }),
  role({ name:"Reeve", culture:"bree", category:"Social", subcategory:"Administration", profile:"social", concept:"Local official, magistrate or reeve", aliases:["magistrate","bailiff","official"], tags:["law","town","authority"], skills:[s("Administrator",4),s("Persuader",3),s("Orator",2)] }),
  role({ name:"Scribe", culture:"bree", category:"Learned", subcategory:"Records", profile:"scholar", concept:"Letter writer, clerk and record keeper", aliases:["clerk","copyist"], tags:["writing","records","letters"], skills:[s("Archivist",3),s("Administrator",2),s("Lore Master",2)] }),
  role({ name:"Minstrel", culture:"bree", category:"Social", subcategory:"Entertainment", profile:"social", concept:"Travelling singer, storyteller and rumour carrier", aliases:["bard","singer","storyteller"], tags:["song","story","rumours","tavern"], skills:[s("Orator",3),s("Persuader",3),s("Lore Master",2)] }),

  // Dúnedain and northern service
  role({ name:"Ranger Recruit", culture:"dunadan", category:"Ranger", subcategory:"Ranger Service", profile:"ranger", concept:"Newly sworn Ranger of the North", aliases:["young ranger","rookie ranger"], tags:["patrol","watch","north"], skills:[s("Scout",3),s("Pathfinder",3),s("Fighter",2),s("Survivalist",2)], gear:[g("Bow"),g("Dagger"),g("Cloak")] }),
  role({ name:"Ranger Scout", culture:"dunadan", category:"Ranger", subcategory:"Ranger Service", profile:"ranger", concept:"Experienced wilderness scout and patrol Ranger", aliases:["ranger","scout ranger","north ranger"], tags:["patrol","tracking","wilds"], skills:[s("Scout",4),s("Pathfinder",4),s("Fighter",3),s("Survivalist",3)], gear:[g("Bow"),g("Dagger"),g("Cloak")] }),
  role({ name:"Ranger Hunter", culture:"dunadan", category:"Ranger", subcategory:"Ranger Service", profile:"ranger", concept:"Ranger hunter and monster tracker", aliases:["monster hunter","tracker ranger"], tags:["hunt","tracking","beast"], skills:[s("Hunter",4),s("Scout",4),s("Survivalist",3),s("Fighter",3)], gear:[g("Bow"),g("Sword"),g("Cloak")] }),
  role({ name:"Ranger Pathfinder", culture:"dunadan", category:"Ranger", subcategory:"Ranger Service", profile:"ranger", concept:"Guide through forgotten roads and dangerous country", aliases:["guide ranger","trail ranger"], tags:["guide","road","trail"], skills:[s("Pathfinder",4),s("Scout",4),s("Cartographer",3),s("Survivalist",3)], gear:[g("Staff"),g("Cloak"),g("Backpack")] }),
  role({ name:"Ranger Veteran", culture:"dunadan", category:"Ranger", subcategory:"Ranger Service", profile:"ranger", concept:"Battle-tested Ranger and patrol leader", aliases:["old ranger","veteran ranger","grey ranger"], tags:["veteran","leader","patrol"], skills:[s("Fighter",4),s("Scout",4),s("Pathfinder",4),s("Militarist",3)], gear:[g("Sword"),g("Bow"),g("Cloak")] }),
  role({ name:"Ranger Captain", culture:"dunadan", category:"Ranger", subcategory:"Ranger Service", profile:"leader", concept:"Captain commanding Rangers in the field", aliases:["ranger commander","patrol captain"], tags:["captain","leader","command"], skills:[s("Militarist",4),s("Fighter",4),s("Orator",3),s("Scout",3)], gear:[g("Sword"),g("Bow"),g("Mail Shirt"),g("Cloak")] }),
  role({ name:"Ranger Healer", culture:"dunadan", category:"Ranger", subcategory:"Ranger Support", profile:"ranger", concept:"Field healer trained for long patrols", aliases:["field medic","ranger medic"], tags:["healing","patrol","herbs"], skills:[s("Healer",4),s("Survivalist",3),s("Scout",3),s("Lore Master",2)], gear:[g("Healing Herbs"),g("Dagger"),g("Cloak")] }),
  role({ name:"Ranger Lorekeeper", culture:"dunadan", category:"Learned", subcategory:"Ranger Support", profile:"scholar", concept:"Keeper of northern histories, ruins and old enemies", aliases:["ranger scholar","loremaster"], tags:["history","ruins","angmar"], skills:[s("Lore Master",4),s("Archivist",3),s("Cartographer",3),s("Scout",2)], gear:[g("Satchel"),g("Cloak")] }),
  role({ name:"Ranger Messenger", culture:"dunadan", category:"Ranger", subcategory:"Ranger Support", profile:"ranger", concept:"Fast courier between hidden northern posts", aliases:["ranger courier","dispatch rider"], tags:["message","road","patrol"], skills:[s("Rider",4),s("Pathfinder",3),s("Scout",3)], gear:[g("Dagger"),g("Satchel"),g("Cloak")] }),
  role({ name:"Ranger Armorer", culture:"dunadan", category:"Trade", subcategory:"Ranger Support", profile:"artisan", concept:"Armorer maintaining weapons and mail for the Rangers", aliases:["ranger smith","weaponsmith"], tags:["forge","armor","ranger"], skills:[s("Armorer",4),s("Smith",3),s("Fighter",2)], gear:[g("Hammer")] }),

  // Gondor
  role({ name:"City Guard", culture:"gondor", category:"Military", subcategory:"Garrison", profile:"military", concept:"Professional city or gate guard", aliases:["guard","watchman","garrison"], tags:["city","gate","watch"], skills:[s("Fighter",3),s("Militarist",2),s("Persuader",2)], gear:[g("Spear"),g("Shield"),g("Mail Shirt")] }),
  role({ name:"Soldier", culture:"gondor", category:"Military", subcategory:"Army", profile:"military", concept:"Line soldier of Gondor", aliases:["infantry","man-at-arms"], tags:["army","war","infantry"], skills:[s("Fighter",3),s("Militarist",3),s("Scout",2)], gear:[g("Sword"),g("Shield"),g("Mail Shirt")] }),
  role({ name:"Archer", culture:"gondor", category:"Military", subcategory:"Army", profile:"military", concept:"Military bowman or wall archer", aliases:["bowman","longbowman"], tags:["bow","archery","army"], skills:[s("Fighter",3),s("Scout",3),s("Hunter",2)], gear:[g("Bow"),g("Dagger"),g("Leather Armor")] }),
  role({ name:"Captain", culture:"gondor", category:"Military", subcategory:"Command", profile:"leader", concept:"Experienced officer commanding soldiers", aliases:["officer","commander"], tags:["captain","command","army"], skills:[s("Militarist",4),s("Fighter",4),s("Orator",3),s("Administrator",2)], gear:[g("Sword"),g("Shield"),g("Mail Shirt"),g("Helmet")] }),
  role({ name:"Steward's Clerk", culture:"gondor", category:"Social", subcategory:"Administration", profile:"social", concept:"Administrative clerk or official servant", aliases:["clerk","official","administrator"], tags:["records","government","court"], skills:[s("Administrator",4),s("Archivist",3),s("Persuader",2)] }),
  role({ name:"Archivist", culture:"gondor", category:"Learned", subcategory:"Records", profile:"scholar", concept:"Keeper of chronicles, maps and official records", aliases:["record keeper","scribe"], tags:["library","records","history"], skills:[s("Archivist",4),s("Lore Master",3),s("Cartographer",2)] }),
  role({ name:"Healer", culture:"gondor", category:"Learned", subcategory:"Healing", profile:"scholar", concept:"Trained healer from a town, fortress or house of healing", aliases:["physician","medic"], tags:["medicine","wounds","herbs"], skills:[s("Healer",4),s("Lore Master",3)], gear:[g("Healing Herbs"),g("Satchel")] }),
  role({ name:"Noble", culture:"gondor", category:"Social", subcategory:"Nobility", profile:"noble", concept:"Landed noble, courtier or household lord", aliases:["lord","lady","courtier"], tags:["court","wealth","authority"], skills:[s("Orator",4),s("Persuader",4),s("Administrator",3),s("Haggler",2)] }),
  role({ name:"Merchant", culture:"gondor", category:"Social", subcategory:"Commerce", profile:"social", concept:"Prosperous southern merchant", aliases:["trader","factor"], tags:["trade","market","caravan"], skills:[s("Haggler",4),s("Administrator",3),s("Persuader",3)] }),
  role({ name:"Shipwright", culture:"gondor", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Builder and repairer of boats and ships", aliases:["boatbuilder","dockyard worker"], tags:["ship","boat","river","coast"], skills:[s("Boatcrafter",4),s("Carpenter",3),s("Laborer",2)] }),

  // Rohan
  role({ name:"Rider", culture:"rohan", category:"Military", subcategory:"Cavalry", profile:"military", concept:"Mounted warrior of the Riddermark", aliases:["horse warrior","cavalryman"], tags:["horse","cavalry","mark"], skills:[s("Rider",4),s("Fighter",3),s("Animal Handler",3),s("Scout",2)], gear:[g("Spear"),g("Shield"),g("Sword")] }),
  role({ name:"Outrider", culture:"rohan", category:"Military", subcategory:"Cavalry", profile:"wilderness", concept:"Mounted scout ranging ahead of a warband", aliases:["mounted scout","horse scout"], tags:["horse","scout","patrol"], skills:[s("Rider",4),s("Scout",4),s("Pathfinder",3),s("Fighter",2)], gear:[g("Spear"),g("Bow")] }),
  role({ name:"Horse Breeder", culture:"rohan", category:"Trade", subcategory:"Animals", profile:"artisan", concept:"Breeder and trainer of horses", aliases:["horse trainer","stablemaster"], tags:["horse","stable","breeder"], skills:[s("Animal Handler",4),s("Rider",3),s("Herdsman",3)] }),
  role({ name:"Herdsman", culture:"rohan", category:"Civilian", subcategory:"Rural", profile:"laborer", concept:"Keeper of herds on the plains", aliases:["shepherd","herder"], tags:["herd","plains","livestock"], skills:[s("Herdsman",3),s("Animal Handler",3),s("Weather Watcher",2)] }),
  role({ name:"Village Smith", culture:"rohan", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Smith serving riders, farmers and households", aliases:["blacksmith","farrier"], tags:["forge","horse","weapons"], skills:[s("Smith",3),s("Armorer",3),s("Animal Handler",2)] }),
  role({ name:"Thane", culture:"rohan", category:"Social", subcategory:"Nobility", profile:"noble", concept:"Local lord or household leader", aliases:["lord","chieftain"], tags:["leader","hall","authority"], skills:[s("Orator",4),s("Militarist",3),s("Persuader",3),s("Rider",3)] }),
  role({ name:"Scout", culture:"rohan", category:"Wilderness", subcategory:"Border", profile:"wilderness", concept:"Border scout travelling by horse and foot", aliases:["border scout","lookout"], tags:["border","horse","watch"], skills:[s("Scout",4),s("Rider",3),s("Pathfinder",3),s("Hunter",2)], gear:[g("Bow"),g("Dagger")] }),
  role({ name:"Healer", culture:"rohan", category:"Learned", subcategory:"Healing", profile:"scholar", concept:"Herb-wise healer of village or hall", aliases:["wise woman","medic"], tags:["medicine","herbs","hall"], skills:[s("Healer",4),s("Lore Master",2),s("Herdsman",2)], gear:[g("Healing Herbs")] }),

  // Dwarves
  role({ name:"Smith", culture:"dwarf", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Dwarven metalworker and forge master", aliases:["blacksmith","forge master"], tags:["forge","metal","dwarf"], skills:[s("Smith",4),s("Armorer",3),s("Stonemason",2)], gear:[g("Hammer")] }),
  role({ name:"Armorer", culture:"dwarf", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Dwarven maker of mail, helms and weapons", aliases:["armourer","weaponsmith"], tags:["armor","mail","forge"], skills:[s("Armorer",4),s("Smith",4)], gear:[g("Hammer")] }),
  role({ name:"Stonemason", culture:"dwarf", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Dwarven stone cutter, builder and delver", aliases:["mason","stoneworker"], tags:["stone","delving","hall"], skills:[s("Stonemason",4),s("Laborer",3),s("Cartographer",2)] }),
  role({ name:"Miner", culture:"dwarf", category:"Trade", subcategory:"Delving", profile:"laborer", concept:"Miner and underground prospector", aliases:["delver","prospector"], tags:["mine","tunnel","ore"], skills:[s("Laborer",4),s("Stonemason",3),s("Cartographer",2)] }),
  role({ name:"Tunnel Scout", culture:"dwarf", category:"Wilderness", subcategory:"Delving", profile:"wilderness", concept:"Scout of mines, tunnels and ruins", aliases:["delve scout","underground scout"], tags:["tunnel","ruin","mine"], skills:[s("Scout",4),s("Pathfinder",3),s("Cartographer",3),s("Fighter",2)], gear:[g("Axe"),g("Lantern")] }),
  role({ name:"Merchant", culture:"dwarf", category:"Social", subcategory:"Commerce", profile:"social", concept:"Dwarven trader in crafted goods and metalwork", aliases:["trader","factor"], tags:["trade","craft","caravan"], skills:[s("Haggler",4),s("Administrator",3),s("Smith",2)] }),
  role({ name:"Guard", culture:"dwarf", category:"Military", subcategory:"Guard", profile:"military", concept:"Armoured guard of a hall, caravan or gate", aliases:["hall guard","shield dwarf"], tags:["guard","hall","gate"], skills:[s("Fighter",4),s("Militarist",2),s("Scout",2)], gear:[g("Axe"),g("Shield"),g("Mail Shirt"),g("Helmet")] }),
  role({ name:"Lorekeeper", culture:"dwarf", category:"Learned", subcategory:"Lore", profile:"scholar", concept:"Keeper of lineage, runes and craft-lore", aliases:["rune keeper","historian"], tags:["runes","history","craft"], skills:[s("Lore Master",4),s("Archivist",3),s("Stonemason",2)] }),

  // Elves
  role({ name:"Woodland Scout", culture:"elf", category:"Wilderness", subcategory:"Forest", profile:"wilderness", concept:"Silent scout of woodland paths and borders", aliases:["elf scout","forest scout"], tags:["forest","stealth","border"], skills:[s("Scout",4),s("Pathfinder",4),s("Hunter",3),s("Survivalist",3)], gear:[g("Bow"),g("Dagger"),g("Cloak")] }),
  role({ name:"Archer", culture:"elf", category:"Military", subcategory:"Guard", profile:"military", concept:"Elven bowman guarding woodland realms", aliases:["elf bowman","bow guard"], tags:["bow","forest","guard"], skills:[s("Fighter",4),s("Scout",4),s("Hunter",3)], gear:[g("Bow"),g("Dagger")] }),
  role({ name:"Healer", culture:"elf", category:"Learned", subcategory:"Healing", profile:"scholar", concept:"Elven healer versed in herbs and old lore", aliases:["elf healer"], tags:["medicine","herbs","lore"], skills:[s("Healer",4),s("Lore Master",4),s("Survivalist",2)], gear:[g("Healing Herbs")] }),
  role({ name:"Lorekeeper", culture:"elf", category:"Learned", subcategory:"Lore", profile:"scholar", concept:"Keeper of songs, histories and ancient memory", aliases:["elf loremaster","sage"], tags:["history","song","ancient"], skills:[s("Lore Master",5),s("Archivist",3),s("Orator",2)] }),
  role({ name:"Messenger", culture:"elf", category:"Wilderness", subcategory:"Travel", profile:"wilderness", concept:"Swift messenger between hidden refuges", aliases:["elf courier"], tags:["message","forest","path"], skills:[s("Pathfinder",4),s("Scout",4),s("Rider",2)], gear:[g("Satchel"),g("Cloak")] }),
  role({ name:"Craftsman", culture:"elf", category:"Trade", subcategory:"Craft", profile:"artisan", concept:"Elven artisan of wood, cloth or fine objects", aliases:["elf artisan","maker"], tags:["craft","wood","cloth"], skills:[s("Carpenter",3),s("Weaver",3),s("Lore Master",2)] }),
  role({ name:"Envoy", culture:"elf", category:"Social", subcategory:"Diplomacy", profile:"social", concept:"Elven messenger or diplomatic representative", aliases:["diplomat","emissary"], tags:["diplomacy","court","message"], skills:[s("Persuader",4),s("Orator",4),s("Lore Master",3)] }),
  role({ name:"Guardian", culture:"elf", category:"Military", subcategory:"Guard", profile:"military", concept:"Experienced defender of a hidden refuge", aliases:["elf guard","sentinel"], tags:["guard","refuge","forest"], skills:[s("Fighter",4),s("Scout",3),s("Militarist",2)], gear:[g("Sword"),g("Bow")] }),

  // Hobbits
  role({ name:"Farmer", culture:"hobbit", category:"Civilian", subcategory:"Rural", profile:"laborer", concept:"Shire farmer or gardener", aliases:["gardener","farmhand"], tags:["shire","garden","crop"], skills:[s("Farmer",4),s("Cook",2),s("Weather Watcher",2)] }),
  role({ name:"Innkeeper", culture:"hobbit", category:"Civilian", subcategory:"Hospitality", concept:"Hobbit innkeeper and keeper of local gossip", aliases:["bartender","publican","tavern keeper"], tags:["inn","ale","rumours"], skills:[s("Haggler",3),s("Cook",3),s("Persuader",2)] }),
  role({ name:"Cook", culture:"hobbit", category:"Trade", subcategory:"Food", profile:"artisan", concept:"Accomplished household or inn cook", aliases:["chef"], tags:["food","kitchen","shire"], skills:[s("Cook",4),s("Baker",3)] }),
  role({ name:"Brewer", culture:"hobbit", category:"Trade", subcategory:"Food", profile:"artisan", concept:"Maker of ales and ciders", aliases:["ale brewer"], tags:["ale","beer","cider"], skills:[s("Brewer",4),s("Haggler",2)] }),
  role({ name:"Bounder", culture:"hobbit", category:"Military", subcategory:"Watch", profile:"military", concept:"Local watchman keeping strangers and trouble in view", aliases:["shire guard","watchman"], tags:["shire","watch","border"], skills:[s("Scout",3),s("Persuader",2),s("Fighter",2)], gear:[g("Staff")] }),
  role({ name:"Post Rider", culture:"hobbit", category:"Civilian", subcategory:"Travel", concept:"Courier carrying post and parcels", aliases:["postman","courier"], tags:["mail","road","pony"], skills:[s("Rider",3),s("Pathfinder",2),s("Haggler",2)], gear:[g("Satchel")] }),
  role({ name:"Mayor's Clerk", culture:"hobbit", category:"Social", subcategory:"Administration", profile:"social", concept:"Local clerk and civic administrator", aliases:["clerk","official"], tags:["records","town","shire"], skills:[s("Administrator",3),s("Archivist",3),s("Persuader",2)] }),
  role({ name:"Peddler", culture:"hobbit", category:"Civilian", subcategory:"Commerce", concept:"Travelling seller of household goods", aliases:["hawker","trader"], tags:["trade","road","shire"], skills:[s("Haggler",3),s("Persuader",2),s("Pathfinder",2)], gear:[g("Backpack")] }),

  // Other peoples
  role({ name:"Clan Warrior", culture:"dunland", category:"Military", subcategory:"Warband", profile:"military", concept:"Hill-clan warrior or raider", aliases:["hillman warrior","tribal warrior"], tags:["hill","clan","warband"], skills:[s("Fighter",4),s("Survivalist",3),s("Hunter",2)], gear:[g("Axe"),g("Shield"),g("Leather Armor")] }),
  role({ name:"Hill Scout", culture:"dunland", category:"Wilderness", subcategory:"Hills", profile:"wilderness", concept:"Scout and hunter of rough hill country", aliases:["hillman scout","tracker"], tags:["hill","track","wilds"], skills:[s("Scout",4),s("Hunter",3),s("Pathfinder",3)], gear:[g("Bow"),g("Knife")] }),
  role({ name:"Clan Elder", culture:"dunland", category:"Social", subcategory:"Community", profile:"social", concept:"Respected elder or clan speaker", aliases:["chieftain","elder"], tags:["clan","leader","tradition"], skills:[s("Orator",4),s("Persuader",3),s("Lore Master",2)] }),
  role({ name:"Woodman Hunter", culture:"northman", category:"Wilderness", subcategory:"Forest", profile:"wilderness", concept:"Forest hunter and trail finder", aliases:["woodsman","forest hunter"], tags:["forest","hunt","trail"], skills:[s("Hunter",4),s("Scout",3),s("Survivalist",3),s("Pathfinder",2)], gear:[g("Bow"),g("Knife")] }),
  role({ name:"Woodman Guide", culture:"northman", category:"Wilderness", subcategory:"Forest", profile:"wilderness", concept:"Guide through deep woodland and river country", aliases:["forest guide","pathfinder"], tags:["forest","guide","road"], skills:[s("Pathfinder",4),s("Survivalist",3),s("Scout",3)], gear:[g("Staff"),g("Backpack")] }),
  role({ name:"Caravan Guard", culture:"harad", category:"Military", subcategory:"Caravan", profile:"military", concept:"Guard protecting merchants and travellers", aliases:["mercenary guard","escort"], tags:["caravan","road","guard"], skills:[s("Fighter",4),s("Scout",2),s("Rider",2)], gear:[g("Spear"),g("Shield"),g("Leather Armor")] }),
  role({ name:"Merchant", culture:"harad", category:"Social", subcategory:"Commerce", profile:"social", concept:"Long-distance merchant and caravan factor", aliases:["trader","caravan merchant"], tags:["caravan","trade","south"], skills:[s("Haggler",4),s("Persuader",3),s("Administrator",2)] }),
  role({ name:"Scout", culture:"easterling", category:"Military", subcategory:"Warband", profile:"wilderness", concept:"Eastern scout and skirmisher", aliases:["eastern scout","outrider"], tags:["east","scout","warband"], skills:[s("Scout",4),s("Rider",3),s("Fighter",3),s("Pathfinder",2)], gear:[g("Bow"),g("Sword")] }),
  role({ name:"Warrior", culture:"easterling", category:"Military", subcategory:"Warband", profile:"military", concept:"Armoured warrior serving an eastern host", aliases:["soldier","raider"], tags:["east","war","soldier"], skills:[s("Fighter",4),s("Militarist",3),s("Rider",2)], gear:[g("Sword"),g("Shield"),g("Mail Shirt")] }),

  // Travellers, outsiders and specialists
  role({ name:"Pilgrim", culture:"bree", category:"Civilian", subcategory:"Travel", concept:"Religious or personal traveller on a long road", aliases:["traveller","wayfarer"], tags:["road","travel","stranger"], skills:[s("Pathfinder",2),s("Persuader",2),s("Survivalist",2)], gear:[g("Staff"),g("Backpack")] }),
  role({ name:"Refugee", culture:"bree", category:"Civilian", subcategory:"Travel", profile:"laborer", concept:"Displaced traveller seeking safety", aliases:["displaced person","fugitive family"], tags:["road","survivor","shelter"], skills:[s("Survivalist",2),s("Persuader",2),s("Laborer",2)], gear:[g("Backpack")] }),
  role({ name:"Wanderer", culture:"bree", category:"Wilderness", subcategory:"Travel", profile:"wilderness", concept:"Independent traveller living by road and camp", aliases:["drifter","wayfarer"], tags:["road","camp","stranger"], skills:[s("Pathfinder",3),s("Survivalist",3),s("Scout",2)], gear:[g("Staff"),g("Backpack")] }),
  role({ name:"Guide", culture:"bree", category:"Wilderness", subcategory:"Travel", profile:"wilderness", concept:"Paid local guide through roads and wild country", aliases:["local guide","trail guide"], tags:["guide","road","trail"], skills:[s("Pathfinder",4),s("Scout",3),s("Survivalist",3)], gear:[g("Staff"),g("Backpack")] }),
  role({ name:"Hunter", culture:"bree", category:"Wilderness", subcategory:"Wilds", profile:"wilderness", concept:"Hunter, trapper and provider", aliases:["game hunter","trapper"], tags:["hunt","forest","game"], skills:[s("Hunter",4),s("Scout",3),s("Survivalist",3)], gear:[g("Bow"),g("Knife")] }),
  role({ name:"Tracker", culture:"bree", category:"Wilderness", subcategory:"Wilds", profile:"wilderness", concept:"Tracker hired to follow people, beasts or raiders", aliases:["trail finder","pursuer"], tags:["track","trail","hunt"], skills:[s("Scout",4),s("Hunter",4),s("Pathfinder",3)], gear:[g("Bow"),g("Knife")] }),
  role({ name:"Animal Handler", culture:"bree", category:"Trade", subcategory:"Animals", profile:"artisan", concept:"Trainer and handler of horses, hounds or livestock", aliases:["trainer","beast handler"], tags:["animal","horse","hound"], skills:[s("Animal Handler",4),s("Herdsman",2),s("Rider",2)] }),
  role({ name:"Cartographer", culture:"bree", category:"Learned", subcategory:"Maps", profile:"scholar", concept:"Maker and reader of maps", aliases:["mapmaker","surveyor"], tags:["map","road","survey"], skills:[s("Cartographer",4),s("Pathfinder",3),s("Archivist",2)], gear:[g("Satchel")] }),
  role({ name:"Instructor", culture:"bree", category:"Learned", subcategory:"Education", profile:"scholar", concept:"Teacher, trainer or learned tutor", aliases:["teacher","tutor"], tags:["training","school","mentor"], skills:[s("Instructor",4),s("Lore Master",3),s("Persuader",2)] }),
  role({ name:"Alchemist", culture:"gondor", category:"Learned", subcategory:"Craft", profile:"scholar", concept:"Scholar of compounds, remedies and strange substances", aliases:["apothecary","chemist"], tags:["alchemy","medicine","laboratory"], skills:[s("Alchemist",4),s("Healer",2),s("Lore Master",3)] }),
  role({ name:"Diplomat", culture:"gondor", category:"Social", subcategory:"Diplomacy", profile:"social", concept:"Envoy, negotiator or representative", aliases:["envoy","emissary","negotiator"], tags:["court","treaty","politics"], skills:[s("Persuader",4),s("Orator",4),s("Administrator",3)] }),
  role({ name:"Herald", culture:"gondor", category:"Social", subcategory:"Diplomacy", profile:"social", concept:"Official messenger and public speaker", aliases:["announcer","emissary"], tags:["message","court","ceremony"], skills:[s("Orator",4),s("Persuader",3),s("Rider",2)] }),
  role({ name:"Priest", culture:"gondor", category:"Social", subcategory:"Faith", profile:"social", concept:"Keeper of rites, counsel and community tradition", aliases:["holy person","chaplain","ritual keeper"], tags:["rites","counsel","community"], skills:[s("Orator",3),s("Lore Master",3),s("Healer",2)] }),
  role({ name:"Servant", culture:"gondor", category:"Civilian", subcategory:"Household", concept:"Household servant, attendant or retainer", aliases:["attendant","retainer","maid","valet"], tags:["household","court","service"], skills:[s("Laborer",2),s("Persuader",2),s("Cook",2)] }),
  role({ name:"Bodyguard", culture:"gondor", category:"Military", subcategory:"Protection", profile:"military", concept:"Personal guard for a notable or official", aliases:["protector","escort"], tags:["guard","escort","noble"], skills:[s("Fighter",4),s("Scout",3),s("Militarist",2)], gear:[g("Sword"),g("Shield"),g("Mail Shirt")] }),
  role({ name:"Mercenary", culture:"bree", category:"Military", subcategory:"Hireling", profile:"military", concept:"Professional sword for hire", aliases:["sell-sword","hired blade"], tags:["hireling","guard","war"], skills:[s("Fighter",4),s("Scout",2),s("Haggler",2)], gear:[g("Sword"),g("Shield"),g("Leather Armor")] }),
  role({ name:"Prisoner", culture:"bree", category:"Civilian", subcategory:"Captive", profile:"laborer", concept:"Captive, accused criminal or political prisoner", aliases:["captive","gaol prisoner"], tags:["jail","captive","chains"], skills:[s("Laborer",2),s("Persuader",2),s("Deceiver",2)] }),

  // Criminals and threats among Men
  role({ name:"Bandit", culture:"bree", category:"Criminal", subcategory:"Outlaw", profile:"criminal", concept:"Roadside robber and outlaw", aliases:["highwayman","road robber"], tags:["road","ambush","outlaw"], skills:[s("Fighter",3),s("Scout",3),s("Deceiver",2)], gear:[g("Axe"),g("Leather Armor")] }),
  role({ name:"Brigand", culture:"bree", category:"Criminal", subcategory:"Outlaw", profile:"criminal", concept:"Armed brigand or raider", aliases:["raider","outlaw"], tags:["raid","road","camp"], skills:[s("Fighter",4),s("Scout",3),s("Hunter",2)], gear:[g("Sword"),g("Shield"),g("Leather Armor")] }),
  role({ name:"Thief", culture:"bree", category:"Criminal", subcategory:"Crime", profile:"criminal", concept:"Sneak thief, burglar or pickpocket", aliases:["burglar","pickpocket","robber"], tags:["steal","town","crime"], skills:[s("Scout",4),s("Deceiver",3),s("Haggler",2)], gear:[g("Knife")] }),
  role({ name:"Smuggler", culture:"bree", category:"Criminal", subcategory:"Crime", profile:"criminal", concept:"Mover of illicit goods across roads and borders", aliases:["contraband runner","black market trader"], tags:["contraband","road","trade"], skills:[s("Deceiver",4),s("Haggler",3),s("Pathfinder",3)], gear:[g("Dagger"),g("Satchel")] }),
  role({ name:"Poacher", culture:"bree", category:"Criminal", subcategory:"Wilds", profile:"wilderness", concept:"Illegal hunter avoiding local authority", aliases:["illegal hunter"], tags:["hunt","forest","outlaw"], skills:[s("Hunter",4),s("Scout",4),s("Deceiver",2)], gear:[g("Bow"),g("Knife")] }),
  role({ name:"Fence", culture:"bree", category:"Criminal", subcategory:"Crime", profile:"social", concept:"Dealer in stolen goods and underworld information", aliases:["receiver","black market dealer"], tags:["stolen goods","crime","contact"], skills:[s("Haggler",4),s("Deceiver",4),s("Persuader",2)] }),
  role({ name:"Assassin", culture:"shadow", category:"Criminal", subcategory:"Killer", profile:"criminal", concept:"Stealthy hired killer or dark agent", aliases:["killer","murderer","hired knife"], tags:["stealth","murder","agent"], skills:[s("Fighter",4),s("Scout",4),s("Hunter",3),s("Deceiver",3)], gear:[g("Dagger"),g("Bow")] }),
  role({ name:"Spy", culture:"shadow", category:"Criminal", subcategory:"Agent", profile:"social", concept:"Covert agent gathering secrets and manipulating trust", aliases:["agent","infiltrator","informant"], tags:["secrets","infiltration","deception"], skills:[s("Deceiver",4),s("Persuader",4),s("Scout",3),s("Haggler",2)], gear:[g("Dagger")] }),
  role({ name:"Deserter", culture:"gondor", category:"Criminal", subcategory:"Outlaw", profile:"military", concept:"Former soldier hiding from authority", aliases:["runaway soldier","renegade"], tags:["soldier","fugitive","outlaw"], skills:[s("Fighter",3),s("Scout",3),s("Deceiver",2)], gear:[g("Sword"),g("Leather Armor")] }),
  role({ name:"Cultist", culture:"shadow", category:"Shadow", subcategory:"Cult", profile:"social", concept:"Secret follower of a dark power or forbidden master", aliases:["dark cultist","secret worshipper"], tags:["cult","ritual","spy"], skills:[s("Deceiver",4),s("Orator",3),s("Lore Master",3)], gear:[g("Dagger")] }),
  role({ name:"Corrupt Official", culture:"bree", category:"Criminal", subcategory:"Corruption", profile:"social", concept:"Official abusing office for coin or influence", aliases:["crooked official","corrupt reeve"], tags:["bribe","authority","crime"], skills:[s("Administrator",3),s("Deceiver",4),s("Haggler",3)] }),
  role({ name:"Bounty Hunter", culture:"bree", category:"Criminal", subcategory:"Hunter", profile:"wilderness", concept:"Tracker paid to find fugitives or debtors", aliases:["manhunter","pursuer"], tags:["hunt","track","capture"], skills:[s("Hunter",4),s("Scout",4),s("Fighter",3),s("Haggler",2)], gear:[g("Bow"),g("Sword")] }),

  // Orcs / Shadow servants
  role({ name:"Scout", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"shadow", concept:"Orc scout and skirmisher", aliases:["goblin scout","orc skirmisher"], tags:["scout","ambush","warband"], skills:[s("Scout",4),s("Fighter",3),s("Pathfinder",3),s("Hunter",3)], gear:[g("Bow"),g("Dagger")] }),
  role({ name:"Warrior", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"shadow", concept:"Orc infantry fighter", aliases:["orc soldier","goblin warrior"], tags:["warrior","infantry","warband"], skills:[s("Fighter",4),s("Hunter",3),s("Scout",2)], gear:[g("Axe"),g("Shield"),g("Leather Armor")] }),
  role({ name:"Archer", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"shadow", concept:"Orc bowman and ambusher", aliases:["orc bowman","goblin archer"], tags:["bow","ambush","warband"], skills:[s("Fighter",3),s("Scout",4),s("Hunter",3)], gear:[g("Bow"),g("Dagger")] }),
  role({ name:"Tracker", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"shadow", concept:"Orc tracker hunting enemies through rough country", aliases:["orc hunter","orc bloodhound"], tags:["track","hunt","pursuit"], skills:[s("Hunter",4),s("Scout",4),s("Pathfinder",3),s("Fighter",2)], gear:[g("Bow"),g("Knife")] }),
  role({ name:"Brute", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"leader", concept:"Large brutal Orc used to break resistance", aliases:["big orc","heavy orc","orc bruiser"], tags:["big","brute","strong"], skills:[s("Fighter",5),s("Laborer",3),s("Hunter",2)], gear:[g("Axe"),g("Shield"),g("Mail Shirt")] }),
  role({ name:"Captain", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"leader", concept:"Orc captain commanding a warband", aliases:["orc leader","warband captain"], tags:["captain","leader","command"], skills:[s("Fighter",5),s("Militarist",4),s("Orator",3),s("Scout",3)], gear:[g("Sword"),g("Shield"),g("Mail Shirt"),g("Helmet")] }),
  role({ name:"Chieftain", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"leader", concept:"Dominant Orc chieftain ruling through fear", aliases:["orc boss","orc chief"], tags:["chief","boss","leader"], skills:[s("Fighter",5),s("Militarist",4),s("Orator",4),s("Deceiver",3)], gear:[g("Axe"),g("Shield"),g("Mail Shirt"),g("Helmet")] }),
  role({ name:"Taskmaster", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"shadow", concept:"Cruel overseer driving captives and lesser Orcs", aliases:["slavedriver","overseer"], tags:["captives","overseer","cruel"], skills:[s("Orator",3),s("Deceiver",3),s("Fighter",3)], gear:[g("Whip"),g("Dagger")] }),
  role({ name:"Warg Rider", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"shadow", concept:"Mounted Orc raider fighting from a warg", aliases:["orc rider","wolf rider"], tags:["warg","rider","raid"], skills:[s("Rider",4),s("Fighter",4),s("Animal Handler",3),s("Scout",3)], gear:[g("Spear"),g("Bow")] }),
  role({ name:"Torturer", culture:"orc", category:"Shadow", subcategory:"Stronghold", profile:"shadow", concept:"Interrogator and keeper of prisoners", aliases:["jailer","interrogator"], tags:["prison","interrogation","stronghold"], skills:[s("Deceiver",3),s("Persuader",3),s("Fighter",3)], gear:[g("Knife")] }),
  role({ name:"Snaga", culture:"orc", category:"Shadow", subcategory:"Orc Warband", profile:"laborer", concept:"Low-status Orc servant, scavenger or camp labourer", aliases:["lesser orc","goblin servant"], tags:["servant","camp","scavenger"], skills:[s("Laborer",3),s("Scout",2),s("Deceiver",2)], gear:[g("Knife")] }),

  // Undead
  role({ name:"Barrow-wight", culture:"undead", category:"Undead", subcategory:"Haunt", profile:"undead", concept:"Ancient malevolent wight bound to a burial place", aliases:["wight","barrow spirit"], tags:["barrow","tomb","curse"], skills:[s("Fighter",4),s("Deceiver",4),s("Lore Master",3)], gear:[g("Sword")], tiers:"creature" }),
  role({ name:"Restless Dead", culture:"undead", category:"Undead", subcategory:"Haunt", profile:"undead", concept:"Corpse or spirit unable to find rest", aliases:["walking dead","revenant"], tags:["grave","haunt","corpse"], skills:[s("Fighter",3),s("Scout",2)], tiers:"creature" }),
  role({ name:"Shade", culture:"undead", category:"Undead", subcategory:"Spirit", profile:"undead", concept:"Fading hostile spirit or shadowy apparition", aliases:["ghost","spectre","spirit"], tags:["ghost","spirit","fear"], skills:[s("Deceiver",4),s("Scout",4),s("Fighter",2)], tiers:"creature" }),
  role({ name:"Cursed Guardian", culture:"undead", category:"Undead", subcategory:"Guardian", profile:"undead", concept:"Dead guardian still protecting a place or treasure", aliases:["tomb guardian","undead sentinel"], tags:["tomb","guard","curse"], skills:[s("Fighter",4),s("Militarist",2),s("Scout",2)], gear:[g("Sword"),g("Shield")], tiers:"creature" }),

  // Beasts and creatures
  role({ name:"Wolf", culture:"beast", category:"Creature", subcategory:"Beast", profile:"creature", concept:"Wild wolf hunting alone or in a pack", aliases:["wild wolf"], tags:["wolf","pack","predator"], skills:[s("Hunter",4),s("Scout",4),s("Fighter",3)], tiers:"creature" }),
  role({ name:"Warg", culture:"beast", category:"Creature", subcategory:"Shadow Beast", profile:"creature", concept:"Large malicious wolf-creature", aliases:["war wolf","giant wolf"], tags:["warg","wolf","shadow"], skills:[s("Hunter",4),s("Scout",4),s("Fighter",4)], tiers:"creature" }),
  role({ name:"Bear", culture:"beast", category:"Creature", subcategory:"Beast", profile:"creature", concept:"Large wild bear defending territory or young", aliases:["wild bear"], tags:["bear","forest","large"], skills:[s("Fighter",4),s("Hunter",3),s("Scout",2)], tiers:"creature" }),
  role({ name:"Boar", culture:"beast", category:"Creature", subcategory:"Beast", profile:"creature", concept:"Aggressive wild boar", aliases:["wild boar"], tags:["boar","forest","charge"], skills:[s("Fighter",4),s("Hunter",2),s("Scout",2)], tiers:"creature" }),
  role({ name:"Giant Spider", culture:"beast", category:"Creature", subcategory:"Monster", profile:"creature", concept:"Huge venomous spider of dark woods or caves", aliases:["huge spider","monster spider"], tags:["spider","web","poison"], skills:[s("Hunter",5),s("Scout",4),s("Fighter",4)], tiers:"creature" }),
  role({ name:"Cave Troll", culture:"beast", category:"Creature", subcategory:"Troll", profile:"creature", concept:"Massive troll dwelling in caves and ruins", aliases:["troll","big troll"], tags:["troll","cave","huge"], skills:[s("Fighter",5),s("Laborer",4),s("Hunter",2)], gear:[g("Club")], tiers:"creature" }),
  role({ name:"Hill Troll", culture:"beast", category:"Creature", subcategory:"Troll", profile:"creature", concept:"Troll roaming hills and broken country", aliases:["troll","hill giant"], tags:["troll","hill","huge"], skills:[s("Fighter",5),s("Hunter",3),s("Scout",2)], gear:[g("Club")], tiers:"creature" }),
  role({ name:"Bat Swarm", culture:"beast", category:"Creature", subcategory:"Swarm", profile:"creature", concept:"Dense swarm of bats causing panic and confusion", aliases:["bats","bat cloud"], tags:["bat","swarm","cave"], skills:[s("Scout",5),s("Fighter",2)], tiers:"creature" }),
  role({ name:"Serpent", culture:"beast", category:"Creature", subcategory:"Beast", profile:"creature", concept:"Large venomous or constricting serpent", aliases:["snake","giant snake"], tags:["snake","poison","marsh"], skills:[s("Hunter",4),s("Scout",4),s("Fighter",3)], tiers:"creature" }),
  role({ name:"Hound", culture:"beast", category:"Creature", subcategory:"Animal", profile:"creature", concept:"Trained hunting, guard or tracking hound", aliases:["dog","war dog","tracking dog"], tags:["dog","hound","track"], skills:[s("Hunter",4),s("Scout",3),s("Fighter",2)], relationship:["FRIEND","CONTACT"], tiers:"creature" }),
  role({ name:"Horse", culture:"beast", category:"Creature", subcategory:"Animal", profile:"creature", concept:"Riding or war horse", aliases:["riding horse","warhorse"], tags:["horse","mount","riding"], skills:[s("Scout",2),s("Survivalist",2)], relationship:["FRIEND","CONTACT"], tiers:"creature" }),
  role({ name:"Pony", culture:"beast", category:"Creature", subcategory:"Animal", profile:"creature", concept:"Hardy pony used for riding or pack work", aliases:["pack pony"], tags:["pony","mount","pack animal"], skills:[s("Survivalist",2)], relationship:["FRIEND","CONTACT"], tiers:"creature" }),
  role({ name:"Raven", culture:"beast", category:"Creature", subcategory:"Animal", profile:"creature", concept:"Clever raven, wild or unusually well-trained", aliases:["crow","black bird"], tags:["bird","raven","message"], skills:[s("Scout",4),s("Survivalist",2)], relationship:["FRIEND","CONTACT"], tiers:"creature" }),
  role({ name:"Great Eagle", culture:"beast", category:"Creature", subcategory:"Great Beast", profile:"creature", concept:"Great intelligent eagle of the high places", aliases:["eagle","giant eagle"], tags:["eagle","mountain","great beast"], skills:[s("Scout",5),s("Hunter",4),s("Fighter",3)], relationship:["FRIEND","CONTACT"], tiers:"creature" })
]);

function validateSkills(seed) {
  for (const [name] of seed.skills) {
    if (!SKILLS.has(name)) throw new Error(`Quick NPC Library uses non-canonical Realm Guard Skill "${name}" on ${seed.name}.`);
  }
}

function adjustedStats(profile, tier) {
  const base = PROFILES[profile] ?? PROFILES.civilian;
  const bonus = Number(tier.statBonus ?? 0);
  return freeze({
    nature: Math.min(7, base.nature + bonus),
    will: Math.min(6, base.will + (bonus && base.will >= 3 ? 1 : 0)),
    health: Math.min(6, base.health + bonus),
    resources: Math.min(6, base.resources + (bonus && base.resources >= 2 ? 1 : 0)),
    circles: Math.min(6, base.circles + (bonus && base.circles >= 2 ? 1 : 0))
  });
}

function adjustedSkills(skills, tier) {
  return freeze(skills.map(([name, rating], index) => freeze([
    name,
    Math.max(1, Math.min(6, Number(rating ?? 2) + Number(tier.skillBonus ?? 0) + (index === 0 ? Number(tier.topBonus ?? 0) : 0)))
  ])));
}

const DEFAULT_NPC_PORTRAIT_ROOT = "systems/realm-guard/assets/actors/default-npcs";

const ROLE_PORTRAITS = Object.freeze({
  "animal-handler": ["animal-handler.webp", "animal-handler-2.webp"],
  "bandit": ["bandit.webp"],
  "brigand": ["raider.webp"],
  "bounty-hunter": ["hunter.webp"],
  "carpenter": ["carpenter.webp"],
  "cartographer": ["cartographer.webp"],
  "cave-troll": ["cave-troll.webp"],
  "farmer": ["farmer.webp"],
  "guard": ["guard.webp", "guard-2.webp"],
  "city-guard": ["guard.webp", "guard-2.webp"],
  "healer": ["healer.webp", "healer-2.webp"],
  "herbalist": ["healer.webp"],
  "hunter": ["hunter.webp"],
  "innkeeper": ["innkeeper.webp", "innkeeper-2.webp"],
  "mercenary": ["mercenary.webp"],
  "noble": ["noble.webp", "noble-female.webp"],
  "ranger-recruit": ["ranger.webp"],
  "ranger-scout": ["ranger.webp", "ranger-2.webp"],
  "ranger-hunter": ["ranger.webp", "hunter.webp"],
  "ranger-pathfinder": ["ranger.webp", "scout.webp"],
  "ranger-veteran": ["ranger-2.webp", "ranger.webp"],
  "ranger-captain": ["ranger-2.webp"],
  "ranger-healer": ["ranger.webp", "healer.webp"],
  "ranger-lorekeeper": ["ranger-2.webp"],
  "ranger-messenger": ["ranger.webp"],
  "ranger-armorer": ["ranger-2.webp"],
  "scout": ["scout.webp"],
  "smith": ["smith.webp"],
  "village-smith": ["smith.webp"],
  "soldier": ["soldier.webp", "soldier-2.webp", "soldier-3.webp"],
  "stablemaster": ["stablemaster.webp", "stablemaster-2.webp"],
  "stonemason": ["stonemason.webp"],
  "wildman": ["wildman.webp"],
  "clan-warrior": ["wildman.webp", "raider.webp"],
  "hill-scout": ["wildman.webp", "scout.webp"],
  "clan-elder": ["wildman.webp", "human-old-man.webp"],
  "orc-scout": ["orc.webp", "orc-warrior.webp"],
  "orc-warrior": ["orc-warrior.webp", "orc-soldier.webp"],
  "orc-archer": ["orc-archer.webp"],
  "orc-tracker": ["orc.webp", "orc-archer.webp"],
  "orc-brute": ["orc-berserker.webp", "orc-warrior.webp"],
  "orc-captain": ["orc-chieftain.webp", "orc-warrior.webp"],
  "orc-chieftain": ["orc-chieftain.webp"],
  "orc-taskmaster": ["orc-soldier.webp"],
  "orc-warg-rider": ["warg-mount.webp"],
  "orc-torturer": ["orc-berserker.webp"],
  "orc-snaga": ["orc.webp"],
  "barrow-wight": ["wraith.webp"],
  "restless-dead": ["undead.webp"],
  "shade": ["wraith.webp"],
  "cursed-guardian": ["undead.webp", "wraith.webp"],
  "warg": ["warg.webp", "warg-2.webp"],
  "hill-troll": ["hill-troll.webp"],
  "snow-troll": ["snow-troll.webp"],
  "war-troll": ["war-troll.webp"]
});

function portraitPathFor(seed, culture, tier) {
  const key = normalizeQuickNpcSearch(seed.name).replace(/ /g, "-");
  const explicit = ROLE_PORTRAITS[key];
  if (explicit?.length) {
    const tierIndex = tier.key === "veteran" || tier.key === "dire" ? 2 : tier.key === "skilled" || tier.key === "dangerous" ? 1 : 0;
    return `${DEFAULT_NPC_PORTRAIT_ROOT}/${explicit[tierIndex % explicit.length]}`;
  }

  const cultureFallback = {
    dwarf: "dwarf.webp",
    elf: "elf.webp",
    hobbit: "hobbit.webp",
    dunland: "wildman.webp",
    orc: "orc.webp",
    undead: "undead.webp",
    shadow: "mystery.webp",
    beast: "mystery.webp"
  }[culture.key];
  if (cultureFallback) return `${DEFAULT_NPC_PORTRAIT_ROOT}/${cultureFallback}`;

  const category = clean(seed.category).toLowerCase();
  if (category === "ranger") return `${DEFAULT_NPC_PORTRAIT_ROOT}/ranger.webp`;
  if (category === "military") return `${DEFAULT_NPC_PORTRAIT_ROOT}/soldier.webp`;
  if (category === "criminal") return `${DEFAULT_NPC_PORTRAIT_ROOT}/rogue.webp`;
  if (category === "learned") return `${DEFAULT_NPC_PORTRAIT_ROOT}/mystic.webp`;
  if (category === "social") return `${DEFAULT_NPC_PORTRAIT_ROOT}/human-male.webp`;
  if (category === "shadow") return `${DEFAULT_NPC_PORTRAIT_ROOT}/mystery.webp`;
  if (category === "undead") return `${DEFAULT_NPC_PORTRAIT_ROOT}/undead.webp`;

  return `${DEFAULT_NPC_PORTRAIT_ROOT}/human.webp`;
}

function metadataFor(seed, culture, tier, name) {
  const aliases = freeze([...new Set([
    ...seed.aliases,
    ...tier.aliases,
    seed.occupation,
    seed.name,
    culture.label,
    culture.people
  ].map(clean).filter(Boolean))]);
  const tags = freeze([...new Set([
    seed.category,
    seed.subcategory,
    seed.occupation,
    culture.key,
    culture.label,
    culture.people,
    tier.key,
    tier.threat,
    ...culture.tags,
    ...seed.tags
  ].map(normalizeQuickNpcSearch).filter(Boolean))]);
  const searchText = normalizeQuickNpcSearch([
    name, seed.name, seed.occupation, seed.category, seed.subcategory, seed.concept,
    culture.label, culture.people, tier.label, tier.threat, ...aliases, ...tags
  ].join(" "));
  return freeze({
    schemaVersion: QUICK_NPC_SCHEMA_VERSION,
    libraryVersion: QUICK_NPC_LIBRARY_VERSION,
    templateId: `${culture.key}:${normalizeQuickNpcSearch(seed.name).replace(/ /g, "-")}:${tier.key}`,
    category: seed.category,
    subcategory: seed.subcategory,
    people: culture.people,
    culture: culture.label,
    occupation: seed.occupation,
    competence: tier.label,
    threat: tier.threat,
    aliases,
    tags,
    relationshipSuitability: seed.relationship,
    portraitKey: normalizeQuickNpcSearch(seed.name).replace(/ /g, "-"),
    portraitPath: portraitPathFor(seed, culture, tier),
    searchText
  });
}

function buildTemplates() {
  const templates = [];
  for (const seed of ROLE_SEEDS) {
    validateSkills(seed);
    const culture = CULTURES[seed.culture] ?? CULTURES.bree;
    const tiers = seed.tiers === "creature" ? CREATURE_TIERS : TIERS;
    for (const tier of tiers) {
      const name = culture.key === "bree" ? `${seed.name} · ${tier.label}` : `${culture.label} ${seed.name} · ${tier.label}`;
      templates.push(freeze({
        name,
        rank: seed.name,
        concept: seed.concept,
        stats: adjustedStats(seed.profile, tier),
        skills: adjustedSkills(seed.skills, tier),
        gear: seed.gear,
        img: portraitPathFor(seed, culture, tier),
        metadata: metadataFor(seed, culture, tier, name)
      }));
    }
  }
  return freeze(templates);
}

export const QUICK_NPC_TEMPLATE_SPECS = buildTemplates();

export function quickNpcTemplateCount() {
  return QUICK_NPC_TEMPLATE_SPECS.length;
}

export function quickNpcMetadataFromIndex(entry) {
  const meta = entry?.flags?.["realm-guard"]?.npcTemplate ?? {};
  const fallback = {
    schemaVersion: 0,
    libraryVersion: "legacy",
    templateId: clean(entry?._id),
    category: "Legacy",
    subcategory: "",
    people: "",
    culture: "",
    occupation: clean(entry?.system?.rank || entry?.name || "NPC"),
    competence: "",
    threat: "",
    aliases: [],
    tags: [],
    relationshipSuitability: [],
    searchText: normalizeQuickNpcSearch([
      entry?.name,
      entry?.system?.rank,
      entry?.system?.concept
    ].join(" "))
  };
  return freeze({ ...fallback, ...meta, searchText: normalizeQuickNpcSearch(meta.searchText || fallback.searchText) });
}

export function scoreQuickNpcEntry(entry, query = "", filters = {}) {
  const meta = quickNpcMetadataFromIndex(entry);
  if (filters.category && meta.category !== filters.category) return -1;
  if (filters.culture && meta.culture !== filters.culture) return -1;
  if (filters.competence && meta.competence !== filters.competence) return -1;

  const q = normalizeQuickNpcSearch(query);
  if (!q) return 1;

  const tokens = q.split(" ").filter(Boolean);
  const name = normalizeQuickNpcSearch(entry?.name);
  const occupation = normalizeQuickNpcSearch(meta.occupation);
  const aliases = normalizeQuickNpcSearch((meta.aliases ?? []).join(" "));
  const tags = normalizeQuickNpcSearch((meta.tags ?? []).join(" "));
  const culture = normalizeQuickNpcSearch(`${meta.culture} ${meta.people}`);
  const concept = normalizeQuickNpcSearch(entry?.system?.concept);
  const haystack = normalizeQuickNpcSearch(`${meta.searchText} ${name} ${occupation} ${aliases} ${tags} ${culture} ${concept}`);

  if (!tokens.every(token => haystack.includes(token))) return -1;

  let score = 0;
  if (name === q) score += 100;
  if (name.startsWith(q)) score += 40;
  if (occupation === q) score += 35;
  if (occupation.includes(q)) score += 24;
  if (aliases.includes(q)) score += 20;
  if (culture.includes(q)) score += 12;
  if (tags.includes(q)) score += 10;
  if (concept.includes(q)) score += 8;
  score += tokens.reduce((sum, token) => sum
    + (name.includes(token) ? 8 : 0)
    + (occupation.includes(token) ? 7 : 0)
    + (aliases.includes(token) ? 6 : 0)
    + (culture.includes(token) ? 5 : 0)
    + (tags.includes(token) ? 4 : 0)
    + (concept.includes(token) ? 3 : 0), 0);
  return score;
}
