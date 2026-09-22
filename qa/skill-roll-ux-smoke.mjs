import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const moduleText = read("module/skill-roll-ux.mjs");
const entryText = read("realm-guard.mjs");
const manifest = JSON.parse(read("system.json"));

const requiredModuleSnippets = [
  "quickRollRole",
  "quickRollUntrained",
  "WILL-BASED",
  "HEALTH-BASED",
  "CUSTOM / CHOOSE",
  "Obstacle approval is active",
  "rollBeginnerLuck",
  "rollAutomaticVersus"
];

for (const snippet of requiredModuleSnippets) {
  if (!moduleText.includes(snippet)) throw new Error(`Skill Roll UX smoke: missing ${snippet}`);
}

if (!entryText.includes('installSkillRollUx(RealmGuardActorSheet, RealmGuardActor)')) {
  throw new Error("Skill Roll UX smoke: installer is not wired to the Ranger sheet.");
}

if (!manifest.styles?.includes("styles/skill-roll-ux.css")) {
  throw new Error("Skill Roll UX smoke: stylesheet missing from manifest.");
}

if (!/^1\.(?:[789]\.0(?:-qa\.\d+)?|10\.0-qa\.\d+)$/.test(manifest.version)) {
  throw new Error(`Skill Roll UX smoke: unexpected version ${manifest.version}`);
}

console.log("PASS skill-roll-ux-smoke");
