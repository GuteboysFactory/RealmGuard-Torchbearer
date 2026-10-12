import assert from "node:assert/strict";
import {tb2ePackageAEquipmentOutcomePlan as plan} from "../module/m10d18-tb2e-package-a-equipment-provenance.mjs";
const oldGame=globalThis.game,oldFoundry=globalThis.foundry;
const forbid=()=>{throw new Error("SIDE_EFFECT");};
class Die {}
const gm={id:"gm1",active:true,isGM:true},player={id:"p1",active:true,isGM:false};
const role=(id,rating)=>({id,name:"Cook",type:"role",system:{rating}});
const gear=(id,quantity,mode,location,containerId="",containerType="none")=>({id,name:id,type:"gear",
 system:{quantity,inventory:{mode,location,containerId,containerType}}});
const actor=(id,items)=>({id,uuid:`Actor.${id}`,documentName:"Actor",type:"character",items,
 system:{resources:{fate:{value:0},persona:{value:0}},attributes:{will:{value:4},health:{value:3}}},
 testUserPermission:u=>u===player,update:forbid,spendTrackedResource:forbid});
const pack=gear("pack1",1,"worn","torso","","backpack"),supply=gear("food1",2,"container","","pack1"),
 tool=gear("knife1",1,"belt","belt"),cook=role("cook1",4);
const acting=actor("acting",[cook,pack,supply,tool]),lenderPack=gear("lenderPack",1,"worn","torso","","satchel"),
 lender=actor("lender",[role("lenderCook",3),lenderPack]);
const message={id:"msg1",documentName:"ChatMessage",visible:true,isContentVisible:true,
 speaker:{actor:acting.id},speakerActor:acting,author:player,rolls:[],update:forbid};
const setDice=faces=>message.rolls=[{_evaluated:true,formula:`${faces.length}d6`,total:faces.reduce((a,b)=>a+b,0),
 terms:[Object.assign(new Die(),{number:faces.length,faces:6,modifiers:[],results:faces.map(result=>({result,active:true}))})],evaluate:forbid}];
const equipment={hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,dwarvenCraftingNature:false,
 isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:1};
const scenario={skillName:"Cook",mode:"SKILL",rating:4,
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},equipment,
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:acting.id,actingConditions:[],conditionsGmReviewed:true};
const review={pack:{itemId:pack.id,usableGmAsserted:true},borrowedTools:null,
 supply:{itemId:supply.id,skillName:"Cook",accessibleGmAsserted:true,usableGmAsserted:true,oneIncrementAvailableGmAsserted:true},
 gear:{itemId:tool.id,skillName:"Cook",accessibleGmAsserted:true,usableGmAsserted:true},adequacyGmReviewed:true};
const base={actorId:acting.id,messageId:message.id,scenarioInput:scenario,equipmentReview:review};
const safe=p=>{for(const k of ["liveApplication","actorWrite","itemWrite","journalWrite","settingsWrite",
 "rollExecuted","equipmentWrite","supplySpent","resourceSpendCommitted","advancementWrite","learningWrite",
 "actorSourceAuthenticated","rollSourceAuthenticated","gmPermissionAuthenticated","playerConsentAuthenticated",
 "rollTimeActorStateVerified","historicalEquipmentVerified","physicalConditionAuthenticated",
 "equipmentRelevanceAuthenticated","supplyIncrementAuthenticated","lenderConsentAuthenticated"])assert.equal(p[k],false,k);
 assert.equal(p.writesPlanned,0);assert.equal(Object.isFrozen(p),true);};
const denied=(overrides,reason)=>{const p=plan({...base,...overrides});safe(p);assert.equal(p.ok,false,JSON.stringify(p));
 assert.equal(p.reasonCode,reason,JSON.stringify(p));};
try {
 globalThis.foundry={dice:{terms:{Die}}};
 globalThis.game={ready:true,system:{id:"realm-guard"},user:gm,users:new Map([[gm.id,gm],[player.id,player]]),
 actors:new Map([[acting.id,acting],[lender.id,lender]]),messages:new Map([[message.id,message]]),settings:{set:forbid},socket:{emit:forbid}};
 setDice([6,4,5,3,2,1]);
 const before=JSON.stringify([acting,lender,message]);
 const good=plan(base);safe(good);assert.equal(good.ok,true,JSON.stringify(good));
 assert.equal(good.outcomePreview.finalDicePool,6);assert.equal(good.projectedSupplyIncrementsUsed,1);
 assert.equal(good.quantityDecrementPlanned,false);assert.equal(good.completeEquipmentRuleParityVerified,false);
 assert.deepEqual(good.equipmentBindings.find(b=>b.role==="SUPPLY").carriedPath,[pack.id,supply.id]);
 assert.deepEqual(good.equipmentBindings.find(b=>b.role==="GEAR").carriedPath,[tool.id]);
 assert.equal(good.equipmentBindings.find(b=>b.role==="SUPPLY").item.quantity,2);
 assert.equal(JSON.stringify([acting,lender,message]),before);assert.equal(Object.isFrozen(supply.system.inventory),false);
 assert.deepEqual(plan(base),good,"Repeated equipment preview must not consume an increment");
 denied({equipmentReview:undefined},"EXPLICIT_EQUIPMENT_SOURCE_REVIEW_REQUIRED");
 denied({equipmentReview:{...review,supply:{...review.supply,quantity:99}}},"EXPLICIT_SUPPLY_SKILL_AND_ACCESS_REVIEW_REQUIRED");
 denied({equipmentReview:{...review,supply:{...review.supply,skillName:"Fighter"}}},"EXPLICIT_SUPPLY_SKILL_AND_ACCESS_REVIEW_REQUIRED");
 denied({equipmentReview:{...review,supply:{...review.supply,oneIncrementAvailableGmAsserted:false}}},"EXPLICIT_SUPPLY_SKILL_AND_ACCESS_REVIEW_REQUIRED");
 denied({equipmentReview:{...review,gear:{...review.gear,accessibleGmAsserted:false}}},"EXPLICIT_GEAR_SKILL_AND_ACCESS_REVIEW_REQUIRED");
 denied({equipmentReview:{...review,supply:{...review.supply,itemId:"missing"}}},"UNIQUE_CURRENT_GEAR_ITEM_REQUIRED");
 denied({equipmentReview:{...review,supply:{...review.supply,itemId:cook.id}}},"UNIQUE_CURRENT_GEAR_ITEM_REQUIRED");
 denied({equipmentReview:{...review,pack:null}},"CARRIED_PACK_REFERENCE_REQUIRED");
 denied({equipmentReview:{...review,gear:{...review.gear,itemId:supply.id}}},"EQUIPMENT_ITEM_USED_IN_MULTIPLE_ROLES");
 supply.system.quantity=0;denied({},"POSITIVE_CURRENT_GEAR_QUANTITY_REQUIRED");supply.system.quantity=2;
 supply.system.quantity=1.5;denied({},"POSITIVE_CURRENT_GEAR_QUANTITY_REQUIRED");supply.system.quantity=2;
 supply.system.quantity=undefined;denied({},"POSITIVE_CURRENT_GEAR_QUANTITY_REQUIRED");supply.system.quantity=2;
 acting.items.push({...supply});denied({},"UNIQUE_CURRENT_GEAR_ITEM_REQUIRED");acting.items.pop();
 supply.system.inventory.containerId="absentContainer";denied({},"DIRECT_CARRIED_PACK_PATH_REQUIRED");supply.system.inventory.containerId=pack.id;
 supply.system.inventory.location="belt";denied({},"CURRENT_EQUIPMENT_PLACEMENT_UNSUPPORTED");supply.system.inventory.location="";
 tool.system.inventory.mode="unassigned";denied({},"CURRENT_EQUIPMENT_PLACEMENT_UNSUPPORTED");tool.system.inventory.mode="belt";
 pack.system.inventory.mode="unassigned";denied({},"PACK_NOT_CURRENTLY_CARRIED");pack.system.inventory.mode="worn";
 acting.items.push(gear("pack2",1,"worn","torso","","satchel"));denied({},"AMBIGUOUS_CARRIED_PACK_STATE");acting.items.pop();
 denied({scenarioInput:{...scenario,equipment:{...equipment,isCraftingTest:true}}},"CRAFTING_NATURE_EQUIPMENT_SCOPE_UNSUPPORTED");
 // A damaged/unusable pack is an explicit assertion, not a native damage field.
 acting.items=[cook,pack];setDice([6,4,5,3]);
 const noBonus={...scenario,equipment:{...equipment,carriesBackpackOrSatchel:false,suppliesUsed:0,gearUsed:0}};
 const noRefs={...review,pack:{...review.pack,usableGmAsserted:false},supply:null,gear:null};
 const damaged=plan({...base,scenarioInput:noBonus,equipmentReview:noRefs});safe(damaged);assert.equal(damaged.ok,true);
 assert.equal(damaged.outcomePreview.obstacle,2);assert.equal(damaged.physicalConditionAuthenticated,false);
 // BL: own pack does not grant tools to an untrained Skill; borrowed tools require an actual trained lender.
 acting.items=[cook];cook.system.rating=0;
 const loan={lenderActorId:lender.id,skillItemId:"lenderCook",packItemId:lenderPack.id,
 accessGmAsserted:true,lenderConsentGmAsserted:true,packUsableGmAsserted:true};
 const bl={...scenario,mode:"BEGINNERS_LUCK",beginnerAbilityName:"WILL",
 equipment:{...equipment,hasSkill:false,carriesBackpackOrSatchel:false,borrowedTools:true,suppliesUsed:0,gearUsed:0}};
 const loanReview={pack:null,borrowedTools:loan,supply:null,gear:null,adequacyGmReviewed:true};
 setDice([6,4]);
 const borrowed=plan({...base,scenarioInput:bl,equipmentReview:loanReview});safe(borrowed);assert.equal(borrowed.ok,true,JSON.stringify(borrowed));
 assert.equal(borrowed.toolLoanEvidence.skillItem.rating,3);assert.equal(borrowed.outcomePreview.obstacle,1);
 denied({scenarioInput:bl,equipmentReview:{...loanReview,borrowedTools:{...loan,lenderConsentGmAsserted:false}}},"EXPLICIT_TOOL_LOAN_REVIEW_REQUIRED");
 lender.items[0].system.rating=0;denied({scenarioInput:bl,equipmentReview:loanReview},"CURRENT_LENDER_TRAINED_SKILL_REQUIRED");lender.items[0].system.rating=3;
 lenderPack.system.quantity=0;denied({scenarioInput:bl,equipmentReview:loanReview},"POSITIVE_CURRENT_GEAR_QUANTITY_REQUIRED");lenderPack.system.quantity=1;
 const ownLoan={...loan,lenderActorId:acting.id};denied({scenarioInput:bl,equipmentReview:{...loanReview,borrowedTools:ownLoan}},"BORROWED_TOOLS_REQUIRE_DISTINCT_LENDER");
 denied({scenarioInput:bl,equipmentReview:{...loanReview,borrowedTools:null}},"SCENARIO_BORROWED_TOOL_REVIEW_MISMATCH");
 const absent={...bl,equipment:{...bl.equipment,borrowedTools:false}};
 const emptyReview={...loanReview,borrowedTools:null};
 const absentTools=plan({...base,scenarioInput:absent,equipmentReview:emptyReview});safe(absentTools);assert.equal(absentTools.ok,true);
 assert.equal(absentTools.outcomePreview.obstacle,2);
 denied({scenarioInput:absent,equipmentReview:{...emptyReview,supply:review.supply}},"UNUSED_SUPPLY_REFERENCE");
 globalThis.game.user=player;denied({},"CURRENT_SESSION_GM_REQUIRED");globalThis.game.user=gm;
 supply.system.quantity=99;assert.equal(good.equipmentBindings.find(b=>b.role==="SUPPLY").item.quantity,2);
 assert.equal(lenderPack.system.quantity,1);assert.equal(cook.system.rating,0);
}finally{globalThis.game=oldGame;globalThis.foundry=oldFoundry;}
console.log("PASS Package A current Gear/pack/supply quantities and carried paths, real trained tool lender; no consumption or historical equipment attestation");
