import fs from "node:fs";

function must(condition, message) {
  if (!condition) throw new Error(message);
}

const core = fs.readFileSync("module/core/m7-session-services.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const entry = fs.readFileSync("realm-guard.mjs", "utf8");
const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));

for (const symbol of [
  "class SessionState",
  "class PhaseDefinition",
  "class SessionEngine",
  "class ActionCurrencyService",
  "class PhaseAllowanceService",
  "class RewardEngine",
  "class RewardAuthority"
]) must(core.includes(symbol), `Missing M7 CORE symbol: ${symbol}`);

must(core.includes("legacySessionSnapshot"), "Missing Legacy Mixed session snapshot adapter");
must(core.includes('source: "free-play"'), "Missing Free Play preview path");
must(core.includes('source: "npc"'), "Missing NPC untracked preview path");
must(core.includes('reason: "alternation"'), "Missing no-two-tests-in-a-row preview guard");
must(core.includes("persona: Math.min(4, personaRaw)"), "Missing Persona cap parity");
must(core.includes("goalFateSuppressed"), "Missing Goal Fate suppression parity");

must(shadow.includes('mode: "SHADOW_READ_ONLY"'), "M7 must remain shadow/read-only in qa.1");
must(shadow.includes('authority: "LEGACY_MIXED"'), "Legacy Mixed must remain live authority in qa.1");
must(shadow.includes("liveApplication: false"), "M7 qa.1 must not apply CORE live");
must(shadow.includes("game.realmGuard.core.m7"), "Missing M7 diagnostics API");

must(entry.includes('installM7SessionShadow'), "M7 shadow installer not wired");
must(entry.includes('installM7SessionShadow();'), "M7 shadow installer not invoked");
must(manifest.id === "realm-guard", "System id changed unexpectedly");
must(manifest.version === "1.9.0-qa.1", `Unexpected manifest version: ${manifest.version}`);

console.log("PASS m7-session-foundation-smoke");
