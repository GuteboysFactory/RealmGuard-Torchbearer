import { registerGmDockTool } from "./gm-dock.mjs";
import { getActiveRulesProfile } from "./rules-profile-service.mjs";
import { createM5Services, INVENTORY_MODES, M5_STRUCTURED_ZONES, M5_CONTAINER_PRESETS } from "./core/m5-services.mjs";
import { createM5ParityBridge } from "./m5-parity-bridge.mjs";
import { evaluateM5PromotionReadiness, M5_PROMOTION_REQUIREMENTS } from "./m5-promotion-readiness.mjs";
import "./m5-parity-deepening.mjs";

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
  const parityReport = parityBridge?.report?.() ?? Object.freeze({ phase: "M5", mode: "SHADOW_PARITY", authority: "LEGACY_MIXED", liveApplication: false, summary: Object.freeze({ total: 0, matches: 0, mismatches: 0, coreOnly: 0 }), events: Object.freeze([]) });
  const paritySummary = parityReport.summary;
  const readiness = evaluateM5PromotionReadiness(parityReport);
  return Object.freeze({
    phase: "M5",
    buildScope: "LIVE_SHADOW_PARITY_PROMOTION_READINESS",
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
      "M5ParityBridge",
      "M5PromotionReadiness"
    ]),
    parity: Object.freeze({
      inventoryLiveObservation: true,
      inventoryRejectedObservation: true,
      conflictToolLiveObservation: true,
      conflictDeclarationObservation: true,
      conflictDisableObservation: true,
      mismatchBlocksLegacy: false,
      report: paritySummary
    }),
    readiness,
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
  const r = s.readiness;
  const coverageRows = Object.values(r.coverage).map(row => `<li>${row.observed ? "✅" : "⬜"} ${row.label}${row.mismatches ? ` · ${row.mismatches} mismatch` : ""}</li>`).join("");
  return `<div class="realm-guard" style="padding:8px 12px;max-height:64vh;overflow:auto;">
    <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M5</div>
    <h2>Gear · Inventory · Conflict Tools</h2>
    <p><b>Mode:</b> ${s.mode} · <b>Live application:</b> OFF · <b>Authority:</b> Legacy Mixed</p>
    <p>Live Inventory and Conflict Tool flows are observed against CORE. qa.15 adds a promotion-readiness gate only; it does not perform any live takeover.</p>
    <h3>Live shadow parity</h3>
    <p><b>${p.total}</b> observations · <b>${p.matches}</b> MATCH · <b>${p.mismatches}</b> MISMATCH · <b>${p.coreOnly}</b> CORE-only probes</p>
    <h3>Promotion readiness</h3>
    <p><b>${r.status}</b></p><ul>${coverageRows}</ul>
    <p>${r.nextStep}</p>
    <h3>Services</h3>
    <p>${s.services.join(" · ")}</p>
    <h3>Console QA</h3>
    <code>game.realmGuard.core.m5.getStatus()</code><br>
    <code>game.realmGuard.core.m5.parity.report()</code><br>
    <code>game.realmGuard.core.m5.readiness()</code><br>
    <code>game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })</code><br>
    <code>game.realmGuard.core.m5.parity.clear()</code>
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
    readiness: () => evaluateM5PromotionReadiness(bridge.report()),
    promotionRequirements: M5_PROMOTION_REQUIREMENTS,
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
      observeInventoryDecision: decision => bridge.observeLegacyInventoryDecision(decision),
      observeConflictState: state => bridge.observeConflictState(state),
      observeConflictProviders: state => bridge.observeConflictProviderState(state)
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
    console.log("realm-guard | CORE M5 promotion readiness ready", getM5Status());
  });
}