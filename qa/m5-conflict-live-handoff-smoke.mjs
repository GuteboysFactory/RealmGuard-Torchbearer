import assert from "node:assert/strict";
import fs from "node:fs";
import { compareM5ConflictEvaluation } from "../module/m5-conflict-live-handoff.mjs";

assert.equal(compareM5ConflictEvaluation({ legacy: { dice: 2, conditionalSuccess: 0, successPenalty: 0 }, core: { dice: 2, conditionalSuccess: 0, successPenalty: 0, tool: { id: "gear:bow" } }, toolId: "gear:bow" }).match, true);
assert.equal(compareM5ConflictEvaluation({ legacy: { dice: 1 }, core: { dice: 2, tool: { id: "gear:bow" } }, toolId: "gear:bow" }).match, false);
assert.equal(compareM5ConflictEvaluation({ legacy: { dice: -1 }, core: { dice: -1, tool: null }, toolId: "" }).match, true);
const conflicts = fs.readFileSync("module/conflicts.mjs", "utf8");
assert.ok(conflicts.includes("evaluateM5ConflictToolLiveHandoff"));
assert.ok(conflicts.includes("gear: liveGear"));
const service = fs.readFileSync("module/m5-core-service.mjs", "utf8");
assert.ok(service.includes("handoffStatus: getM5ConflictLiveHandoffStatus"));
assert.ok(service.includes("enableCoreEvaluation"));
console.log("PASS m5-conflict-live-handoff-smoke");
