# TEST PROTOCOL — v1.6.0-qa.6

Scope: M4 Conditions / Capability Blocking / Recovery real shadow parity. Legacy Mixed remains the sole live authority. CORE observes and independently compares roll modifiers, capability blocks, recovery validation/methods, recovery results, GM Check economy and recovery-attempt marking.

## A — Version / startup

```js
console.log(game.system.version);
console.log(game.realmGuard.core.m4.getStatus());
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getStatus());
```

Expected:
- `1.6.0-qa.6`
- `mode: REAL_LEGACY_CONDITION_RECOVERY_SHADOW_PARITY`
- `liveApplication: false`
- `authority: LEGACY_MIXED`
- all wrapper flags `true`

Clear before focused tests:

```js
game.realmGuard.core.m4.conditionRecoveryParity.clear();
```

## B — Condition roll modifier parity

Activate **Strained** or **Injured** on a QA Ranger and make a normal Skill roll that the Condition affects.

Then:

```js
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getLatest());
```

Expected latest relevant `CONDITION_ROLL` observation:
- `status: MATCH`
- `comparison.fields.conditionIds: true`
- `comparison.fields.diceModifier: true`
- the Legacy roll card/pool shows the same Condition modifier CORE predicted.

Repeat once with an Ability that the Condition affects, e.g. Will or Health.

## C — No-effect roll parity

With Strained/Injured still active, make a **Resources** or **Circles** roll.

Expected relevant `CONDITION_ROLL` observation:
- `status: MATCH`
- Condition is not included in the roll effect set
- CORE and Legacy both predict/apply `0D` from that Condition.

## D — Custom Condition parity

Create or use a custom Condition with structured data, for example:
- active
- `rollModifier: -2`
- `appliesTo: Scout`

Make a Scout roll.

Expected:
- `CONDITION_ROLL`
- `status: MATCH`
- custom Condition appears by ID/name
- total modifier matches Legacy.

This confirms custom Conditions remain data-driven rather than canonical-name-driven.

## E — Angry capability block

Activate **Angry**.

Open a roll and try to use:
- a beneficial Trait;
- a Wise.

Legacy should block those beneficial uses as before.

Inspect:

```js
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getHistory().filter(x => x.kind === "CAPABILITY_SUPPORT").slice(-5));
console.log(game.realmGuard.core.m4.capabilityBlocks.isBlocked(game.actors.getName("YOUR RANGER NAME"), "BENEFICIAL_TRAIT_WISE"));
```

Expected:
- relevant `CAPABILITY_SUPPORT` entries are `MATCH`
- CORE says `blocked: true` while Angry is active.

## F — Afraid capability blocks

Activate **Afraid**.

Verify live Legacy behavior:
- Beginner's Luck is blocked;
- the Ranger cannot provide Help/Teamwork.

After attempting Beginner's Luck:

```js
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getLatest());
```

Expected relevant entry:
- `kind: CAPABILITY_BEGINNER_LUCK`
- `status: MATCH`
- `expectedBlocked: true`
- `actualBlocked: true`

Also inspect:

```js
console.log(game.realmGuard.core.m4.capabilityBlocks.isBlocked(game.actors.getName("YOUR RANGER NAME"), "HELP"));
console.log(game.realmGuard.core.m4.capabilityBlocks.isBlocked(game.actors.getName("YOUR RANGER NAME"), "BEGINNER_LUCK"));
```

Both should report `blocked: true` while Afraid is active.

## G — Recovery order validation

Use a QA Ranger with multiple active canonical Conditions, for example:
- Hungry & Thirsty
- Angry
- Tired

Try recovering a later Condition before the earlier blocker.

Expected:
- Legacy prevents the attempt and names the blocker;
- CORE RecoveryService reports the same recovery-order blocker.

Inspect latest history/summary:

```js
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getLatest());
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getSummary());
```

If the action exits before a committed roll, a `RECOVERY_PREP` observation is valid. It should be `MATCH`.

## H — Canonical Recovery method parity

Use one of these:
- Angry → Will Ob 2
- Afraid → Will Ob 3
- Tired → Health Ob 3
- Injured → Health Ob 4
- Strained → Will Ob 4

Open Recovery and commit the roll.

Expected latest relevant `RECOVERY_RESOLUTION`:
- `status: MATCH`
- selected method is in CORE's method set
- obstacle and base recovery pool match
- `conditionsIgnored: true`

Recovery rolls must continue to ignore ordinary Condition dice penalties.

## I — Recovery PASS

Commit a Recovery test that passes.

Expected live Legacy behavior:
- the Condition becomes inactive exactly once.

Expected shadow comparison:
- `RECOVERY_RESOLUTION`
- `status: MATCH`
- `resolution.fields.conditionOutcome: true`
- no duplicate chat card
- no duplicate advancement mark
- no duplicate resource spend.

## J — Recovery FAIL

Commit a Recovery test that fails.

Expected live Legacy behavior:
- the Condition remains active.

Expected shadow comparison:
- `status: MATCH`
- `resolution.fields.conditionOutcome: true`
- Condition remains active exactly once.

## K — GM Turn Check economy

With Turn Manager enabled and current phase = GM Turn:
- give the QA Ranger at least 2 Checks;
- perform a valid Recovery attempt.

Expected Legacy behavior:
- exactly 2 Checks are spent when the attempt commits.

Expected shadow comparison:
- `resolution.fields.gmCheckEconomy: true`
- `status: MATCH`.

If a roll is blocked/cancelled before commitment, Legacy's existing refund/cancel behavior must remain unchanged.

## L — Recovery attempt marking

With Turn Manager enabled, complete one Recovery attempt for a Condition.

Expected:
- Legacy records the attempt once for that Turn;
- a second attempt in the same Turn is refused according to existing rules;
- shadow comparison records `attemptRecorded: true` on the committed attempt.

## M — Custom Recovery method

Create/use a custom Condition with either:
- `recoveryType: ability` + `recoveryAbility`, or
- `recoveryType: role` + `recoveryRole`,
plus a structured `recoveryObstacle`.

Open Recovery.

Expected:
- Legacy and CORE offer/expect the same method and obstacle;
- custom Condition does not alter canonical recovery order;
- committed result produces `MATCH`.

## N — Manual/Fresh clear

For a manual custom Condition or Fresh, use the normal Recovery/Clear action.

Expected:
- Condition clears exactly once;
- latest relevant entry is `RECOVERY_MANUAL` with `status: MATCH`.

## O — Reload / duplicate safety

Reload Foundry (F5), then:

```js
game.realmGuard.core.m4.conditionRecoveryParity.clear();
```

Perform exactly one Condition-affected roll and one Recovery attempt.

Then:

```js
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getSummary());
console.log(game.realmGuard.core.testParity.getSummary());
console.log(game.realmGuard.core.m4.advancement.getSummary());
console.log(game.realmGuard.core.m4.natureParity.getSummary());
```

Verify:
- no duplicate Condition observations for a single internal condition calculation;
- one Recovery action produces one preparation/resolution observation as appropriate;
- M3 still matches;
- Advancement remains correct;
- Nature parity remains correct;
- no duplicate chat, Learning, Persona/Fate, Nature tax, Condition clear or Check spend.

## P — Roll Dialog UX regression

Open a long roll dialog.

Verify qa.5 remains intact:
- parchment/beige hierarchy;
- green active choices;
- Nature Versus hint;
- vertical scroll.

## PASS gate

- Condition Skill modifier parity: PASS
- Condition Ability modifier parity: PASS
- Resources/Circles exclusion parity: PASS
- Custom Condition roll parity: PASS
- Angry Trait/Wise block parity: PASS
- Afraid Beginner's Luck block parity: PASS
- Afraid Help block preserved: PASS
- Recovery order parity: PASS
- Canonical Recovery methods parity: PASS
- Recovery ignores Condition penalties: PASS
- Recovery PASS clears once: PASS
- Recovery FAIL remains active: PASS
- GM Turn 2-Check economy parity: PASS
- Attempt marking / repeat block preserved: PASS
- Custom Recovery parity: PASS
- Manual/Fresh clear parity: PASS
- Reload / duplicate safety: PASS
- M2 preserved: PASS
- M3 preserved: PASS
- Advancement preserved: PASS
- Nature parity preserved: PASS
- qa.5 Roll Dialog UX preserved: PASS
- Legacy remains sole live writer: PASS
