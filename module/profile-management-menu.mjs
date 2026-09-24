import { previewStrictConversion, showStrictConversionPreview } from "./m10-profile-service.mjs";
import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { profileActivationStatus, switchToLegacyMixed, switchToStrictRealmGuard } from "./m10-profile-activation.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

function impactRows(impact = {}) {
  return [
    ["Rangers", impact.rangers ?? 0],
    ["Rangers with Wises", impact.rangersWithWises ?? 0],
    ["Wise Items", impact.wiseItems ?? 0],
    ["Structured Gear Items", impact.structuredGearItems ?? 0],
    ["Actors with Fresh / Afraid", impact.actorsWithFreshOrAfraid ?? 0],
    ["Legacy Mixed provenance", impact.actorsWithLegacyCreationProvenance ?? 0]
  ].map(([label, value]) => Object.freeze({ label, value }));
}

async function previewStrictAction() {
  await showStrictConversionPreview();
}

async function switchStrictAction() {
  const preview = previewStrictConversion();
  const confirmed = await foundry.applications.api.DialogV2.wait({
    window:{title:"Realm Guard · Activate Strict Profile",resizable:true},
    content:`<div class="realm-guard"><h2>Switch this world to Strict Realm Guard?</h2>
      <p>This is a <b>QA activation</b>. Existing Actors and Items are preserved; only the active Rules Profile world settings are changed.</p>
      <p><b>World impact:</b> ${preview.worldImpact?.rangers ?? 0} Rangers · ${preview.worldImpact?.wiseItems ?? 0} Wise Items · ${preview.worldImpact?.actorsWithFreshOrAfraid ?? 0} Actor(s) with Fresh/Afraid.</p>
      <p>No automatic Wise rating, Talent deletion, Condition deletion or inventory migration will occur.</p>
      <p><b>Reload the world after switching.</b></p></div>`,
    modal:true,
    rejectClose:false,
    buttons:[
      {action:"activate",label:"Switch to Strict",icon:"fa-solid fa-scale-balanced",callback:()=>true},
      {action:"cancel",label:"Cancel",default:true,callback:()=>false}
    ]
  });
  if (!confirmed) return;
  const result = await switchToStrictRealmGuard();
  ui.notifications.info("Realm Guard: Strict profile activated for QA. Reload the world before testing.");
  return result;
}

async function switchLegacyAction() {
  const confirmed = await foundry.applications.api.DialogV2.wait({
    window:{title:"Realm Guard · Return to Legacy Mixed",resizable:true},
    content:`<div class="realm-guard"><h2>Switch back to Legacy Mixed?</h2><p>This changes only the active Rules Profile world settings. Existing Strict-created data is preserved.</p><p><b>Reload the world after switching.</b></p></div>`,
    modal:true,
    rejectClose:false,
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
    id: "realm-guard-profile-management",
    classes: ["realm-guard", "rg-profile-management"],
    position: { width: 720, height: 760 },
    window: {
      title: "Realm Guard / Torchbearer · Rules Profile Management",
      icon: "fa-solid fa-scale-balanced",
      resizable: true
    },
    actions: {
      previewStrict: previewStrictAction,
      switchStrict: switchStrictAction,
      switchLegacy: switchLegacyAction
    }
  };

  static PARTS = {
    main: {
      template: "systems/realm-guard/templates/apps/profile-management.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const active = getRulesProfileRuntime();
    const strict = resolveRulesProfile("realm-guard-strict");
    const preview = previewStrictConversion();
    const activation = profileActivationStatus();
    return foundry.utils.mergeObject(context, {
      activeProfile: {
        id: active.profile.id,
        name: active.profile.name,
        version: active.profile.version,
        classification: active.profile.classification,
        activationState: active.profile.metadata?.activationState ?? "ACTIVE",
        rulesSnapshotHash: active.profile.rulesSnapshotHash
      },
      strictProfile: {
        id: strict.profile.id,
        name: strict.profile.name,
        version: strict.profile.version,
        activationState: strict.profile.metadata?.activationState ?? "PREVIEW_ONLY",
        sourceLineage: (strict.profile.metadata?.sourceLineage ?? []).join(" → "),
        rulesSnapshotHash: strict.profile.rulesSnapshotHash
      },
      impactRows: impactRows(preview.worldImpact),
      previewAvailable: true,
      switchLocked: false,
      canSwitchStrict: active.profile.id !== "realm-guard-strict" && activation.qaSwitchAvailable,
      canSwitchLegacy: active.profile.id !== "realm-guard-legacy-mixed",
      switchLockReason: activation.qaSwitchAvailable ? "" : "Strict activation is available only in QA builds.",
      reloadRecommended: true,
      phase: "M10A.8",
      nextStep: "Profile Activation QA · switch / reload / rollback"
    }, { inplace: false });
  }
}

export function installProfileManagementMenu() {
  game.settings.registerMenu("realm-guard", "rulesProfileManagement", {
    name: "Rules Profile Management",
    label: "Manage Rules Profile",
    hint: "Review the active rules profile, inspect Strict Realm Guard impact, and perform reversible QA profile switching.",
    icon: "fa-solid fa-scale-balanced",
    type: RealmGuardProfileManagement,
    restricted: true
  });
}
