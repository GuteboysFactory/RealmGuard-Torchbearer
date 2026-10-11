import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
function plan(data){return freezeTb2e({
 phase:"M10D.18_P3.2",profileId:"torchbearer2e",mode:"READ_ONLY_SHADOW",
 sourceEvidence:"Dungeoneer's Handbook pp.72-75",
 liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
 equipmentWrite:false,obstacleWrite:false,rollExecuted:false,
 supplySpent:false,...data
});}
function blocked(reasonCode){return plan({ok:false,reasonCode});}
/**
 * GM-supplied availability, not a runtime inventory scan.
 * DH: one each of tools, supplies and gear; lack/inadequate tools +1 Ob;
 * a beginning unskilled character has no default tools unless borrowed;
 * dwarven Crafting Nature grants basic crafting tools.
 */
export function tb2eSkillEquipmentPlan({
 hasSkill=true,carriesBackpackOrSatchel=true,borrowedTools=false,
 dwarvenCraftingNature=false,isCraftingTest=false,
 toolsInadequate=false,suppliesUsed=0,gearUsed=0
}={}){
 if(!Number.isInteger(suppliesUsed)||suppliesUsed<0||suppliesUsed>1)
  return blocked("AT_MOST_ONE_SUPPLY_INCREMENT_PER_TEST");
 if(!Number.isInteger(gearUsed)||gearUsed<0||gearUsed>1)
  return blocked("AT_MOST_ONE_GEAR_PER_TEST");
 const inherent=Boolean(dwarvenCraftingNature)&&Boolean(isCraftingTest);
 const toolsAvailable=(Boolean(hasSkill)&&Boolean(carriesBackpackOrSatchel))||
  Boolean(borrowedTools)||inherent;
 const inadequate=!toolsAvailable||Boolean(toolsInadequate);
 return plan({ok:true,toolsAvailable,toolsBorrowed:Boolean(borrowedTools),
  dwarvenCraftingNatureApplied:inherent,toolsInadequate:inadequate,
  obstacleIncrease:inadequate?1:0,obstacleCommitted:false,
  supplyDice:Number(suppliesUsed),gearDice:Number(gearUsed),
  bonusDice:Number(suppliesUsed)+Number(gearUsed),
  suppliesConsumedPlanned:suppliesUsed===1,
  equipmentWrite:false,toolSource:"GM_SUPPLIED",equipmentCommitted:false});
}
