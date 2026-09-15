const RG_COMPAT_KEY = Symbol.for("realm-guard.foundry-compat");

function foundryGeneration() {
  const raw = String(globalThis.game?.version ?? globalThis.game?.release?.generation ?? "");
  const direct = Number(globalThis.game?.release?.generation);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const match = raw.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

export function modernFilePickerImplementation() {
  const FilePickerClass = globalThis.foundry?.applications?.apps?.FilePicker;
  return FilePickerClass?.implementation ?? FilePickerClass ?? null;
}

export function installRealmGuardFoundryCompat() {
  if (globalThis[RG_COMPAT_KEY]) return globalThis[RG_COMPAT_KEY];

  const modernFilePicker = modernFilePickerImplementation();
  let aliasBridge = false;
  let aliasReason = "MODERN_FILE_PICKER_UNAVAILABLE";

  if (modernFilePicker) {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, "FilePicker");
      if (!descriptor || descriptor.configurable) {
        Object.defineProperty(globalThis, "FilePicker", {
          configurable: true,
          enumerable: false,
          writable: false,
          value: modernFilePicker
        });
        aliasBridge = true;
        aliasReason = "MODERN_NAMESPACED_IMPLEMENTATION";
      } else {
        aliasReason = "GLOBAL_ALIAS_NOT_CONFIGURABLE";
      }
    } catch (error) {
      aliasReason = `BRIDGE_FAILED:${error?.message ?? "unknown"}`;
    }
  }

  const status = Object.freeze({
    scope: "FOUNDRY_V13_V14_COMPAT",
    targetApi: "foundry.applications.apps.FilePicker.implementation",
    deprecatedGlobalReadRequired: false,
    filePickerBridgeInstalled: aliasBridge,
    filePickerBridgeReason: aliasReason,
    foundryGeneration: foundryGeneration(),
    minimumSupportedGeneration: 13,
    forwardApiBaseline: 14,
    legacyGlobalRemovalGeneration: 15
  });

  globalThis[RG_COMPAT_KEY] = status;
  globalThis.__realmGuardFoundryCompat = status;

  globalThis.Hooks?.once?.("ready", () => {
    globalThis.game.realmGuard ??= {};
    globalThis.game.realmGuard.compat = Object.freeze({ getStatus: () => status });
    console.log("realm-guard | Foundry compatibility bridge ready", status);
  });

  return status;
}

installRealmGuardFoundryCompat();
