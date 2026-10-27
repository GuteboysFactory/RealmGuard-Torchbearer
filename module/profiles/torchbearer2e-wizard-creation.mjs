import { CharacterCreationProfile } from "../core/m9-creation.mjs";
import { tb2eCreationModel, tb2eClassStockPlan, tb2eSkillRedistributionPlan, tb2eHumanUpbringingPlan, tb2eHomePlan, tb2eSocialGracePlan, tb2eSpecialtyPlan, tb2eNatureQuestionnairePlan, tb2eStartingWisesPlan, tb2eFinalDetailsPlan, tb2eLevelOneBenefitPlan, tb2eStartingEquipmentBoundaryPlan } from "../m10d-tb2e-creation-shadow.mjs";
import { tb2eStartingRelationshipsPlan } from "../m10d-tb2e-circles-shadow.mjs";
import { tb2eAbilitySkillModel } from "../m10d-tb2e-abilities-shadow.mjs";
import { tb2eConditionModel } from "../m10d-tb2e-conditions-shadow.mjs";

  const MODEL = tb2eCreationModel();
  const SKILLS = tb2eAbilitySkillModel().skills.names;
  const ID = "torchbearer2e";
  const key = value => String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  const label = value => {
    const names={WIZARDS_SIGHT:"Wizard's Sight",BORN_OF_EARTH_AND_STONE:"Born of Earth and Stone",TOUCHED_BY_THE_GODS:"Touched by the Gods",HEART_OF_BATTLE:"Heart of Battle",HUNGRY_THIRSTY:"Hungry & Thirsty"};
    if(names[key(value)])return names[key(value)];
    const known = SKILLS.find(name => key(name) === key(value));
    if (known) return known;
    return String(value ?? "").toLowerCase().split("_").map(word => word ? word[0].toUpperCase()+word.slice(1) : "").join(" ");
  };
  const clean = value => String(value ?? "").trim();
  const clone = value => JSON.parse(JSON.stringify(value));
  const STEP_IDS = ["identity","skills","home","specialty","nature","wises","relationships","gear","drives","details","review"];
  const STEP_TITLES = ["Stock & Class","Skills & Upbringing","Home","Social Graces & Specialty","Nature","Wises","Circles & Relationships","Starting Equipment","Belief, Goal & Instinct","Final Details","Review"];
  function blankAnswers() {
    return {
      name:"", concept:"", background:"", className:"", will:4, health:4,
      home:"", hometown:"", homeSkill:"", homeTrait:"", upbringing:"", socialGrace:"", specialty:"",
      natureAnswers:{q1:"",q2:"",q3:""}, replacementTrait:"", secondWise:"",
      stockWise:"", customWise:"", relationships:{route:"social",parents:false,mentor:false,enemy:false,friendIsAdventurer:false},
      people:{friend:{},mother:{},father:{},mentor:{},enemy:{}},
      gear:[], gearReviewed:false, magicNotes:"", keepsake:"", goldPouchConfirmed:false,
      drives:{belief:"",goal:"",instinct:""}, age:"", raiment:"", openSheet:true
    };
  }
  function derive({answers:a,allocations}) {
    const cls = tb2eClassStockPlan({className:a.className,will:a.will,health:a.health});
    const stock = cls.stock ?? MODEL.classRules[key(a.className)]?.stock ?? "";
    const problems = {};
    const check = (step,plan) => {
      if (!plan.ok) (problems[step] ??= []).push(plan.reasonCode);
      return plan;
    };
    check("identity",cls);
    const redistributed = check("skills",tb2eSkillRedistributionPlan({className:a.className,proposedSkills:allocations.skills ?? cls.skills ?? {}}));
    const skills = {...(redistributed.ok ? redistributed.skills : cls.skills ?? {})};
    const apply = (name,plan,field="finalRating") => { if(plan.ok) skills[key(name)] = plan[field]; };
    if(stock === "HUMAN") apply(a.upbringing,check("skills",tb2eHumanUpbringingPlan({stock,skill:a.upbringing,currentRating:skills[key(a.upbringing)]??0})));
    apply(a.homeSkill,check("home",tb2eHomePlan({stock,home:a.home,skill:a.homeSkill,trait:a.homeTrait,currentSkillRating:skills[key(a.homeSkill)]??0})),"finalSkillRating");
    apply(a.socialGrace,check("specialty",tb2eSocialGracePlan({skill:a.socialGrace,currentRating:skills[key(a.socialGrace)]??0})));
    apply(a.specialty,check("specialty",tb2eSpecialtyPlan({skill:a.specialty,currentRating:skills[key(a.specialty)]??0})));
    const nature = check("nature",tb2eNatureQuestionnairePlan({stock,answers:a.natureAnswers,replacementTrait:a.replacementTrait,secondWise:a.secondWise}));
    const wisePlan = check("wises",tb2eStartingWisesPlan({stock,stockWise:a.stockWise,customWise:a.customWise}));
    const rel = a.relationships ?? {};
    const relationships = check("relationships",tb2eStartingRelationshipsPlan({
      friend:rel.route==="social",loner:rel.route==="loner",parents:!!rel.parents,mentor:!!rel.mentor,enemy:!!rel.enemy,
      characterClass:a.className,characterLevel:1,friendIsAdventurer:!!rel.friendIsAdventurer,
      lonerTraitAlreadyOwned:key(nature.homeTraitReplacement || a.homeTrait)==="LONER"
    }));
    check("details",tb2eFinalDetailsPlan({stock,name:a.name,raiment:a.raiment,age:a.age}));
    const traits = {};
    if(cls.trait) traits[label(cls.trait)] = nature.classTraitLevelPreview ?? 1;
    const homeTrait = nature.homeTraitReplacement || a.homeTrait;
    if(homeTrait) traits[label(homeTrait)] = (traits[label(homeTrait)]??0)+1;
    if(relationships.ok && relationships.route==="LONER") traits.Loner = (traits.Loner??0)+1;
    const wises = wisePlan.ok ? wisePlan.startingWises.map(w => /^[A-Z_]+$/.test(w)?label(w):w) : [];
    if(nature.wisePreview) wises.push(label(nature.wisePreview).replace(/ Wise$/, "-wise"));
    return {derivedValues:{
      identity:{name:clean(a.name),className:key(a.className),stock,level:1,hometown:clean(a.hometown),age:a.age},
      nature:nature.startingNaturePreview??0,
      abilities:{will:cls.will??0,health:cls.health??0,nature:nature.startingNaturePreview??0,resources:nature.resourcesPreview??0,circles:relationships.startingCirclesPreview??1},
      skillRatings:Object.fromEntries(Object.entries(skills).map(([name,rating])=>[label(name),rating])),
      skillChecks:{}, traitChecks:traits, wiseChecks:Object.fromEntries(wises.map(w=>[w,1])),wises,
      natureDescriptors:(nature.descriptorsPreview??[]).map(label),
      relationships, gear:clone(a.gear??[]),problems,
      levelOne:tb2eLevelOneBenefitPlan({className:a.className}).benefits??[],
      equipment:tb2eStartingEquipmentBoundaryPlan({className:a.className}),
      grants:[{source:"CC 6-48",className:key(a.className),skills:Object.keys(skills)}]
    },warnings:[]};
  }
  const issue = (field,message,code="TB2E_CREATION") => ({field,message,code});
  function validateStep({stepId,draft,partyContext}) {
    const a=draft.answers, d=draft.derivedValues;
    const errors=[];
    for(const reason of d.problems[stepId]??[]) errors.push(issue(stepId,reason.replaceAll("_"," ").toLowerCase(),reason));
    const need=(test,field,message)=>{if(!test)errors.push(issue(field,message));};
    if(stepId==="identity") need(clean(a.name),"name","Enter the character's name.");
    if(stepId==="home") need(clean(a.hometown),"hometown","Name your hometown.");
    if(stepId==="specialty") {
      const others=[...(partyContext?.existingCharacters??[]),...(partyContext?.otherDraftCharacters??[])];
      const taken=others.find(row=>key(row.specialty)===key(a.specialty)&&key(a.specialty));
      need(!taken,"specialty",`That specialty is already taken by ${taken?.name??"another party member"}.`);
    }
    if(stepId==="wises") {
      const names=d.wises.map(x=>key(x.replace(/-wise$/i,"")));
      need(new Set(names).size===names.length,"customWise","Choose different Wises.");
    }
    if(stepId==="relationships" && d.relationships.ok) {
      const people=a.people??{}, rel=d.relationships;
      if(rel.route==="SOCIAL") {
        need(clean(people.friend?.name),"people.friend.name","Name your friend.");
        for(const field of ["profession","location","lastSeen"]) need(clean(people.friend?.[field]),`people.friend.${field}`,`Record your friend's ${field}.`);
        if(a.relationships.friendIsAdventurer) {
          need(clean(people.friend?.className),"people.friend.className","Record your adventurer friend's class.");
          need(clean(people.friend?.specialty),"people.friend.specialty","Record your adventurer friend's specialty.");
        }
        if(a.relationships.parents) {
          need(clean(people.mother?.name)||clean(people.father?.name),"people.parents","Name your parent or parents.");
          need(clean(a.familyName),"familyName","Record your family name.");
          need(clean(a.parentsProfession),"parentsProfession","Record your parents' profession.");
        } else need(clean(a.keepsake),"keepsake","Describe the keepsake from your parents (1D treasure).");
        if(a.relationships.mentor) need(clean(people.mentor?.name),"people.mentor.name","Name your mentor.");
        else need(a.goldPouchConfirmed,"goldPouchConfirmed","Confirm the self-made 2D gold pouch.");
      }
      if(rel.selectedRelationships.includes("ENEMY")) need(clean(people.enemy?.name),"people.enemy.name","Name your enemy.");
    }
    if(stepId==="gear") {
      const gear=a.gear??[];
      need(gear.filter(x=>["BACKPACK","SATCHEL"].includes(key(x.system?.inventory?.containerType)) || ["BACKPACK","SATCHEL"].includes(key(x.name))).length === 1,"gear","Choose exactly one existing Backpack or Satchel Item.");
      need(gear.every(x=>x.type==="gear" && clean(x.name) && x.system && !x._id),"gear","Equipment must be copied from existing Gear Items.");
      need(a.gearReviewed,"gearReviewed","Confirm the starting equipment with your GM.");
      if(["MAGICIAN","THEURGE"].includes(key(a.className))) need(clean(a.magicNotes),"magicNotes","Record the starting spells or relics/invocations agreed with your GM.");
      // Exact class restrictions use the existing source-owned policy. Unrecognized custom names remain GM-adjudicated.
      const p=d.equipment?.weaponPolicy;
      for(const g of gear) {
        const name=key(g.name);
        const weaponNames=["DAGGER","STAFF","SWORD","SPEAR","BOW","CROSSBOW","GREATSWORD","HALBERD","POLEARM","AXE","MACE","SLING"];
        if(weaponNames.includes(name)) {
          if(p?.allowed) need(p.allowed.includes(name),"gear",`${g.name} is not a starting weapon for this class.`);
          if(p?.excluded) need(!p.excluded.includes(name),"gear",`${g.name} is not a starting weapon for this class.`);
        }
      }
    }
    if(stepId==="drives") for(const field of ["belief","goal","instinct"]) need(clean(a.drives?.[field]),`drives.${field}`,`Write your ${field}.`);
    if(stepId==="details") need(clean(a.raiment),"raiment","Describe your raiment.");
    if(stepId==="review") for(const id of STEP_IDS.filter(id=>id!=="review")) errors.push(...validateStep({stepId:id,draft,partyContext}).errors);
    return {errors,warnings:[]};
  }
  function personText(p={}) {return [p.name,p.profession,p.location].map(clean).filter(Boolean).join(", ");}
  function buildCommitSpec({draft,partyContext}) {
    const validation=validateStep({stepId:"review",draft,partyContext});
    if(validation.errors.length) throw new Error(validation.errors[0].message);
    const a=draft.answers,d=draft.derivedValues,b=d.abilities,r=d.relationships,p=a.people??{};
    const people={
      version:1,homeland:a.hometown,
      mother:r.route==="SOCIAL"&&a.relationships.parents?p.mother??{}:{},
      father:r.route==="SOCIAL"&&a.relationships.parents?p.father??{}:{},
      friend:r.route==="SOCIAL"?p.friend??{}:{},
      mentor:r.route==="SOCIAL"&&a.relationships.mentor?p.mentor??{}:{},
      enemy:r.selectedRelationships.includes("ENEMY")?p.enemy??{}:{},seniorArtisan:{}
    };
    const itemFlags={ "realm-guard":{tb2eCreation:true} };
    const treasure=[];
    if(r.route==="SOCIAL" && !a.relationships.parents) treasure.push({name:clean(a.keepsake),dice:1});
    if(r.route==="SOCIAL" && !a.relationships.mentor) treasure.push({name:"Self-made gold pouch",dice:2});
    return {
      actor:{
        name:clean(a.name),type:"character",folder:{documentName:"Actor",name:"PC"},ownershipPolicy:"CREATOR_OWNER_IF_NON_GM",
        createOptions:{realmGuardSkipRecruitmentProvisioning:true},
        system:{
          biographySource:a.background??"",concept:a.concept??"",rank:"",ancestry:label(d.identity.stock),
          homeland:a.hometown,age:String(a.age),natureDescriptors:d.natureDescriptors.join(", "),
          belief:a.drives.belief,goal:a.drives.goal,instinct:a.drives.instinct,creed:"",
          friend:personText(people.friend),mentor:personText(people.mentor),enemy:personText(people.enemy),
          parents:[personText(people.mother),personText(people.father)].filter(Boolean).join("; "),
          attributes:{nature:{value:b.nature,maximum:b.nature},will:{value:b.will,max:6},health:{value:b.health,max:6},resources:{value:b.resources,max:10},circles:{value:b.circles,max:10}},
          progression:{level:1,spentFate:0,spentPersona:0},
          resources:{fate:{value:0,max:5},persona:{value:0,max:5},checks:{value:0,max:9}}
        },
        flags:{"realm-guard":{
          recruitmentVersion:"TB2E_WIZARD_M10D8",
          recruitmentSpecialty:label(a.specialty),recruitmentRelationships:people,
          recruitmentNatureAnswers:clone(a.natureAnswers),
          tb2eCreation:{stock:d.identity.stock,className:d.identity.className,level:1,raiment:a.raiment,
            familyName:a.familyName??"",parentsProfession:a.parentsProfession??"",magicNotes:a.magicNotes??"",
            levelOneBenefits:d.levelOne,startingTreasure:treasure,
            startingRewards:{fate:0,persona:0,source:"Dungeoneer's Handbook, p. 47, Starting Rewards",replacementCharacterTransfer:"GM adjudication: deceased character balances, maximum 3 each"},
            urdr:d.identity.className==="THEURGE"?1:null,
            equipmentReviewed:!!a.gearReviewed}
        }}
      },
      provisioning:{
        canonicalSkills:{names:SKILLS,ratings:Object.fromEntries(SKILLS.map(name=>{
          const rating=d.skillRatings[name]??0;
          return [name,{rating,learning:{passed:0,failed:0,passNeeded:rating||1,failNeeded:rating?rating-1:1},beginnerAttempts:0}];
        }))},
        traits:Object.entries(d.traitChecks).map(([name,rating])=>({name,type:"trait",flags:itemFlags,system:{rating,description:"Selected during Torchbearer 2E character creation. Use the rulebook for the trait's fictional scope."}})),
        wises:d.wises.map(name=>({name,type:"wise",flags:itemFlags,system:{rating:0,description:"Unrated Torchbearer 2E Wise."}})),
        gear:[...clone(a.gear??[]),...treasure.map(t=>({name:t.name,type:"gear",flags:{"realm-guard":{tb2eCreation:true,treasureDice:t.dice}},system:{quantity:1,description:`Starting treasure: ${t.dice}D.`,inventory:{mode:"unassigned",location:"",containerId:"",slots:1,bundle:1,wieldHands:0,containerType:"none",capacity:0}}}))],
        canonicalConditions:{names:["Fresh","Hungry & Thirsty","Exhausted","Angry","Sick","Injured","Afraid","Dead"],documents:tb2eCreationConditions()},
        inventory:{policy:"EXISTING_GEAR_ITEMS",automaticPlacement:false}
      },
      relationships:{normalized:people,liveWrite:false,readyWhenActive:true},
      transaction:{liveExecution:false,previewOnly:true,readyWhenActive:true,activationRequired:ID,provenanceWrite:false,relationshipWrite:false},
      postCommit:[]
    };
  }
  function tb2eCreationConditions() {
    const model=tb2eConditionModel();
    const names={FRESH:"Fresh",HUNGRY_THIRSTY:"Hungry & Thirsty",EXHAUSTED:"Exhausted",ANGRY:"Angry",SICK:"Sick",INJURED:"Injured",AFRAID:"Afraid",DEAD:"Dead"};
    return model.conditionIds.map(id=>({
      name:names[id],type:"condition",
      flags:{"realm-guard":{defaultCondition:true,profileProvisionedCondition:true,tb2eConditionId:id}},
      system:{active:id==="FRESH",icon:"systems/realm-guard/assets/conditions/condition.svg",
        rollModifier:0,appliesTo:"none",recoveryType:"manual",
        description:"<p>Torchbearer 2E condition. Effects and recovery belong to the active TB2E rules profile.</p>"}
    }));
  }
  const TB2E_WIZARD_CREATION_PROFILE = new CharacterCreationProfile({
    id:ID,version:1,name:"Torchbearer 2E Character Creation",
    dimensions:[{id:"stock",label:"Stock"},{id:"className",label:"Class"},{id:"level",label:"Level"}],
    steps:STEP_IDS.map((id,i)=>({id,label:STEP_TITLES[i]})),
    rules:{identityField:"className",wiseMode:"UNRATED",startingSkillCap:4},
    metadata:{mode:"READY_FOR_QA_ACTIVATION",readyWhenActive:true,releaseReady:true,pendingSource:[],startingRewardsSource:"Dungeoneer's Handbook, p. 47, Starting Rewards",liveAuthority:"CORE_M9_WHEN_ACTIVE",automaticNpcCreation:false},
    derive,validateStep,buildCommitSpec
  });

export { TB2E_WIZARD_CREATION_PROFILE, MODEL, STEP_IDS, STEP_TITLES, blankAnswers, label, key };
