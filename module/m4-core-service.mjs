import { registerGmDockTool } from "./gm-dock.mjs";
import { getCoreEventBus, CORE_EVENTS } from "./core/domain-events.mjs";
import { AdvancementService, NatureService, ConditionService, CapabilityBlockService, RecoveryService } from "./core/m4-services.mjs";
import { getM4AdvancementBridgeStatus } from "./m4-advancement-shadow-bridge.mjs";

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
    currentScope: "REAL_TEST_RESOLVED_ADVANCEMENT_SHADOW",
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
  return `<div class="realm-guard" style="padding:8px 12px;max-height:60vh;overflow:auto;">
    <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M4</div>
    <h2>Advancement · Nature · Conditions</h2>
    <p><b>Mode:</b> ${s.mode} · <b>Live application:</b> OFF · <b>Authority:</b> Legacy Mixed</p>
    <p>M4 qa.2 observes completed real Legacy Mixed tests and emits observer-only <b>TEST_RESOLVED</b> events into AdvancementService. Legacy still writes all real Learning and Advancement state.</p>
    <h3>Real-test bridge</h3>
    <p><b>Mode:</b> ${s.testResolvedBridge.mode}<br><b>Roll wrapper:</b> ${s.testResolvedBridge.rollBridgeInstalled ? "ready" : "waiting for ready"}<br><b>Learning checkbox capture:</b> ${s.testResolvedBridge.learningDecisionCapture}</p>
    <h3>Advancement shadow</h3>
    <p>${a.observed} observed · ${a.realLegacy} real Legacy · ${a.eligible} eligible · ${a.ignored} ignored · ${a.parityMatches} with M3 MATCH</p>
    <h3>Services</h3><p>${s.services.join(" · ")}</p>
    <h3>Console QA</h3>
    <code>game.realmGuard.core.m4.getStatus()</code><br>
    <code>game.realmGuard.core.m4.advancement.getLatest()</code><br>
    <code>game.realmGuard.core.m4.advancement.getSummary()</code><br>
    <code>game.realmGuard.core.m4.advancement.clear()</code>
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
    conditions: Object.freeze({
      list: actor => conditions.list(actor),
      collectRollEffects: (actor, rollName, options) => conditions.collectRollEffects(actor, rollName, options),
      recoveryContext: (actor, conditionId) => conditions.recoveryContext(actor, conditionId)
    }),
    capabilityBlocks: Object.freeze({ collect: actor => capabilityBlocks.collect(actor) }),
    recovery: Object.freeze({ context: (actor, conditionId) => recovery.context(actor, conditionId) })
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
