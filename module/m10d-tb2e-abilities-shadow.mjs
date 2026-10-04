import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const ABILITY_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="abilities");

const WILL_BEGINNERS_LUCK=freezeTb2e([
  "Alchemist","Arcanist","Cartographer","Commander","Cook","Haggler","Healer","Lore Master","Manipulator",
  "Mentor","Orator","Persuader","Ritualist","Scholar","Scout","Steward","Theologian","Weaver"
]);
const HEALTH_BEGINNERS_LUCK=freezeTb2e([
  "Armorer","Carpenter","Criminal","Dungeoneer","Fighter","Hunter","Laborer","Pathfinder","Peasant","Rider",
  "Sailor","Sapper","Scavenger","Stonemason","Survivalist"
]);
const SKILLS=freezeTb2e([...WILL_BEGINNERS_LUCK,...HEALTH_BEGINNERS_LUCK].sort((a,b)=>a.localeCompare(b)));

function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.6",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}
function integer(value){return Number.isInteger(Number(value));}
function nonNegativeInteger(value){return integer(value)&&Number(value)>=0;}
function normalizeName(value){return String(value??"").trim().toLowerCase();}
function canonicalSkill(value){const key=normalizeName(value);return SKILLS.find(name=>name.toLowerCase()===key)??null;}
function canonicalAbility(value){
  const key=normalizeName(value);
  return ({will:"WILL",health:"HEALTH",resources:"RESOURCES",circles:"CIRCLES",precedence:"PRECEDENCE",might:"MIGHT"})[key]??null;
}
function ratingBounds(kind){
  if(["SKILL","WILL","HEALTH"].includes(kind))return {min:1,max:6};
  if(["RESOURCES","CIRCLES"].includes(kind))return {min:0,max:10,normalMin:1,zeroState:true};
  return null;
}

export function tb2eAbilitySkillShadowStatus(){
  return freezeTb2e({
    phase:"M10D.6",mode:"TB2E_ABILITIES_SKILLS_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:ABILITY_ROW?.status??"PARTIAL",
    sourceEvidence:ABILITY_ROW?.evidence??"QR 8-13, 19, 99; CC 7-14",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    actorMutationAllowed:false,itemMutationAllowed:false,advancementMutationAllowed:false,learningMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_DG160_SKILL_DESCRIPTIONS_OR_OBSTACLE_FACTORS",
      "NO_AUTOMATIC_SKILL_PROVISIONING",
      "NO_AUTOMATIC_NEW_SKILL_CREATION",
      "NO_AUTOMATIC_ADVANCEMENT_WRITE",
      "RESOURCES_AND_CIRCLES_SPECIAL_RULES_DEFERRED_TO_THEIR_DOMAINS",
      "PRECEDENCE_AND_MIGHT_REMAIN_FIXED_VALUE_REFERENCES"
    ],
    nextStep:"Verify guide-bounded TB2E ability/skill metadata, Beginner's Luck mapping and learning/threshold plans only"
  });
}

export function tb2eAbilitySkillModel(){
  return freezeTb2e({
    phase:"M10D.6",profileId:PROFILE_ID,
    abilities:{
      WILL:{kind:"RAW",phaseContext:"ADVENTURE",ratingRange:{min:1,max:6},tieUse:"MENTAL_STRENGTH_OR_INSIGHT",recoveryReference:{Anger:2,Fear:3,Sickness:3}},
      HEALTH:{kind:"RAW",phaseContext:"ADVENTURE",ratingRange:{min:1,max:6},tieUse:"PHYSICAL_EXERTION",recoveryReference:{Exhaustion:3,Injury:4}},
      RESOURCES:{kind:"TOWN",phaseContext:"TOWN",ratingRange:{min:0,normalMin:1,max:10},specialRulesDomain:"resources"},
      CIRCLES:{kind:"TOWN",phaseContext:"TOWN",ratingRange:{min:0,normalMin:1,max:10},specialRulesDomain:"circles"},
      PRECEDENCE:{kind:"FIXED_VALUE",tested:"RARE_IF_EVER",automation:"REFERENCE_ONLY"},
      MIGHT:{kind:"FIXED_VALUE",tested:"RARE_IF_EVER",automation:"REFERENCE_ONLY"}
    },
    skills:{maxKnown:24,ratingRange:{min:1,max:6},names:SKILLS,fullDescriptionsAuthority:"UNAVAILABLE_DG160"},
    beginnersLuck:{WILL:WILL_BEGINNERS_LUCK,HEALTH:HEALTH_BEGINNERS_LUCK,resourcesAndCirclesAllowed:false},
    newSkillLearning:{method:"BEGINNERS_LUCK_ATTEMPTS",thresholdBasis:"MAXIMUM_NATURE",learnedRating:2},
    standardAdvancement:{passes:"CURRENT_RATING",fails:"CURRENT_RATING_MINUS_ONE",caps:{SKILL:6,WILL:6,HEALTH:6,RESOURCES:10,CIRCLES:10}},
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eAbilityInfo(name){
  const ability=canonicalAbility(name);
  if(!ability)return blocked("UNKNOWN_ABILITY",{abilityName:String(name??"")});
  return freezeTb2e({ok:true,phase:"M10D.6",profileId:PROFILE_ID,ability,...tb2eAbilitySkillModel().abilities[ability],liveApplication:false,writesPlanned:0});
}

export function tb2eSkillInfo(name){
  const skill=canonicalSkill(name);
  if(!skill)return blocked("UNKNOWN_OR_UNSOURCED_SKILL",{skillName:String(name??"")});
  const mappedAbility=WILL_BEGINNERS_LUCK.includes(skill)?"WILL":"HEALTH";
  return freezeTb2e({
    ok:true,phase:"M10D.6",profileId:PROFILE_ID,skill,ratingRange:{min:1,max:6},beginnersLuckAbility:mappedAbility,
    fullDescriptionAvailable:false,obstacleFactorsAvailable:false,sourceBoundary:"DG160_NOT_SUPPLIED",
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eBeginnersLuckAbilityPlan({skillName="",abilityRating=null}={}){
  const skill=canonicalSkill(skillName);
  if(!skill)return blocked("UNKNOWN_OR_UNSOURCED_SKILL",{skillName:String(skillName??"")});
  const ability=WILL_BEGINNERS_LUCK.includes(skill)?"WILL":"HEALTH";
  if(abilityRating!==null){
    if(!integer(abilityRating)||Number(abilityRating)<0||Number(abilityRating)>6)return blocked("INVALID_BEGINNERS_LUCK_ABILITY_RATING",{ability,abilityRating});
    if(Number(abilityRating)===0)return blocked("ABILITY_ZERO_DUE_TO_INJURY_OR_SICKNESS_OR_OTHER_ZERO_STATE",{ability,abilityRating:0});
  }
  return freezeTb2e({
    ok:true,phase:"M10D.6",profileId:PROFILE_ID,mode:"BEGINNERS_LUCK_ABILITY_MAPPING",
    skill,ability,abilityRating:abilityRating===null?null:Number(abilityRating),
    poolOrderingAuthority:"M10D.4_TESTS_SHADOW",learningTrackRequired:true,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eNewSkillLearningPlan({
  skillName="",
  beginnersLuckAttempts=0,
  maximumNature=0,
  skillAlreadyKnown=false
}={}){
  const skill=canonicalSkill(skillName);
  if(!skill)return blocked("UNKNOWN_OR_UNSOURCED_SKILL",{skillName:String(skillName??"")});
  if(Boolean(skillAlreadyKnown))return blocked("SKILL_ALREADY_PRESENT",{skill});
  if(!nonNegativeInteger(beginnersLuckAttempts))return blocked("INVALID_BEGINNERS_LUCK_ATTEMPTS",{beginnersLuckAttempts});
  if(!integer(maximumNature)||Number(maximumNature)<0||Number(maximumNature)>7)return blocked("INVALID_MAXIMUM_NATURE",{maximumNature});
  if(Number(maximumNature)===0)return blocked("MAXIMUM_NATURE_ZERO_RETIRED_STATE",{maximumNature:0});
  const requiredAttempts=Number(maximumNature);
  const attempts=Number(beginnersLuckAttempts);
  const ready=attempts>=requiredAttempts;
  return freezeTb2e({
    ok:true,phase:"M10D.6",profileId:PROFILE_ID,mode:"NEW_SKILL_LEARNING_SHADOW",
    skill,beginnersLuckAbility:WILL_BEGINNERS_LUCK.includes(skill)?"WILL":"HEALTH",
    attempts,requiredAttempts,remainingAttempts:Math.max(0,requiredAttempts-attempts),ready,
    learnedRating:ready?2:null,thresholdBasis:"MAXIMUM_NATURE",
    skillCreationCommitted:false,learningMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eAdvancementThresholdPlan({kind="SKILL",rating=1}={}){
  const key=String(kind??"SKILL").trim().toUpperCase();
  const bounds=ratingBounds(key);
  if(!bounds)return blocked("UNSUPPORTED_ADVANCEMENT_KIND",{kind:key});
  if(!integer(rating)||Number(rating)<bounds.min||Number(rating)>bounds.max)return blocked("INVALID_ADVANCEMENT_RATING",{kind:key,rating,bounds});
  const value=Number(rating);
  if(["RESOURCES","CIRCLES"].includes(key)&&value===0){
    return freezeTb2e({
      ok:true,phase:"M10D.6",profileId:PROFILE_ID,mode:"ADVANCEMENT_THRESHOLD_SHADOW",kind:key,rating:0,
      route:"ZERO_TO_ONE_SPECIAL",beginnersLuckAllowed:false,requiredPassedTests:1,
      allowedDiceSources:["REPUTATION","HOMETOWN_ADVANTAGE","CASH","LOOT","TREASURE"],
      standardPassFailFormula:false,advancementMutationCommitted:false,liveApplication:false,writesPlanned:0
    });
  }
  const atCap=value===bounds.max;
  return freezeTb2e({
    ok:true,phase:"M10D.6",profileId:PROFILE_ID,mode:"ADVANCEMENT_THRESHOLD_SHADOW",kind:key,rating:value,
    route:"STANDARD_PASS_FAIL",requiredPassedTests:value,requiredFailedTests:Math.max(0,value-1),
    cap:bounds.max,atCap,advanceTo:atCap?null:value+1,resetPassFailAfterAdvance:true,
    advancementMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}
