import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.9\.0-qa\.\d+$/);

const recruitment = fs.readFileSync("module/recruitment.mjs","utf8");

for (const needle of [
  'data-rg-service-check',
  'data-rg-service-counter',
  'data-rg-service-counter-value',
  'function readVisibleServiceTotal(form)',
  'function renderServiceCounterFromVisibleDropdowns(form)',
  'function bindServiceCounterForm(form)',
  'function bindVisibleRecruitmentServiceCounters(root = document)',
  'function installRecruitmentServiceCounterObserver()',
  'new MutationObserver',
  'serviceCounterObserver.observe(document.body, { childList: true, subtree: true })',
  'select.dataset.rgServiceCounterBound = "true"',
  'select.addEventListener("change", refresh)',
  'select.addEventListener("input", refresh)',
  'installRecruitmentServiceCounterObserver();'
]) assert.ok(recruitment.includes(needle), `Missing qa.33 Service counter marker: ${needle}`);

assert.ok(!recruitment.includes('installFreshServiceCounter(dialog)'), "qa.33 must not rely on DialogV2 render-time Service binding.");
assert.ok(!recruitment.includes('rgFreshServiceCounter'), "qa.33 must remove the prior render-hook binding marker.");
assert.ok(recruitment.includes('form.querySelectorAll("select[data-rg-service-check]")'), "Counter must sum visible Service dropdowns directly.");

console.log("PASS qa.33 MutationObserver Service counter smoke");
