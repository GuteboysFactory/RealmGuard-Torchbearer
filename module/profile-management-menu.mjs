import { previewMg1eConversion, previewStrictConversion, showMg1eConversionPreview, showStrictConversionPreview } from "./m10-profile-service.mjs";
import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { profileActivationStatus, switchToLegacyMixed, switchToStrictRealmGuard } from "./m10-profile-activation.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

function impactRows(impact = {}) {
  return [
    ["Rangers", impact.rangers ?? 0],
    ["Wise Items", impact.wiseItems ?? 0],
    ["Unrated Wises", impact.unratedWiseItems ?? 0],
    ["Talent Items", impact.talentItems ?? 0],
    ["Structured Gear Items", impact.structuredGearItems ?? 0],
    ["Fresh / Afraid / Strained / Sick", (impact.freshItems ?? 0) + (impact.afraidItems ?? 0) + (impact.strainedItems ?? 0) + (impact.sickItems ?? 0)],
    ["Token of Power Items", impact.tokenOfPowerItems ?? 0],
    ["Legacy Mixed provenance", impact.actorsWithLegacyCreationProvenance ?? 0],
    ["Strict provenance", impact.actorsWithStrictCreationProvenance ?? 0]
  ].map(([label, value]) => Object.freeze({ label, value }));
}

async function previewStrictAction() { await showStrictConversionPreview(); }
async function previewMg1eAction() { await showMg1eConversionPreview(); }

async function switchStrictAction() {
  const preview = previewStrictConversion();
  const confirmed = await foundry.applications.api.DialogV2.wait({
    window:{title:"Realm Guard · Activate Strict Profile",resizable:true},
    content:`<div class="realm-guard"><h2>Switch this world to Strict Realm Guard?</h2>
      <p>This is a <b>supported profile switch</b>. Existing Actors and Items are preserved; only the active Rules Profile world settings are changed.</p>
      <p><b>World impact:</b> ${preview.worldImpact?.rangers ?? 0} Rangers · ${preview.worldImpact?.wiseItems ?? 0} Wise Items · ${preview.worldImpact?.actorsWithProfileSpecificConditions ?? 0} Actor(s) with profile-specific Conditions.</p>
      <p>No automatic Wise rating, Talent deletion, Condition deletion or inventory migration will occur.</p>
      <p><b>Reload the world after switching.</b></p></div>`,
    modal:true,rejectClose:false,
    buttons:[
      {action:"activate",label:"Switch to Strict",icon:"fa-solid fa-scale-balanced",callback:()=>true},
      {action:"cancel",label:"Cancel",default:true,callback:()=>false}
    ]
  });
  if (!confirmed) return;
  const result = await switchToStrictRealmGuard();
  ui.notifications.info("Realm Guard: Strict profile activated. Reload the world before continuing.");
  return result;
}

async function switchLegacyAction() {
  const confirmed = await foundry.applications.api.DialogV2.wait({
    window:{title:"Realm Guard · Return to Legacy Mixed",resizable:true},
    content:`<div class="realm-guard"><h2>Switch back to Legacy Mixed?</h2><p>This changes only the active Rules Profile world settings. Existing profile-specific data is preserved.</p><p><b>Reload the world after switching.</b></p></div>`,
    modal:true,rejectClose:false,
    buttons:[
      {action:"legacy",label:"Switch to Legacy Mixed",icon:"fa-solid fa-rotate-left",callback:()=>true},
      {action:"cancel",label:"Cancel",default:true,callback:()=>false}
    ]
  });
  if (!confirmed) return;
  const result = await switchToLegacyMixed();
  ui.notifications.info("Realm Guard: Legacy Mixed profile restored. Reload the world before testing.");
  return result;
}

export class RealmGuardProfileManagement extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id:"realm-guard-profile-management",
    classes:["realm-guard","rg-profile-management"],
    position:{width:760,height:820},
    window:{title:"Realm Guard / Torchbearer · Rules Profile Management",icon:"fa-solid fa-scale-balanced",resizable:true},
    actions:{previewStrict:previewStrictAction,previewMg1e:previewMg1eAction,switchStrict:switchStrictAction,switchLegacy:switchLegacyAction}
  };

  static PARTS = { main:{template:"systems/realm-guard/templates/apps/profile-management.hbs",scrollable:[""]} };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const active = getRulesProfileRuntime();
    const strict = resolveRulesProfile("realm-guard-strict");
    const mg1e = resolveRulesProfile("mg1e");
    const mgPreview = previewMg1eConversion();
    const activation = profileActivationStatus();
    return foundry.utils.mergeObject(context, {
      activeProfile:{
        id:active.profile.id,name:active.profile.name,version:active.profile.version,
        classification:active.profile.classification,activationState:active.profile.metadata?.activationState ?? "ACTIVE",
        rulesSnapshotHash:active.profile.rulesSnapshotHash
      },
      strictProfile:{
        id:strict.profile.id,name:strict.profile.name,version:strict.profile.version,
        activationState:strict.profile.metadata?.activationState ?? "SUPPORTED",
        sourceLineage:(strict.profile.metadata?.sourceLineage ?? []).join(" → "),
        rulesSnapshotHash:strict.profile.rulesSnapshotHash
      },
      mg1eProfile:{
        id:mg1e.profile.id,name:mg1e.profile.name,version:mg1e.profile.version,
        activationState:mg1e.profile.metadata?.activationState ?? "FOUNDATION_ONLY",
        classification:mg1e.profile.classification,
        sourceLineage:(mg1e.profile.metadata?.sourceLineage ?? []).join(" → "),
        rulesSnapshotHash:mg1e.profile.rulesSnapshotHash,
        selectable:mg1e.profile.metadata?.selectable !== false
      },
      impactRows:impactRows(mgPreview.worldImpact),
      previewAvailable:true,
      canSwitchStrict:active.profile.id !== "realm-guard-strict" && activation.switchAvailable,
      canSwitchLegacy:active.profile.id !== "realm-guard-legacy-mixed",
      switchLockReason:activation.switchAvailable ? "" : "Strict Realm Guard is not selectable or supported in this build.",
      reloadRecommended:true,
      phase:"M10B.3",
      nextStep:"MG1E is preview-only in qa.2; no activation or campaign-data conversion is available"
    }, { inplace:false });
  }
}

export function installProfileManagementMenu() {
  game.settings.registerMenu("realm-guard","rulesProfileManagement",{
    name:"Rules Profile Management",
    label:"Manage Rules Profile",
    hint:"Review the active rules profile, preview profile differences, and perform supported reversible profile switching.",
    icon:"fa-solid fa-scale-balanced",
    type:RealmGuardProfileManagement,
    restricted:true
  });
}
