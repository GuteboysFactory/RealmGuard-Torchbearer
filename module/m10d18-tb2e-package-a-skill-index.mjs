import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";

/**
 * Literal Skill List index, Dungeoneer's Handbook printed pp.160-176.
 * This is source-reference metadata, NOT an Ob/factor-value engine.
 * No source entry is silently inferred as a player-owned skill.
 * "Smith" is explicitly printed for Armorer yet not a core list skill.
 */
const SKILL_INDEX=freezeTb2e({
  "Alchemist": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Lore Master",
      "Laborer"
    ],
    "factorFamilies": [
      "Vapors & Poisons",
      "Elixirs & Salves",
      "Alchemical Process",
      "Inflammables and Explosives"
    ],
    "sourcePage": 160
  },
  "Arcanist": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Lore Master"
    ],
    "factorFamilies": [
      "Arcanist (spell-specific)"
    ],
    "sourcePage": 161
  },
  "Armorer": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Smith",
      "Laborer"
    ],
    "factorFamilies": [
      "Weapon Crafting",
      "Armor"
    ],
    "sourcePage": 161
  },
  "Carpenter": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Alchemist",
      "Laborer"
    ],
    "factorFamilies": [
      "Carpenter",
      "Boat Building"
    ],
    "sourcePage": 161
  },
  "Cartographer": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Scholar",
      "Pathfinder"
    ],
    "factorFamilies": [
      "Cartography"
    ],
    "sourcePage": 162
  },
  "Commander": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Steward",
      "Orator"
    ],
    "factorFamilies": [
      "Command Unit"
    ],
    "sourcePage": 162
  },
  "Cook": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Alchemist",
      "Laborer"
    ],
    "factorFamilies": [
      "Meal Preparation",
      "Preservation"
    ],
    "sourcePage": 163
  },
  "Criminal": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Scout",
      "Scholar"
    ],
    "factorFamilies": [
      "Criminal"
    ],
    "sourcePage": 163
  },
  "Dungeoneer": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Sapper",
      "Survivalist"
    ],
    "factorFamilies": [
      "Dungeon Delving",
      "Detection"
    ],
    "sourcePage": 164
  },
  "Fighter": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Hunter"
    ],
    "factorFamilies": [
      "Fighter"
    ],
    "sourcePage": 164
  },
  "Haggler": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Manipulator"
    ],
    "factorFamilies": [
      "Haggler"
    ],
    "sourcePage": 165
  },
  "Healer": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Survivalist",
      "Alchemist"
    ],
    "factorFamilies": [
      "Healing",
      "Poultice"
    ],
    "sourcePage": 165
  },
  "Hunter": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Survivalist",
      "Laborer"
    ],
    "factorFamilies": [
      "Stalking",
      "Trapping"
    ],
    "sourcePage": 165
  },
  "Laborer": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Peasant"
    ],
    "factorFamilies": [
      "Labor",
      "Carrying",
      "Hauling"
    ],
    "sourcePage": 166
  },
  "Lore Master": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Arcanist",
      "Theologian"
    ],
    "factorFamilies": [
      "Lore",
      "Aura Reading"
    ],
    "sourcePage": 167
  },
  "Manipulator": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Haggler",
      "Persuader"
    ],
    "factorFamilies": [
      "Prevarication"
    ],
    "sourcePage": 167
  },
  "Mentor": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Persuader"
    ],
    "factorFamilies": [
      "Mentor"
    ],
    "sourcePage": 168
  },
  "Orator": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Manipulator"
    ],
    "factorFamilies": [
      "Orator"
    ],
    "sourcePage": 168
  },
  "Pathfinder": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Scout",
      "Cartographer"
    ],
    "factorFamilies": [
      "Pathfinder"
    ],
    "sourcePage": 168
  },
  "Peasant": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Laborer"
    ],
    "factorFamilies": [
      "Salt of the Earth",
      "Work Is Never Done",
      "Truth Telling"
    ],
    "sourcePage": 169
  },
  "Persuader": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Manipulator"
    ],
    "factorFamilies": [
      "Influence"
    ],
    "sourcePage": 169
  },
  "Rider": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Peasant"
    ],
    "factorFamilies": [
      "Training",
      "Mounted Combat"
    ],
    "sourcePage": 169
  },
  "Ritualist": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Theologian"
    ],
    "factorFamilies": [
      "Officiant",
      "Invocations"
    ],
    "sourcePage": 170
  },
  "Sailor": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Survivalist",
      "Laborer"
    ],
    "factorFamilies": [
      "Sailing"
    ],
    "sourcePage": 171
  },
  "Sapper": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Alchemist",
      "Laborer"
    ],
    "factorFamilies": [
      "Tunneling",
      "Tunnel Traps"
    ],
    "sourcePage": 171
  },
  "Scavenger": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Scout"
    ],
    "factorFamilies": [
      "Scavenging",
      "Foraging"
    ],
    "sourcePage": 172
  },
  "Scholar": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Lore Master",
      "Steward"
    ],
    "factorFamilies": [
      "Scholar",
      "Scribe",
      "Knowledge"
    ],
    "sourcePage": 172
  },
  "Scout": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Pathfinder",
      "Hunter"
    ],
    "factorFamilies": [
      "Stealth",
      "Searching",
      "Detecting Trap"
    ],
    "sourcePage": 173
  },
  "Stonemason": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Laborer"
    ],
    "factorFamilies": [
      "Building",
      "Surveying"
    ],
    "sourcePage": 174
  },
  "Steward": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Scholar",
      "Theologian"
    ],
    "factorFamilies": [
      "Steward",
      "Legal"
    ],
    "sourcePage": 174
  },
  "Survivalist": {
    "beginnersLuckAbility": "HEALTH",
    "suggestedHelp": [
      "Peasant"
    ],
    "factorFamilies": [
      "Making Camp",
      "Survivalist"
    ],
    "sourcePage": 175
  },
  "Theologian": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Scholar",
      "Ritualist"
    ],
    "factorFamilies": [
      "Immortal Renown",
      "Theological"
    ],
    "sourcePage": 176
  },
  "Weaver": {
    "beginnersLuckAbility": "WILL",
    "suggestedHelp": [
      "Laborer",
      "Peasant"
    ],
    "factorFamilies": [
      "Weaving"
    ],
    "sourcePage": 176
  }
});

const lower=v=>String(v??"").trim().toLowerCase();
const response=data=>freezeTb2e({
 phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",mode:"READ_ONLY_SHADOW",
 sourceEvidence:"Dungeoneer's Handbook pp.160-176; Scholar's Guide p.37",
 liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
 itemMutationAllowed:false,rollExecuted:false,resourceSpendCommitted:false,...data
});
const bad=(reasonCode,extra={})=>response({ok:false,reasonCode,...extra});
export function tb2eSkillIndex(){
 return response({ok:true,skillCount:Object.keys(SKILL_INDEX).length,
  fullSuggestedHelpIndexMapped:true,fullFactorValueCatalogueMapped:false,
  skillNames:Object.keys(SKILL_INDEX)});
}
export function tb2eSkillSourceEntry({skillName=""}={}){
 const name=Object.keys(SKILL_INDEX).find(n=>lower(n)===lower(skillName));
 if(!name)return bad("UNKNOWN_TB2E_SKILL",{skillName:String(skillName??"")});
 return response({ok:true,skillName:name,...SKILL_INDEX[name],
  sourcesNotImplemented:["COMPLETE_OBSTACLE_FACTOR_VALUES","PER_SKILL_EQUIPMENT_EXCEPTIONS"],
  factorValuesAutomatic:false});
}
/** Exact suggested Help versus one exceptional GM-approved skill.
 * This is a pure preview, never a permission grant or a Helper eligibility check.
 */
export function tb2eSuggestedHelpSkillPlan({
 testSkillName="",helperSkillName="",gmApprovedAdditionalSkill=false,
 gmApprovedAdditionalSkillCount=0
}={}){
 const entry=tb2eSkillSourceEntry({skillName:testSkillName});
 if(!entry.ok)return bad("UNKNOWN_TEST_SKILL");
 const source=lower(helperSkillName);
 if(!source)return bad("HELPER_SKILL_REQUIRED");
 const suggested=entry.suggestedHelp.find(n=>lower(n)===source);
 const gmCount=Number(gmApprovedAdditionalSkillCount);
 if(!Number.isInteger(gmCount)||gmCount<0||gmCount>1)
  return bad("AT_MOST_ONE_GM_APPROVED_ADDITIONAL_SKILL");
 const knownSkill=Object.keys(SKILL_INDEX).find(n=>lower(n)===source);
 if(suggested)return response({ok:true,testSkillName:entry.skillName,helperSkillName:suggested,
  sourceKind:"SUGGESTED_HELP",sourcePage:entry.sourcePage,
  nonCoreNamedSource:!knownSkill,gmFictionalRelevanceStillRequired:true,
  factorCatalogueMapped:false});
 if(gmApprovedAdditionalSkill===true&&gmCount===1&&knownSkill)
  return response({ok:true,testSkillName:entry.skillName,helperSkillName:knownSkill,
   sourceKind:"GM_APPROVED_ADDITIONAL_HELP",sourcePage:entry.sourcePage,
   gmApprovalPreconfirmed:true,gmFictionalRelevanceStillRequired:true,
   factorCatalogueMapped:false});
 return bad("NOT_LISTED_AS_SUGGESTED_HELP",{testSkillName:entry.skillName,
  helperSkillName:String(helperSkillName??""),suggestedHelp:entry.suggestedHelp,
  gmAdditionalSkillMayBeApproved:true});
}
