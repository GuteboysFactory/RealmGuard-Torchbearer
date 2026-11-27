import assert from "node:assert/strict";
import {actorData, installPlaytestFixture} from "./lib/playtest-foundry-fixture.mjs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";

// Set TOME_SOURCE_DIR when Tome is checked out outside the Realm Guard root.
const tomeSource = process.env.TOME_SOURCE_DIR;
const tomeFile = file => tomeSource
  ? pathToFileURL(resolve(tomeSource, "scripts", file))
  : new URL(`../AdventurersTome/scripts/${file}`, import.meta.url);
const {DICE_FLAG} = await import(tomeFile("dice-table-core.mjs"));

const fixture = installPlaytestFixture();
const {RealmGuardActor} = await import("../module/documents.mjs");
const {refreshRulesProfileRuntime} = await import("../module/rules-profile-service.mjs");
const {installVersusTiebreak, versusTieState} = await import("../module/versus-tiebreak.mjs");
const {requestTurnAuthority} = await import("../module/turn-authority-bridge.mjs");
refreshRulesProfileRuntime();
installVersusTiebreak();

const tomeId = "adventurers-tome";
const tome = {api: {}};
game.modules.set(tomeId, tome);
globalThis.canvas = {scene: {id: "gm-view"}};
globalThis.matchMedia = () => ({matches: false});
game.time = {serverTime: 1000};
await import(tomeFile("dice-table.js"));
Hooks.callAll("init");
Hooks.callAll("ready");

const first = new RealmGuardActor({...actorData("first"), ownership: {}});
const second = new RealmGuardActor({...actorData("second"), ownership: {}});
game.actors.push(first, second);
globalThis.fromUuid = async uuid => game.actors.find(actor => actor.uuid === uuid);
const originalContent = "<p>Original challenge</p>";
const flagsFor = message => message.flags["realm-guard"].versusTie;
const stageFor = message => message.flags[tomeId]?.[DICE_FLAG];
const action = (message, side, name, ability) => requestTurnAuthority("VERSUS_TIEBREAK",
  {messageId: message.id, side, action: name, ability}, {primaryOnly: true});

async function startTie({whisper = []} = {}) {
  const message = await ChatMessage.create({
    content: originalContent, whisper, speaker: {scene: "challenge-scene"},
    flags: {"realm-guard": {versusTie: versusTieState(first, null, second, null)}}
  });
  message.visible = message.isContentVisible = true;
  message.getFlag = (scope, key) => message.flags[scope]?.[key];
  assert.equal((await action(message, 0, "confirm", "health")).ok, true);
  assert.equal((await action(message, 1, "confirm", "will")).ok, true);
  return message;
}

const message = await startTie();
fixture.dice.push([4, 3, 5, 1], [2, 1, 6, 2]);
assert.equal((await action(message, 0, "roll")).ok, true);
assert.equal(flagsFor(message).sides[0].roll.successes, 2);
assert.equal(stageFor(message), undefined, "The first side's dice stay hidden while the other side is waiting");

const finalRoll = action(message, 1, "roll");
for (let i = 0; i < 10 && !stageFor(message); i++) await new Promise(resolve => setImmediate(resolve));
const stage = stageFor(message);
assert.ok(stage);
assert.equal(stage.sceneId, "challenge-scene");
assert.deepEqual(stage.dice.map(die => die.value), [4, 3, 5, 1, 2, 1, 6, 2]);
assert.equal(tome.api.diceTable.isStageActive(message, flagsFor(message).presentation), true);
assert.match(message.content, /data-rg-tiebreak-stage/);
game.time.serverTime = stage.ends.at(-1);
assert.equal((await finalRoll).ok, true);
assert.equal(flagsFor(message).winner, 0);
assert.equal(stageFor(message), undefined);
assert.equal(message.content, originalContent);

const privateTie = await startTie({whisper: [game.user.id]});
fixture.dice.push([4, 4, 1, 1], [2, 1, 1, 2]);
assert.equal((await action(privateTie, 0, "roll")).ok, true);
assert.equal((await action(privateTie, 1, "roll")).ok, true);
assert.equal(stageFor(privateTie), undefined);
assert.equal(flagsFor(privateTie).winner, 0);

fixture.settings.set("diceRevealMode", "direct");
const directTie = await startTie();
fixture.dice.push([1, 1, 1, 1], [5, 5, 4, 2]);
assert.equal((await action(directTie, 0, "roll")).ok, true);
assert.equal((await action(directTie, 1, "roll")).ok, true);
assert.equal(stageFor(directTie), undefined);
assert.equal(flagsFor(directTie).winner, 1);
console.log("PASS deferred Versus: both original pools on one card, one animation, cleanup, private and direct fallback");
