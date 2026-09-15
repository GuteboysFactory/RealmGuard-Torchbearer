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

const state = {
  attempts: 0,
  filePickerBridgeInstalled: false,
  filePickerBridgeReason: "NOT_ATTEMPTED",
  lastAttemptPhase: "module-load"
};

function bridgeFilePicker(phase = "runtime") {
  state.attempts += 1;
  state.lastAttemptPhase = phase;

  const modernFilePicker = modernFilePickerImplementation();
  if (!modernFilePicker) {
    state.filePickerBridgeInstalled = false;
    state.filePickerBridgeReason = "MODERN_FILE_PICKER_UNAVAILABLE";
    return false;
  }

  try {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "FilePicker");
    if (descriptor && !descriptor.configurable && descriptor.value !== modernFilePicker) {
      state.filePickerBridgeInstalled = false;
      state.filePickerBridgeReason = "GLOBAL_ALIAS_NOT_CONFIGURABLE";
      return false;
    }

    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(globalThis, "FilePicker", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: modernFilePicker
      });
    }

    state.filePickerBridgeInstalled = true;
    state.filePickerBridgeReason = "MODERN_NAMESPACED_IMPLEMENTATION";
    return true;
  } catch (error) {
    state.filePickerBridgeInstalled = false;
    state.filePickerBridgeReason = `BRIDGE_FAILED:${error?.message ?? "unknown"}`;
    return false;
  }
}

function statusSnapshot() {
  return Object.freeze({
    scope: "FOUNDRY_V13_V14_COMPAT",
    targetApi: "foundry.applications.apps.FilePicker.implementation",
    deprecatedGlobalReadRequired: false,
    filePickerBridgeInstalled: state.filePickerBridgeInstalled,
    filePickerBridgeReason: state.filePickerBridgeReason,
    attempts: state.attempts,
    lastAttemptPhase: state.lastAttemptPhase,
    foundryGeneration: foundryGeneration(),
    minimumSupportedGeneration: 13,
    forwardApiBaseline: 14,
    legacyGlobalRemovalGeneration: 15
  });
}

export function installRealmGuardFoundryCompat() {
  bridgeFilePicker("module-load");

  globalThis.Hooks?.once?.("init", () => {
    bridgeFilePicker("init");
  });

  globalThis.Hooks?.once?.("ready", () => {
    bridgeFilePicker("ready");
    globalThis.game.realmGuard ??= {};
    globalThis.game.realmGuard.compat = Object.freeze({
      getStatus: statusSnapshot,
      getFilePicker: modernFilePickerImplementation
    });
    console.log("realm-guard | Foundry compatibility bridge ready", statusSnapshot());
  });

  globalThis[RG_COMPAT_KEY] = Object.freeze({ getStatus: statusSnapshot, getFilePicker: modernFilePickerImplementation });
  globalThis.__realmGuardFoundryCompat = globalThis[RG_COMPAT_KEY];
  return globalThis[RG_COMPAT_KEY];
}

installRealmGuardFoundryCompat();
