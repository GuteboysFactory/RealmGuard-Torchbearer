import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.(?:[789]\.0(?:-qa\.\d+)?|10\.0-qa\.\d+)$/, "QA smoke must accept supported legacy 1.7-1.9 lines and the v1.10.0 M9 QA line.");

const recruitment = fs.readFileSync("module/recruitment.mjs","utf8");

for (const needle of [
  'SERVICE CHECKS: ${s.service}',
  'Distribute exactly <strong>${s.service}</strong> checks',
  'Specialty adds 1 additional check and is not part of these Service Checks.',
  'data-rg-service-check',
  'You selected ${allocated} of ${s.service} Service Checks. Allocate ${missing} more check',
  'You selected ${allocated} of ${s.service} Service Checks. Remove ${excess} check'
]) assert.ok(recruitment.includes(needle), `Missing qa.34 Service UX marker: ${needle}`);

for (const removed of [
  'data-rg-service-counter',
  'data-rg-service-counter-value',
  'MutationObserver',
  'rgServiceCounterBound',
  'installRecruitmentServiceCounterObserver',
  'renderServiceCounterFromVisibleDropdowns'
]) assert.ok(!recruitment.includes(removed), `Obsolete Service counter marker remains: ${removed}`);

assert.ok(recruitment.includes('Array.from({ length: s.service + 1 }'), "Service allocation dropdowns must remain station-bounded.");
assert.ok(recruitment.includes('state.specialty = state.rank === "recruit" ? "" : value(form, "specialty");'));

console.log("PASS qa.34 Service UX simplification smoke");
