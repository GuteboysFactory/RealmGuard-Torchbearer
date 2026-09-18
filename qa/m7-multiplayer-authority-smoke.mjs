import assert from "node:assert/strict";
import fs from "node:fs";
import { primaryActiveGm, turnAuthorityStatus } from "../module/turn-authority-bridge.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const bridge = fs.readFileSync("module/turn-authority-bridge.mjs", "utf8");
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");

assert.equal(manifest.version, "1.9.0-qa.4");

const users = [
  { id: "P1", name: "Player", active: true, isGM: false },
  { id: "G2", name: "GM Two", active: true, isGM: true },
  { id: "G1", name: "GM One", active: true, isGM: true },
  { id: "G0", name: "Offline GM", active: false, isGM: true }
];
assert.equal(primaryActiveGm({ users }).id, "G1", "Primary GM selection must be deterministic");

const playerStatus = turnAuthorityStatus({ users, user: users[0] });
assert.equal(playerStatus.mode, "GM_PROXY_COMMIT");
assert.equal(playerStatus.primaryGmId, "G1");
assert.equal(playerStatus.available, true);
assert.equal(playerStatus.liveRulesAuthority, "LEGACY_MIXED");
assert.equal(playerStatus.coreLiveApplication, false);

const gmStatus = turnAuthorityStatus({ users, user: users[2] });
assert.equal(gmStatus.mode, "LOCAL_GM_COMMIT");

assert.ok(bridge.includes("gmQueue = gmQueue"), "Player requests must be serialized on the active GM");
assert.ok(bridge.includes('type: "REQUEST"'));
assert.ok(bridge.includes('type: "RESPONSE"'));
assert.ok(bridge.includes("Timed out waiting for the GM"));
assert.ok(bridge.includes('Hooks?.once?.("ready", attach)'), "Socket listener must reattach on reload/reconnect startup");

for (const op of ["CLAIM_TEST", "DONATE_CHECK", "FINISH_PLAYER", "MARK_RECOVERY"]) {
  assert.ok(turns.includes(op), `Missing GM authority operation: ${op}`);
}
assert.ok(turns.includes("staleTurnAuthorityRequest"));
assert.ok(turns.includes("Turn state changed before this action reached the GM"));
assert.ok(turns.includes("Turn phase changed before this action reached the GM"));
assert.ok(turns.includes("requesterCanControlActor"));

assert.ok(shadow.includes('buildScope: "MULTIPLAYER_STATE_AUTHORITY_HARDENING"'));
assert.ok(shadow.includes("authorityStatus"));
assert.ok(shadow.includes("stateFingerprint"));
assert.ok(shadow.includes("multiplayerState"));
assert.ok(shadow.includes('mode: "SHADOW_READ_ONLY"'));
assert.ok(shadow.includes('authority: "LEGACY_MIXED"'));
assert.ok(shadow.includes("liveApplication: false"));

console.log("PASS m7-multiplayer-authority-smoke");
