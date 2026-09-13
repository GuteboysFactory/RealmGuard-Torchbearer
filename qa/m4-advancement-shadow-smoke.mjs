import assert from "node:assert/strict";
import { AdvancementService } from "../module/core/m4-services.mjs";
import { CoreEventBus, CORE_EVENTS } from "../module/core/domain-events.mjs";

const bus = new CoreEventBus();
const service = new AdvancementService({ eventBus: bus }).start();

const emit = payload => bus.emit(CORE_EVENTS.TEST_RESOLVED, payload, { source: "QA_SMOKE" });

emit({
  context: "ordinary",
  sourceKind: "role",
  sourceId: "skill-1",
  sourceName: "QA Bog Lore",
  outcome: "PASS",
  learningOutcome: "PASS",
  countLearning: true,
  countLearningSource: "LEGACY_ROLL_DIALOG",
  realLegacyRoll: true,
  parityStatus: "MATCH"
});
let latest = service.getLatest();
assert.equal(latest.mode, "SKILL_PASS_FAIL");
assert.equal(latest.eligible, true);
assert.equal(latest.passed, true);
assert.equal(latest.realLegacyRoll, true);
assert.equal(latest.parityStatus, "MATCH");

emit({
  context: "ability",
  sourceKind: "ability",
  sourceId: "will",
  sourceName: "Will",
  outcome: "FAIL",
  learningOutcome: "FAIL",
  countLearning: true,
  realLegacyRoll: true
});
latest = service.getLatest();
assert.equal(latest.mode, "ABILITY_PASS_FAIL");
assert.equal(latest.failed, true);

emit({
  context: "beginnerLuck",
  sourceKind: "role",
  sourceName: "QA New Skill",
  outcome: "FAIL",
  learningOutcome: "FAIL",
  countLearning: true,
  realLegacyRoll: true
});
latest = service.getLatest();
assert.equal(latest.mode, "BEGINNER_ATTEMPT");
assert.equal(latest.eligible, true);

emit({
  context: "versus",
  sourceKind: "role",
  sourceName: "Fighter",
  outcome: "TIE",
  learningOutcome: null,
  countLearning: true,
  realLegacyRoll: true
});
latest = service.getLatest();
assert.equal(latest.mode, "NONE");
assert.equal(latest.eligible, false);
assert.equal(latest.reason, "TIE_DOES_NOT_ADVANCE");

emit({
  context: "versus",
  sourceKind: "role",
  sourceName: "Fighter",
  outcome: "PASS",
  learningOutcome: null,
  countLearning: true,
  realLegacyRoll: true
});
latest = service.getLatest();
assert.equal(latest.mode, "NONE");
assert.equal(latest.eligible, false);
assert.equal(latest.reason, "LEGACY_LEARNING_RESULT_NONE");

emit({
  context: "ordinary",
  sourceKind: "role",
  sourceName: "Scout",
  outcome: "PASS",
  learningOutcome: "PASS",
  countLearning: false,
  realLegacyRoll: true
});
latest = service.getLatest();
assert.equal(latest.mode, "NONE");
assert.equal(latest.reason, "LEARNING_DISABLED");

const summary = service.getSummary();
assert.equal(summary.observed, 6);
assert.equal(summary.realLegacy, 6);
assert.equal(summary.eligible, 3);
assert.equal(summary.ignored, 3);
assert.equal(summary.parityMatches, 1);

console.log("M4 advancement shadow smoke PASS", summary);
