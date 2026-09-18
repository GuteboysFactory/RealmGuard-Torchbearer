import assert from "node:assert/strict";
import fs from "node:fs";
import { SESSION_LIFECYCLE_EVENTS, SessionLifecycleService } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const core = fs.readFileSync("module/core/m7-session-services.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const endSession = fs.readFileSync("module/end-session.mjs", "utf8");

assert.equal(manifest.version, "1.9.0-qa.5");
assert.deepEqual(SESSION_LIFECYCLE_EVENTS, [
  "SESSION_STARTING",
  "SESSION_STARTED",
  "PHASE_CHANGED",
  "SESSION_ENDING",
  "SESSION_ENDED"
]);

const lifecycle = new SessionLifecycleService();
for (const type of SESSION_LIFECYCLE_EVENTS) {
  const event = lifecycle.create(type, { source: "SMOKE", cycle: 2 });
  assert.equal(event.type, type);
  assert.equal(event.source, "SMOKE");
  assert.equal(event.cycle, 2);
  assert.equal(Object.isFrozen(event), true);
}
assert.throws(() => lifecycle.create("UNKNOWN_EVENT"), /Unknown Session lifecycle event/);

assert.ok(core.includes("class SessionLifecycleService"));
assert.ok(core.includes("SESSION_LIFECYCLE_EVENTS"));
assert.ok(shadow.includes('buildScope: "SESSION_LIFECYCLE_SHADOW"'));
assert.ok(shadow.includes("observeM7Lifecycle"));
assert.ok(shadow.includes("lifecycleSummary"));
assert.ok(shadow.includes('domain: "SESSION_LIFECYCLE"'));
assert.ok(shadow.includes('mode: "SHADOW_READ_ONLY"'));
assert.ok(shadow.includes('authority: "LEGACY_MIXED"'));
assert.ok(shadow.includes("liveApplication: false"));

assert.ok(turns.includes('observeM7Lifecycle("PHASE_CHANGED"'));
assert.ok(turns.includes('source: "LEGACY_TURN_MANAGER"'));
assert.ok(endSession.includes('observeM7Lifecycle("SESSION_ENDING"'));
assert.ok(endSession.includes('observeM7Lifecycle("SESSION_ENDED"'));
assert.ok(endSession.includes('observeM7Lifecycle("SESSION_STARTING"'));
assert.ok(endSession.includes('observeM7Lifecycle("SESSION_STARTED"'));
assert.ok(endSession.includes('source: "LEGACY_END_SESSION"'));

console.log("PASS m7-session-lifecycle-smoke");
