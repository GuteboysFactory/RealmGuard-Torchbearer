import { RulesProfile } from "../core/rules-profile.mjs";
import { TB2E_SOURCE_COVERAGE_MATRIX } from "../m10d-tb2e-source-coverage.mjs";
import { TB2E_SOURCE_AUTHORITY } from "./torchbearer2e-source-lineage.mjs";
import { TB2E_CORE_SOURCE_COVERAGE_MATRIX } from "../m10d-tb2e-core-source-expansion.mjs";

export const TORCHBEARER2E_FOUNDATION_PROFILE = new RulesProfile({
  id:"torchbearer2e", version:1, name:"Torchbearer 2E", parent:null,
  classification:"FULL-CORE-SOURCED FOUNDATION",
  domains:{
    ...Object.fromEntries(TB2E_CORE_SOURCE_COVERAGE_MATRIX.map(row=>[row.id,{mode:row.status==="MANUAL"?"OFF":"READ_ONLY",coverage:row.status,implementationState:row.implementationState,liveEnabled:false}])),
    profile:{activationState:"FOUNDATION_ONLY"},
    wises:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",ratingMode:"NONE",shadowAdapterReady:true},
    help:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true},
    tests:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,successThreshold:4},
    nature:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,currentMaximumSeparated:true},
    abilities:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,skillLimit:24},
    resources:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,resourcesRange:{min:0,max:10}},
    conditions:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,conflictDispositionAutomation:false},
    recovery:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,conditionMutation:false},
    creation:{mode:"READ_ONLY_SHADOW",profileId:"torchbearer2e",liveAuthority:"NONE",liveEnabled:false,coverage:"VERIFIED",automation:"SHADOW_ONLY",shadowAdapterReady:true,commitAllowed:false,grantApplication:false},
    inventory:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,structuredPlacementAuthority:"SOURCE_BOUNDED_PREVIEW_ONLY",placementMutation:false},
    progression:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,levels:"BOUNDARY_ONLY",talents:false},
    session:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,phaseMutation:false},
    circles:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,ratingRange:{min:1,max:10},npcCreation:false,relationshipMutation:false},
    scales:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,mightRange:{min:1,max:8},precedenceRange:{min:0,max:7},conflictMutation:false},
    traits:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,implementationState:"P2_1_TRAITS_VERIFIED"},
    armor:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,implementationState:"P2_2_ARMOR_VERIFIED"},
    conflict:{mode:"READ_ONLY_SHADOW",coverage:"VERIFIED",liveEnabled:false,automation:"SHADOW_ONLY",shadowAdapterReady:true,implementationState:"P2_3_CONFLICT_SHADOW_QA_PENDING"},
    magic:{mode:"OFF",coverage:"VERIFIED",liveEnabled:false,automation:"DISABLED_PENDING_ADAPTER",shadowAdapterReady:false,implementationState:"NEW_SHADOW_ADAPTER_REQUIRED"},
    narrative:{mode:"OFF",coverage:"MANUAL",liveEnabled:false,automation:"GM_MANUAL",implementationState:"MANUAL_ONLY"},
    tokensOfPower:{enabled:false},scaleOfMight:{enabled:false}
  },
  registry:TB2E_CORE_SOURCE_COVERAGE_MATRIX.map(row=>({
    id:`TB2E.${row.id.toUpperCase()}`,domain:row.id,title:row.domain,
    activeValue:`${row.status} / ${row.implementationState}`,classification:row.status,automation:"DISABLED",
    source:row.evidence,sourceVersion:"TB2E full core rulebooks + separated optional supplements",overrideReason:row.implementationState
  })),
  metadata:{
    foundationOnly:true,selectable:false,supported:false,liveRuleAuthority:false,activationState:"FOUNDATION_ONLY",
    implementationPhase:"M10D.18",mode:"READ_ONLY",conversionPreviewAvailable:true,
    liveParityVerified:false,explicitActivationAuthorized:false,creationCommitAllowed:false,
    sourceLineage:TB2E_SOURCE_AUTHORITY.map(source=>source.id),sourceAuthority:TB2E_SOURCE_AUTHORITY,
    sourceComplete:true,coreSourceComplete:true,sourceCoverageMatrix:TB2E_CORE_SOURCE_COVERAGE_MATRIX,guideBaselineCoverageMatrix:TB2E_SOURCE_COVERAGE_MATRIX,
    wiseShadowAdapterReady:true,helpShadowAdapterReady:true,testShadowAdapterReady:true,natureShadowAdapterReady:true,abilitiesShadowAdapterReady:true,resourcesShadowAdapterReady:true,conditionsShadowAdapterReady:true,recoveryShadowAdapterReady:true,inventoryShadowAdapterReady:true,advancementShadowAdapterReady:true,sessionShadowAdapterReady:true,circlesShadowAdapterReady:true,scalesShadowAdapterReady:true,creationShadowAdapterReady:true,shadowReadyDomains:["wises","help","tests","nature","abilities","resources","conditions","recovery","inventory","advancement","session","circles","scales","creation"],
    inheritedRuleProviders:[],writesPlanned:0,finalFoundationAudit:true,coreSourceExpansionAudit:true,liveAuthorityFrameworkReady:true,liveAuthorityFrameworkPhase:"M11.1_PAUSED_FOR_SOURCE_EXPANSION",
    historicalFinalClassificationCounts:{VERIFIED:1,BOUNDED_PARTIAL:13,SOURCE_BLOCKED:4,MANUAL:1},
    finalClassificationCounts:{VERIFIED:18,BOUNDED_PARTIAL:0,SOURCE_BLOCKED:0,MANUAL:1},
    coreSourceClassificationCounts:{VERIFIED:18,MANUAL:1,SOURCE_BLOCKED:0},
    fullCoreShadowReauditRequired:true,p2ImplementedShadowAdapters:["traits","armor","conflict"],newShadowAdaptersRequired:["magic"],liveIntegrationPaused:true,
    coreReconciliationPackage:"P1_CONFIRMED_MISMATCH_REPAIRS",resolvedReconciliationFindingCount:6,
    nextStep:"M10D.18 P2.3 Conflict shadow QA; Magic pending; M11 paused"
  }
});
