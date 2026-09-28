const SOURCE = "Mouse Guard Roleplaying Game (2008 / 1E)";

export const MG1E_NATURAL_ORDER_RANKS = Object.freeze({
  1: Object.freeze(["Insect", "Baby Snake", "Tadpole"]),
  2: Object.freeze(["Young Mouse", "Small Snake", "Small Fish"]),
  3: Object.freeze(["Mouse", "Bat", "Chipmunk", "Young Weasel"]),
  4: Object.freeze(["Star-Nosed Mole", "Weasel", "Mink", "Rabbit", "Flying Squirrel", "Ground Squirrel", "Snake", "Bullfrog"]),
  5: Object.freeze(["Beaver", "Hare", "Skunk", "Porcupine", "Owl", "Whistle Pig"]),
  6: Object.freeze(["Fox", "Badger", "Raccoon", "Marten"]),
  7: Object.freeze(["Coyote", "Otter", "Sable"]),
  8: Object.freeze(["Wolf", "Wolverine", "Deer"]),
  9: Object.freeze(["Black Bear", "Moose"])
});

export const MG1E_NATURAL_ORDER_DEFINITION = Object.freeze({
  id: "mg1e-natural-order",
  name: "Natural Order",
  domain: "naturalOrder",
  profileId: "mg1e",
  source: SOURCE,
  sourceVersion: "2008 / 1E",
  rankMin: 1,
  rankMax: 9,
  baseActorKind: "Mouse",
  baseRank: 3,
  orderedRanks: MG1E_NATURAL_ORDER_RANKS,
  aliases: Object.freeze({
    mice: "Mouse",
    mouse: "Mouse",
    "young mice": "Young Mouse",
    bats: "Bat",
    weasels: "Weasel",
    rabbits: "Rabbit",
    owls: "Owl",
    foxes: "Fox",
    wolves: "Wolf",
    wolverines: "Wolverine",
    deer: "Deer",
    bears: "Black Bear",
    "black bears": "Black Bear",
    moose: "Moose"
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
    baseActorKind: "Mouse",
    specialFromDifference: 2,
    minimumForceByDifference: Object.freeze({ 2: 20, 3: 100, 4: 200, 5: 2000, 6: 20000 }),
    majorityCreatureTypeDeterminesArmyRank: false
  }),
  special: Object.freeze({
    mode: "MG1E_SCIENTIST",
    skill: "Scientist",
    eligibleFromDifference: 2,
    permittedOutcomes: Object.freeze(["CAPTURE", "INJURE"]),
    resourcesObstacle: "TARGET_NATURE",
    conflict: Object.freeze({
      attack: Object.freeze(["Scientist"]),
      maneuver: Object.freeze(["Scientist"]),
      defend: Object.freeze(["APPROPRIATE_CRAFT_OR_TRADE"]),
      feint: Object.freeze(["APPROPRIATE_CRAFT_OR_TRADE"]),
      suggestedCrafts: Object.freeze(["Smith", "Carpenter", "Loremouse"]),
      animalDisposition: "NATURE_PLUS_NATURE",
      animalActions: "NATURE"
    })
  }),
  effectiveRank: Object.freeze({ mode: "NONE" }),
  itemScale: Object.freeze({ mode: "NONE" }),
  liveApplication: false
});
