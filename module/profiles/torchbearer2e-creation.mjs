import { CharacterCreationProfile } from "../core/m9-creation.mjs";
import { freezeTb2e } from "../m10d-tb2e-source-coverage.mjs";
import { TB2E_SOURCE_AUTHORITY } from "./torchbearer2e-source-lineage.mjs";

export const TORCHBEARER2E_CREATION_PROFILE = new CharacterCreationProfile({
  id:"torchbearer2e",version:1,name:"Torchbearer 2E Character Creation Foundation",
  dimensions:["stock","class","level"],
  steps:freezeTb2e([
    ["stock-class","Stock / Class","CC 2, 6-12"],["home","Home","CC 15-22"],
    ["skills","Skills / Specialty","CC 13-14, 23-24"],["wises","Wises","CC 25"],
    ["nature","Nature questionnaire","CC 26-30"],["relationships","Circles / Relationships","CC 31-35"],
    ["resources-gear","Resources / Gear","CC 36-43"],["drives","Belief / Instinct / Goal","CC 44-46"],
    ["details","Level 1 / Final details","CC 47-48"]
  ].map(([id,label,evidence])=>({id,label,evidence,mode:"READ_ONLY",coverage:"PARTIAL"}))),
  rules:freezeTb2e({mode:"READ_ONLY",coverage:"PARTIAL",grantsEnabled:false,deriveStats:false,boundedShadowAdapterReady:true}),
  grants:freezeTb2e({}),
  metadata:freezeTb2e({foundationOnly:true,mode:"READ_ONLY",implementationPhase:"M10D.15",activationAllowed:false,
    liveCommit:false,writesPlanned:0,sourceComplete:false,sourceAuthority:TB2E_SOURCE_AUTHORITY,
    sourceLineage:TB2E_SOURCE_AUTHORITY.map(source=>source.id),boundedShadowAdapterReady:true}),
  derive:()=>freezeTb2e({foundationOnly:true,mode:"READ_ONLY",grants:[],warnings:["TB2E creation is a source-audit foundation. No derived statistics or document grants are authorized."]}),
  validateStep:()=>({errors:["Torchbearer 2E creation is FOUNDATION_ONLY; no creation commit is authorized."],warnings:[]}),
  buildCommitSpec:()=>{throw new Error("Torchbearer 2E creation is FOUNDATION_ONLY; no Actor, Item or Journal writes are authorized.");}
});
