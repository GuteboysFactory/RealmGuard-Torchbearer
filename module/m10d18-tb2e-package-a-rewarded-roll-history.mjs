import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageATestScenarioPlan} from "./m10d18-tb2e-package-a-test-scenario.mjs";
import {tb2eResolveObstacleShadow} from "./m10d-tb2e-test-shadow.mjs";
import {tb2ePackageAProgressAfterTestPlan} from "./m10d18-tb2e-package-a-progress-boundary.mjs";

const state=(ok,reasonCode=null,extra={})=>freezeTb2e({
 ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
 mode:"GM_ASSERTED_WISE_FATE_TIMELINE_SHADOW",
 sourceEvidence:"DH pp.76-78; SG pp.87-88",
 liveApplication:false,writesPlanned:0,rollExecuted:false,actorWrite:false,
 itemWrite:false,journalWrite:false,settingsWrite:false,
 resourceSpendCommitted:false,advancementWrite:false,learningWrite:false,
 rollSourceAuthenticated:false,actorSourceAuthenticated:false,
 gmPermissionAuthenticated:false,...extra
});
const deny=(reasonCode,extra={})=>state(false,reasonCode,extra);
const dieValid=d=>d&&typeof d==="object"&&!Array.isArray(d)&&
 typeof d.dieId==="string"&&d.dieId.trim()&&d.dieId.length<=128&&
 Number.isInteger(d.face)&&d.face>=1&&d.face<=6;
const allowedProgress=new Set(["skillAlreadyKnown","previousLearningAttempts","maximumNature",
 "currentKnownSkillCount","context","alreadyCountedInContext","gmConfirmedLegalTest"]);
const validId=s=>typeof s==="string"&&s.trim().length>0&&s.length<=128;

/** Verifies GM-asserted *one-test* Wise/Fate transitions, including one
 * new die per 6 recursively. This is NEVER a validated Foundry roll log.
 * Use namespaced die IDs and full per-event outcomes; no RNG or writes.
 */
export function tb2ePackageARewardedRollHistoryPlan({
 scenarioInput=null,initialDice=null,rewardEvents=null,
 gmDiceReviewed=false,gmEventHistoryReviewed=false,
 fateAvailable=null,personaAvailable=null,
 heroicTn3BenefitUnlocked=false,progressFacts=null
}={}){
 if(!scenarioInput||typeof scenarioInput!=="object"||Array.isArray(scenarioInput))
   return deny("SCENARIO_INPUT_REQUIRED");
 if(gmDiceReviewed!==true||gmEventHistoryReviewed!==true)
   return deny("GM_DICE_AND_EVENT_REVIEW_REQUIRED");
 if(!Number.isInteger(fateAvailable)||fateAvailable<0||
    !Number.isInteger(personaAvailable)||personaAvailable<0)
   return deny("EXPLICIT_REWARD_BALANCES_REQUIRED");
 if(!Array.isArray(initialDice)||initialDice.length>250||!initialDice.every(dieValid))
   return deny("INVALID_INITIAL_DICE");
 if(new Set(initialDice.map(d=>d.dieId.trim())).size!==initialDice.length)
   return deny("DUPLICATE_INITIAL_DIE_ID");
 if(!Array.isArray(rewardEvents)||rewardEvents.length>3)
   return deny("INVALID_REWARD_EVENT_LIST");
 const preview=tb2ePackageATestScenarioPlan(scenarioInput);
 if(!preview.ok)return deny("SCENARIO_"+preview.reasonCode,{sourceReasonCode:preview.reasonCode});
 if(Number.isInteger(personaAvailable)&&
   scenarioInput?.bonuses?.channeledNatureDice>0&&
   scenarioInput?.channelNatureFacts?.personaAvailable!==personaAvailable)
   return deny("NATURE_PERSONA_BALANCE_MISMATCH");
 const preRollPersona=preview.projectedPersonaBeforeRollCost;
 if(preRollPersona>personaAvailable)
   return deny("INSUFFICIENT_PERSONA_BEFORE_ROLL",{required:preRollPersona,available:personaAvailable});
 if(initialDice.length!==preview.finalDicePool)
   return deny("INITIAL_DICE_POOL_MISMATCH",{
     expectedPool:preview.finalDicePool,receivedDice:initialDice.length});
 if(typeof heroicTn3BenefitUnlocked!=="boolean")
   return deny("INVALID_HEROIC_TN3_BENEFIT_STATE");
 const tn=heroicTn3BenefitUnlocked?3:4;
 const dice=new Map(initialDice.map(d=>[d.dieId.trim(),{
   dieId:d.dieId.trim(),face:d.face,rerollCount:0,source:"BASE",parentDieId:null
 }]));
 const seenWise=new Set(),seenEffects=new Set();
 let spentFate=0,spentPersona=0,seenLuck=false;
 const stages=[];
 for(const [eventIndex,event] of rewardEvents.entries()){
   if(!event||typeof event!=="object"||Array.isArray(event))
     return deny("INVALID_REWARD_EVENT",{eventIndex});
   const type=String(event.type??"").trim().toUpperCase();
   if(!["DEEPER_UNDERSTANDING","OF_COURSE","FATE_LUCK"].includes(type))
     return deny("UNSUPPORTED_REWARD_EVENT",{eventIndex});
   if(type!=="FATE_LUCK"){
     if(seenLuck)return deny("WISE_REWARD_MUST_PRECEDE_FATE_LUCK",{eventIndex,sourceEvidence:"SG pp.87-88"});
     if(!validId(event.wiseId)||event.related!==true)
       return deny("GM_CONFIRMED_RELATED_WISE_REQUIRED",{eventIndex});
     const normalizedWiseId=event.wiseId.trim().toLowerCase();
     if(seenWise.has(normalizedWiseId)||seenEffects.has(type))
       return deny("WISE_OR_EFFECT_ALREADY_USED_ON_ROLL",{eventIndex});
     seenWise.add(normalizedWiseId);seenEffects.add(type);
   }
   if(type==="DEEPER_UNDERSTANDING"){
     if(!validId(event.dieId)||!Number.isInteger(event.newFace)||
        event.newFace<1||event.newFace>6)
       return deny("INVALID_DEEPER_REROLL",{eventIndex});
     const d=dice.get(event.dieId.trim());
     if(!d||d.face>=tn||d.rerollCount>0)
       return deny("DEEPER_REQUIRES_UNREROLLED_FAILED_DIE",{eventIndex});
     if(spentFate>=fateAvailable)return deny("INSUFFICIENT_FATE",{eventIndex});
     d.face=event.newFace;d.rerollCount+=1;spentFate+=1;
     stages.push({type,dieId:d.dieId,newFace:d.face});
   }else if(type==="OF_COURSE"){
     if(!Array.isArray(event.rerolls)||event.rerolls.length>250||
        !event.rerolls.every(dieValid))
       return deny("INVALID_OF_COURSE_REROLL_RECORD",{eventIndex});
     const eligible=[...dice.values()].filter(d=>d.face<tn);
     const ordered=event.rerolls.map(d=>d.dieId.trim());
     if(eligible.length===0)return deny("OF_COURSE_REQUIRES_FAILED_DICE",{eventIndex});
     if(new Set(ordered).size!==ordered.length||ordered.length!==eligible.length||
        !eligible.every(d=>ordered.includes(d.dieId)))
       return deny("OF_COURSE_MUST_REROLL_ALL_FAILED_DICE",{eventIndex});
     if(preRollPersona+spentPersona>=personaAvailable)return deny("INSUFFICIENT_PERSONA",{eventIndex,
       totalRequired:preRollPersona+spentPersona+1,available:personaAvailable});
     for(const rolled of event.rerolls){
       const d=dice.get(rolled.dieId.trim());d.face=rolled.face;d.rerollCount+=1;
     }
     spentPersona+=1;
     stages.push({type,rerolledDieIds:ordered});
   }else{
     if(seenLuck)return deny("FATE_LUCK_ONLY_ONCE_PER_TEST",{eventIndex});
     if(!Array.isArray(event.rounds)||event.rounds.length<1||event.rounds.length>30)
       return deny("INVALID_FATE_LUCK_ROUNDS",{eventIndex});
     if(spentFate>=fateAvailable)return deny("INSUFFICIENT_FATE",{eventIndex});
     let parents=[...dice.values()].filter(d=>d.face===6).map(d=>d.dieId);
     if(!parents.length)return deny("FATE_LUCK_REQUIRES_SIXES",{eventIndex});
     let produced=0;
     for(const [roundIndex,round] of event.rounds.entries()){
       if(!Array.isArray(round)||round.length>250||
          !round.every(d=>dieValid(d)&&validId(d.parentDieId)))
         return deny("INVALID_FATE_LUCK_ROUND",{eventIndex,roundIndex});
       const recordedParents=round.map(d=>d.parentDieId.trim());
       if(round.length!==parents.length||
          new Set(recordedParents).size!==recordedParents.length||
          !parents.every(id=>recordedParents.includes(id)))
         return deny("FATE_LUCK_PARENT_SIXES_MISMATCH",{eventIndex,roundIndex});
       for(const newDie of round){
         const dieId=newDie.dieId.trim();
         if(dice.has(dieId))return deny("DUPLICATE_DIE_ID_IN_HISTORY",{eventIndex,roundIndex});
         dice.set(dieId,{dieId,face:newDie.face,source:"FATE_LUCK",
           parentDieId:newDie.parentDieId.trim(),rerollCount:0});
       }
       produced+=round.length;
       if(dice.size>500)return deny("ROLL_HISTORY_SAFETY_LIMIT_EXCEEDED");
       parents=round.filter(d=>d.face===6).map(d=>d.dieId.trim());
       if(parents.length&&roundIndex===event.rounds.length-1)
         return deny("FATE_LUCK_EXPLOSION_INCOMPLETE",{eventIndex,roundIndex});
       if(!parents.length&&roundIndex<event.rounds.length-1)
         return deny("FATE_LUCK_EXTRA_ROUND_NOT_REQUIRED",{eventIndex,roundIndex});
     }
     spentFate+=1;seenLuck=true;
     stages.push({type,roundCount:event.rounds.length,generatedDice:produced});
   }
 }
 const sourceKind=preview.scenarioType==="BEGINNERS_LUCK"?
   String(scenarioInput.beginnerAbilityName??"").trim().toUpperCase():"SKILL";
 const finalDice=[...dice.values()].map(d=>d.face);
 const resolved=tb2eResolveObstacleShadow({
   dice:finalDice,obstacle:preview.obstacle,sourceKind,heroicTn3BenefitUnlocked
 });
 if(!resolved.ok)return deny("RESOLUTION_"+resolved.reasonCode);
 let advancement=null;
 if(progressFacts!==null){
   if(!progressFacts||typeof progressFacts!=="object"||Array.isArray(progressFacts)||
      Object.keys(progressFacts).some(key=>!allowedProgress.has(key)))
     return deny("INVALID_POST_TEST_FACT_FIELDS");
   if(["CONFLICT","SERIES","TIEBREAKER"].includes(String(progressFacts.context??"ADVENTURE").trim().toUpperCase()))
     return deny("INDEPENDENT_TEST_PROGRESS_CONTEXT_MISMATCH");
   if(progressFacts.gmConfirmedLegalTest!==true)
     return deny("GM_MUST_CONFIRM_PROGRESSION_ELIGIBILITY");
   advancement=tb2ePackageAProgressAfterTestPlan({
     ...progressFacts,skillName:preview.skillName,mode:preview.scenarioType,
     outcome:resolved.outcome,obstacle:preview.obstacle,
     actingConditions:scenarioInput.actingConditions,
     conditionsGmReviewed:scenarioInput.conditionsGmReviewed,wentToTiebreaker:false
   });
   if(!advancement.ok)return deny("PROGRESS_"+advancement.reasonCode);
 }
 return state(true,null,{
   scenarioSkill:preview.skillName,actingCharacterId:preview.actingCharacterId,
   initialDiceCount:initialDice.length,finalDiceCount:dice.size,
   resolvedDice:finalDice,dieHistory:[...dice.values()].map(d=>({...d})),
   reviewedTimeline:stages,successThreshold:tn,
   rawSuccesses:resolved.rawSuccesses,finalSuccesses:resolved.finalSuccesses,
   obstacle:resolved.obstacle,outcome:resolved.outcome,
   margin:resolved.margin,marginKind:resolved.marginKind,
   projectedFateCost:spentFate,projectedPersonaCost:spentPersona,
   projectedPersonaBeforeRollCost:preRollPersona,
   projectedPersonaTotalCost:preRollPersona+spentPersona,
   projectedPersonaRemainingFromGmBalance:personaAvailable-preRollPersona-spentPersona,
   resourceBalancesDeclaredByGmOnly:true,resourcesRemainingUnverified:true,
   advancementPreview:advancement,finalRollEventNotRead:true,
   newDiceNeverActuallyRolled:true,noAdvanceAuthorized:true
 });
}
