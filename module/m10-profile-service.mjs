import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { buildStrictConversionPreview, openStrictConversionPreview } from "./m10-profile-conversion-preview.mjs";
import {
  buildStrictHelperConsequenceContract,
  classifyStrictHelp,
  getStrictWisesTraitsHelpStatus,
  planStrictWiseLearning,
  planStrictWiseTest,
  strictHelperEligibility,
  strictTraitAgainstPlan,
  strictTraitBenefitPlan,
  strictTraitCheckEconomy,
  strictWiseView
} from "./m10-strict-wises-traits-help.mjs";

function currentActors() {
  return globalThis.game?.actors?.contents ?? [];
}

function currentWorldItems() {
  return globalThis.game?.items?.contents ?? [];
}

export function getM10ProfilePreviewStatus() {
  const active = getRulesProfileRuntime();
  const strict = resolveRulesProfile("realm-guard-strict");
  return Object.freeze({
    phase: "M10A.2",
    mode: "STRICT_POLICY_FOUNDATION_PLUS_READ_ONLY_CONVERSION_PREVIEW",
    activeProfileId: active.profile.id,
    targetProfileId: strict.profile.id,
    targetActivationState: strict.profile.metadata?.activationState ?? "PREVIEW_ONLY",
    liveActivation: false,
    actorItemWrites: false,
    worldSettingWrites: false,
    conversionPreviewAvailable: true,
    strictRulesLive: false,
    wiseAutoConversion: false,
    profileSwitchAvailable: false,
    nextStep: "M10A.3 Conditions / Recovery"
  });
}

export function previewStrictConversion() {
  const active = getRulesProfileRuntime();
  const strict = resolveRulesProfile("realm-guard-strict");
  return buildStrictConversionPreview({
    fromProfile: active.profile,
    toProfile: strict.profile,
    actors: currentActors(),
    worldItems: currentWorldItems()
  });
}

export function showStrictConversionPreview() {
  const active = getRulesProfileRuntime();
  const strict = resolveRulesProfile("realm-guard-strict");
  return openStrictConversionPreview({
    fromState: active,
    toState: strict,
    actors: currentActors(),
    worldItems: currentWorldItems()
  });
}

export function installM10ProfileConversionPreview() {
  globalThis.Hooks?.once?.("ready", () => {
    globalThis.game.realmGuard ??= {};
    globalThis.game.realmGuard.core ??= {};
    globalThis.game.realmGuard.core.m10 = Object.freeze({
      getStatus: getM10ProfilePreviewStatus,
      previewStrictConversion,
      openStrictConversionPreview: showStrictConversionPreview,
      strict: Object.freeze({
        getStatus: getStrictWisesTraitsHelpStatus,
        wiseView: strictWiseView,
        planWiseTest: planStrictWiseTest,
        planWiseLearning: planStrictWiseLearning,
        traitBenefitPlan: strictTraitBenefitPlan,
        traitAgainstPlan: strictTraitAgainstPlan,
        traitCheckEconomy: strictTraitCheckEconomy,
        classifyHelp: classifyStrictHelp,
        helperEligibility: strictHelperEligibility,
        helperConsequenceContract: buildStrictHelperConsequenceContract
      })
    });
    console.log("realm-guard | M10A.2 Strict Wises / Traits / Help policy foundation ready", getM10ProfilePreviewStatus());
  });
}
