const SCALE_SOURCE = "Realm Guard v1.6";
const SCALE_MIN = 1;
const SCALE_MAX = 6;

export const STRICT_SCALE_RANKS = Object.freeze({
  1: Object.freeze(["Hobbit","Goblin","Great Bat","Wolf"]),
  2: Object.freeze(["Man","Dwarf","Orc","Spider","Warg","Horse","Mearh"]),
  3: Object.freeze(["Elf","Dúnadan","Torog","Great Eagle","Uruk-hai"]),
  4: Object.freeze(["Cave-Troll","Olog-hai","Winged Beast"]),
  5: Object.freeze(["Mûmak","Ent","Wight"]),
  6: Object.freeze(["Balrog","Dragon","Kraken"])
});

const ALIASES = Object.freeze(new Map([
  ["dunadan","Dúnadan"],
  ["dúnadan","Dúnadan"],
  ["dunedain","Dúnadan"],
  ["dúnedain","Dúnadan"],
  ["human","Man"],
  ["men","Man"],
  ["dwarves","Dwarf"],
  ["elves","Elf"],
  ["hobbits","Hobbit"],
  ["orcs","Orc"],
  ["goblins","Goblin"],
  ["wargs","Warg"],
  ["spiders","Spider"],
  ["uruk","Uruk-hai"],
  ["uruk hai","Uruk-hai"],
  ["uruk-hai","Uruk-hai"],
  ["great eagle","Great Eagle"],
  ["great eagles","Great Eagle"],
  ["cave troll","Cave-Troll"],
  ["cave-troll","Cave-Troll"],
  ["olog hai","Olog-hai"],
  ["olog-hai","Olog-hai"],
  ["winged beast","Winged Beast"],
  ["great bat","Great Bat"],
  ["mumak","Mûmak"],
  ["mûmak","Mûmak"],
  ["mumakil","Mûmak"],
  ["mûmakil","Mûmak"],
  ["mearas","Mearh"]
]));

function norm(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[’']/g,"'").replace(/\s+/g," ");
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function clampRank(value) {
  const rank = Math.trunc(Number(value ?? 0));
  return Number.isFinite(rank) && rank >= SCALE_MIN && rank <= SCALE_MAX ? rank : null;
}

function canonicalCreatureName(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return ALIASES.get(norm(raw)) ?? raw;
}

export function strictScaleRankFor(value) {
  const numeric = clampRank(value);
  if (numeric) return numeric;
  const target = norm(canonicalCreatureName(value));
  for (const [rankText, creatures] of Object.entries(STRICT_SCALE_RANKS)) {
    if (creatures.some(name => norm(name) === target)) return Number(rankText);
  }
  return null;
}

export function strictScaleEntry(value) {
  const name = canonicalCreatureName(value);
  const rank = strictScaleRankFor(name);
  return freeze({
    ok: Boolean(rank),
    input: String(value ?? ""),
    name: rank ? name : "",
    rank,
    source: SCALE_SOURCE,
    manualIfUnknown: !rank
  });
}

export function strictFighterHunterOutcomePlan({ actorRank = null, actorType = "Dúnadan", targetRank = null, targetType = "" } = {}) {
  const fromRank = clampRank(actorRank) ?? strictScaleRankFor(actorType);
  const toRank = clampRank(targetRank) ?? strictScaleRankFor(targetType);
  if (!fromRank || !toRank) {
    return freeze({
      ok:false,
      reasonCode:"UNKNOWN_SCALE_RANK",
      actorRank:fromRank,
      targetRank:toRank,
      source:SCALE_SOURCE,
      liveApplication:false
    });
  }
  const difference = toRank - fromRank;
  return freeze({
    ok:true,
    source:SCALE_SOURCE,
    skillScope:["Fighter","Hunter"],
    actorRank:fromRank,
    targetRank:toRank,
    rankDifference:difference,
    killAllowed:difference <= 1,
    captureAllowed:difference <= 2,
    injureAllowed:difference <= 2,
    runOffAllowed:true,
    tableFictionStillRequired:true,
    liveApplication:false
  });
}

export function strictMilitaristWarPlan({ armyRank = null, armyType = "Man", targetRank = null, targetType = "", forceSize = 0 } = {}) {
  const fromRank = clampRank(armyRank) ?? strictScaleRankFor(armyType);
  const toRank = clampRank(targetRank) ?? strictScaleRankFor(targetType);
  if (!fromRank || !toRank) {
    return freeze({
      ok:false,
      reasonCode:"UNKNOWN_SCALE_RANK",
      armyRank:fromRank,
      targetRank:toRank,
      source:SCALE_SOURCE,
      liveApplication:false
    });
  }
  const difference = toRank - fromRank;
  const force = Math.max(0, Math.trunc(Number(forceSize ?? 0)));
  const specialMilitaristRequired = difference >= 2;
  const minimumForce = specialMilitaristRequired ? 10 ** (difference - 1) : 0;
  return freeze({
    ok:true,
    source:SCALE_SOURCE,
    skill:"Militarist",
    armyRank:fromRank,
    targetRank:toRank,
    rankDifference:difference,
    majorityCreatureTypeDeterminesArmyRank:true,
    specialMilitaristRequired,
    minimumForce,
    forceSize:force,
    eligible:!specialMilitaristRequired || force >= minimumForce,
    reasonCode:!specialMilitaristRequired ? "NORMAL_SCALE_RANGE" : force >= minimumForce ? "FORCE_SUFFICIENT" : "INSUFFICIENT_FORCE",
    liveApplication:false
  });
}

export function strictLoreMasterScalePlan({ baseRank = null, actorType = "Dúnadan", successMargin = 0 } = {}) {
  const rank = clampRank(baseRank) ?? strictScaleRankFor(actorType);
  if (!rank) {
    return freeze({
      ok:false,
      reasonCode:"UNKNOWN_SCALE_RANK",
      source:SCALE_SOURCE,
      liveApplication:false
    });
  }
  const margin = Math.max(0, Math.trunc(Number(successMargin ?? 0)));
  const uncappedEffectiveRank = rank + margin;
  return freeze({
    ok:true,
    source:SCALE_SOURCE,
    skill:"Lore Master",
    opposedBy:"CREATURE_NATURE",
    baseRank:rank,
    successMargin:margin,
    ranksGained:margin,
    uncappedEffectiveRank,
    effectiveRank:Math.min(SCALE_MAX, uncappedEffectiveRank),
    scaleMax:SCALE_MAX,
    liveApplication:false
  });
}

export function strictTokenScaleGuidance({ tokenLevel = 0, applicable = false } = {}) {
  const level = Math.max(0, Math.min(3, Math.trunc(Number(tokenLevel ?? 0))));
  return freeze({
    source:SCALE_SOURCE,
    mode:"MANUAL_GUIDED",
    applicable:Boolean(applicable),
    tokenLevel:level,
    useHighestApplicableToken:true,
    exactNumericAutomation:false,
    level3PublishedExample: level === 3
      ? { effectiveRank:5, sameRankAs:"Ent", conflictOnly:true }
      : null,
    guidance: applicable
      ? "An appropriate Token of Power may raise effective Scale for this conflict. The table confirms fictional applicability; only the published Level 3 Ent-rank example is encoded numerically."
      : "No Scale adjustment is planned until the table confirms that the Token is appropriate to this conflict.",
    liveApplication:false
  });
}

export function getStrictScaleStatus() {
  return freeze({
    phase:"M10A.7",
    source:SCALE_SOURCE,
    mode:"MANUAL_GUIDED",
    liveAuthority:false,
    liveApplication:false,
    scaleMin:SCALE_MIN,
    scaleMax:SCALE_MAX,
    dunadanRank:3,
    ranks:STRICT_SCALE_RANKS,
    fighterHunter:true,
    militarist:true,
    loreMaster:true,
    tokensOfPower:"MANUAL_GUIDED",
    writesActors:false,
    writesItems:false,
    writesWorldSettings:false,
    nextStep:"M10A.8 Profile Activation QA"
  });
}
