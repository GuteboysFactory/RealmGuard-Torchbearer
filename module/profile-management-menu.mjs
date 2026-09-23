import { previewStrictConversion, showStrictConversionPreview } from "./m10-profile-service.mjs";
import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";

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
      previewStrict: previewStrictAction
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
      switchLocked: true,
      switchLockReason: "Strict activation remains locked until M10A.8 Profile Activation QA.",
      phase: "M10A.4",
      nextStep: "M10A.5 Session / Circles / Progression"
    }, { inplace: false });
  }
}

export function installProfileManagementMenu() {
  game.settings.registerMenu("realm-guard", "rulesProfileManagement", {
    name: "Rules Profile Management",
    label: "Manage Rules Profile",
    hint: "Review the active rules profile, inspect Strict Realm Guard impact, and preview conversion safely. Profile switching remains locked during M10 implementation.",
    icon: "fa-solid fa-scale-balanced",
    type: RealmGuardProfileManagement,
    restricted: true
  });
}
