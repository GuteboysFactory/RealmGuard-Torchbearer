import assert from "node:assert/strict";
import { natureExpectation, compareNatureObservation } from "../module/m4-nature-shadow-parity.mjs";

const pass = { passed: true, tied: false, outcome: "PASS", margin: 1 };
const fail2 = { passed: false, tied: false, outcome: "FAIL", margin: 2 };
const tie = { passed: false, tied: true, outcome: "TIE", margin: 0 };

assert.equal(natureExpectation("rollRole", [{}, { tapNature: true, natureScope: "within" }], pass).expectedTax, 0);
assert.equal(natureExpectation("rollRole", [{}, { tapNature: true, natureScope: "against" }], pass).expectedTax, 1);
assert.equal(natureExpectation("rollRole", [{}, { tapNature: true, natureScope: "within" }], fail2).expectedTax, 2);
assert.equal(natureExpectation("rollRole", [{}, { tapNature: true, natureScope: "against" }], tie).expectedTax, 0);
assert.equal(natureExpectation("rollRole", [{}, { tapNature: false }], pass).observe, false);

assert.equal(natureExpectation("rollAbility", ["nature", { natureUse: "within" }], fail2).expectedTax, 0);
assert.equal(natureExpectation("rollAbility", ["nature", { natureUse: "against" }], pass).expectedTax, 0);
assert.equal(natureExpectation("rollAbility", ["nature", { natureUse: "against" }], fail2).expectedTax, 2);
assert.equal(natureExpectation("rollNatureVersus", [{}, { natureUse: "against", doubleTapNature: true }], fail2).expectedTax, 2);

let comparison = compareNatureObservation({ before: { current: 4, maximum: 5 }, after: { current: 3, maximum: 5 }, expectedTax: 1, appliedTax: 1 });
assert.equal(comparison.match, true);
assert.deepEqual(comparison.fields, { tax: true, current: true, maximum: true, collapsed: true });

comparison = compareNatureObservation({ before: { current: 1, maximum: 5 }, after: { current: 4, maximum: 4 }, expectedTax: 2, appliedTax: 2 });
assert.equal(comparison.match, true);
assert.equal(comparison.expected.collapsed, true);

comparison = compareNatureObservation({ before: { current: 4, maximum: 5 }, after: { current: 4, maximum: 5 }, expectedTax: 1, appliedTax: 0 });
assert.equal(comparison.match, false);
assert.equal(comparison.fields.tax, false);
assert.equal(comparison.fields.current, false);

console.log("PASS m4-nature-shadow-smoke");
