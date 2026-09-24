import { registerGmDockTool } from "./gm-dock.mjs";
import { getActiveRulesProfile } from "./rules-profile-service.mjs";
import { createM5Services, INVENTORY_MODES, M5_STRUCTURED_ZONES, M5_CONTAINER_PRESETS } from "./core/m5-services.mjs";
import { getM5InventoryLiveHandoffStatus, getM5InventoryHandoffHistory, resetM5InventoryHandoffTelemetry, setM5InventoryCoreValidationEnabled } from "./inventory.mjs";
import { createM5ParityBridge } from "./m5-parity-bridge.mjs";
import { getM5ConflictLiveHandoffStatus, getM5ConflictHandoffHistory, resetM5ConflictHandoffTelemetry, setM5ConflictCoreEvaluationEnabled } from "./m5-conflict-live-handoff.mjs";
import { inspectConflictActorResolution } from "./conflict-actor-resolver.mjs";
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
  const inventoryHandoff = getM5InventoryLiveHandoffStatus();
  const conflictHandoff = getM5ConflictLiveHandoffStatus();
  const parityReport = parityBridge?.report?.() ?? Object.freeze({ phase: "M5", mode: "SHADOW_PARITY", authority: "LEGACY_MIXED", liveApplication: false, summary: Object.freeze({ total: 0, matches: 0, mismatches: 0, coreOnly: 0 }), events: Object.freeze([]) });
  const paritySummary = parityReport.summary;
  const readiness = evaluateM5PromotionReadiness(parityReport);
  return Object.freeze({
    phase: "M5",
    buildScope: "CONTROLLED_INVENTORY_AND_CONFLICT_EVALUATION_HANDOFF",
    mode: "PARTIAL_LIVE_HANDOFF",
    liveApplication: inventoryHandoff.enabled || conflictHandoff.enabled,
    authority: Object.freeze({
      inventoryValidation: inventoryHandoff.validationAuthority,
      inventoryWriter: inventoryHandoff.writerAuthority,
      conflictEvaluation: conflictHandoff.evaluationAuthority,
      conflictState: conflictHandoff.conflictStateAuthority
    }),
    activeProfile: profile?.id ?? "realm-guard-legacy-mixed",
    inventoryPolicy: current.policy.mode,
    inventoryHandoff,
    conflictHandoff,
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
      conflictEvaluationLiveTakeover: conflictHandoff.enabled,
      conflictStateLiveTakeover: false,
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
  const h = s.inventoryHandoff;
  const coverageRows = Object.values(r.coverage).map(row => `<li>${row.observed ? "✅" : "⬜"} ${row.label}${row.mismatches ? ` · ${row.mismatches} mismatch` : ""}</li>`).join("");
  return `<div class="realm-guard" style="padding:8px 12px;max-height:64vh;overflow:auto;">
    <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M5</div>
    <h2>Gear · Inventory · Conflict Tools</h2>
    <p><b>Mode:</b> ${s.mode}</p>
    <p><b>Inventory validation:</b> ${h.validationAuthority} · <b>Inventory writes:</b> ${h.writerAuthority} · <b>Conflict:</b> Legacy Mixed</p>
    <p>qa.20 promotes only Inventory placement validation. The existing writer remains intact. Any CORE error or validation disagreement automatically falls back to Legacy Mixed for the session.</p>
    <h3>Inventory handoff telemetry</h3>
    <p><b>${h.telemetry.coreDecisions}</b> CORE decisions · <b>${h.telemetry.coreAccepted}</b> accepted · <b>${h.telemetry.coreRejected}</b> rejected · <b>${h.telemetry.disagreements}</b> disagreements · <b>${h.telemetry.errorFallbacks}</b> error fallbacks</p>
    <p><b>Rollback:</b> ${h.enabled ? "OFF" : `ON · ${h.rollbackReason || "manual"}`}</p>
    <h3>Live shadow parity</h3>
    <p><b>${p.total}</b> observations · <b>${p.matches}</b> MATCH · <b>${p.mismatches}</b> MISMATCH · <b>${p.coreOnly}</b> CORE-only probes</p>
    <h3>Promotion readiness</h3>
    <p><b>${r.status}</b></p><ul>${coverageRows}</ul>
    <h3>Console QA</h3>
    <code>game.realmGuard.core.m5.getStatus()</code><br>
    <code>game.realmGuard.core.m5.inventory.handoffStatus()</code><br>
    <code>game.realmGuard.core.m5.inventory.handoffHistory()</code><br>
    <code>game.realmGuard.core.m5.inventory.rollback()</code><br>
    <code>game.realmGuard.core.m5.inventory.enableCoreValidation()</code><br>
    <code>game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })</code>
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
      validateContainer: (actor, itemOrId, containerOrId) => current.placement.validateContainer(actor, itemOrId, containerOrId),
      handoffStatus: getM5InventoryLiveHandoffStatus,
      handoffHistory: getM5InventoryHandoffHistory,
      resetHandoffTelemetry: resetM5InventoryHandoffTelemetry,
      rollback: reason => setM5InventoryCoreValidationEnabled(false, { reason: reason || "MANUAL_QA_ROLLBACK" }),
      enableCoreValidation: () => setM5InventoryCoreValidationEnabled(true, { reason: "MANUAL_QA_ENABLE" })
    }),
    containers: Object.freeze({
      capacity: item => current.containers.capacity(item),
      isContainer: item => current.containers.isContainer(item),
      isActive: item => current.containers.isActive(item),
      contents: (actor, id) => current.containers.contents(actor, id),
      usage: (actor, item) => current.containers.usage(actor, item)
    }),
    conflictTools: Object.freeze({
      inspectActorResolution: actorId => inspectConflictActorResolution(actorId),
      list: (actor, options) => current.conflictTools.list(actor, options),
      resolve: (actor, id, options) => current.conflictTools.resolve(actor, id, options),
      evaluate: (actor, options) => current.conflictTools.evaluate(actor, options),
      disableTargets: (actor, options) => current.conflictTools.disableTargets(actor, options),
      handoffStatus: getM5ConflictLiveHandoffStatus,
      handoffHistory: getM5ConflictHandoffHistory,
      resetHandoffTelemetry: resetM5ConflictHandoffTelemetry,
      rollback: reason => setM5ConflictCoreEvaluationEnabled(false, { reason: reason || "MANUAL_QA_ROLLBACK" }),
      enableCoreEvaluation: () => setM5ConflictCoreEvaluationEnabled(true, { reason: "MANUAL_QA_ENABLE" })
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

  Hooks.on("realmGuardRulesProfileChanged", () => {
    runtime = null;
    parityBridge = null;
    try { exposeApi(); } catch (_error) {}
  });

  Hooks.once("ready", () => {
    runtime = createM5Services(getActiveRulesProfile());
    parityBridge = createM5ParityBridge({ services: runtime });
    parityBridge.install();
    exposeApi();
    console.log("realm-guard | CORE M5 controlled Inventory + Conflict Tool evaluation handoff ready", getM5Status());
  });
}