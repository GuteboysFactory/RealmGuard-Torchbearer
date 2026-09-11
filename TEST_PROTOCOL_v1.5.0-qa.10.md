# TEST PROTOCOL — v1.5.0-qa.10

## Scope
CORE M3 Custom Content Compatibility.

Legacy Mixed remains authoritative. CORE stays shadow-only.

## A. Status
```js
console.log(game.system.version);
console.log(game.realmGuard.core.testParity.getStatus());
console.log(game.realmGuard.core.customContent.getStatus());
console.log(game.realmGuard.core.effects.getStatus());
```
Expected:
- version `1.5.0-qa.10`
- Test parity `SHADOW_PARITY`, liveApplication false, authority `LEGACY_MIXED`
- custom content `SHADOW_COMPATIBILITY_QA`, liveApplication false
- principle `TYPE_AND_DATA_DRIVEN_NOT_NAME_DRIVEN`
- Effect Engine `SHADOW_COMPARE`, liveApplication false, providerCount 6

## B. Create QA content
On one test Ranger, create content with deliberately non-canonical names:
- Skill: `QA Bog Lore`, Rating 2
- Trait: `QA Moon-Eyed`, Rating 1
- Wise: `QA Marsh-wise`
- Talent: `QA Reed Walker`, linked to Skill `QA Bog Lore`, automatic +1D, passive or unused session frequency, actor level high enough for its minLevel
- Token of Power: `QA Fenstone`, Level 2, linked Skill `QA Bog Lore`, automatic level benefit

These names must not match default/canonical content.

## C. Inspect Actor
```js
const actor = canvas.tokens.controlled[0]?.actor ?? game.actors.getName("YOUR RANGER NAME");
console.log(game.realmGuard.core.customContent.inspectActor(actor));
```
Expected:
- `QA Bog Lore` appears under `customSkills`
- the other QA items appear under their own type
- `QA Bog Lore.defaultSkill === false`

## D. Custom Skill — blocking
Roll `QA Bog Lore` as an ordinary Skill test through the normal Ranger UI.
Then:
```js
const skill = actor.items.find(i => i.type === "role" && i.name === "QA Bog Lore");
console.log(game.realmGuard.core.customContent.compareSkillLatest(actor, skill.id));
```
Expected:
- `isCustom: true`
- `sourceMatches: true`
- `latestStatus: MATCH`
- all five parity fields true
- `match: true`

Optional: toggle Versus on `QA Bog Lore`, target one valid opponent, roll again and verify the real parity entry remains MATCH.

## E. Custom Trait — blocking
```js
const trait = actor.items.find(i => i.type === "trait" && i.name === "QA Moon-Eyed");
console.log(game.realmGuard.core.customContent.compareTrait(actor, trait.id, "help", {
  rollName: "QA Bog Lore",
  isSkill: true,
  baseSuccesses: 0,
  target: 2
}));
```
Expected:
- custom name preserved in Legacy and CORE
- no canonical ID/name requirement
- `match: true`

## F. Custom Wise — blocking
```js
const wise = actor.items.find(i => i.type === "wise" && i.name === "QA Marsh-wise");
console.log(game.realmGuard.core.customContent.compareWise(actor, wise.id, {
  faces: [1,2,4,6],
  rollName: "QA Bog Lore",
  isSkill: true
}));
```
Expected:
- custom Wise resolved by its Actor Item ID
- Legacy/Core reroll indexes match
- `match: true`

## G. Custom Talent — blocking
```js
const talent = actor.items.find(i => i.type === "talent" && i.name === "QA Reed Walker");
console.log(game.realmGuard.core.customContent.compareTalent(actor, talent.id, "QA Bog Lore", {
  isSkill: true
}));
```
Expected:
- custom Talent accepted without canonical sourceKey/name
- Legacy/Core applicability, dice bonus, manual state, frequency and consumption semantics match
- `match: true`

If the Talent is not available, verify actor progression level >= Talent minLevel and that a session-frequency Talent is not already marked used.

## H. Custom Token of Power — blocking
```js
const token = actor.items.find(i => i.type === "tokenOfPower" && i.name === "QA Fenstone");
console.log(game.realmGuard.core.customContent.compareTokenPower(actor, token.id, "QA Bog Lore", {
  isSkill: true
}));
```
Expected:
- custom Token accepted without canonical name/ID
- Legacy/Core applicability and +1D semantics match
- `match: true`

## I. Free-text/manual boundary
Create or edit one custom Talent to `Manual / written effect` and give it arbitrary prose.
Run:
```js
const manualTalent = actor.items.find(i => i.type === "talent" && i.system.effectMode === "manual");
console.log(game.realmGuard.core.customContent.compareTalent(actor, manualTalent.id, manualTalent.system.linkType === "skill" ? manualTalent.system.linkedSkill : "QA Bog Lore", {
  isSkill: manualTalent.system.linkType !== "ability"
}));
```
Expected:
- custom manual Talent remains valid content
- CORE reports manual handling rather than inventing dice mechanics
- comparator `match: true` when Legacy also treats it as manual

## J. Persistence / reload — blocking
Reload Foundry.
Confirm all QA Items still exist unchanged.
```js
const actor2 = canvas.tokens.controlled[0]?.actor ?? game.actors.getName("YOUR RANGER NAME");
console.log(game.realmGuard.core.customContent.verifyNamedItems(actor2, {
  skill: "QA Bog Lore",
  trait: "QA Moon-Eyed",
  wise: "QA Marsh-wise",
  talent: "QA Reed Walker",
  token: "QA Fenstone"
}));
```
Expected every entry: `present: true`.

Also verify:
```js
console.log(game.realmGuard.core.effects.getStatus());
```
Expected providerCount 6, SHADOW_COMPARE, live OFF.

## PASS gate
- Custom Skill real test parity MATCH
- Custom Trait comparator MATCH
- Custom Wise comparator MATCH
- Custom Talent comparator MATCH
- Custom Token comparator MATCH
- manual/free-text content remains manual, no guessed automation
- custom names/IDs survive reload unchanged
- M2 providerCount 6
- M2 live OFF
- M3 live OFF
- Legacy Mixed authority ON

Custom Conditions remain a mandatory M4 carry-forward gate. Custom Gear remains a mandatory M5 carry-forward gate.
