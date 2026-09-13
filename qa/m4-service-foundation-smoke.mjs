import assert from "node:assert/strict";
import { CoreEventBus, CORE_EVENTS } from "../module/core/domain-events.mjs";
import { AdvancementService, NatureService } from "../module/core/m4-services.mjs";

const bus = new CoreEventBus();
const advancement = new AdvancementService({ eventBus: bus }).start();
assert.equal(bus.listenerCount(CORE_EVENTS.TEST_RESOLVED), 1);

bus.emit(CORE_EVENTS.TEST_RESOLVED, {
  context: "ordinary",
  sourceKind: "role",
  sourceId: "skill-1",
  sourceName: "Fighter",
  outcome: "PASS",
  countLearning: true
});
let latest = advancement.getLatest();
assert.equal(latest.mode, "SKILL_PASS_FAIL");
assert.equal(latest.eligible, true);
assert.equal(latest.passed, true);
assert.equal(latest.liveApplication, false);

bus.emit(CORE_EVENTS.TEST_RESOLVED, {
  context: "versus",
  sourceKind: "role",
  sourceId: "skill-1",
  sourceName: "Fighter",
  outcome: "TIE",
  countLearning: true
});
latest = advancement.getLatest();
assert.equal(latest.eligible, false);
assert.equal(latest.reason, "TIE_DOES_NOT_ADVANCE");

bus.emit(CORE_EVENTS.TEST_RESOLVED, {
  context: "beginnerLuck",
  sourceKind: "role",
  sourceName: "QA Custom Skill",
  outcome: "FAIL",
  countLearning: true
});
latest = advancement.getLatest();
assert.equal(latest.mode, "BEGINNER_ATTEMPT");
assert.equal(latest.eligible, true);

const nature = new NatureService();
const actor = { system: { attributes: { nature: { value: 3, maximum: 5 } } }, getFlag: () => ["Travel", "Endure"] };
assert.deepEqual(nature.state(actor), { current: 3, maximum: 5, tax: 2, descriptors: ["Travel", "Endure"] });
assert.equal(nature.taxForResult({ outcome: "PASS", passed: true, margin: 1 }, { tapped: true, scope: "within" }), 0);
assert.equal(nature.taxForResult({ outcome: "PASS", passed: true, margin: 1 }, { tapped: true, scope: "against" }), 1);
assert.equal(nature.taxForResult({ outcome: "FAIL", passed: false, margin: 2 }, { direct: true, scope: "against" }), 2);
const preview = nature.previewTax(actor, 3);
assert.equal(preview.current, 4);
assert.equal(preview.maximum, 4);
assert.equal(preview.collapsed, true);
assert.equal(preview.liveApplication, false);

console.log("M4 service foundation smoke PASS · event bus · shadow advancement recommendations · Nature state/tax preview");
