import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageAActorEvidence} from "./m10d18-tb2e-package-a-actor-evidence.mjs";
import {tb2ePackageAParticipationOutcomePlan} from "./m10d18-tb2e-package-a-participation-provenance.mjs";

const state=(ok,reasonCode=null,data={})=>freezeTb2e({
  ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
  mode:"CURRENT_EQUIPMENT_SAVED_OUTCOME_READ_ONLY",sourceEvidence:"DH 59,73-75; SG 31,36-38",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
  journalWrite:false,settingsWrite:false,rollExecuted:false,equipmentWrite:false,
  supplySpent:false,resourceSpendCommitted:false,advancementWrite:false,learningWrite:false,
  actorSourceAuthenticated:false,rollSourceAuthenticated:false,gmPermissionAuthenticated:false,
  playerConsentAuthenticated:false,rollTimeActorStateVerified:false,historicalEquipmentVerified:false,
  physicalConditionAuthenticated:false,equipmentRelevanceAuthenticated:false,
  supplyIncrementAuthenticated:false,lenderConsentAuthenticated:false,noAdvanceAuthorized:true,...data
});
const fail=code=>state(false,code);
const fields=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));
const id=x=>typeof x==="string"&&/^[A-Za-z0-9]{1,128}$/.test(x);
const norm=x=>String(x??"").trim().toLowerCase();
const carriedPack=i=>["backpack","satchel"].includes(i.inventory?.containerType)&&
  i.inventory.mode==="worn"&&i.inventory.location==="torso"&&i.inventory.containerId===""&&i.quantity>0;
class EquipmentError extends Error {}
const reject=code=>{throw new EquipmentError(code);};
const stock=(actor,itemId)=>{
  const found=actor.currentGearItems.filter(i=>i.itemId===itemId);
  if(!id(itemId)||found.length!==1)reject("UNIQUE_CURRENT_GEAR_ITEM_REQUIRED");
  const item=found[0];
  if(!Number.isSafeInteger(item.quantity)||item.quantity<1)reject("POSITIVE_CURRENT_GEAR_QUANTITY_REQUIRED");
  return item;
};
const pack=(actor,review)=>{
  const active=actor.currentGearItems.filter(carriedPack);
  if(active.length>1)reject("AMBIGUOUS_CARRIED_PACK_STATE");
  if(review===null){if(active.length)reject("CARRIED_PACK_REFERENCE_REQUIRED");return null;}
  if(!fields(review,["itemId","usableGmAsserted"])||typeof review.usableGmAsserted!=="boolean")
    reject("EXPLICIT_PACK_USABILITY_REVIEW_REQUIRED");
  const item=stock(actor,review.itemId);
  if(!carriedPack(item))reject("PACK_NOT_CURRENTLY_CARRIED");
  return {actorId:actor.actorId,item,usableGmAsserted:review.usableGmAsserted};
};
const accessible=(item,packEvidence)=>{
  const d=item.inventory;
  if(!d||typeof d.containerId!=="string")reject("CURRENT_EQUIPMENT_PLACEMENT_REQUIRED");
  if(d.mode==="container"){
    if(d.location!=="")reject("CURRENT_EQUIPMENT_PLACEMENT_UNSUPPORTED");
    if(!packEvidence||!packEvidence.usableGmAsserted||d.containerId!==packEvidence.item.itemId)
      reject("DIRECT_CARRIED_PACK_PATH_REQUIRED");
    return [packEvidence.item.itemId,item.itemId];
  }
  const direct={hand:["left-hand","right-hand"],belt:["belt"],pocket:["pocket"],
    worn:["head","neck","cloak","torso","feet"]};
  if(d.containerId!==""||!direct[d.mode]?.includes(d.location))reject("CURRENT_EQUIPMENT_PLACEMENT_UNSUPPORTED");
  return [item.itemId];
};

/** Adds actual current Item/quantity/placement evidence to the reviewed
 * participant outcome. Classification, damage, access and loan consent remain
 * assertions. No flags/name inference, inventory mutation or consumption.
 * Direct equipped items or one level in a worn pack/satchel only.
 */
export function tb2ePackageAEquipmentOutcomePlan(options={}){
  const participation=tb2ePackageAParticipationOutcomePlan({actorId:options?.actorId,
    messageId:options?.messageId,scenarioInput:options?.scenarioInput,
    helpSourceItemId:options?.helpSourceItemId,wiseAidItemId:options?.wiseAidItemId});
  if(!participation.ok)return fail(participation.reasonCode);
  try {
    if(!fields(options,["actorId","messageId","scenarioInput","helpSourceItemId","wiseAidItemId","equipmentReview"]))
      return fail("UNSUPPORTED_EQUIPMENT_OUTCOME_FIELDS");
    const r=options.equipmentReview,s=options.scenarioInput,e=s.equipment;
    if(!fields(r,["pack","borrowedTools","supply","gear","adequacyGmReviewed"])||
       ["pack","borrowedTools","supply","gear"].some(k=>!Object.hasOwn(r,k))||r.adequacyGmReviewed!==true)
      return fail("EXPLICIT_EQUIPMENT_SOURCE_REVIEW_REQUIRED");
    if(e.dwarvenCraftingNature!==false||e.isCraftingTest!==false)
      return fail("CRAFTING_NATURE_EQUIPMENT_SCOPE_UNSUPPORTED");
    if(["hasSkill","carriesBackpackOrSatchel","borrowedTools","toolsInadequate"].some(k=>typeof e[k]!=="boolean"))
      return fail("BOOLEAN_EQUIPMENT_FACTS_REQUIRED");
    const acting=participation.participantEvidence[0],ownPack=pack(acting,r.pack),
      seen=new Set(),bindings=[];
    const bind=(actorId,item,role,path)=>{
      const identity=actorId+":"+item.itemId;
      if(seen.has(identity))reject("EQUIPMENT_ITEM_USED_IN_MULTIPLE_ROLES");
      seen.add(identity);bindings.push({actorId,item,role,carriedPath:path});
    };
    if(ownPack)bind(acting.actorId,ownPack.item,"PACK",[ownPack.item.itemId]);
    if(e.carriesBackpackOrSatchel!==Boolean(ownPack?.usableGmAsserted))
      return fail("SCENARIO_CARRIED_PACK_REVIEW_MISMATCH");
    let loan=null;
    if(r.borrowedTools!==null){
      const b=r.borrowedTools;
      if(!fields(b,["lenderActorId","skillItemId","packItemId","accessGmAsserted","lenderConsentGmAsserted","packUsableGmAsserted"])||
         b.accessGmAsserted!==true||b.lenderConsentGmAsserted!==true||b.packUsableGmAsserted!==true)
        return fail("EXPLICIT_TOOL_LOAN_REVIEW_REQUIRED");
      if(b.lenderActorId===acting.actorId)return fail("BORROWED_TOOLS_REQUIRE_DISTINCT_LENDER");
      const lender=tb2ePackageAActorEvidence({actorId:b.lenderActorId});
      if(!lender.ok)return fail("LENDER_"+lender.reasonCode);
      const skills=lender.currentSkillItems.filter(i=>i.itemId===b.skillItemId);
      if(!id(b.skillItemId)||skills.length!==1||norm(skills[0].name)!==norm(s.skillName)||
         !Number.isInteger(skills[0].rating)||skills[0].rating<1||skills[0].rating>6||
         lender.currentSkillItems.filter(i=>norm(i.name)===norm(s.skillName)).length!==1)
        return fail("CURRENT_LENDER_TRAINED_SKILL_REQUIRED");
      const lenderPack=pack(lender,{itemId:b.packItemId,usableGmAsserted:true});
      bind(lender.actorId,lenderPack.item,"BORROWED_TOOL_PACK",[lenderPack.item.itemId]);
      loan={lenderEvidence:lender,skillItem:skills[0],packEvidence:lenderPack,
        accessGmAsserted:true,lenderConsentGmAsserted:true};
    }
    if(e.borrowedTools!==(loan!==null))return fail("SCENARIO_BORROWED_TOOL_REVIEW_MISMATCH");
    for(const [role,ref,count] of [["SUPPLY",r.supply,e.suppliesUsed],["GEAR",r.gear,e.gearUsed]]){
      if(count===0){if(ref!==null)return fail("UNUSED_"+role+"_REFERENCE");continue;}
      const allowed=role==="SUPPLY"?["itemId","skillName","accessibleGmAsserted","usableGmAsserted","oneIncrementAvailableGmAsserted"]:
        ["itemId","skillName","accessibleGmAsserted","usableGmAsserted"];
      if(!fields(ref,allowed)||ref.accessibleGmAsserted!==true||ref.usableGmAsserted!==true||
         norm(ref.skillName)!==norm(s.skillName)||role==="SUPPLY"&&ref.oneIncrementAvailableGmAsserted!==true)
        return fail("EXPLICIT_"+role+"_SKILL_AND_ACCESS_REVIEW_REQUIRED");
      const item=stock(acting,ref.itemId),path=accessible(item,ownPack);
      bind(acting.actorId,item,role,path);
    }
    return state(true,null,{participationEvidence:participation,ownPackEvidence:ownPack,toolLoanEvidence:loan,
      equipmentBindings:bindings,currentItemQuantityAndPlacementObserved:true,
      toolAdequacyGmAsserted:true,itemSkillClassificationGmAsserted:true,physicalUsabilityGmAsserted:true,
      projectedSupplyIncrementsUsed:e.suppliesUsed,projectedGearUses:e.gearUsed,
      inventoryCapacityAndEncumbranceVerified:false,completeEquipmentRuleParityVerified:false,
      outcomePreview:participation.outcomePreview,quantityDecrementPlanned:false});
  }catch(error){return fail(error instanceof EquipmentError?error.message:"EQUIPMENT_DOCUMENT_READ_FAILED");}
}
