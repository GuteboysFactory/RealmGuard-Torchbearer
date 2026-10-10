import { TB2E_MAGIC_CAST_MODES as MODES,
 tb2eMagicKey as key,tb2eMagicCount as count,tb2eMagicPositive as positive,
 tb2eMagicCircleSum as circleSum,tb2eMagicResult as result,
 tb2eMagicBlocked as blocked } from "./m10d-tb2e-magic-contract.mjs";

export function tb2eMagicMemoryPlan({capacity=0,currentSpells=[],newSpells=[],
 carriedBookSpells=[],phase="CAMP",onWatch=false,townAccommodation=false,
 townWithRelationship=false}={}){
 const place=key(phase),current=circleSum(currentSpells),add=circleSum(newSpells);
 if(!count(capacity)||current===null||add===null||!Array.isArray(carriedBookSpells))
  return blocked("INVALID_MEMORY_INPUT");
 if(!["CAMP","TOWN"].includes(place))return blocked("MEMORIZE_ONLY_CAMP_OR_TOWN");
 if(place==="CAMP"&&onWatch)return blocked("CANNOT_MEMORIZE_WHILE_ON_WATCH");
 if(current+add>capacity)return blocked("MEMORY_PALACE_CAPACITY_EXCEEDED",
  {requiredSlots:current+add,capacity});
 const bookIds=new Set(carriedBookSpells.map(key));
 if(newSpells.some(s=>typeof s.id!=="string"||!bookIds.has(key(s.id))))
  return blocked("SPELL_NOT_IN_CARRIED_SPELLBOOK");
 return result({ok:true,operation:"MEMORIZE",skill:"Lore Master",
  phase:place,capacity,currentSlots:current,newSlots:add,remainingSlots:capacity-current-add,
  obstacle:add+currentSpells.length,
  checksRequired:place==="CAMP"?1:0,
  lifestyleCostDelta:place==="TOWN"&&!townAccommodation&&!townWithRelationship?1:0,
  freeInTown:place==="TOWN"&&(townAccommodation||townWithRelationship),
  currentSpellCount:currentSpells.length,selectedCount:newSpells.length,
  gmFailureTwistOrCondition:true,memorizationCommitted:false});
}
export function tb2eMagicSpellbookPlan({folios=5,existingSpells=[],newSpells=[]}={}){
 const existing=circleSum(existingSpells),added=circleSum(newSpells);
 if(!count(folios)||existing===null||added===null)return blocked("INVALID_SPELLBOOK_INPUT");
 if(existing+added>folios)return blocked("INSUFFICIENT_SPELLBOOK_FOLIOS");
 return result({ok:true,operation:"SPELLBOOK_CAPACITY",
  folios,usedFolios:existing+added,freeFolios:folios-existing-added,
  scribeObstacle:"SPELL_SPECIFIC_SOURCE_REQUIRED",changesCommitted:false});
}
export function tb2eMagicCastPlan({castingMode="FIXED",source="MEMORY",
 memorized=false,hasScroll=false,inSpellBook=false,
 canSpeak=true,freeHandToGesture=true,
 castingTurns=0,helpingArcanists=0,materials=false,focus=false,
 inConflict=false,conflictTiming="NONE",equippedThisRound=false,
 targetOpposition=false,freeSpellsAlreadyThisRound=0}={}){
 const mode=key(castingMode),from=key(source),timing=key(conflictTiming);
 if(!MODES.includes(mode))return blocked("INVALID_SPELL_CAST_MODE");
 if(!["MEMORY","SCROLL","SPELL_BOOK"].includes(from))return blocked("INVALID_SPELL_SOURCE");
 if(!count(castingTurns)||!count(helpingArcanists)||!count(freeSpellsAlreadyThisRound))
  return blocked("INVALID_CASTING_TIME_OR_HELP");
 if(!canSpeak||!freeHandToGesture)return blocked("CASTER_MUST_SPEAK_AND_GESTURE");
 if(from==="MEMORY"&&!memorized)return blocked("SPELL_NOT_MEMORIZED");
 if(from==="SCROLL"&&!hasScroll)return blocked("SCROLL_NOT_AVAILABLE");
 if(from==="SPELL_BOOK"&&!inSpellBook)return blocked("SPELL_NOT_IN_SPELLBOOK");
 const skillSwap=mode==="SKILL_SWAP";
 const addedTurns=helpingArcanists>0&&!skillSwap?1:0;
 const totalTurns=castingTurns+addedTurns;
 if(inConflict){
  if(skillSwap){
   if(!equippedThisRound||!["ACTION","BETWEEN_ROUNDS","BEFORE_DISPOSITION"].includes(timing))
    return blocked("SKILL_SWAP_MUST_BE_EQUIPPED");
  }else if(timing==="BEFORE_DISPOSITION"){
   // Only a spell-specific ability to act before disposition authorizes this timing.
   return blocked("BEFORE_DISPOSITION_SPELL_SPECIFIC_GM_APPROVAL_REQUIRED");
  }else if(timing==="BETWEEN_ROUNDS"){
   if(totalTurns>0)return blocked("TURN_COST_SPELL_NOT_USABLE_IN_CONFLICT");
   if(targetOpposition)return blocked("BETWEEN_ROUNDS_SPELL_CANNOT_AFFECT_OPPOSITION");
   if(freeSpellsAlreadyThisRound>=1)return blocked("ONE_FREE_SPELL_PER_ROUND");
  }else return blocked("CONFLICT_SPELL_TIMING_NOT_ALLOWED");
 }
 return result({ok:true,operation:"CAST_SPELL",castingMode:mode,source:from,
  castingTestSkill:"Arcanist",testType:mode,
  obstacle:"SPELL_SPECIFIC_FIXED_FACTORS_OR_VERSUS_REQUIRED",
  turns:totalTurns,grindTurns:totalTurns,
  helpingTurnsAdded:addedTurns,materialBonusDice:materials?1:0,
  focusBonusDice:focus?1:0,materialConsumedPlanned:Boolean(materials),
  focusConsumed:false,memorizedSpellReleasedPlanned:from==="MEMORY",
  scrollConsumedPlanned:from==="SCROLL",
  spellbookSpellConsumedPlanned:from==="SPELL_BOOK",
  spellCannotBeDisarmed:true,mundaneArmorAbsorptionAllowed:false,
  castCommitted:false,spellEffectCommitted:false});
}
export function tb2eMagicDischargePlan({memorySpells=[],purposefulCast=false}={}){
 const total=circleSum(memorySpells);
 if(total===null)return blocked("INVALID_MEMORY_SPELLS");
 return result({ok:true,operation:"TEMERARIOUS_DISCHARGE",testSkill:"Will",
  obstacle:total,requiresTest:true,turns:0,checksRequired:0,
  noPurposeCastTreatedAsDischarge:!purposefulCast,
  dischargeCommitted:false,failureOutcome:"GM_TWIST_OR_CONDITION"});
}
export function tb2eMagicSpellInterruptPlan({memorySpells=[],helpers=0}={}){
 const total=circleSum(memorySpells);
 if(total===null||!count(helpers))return blocked("INVALID_INTERRUPT_INPUT");
 return result({ok:true,operation:"SPELL_INTERRUPT",spellLostPlanned:true,
  willTestObstacle:total,willTestForCasterAndHelpers:helpers+1,
  onFailure:"APPLY_TEMERARIOUS_DISCHARGE_RULES",committed:false});
}
