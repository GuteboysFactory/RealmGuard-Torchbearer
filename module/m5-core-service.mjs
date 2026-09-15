import { registerGmDockTool } from "./gm-dock.mjs";
import { getActiveRulesProfile } from "./rules-profile-service.mjs";
import { createM5Services, INVENTORY_MODES, M5_STRUCTURED_ZONES, M5_CONTAINER_PRESETS } from "./core/m5-services.mjs";
import { createM5ParityBridge } from "./m5-parity-bridge.mjs";

let runtime = null;
let parityBridge = null;

function services() {
  if (runtime) return runtime;
  runtime = createM5Services(getActiveRulesProfile());
  return runtime;
}

function parity() {
  if (parityBridge) return parityBridge;
  parityBridge = createM5ParityBridge({ services: services() });
  return parityBridge;
}

export function getM5Status() {
  const profile = getActiveRulesProfile();
  const current = services();
  const paritySummary = parityBridge?.report?.()?.summary ?? Object.freeze({ total: 0, matches: 0, mismatches: 0, coreOnly: 0 });
  return Object.freeze({
    phase: "M5",
    buildScope: "LIVE_SHADOW_INVENTORY_CONFLICT_TOOL_PARITY",
    mode: "SHADOW_PARITY",
    liveApplication: false,
    authority: "LEGACY_MIXED",
    activeProfile: profile?.id ?? "realm-guard-legacy-mixed",
    inventoryPolicy: current.policy.mode,
    services: Object.freeze([
      "GearService",
      "InventoryPolicy",
      "PlacementValidator",
      "ContainerService",
      "ConflictToolService",
      "ConflictToolEffectProvider",
      "M5ParityBridge"
    ]),
    parity: Object.freeze({
      inventoryLiveObservation: true,
      conflictToolLiveObservation: true,
      mismatchBlocksLegacy: false,
      report: paritySummary
    }),
    inventoryModes: INVENTORY_MODES,
    structuredZones: Object.freeze(M5_STRUCTURED_ZONES.map(zone => zone.id)),
    conflictToolCapabilities: Object.freeze([
      "PHYSICAL_GEAR",
      "NATURAL_TOOL",
      "NARRATIVE_CONTEXTUAL_TOOL",
      "MULTI_EFFECT_TOOL",
      "TEMPORARY_DISABLE_TARGETS"
    ]),
    unarmed: Object.freeze({
      coreDefaultDice: 0,
      legacyMixedCompatibilityDice: -1,
      liveBehaviorChanged: false
    }),
    preservation: Object.freeze({
      inventoryDataMigration: false,
      existingPaperDollUx: true,
      legacyInventoryWriter: true,
      legacyConflictWriter: true,
      conflictLiveTakeover: false,
      gameplayChangeIntended: false,
      m2: "PRESERVED",
      m3: "PRESERVED",
      m4: "VERIFIED_PRESERVED"
    })
  });
}

function actorSnapshot(actor) {
  const current = services();
  return Object.freeze({
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? "",
    policy: current.policy.describe(),
    gear: current.gear.snapshot(actor),
    containers: Object.freeze(current.gear.list(actor).filter(item => current.containers.isContainer(item)).map(item => Object.freeze({
      id: item.id,
      name: item.name,
      ...current.containers.usage(actor, item)
    }))),
    conflictTools: current.conflictTools.list(actor, { conflictType: "fight" }),
    parity: parityBridge?.report?.({ actorId: actor?.id ?? "" })?.summary ?? null
  });
}

function diagnosticsHtml() {
  const s = getM5Status();
  const p = s.parity.report;
  return `<div class="realm-guard" style="padding:8px 12px;max-height:64vh;overflow:auto;">
    <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M5</div>
    <h2>Gear · Inventory · Conflict Tools</h2>
    <p><b>Mode:</b> ${s.mode} · <b>Live application:</b> OFF · <b>Authority:</b> Legacy Mixed</p>
    <p>qa.11 connects the real Legacy Mixed Inventory writes and Conflict Tool roll results to CORE shadow validation/evaluation. CORE records parity only: it never blocks, rewrites or takes authority from the live flow.</p>
    <h3>Live shadow parity</h3>
    <p><b>${p.total}</b> observations · <b>${p.matches}</b> MATCH · <b>${p.mismatches}</b> MISMATCH · <b>${p.coreOnly}</b> CORE-only probes</p>
    <p>Inventory placement writes are observed before commit. Conflict Tool results are compared when the live Conflict state receives a resolved roll.</p>
    <h3>Services</h3>
    <p>${s.services.join(" · ")}</p>
    <h3>Active policy</h3>
    <p><b>${s.inventoryPolicy}</b> · ${s.structuredZones.length} structured zones · no Actor or Item migration</p>
    <h3>Conflict Tool architecture</h3>
    <p>Physical Gear · Natural Tools · Narrative/Contextual Tools · multiple effects · temporary disable targets.</p>
    <p><b>Unarmed:</b> CORE default 0D tool effect. Legacy Mixed compatibility remains −1D until an explicit profile conversion changes live behavior.</p>
    <h3>Console QA</h3>
    <code>game.realmGuard.core.m5.getStatus()</code><br>
    <code>game.realmGuard.core.m5.parity.report()</code><br>
    <code>game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })</code><br>
    <code>game.realmGuard.core.m5.parity.clear()</code><br>
    <code>game.realmGuard.core.m5.actorSnapshot(game.actors.getName("Ranger Name"))</code><br>
    <code>game.realmGuard.core.m5.parity.probeZone(actor, gearId, "right-hand", { legacyAccepted: true })</code><br>
    <code>game.realmGuard.core.m5.parity.probeConflict(actor, { toolId: "gear:ID", action: "attack", conflictType: "fight" }, { dice: 0 })</code>
  </div>`;
}

function exposeApi() {
  const current = services();
  const bridge = parity();
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  game.realmGuard.core.phase = "M5";
  game.realmGuard.core.m5 = Object.freeze({
    getStatus: getM5Status,
    actorSnapshot,
    constants: Object.freeze({ inventoryModes: INVENTORY_MODES, zones: M5_STRUCTURED_ZONES, containerPresets: M5_CONTAINER_PRESETS }),
    gear: Object.freeze({
      list: actor => current.gear.list(actor),
      snapshot: actor => current.gear.snapshot(actor),
      inventoryData: item => current.gear.inventoryData(item),
      state: item => current.gear.state(item),
      slotCost: (item, options) => current.gear.slotCost(item, options),
      effects: item => current.gear.effects(item)
    }),
    inventory: Object.freeze({
      policy: () => current.policy.describe(),
      validateZone: (actor, itemOrId, zoneId) => current.placement.validateZone(actor, itemOrId, zoneId),
      validateContainer: (actor, itemOrId, containerOrId) => current.placement.validateContainer(actor, itemOrId, containerOrId)
    }),
    containers: Object.freeze({
      capacity: item => current.containers.capacity(item),
      isContainer: item => current.containers.isContainer(item),
      isActive: item => current.containers.isActive(item),
      contents: (actor, id) => current.containers.contents(actor, id),
      usage: (actor, item) => current.containers.usage(actor, item)
    }),
    conflictTools: Object.freeze({
      list: (actor, options) => current.conflictTools.list(actor, options),
      resolve: (actor, id, options) => current.conflictTools.resolve(actor, id, options),
      evaluate: (actor, options) => current.conflictTools.evaluate(actor, options),
      disableTargets: (actor, options) => current.conflictTools.disableTargets(actor, options)
    }),
    parity: Object.freeze({
      report: options => bridge.report(options),
      events: options => bridge.events(options),
      clear: () => bridge.clear(),
      probeZone: (actor, itemOrId, zoneId, options) => bridge.probeZone(actor, itemOrId, zoneId, options),
      probeContainer: (actor, itemOrId, containerOrId, options) => bridge.probeContainer(actor, itemOrId, containerOrId, options),
      probeConflict: (actor, options, legacy, meta) => bridge.probeConflict(actor, options, legacy, meta),
      observeConflictState: state => bridge.observeConflictState(state)
    })
  });
}

export function installM5CoreServices() {
  registerGmDockTool({
    id: "m5-core",
    icon: "fa-solid fa-toolbox",
    tooltip: "MG-Family CORE · M5 Gear / Inventory / Conflict Tools",
    order: 13,
    visible: () => Boolean(game.user?.isGM),
    onClick: () => foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard / Torchbearer · CORE M5", resizable: true },
      position: { width: 760, height: 610 },
      content: diagnosticsHtml(),
      modal: false,
      rejectClose: false,
      buttons: [{ action: "close", label: "Close", default: true }]
    })
  });

  Hooks.once("ready", () => {
    runtime = createM5Services(getActiveRulesProfile());
    parityBridge = createM5ParityBridge({ services: runtime });
    parityBridge.install();
    exposeApi();
    console.log("realm-guard | CORE M5 live shadow parity ready", getM5Status());
  });
}
