import assert from "node:assert/strict";
import { CharacterCreationEngine, CreationPartyContext, CreationCommitPlan } from "../module/core/m9-creation.mjs";
import { FoundryCreationCommitAdapter } from "../module/m9-creation-commit-adapter.mjs";
import { TB2E_WIZARD_CREATION_PROFILE, MODEL, blankAnswers } from "../module/profiles/torchbearer2e-wizard-creation.mjs";
import { tb2eWizardTest, commitTb2eWizard } from "../module/tb2e-recruitment.mjs";

  const engine=new CharacterCreationEngine(TB2E_WIZARD_CREATION_PROFILE);
  const party=new CreationPartyContext();
  const nature={
    HUMAN:{q1:"BOAST",q2:"DEMAND_RIGHTS",q3:"FLEE_HIDE"},
    ELF:{q1:"SING",q2:"RETREAT_HIDE",q3:"JOURNEY_WEST"},
    DWARF:{q1:"REVENGE",q2:"DIG_DEEPER",q3:"CRAFT"},
    HALFLING:{q1:"FEAST",q2:"RIDDLE",q3:"SNEAK"}
  };
  function sample(className){
    const stock=MODEL.classRules[className].stock;
    const answers={...blankAnswers(),name:`QA ${className}`,className,will:4,health:4,
      upbringing:"CRIMINAL",home:"REMOTE_VILLAGE",hometown:"Oak",homeSkill:"CARPENTER",homeTrait:"ROUGH_HANDS",
      socialGrace:"PERSUADER",specialty:"SCOUT",natureAnswers:nature[stock],
      stockWise:MODEL.wises[stock].stockChoices[0]??"",customWise:"Troll-wise",
      relationships:{route:"social",parents:true,mentor:true,enemy:false,friendIsAdventurer:false},
      people:{friend:{name:"A",profession:"Cook",location:"Oak",lastSeen:"Last spring"},mother:{name:"B"},father:{},mentor:{name:"C"},enemy:{}},
      familyName:"Oakborn",parentsProfession:"Carpenters",
      gear:[{name:"Backpack",type:"gear",system:{quantity:1,inventory:{containerType:"backpack",capacity:6,mode:"unassigned",location:"",containerId:""}},flags:{"realm-guard":{creationSourceUuid:"Item.pack"}}}],
      gearReviewed:true,magicNotes:"GM-agreed starting spells or relics",drives:{belief:"Protect my friends",goal:"Find the gate",instinct:"Always check the rope"},
      age:MODEL.ageRanges[stock].min,raiment:"Green cloak"};
    return {mode:"guided",answers,allocations:{skills:{...MODEL.classRules[className].skills}}};
  }
  for(const className of MODEL.classes) {
    const state=sample(className),draft=engine.createDraft(state);
    assert.equal(engine.validate(draft,party).valid,true,className);
    const review=engine.validateStep("review",draft,party);
    assert.deepEqual(review.errors,[],`${className}: ${JSON.stringify(review.errors)}`);
    const plan=engine.buildCommitPlan(draft,party);
    assert.equal(plan.transaction.liveExecution,false);
    assert.equal(plan.actor.system.rank,"","Class must not be stored as a Ranger station.");
    assert.equal(plan.actor.flags["realm-guard"].tb2eCreation.className,className);
    assert.equal(plan.actor.system.attributes.nature.value,6);
    assert.equal(plan.actor.system.attributes.circles.value,4);
    assert.equal(plan.actor.system.attributes.resources.value,0);
    assert.equal(plan.actor.system.creed,"");
    assert.equal(plan.provisioning.canonicalConditions.documents.find(x=>x.name==="Fresh").system.active,true);
    assert.equal(plan.provisioning.canonicalConditions.documents.filter(x=>x.system.active).length,1);
    assert.equal(plan.provisioning.canonicalSkills.ratings.Carpenter.rating,2);
    assert.equal(plan.provisioning.canonicalSkills.ratings.Persuader.rating,2);
    assert.ok(!plan.provisioning.canonicalSkills.names.includes("Weather Watcher"));
    assert.equal(plan.provisioning.wises.length,MODEL.classRules[className].stock==="HUMAN"?1:2);
    if(MODEL.classRules[className].stock==="HUMAN")assert.equal(plan.provisioning.canonicalSkills.ratings.Criminal.rating,3);
  }
  const dwarf=sample("OUTCAST");
  dwarf.answers.natureAnswers={q1:"NEGOTIATE",q2:"FEAR_BELOW",q3:"SPEND_GOLD"};
  let draft=engine.createDraft(dwarf);
  assert.equal(draft.derivedValues.abilities.resources,1);
  assert.equal(draft.derivedValues.nature,3);
  assert.equal(draft.derivedValues.traitChecks["Born of Earth and Stone"],2);
  assert.ok(draft.derivedValues.natureDescriptors.includes("Negotiating"));
  const human=sample("WARRIOR");
  human.answers.natureAnswers={q1:"PREPARE",q2:"LISTEN_ELDERS",q3:"FIGHT"};
  human.answers.replacementTrait="LONER";human.answers.secondWise="POLITICS_WISE";
  human.answers.relationships={route:"loner",parents:false,mentor:false,enemy:false};
  human.answers.people.enemy={name:"Enemy"};
  draft=engine.createDraft(human);
  assert.deepEqual(engine.validateStep("review",draft,party).errors,[]);
  assert.equal(draft.derivedValues.traitChecks.Loner,2);
  assert.equal(draft.derivedValues.abilities.circles,1);
  assert.equal(draft.derivedValues.wises.length,2);
  assert.equal(draft.derivedValues.traitChecks["Rough Hands"],undefined);
  const magician=sample("MAGICIAN");
  magician.answers.relationships={route:"loner"};
  assert.ok(engine.validateStep("relationships",engine.createDraft(magician),party).errors.length);
  const noParents=sample("WARRIOR");
  noParents.answers.relationships.parents=false;noParents.answers.relationships.mentor=false;
  noParents.answers.keepsake="Old pendant";noParents.answers.goldPouchConfirmed=true;
  const treasurePlan=engine.buildCommitPlan(engine.createDraft(noParents),party);
  assert.ok(treasurePlan.provisioning.gear.some(x=>x.name==="Old pendant"&&x.flags["realm-guard"].treasureDice===1));
  assert.ok(treasurePlan.provisioning.gear.some(x=>x.name==="Self-made gold pouch"&&x.flags["realm-guard"].treasureDice===2));
  const invalid=sample("WARRIOR");
  invalid.allocations.skills.FIGHTER=5;
  assert.ok(engine.validateStep("skills",engine.createDraft(invalid),party).errors.length);
  assert.throws(()=>engine.buildCommitPlan(engine.createDraft(invalid),party));
  const collision=new CreationPartyContext({existingCharacters:[{name:"Another PC",specialty:"Scout"}]});
  assert.ok(engine.validateStep("specialty",engine.createDraft(sample("WARRIOR")),collision).errors.length);
  // Class changes recalculate from source; no prior stock traits or Nature survive.
  const before=engine.createDraft(sample("OUTCAST"));
  const next=sample("RANGER");
  const after=engine.updateDraft(before,{answers:next.answers,allocations:next.allocations});
  assert.equal(after.derivedValues.identity.stock,"ELF");
  assert.equal(after.derivedValues.traitChecks["Born of Earth and Stone"],undefined);
  assert.equal(after.derivedValues.traitChecks["First Born"],1);

  let created=0,deleted=0,provenance=0;
  const fakeActor={id:"test-pc",async setFlag(){provenance++;},async delete(){deleted++;}};
  const adapter=new FoundryCreationCommitAdapter({shadowOnly:false,runtime:{
    ensureFolder:async()=>({id:"pc"}),createActor:async()=>{created++;return fakeActor;},
    applySkillRatings:async()=>{},createPlannedItems:async()=>{},ensureConditions:async()=>{},normalizeRelationships:async()=>{}
  }});
  const raw=engine.buildCommitPlan(engine.createDraft(sample("WARRIOR")),party);
  assert.throws(()=>adapter.execute(raw),/not enabled/);
  assert.equal(created,0);
  const live=new CreationCommitPlan({...raw,transaction:{...raw.transaction,liveExecution:true}});
  const rulesSnapshot={profileId:"torchbearer2e",profileVersion:1,rulesSnapshotHash:"test-only"};
  await assert.rejects(adapter.execute(live,{rulesSnapshot:{...rulesSnapshot,profileId:"mg2e"}}),/profile mismatch/);
  assert.equal(created,0);
  for(const faultPhase of ["PROVISION_SKILLS","CREATE_ITEMS","PROVISION_CONDITIONS","NORMALIZE_RELATIONSHIPS","WRITE_PROVENANCE"]) {
    await assert.rejects(adapter.execute(live,{rulesSnapshot,faultPhase}),e=>e.realmGuardCommit.rolledBack);
  }
  assert.equal(deleted,5);
  const result=await adapter.execute(live,{rulesSnapshot});
  assert.equal(result.rolledBack,false);assert.equal(provenance,1);

  // Exercise the actual M9 skill/item provisioners with a document-shaped runtime.
  const materialized={id:"materialized",items:[],async createEmbeddedDocuments(type,docs){
    const made=docs.map((doc,i)=>({...structuredClone(doc),id:"item-"+(this.items.length+i)}));
    this.items.push(...made);return made;
  },async updateEmbeddedDocuments(type,updates){
    for(const update of updates){
      const item=this.items.find(x=>x.id===update._id);
      for(const [path,val] of Object.entries(update))if(path.startsWith("system."))item.system[path.slice(7)]=val;
    }
  },async setFlag(){},async delete(){}};
  const actualAdapter=new FoundryCreationCommitAdapter({shadowOnly:false,runtime:{
    ...tb2eWizardTest.adapter.runtime,
    ensureFolder:async()=>({id:"pc"}),createActor:async()=>materialized,normalizeRelationships:async()=>{}
  }});
  await actualAdapter.execute(live,{rulesSnapshot});
  assert.equal(materialized.items.filter(x=>x.type==="role").length,33);
  assert.equal(materialized.items.find(x=>x.name==="Carpenter"&&x.type==="role").system.rating,2);
  assert.equal(materialized.items.find(x=>x.name==="Criminal"&&x.type==="role").system.rating,3);
  assert.equal(materialized.items.find(x=>x.name==="Fresh").system.active,true);
  assert.ok(!materialized.items.some(x=>x.name==="Strained"||x.name==="Tired"));
  assert.equal(materialized.items.filter(x=>x.type==="condition").length,8);
  // Production entry point remains closed until both source readiness and profile authority are available.
  await assert.rejects(commitTb2eWizard(sample("WARRIOR")),/verification/);

  let dialogConfig,action="cancel",form={elements:{}},warnings=[];
  globalThis.game={user:{isGM:true},actors:{contents:[]},items:{contents:[]}};
  globalThis.ui={notifications:{warn:x=>warnings.push(x),error:x=>warnings.push(x)}};
  const htmlEscape=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  globalThis.foundry={utils:{escapeHTML:htmlEscape},applications:{api:{DialogV2:{wait:async config=>{
    dialogConfig=config;
    return config.buttons.find(x=>x.action===action)?.callback(null,{form})??null;
  }}}}};
  for(let i=0;i<11;i++) {
    const state=sample("WARRIOR"),snapshot=JSON.stringify(state);
    assert.equal(await tb2eWizardTest.STEPS[i](state),"cancel");
    assert.equal(JSON.stringify({...state,draft:undefined}),snapshot,"Cancel must not commit form values.");
    assert.match(dialogConfig.content,/rg-recruitment/);
    assert.match(dialogConfig.content,new RegExp(`STEP ${i+1}/11`));
    assert.equal(dialogConfig.buttons.some(x=>x.action==="back"),i>0);
  }
  const backState=sample("WARRIOR");action="back";
  form={elements:{belief:{value:"Changed belief"},goal:{value:"Changed goal"},instinct:{value:"Changed instinct"}}};
  assert.equal(await tb2eWizardTest.STEPS[8](backState),"back");
  assert.equal(backState.answers.drives.goal,"Changed goal");
  assert.equal(created,6,"UI Back and Cancel must never create Actors.");
  const escaped=sample("WARRIOR");escaped.answers.name="<script>alert(1)</script>";action="cancel";
  await tb2eWizardTest.STEPS[10](escaped);
  assert.ok(!dialogConfig.content.includes("<script>"));
  assert.ok(dialogConfig.content.includes("&lt;script&gt;"));
  const item={uuid:"Item.source",toObject:()=>({_id:"source",name:"Backpack",type:"gear",system:{quantity:1,inventory:{mode:"container",containerId:"old",location:"torso",capacity:6,containerType:"backpack"}},flags:{custom:{preserved:true}}})};
  const copied=tb2eWizardTest.copyGear(item);
  assert.equal(copied._id,undefined);assert.equal(copied.system.inventory.containerId,"");
  assert.equal(copied.system.inventory.capacity,6);assert.equal(copied.flags.custom.preserved,true);
  assert.equal(item.toObject().system.inventory.containerId,"old");
  assert.equal(TB2E_WIZARD_CREATION_PROFILE.metadata.releaseReady,false);
  console.log("PASS TB2E wizard candidate: six classes, source-derived values, validation, isolated UI shell, Back/Cancel, escaping, existing Gear copies, M9 rollback and closed release gate.");
