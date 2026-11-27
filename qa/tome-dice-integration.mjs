import assert from "node:assert/strict";
import { actorData, installPlaytestFixture } from "./lib/playtest-foundry-fixture.mjs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";

// Set TOME_SOURCE_DIR when Tome is checked out outside the Realm Guard root.
const tomeSource = process.env.TOME_SOURCE_DIR;
const tomeFile = file => tomeSource
  ? pathToFileURL(resolve(tomeSource, "scripts", file))
  : new URL(`../AdventurersTome/scripts/${file}`, import.meta.url);
const {DICE_FLAG} = await import(tomeFile("dice-table-core.mjs"));

const fixture = installPlaytestFixture();
const { RealmGuardActor } = await import("../module/documents.mjs");
const { refreshRulesProfileRuntime } = await import("../module/rules-profile-service.mjs");
const { resolveRollChatChoice } = await import("../module/roll-chat.mjs");
const { publishChallenge, respondToRoll } = await import("../module/legacy-chat-actions.mjs");
refreshRulesProfileRuntime();

const tomeId = "adventurers-tome";
const stageLog = [];
const gates = [];
const socketListeners = [];
game.socket.on = (_channel, listener) => socketListeners.push(listener);
game.socket.emit = (_channel, request) => {
  if (request.scope !== "TURN_AUTHORITY" || request.type !== "REQUEST") return;
  queueMicrotask(() => {
    for (const listener of socketListeners) listener({
      scope: "TURN_AUTHORITY", type: "RESPONSE", requestId: request.requestId,
      targetUserId: fixture.player.id, result: {ok: true, cost: 0}
    });
  });
};
const { installTurnManager } = await import("../module/turns.mjs");
installTurnManager();
const tome = {api: {}};
game.modules.set(tomeId, tome);
globalThis.canvas = {scene: {id: "map"}};
globalThis.matchMedia = () => ({matches: false});
game.time = {serverTime: 1000};
await import(tomeFile("dice-table.js"));
Hooks.callAll("init");
Hooks.callAll("ready");
const productionDice = tome.api.diceTable;
const timingProbe = productionDice.prepareChatStage([{faces: 6, value: 4}]);
let waitFinished = false;
const waitProbe = productionDice.waitForStage(timingProbe).then(() => { waitFinished = true; });
await new Promise(resolve => setImmediate(resolve));
assert.equal(waitFinished, false);
game.time.serverTime = timingProbe.ends.at(-1);
await waitProbe;
assert.equal(waitFinished, true);
assert.equal(productionDice.prepareChatStage([{faces: 6, value: 4}], {blind: true}), null);
assert.equal(productionDice.prepareChatStage([{faces: 6, value: 4}], {whisper: [fixture.gm.id]}), null);
tome.api.diceTable = {
  ...productionDice,
  waitForStage(timing) {
    const message = fixture.messages.find(row => row.flags?.[tomeId]?.[DICE_FLAG]?.key === timing.key);
    assert.ok(message, "Stage timing and content are published in the same write");
    assert.ok(message.content.includes(`data-at-dice-stage="${timing.key}"`));
    assert.doesNotMatch(message.content, /data-rg-chat-choice|rg-roll-outcome/);
    stageLog.push({messageId: message.id, values: timing.dice.map(die => die.value), content: message.content});
    return new Promise(resolve => gates.push(resolve));
  }
};

async function complete(rolling, answers = []) {
  let complete = false;
  void rolling.then(() => { complete = true; }, () => { complete = true; });
  const seen = new Set();
  for (let index = 0; index < 200 && !complete; index++) {
    await new Promise(resolve => setImmediate(resolve));
    if (gates.length) {
      assert.equal(complete, false, "Roll must wait for its current presentation stage");
      gates.shift()();
    }
    for (const message of fixture.messages) {
      const nonce = message.content.match(/data-decision-nonce="([^"]+)"/)?.[1];
      if (!nonce || seen.has(nonce)) continue;
      seen.add(nonce);
      assert.ok(resolveRollChatChoice(message.id, nonce, answers.shift() ?? "skip"));
    }
  }
  assert.ok(complete, "The roll and all presentation steps finished");
  return rolling;
}

const ranger = new RealmGuardActor(actorData("ranger"));
game.actors.push(ranger);
fixture.dice.push([6, 2, 5], [4], [6], [5]);
const test = await complete(ranger.rollRole(ranger.items.get("fighter"), {obstacle: 4}), ["0", "0"]);
assert.equal(test.outcome, "PASS");
assert.equal(test.successes, 5);
assert.equal(ranger.system.resources.persona.value, 2);
assert.equal(ranger.system.resources.fate.value, 2);
assert.deepEqual(stageLog.map(row => row.values), [[6, 2, 5], [4], [6, 5]]);
assert.equal(new Set(stageLog.map(row => row.messageId)).size, 1);
assert.match(stageLog[1].content, /First roll.*Wise reroll/);
assert.match(stageLog[2].content, /First roll.*Fate dice/);
assert.match(fixture.messages[0].content, /PASS/);
assert.equal(fixture.dice.length, 0);

const opposition = new RealmGuardActor(actorData("opposition"));
game.actors.push(opposition);
globalThis.fromUuidSync = uuid => game.actors.find(actor => actor.uuid === uuid);
const challenge = await publishChallenge(opposition, "Guard's challenge", 1, {versus: true});
game.user = fixture.player;
game.user.character = ranger;
const replySheet = {
  async _openRollDialog() { return {countLearning: false}; },
  _talentUse() { return null; },
  async _commitTalentAfterRoll() {},
  async _commitSynergy() {}
};
fixture.dice.push([4, 3, 5]);
const reply = await complete(respondToRoll(replySheet, challenge));
assert.equal(reply.outcome, "PASS");
const response = fixture.messages.find(row => row.flags?.["realm-guard"]?.challengeResponse);
assert.equal(response.flags["realm-guard"].challengeResponse.messageId, challenge.id);
assert.deepEqual(stageLog.at(-1).values, [4, 3, 5]);
assert.equal(stageLog.at(-1).messageId, response.id);

fixture.dice.push([4, 1, 2]);
const tiedReply = await complete(respondToRoll(replySheet, challenge));
assert.equal(tiedReply.outcome, "TIE");
assert.equal(fixture.messages.at(-1).flags["realm-guard"].versusTie.winner, null);
assert.deepEqual(stageLog.at(-1).values, [4, 1, 2]);

game.user = fixture.gm;
fixture.dice.push([4, 4, 2], [5, 2]);
const automatic = await complete(ranger.rollAutomaticVersus(ranger.items.get("fighter"), opposition, {
  name: "Scout", kind: "role", rating: 2
}));
assert.equal(automatic.outcome, "PASS");
assert.deepEqual(stageLog.slice(-2).map(row => row.values), [[4, 4, 2], [5, 2]]);
assert.equal(stageLog.at(-1).messageId, stageLog.at(-2).messageId);

fixture.settings.set("diceRevealMode", "direct");
fixture.dice.push([4, 4, 4]);
assert.equal((await complete(ranger.rollRole(ranger.items.get("fighter")))).outcome, "PASS");
assert.equal(fixture.messages.at(-1).flags[tomeId], undefined);
game.modules.delete(tomeId);
fixture.dice.push([1, 1, 1]);
assert.equal((await complete(ranger.rollRole(ranger.items.get("fighter")))).outcome, "FAIL");
assert.equal(fixture.messages.at(-1).flags[tomeId], undefined);
assert.equal(stageLog.length, 7);
console.log("PASS Tome dice · actual Realm Guard base, Wise, exploding Fate, Versus Respond, automatic opposition, direct result and no Tome");
