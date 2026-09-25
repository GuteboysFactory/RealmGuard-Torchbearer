import assert from "node:assert/strict";
import fs from "node:fs";
import {
  assertManifestReleaseContract,
  assertNoHistoricalVersionPins,
  assertNoProfileManagementCopyPins,
  assertNoRetiredM10BBranchPins,
  expectedDownloadUrl,
  expectedManifestUrl,
  QA_VERSION_PATTERN,
  readReleaseReady
} from "./lib/release-contract.mjs";

const root = JSON.parse(fs.readFileSync("system.json", "utf8"));
const qa = JSON.parse(fs.readFileSync("channels/qa/system.json", "utf8"));
const stable = JSON.parse(fs.readFileSync("channels/stable/system.json", "utf8"));

const readyVersion = readReleaseReady();
assertManifestReleaseContract(root, { readyVersion });

assert.match(qa.version, QA_VERSION_PATTERN, "QA channel must expose a published QA version.");
assert.equal(qa.manifest, expectedManifestUrl(qa.version));
assert.equal(qa.download, expectedDownloadUrl(qa.version));

assert.doesNotMatch(stable.version, /-/, "Stable channel must not expose a prerelease.");
assert.equal(stable.manifest, expectedManifestUrl(stable.version));
assert.equal(stable.download, expectedDownloadUrl(stable.version));

// Permanent repository-wide guards. Historical regression tests may assert behavior,
// but they may not own the release-version grammar or human-facing Profile Management copy.
for (const file of fs.readdirSync("qa").filter(name => name.endsWith("-smoke.mjs"))) {
  const source = fs.readFileSync(`qa/${file}`, "utf8");
  assertNoHistoricalVersionPins(source, file);
  assertNoProfileManagementCopyPins(source, file);
  assertNoRetiredM10BBranchPins(source, file);
}

console.log("PASS release-channel contract · gated qa/stable manifests · no exact QA version pins · canonical version authority · no historical minor-version pins · no Profile Management copy pins");
