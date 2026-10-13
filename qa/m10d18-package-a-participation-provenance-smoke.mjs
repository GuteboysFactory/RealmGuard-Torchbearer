import assert from "node:assert/strict";
import {tb2ePackageAParticipationOutcomePlan as plan} from "../module/m10d18-tb2e-package-a-participation-provenance.mjs";
import {tb2ePackageAActorEvidence as read} from "../module/m10d18-tb2e-package-a-actor-evidence.mjs";
const oldGame=globalThis.game,oldFoundry=globalThis.foundry;
const forbid=()=>{throw new Error("SIDE_EFFECT");};
class Die {}
const gm={id:"gm1",active:true,isGM:true},player={id:"p1",active:true,isGM:false};
const role=(id,name,rating)=>({id,type:"role",name,system:{rating}});
const character=(id,items=[])=>({id,uuid:`Actor.${id}`,documentName:"Actor",type:"character",items,
 system:{resources:{fate:{value:0},persona:{value:0}},attributes:{will:{value:4},health:{value:3}}},
 testUserPermission:u=>u===player,update:forbid,spendTrackedResource:forbid});
const acting=character("acting",[role("actCook","Cook",4)]),helper=character("helper",[role("helpCook","Cook",3)]),
 wise=character("wise",[{id:"wiseItem",type:"wise",name:"Bread-wise",system:{}}]);
const actors=new Map([acting,helper,wise].map(a=>[a.id,a]));
const message={id:"msg1",documentName:"ChatMessage",visible:true,isContentVisible:true,
 speaker:{actor:acting.id},speakerActor:acting,author:player,rolls:[],update:forbid};
const setDice=faces=>{message.rolls=[{_evaluated:true,formula:`${faces.length}d6`,total:faces.reduce((a,b)=>a+b,0),
 terms:[Object.assign(new Die(),{number:faces.length,faces:6,modifiers:[],
 results:faces.map(result=>({result,active:true}))})],evaluate:forbid}];};
const condition=(a,name)=>a.items.push({id:name,type:"condition",name,system:{active:true}});
const scenario={skillName:"Cook",mode:"SKILL",rating:4,
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
 equipment:{hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,dwarvenCraftingNature:false,
 isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:0},
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:acting.id,actingConditions:[],conditionsGmReviewed:true};
const help={helperId:helper.id,helperConditions:[],conditionsGmReviewed:true,
 describedRelevantAction:true,actingPlayerAccepted:true,gmApprovedRelevance:true,
 helpOptions:{sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true}};
const aid={helperId:wise.id,helperConditions:[],conditionsGmReviewed:true,hasWise:true,related:true};
const base={actorId:acting.id,messageId:message.id,scenarioInput:scenario};
const safe=p=>{for(const k of ["liveApplication","actorWrite","itemWrite","journalWrite","settingsWrite",
 "rollExecuted","resourceSpendCommitted","advancementWrite","learningWrite","actorSourceAuthenticated",
 "rollSourceAuthenticated","gmPermissionAuthenticated","rollTimeActorStateVerified",
 "historicalRewardBalanceVerified","playerConsentAuthenticated"])assert.equal(p[k],false,k);
 assert.equal(p.writesPlanned,0);assert.equal(Object.isFrozen(p),true);};
const denied=(input,code)=>{const p=plan({...base,...input});safe(p);assert.equal(p.ok,false,JSON.stringify(p));
 assert.equal(p.reasonCode,code,JSON.stringify(p));};
try {
 globalThis.foundry={dice:{terms:{Die}}};
 globalThis.game={ready:true,system:{id:"realm-guard"},user:gm,actors,
 users:new Map([[gm.id,gm],[player.id,player]]),messages:new Map([[message.id,message]]),
 settings:{set:forbid},socket:{emit:forbid}};
 setDice([6,4,5,3,2]);
 const snapshot=read({actorId:acting.id});safe(snapshot);assert.equal(snapshot.ok,true);
 assert.equal(snapshot.currentAbilities.will,4);assert.equal(snapshot.currentSkillItems[0].rating,4);
 assert.equal(Object.isFrozen(acting.items[0].system),false);
 const alone=plan(base);safe(alone);assert.equal(alone.ok,true,JSON.stringify(alone));
 assert.equal(alone.outcomePreview.advancementPreview,null);
 denied({helpSourceItemId:"unused"},"UNUSED_HELP_SOURCE_ITEM_ID");
 denied({wiseAidItemId:"unused"},"UNUSED_WISE_AID_ITEM_ID");
 denied({scenarioInput:{...scenario,actingCharacterId:"foreign"}},"CURRENT_ACTOR_ID_MISMATCH");
 denied({dice:[6,6,6,6,6]},"UNSUPPORTED_PARTICIPATION_FIELDS");
 acting.items[0].id=null;denied({},"INVALID_CURRENT_ACTOR_SKILL_ITEM");acting.items[0].id="actCook";
 setDice([6,4,5,3,2,1,6]);
 const supported={...base,scenarioInput:{...scenario,help,wiseAid:aid},helpSourceItemId:"helpCook",wiseAidItemId:"wiseItem"};
 const before=JSON.stringify([acting,helper,wise,message]);
 const good=plan(supported);safe(good);assert.equal(good.ok,true,JSON.stringify(good));
 assert.equal(good.outcomePreview.finalDicePool,7);assert.equal(good.outcomePreview.rawSuccesses,4);
 assert.equal(good.participantEvidence.length,3);assert.equal(good.currentHelpSource.rating,3);
 assert.equal(good.currentWiseAidSource.itemId,"wiseItem");assert.equal(good.playerAcceptanceGmAsserted,true);
 assert.equal(good.participationAtRollTimeVerified,false);
 assert.equal(JSON.stringify([acting,helper,wise,message]),before);
 denied({...supported,helpSourceItemId:"wrong"},"CURRENT_HELPER_SKILL_ITEM_REQUIRED");
 denied({...supported,wiseAidItemId:"wrong"},"CURRENT_WISE_AID_ITEM_REQUIRED");
 denied({...supported,scenarioInput:{...supported.scenarioInput,help:{...help,actingPlayerAccepted:false}}},
 "PREVIEW_SCENARIO_HELP_ACTING_PLAYER_DID_NOT_ACCEPT_HELP");
 denied({...supported,scenarioInput:{...supported.scenarioInput,help:{...help,helperId:acting.id}}},"HELP_REQUIRES_DISTINCT_CHARACTER");
 denied({...supported,scenarioInput:{...supported.scenarioInput,wiseAid:{...aid,helperId:helper.id}}},
 "SAME_HELPER_CANNOT_HELP_AND_WISE_AID");
 denied({...supported,scenarioInput:{...supported.scenarioInput,help:{...help,helperId:"missing"}}},
 "HELPER_WORLD_CHARACTER_ACTOR_REQUIRED");
 helper.isToken=true;denied(supported,"HELPER_WORLD_CHARACTER_ACTOR_REQUIRED");delete helper.isToken;
 condition(helper,"Afraid");denied(supported,"CURRENT_HELPER_CONDITIONS_MISMATCH");
 denied({...supported,scenarioInput:{...supported.scenarioInput,help:{...help,helperConditions:["Afraid"]}}},
 "PREVIEW_SCENARIO_CONDITION_AFRAID_BLOCKS_HELP");helper.items.pop();
 helper.items[0].system.rating=1;condition(helper,"Injured");
 denied({...supported,scenarioInput:{...supported.scenarioInput,help:{...help,helperConditions:["Injured"]}}},
 "HELPER_ZERO_RATED_SOURCE_CANNOT_HELP");helper.items.pop();helper.items[0].system.rating=3;
 helper.items[0].system.rating=2;condition(helper,"Sick");condition(helper,"Injured");
 denied({...supported,scenarioInput:{...supported.scenarioInput,help:{...help,helperConditions:["Sick","Injured"]}}},
 "HELPER_ZERO_RATED_SOURCE_CANNOT_HELP");helper.items.pop();helper.items.pop();helper.items[0].system.rating=3;
 condition(helper,"Dead");
 denied({...supported,scenarioInput:{...supported.scenarioInput,help:{...help,helperConditions:["Dead"]}}},
 "PREVIEW_SCENARIO_CONDITION_DEAD_HELPER_CANNOT_HELP");helper.items.pop();
 condition(wise,"Angry");
 denied({...supported,scenarioInput:{...supported.scenarioInput,wiseAid:{...aid,helperConditions:["Angry"]}}},
 "PREVIEW_SCENARIO_CONDITION_ANGRY_BLOCKS_BENEFICIAL_WISES");wise.items.pop();
 condition(wise,"Dead");
 denied({...supported,scenarioInput:{...supported.scenarioInput,wiseAid:{...aid,helperConditions:["Dead"]}}},
 "PREVIEW_SCENARIO_CONDITION_DEAD_WISE_HELPER_CANNOT_AID");wise.items.pop();
 wise.items.push({id:"secondWise",type:"wise",name:" BREAD-WISE ",system:{}});
 denied(supported,"CURRENT_WISE_AID_ITEM_REQUIRED");wise.items.pop();
 helper.items.push(role("duplicate","Cook",2));denied(supported,"CURRENT_HELPER_SKILL_ITEM_REQUIRED");helper.items.pop();
 // Beginner's Luck: a default role with rating 0 is untrained, not a Skill-4 entitlement.
 acting.items[0].system.rating=0;condition(acting,"Fresh");
 const bl={...scenario,mode:"BEGINNERS_LUCK",beginnerAbilityName:"WILL",actingConditions:["Fresh"],
 equipment:{...scenario.equipment,hasSkill:false}};
 setDice([6,4,5,3]);
 const beginner=plan({...base,scenarioInput:bl});safe(beginner);assert.equal(beginner.ok,true,JSON.stringify(beginner));
 assert.equal(beginner.outcomePreview.finalDicePool,4); // ceil((Will4 + supplies1)/2) + Fresh1
 assert.equal(beginner.currentActingSource.kind,"ABILITY");assert.equal(beginner.currentActingSource.rating,4);
 assert.equal(beginner.currentActingSource.untrainedRoleItemId,"actCook");
 const blHelp={...help,helpOptions:{sourceKind:"skill",sourceName:"Cook",targetSkillName:"Cook",helperSkillTrained:true}};
 setDice([6,4,5,3,2]);
 const blAll=plan({...base,scenarioInput:{...bl,help:blHelp,wiseAid:aid},helpSourceItemId:"helpCook",wiseAidItemId:"wiseItem"});
 safe(blAll);assert.equal(blAll.ok,true,JSON.stringify(blAll));assert.equal(blAll.outcomePreview.finalDicePool,5);
 assert.equal(blAll.outcomePreview.advancementPreview,null);
 const abilityHelp={...help,helpOptions:{sourceKind:"ability",sourceName:"Will",targetSkillName:"Cook"}};
 denied({scenarioInput:{...bl,help:abilityHelp}},"BEGINNER_HELPER_MUST_USE_CURRENT_TRAINED_SKILL");
 helper.items[0].system.rating=0;setDice([6,4,5,3]);
 const abilityGood=plan({...base,scenarioInput:{...bl,help:abilityHelp}});
 safe(abilityGood);assert.equal(abilityGood.ok,true,JSON.stringify(abilityGood));
 assert.equal(abilityGood.currentHelpSource.kind,"ABILITY");
 helper.system.attributes.will.value=1;condition(helper,"Sick");
 denied({scenarioInput:{...bl,help:{...abilityHelp,helperConditions:["Sick"]}}},"HELPER_ZERO_RATED_SOURCE_CANNOT_HELP");
 helper.items.pop();helper.system.attributes.will.value=4;
 denied({scenarioInput:{...bl,beginnerAbilityName:"HEALTH"}},"CURRENT_BEGINNERS_LUCK_ABILITY_MISMATCH");
 acting.items[0].system.rating=2;denied({scenarioInput:bl},"BEGINNERS_LUCK_REQUIRES_CURRENT_UNTRAINED_SKILL");
 acting.items[0].system.rating=0;
 acting.items.push(role("dup","Cook",0));denied({scenarioInput:bl},"AMBIGUOUS_CURRENT_ACTOR_SKILL");acting.items.pop();
 acting.items.pop();condition(acting,"Afraid");
 denied({scenarioInput:{...bl,actingConditions:["Afraid"]}},"PREVIEW_SCENARIO_CONDITION_AFRAID_BLOCKS_BEGINNERS_LUCK");acting.items.pop();
 acting.system.attributes.will.value=1;condition(acting,"Injured");
 const zero=plan({...base,scenarioInput:{...bl,rating:1,actingConditions:["Injured"]}});
 safe(zero);assert.equal(zero.ok,false);assert.match(zero.reasonCode,/ZERO/);acting.items.pop();acting.system.attributes.will.value=4;
 // Absence of a skill also permits BL; no automatic provisioning.
 acting.items=[];setDice([6,4,5]);
 const absent=plan({...base,scenarioInput:{...bl,actingConditions:[]}});safe(absent);assert.equal(absent.ok,true);
 // A Health-based target must read actual Health, never caller-selected Will.
 setDice([6,4]);
 const healthBl={...bl,skillName:"Dungeoneer",beginnerAbilityName:"HEALTH",rating:3,actingConditions:[],
 factor:{tableName:"delve",gmAuthorized:true,selections:{terrain:"vertical",people:"one"}}};
 const health=plan({...base,scenarioInput:healthBl});safe(health);assert.equal(health.ok,true,JSON.stringify(health));
 assert.equal(health.currentActingSource.name,"HEALTH");assert.equal(health.outcomePreview.finalDicePool,2);
 denied({scenarioInput:{...healthBl,beginnerAbilityName:"WILL",rating:4}},"CURRENT_BEGINNERS_LUCK_ABILITY_MISMATCH");
 denied({scenarioInput:{...bl,actingConditions:[],bonuses:{personaDice:1}}},"PARTICIPATION_BRIDGE_SCOPE_UNSUPPORTED");
 denied({scenarioInput:{...bl,actingConditions:[],actingOnInstinct:true}},"PARTICIPATION_BRIDGE_SCOPE_UNSUPPORTED");
 denied({scenarioInput:{...bl,actingConditions:[],heroicRatingSevenUnlocked:true}},"PARTICIPATION_BRIDGE_SCOPE_UNSUPPORTED");
 denied({helpSourceItemId:"unused"},"CURRENT_ACTOR_SKILL_RATING_MISMATCH"); // base trained scenario now lacks the Skill
 globalThis.game.user=player;
 const savedActors=globalThis.game.actors;globalThis.game.actors={get:forbid};
 const blocked=read({actorId:acting.id});safe(blocked);assert.equal(blocked.reasonCode,"CURRENT_SESSION_GM_REQUIRED");
 denied({},"CURRENT_SESSION_GM_REQUIRED");globalThis.game.actors=savedActors;globalThis.game.user=gm;
 acting.system.attributes.will.value=6;
 assert.equal(snapshot.currentAbilities.will,4,"Detached Actor evidence must preserve old observations");
 assert.equal(good.currentHelpSource.rating,3,"Returned helper snapshot does not track live mutations");
}finally{globalThis.game=oldGame;globalThis.foundry=oldFoundry;}
console.log("PASS Package A Actor-backed Skill/BL/Help/Wise aid facts, zero-rated helpers, Fresh staging, consent assertions and zero writes");
