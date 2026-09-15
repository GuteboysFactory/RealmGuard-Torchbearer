import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("module/actor-sheet-scroll-state.mjs", "utf8");
const main = fs.readFileSync("realm-guard.mjs", "utf8");

assert.match(source, /installActorSheetScrollPersistence/);
assert.match(source, /scrollTop/);
assert.match(source, /scrollLeft/);
assert.match(source, /requestAnimationFrame/);
assert.match(source, /addEventListener\("scroll"/);
assert.match(source, /snapshotScrollableTargets/);
assert.match(source, /restore\(this, this\.element/);
assert.match(main, /installActorSheetScrollPersistence/);
assert.match(main, /installActorSheetScrollPersistence\(RealmGuardActorSheet\)/);

console.log("PASS m5-sheet-scroll-persistence-smoke");
