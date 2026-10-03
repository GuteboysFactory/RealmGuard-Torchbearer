import { RulesProfile } from "../core/rules-profile.mjs";
import { TB2E_SOURCE_COVERAGE_MATRIX } from "../m10d-tb2e-source-coverage.mjs";
import { TB2E_SOURCE_AUTHORITY } from "./torchbearer2e-source-lineage.mjs";

export const TORCHBEARER2E_FOUNDATION_PROFILE = new RulesProfile({
  id:"torchbearer2e", version:1, name:"Torchbearer 2E", parent:null,
  classification:"SOURCE-CONSTRAINED FOUNDATION",
  domains:{
    ...Object.fromEntries(TB2E_SOURCE_COVERAGE_MATRIX.map(row=>[row.id,{mode:"READ_ONLY",coverage:row.status,liveEnabled:false}])),
    profile:{activationState:"FOUNDATION_ONLY"},
    creation:{mode:"READ_ONLY",profileId:"torchbearer2e",liveAuthority:"NONE",liveEnabled:false,coverage:"PARTIAL"},
    inventory:{mode:"READ_ONLY",policy:"UNESTABLISHED",structuredPlacementAuthority:false,liveEnabled:false,coverage:"PARTIAL"},
    progression:{mode:"READ_ONLY",levels:false,talents:false,liveEnabled:false,coverage:"PARTIAL"},
    tokensOfPower:{enabled:false},scaleOfMight:{enabled:false}
  },
  registry:TB2E_SOURCE_COVERAGE_MATRIX.map(row=>({
    id:`TB2E.${row.id.toUpperCase()}`,domain:row.id,title:row.domain,
    activeValue:`${row.status} / FOUNDATION_ONLY`,classification:row.status,automation:"MANUAL",
    source:row.evidence,sourceVersion:"TB2E project guides only",overrideReason:row.gaps
  })),
  metadata:{
    foundationOnly:true,selectable:false,supported:false,liveRuleAuthority:false,activationState:"FOUNDATION_ONLY",
    implementationPhase:"M10D.1",mode:"READ_ONLY",conversionPreviewAvailable:true,
    liveParityVerified:false,explicitActivationAuthorized:false,creationCommitAllowed:false,
    sourceLineage:TB2E_SOURCE_AUTHORITY.map(source=>source.id),sourceAuthority:TB2E_SOURCE_AUTHORITY,
    sourceComplete:false,sourceCoverageMatrix:TB2E_SOURCE_COVERAGE_MATRIX,
    inheritedRuleProviders:[],writesPlanned:0,
    nextStep:"Review source coverage and obtain missing rule authority before any later M10D live milestone"
  }
});
