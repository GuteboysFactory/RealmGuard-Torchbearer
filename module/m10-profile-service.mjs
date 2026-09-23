import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { buildStrictConversionPreview, openStrictConversionPreview } from "./m10-profile-conversion-preview.mjs";

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
    phase: "M10A.1",
    mode: "READ_ONLY_CONVERSION_PREVIEW",
    activeProfileId: active.profile.id,
    targetProfileId: strict.profile.id,
    targetActivationState: strict.profile.metadata?.activationState ?? "PREVIEW_ONLY",
    liveActivation: false,
    actorItemWrites: false,
    worldSettingWrites: false,
    conversionPreviewAvailable: true,
    nextStep: "M10A.2 Wises / Traits / Help"
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
      openStrictConversionPreview: showStrictConversionPreview
    });
    console.log("realm-guard | M10A.1 Strict Profile conversion preview ready", getM10ProfilePreviewStatus());
  });
}
