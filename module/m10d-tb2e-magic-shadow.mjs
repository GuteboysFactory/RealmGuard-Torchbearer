import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";
import { tb2eCoreDomainAudit } from "./m10d-tb2e-core-source-expansion.mjs";
import { tb2eMagicResult as result } from "./m10d-tb2e-magic-contract.mjs";

export function tb2eMagicShadowStatus(){
 return freezeTb2e({
  phase:"M10D.18_P2.4",profileId:"torchbearer2e",profileVersion:1,
  adapterReady:true,sourceClassification:tb2eCoreDomainAudit("magic")?.status??"VERIFIED",
  mode:"TB2E_MAGIC_READ_ONLY_SHADOW",automation:"SHADOW_ONLY",
  sourceEvidence:["Dungeoneer's Handbook Arcana 89-97",
   "Dungeoneer's Handbook Ritual 98-106","Scholar's Guide Conflicts 79"],
  liveEnabled:false,liveApplication:false,activationAllowed:false,
  actorMutationAllowed:false,itemMutationAllowed:false,
  journalMutationAllowed:false,settingMutationAllowed:false,
  spellMutationAllowed:false,burdenMutationAllowed:false,
  rollExecutionAllowed:false,writes:{actors:0,items:0,journals:0,settings:0},
  boundaries:[
   "MEMORY_PALACE_AND_SPELLBOOK_ONLY_GM_DESCRIBED_CONTENT",
   "SPELL_SPECIFIC_FACTORS_EFFECTS_AND_DURATIONS_MANUAL",
   "FOUR_CAST_MODES_DESCRIPTIVE_NOT_ROLLED",
   "SCROLL_AND_FOLIO_CONSUMPTION_PLANNED_NEVER_COMMITTED",
   "INVOCATION_RELIC_BURDEN_URDR_SHADOW_ONLY",
   "NO_AUTO_CONDITIONS_STIGMATA_DEATH_OR_GEAR_WRITES",
   "MUNDANE_ARMOR_CANNOT_ABSORB_SPELL_OR_INVOCATION_EFFECTS",
   "M11_PAUSED_LEGACY_MIXED_LIVE_AUTHORITY"
  ],
  nextStep:"P2.4 Foundry QA then full 14-domain reconciliation before M11"
 });
}
export function tb2eMagicModel(){
 return result({ok:true,domains:["ARCANA","RITUAL"],
  arcanaTestSkill:"Arcanist",ritualTestSkill:"Ritualist",
  learningSkill:"Lore Master",scribingSkill:"Scholar",
  memorizationSkill:"Lore Master",purificationSkill:"Theologian",
  spellbookFolios:5,
  castingModes:["FIXED","FACTORS","VERSUS","SKILL_SWAP"],
  materialDice:1,focusDice:1,sacramentalDice:1,
  memorySlotCost:"SPELL_CIRCLE",spellbookFolioCost:"SPELL_CIRCLE",
  scrollSingleUse:true,oncePerRoundFreeSpellBetweenRounds:true,
  arcanaRequiresSpeechAndFreeHand:true,ritualRequiresSpeech:true,
  needsPerSpellReferenceForEffects:true,requiresGmAdjudication:true,
  spellsInCombatCannotBeDisarmed:true,
  mundaneArmorCannotAbsorbMagic:true});
}
