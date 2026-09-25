const STRICT_TARGET_ID = "realm-guard-strict";
const MG1E_TARGET_ID = "mg1e";

export const STRICT_CONVERSION_DELTAS = Object.freeze([
  { id:"SOURCE_LINEAGE", domain:"profile", severity:"RULE_OWNERSHIP", title:"Rules source lineage", from:"Legacy Mixed project behavior", to:"Mouse Guard 1E / 2008 inheritance + Realm Guard v1.6 overrides", dataAction:"NONE", note:"Changes source ownership and interpretation, not stored campaign data." },
  { id:"WISE_RATINGS", domain:"wises", severity:"DATA_REVIEW_REQUIRED", title:"Wises become rated", from:"Unrated Wise Items", to:"Rated Wises that test and advance like Skills", dataAction:"PRESERVE_AND_REVIEW", note:"Existing preserved Wises remain rating 0 until explicitly assigned." },
  { id:"TRAIT_SEMANTICS", domain:"traits", severity:"RULE_POLICY", title:"Trait level semantics", from:"Legacy Mixed trait behavior", to:"MG1E L1 once/session · L2 every applicable test · L3 reroll failed dice once/session", dataAction:"NONE", note:"Trait Items are preserved." },
  { id:"HELP_I_AM_WISE", domain:"help", severity:"RULE_POLICY", title:"I Am Wise separated from Teamwork", from:"Legacy helper workflow / project Synergy", to:"Own Wise = I Am Wise; another character's help = Teamwork; Synergy disabled", dataAction:"NONE", note:"No Actor write is required." },
  { id:"CONDITION_SET", domain:"conditions", severity:"DATA_PRESERVE_RULE_DISABLE", title:"Strict condition set", from:"Legacy Mixed supplementary Fresh / Afraid handling", to:"Healthy · Hungry & Thirsty · Angry · Tired · Injured · Strained", dataAction:"PRESERVE_EXISTING_ITEMS", note:"Fresh/Afraid Items are preserved." },
  { id:"INVENTORY_POLICY", domain:"inventory", severity:"DATA_PRESERVE_POLICY_CHANGE", title:"Structured inventory becomes loose rules inventory", from:"STRUCTURED placement is rules-significant", to:"LOOSE inventory policy", dataAction:"PRESERVE_PLACEMENT_METADATA", note:"Paper-doll/container metadata remains UX data." },
  { id:"CONFLICT_TOOL_OWNERSHIP", domain:"conflict", severity:"RULE_POLICY", title:"Conflict tools become profile-owned", from:"Legacy held-slot/tool assumptions and universal unarmed -1D", to:"MG1E conflict structure + Realm Guard content; no universal unarmed penalty", dataAction:"NONE", note:"Existing Gear/Conflict Tool data remains intact." },
  { id:"LEVELS_TALENTS", domain:"progression", severity:"DATA_PRESERVE_RULE_DISABLE", title:"Levels / Talents disabled", from:"Enabled", to:"Disabled in Strict Realm Guard", dataAction:"PRESERVE_EXISTING_DATA", note:"Level fields and Talent Items are preserved." },
  { id:"TOKENS_OF_POWER", domain:"tokensOfPower", severity:"RULE_POLICY", title:"Tokens of Power", from:"Legacy project feature", to:"Realm Guard v1.6 source-owned rule", dataAction:"PRESERVE_EXISTING_DATA", note:"Token Items remain stored." },
  { id:"SCALE_OF_MIGHT", domain:"scaleOfMight", severity:"NEW_RULE_DOMAIN", title:"Scale of Might", from:"No dedicated live Strict domain", to:"Realm Guard v1.6 Scale of Might", dataAction:"NONE", note:"Natural Order is replaced by Realm Guard Scale of Might under Strict." }
].map(Object.freeze));

export const MG1E_CONVERSION_DELTAS = Object.freeze([
  { id:"SOURCE_LINEAGE", domain:"profile", severity:"RULE_OWNERSHIP", title:"Rules source lineage", from:"Current active profile", to:"Mouse Guard Roleplaying Game 2008 / 1E", dataAction:"NONE", note:"Rules and presentation change; campaign data remains stored." },
  { id:"WISE_RATINGS", domain:"wises", severity:"DATA_REVIEW_REQUIRED", title:"Rated Wises", from:"Legacy may contain unrated Wises", to:"Wises are rated and advance like Skills", dataAction:"PRESERVE_AND_REVIEW", note:"No automatic ratings are assigned to existing Wises." },
  { id:"TRAIT_SEMANTICS", domain:"traits", severity:"RULE_POLICY", title:"MG1E Trait levels", from:"Current profile semantics", to:"L1 +1D once/session · L2 +1D every applicable roll · L3 reroll failed dice once/session", dataAction:"NONE", note:"Existing Trait Items are preserved." },
  { id:"HELP", domain:"help", severity:"RULE_POLICY", title:"I Am Wise / Teamwork", from:"Legacy helper/Synergy behavior may apply", to:"I Am Wise + Teamwork · Synergy disabled", dataAction:"NONE", note:"No Actor write is required." },
  { id:"NATURE", domain:"nature", severity:"RULE_POLICY", title:"Mouse Nature", from:"Current profile Nature", to:"Escaping · Climbing · Hiding · Foraging", dataAction:"PRESERVE_EXISTING_DATA", note:"Stored Nature rating remains; profile controls descriptors and interpretation." },
  { id:"CONDITIONS", domain:"conditions", severity:"DATA_PRESERVE_RULE_DISABLE", title:"MG1E Conditions", from:"Current profile condition set", to:"Healthy · Hungry & Thirsty · Angry · Tired · Injured · Sick", dataAction:"PRESERVE_EXISTING_ITEMS", note:"Fresh, Afraid and Strained may remain stored but are inactive/hidden under MG1E." },
  { id:"INVENTORY", domain:"inventory", severity:"DATA_PRESERVE_POLICY_CHANGE", title:"MG1E Gear presentation", from:"Structured Foundry placement may be rules-significant", to:"LOOSE placement · character-sheet Gear-space capacity", dataAction:"PRESERVE_PLACEMENT_METADATA", note:"Slot/container metadata remains presentation-only; capacity enforcement is deferred to M10B.5." },
  { id:"CONFLICT", domain:"conflict", severity:"RULE_POLICY", title:"MG1E Conflict content", from:"Current profile conflict content", to:"MG1E three-action exchanges / weapons / armor", dataAction:"PRESERVE_EXISTING_DATA", note:"Realm Guard-specific content remains stored but is not MG1E authority." },
  { id:"PROGRESSION", domain:"progression", severity:"DATA_PRESERVE_RULE_DISABLE", title:"Levels / Talents disabled", from:"Legacy may use Levels / Talents", to:"MG1E Pass/Fail advancement; no Levels/Talents", dataAction:"PRESERVE_EXISTING_DATA", note:"Existing progression fields and Talent Items are preserved." },
  { id:"TOKENS_OF_POWER", domain:"tokensOfPower", severity:"DATA_PRESERVE_RULE_DISABLE", title:"Tokens of Power disabled", from:"Realm Guard / project feature", to:"Not a base MG1E domain", dataAction:"PRESERVE_EXISTING_DATA", note:"Existing Token Items are preserved but inactive." },
  { id:"NATURAL_ORDER", domain:"naturalOrder", severity:"RULE_OWNERSHIP", title:"Natural Order", from:"Legacy/Realm Guard scaling model", to:"MG1E Natural Order", dataAction:"NONE", note:"Natural Order becomes the MG1E size/predation authority." },
  { id:"SCALE_OF_MIGHT", domain:"scaleOfMight", severity:"DATA_PRESERVE_RULE_DISABLE", title:"Scale of Might disabled", from:"Realm Guard v1.6 when Strict", to:"Not a base MG1E domain", dataAction:"PRESERVE_EXISTING_DATA", note:"Scale-related stored content is not deleted." },
  { id:"CREATION", domain:"creation", severity:"FUTURE_CREATION_ONLY", title:"MG1E Character Creation", from:"Current profile creation model", to:"MG1E 21-step source creation model", dataAction:"NO_OLD_ACTOR_MIGRATION", note:"Existing Actors are never rewritten; live MG1E creation is deferred to M10B.7." }
].map(Object.freeze));

function clone(value){ if(Array.isArray(value)) return value.map(clone); if(value&&typeof value==="object") return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)])); return value; }
function stable(value){ if(Array.isArray(value)) return value.map(stable); if(value&&typeof value==="object") return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])); return value; }
function same(a,b){ return JSON.stringify(stable(a))===JSON.stringify(stable(b)); }
function freeze(value){ if(!value||typeof value!=="object"||Object.isFrozen(value)) return value; Object.freeze(value); for(const child of Object.values(value)) freeze(child); return value; }
function listItems(actor){ if(Array.isArray(actor?.items?.contents)) return actor.items.contents; try{return Array.from(actor?.items??[]);}catch{return [];} }
function actorRef(actor){ return Object.freeze({id:String(actor?.id??""),name:String(actor?.name??"Unnamed Actor"),type:String(actor?.type??"")}); }
function creationProvenance(actor){ return actor?.flags?.["realm-guard"]?.creationProvenance ?? actor?.getFlag?.("realm-guard","creationProvenance") ?? null; }
function itemRating(item){ return Number(item?.system?.rating ?? item?.system?.value ?? 0) || 0; }
function conditionNamed(items,name){ const key=String(name).toLowerCase(); return items.filter(i=>i?.type==="condition"&&String(i?.name??"").trim().toLowerCase()===key); }

export function profileDomainDiff(fromProfile,toProfile){
  const a=fromProfile?.domains??{}, b=toProfile?.domains??{};
  return freeze([...new Set([...Object.keys(a),...Object.keys(b)])].sort().filter(d=>!same(a[d],b[d])).map(domain=>({domain,from:clone(a[domain]??null),to:clone(b[domain]??null)})));
}

export function scanProfileWorldImpact(actors=[],worldItems=[]){
  const rows=Array.from(actors??[]);
  const refs={wises:[],talents:[],structuredGear:[],profileConditions:[],legacyCreation:[],strictCreation:[],mg1eCreation:[]};
  const counts={wiseItems:0,ratedWiseItems:0,unratedWiseItems:0,talentItems:0,structuredGearItems:0,freshItems:0,afraidItems:0,strainedItems:0,sickItems:0,tokenOfPowerItems:0,aboveLevelOne:0};
  for(const actor of rows){
    const items=listItems(actor), wises=items.filter(i=>i?.type==="wise"), talents=items.filter(i=>i?.type==="talent"), tokens=items.filter(i=>i?.type==="tokenOfPower");
    const gear=items.filter(i=>i?.type==="gear"&&(()=>{const inv=i?.system?.inventory??{}; return String(inv.mode??"unassigned")!=="unassigned"||Boolean(inv.location)||Boolean(inv.containerId);})());
    const fresh=conditionNamed(items,"fresh"), afraid=conditionNamed(items,"afraid"), strained=conditionNamed(items,"strained"), sick=conditionNamed(items,"sick");
    counts.wiseItems+=wises.length; counts.ratedWiseItems+=wises.filter(i=>itemRating(i)>0).length; counts.unratedWiseItems+=wises.filter(i=>itemRating(i)<=0).length;
    counts.talentItems+=talents.length; counts.structuredGearItems+=gear.length; counts.tokenOfPowerItems+=tokens.length;
    counts.freshItems+=fresh.length; counts.afraidItems+=afraid.length; counts.strainedItems+=strained.length; counts.sickItems+=sick.length;
    if(Number(actor?.system?.progression?.level??1)>1) counts.aboveLevelOne++;
    if(wises.length) refs.wises.push(actorRef(actor)); if(talents.length) refs.talents.push(actorRef(actor)); if(gear.length) refs.structuredGear.push(actorRef(actor));
    if(fresh.length||afraid.length||strained.length||sick.length) refs.profileConditions.push(actorRef(actor));
    const pid=String(creationProvenance(actor)?.rulesProfileId??creationProvenance(actor)?.profileId??"");
    if(pid==="realm-guard-legacy-mixed") refs.legacyCreation.push(actorRef(actor));
    if(pid==="realm-guard-strict") refs.strictCreation.push(actorRef(actor));
    if(pid==="mg1e") refs.mg1eCreation.push(actorRef(actor));
  }
  const standalone=Array.from(worldItems??[]);
  return freeze({
    actors:rows.length,
    rangers:rows.filter(a=>a?.type==="character").length,
    ...counts,
    rangersWithWises:refs.wises.filter(a=>a.type==="character").length,
    actorsWithWises:refs.wises.length,
    actorsWithTalents:refs.talents.length,
    actorsWithStructuredGear:refs.structuredGear.length,
    actorsWithProfileSpecificConditions:refs.profileConditions.length,
    actorsWithLegacyCreationProvenance:refs.legacyCreation.length,
    actorsWithStrictCreationProvenance:refs.strictCreation.length,
    actorsWithMg1eCreationProvenance:refs.mg1eCreation.length,
    standaloneTemplates:{
      wises:standalone.filter(i=>i?.type==="wise").length,
      talents:standalone.filter(i=>i?.type==="talent").length,
      gear:standalone.filter(i=>i?.type==="gear").length,
      tokensOfPower:standalone.filter(i=>i?.type==="tokenOfPower").length
    },
    affectedActors:refs
  });
}

export const scanStrictWorldImpact = scanProfileWorldImpact;

function deltasFor(targetId){ return targetId===MG1E_TARGET_ID ? MG1E_CONVERSION_DELTAS : STRICT_CONVERSION_DELTAS; }

export function buildProfileConversionPreview({fromProfile,toProfile,actors=[],worldItems=[]}={}){
  if(!fromProfile?.id||!toProfile?.id) throw new Error("Profile conversion preview requires source and target Rules Profiles.");
  const targetId=String(toProfile.id);
  return freeze({
    kind:"ProfileConversionPreview",
    phase:"M10B.2",
    mode:"READ_ONLY",
    readOnly:true,
    activationAllowed:false,
    writesPlanned:0,
    source:{id:fromProfile.id,version:fromProfile.version,name:fromProfile.name,rulesSnapshotHash:fromProfile.rulesSnapshotHash},
    target:{id:toProfile.id,version:toProfile.version,name:toProfile.name,rulesSnapshotHash:toProfile.rulesSnapshotHash,lineage:clone(toProfile.metadata?.sourceLineage??toProfile.lineage??[])},
    domainDiff:profileDomainDiff(fromProfile,toProfile),
    deltas:deltasFor(targetId).map(clone),
    worldImpact:scanProfileWorldImpact(actors,worldItems),
    safety:{
      actorWrites:0,itemWrites:0,journalWrites:0,settingWrites:0,profileSwitch:false,destructiveConversion:false,
      preserveExistingActors:true,preserveWiseItems:true,preserveTalentItems:true,preserveInventoryMetadata:true,
      preserveConditionItems:true,preserveTokenOfPowerItems:true,preserveProgressionData:true
    },
    nextStep: targetId===MG1E_TARGET_ID ? "M10B.2 MG1E preview only · activation remains OFF" : "Strict profile remains supported and reversible"
  });
}

export function buildStrictConversionPreview(options={}) {
  if(options?.toProfile?.id!==STRICT_TARGET_ID) throw new Error("Strict conversion preview requires realm-guard-strict as target.");
  return buildProfileConversionPreview(options);
}
export function buildMg1eConversionPreview(options={}) {
  if(options?.toProfile?.id!==MG1E_TARGET_ID) throw new Error("MG1E conversion preview requires mg1e as target.");
  return buildProfileConversionPreview(options);
}

function esc(value){ return globalThis.foundry?.utils?.escapeHTML ? globalThis.foundry.utils.escapeHTML(String(value??"")) : String(value??""); }

export function profileConversionPreviewHtml(preview){
  const w=preview.worldImpact;
  const impact=[
    ["Rangers",w.rangers],["Wise Items",w.wiseItems],["Rated Wises",w.ratedWiseItems],["Unrated Wises",w.unratedWiseItems],
    ["Talent Items",w.talentItems],["Structured Gear Items",w.structuredGearItems],["Fresh",w.freshItems],["Afraid",w.afraidItems],
    ["Strained",w.strainedItems],["Sick",w.sickItems],["Token of Power Items",w.tokenOfPowerItems],["Actors above Level 1",w.aboveLevelOne],
    ["Legacy-created Actors",w.actorsWithLegacyCreationProvenance],["Strict-created Actors",w.actorsWithStrictCreationProvenance]
  ].map(([label,value])=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(128,128,128,.16);"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("");
  const deltas=preview.deltas.map(delta=>`
    <section style="padding:9px 0;border-top:1px solid rgba(128,128,128,.22);">
      <b>${esc(delta.title)}</b> <small>· ${esc(delta.domain)} · ${esc(delta.dataAction)}</small>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px;">
        <div><small>Current</small><br>${esc(delta.from)}</div>
        <div><small>Target</small><br>${esc(delta.to)}</div>
      </div><small>${esc(delta.note)}</small>
    </section>`).join("");
  return `<div class="realm-guard rg-rules-registry-scroll" style="padding:4px 10px;max-height:calc(100vh - 190px);overflow:auto;">
    <h2>${esc(preview.target.name)} · Conversion Preview</h2>
    <p><b>READ ONLY.</b> This preview performs no profile switch and writes no Actors, Items, Journals or world settings.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><small>Current</small><br><b>${esc(preview.source.name)}</b><br><small>${esc(preview.source.rulesSnapshotHash)}</small></div>
      <div><small>Preview target</small><br><b>${esc(preview.target.name)}</b><br><small>${esc(preview.target.rulesSnapshotHash)}</small></div>
    </div>
    <div style="margin:12px 0;padding:9px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);"><b>${preview.target.id===MG1E_TARGET_ID?"MG1E activation is not available in M10B.2.":"Strict activation remains a separate explicit action."}</b><br><small>Writes planned: 0 · destructive conversion: NO.</small></div>
    <section><h3>World impact scan</h3>${impact}</section>
    <section><h3>Profile deltas</h3><small>${preview.domainDiff.length} technical domain differences · ${preview.deltas.length} reviewed deltas.</small>${deltas}</section>
  </div>`;
}

export const strictConversionPreviewHtml = profileConversionPreviewHtml;
export const mg1eConversionPreviewHtml = profileConversionPreviewHtml;

async function openPreview({fromState,toState,actors,worldItems,title}={}){
  if(!globalThis.game?.user?.isGM) return globalThis.ui?.notifications?.warn?.("Realm Guard: profile conversion preview is GM-only.");
  const preview=buildProfileConversionPreview({fromProfile:fromState.profile,toProfile:toState.profile,actors:actors??globalThis.game?.actors?.contents??[],worldItems:worldItems??globalThis.game?.items?.contents??[]});
  await globalThis.foundry.applications.api.DialogV2.wait({
    window:{title,resizable:true},position:{width:900,height:840},content:profileConversionPreviewHtml(preview),modal:false,rejectClose:false,
    buttons:[{action:"close",label:"Close",default:true}]
  });
  return preview;
}
export function openStrictConversionPreview(options={}){ return openPreview({...options,title:"Realm Guard · Strict Conversion Preview"}); }
export function openMg1eConversionPreview(options={}){ return openPreview({...options,title:"Realm Guard · Mouse Guard 1E Conversion Preview"}); }
