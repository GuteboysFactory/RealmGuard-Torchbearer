const SOURCE = "Realm Guard v1.6";

export const REALM_GUARD_STRICT_SCALE_RANKS = Object.freeze({
  1: Object.freeze(["Hobbit", "Goblin", "Great Bat", "Wolf"]),
  2: Object.freeze(["Man", "Dwarf", "Orc", "Spider", "Warg", "Horse", "Mearh"]),
  3: Object.freeze(["Elf", "Dúnadan", "Torog", "Great Eagle", "Uruk-hai"]),
  4: Object.freeze(["Cave-Troll", "Olog-hai", "Winged Beast"]),
  5: Object.freeze(["Mûmak", "Ent", "Wight"]),
  6: Object.freeze(["Balrog", "Dragon", "Kraken"])
});

export const REALM_GUARD_STRICT_SCALE_DEFINITION = Object.freeze({
  id: "realm-guard-scale-of-might",
  name: "Scale of Might",
  domain: "scaleOfMight",
  profileId: "realm-guard-strict",
  source: SOURCE,
  sourceVersion: "1.6",
  rankMin: 1,
  rankMax: 6,
  baseActorKind: "Dúnadan",
  baseRank: 3,
  orderedRanks: REALM_GUARD_STRICT_SCALE_RANKS,
  aliases: Object.freeze({
    dunadan: "Dúnadan",
    "dúnadan": "Dúnadan",
    dunedain: "Dúnadan",
    "dúnedain": "Dúnadan",
    human: "Man",
    men: "Man",
    dwarves: "Dwarf",
    elves: "Elf",
    hobbits: "Hobbit",
    orcs: "Orc",
    goblins: "Goblin",
    wargs: "Warg",
    spiders: "Spider",
    uruk: "Uruk-hai",
    "uruk hai": "Uruk-hai",
    "uruk-hai": "Uruk-hai",
    "great eagle": "Great Eagle",
    "great eagles": "Great Eagle",
    "cave troll": "Cave-Troll",
    "cave-troll": "Cave-Troll",
    "olog hai": "Olog-hai",
    "olog-hai": "Olog-hai",
    "winged beast": "Winged Beast",
    "great bat": "Great Bat",
    mumak: "Mûmak",
    "mûmak": "Mûmak",
    mumakil: "Mûmak",
    "mûmakil": "Mûmak",
    mearas: "Mearh"
  }),
  outcomeRules: Object.freeze({
    skills: Object.freeze(["Fighter", "Hunter"]),
    killMaximumHigherRanks: 1,
    captureMaximumHigherRanks: 2,
    injureMaximumHigherRanks: 2,
    runOffAlwaysAllowed: true
  }),
  groupWar: Object.freeze({
    skill: "Militarist",
    baseActorKind: "Man",
    specialFromDifference: 2,
    minimumForceByDifference: Object.freeze({ 2: 10, 3: 100, 4: 1000, 5: 10000 }),
    majorityCreatureTypeDeterminesArmyRank: true
  }),
  special: Object.freeze({
    mode: "REALM_GUARD_LORE_MASTER",
    skill: "Lore Master",
    opposedBy: "CREATURE_NATURE"
  }),
  effectiveRank: Object.freeze({
    mode: "SUCCESS_MARGIN",
    skill: "Lore Master",
    opposedBy: "CREATURE_NATURE",
    ranksGained: "SUCCESS_MARGIN",
    capAtScaleMaximum: true
  }),
  itemScale: Object.freeze({
    mode: "MANUAL_GUIDED",
    itemType: "Token of Power",
    useHighestApplicable: true,
    exactNumericAutomation: false,
    publishedLevel3Example: Object.freeze({ effectiveRank: 5, sameRankAs: "Ent", conflictOnly: true })
  }),
  alternateReferenceArmyTable: Object.freeze({
    source: "Realm Guard: Rangers of the North",
    status: "ALTERNATE_REFERENCE_NOT_ACTIVE",
    minimumForceByDifference: Object.freeze({ 2: 10, 3: 50, 4: 100, 5: 1000, 6: 10000 })
  }),
  liveApplication: false
});
