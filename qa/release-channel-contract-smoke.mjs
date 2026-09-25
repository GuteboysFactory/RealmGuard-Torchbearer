import assert from "node:assert/strict";
import fs from "node:fs";

const repoBase = "https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels";
const releaseBase = "https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download";

const root = JSON.parse(fs.readFileSync("system.json", "utf8"));
const qa = JSON.parse(fs.readFileSync("channels/qa/system.json", "utf8"));
const stable = JSON.parse(fs.readFileSync("channels/stable/system.json", "utf8"));

const expectedRootChannel = root.version.includes("-") ? "qa" : "stable";
assert.equal(root.manifest, `${repoBase}/${expectedRootChannel}/system.json`);
assert.equal(root.download, `${releaseBase}/${root.version}/realm-guard.zip`);

assert.match(qa.version, /-qa\.\d+$/, "QA channel must expose a published QA version.");
assert.equal(qa.manifest, `${repoBase}/qa/system.json`);
assert.equal(qa.download, `${releaseBase}/${qa.version}/realm-guard.zip`);

assert.doesNotMatch(stable.version, /-/, "Stable channel must not expose a prerelease.");
assert.equal(stable.manifest, `${repoBase}/stable/system.json`);
assert.equal(stable.download, `${releaseBase}/${stable.version}/realm-guard.zip`);

// Permanent guard: historical QA regression tests must not pin manifest.version to one exact qa.N.
for (const file of fs.readdirSync("qa").filter(name => name.endsWith("-smoke.mjs"))) {
  const source = fs.readFileSync(`qa/${file}`, "utf8");
  const exactLiteral = /manifest\.version[\s\S]{0,120}["'`]\d+\.\d+\.\d+-qa\.\d+["'`]/;
  const exactRegex = /manifest\.version[^\n]*-qa\\\.\d+(?!\+|\\d)/;
  const pinnedMinorLine = source.split(/\\r?\\n/).some(line => line.includes("manifest.version") && /\\^1\\\\\.(?!\\\\d\\+)/.test(line));
  assert.equal(exactLiteral.test(source), false, `${file} pins manifest.version to one exact QA build.`);
  assert.equal(exactRegex.test(source), false, `${file} contains an exact QA-number manifest regex.`);
  assert.equal(pinnedMinorLine, false, `${file} pins manifest.version to a closed 1.x minor-version list.`);
}

console.log("PASS release-channel contract · gated qa/stable manifests · no exact QA version pins");
