import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";

export const TB2E_CORE_SOURCE_SET=freezeTb2e([
  {id:"808847477-Dungeoneers-Handbook.pdf",title:"Dungeoneer's Handbook",tier:"CORE",role:"PLAYER_CHARACTER_RULES",essential:true,pdfPages:256},
  {id:"809781414-TB2e-Scholars-Guide.pdf",title:"Scholar's Guide",tier:"CORE",role:"GM_GAME_PROCEDURES",essential:true,pdfPages:320},
  {id:"809781402-TB2e-Lore-Masters-Manual.pdf",title:"Lore Master's Manual",tier:"OPTIONAL_EXPANSION",role:"ADVANCED_OPTIONAL_RULES",essential:false,pdfPages:272},
  {id:"679301798-TB2E-Scavenger-s-Supplement.pdf",title:"Scavenger's Supplement",tier:"OPTIONAL_EXPANSION",role:"OPTIONAL_CLASSES_AND_RULES",essential:false,pdfPages:72}
]);

export const TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS=freezeTb2e([
  "wises","help","tests","nature","abilities","resources","conditions","recovery",
  "inventory","advancement","session","circles","scales","creation"
]);
export const TB2E_NEW_SHADOW_ADAPTER_DOMAINS=freezeTb2e(["traits","armor","conflict","magic"]);
export const TB2E_MANUAL_DOMAINS=freezeTb2e(["narrative"]);

const rows=[
  ["tests","Tests / Dice","VERIFIED","SG 9-12, 26-38; DH 58-75","Core test math, factors, independent/versus tests, help, ties, Beginner's Luck and modifier procedures are present."],
  ["abilities","Abilities / Skills","VERIFIED","DH 58-75, 160-176","Raw/town abilities, complete core skill list, factors, help, tools, supplies and learning procedures are present."],
  ["nature","Nature","VERIFIED","DH 65-71","Nature descriptors, within/outside use, channeling, tax, recovery, advancement and retirement boundaries are present."],
  ["traits","Traits","VERIFIED","DH 79-82, 177-182","Trait levels, beneficial uses, against-self penalties, checks, phase restrictions, tie handling and core Trait List are present."],
  ["wises","Wises","VERIFIED","DH 76-78; SG Conflict","Unrated Wises, aid, Fate/Persona rerolls, multiple-wise limits, evolution and conflict use are present."],
  ["help","Help / Teamwork","VERIFIED","SG 36-38; DH skill reference","Help eligibility, helper consequences, instinctual help, recovery/lifestyle restrictions and Wise aid separation are present."],
  ["resources","Fate / Persona / resources","VERIFIED","DH 59-64; SG 83-89, 97-125","Resources/Circles economy procedures plus Fate/Persona earning and spending rules are present."],
  ["conditions","Conditions","VERIFIED","SG 39-57; DH procedure reference","All core conditions, effects, Grind interaction, death risk and recovery interaction are present."],
  ["recovery","Recovery","VERIFIED","SG 46-57, 90-125","Recovery order, tests, treatment, camp/town restrictions and accommodation procedures are present."],
  ["inventory","Inventory / Gear","VERIFIED","DH 83-88, 148-159","Inventory locations, containers, gear catalogue, weapon inventory and equipment effects are present."],
  ["armor","Armor","VERIFIED","DH 150-151; SG denizens/loot references","Core leather, chain, plate, helmet and shield absorption, bypass, damage and repair rules are present."],
  ["conflict","Conflict","VERIFIED","SG 58-82; DH 156-159","Core conflict setup, disposition/HP, actions, interaction rules, weapons, Might/Precedence and compromises are present."],
  ["advancement","Advancement","VERIFIED","DH 108-131","Pass/fail advancement, series tests, Nature, new skills, level progression and core class level benefits are present."],
  ["session","Session / phases","VERIFIED","SG 22-25, 39-45, 90-130","Prologue, Adventure, Grind, Camp, Town, Respite and end-session/reward timing are present."],
  ["circles","Circles / relationships","VERIFIED","DH 36-37, 61-64","Starting relationships, Circles factors, success, reputation, Enmity Clause and relationship use are present."],
  ["creation","Character Creation","VERIFIED","DH 25-47","Full core Gather 'Round character creation procedure, starting choices, gear, spells/relics and final setup are present."],
  ["magic","Magic / invocations","VERIFIED","DH 89-107, 183-231","Arcana, memory palace, spell casting, scrolls, Ritual, relics, Urdr/burden, spells and invocations are present."],
  ["scales","Might / Precedence","VERIFIED","DH 11-12, 58-64; SG 58-82, 171+","Might and Precedence scales and their core conflict/social interactions are present."],
  ["narrative","Narrative adjudication","MANUAL","SG 30-38, 132-149, 212-225","The source intentionally assigns fictional applicability, twists, compromises and many judgment calls to the GM/table."]
];

export const TB2E_CORE_SOURCE_COVERAGE_MATRIX=freezeTb2e(rows.map(([id,domain,status,evidence,sourceScope])=>({
  id,domain,status,evidence,sourceScope,
  sourceTier:"CORE",
  coreSourceComplete:status==="VERIFIED",
  implementationState:TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS.includes(id)?"FULL_CORE_REAUDIT_REQUIRED":TB2E_NEW_SHADOW_ADAPTER_DOMAINS.includes(id)?"NEW_SHADOW_ADAPTER_REQUIRED":"MANUAL_ONLY",
  liveEnabled:false,
  automation:"DISABLED_PENDING_RECONCILIATION"
})));

export const TB2E_CONFIRMED_CORE_RECONCILIATION_FINDINGS=freezeTb2e([
  {id:"CREATION_HOME_MISSING_SKILL_2_NOT_3",domain:"creation",severity:"RULE_MISMATCH",requiredChange:"HOME_ABSENT_SKILL_STARTS_AT_2"},
  {id:"CREATION_SOCIAL_GRACE_MISSING_SKILL_2_NOT_3",domain:"creation",severity:"RULE_MISMATCH",requiredChange:"SOCIAL_GRACE_ABSENT_SKILL_STARTS_AT_2"},
  {id:"CREATION_SPECIALTY_MISSING_SKILL_2_NOT_3",domain:"creation",severity:"RULE_MISMATCH",requiredChange:"SPECIALTY_ABSENT_SKILL_STARTS_AT_2"},
  {id:"CONDITIONS_HUNGRY_EXHAUSTED_DISPOSITION_MINUS_1S",domain:"conditions",severity:"OLD_SOURCE_AMBIGUITY_RESOLVED",requiredChange:"USE_MINUS_1S_DISPOSITION_FOR_HUNGRY_THIRSTY_AND_EXHAUSTED"},
  {id:"HELP_ONLY_RECOVERY_AND_LEAVING_TOWN_BILLS_BLOCK_HELP",domain:"help",severity:"RULE_SCOPE_MISMATCH",requiredChange:"DO_NOT_BLOCK_ALL_TOWN_RESOURCES_HELP"},
  {id:"NATURE_MAX_ZERO_RETIRE_AT_END_OF_ADVENTURE",domain:"nature",severity:"TIMING_MISMATCH",requiredChange:"RETIRE_AT_END_OF_ADVENTURE_NOT_ADVENTURE_PHASE"},
  {id:"TEST_FACTORS_AND_TIE_PROCEDURES_NOW_SOURCE_AVAILABLE",domain:"tests",severity:"STALE_SOURCE_BOUNDARY",requiredChange:"REAUDIT_FULL_CORE_TEST_PROCEDURES"},
  {id:"FULL_GEAR_ARMOR_WEAPON_RULES_NOW_SOURCE_AVAILABLE",domain:"inventory",severity:"STALE_SOURCE_BOUNDARY",requiredChange:"REAUDIT_DH_GEAR_AND_WEAPON_REFERENCE"},
  {id:"FULL_CONFLICT_RULES_NOW_SOURCE_AVAILABLE",domain:"conflict",severity:"NEW_SOURCE_DOMAIN",requiredChange:"BUILD_CORE_CONFLICT_SHADOW_ADAPTER"},
  {id:"FULL_SPELL_INVOCATION_RULES_NOW_SOURCE_AVAILABLE",domain:"magic",severity:"NEW_SOURCE_DOMAIN",requiredChange:"BUILD_CORE_MAGIC_SHADOW_ADAPTER"}
]);

export function tb2eCoreSourceCoverageMatrix(){return TB2E_CORE_SOURCE_COVERAGE_MATRIX;}

export function tb2eCoreSourceExpansionAudit(){
  const domains=TB2E_CORE_SOURCE_COVERAGE_MATRIX.map(row=>freezeTb2e({
    ...row,
    sourceVerified:row.status==="VERIFIED",
    sourceBlocked:false,
    manualOnly:row.status==="MANUAL",
    adapterPresent:TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS.includes(row.id),
    adapterReauditRequired:TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS.includes(row.id),
    newShadowAdapterRequired:TB2E_NEW_SHADOW_ADAPTER_DOMAINS.includes(row.id),
    liveCandidate:false
  }));
  const sourceCounts={
    VERIFIED:domains.filter(d=>d.status==="VERIFIED").length,
    MANUAL:domains.filter(d=>d.status==="MANUAL").length,
    SOURCE_BLOCKED:0
  };
  return freezeTb2e({
    phase:"M10D.17",
    mode:"TB2E_FULL_CORE_SOURCE_EXPANSION_AUDIT",
    profileId:"torchbearer2e",
    auditComplete:domains.length===19&&sourceCounts.VERIFIED===18&&sourceCounts.MANUAL===1,
    coreSourceComplete:true,
    domainCount:domains.length,
    sourceCounts,
    domains,
    coreRulebooks:TB2E_CORE_SOURCE_SET.filter(s=>s.tier==="CORE"),
    optionalSupplements:TB2E_CORE_SOURCE_SET.filter(s=>s.tier==="OPTIONAL_EXPANSION"),
    sourceBlockedDomains:[],
    sourceVerifiedDomains:domains.filter(d=>d.sourceVerified).map(d=>d.id),
    existingShadowReauditDomains:TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS,
    newShadowAdapterDomains:TB2E_NEW_SHADOW_ADAPTER_DOMAINS,
    manualDomains:TB2E_MANUAL_DOMAINS,
    confirmedReconciliationFindings:TB2E_CONFIRMED_CORE_RECONCILIATION_FINDINGS,
    existingShadowReauditRequired:true,
    newShadowAdaptersRequired:true,
    liveIntegrationPauseRequired:true,
    liveActivationAuthorized:false,
    profileSwitchAuthorized:false,
    creationCommitAuthorized:false,
    decision:"CORE_SOURCE_COMPLETE_IMPLEMENTATION_RECONCILIATION_REQUIRED",
    nextMilestone:"M10D.18_CORE_RECONCILIATION",
    writes:{actors:0,items:0,journals:0,settings:0},
    liveApplication:false,
    writesPlanned:0
  });
}

export function tb2eCoreDomainAudit(domainId){
  const id=String(domainId??"").trim().toLowerCase();
  return tb2eCoreSourceExpansionAudit().domains.find(d=>d.id===id)??null;
}
