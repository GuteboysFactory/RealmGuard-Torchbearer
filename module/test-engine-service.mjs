import { registerGmDockTool } from "./gm-dock.mjs";
import {
  TestEngine,
  RollTransaction,
  createTestContext,
  createTestRequest,
  createRollPlan,
  createTestResult,
  TEST_CONTEXTS,
  TEST_TRANSACTION_STATES
} from "./core/test-engine.mjs";

const engine = new TestEngine();

export function getTestEngine() {
  return engine;
}

export function getTestEngineStatus() {
  return Object.freeze({
    phase: "M3",
    mode: "SHADOW_PARITY",
    liveApplication: false,
    supportedContexts: Object.freeze([...TEST_CONTEXTS]),
    transactionStates: Object.freeze([...Object.values(TEST_TRANSACTION_STATES)]),
    parityBridge: "LEGACY_MIXED_REAL_ROLLS",
    conflictIntegration: "LEGACY_ADAPTER_UNTIL_M6"
  });
}

export function runTestEngineDiagnostic({
  context = "ordinary",
  basePool = 4,
  obstacle = 2,
  oppositionSuccesses = 0,
  extraDice = 0,
  diceModifier = 0,
  successModifier = 0,
  faces = [4, 4, 1, 2]
} = {}) {
  const prepared = engine.runDeterministic({
    id: `m3-diagnostic-${Date.now()}`,
    context: { type: context, sourceName: "M3 Diagnostic" },
    basePool,
    obstacle,
    oppositionSuccesses,
    extraDice,
    successModifier,
    provenance: { diagnostic: true }
  }, {
    diceModifier,
    provenance: { diagnostic: true }
  }, faces);
  return Object.freeze({
    request: prepared.request,
    plan: prepared.plan,
    result: prepared.result,
    transaction: prepared.transaction.snapshot()
  });
}

function diagnosticsHtml() {
  const status = getTestEngineStatus();
  const parity = game.realmGuard?.core?.testParity?.getSummary?.() ?? null;
  const latest = parity?.latest ?? null;
  const parityText = parity
    ? `${parity.compared} compared · ${parity.matches} match · ${parity.mismatches} mismatch · ${parity.skipped} skipped${parity.errors ? ` · ${parity.errors} observer error` : ""}`
    : "Parity observer initializes at world ready.";
  const latestText = latest
    ? `${latest.status}${latest.method ? ` · ${latest.method}` : ""}${latest.reason ? ` · ${latest.reason}` : ""}`
    : "No real Legacy Mixed roll observed yet.";

  return `<div class="realm-guard" style="box-sizing:border-box;padding:6px 12px 12px;max-height:58vh;overflow:auto;">
    <header style="margin-bottom:14px;">
      <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M3</div>
      <h2 style="margin:3px 0 4px;">Unified Test Engine</h2>
      <div><b>Mode:</b> ${status.mode} · <b>Live application:</b> OFF</div>
    </header>
    <section style="margin-bottom:12px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Foundation</h3>
      <div>TestRequest · RollPlan · RollTransaction · TestResult · TestContext · TestEngine</div>
      <div style="margin-top:6px;"><b>Contexts:</b> ${status.supportedContexts.join(", ")}</div>
      <div style="margin-top:6px;"><b>Transaction:</b> ${status.transactionStates.join(" → ")}</div>
    </section>
    <section style="margin-bottom:12px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Real Legacy Mixed ↔ CORE shadow parity</h3>
      <p style="margin:0 0 6px;">Observed live Legacy Mixed test data is replayed deterministically through CORE and compared for <b>pool, target, successes, outcome and margin</b>.</p>
      <div><b>Summary:</b> ${parityText}</div>
      <div style="margin-top:4px;"><b>Latest:</b> ${latestText}</div>
      <div style="margin-top:8px;"><code>game.realmGuard.core.testParity.getLatest()</code></div>
      <div><code>game.realmGuard.core.testParity.getSummary()</code></div>
      <div><code>game.realmGuard.core.testParity.clear()</code></div>
    </section>
    <section style="margin-bottom:12px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Deterministic foundation smoke</h3>
      <code>game.realmGuard.core.tests.runDiagnostic()</code>
      <p style="margin:8px 0 0;">Expected default: 4D, faces [4,4,1,2], 2 successes vs Ob 2, PASS. No Actor or world state changes.</p>
    </section>
    <div style="padding:8px 10px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);">
      <b>No Test Engine gameplay takeover in M3 qa.2.</b><br>
      <small>Legacy Mixed still rolls, resolves, spends resources and writes chat. CORE only observes/replays supported results for parity diagnostics. Fate Open-6 additive dice and resolved secondary Versus tiebreaks are deliberately skipped in this first real-roll parity slice.</small>
    </div>
  </div>`;
}

export async function openTestEngineDiagnostics() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Test Engine diagnostics are GM-only.");
  return foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard / Torchbearer · CORE M3 Test Engine", resizable: true },
    position: { width: 720, height: 600 },
    content: diagnosticsHtml(),
    modal: false,
    rejectClose: false,
    buttons: [{ action: "close", label: "Close", default: true }]
  });
}

function exposeTestApi() {
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  game.realmGuard.core.phase = "M3";
  game.realmGuard.core.tests = Object.freeze({
    engine,
    getStatus: getTestEngineStatus,
    runDiagnostic: runTestEngineDiagnostic,
    createTestContext,
    createTestRequest,
    createRollPlan,
    createTestResult,
    RollTransaction,
    contexts: TEST_CONTEXTS,
    states: TEST_TRANSACTION_STATES
  });
}

export function installTestEngineInfrastructure() {
  registerGmDockTool({
    id: "test-engine",
    icon: "fa-solid fa-dice-d6",
    tooltip: "MG-Family CORE · M3 Test Engine",
    order: 11,
    visible: () => Boolean(game.user?.isGM),
    onClick: () => openTestEngineDiagnostics()
  });

  Hooks.once("ready", () => {
    exposeTestApi();
    console.log("realm-guard | CORE M3 Test Engine ready", getTestEngineStatus());
  });
}
