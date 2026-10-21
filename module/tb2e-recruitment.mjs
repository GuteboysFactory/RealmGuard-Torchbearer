// UI shell copied from Recruitment 2.0 in qa.27; TB2E steps are isolated below.
import { CharacterCreationEngine, CreationPartyContext, CreationCommitPlan } from "./core/m9-creation.mjs";
import { FoundryCreationCommitAdapter } from "./m9-creation-commit-adapter.mjs";
import { getActiveM10BCharacterCreationPolicy } from "./m10b-character-creation.mjs";
import { TB2E_WIZARD_CREATION_PROFILE, MODEL, STEP_IDS, STEP_TITLES, blankAnswers, label, key } from "./profiles/torchbearer2e-wizard-creation.mjs";

  const engine=new CharacterCreationEngine(TB2E_WIZARD_CREATION_PROFILE);
  const adapter=new FoundryCreationCommitAdapter({shadowOnly:false,runtime:{ensureConditions:async(actor,plan)=>{
    // Conditions come from the TB2E creation plan; no RG default conditions are provisioned.
    const docs=plan.provisioning.canonicalConditions.documents;
    return actor.createEmbeddedDocuments("Item",JSON.parse(JSON.stringify(docs)));
  }}});
  const esc = value => foundry.utils.escapeHTML(String(value??""));
  const value=(form,name,fallback="")=>String(form?.elements?.[name]?.value??fallback).trim();
  const checked=(form,name)=>Boolean(form?.elements?.[name]?.checked);
  const numberValue=(form,name)=>Number(value(form,name));
  const modeHelp=(state,html)=>state.mode==="quick"?"":`<div class="rg-recruit-guide">${html}</div>`;
  function partyContext(state) {
    const ids=new Set(state.answers.partyActorIds??[]);
    return new CreationPartyContext({existingCharacters:(globalThis.game?.actors?.contents??[])
      .filter(a=>a.type==="character"&&ids.has(a.id)).map(a=>({name:a.name,actorId:a.id,specialty:a.getFlag?.("realm-guard","recruitmentSpecialty")??""}))});
  }
  function syncDraft(state) {
    state.draft=engine.createDraft({mode:state.mode,answers:state.answers,allocations:state.allocations});
    return state.draft;
  }
  function validateDraftStep(state,stepId) {
    const result=engine.validateStep(stepId,syncDraft(state),partyContext(state));
    return {error:result.errors[0]?.message??null};
  }
  function textInput(title,name,current,{type="text",min,max,refresh=false}={}) {
    return `<label>${esc(title)}<input type="${esc(type)}" name="${esc(name)}" value="${esc(current)}"${min===undefined?"":` min="${min}"`}${max===undefined?"":` max="${max}"`}${refresh?" data-rg-refresh":""}></label>`;
  }
  function textarea(title,name,current,rows=3) {
    return `<label>${esc(title)}<textarea name="${esc(name)}" rows="${rows}">${esc(current)}</textarea></label>`;
  }
  function select(title,name,list,current,refresh=false) {
    return `<label>${esc(title)}<select name="${esc(name)}"${refresh?" data-rg-refresh":""}>${options(list.map(x=>typeof x==="string"?{value:x,label:label(x)}:x),current)}</select></label>`;
  }
  function checkbox(title,name,current,refresh=false) {
    return `<label class="rg-recruit-question"><input type="checkbox" name="${esc(name)}" ${current?"checked":""}${refresh?" data-rg-refresh":""}><span>${esc(title)}</span></label>`;
  }
  function rulesNote(text) {return `<div class="rg-recruit-note">${esc(text)}</div>`;}
  function stats(state) {
    const d=syncDraft(state).derivedValues;
    return `<div class="rg-recruit-grid two">${Object.entries(d.abilities).map(([n,v])=>`<div><b>${esc(label(n))}</b> ${esc(v)}</div>`).join("")}</div>`;
  }
  function refreshBody(state,config,dialog) {
    const form=dialog.element?.querySelector?.("form.rg-recruitment");
    if(!form)return;
    for(const el of form.querySelectorAll("[data-rg-refresh]")) el.addEventListener("change",()=>{
      config.commit(form);syncDraft(state);
      form.innerHTML=stepHeader(state,config.current,11,config.title,config.subtitle)+config.body();
      refreshBody(state,config,dialog);
    });
  }
  function step(state,index,subtitle,body,commit) {
    const config={current:index+1,total:11,title:STEP_TITLES[index],subtitle,body,commit,allowBack:index>0,
      nextLabel:index===10?"Create Character":"Continue",nextIcon:index===10?"fa-solid fa-user-plus":"fa-solid fa-arrow-right"};
    config.onRender=(_event,dialog)=>refreshBody(state,config,dialog);
    return showStep(state,config);
  }
  async function identityStep(state) {
    return step(state,0,"Choose your stock and class; every new adventurer starts at level 1.",()=>{
      const a=state.answers,rule=MODEL.classRules[a.className];
      return modeHelp(state,"<p>Stock and class belong together in Torchbearer. Human adventurers divide 8 points between Will and Health (maximum 6 each); the other stocks have fixed values. Guided and Quick use the same rules.</p>")+
        `<div class="rg-recruit-mode-select">${["guided","quick"].map(m=>`<label><input type="radio" name="mode" value="${m}" ${state.mode===m?"checked":""}><span><b>${m.toUpperCase()}</b><small>${m==="guided"?"Rule explanations and prompts.":"Same rules, less explanatory text."}</small></span></label>`).join("")}</div>`+
        `<div class="rg-recruit-grid two">${textInput("Name","name",a.name)}${select("Stock / Class","className",MODEL.classes.map(c=>({value:c,label:`${label(MODEL.classRules[c].stock)} — ${label(c)}`})),a.className,true)}${textInput("Concept","concept",a.concept)}</div>`+
        (rule?.stock==="HUMAN"?`<div class="rg-recruit-grid two">${textInput("Will","will",a.will,{type:"number",min:2,max:6})}${textInput("Health","health",a.health,{type:"number",min:2,max:6})}</div>`:rule?rulesNote(`Will ${rule.abilities.will}, Health ${rule.abilities.health}`):"")+
        textarea("Biography / Background","background",a.background,4);
    },form=>{
      const a=state.answers,old=a.className,next=value(form,"className");
      a.name=value(form,"name");a.concept=value(form,"concept");a.background=value(form,"background");
      state.mode=value(form,"mode",state.mode)||state.mode;
      if(form.elements.will)a.will=numberValue(form,"will");
      if(form.elements.health)a.health=numberValue(form,"health");
      if(old!==next) {
        const keep={name:a.name,concept:a.concept,background:a.background,will:a.will,health:a.health};
        state.answers={...blankAnswers(),...keep,className:next};
        state.allocations={skills:{...(MODEL.classRules[next]?.skills??{})}};
      } else a.className=next;
    });
  }
  async function skillsStep(state) {
    return step(state,1,"Redistribute your class skills, then choose human upbringing.",()=>{
      const a=state.answers,r=MODEL.classRules[a.className],skills=state.allocations.skills??r?.skills??{};
      return modeHelp(state,"<p>You may redistribute the class skill points among these skills, keeping the same total. A rating may be 0–4. You cannot add a different skill here. Human upbringing grants a new skill at 3, or adds 1 to an existing skill, capped at 4.</p>")+
        rulesNote(`Class skill points: ${Object.values(r?.skills??{}).reduce((x,y)=>x+y,0)}`)+
        `<div class="rg-recruit-grid two">${Object.keys(r?.skills??{}).map(k=>textInput(label(k),`skill_${k}`,skills[k]??0,{type:"number",min:0,max:4})).join("")}</div>`+
        (r?.stock==="HUMAN"?select("Human Upbringing","upbringing",MODEL.humanUpbringing,a.upbringing):"");
    },form=>{
      state.allocations.skills=Object.fromEntries(Object.keys(MODEL.classRules[state.answers.className]?.skills??{}).map(k=>[k,numberValue(form,`skill_${k}`)]));
      state.answers.upbringing=value(form,"upbringing");
    });
  }
  async function homeStep(state) {
    return step(state,2,"Choose where you grew up and name your hometown.",()=>{
      const a=state.answers,stock=MODEL.classRules[a.className]?.stock,home=MODEL.homes[a.home];
      return modeHelp(state,"<p>Your home grants one skill at 2, or +1 if already known (maximum 4), and one trait at level 1. Elfhome is available only to elves.</p>")+
        `<div class="rg-recruit-grid two">${select("Home Type","home",Object.keys(MODEL.homes).filter(h=>MODEL.homes[h].stocks.includes(stock)),a.home,true)}${textInput("Hometown Name","hometown",a.hometown)}</div>`+
        (home?`<div class="rg-home-card"><h3>${esc(label(a.home))}</h3><div class="rg-recruit-grid two">${select("Home Skill","homeSkill",home.skills,a.homeSkill)}${select("Home Trait","homeTrait",home.traits,a.homeTrait)}</div></div>`:"");
    },form=>{
      const a=state.answers,next=value(form,"home");
      a.hometown=value(form,"hometown");
      if(a.home!==next){a.home=next;a.homeSkill="";a.homeTrait="";}
      else {a.homeSkill=value(form,"homeSkill");a.homeTrait=value(form,"homeTrait");}
    });
  }
  async function specialtyStep(state) {
    return step(state,3,"How do you convince people, and what do you bring to this party?",()=>{
      const a=state.answers,pcs=(globalThis.game?.actors?.contents??[]).filter(x=>x.type==="character" && x.visible!==false);
      return modeHelp(state,"<p>Social Graces and Specialty each grant a new skill at 2, or +1 if already known (maximum 4). Party members must choose different specialties. Select the characters in this party below; unrelated test characters do not need to be included.</p>")+
        `<div class="rg-recruit-grid two">${select("Social Grace","socialGrace",MODEL.socialGraces,a.socialGrace)}${select("Specialty","specialty",MODEL.specialties,a.specialty)}</div>`+
        `<h3>Characters in this party</h3>`+pcs.map(p=>checkbox(`${p.name}${p.getFlag?.("realm-guard","recruitmentSpecialty")?` — ${p.getFlag("realm-guard","recruitmentSpecialty")}`:""}`,`party_${p.id}`,(a.partyActorIds??[]).includes(p.id))).join("");
    },form=>{
      const a=state.answers;a.socialGrace=value(form,"socialGrace");a.specialty=value(form,"specialty");
      a.partyActorIds=(globalThis.game?.actors?.contents??[]).filter(p=>checked(form,`party_${p.id}`)).map(p=>p.id);
    });
  }
  const NATURE_CHOICES={
    DWARF:[
      [["REVENGE","Avenge a wrong (+1 Nature)"],["NEGOTIATE","Negotiate (replace Avenging Grudges with Negotiating)"]],
      [["DIG_DEEPER","Delve deeper (+1 Nature)"],["FEAR_BELOW","Fear what lies below (class trait level 2)"]],
      [["CRAFT","Craft (+1 Nature)"],["SPEND_GOLD","Spend gold (Resources 1)"]]
    ],
    ELF:[
      [["SING","Sing (+1 Nature)"],["ENCHANT","Enchant (replace Singing with Enchanting)"]],
      [["CONFRONT_EVIL","Confront evil (class trait level 2)"],["RETREAT_HIDE","Retreat and hide (+1 Nature)"]],
      [["JOURNEY_WEST","Journey west (+1 Nature)"],["STRUGGLE","Stay and struggle (replace home trait)"]]
    ],
    HALFLING:[
      [["FEAST","Feast (+1 Nature)"],["HOARD","Hoard (replace Merrymaking with Hoarding)"]],
      [["RIDDLE","Riddle (+1 Nature)"],["FIGHT","Fight (class trait level 2)"]],
      [["SNEAK","Sneak (+1 Nature)"],["DEMAND","Demand (replace Sneaking with Demanding)"]]
    ],
    HUMAN:[
      [["BOAST","Boast (+1 Nature)"],["PREPARE","Prepare (class trait level 2)"]],
      [["DEMAND_RIGHTS","Demand your rights (+1 Nature)"],["LISTEN_ELDERS","Listen to elders (additional Wise)"]],
      [["FLEE_HIDE","Flee and hide (+1 Nature)"],["FIGHT","Fight (replace home trait)"]]
    ]
  };
  async function natureStep(state) {
    return step(state,4,"Nature starts at 3. Your choices also shape traits, Wises and Resources.",()=>{
      const a=state.answers,stock=MODEL.classRules[a.className]?.stock,n=a.natureAnswers;
      const replacement=stock==="ELF"&&n.q3==="STRUGGLE"?["FIERY","CURIOUS","RESTLESS"]:stock==="HUMAN"&&n.q3==="FIGHT"?["LONER","FOOLHARDY","DEFENDER"]:[];
      return modeHelp(state,"<p>Choose the response that describes this adventurer. Read each effect before moving on. A replacement home trait replaces the home choice; it is not an additional trait.</p>")+
        (NATURE_CHOICES[stock]??[]).map((choices,i)=>select(`Question ${i+1}`,`q${i+1}`,choices.map(([value,label])=>({value,label})),n[`q${i+1}`],true)).join("")+
        (replacement.length?select("Replacement Home Trait","replacementTrait",replacement,a.replacementTrait):"")+
        (stock==="HUMAN"&&n.q2==="LISTEN_ELDERS"?select("Additional Wise","secondWise",["ELF_WISE","DWARF_WISE","POLITICS_WISE"],a.secondWise):"")+
        stats(state);
    },form=>{
      const a=state.answers;a.natureAnswers=Object.fromEntries([1,2,3].map(i=>[`q${i}`,value(form,`q${i}`)]));
      a.replacementTrait=value(form,"replacementTrait");a.secondWise=value(form,"secondWise");
    });
  }
  async function wisesStep(state) {
    return step(state,5,"Choose specific knowledge that helps tell your character's story.",()=>{
      const a=state.answers,stock=MODEL.classRules[a.className]?.stock,r=MODEL.wises[stock];
      return modeHelp(state,"<p>Wises are unrated. Humans choose one custom Wise; other stocks choose one listed Wise and one custom Wise. Human Nature may grant another Wise. Agree its scope with the GM: neither too broad nor a game mechanic.</p>")+
        (r?.stockChoices.length?select("Stock Wise","stockWise",r.stockChoices,a.stockWise):"")+
        textInput("Custom Wise","customWise",a.customWise)+
        (syncDraft(state).derivedValues.wises.length?rulesNote(syncDraft(state).derivedValues.wises.join(", ")):"");
    },form=>{state.answers.stockWise=value(form,"stockWise");state.answers.customWise=value(form,"customWise");});
  }
  function personFields(a,role) {
    const p=a.people[role]??{};
    return `<fieldset><legend>${esc(label(role))}</legend><div class="rg-recruit-grid two">${["name","profession","location"].map(k=>textInput(label(k),`${role}_${k}`,p[k]??"")).join("")}</div>`+
      (role==="friend"?textInput("Last Seen","friend_lastSeen",p.lastSeen??"")+(a.relationships.friendIsAdventurer?`<div class="rg-recruit-grid two">${textInput("Class","friend_className",p.className??"")}${textInput("Specialty","friend_specialty",p.specialty??"")}</div>`:""):"")+`</fieldset>`;
  }
  async function relationshipsStep(state) {
    return step(state,6,"Begin with Circles 1 and choose the people who connect you to the world.",()=>{
      const a=state.answers,r=a.relationships,social=r.route==="social";
      return modeHelp(state,"<p>The social route includes a friend. Choose at most three of Friend, Parents, Mentor and Enemy in total; each adds 1 Circles. A magician must have a mentor. A Loner instead starts with Circles 1, an enemy and the Loner trait, and skips the remaining questions. The supplied guide does not reconcile Magician + Loner, so that combination is unavailable.</p>")+
        select("Relationships","route",[{value:"social",label:"Friend and social ties"},{value:"loner",label:"Loner"}],r.route,true)+
        (social?checkbox("My friend is an adventurer","friendIsAdventurer",r.friendIsAdventurer,true)+personFields(a,"friend")+
          checkbox("Parents (+1 Circles)","parents",r.parents,true)+
          (r.parents?personFields(a,"mother")+personFields(a,"father")+textInput("Family Name","familyName",a.familyName??"")+textInput("Parents' Profession","parentsProfession",a.parentsProfession??""):textInput("Parents' Keepsake (1D treasure)","keepsake",a.keepsake))+
          checkbox("Mentor (+1 Circles; mandatory for magicians)","mentor",r.mentor,true)+
          (r.mentor?rulesNote("Your mentor is level 7 and has the same class as you.")+personFields(a,"mentor"):checkbox("Self-made: record a 2D gold pouch","goldPouchConfirmed",a.goldPouchConfirmed))+
          checkbox("Enemy (+1 Circles)","enemy",r.enemy,true)+(r.enemy?personFields(a,"enemy"):""):personFields(a,"enemy"))+
        rulesNote("Your enemy is one level above you; agree their class with the GM. No NPC Actors are created automatically.")+stats(state);
    },form=>{
      const a=state.answers,route=value(form,"route"),r={route,parents:checked(form,"parents"),mentor:checked(form,"mentor"),enemy:checked(form,"enemy"),friendIsAdventurer:checked(form,"friendIsAdventurer")};
      if(route==="loner")Object.assign(r,{parents:false,mentor:false,enemy:false,friendIsAdventurer:false});
      a.relationships=r;
      for(const role of ["friend","mother","father","mentor","enemy"]) for(const k of ["name","profession","location","lastSeen","className","specialty"])
        if(form.elements[`${role}_${k}`]) (a.people[role]??={})[k]=value(form,`${role}_${k}`);
      for(const k of ["familyName","parentsProfession","keepsake"])if(form.elements[k])a[k]=value(form,k);
      if(form.elements.goldPouchConfirmed)a.goldPouchConfirmed=checked(form,"goldPouchConfirmed");
    });
  }
  function worldGear() {
    return (globalThis.game?.items?.contents??[]).filter(x=>x.type==="gear"&&x.visible!==false).sort((a,b)=>a.name.localeCompare(b.name));
  }
  function copyGear(item) {
    const raw=item.toObject();
    return {name:raw.name,type:"gear",img:raw.img,system:{...raw.system,inventory:{...raw.system?.inventory,mode:"unassigned",location:"",containerId:""}},
      flags:{...raw.flags,"realm-guard":{...(raw.flags?.["realm-guard"]??{}),tb2eCreation:true,creationSourceUuid:item.uuid}}};
  }
  async function gearStep(state) {
    return step(state,7,"Use the equipment already available in your world.",()=>{
      const a=state.answers,e=syncDraft(state).derivedValues.equipment,chosen=new Set(a.gear.map(x=>x.flags?.["realm-guard"]?.creationSourceUuid));
      const policy=e.weaponPolicy?.allowed?`Weapons: ${e.weaponPolicy.allowed.map(label).join(", ")}.`:
        e.weaponPolicy?.excluded?`Weapons excluded: ${e.weaponPolicy.excluded.map(label).join(", ")}.`:"Any class-appropriate weapon.";
      return modeHelp(state,"<p>Select existing Gear Items, including one Backpack or Satchel. Their descriptions and item data are copied; originals remain untouched. Equip and pack them with the existing inventory after creation. Agree quantities, custom gear names and starting equipment with the GM.</p>")+
        rulesNote(`${policy} Starting armor: ${(e.startingArmor??[]).map(label).join(", ")||"none"}.`)+
        (worldGear().length?`<div class="rg-recruit-grid two">${worldGear().map(g=>checkbox(g.name,`gear_${g.id}`,chosen.has(g.uuid))).join("")}</div>`:rulesNote("No visible Gear Items are available. Ask the GM to make the existing equipment available in Items."))+
        (["MAGICIAN","THEURGE"].includes(a.className)?textarea(a.className==="MAGICIAN"?"Starting Spells / Spellbook (3 first-circle spells; memory capacity 1)":"Minor Relics and Associated Invocations (2 relics; Urdr 1)","magicNotes",a.magicNotes,4):"")+
        checkbox("I have agreed this starting equipment, including any custom Items and magic choices, with the GM.","gearReviewed",a.gearReviewed);
    },form=>{
      const a=state.answers;a.gear=worldGear().filter(g=>checked(form,`gear_${g.id}`)).map(copyGear);
      a.gearReviewed=checked(form,"gearReviewed");a.magicNotes=value(form,"magicNotes");
    });
  }
  async function drivesStep(state) {
    return step(state,8,"What matters to you, what will you achieve, and what do you always do?",()=>{
      const a=state.answers;
      return modeHelp(state,"<p><b>Belief:</b> a personal philosophy or motivation. <b>Goal:</b> an active objective achievable in one or two sessions. <b>Instinct:</b> an Always, Never or If/Then action. Creed unlocks at level 3, so it stays blank for a new level-1 character.</p>")+
        ["belief","goal","instinct"].map(k=>textarea(label(k),k,a.drives[k])).join("");
    },form=>{state.answers.drives=Object.fromEntries(["belief","goal","instinct"].map(k=>[k,value(form,k)]));});
  }
  async function detailsStep(state) {
    return step(state,9,"Complete the adventurer's appearance and starting details.",()=>{
      const a=state.answers,d=syncDraft(state).derivedValues,range=MODEL.ageRanges[d.identity.stock];
      return modeHelp(state,"<p>Choose an age in your stock's starting range and describe your raiment. You begin at level 1 with Fresh. Class benefits and magical choices are recorded for play; this wizard does not invent spell or invocation effects.</p>")+
        textInput(`Age (${range?.min}–${range?.max})`,"age",a.age,{type:"number",min:range?.min,max:range?.max})+
        textarea("Raiment / Appearance","raiment",a.raiment)+
        `<h3>Level 1 benefits</h3><ul>${d.levelOne.map(x=>`<li>${esc(label(x))}</li>`).join("")}</ul>`+
        rulesNote("Starting Fate and Persona awards still need source confirmation before this wizard can be released. No awards are inferred.");
    },form=>{state.answers.age=numberValue(form,"age");state.answers.raiment=value(form,"raiment");});
  }
  function reviewHtml(state) {
    const a=state.answers,d=syncDraft(state).derivedValues;
    const rows=map=>`<div class="rg-recruit-grid two">${Object.entries(map).map(([k,v])=>`<div><b>${esc(k)}</b> ${esc(v)}</div>`).join("")}</div>`;
    return `<h3>${esc(a.name)} — ${esc(label(d.identity.stock))} ${esc(label(a.className))}, level 1</h3>`+
      stats(state)+`<h3>Nature</h3><p>${esc(d.natureDescriptors.join(", "))}</p><h3>Skills</h3>`+
      rows(Object.fromEntries(Object.entries(d.skillRatings).filter(([,v])=>v>0)))+
      `<h3>Traits</h3>`+rows(d.traitChecks)+`<h3>Wises</h3><p>${esc(d.wises.join(", "))}</p>`+
      `<h3>Relationships</h3>`+rows(Object.fromEntries(Object.entries(a.people).filter(([role,p])=>p.name && (role==="enemy" ? d.relationships.selectedRelationships?.includes("ENEMY") : d.relationships.route==="SOCIAL" && (role==="friend" || (role==="mentor"?a.relationships.mentor:a.relationships.parents)))).map(([role,p])=>[label(role),[p.name,p.profession,p.location].filter(Boolean).join(", ")])))+
      `<h3>Drives</h3>`+rows(a.drives)+
      `<h3>Equipment</h3><p>${esc(a.gear.map(x=>x.name).join(", "))}</p>`+
      (a.magicNotes?`<p>${esc(a.magicNotes)}</p>`:"")+
      `<h3>Final Details</h3><p>${esc(a.hometown)} · Age ${esc(a.age)} · ${esc(a.raiment)} · Fresh</p>`;
  }
  async function reviewStep(state) {
    return step(state,10,"Review the complete character. Back lets you revise; Cancel creates nothing.",
      ()=>reviewHtml(state)+checkbox("Open character sheet after creation","openSheet",state.answers.openSheet),
      form=>{state.answers.openSheet=checked(form,"openSheet");});
  }
  function canCreateActors() {
    return !!globalThis.game?.user?.isGM || !!globalThis.game?.user?.can?.("ACTOR_CREATE");
  }
  function assertCreationEnabled() {
    if(TB2E_WIZARD_CREATION_PROFILE.metadata.releaseReady !== true) throw new Error("TB2E wizard awaits verification of starting Fate/Persona before release.");
    const policy=getActiveM10BCharacterCreationPolicy();
    if(policy.rulesProfileId!=="torchbearer2e" || !policy.liveCommit || policy.foundationOnly) throw new Error("TB2E character creation awaits M10D.11 activation.");
    if(!canCreateActors())throw new Error("You do not have permission to create Actors.");
  }
  async function commitTb2eWizard(state) {
    assertCreationEnabled();
    const draft=syncDraft(state),context=partyContext(state);
    const generic=engine.validate(draft,context);
    const final=engine.validateStep("review",draft,context);
    if(!generic.valid||!final.valid)throw new Error(final.errors[0]?.message??generic.errors[0]?.code);
    const raw=engine.buildCommitPlan(draft,context);
    const snapshot=globalThis.game?.realmGuard?.core?.getActiveRulesSnapshot?.();
    // The active policy is checked immediately before the CORE M9 transaction.
    assertCreationEnabled();
    const plan=new CreationCommitPlan({...raw,transaction:{...raw.transaction,liveExecution:true,previewOnly:false,provenanceWrite:true,relationshipWrite:true}});
    return adapter.execute(plan,{isGM:!!game.user.isGM,userId:game.user.id,rulesSnapshot:snapshot});
  }
  const STEPS=[identityStep,skillsStep,homeStep,specialtyStep,natureStep,wisesStep,relationshipsStep,gearStep,drivesStep,detailsStep,reviewStep];
  async function openTb2eRecruitmentWizard({mode="guided"}={}) {
    try {assertCreationEnabled();}catch(error){ui.notifications.warn(error.message);return null;}
    const state={mode:["guided","quick"].includes(mode)?mode:"guided",answers:blankAnswers(),allocations:{}};
    let index=0;
    while(index<STEPS.length) {
      const action=await STEPS[index](state);
      if(action==="cancel")return null;
      if(action==="back"){index=Math.max(0,index-1);continue;}
      index++;
    }
    try {
      const result=await commitTb2eWizard(state);
      ui.notifications.info(`${result.actor.name} has completed Torchbearer 2E character creation.`);
      if(state.answers.openSheet)result.actor.sheet?.render(true);
      return result.actor;
    } catch(error) {
      console.error("Realm Guard | TB2E creation failed",error);
      ui.notifications.error(error.message);
      return null;
    }
  }
  async function openTb2eRecruitmentGuide() {
    return new foundry.applications.api.DialogV2({
      window:{title:"Torchbearer 2E · Character Creation Guide",resizable:true},
      position:{width:700,height:720},
      content:`<div class="realm-guard rg-recruit-guide-dialog"><header><span>TORCHBEARER 2E</span><h2>Character Creation</h2><p>Build an adventurer together with your group.</p></header>${STEP_TITLES.map((name,i)=>`<div class="rg-guide-section"><h3>${i+1}. ${esc(name)}</h3><p>${esc(GUIDE_TEXT[i])}</p></div>`).join("")}</div>`,
      buttons:[...(canCreateActors()?[{action:"start",label:"Create Character",icon:"fa-solid fa-user-shield",callback:()=>{setTimeout(()=>void openTb2eRecruitmentWizard(),0);}}]:[]),{action:"close",label:"Close",default:true}],
      submit:()=>null
    }).render(true);
  }
  const GUIDE_TEXT=[
    "Choose a stock/class pairing. Human Will and Health total 8; nonhuman abilities are fixed.",
    "Optionally redistribute class skills without changing the total; maximum 4. Human upbringing adds one skill at 3 or raises an existing skill.",
    "Choose a home, its name, one skill at 2 (or +1, capped at 4), and one level-1 trait.",
    "Choose Social Graces and a unique party Specialty. Both start at 2 or raise an existing skill by 1, capped at 4.",
    "Answer three stock-specific questions. Nature starts at 3; answers affect traits, descriptors, Wises and Resources.",
    "Choose unrated Wises. Their scope is agreed through conversation with the GM.",
    "Choose social ties or the Loner route; record names, professions and places. Relationships are stored without automatically creating NPC Actors.",
    "Select existing equipment. Confirm class restrictions with the GM and record starting spells or relics where relevant.",
    "Write Belief, Goal and Instinct. Creed begins at level 3.",
    "Record age, raiment, Fresh and level-1 class benefits.",
    "Review all values before creation. Cancel creates nothing; failed CORE M9 transactions roll back the new Actor."
  ];

function options(list, selected = "", { placeholder = "Choose...", disabled = new Map() } = {}) {
  const out = [`<option value="">${esc(placeholder)}</option>`];
  for (const entry of list) {
    const value = typeof entry === "string" ? entry : entry.value;
    const label = typeof entry === "string" ? entry : entry.label;
    const reason = disabled.get(value);
    out.push(`<option value="${esc(value)}" ${String(selected) === String(value) ? "selected" : ""} ${reason ? "disabled" : ""}>${esc(label)}${reason ? ` - ${esc(reason)}` : ""}</option>`);
  }
  return out.join("");
}


function stepHeader(state, current, total, title, subtitle) {
  return `<header class="rg-recruit-hero"><div class="rg-recruit-progress"><span>TORCHBEARER 2E</span><strong>STEP ${current}/${total}</strong></div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p><div class="rg-recruit-mode-pill"><i class="fa-solid ${state.mode === "quick" ? "fa-bolt" : "fa-book-open"}"></i>${state.mode === "quick" ? "QUICK" : "GUIDED"}</div></header>`;
}

async function showStep(state, { current, total = 11, title, subtitle, body, commit, validate = null, onRender = null, allowBack = true, nextLabel = "Continue", nextIcon = "fa-solid fa-arrow-right" }) {
  const stepId = STEP_IDS[Math.max(0, current - 1)] ?? `step-${current}`;

  while (true) {
    try {
      syncDraft(state, { stepId, reason: "render" });
    } catch (error) {
      console.error("Realm Guard | M9 draft sync failed before render; retaining current Recruitment state", error);
    }

    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: `Torchbearer 2E · Character Creation · ${title}`, resizable: true },
      position: { width: 860 },
      content: `<form class="realm-guard rg-recruitment">${stepHeader(state, current, total, title, subtitle)}${body()}</form>`,
      modal: false,
      rejectClose: false,
      render: (event, dialog) => onRender?.(event, dialog),
      buttons: [
        ...(allowBack ? [{ action: "back", label: "Back", icon: "fa-solid fa-arrow-left", callback: (_event, button) => { commit?.(button.form); return "back"; } }] : []),
        { action: "next", label: nextLabel, icon: nextIcon, default: true, callback: (_event, button) => { commit?.(button.form); return "next"; } },
        { action: "cancel", label: "Cancel", callback: () => "cancel" }
      ]
    });

    if (!result || result === "cancel") return "cancel";

    if (result === "back") {
      try {
        syncDraft(state, { stepId, reason: "back" });
      } catch (error) {
        console.error("Realm Guard | M9 Back recalculation failed; retaining current Recruitment state", error);
      }
      return "back";
    }

    let error = null;
    try {
      error = validateDraftStep(state, stepId).error;
    } catch (coreError) {
      console.error("Realm Guard | TB2E step validation failed; creation remains blocked", coreError);
      error = "Character validation failed. Nothing was created; reopen this step or report the error.";
    }

    if (!error) return "next";
    ui.notifications.warn(`Realm Guard: ${error}`);
  }
}


export { openTb2eRecruitmentWizard, openTb2eRecruitmentGuide, commitTb2eWizard };
export const tb2eWizardTest = Object.freeze({engine,STEPS,blankAnswers,copyGear,reviewHtml});
