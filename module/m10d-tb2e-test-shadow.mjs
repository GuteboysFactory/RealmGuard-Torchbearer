import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const TEST_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="tests");

function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.4",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}
function nonNegativeInteger(value){return Number.isInteger(Number(value))&&Number(value)>=0;}
function integer(value){return Number.isInteger(Number(value));}
function validateDice(dice){
  if(!Array.isArray(dice)) return {ok:false,reasonCode:"DICE_ARRAY_REQUIRED"};
  if(dice.some(die=>!Number.isInteger(Number(die))||Number(die)<1||Number(die)>6)) return {ok:false,reasonCode:"INVALID_D6_RESULT"};
  return {ok:true,dice:dice.map(Number)};
}
function countSuccesses(dice){return dice.filter(die=>die>=4).length;}

export function tb2eTestShadowStatus(){
  return freezeTb2e({
    phase:"M10D.4",mode:"TB2E_TESTS_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:TEST_ROW?.status??"PARTIAL",
    sourceEvidence:TEST_ROW?.evidence??"QR 2, 4, 7, 75; CC 5",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    actorMutationAllowed:false,itemMutationAllowed:false,resourceSpendAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "OBSTACLE_VALUE_MUST_BE_CALLER_SUPPLIED",
      "NO_DG160_SKILL_FACTORS",
      "VERSUS_TIES_REMAIN_MANUAL_SOURCE_BOUNDED",
      "NO_RANDOM_ROLL_EXECUTION",
      "NO_RESOURCE_SPEND",
      "NO_ADVANCEMENT_WRITE"
    ],
    nextStep:"Verify bounded TB2E test math and Luck planning only; no live test authority is authorized"
  });
}

export function tb2eDiceModel(){
  return freezeTb2e({
    phase:"M10D.4",profileId:PROFILE_ID,die:"d6",successThreshold:4,
    successFaces:[4,5,6],supportsDiceModifiers:true,supportsSuccessModifiers:true,
    marginMode:"ABSOLUTE_DIFFERENCE_WITH_KIND",
    obstaclePassRule:"FINAL_SUCCESSES_GTE_OB",
    normalObstacleGuideRange:{min:2,max:5},
    obstacleFactorsAuthority:"UNAVAILABLE_DG160_CALLER_SUPPLIED_ONLY",
    luck:{resource:"FATE",timing:"AFTER_TEST_ROLL",oneNewDiePerSix:true,recursive:true},
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eTestPoolPlan({basePool=0,diceModifier=0,successModifier=0}={}){
  if(!nonNegativeInteger(basePool)) return blocked("INVALID_BASE_POOL",{basePool});
  if(!integer(diceModifier)) return blocked("INVALID_DICE_MODIFIER",{diceModifier});
  if(!integer(successModifier)) return blocked("INVALID_SUCCESS_MODIFIER",{successModifier});
  const unclampedPool=Number(basePool)+Number(diceModifier);
  return freezeTb2e({
    ok:true,phase:"M10D.4",profileId:PROFILE_ID,mode:"POOL_PLAN",
    basePool:Number(basePool),diceModifier:Number(diceModifier),successModifier:Number(successModifier),
    finalPool:Math.max(0,unclampedPool),poolClampedAtZero:unclampedPool<0,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eResolveObstacleShadow({dice=[],obstacle,successModifier=0}={}){
  const checked=validateDice(dice);if(!checked.ok)return blocked(checked.reasonCode);
  if(!nonNegativeInteger(obstacle)) return blocked("INVALID_OBSTACLE",{obstacle});
  if(!integer(successModifier)) return blocked("INVALID_SUCCESS_MODIFIER",{successModifier});
  const rawSuccesses=countSuccesses(checked.dice);
  const finalSuccesses=Math.max(0,rawSuccesses+Number(successModifier));
  const target=Number(obstacle);
  const outcome=finalSuccesses>=target?"PASS":"FAIL";
  const margin=Math.abs(finalSuccesses-target);
  return freezeTb2e({
    ok:true,phase:"M10D.4",profileId:PROFILE_ID,mode:"OBSTACLE_SHADOW",
    dice:checked.dice,successThreshold:4,rawSuccesses,successModifier:Number(successModifier),finalSuccesses,
    obstacle:target,obstacleAuthority:"CALLER_SUPPLIED",normalGuideRange:target>=2&&target<=5,
    outcome,margin,marginKind:outcome==="PASS"?"SUCCESS":"FAILURE",
    obstacleFactorsAutomated:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eResolveVersusShadow({dice=[],opponentSuccesses,successModifier=0}={}){
  const checked=validateDice(dice);if(!checked.ok)return blocked(checked.reasonCode);
  if(!nonNegativeInteger(opponentSuccesses)) return blocked("INVALID_OPPONENT_SUCCESSES",{opponentSuccesses});
  if(!integer(successModifier)) return blocked("INVALID_SUCCESS_MODIFIER",{successModifier});
  const rawSuccesses=countSuccesses(checked.dice);
  const finalSuccesses=Math.max(0,rawSuccesses+Number(successModifier));
  const target=Number(opponentSuccesses);
  const outcome=finalSuccesses>target?"PASS":finalSuccesses<target?"FAIL":"TIE";
  const margin=Math.abs(finalSuccesses-target);
  return freezeTb2e({
    ok:true,phase:"M10D.4",profileId:PROFILE_ID,mode:"VERSUS_SHADOW",
    dice:checked.dice,successThreshold:4,rawSuccesses,successModifier:Number(successModifier),finalSuccesses,
    opponentSuccesses:target,outcome,margin,marginKind:outcome==="PASS"?"SUCCESS":outcome==="FAIL"?"FAILURE":"TIE",
    tieResolutionRequired:outcome==="TIE",tieResolutionAutomation:false,
    tieBoundary:outcome==="TIE"?"GUIDES_DO_NOT_ESTABLISH_COMPLETE_GENERIC_TIE_PROCEDURE":null,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eLuckPlan({dice=[],fateAvailable=0}={}){
  const checked=validateDice(dice);if(!checked.ok)return blocked(checked.reasonCode);
  if(!nonNegativeInteger(fateAvailable)) return blocked("INVALID_FATE_AVAILABLE",{fateAvailable});
  const sixes=checked.dice.filter(die=>die===6).length;
  if(sixes===0) return blocked("NO_SIXES",{sixCount:0});
  if(Number(fateAvailable)<1) return blocked("INSUFFICIENT_FATE",{sixCount:sixes,resourceCost:"FATE",resourceAmount:1});
  return freezeTb2e({
    ok:true,phase:"M10D.4",profileId:PROFILE_ID,mode:"LUCK_OPEN_SIX_PLAN",
    resourceCost:"FATE",resourceAmount:1,timing:"AFTER_TEST_ROLL",
    sixCount:sixes,initialExtraDice:sixes,recursiveOpenSixes:true,stopWhenNoNewSixes:true,
    effect:"ADD_ONE_NEW_DIE_PER_SIX",resourceSpendCommitted:false,randomRollExecuted:false,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eBeginnersLuckShadowPlan({
  abilityDice=0,wisesDice=0,helpDice=0,suppliesDice=0,gearDice=0,
  traitsDice=0,personaDice=0,channeledNatureDice=0,freshDice=0,otherBonusDice=0,
  abilityZeroDueToInjuryOrSickness=false
}={}){
  const values={abilityDice,wisesDice,helpDice,suppliesDice,gearDice,traitsDice,personaDice,channeledNatureDice,freshDice,otherBonusDice};
  for(const [key,value] of Object.entries(values)) if(!nonNegativeInteger(value)) return blocked("INVALID_BEGINNERS_LUCK_COMPONENT",{component:key,value});
  if(Boolean(abilityZeroDueToInjuryOrSickness)) return blocked("ABILITY_ZERO_DUE_TO_INJURY_OR_SICKNESS");
  const preHalving=Number(abilityDice)+Number(wisesDice)+Number(helpDice)+Number(suppliesDice)+Number(gearDice);
  const halvedPool=Math.ceil(preHalving/2);
  const postHalving=Number(traitsDice)+Number(personaDice)+Number(channeledNatureDice)+Number(freshDice)+Number(otherBonusDice);
  return freezeTb2e({
    ok:true,phase:"M10D.4",profileId:PROFILE_ID,mode:"BEGINNERS_LUCK_SHADOW",
    preHalvingSources:["ABILITY","WISES","HELP","SUPPLIES","GEAR"],preHalving,rounding:"UP",halvedPool,
    postHalvingSources:["TRAITS","PERSONA","CHANNELED_NATURE","FRESH","OTHER_BONUSES"],postHalving,
    finalPool:halvedPool+postHalving,missingToolsPenalty:{value:-1,automation:"MANUAL_SOURCE_BOUNDARY"},
    resourceSpendCommitted:false,liveApplication:false,writesPlanned:0
  });
}
