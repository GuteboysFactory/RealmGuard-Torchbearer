import assert from "node:assert/strict";
import { TB2E_SOURCE_COVERAGE_MATRIX as matrix, TB2E_COVERAGE_CLASSES } from "../module/m10d-tb2e-source-coverage.mjs";
import { TB2E_SOURCE_AUTHORITY } from "../module/profiles/torchbearer2e-source-lineage.mjs";
const expected={tests:"PARTIAL",abilities:"PARTIAL",nature:"PARTIAL",traits:"SOURCE_INCOMPLETE",wises:"VERIFIED",help:"PARTIAL",resources:"PARTIAL",conditions:"PARTIAL",recovery:"PARTIAL",inventory:"PARTIAL",armor:"SOURCE_INCOMPLETE",conflict:"SOURCE_INCOMPLETE",advancement:"PARTIAL",session:"PARTIAL",circles:"PARTIAL",creation:"PARTIAL",magic:"SOURCE_INCOMPLETE",scales:"PARTIAL",narrative:"MANUAL"};
assert.deepEqual(Object.fromEntries(matrix.map(row=>[row.id,row.status])),expected);
assert.equal(matrix.length,19);
assert.equal(new Set(matrix.map(row=>row.id)).size,19);
for(const row of matrix){
  assert.ok(TB2E_COVERAGE_CLASSES.includes(row.status));
  assert.match(row.evidence,/(QR|CC) \d/);
  assert.ok(row.verifiedScope.length>20&&row.gaps.length>20);
  assert.equal(row.mode,"READ_ONLY");assert.equal(row.liveEnabled,false);assert.equal(row.automation,"DISABLED");
  assert.ok(Object.isFrozen(row));
}
assert.ok(Object.isFrozen(matrix));
assert.throws(()=>{matrix[0].liveEnabled=true;},TypeError);
assert.deepEqual(TB2E_SOURCE_AUTHORITY.map(source=>source.id),[
  "538386285-Torchbearer-2E-Character-Creation-Guide.pdf","538386649-Torchbearer-2E-Quick-Rules-Guide.pdf",
  "MG_FAMILY_CORE_RULE_AUDIT_v0.2","MG_FAMILY_CORE_ARCHITECTURE_v0.1","MG_FAMILY_CORE_IMPLEMENTATION_ROADMAP_v0.1"]);
for(const source of TB2E_SOURCE_AUTHORITY)assert.match(source.sha256,/^[a-f0-9]{64}$/);
assert.equal(TB2E_SOURCE_AUTHORITY[0].pdfPages,48);assert.equal(TB2E_SOURCE_AUTHORITY[1].pdfPages,102);
console.log("PASS M10D.1 TB2E exact source coverage · 19 classified domains · bounded guide authority · immutable / disabled");
