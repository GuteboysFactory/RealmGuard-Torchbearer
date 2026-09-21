import assert from "node:assert/strict";
import fs from "node:fs";

const sheet = fs.readFileSync("sheets/actor-sheet.mjs", "utf8");
for (const needle of [
  'const isCirclesObstacle = String(abilityKey) === "circles";',
  'Circles Obstacle is always GM authority',
  '(review || isCirclesObstacle) ? "readonly"',
  'isCirclesObstacle || (workflow === "baseline" && !ruleSpecific)',
  'Ob ${initialObstacle} · GM controlled'
]) assert.ok(sheet.includes(needle), `Missing qa.40 Circles obstacle marker: ${needle}`);

assert.match(
  sheet,
  /const initialObstacle\s*=\s*isCirclesObstacle\s*\?\s*baselineObstacle\(\)/s,
  "Circles must source its initial Obstacle from GM Baseline regardless of formatting."
);

assert.match(
  sheet,
  /const ruleSpecific\s*=\s*fixedObstacle\s*\|\|\s*Boolean\(versus\s*&&\s*opponent\)\s*\|\|\s*String\(abilityKey\)\s*===\s*"resources"/s,
  "ruleSpecific must exclude Circles while preserving Resources as rule-specific."
);
assert.doesNotMatch(
  sheet,
  /const ruleSpecific[^;]*circles/is,
  "Circles must not be present in the ruleSpecific Obstacle assignment."
);

const gmTools = fs.readFileSync("module/gm-tools.mjs", "utf8");
assert.ok(gmTools.includes("Circles also follows GM Obstacle authority here"));
assert.ok(gmTools.includes("Circles remains locked to GM authority in every mode"));

const obstacles = fs.readFileSync("module/obstacles.mjs", "utf8");
assert.ok(obstacles.includes("Circles is always locked to GM Obstacle authority."));
assert.ok(obstacles.includes("Circles uses the same GM-controlled approval path."));
assert.ok(obstacles.includes("Circles is the exception: its Obstacle remains read-only for the player"));

console.log("PASS qa.40 Circles GM Obstacle authority smoke");
