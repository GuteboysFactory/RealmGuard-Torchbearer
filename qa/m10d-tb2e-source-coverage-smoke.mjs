import assert from "node:assert/strict";
import { TB2E_SOURCE_COVERAGE_MATRIX as matrix, TB2E_COVERAGE_CLASSES } from "../module/m10d-tb2e-source-coverage.mjs";
import { TB2E_CORE_RULEBOOK_AUTHORITY, TB2E_OPTIONAL_SOURCE_AUTHORITY, TB2E_SOURCE_AUTHORITY } from "../module/profiles/torchbearer2e-source-lineage.mjs";
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
  "808847477-Dungeoneers-Handbook.pdf","809781414-TB2e-Scholars-Guide.pdf",
  "809781402-TB2e-Lore-Masters-Manual.pdf","679301798-TB2E-Scavenger-s-Supplement.pdf",
  "MG_FAMILY_CORE_RULE_AUDIT_v0.2","MG_FAMILY_CORE_ARCHITECTURE_v0.1","MG_FAMILY_CORE_IMPLEMENTATION_ROADMAP_v0.1"]);
assert.deepEqual(TB2E_CORE_RULEBOOK_AUTHORITY.map(source=>source.pdfPages),[256,320]);
assert.deepEqual(TB2E_OPTIONAL_SOURCE_AUTHORITY.map(source=>source.pdfPages),[272,72]);
for(const source of TB2E_SOURCE_AUTHORITY)assert.match(source.sha256,/^[a-f0-9]{64}$/);
assert.equal(TB2E_SOURCE_AUTHORITY[0].pdfPages,48);assert.equal(TB2E_SOURCE_AUTHORITY[1].pdfPages,102);
console.log("PASS TB2E source lineage · historical guide matrix preserved · full core + optional supplement authorities registered · immutable / disabled");
