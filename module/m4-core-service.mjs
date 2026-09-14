import { registerGmDockTool } from "./gm-dock.mjs";
import { getCoreEventBus, CORE_EVENTS } from "./core/domain-events.mjs";
import { AdvancementService, NatureService, ConditionService, CapabilityBlockService, RecoveryService } from "./core/m4-services.mjs";
import { getM4AdvancementBridgeStatus } from "./m4-advancement-shadow-bridge.mjs";
import { getM4NatureParityStatus, getM4NatureParityHistory, getM4NatureParityLatest, getM4NatureParitySummary, clearM4NatureParity } from "./m4-nature-shadow-parity.mjs";
import { getM4ConditionRecoveryParityStatus, getM4ConditionRecoveryParityHistory, getM4ConditionRecoveryParityLatest, getM4ConditionRecoveryParitySummary, clearM4ConditionRecoveryParity } from "./m4-condition-recovery-shadow-parity.mjs";

const eventBus = getCoreEventBus();
const advancement = new AdvancementService({ eventBus }).start();
const nature = new NatureService();
const conditions = new ConditionService();
const capabilityBlocks = new CapabilityBlockService();
const recovery = new RecoveryService(conditions);

function status() {
  return Object.freeze({
    phase: "M4",
    mode: "SHADOW_SERVICES",
    liveApplication: false,
    authority: "LEGACY_MIXED",
    services: Object.freeze([
      "AdvancementService",
      "NatureService",
      "ConditionService",
      "CapabilityBlockService",
      "RecoveryService"
    ]),
    eventBus: Object.freeze({
      events: Object.freeze(Object.values(CORE_EVENTS)),
      listeners: eventBus.listenerCount()
    }),
    testResolvedBridge: getM4AdvancementBridgeStatus(),
    natureParity: getM4NatureParityStatus(),
    conditionRecoveryParity: getM4ConditionRecoveryParityStatus(),
    currentScope: "REAL_CONDITION_CAPABILITY_RECOVERY_SHADOW_PARITY",
    preservation: Object.freeze({
      m2: "SHADOW_COMPARE",
      m3: "SHADOW_PARITY",
      conflict: "LEGACY_ADAPTER_UNTIL_M6",
      gameplayChangeIntended: false
    })
  });
}

function diagnosticsHtml() {
  const s = status();
  const a = advancement.getSummary();
  const n = getM4NatureParitySummary();
  const c = getM4ConditionRecoveryParitySummary();
  return `<div class="realm-guard" style="padding:8px 12px;max-height:60vh;overflow:auto;">
    <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M4</div>
    <h2>Advancement · Nature · Conditions · Recovery</h2>
    <p><b>Mode:</b> ${s.mode} · <b>Live application:</b> OFF · <b>Authority:</b> Legacy Mixed</p>
    <p>M4 qa.6 preserves verified Advancement and Nature shadow behavior, then adds real Legacy Condition, capability-block and Recovery parity. Legacy remains the sole live writer.</p>
    <h3>Advancement shadow</h3>
    <p>${a.observed} observed · ${a.realLegacy} real Legacy · ${a.eligible} eligible · ${a.ignored} ignored · ${a.parityMatches} with M3 MATCH</p>
    <h3>Nature shadow parity</h3>
    <p>${n.observed} observed · ${n.matches} match · ${n.mismatches} mismatch</p>
    <h3>Condition / Recovery shadow parity</h3>
    <p>${c.observed} observed · ${c.matches} match · ${c.mismatches} mismatch</p>
    <p><b>Compared:</b> roll modifiers · capability blocks · recovery validation · recovery methods · recovery outcome · GM Check economy · attempt marking</p>
    <h3>Console QA</h3>
    <code>game.realmGuard.core.m4.getStatus()</code><br>
    <code>game.realmGuard.core.m4.conditionRecoveryParity.getLatest()</code><br>
    <code>game.realmGuard.core.m4.conditionRecoveryParity.getSummary()</code><br>
    <code>game.realmGuard.core.m4.conditionRecoveryParity.clear()</code>
  </div>`;
}

export function emitM4TestResolved(payload = {}) {
  return eventBus.emit(CORE_EVENTS.TEST_RESOLVED, payload, { source: "M4_SHADOW_BRIDGE" });
}

function exposeApi() {
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  game.realmGuard.core.phase = "M4";
  game.realmGuard.core.m4 = Object.freeze({
    getStatus: status,
    events: Object.freeze({
      types: CORE_EVENTS,
      listenerCount: type => eventBus.listenerCount(type),
      emitTestResolved: emitM4TestResolved
    }),
    advancement: Object.freeze({
      evaluate: payload => advancement.evaluate(payload),
      getHistory: () => advancement.getHistory(),
      getLatest: () => advancement.getLatest(),
      getSummary: () => advancement.getSummary(),
      clear: () => advancement.clear()
    }),
    nature: Object.freeze({
      state: actor => nature.state(actor),
      taxForResult: (result, options) => nature.taxForResult(result, options),
      previewTax: (actor, amount) => nature.previewTax(actor, amount)
    }),
    natureParity: Object.freeze({
      getStatus: getM4NatureParityStatus,
      getHistory: getM4NatureParityHistory,
      getLatest: getM4NatureParityLatest,
      getSummary: getM4NatureParitySummary,
      clear: clearM4NatureParity
    }),
    conditionRecoveryParity: Object.freeze({
      getStatus: getM4ConditionRecoveryParityStatus,
      getHistory: getM4ConditionRecoveryParityHistory,
      getLatest: getM4ConditionRecoveryParityLatest,
      getSummary: getM4ConditionRecoveryParitySummary,
      clear: clearM4ConditionRecoveryParity
    }),
    conditions: Object.freeze({
      list: actor => conditions.list(actor),
      collectRollEffects: (actor, rollName, options) => conditions.collectRollEffects(actor, rollName, options),
      recoveryContext: (actor, conditionId) => conditions.recoveryContext(actor, conditionId)
    }),
    capabilityBlocks: Object.freeze({
      collect: actor => capabilityBlocks.collect(actor),
      isBlocked: (actor, capability) => capabilityBlocks.isBlocked(actor, capability)
    }),
    recovery: Object.freeze({
      context: (actor, conditionId) => recovery.context(actor, conditionId),
      blocker: (actor, conditionId) => recovery.blocker(actor, conditionId),
      methods: (actor, conditionId) => recovery.methods(actor, conditionId),
      validate: (actor, conditionId, options) => recovery.validate(actor, conditionId, options),
      economy: (actor, options) => recovery.economy(actor, options),
      resolution: (actor, conditionId, options) => recovery.resolution(actor, conditionId, options)
    })
  });
}

export function installM4CoreServices() {
  registerGmDockTool({
    id: "m4-core",
    icon: "fa-solid fa-seedling",
    tooltip: "MG-Family CORE · M4 Services",
    order: 12,
    visible: () => Boolean(game.user?.isGM),
    onClick: () => foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard / Torchbearer · CORE M4", resizable: true },
      position: { width: 720, height: 560 },
      content: diagnosticsHtml(),
      modal: false,
      rejectClose: false,
      buttons: [{ action: "close", label: "Close", default: true }]
    })
  });
  Hooks.once("ready", () => {
    exposeApi();
    console.log("realm-guard | CORE M4 service layer ready", status());
  });
}
