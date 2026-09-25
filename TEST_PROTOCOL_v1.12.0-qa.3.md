# v1.12.0-qa.3 — M10B.3 Wises / Traits / Help / Nature Routing

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.11.0  
**MG1E activation:** OFF / FOUNDATION_ONLY  
**Automatic campaign-data conversion:** NONE

## Gate A — boot / version

Expected:
- system version = 1.12.0-qa.3
- current world profile remains unchanged
- MG1E remains non-selectable
- no Actor/Item/Journal migration
- no red console errors.

## Gate B — capability snapshot

Run:

```js
({
  active: game.realmGuard.core.getActiveProfileCapabilities(),
  strict: game.realmGuard.core.resolveProfileCapabilities("realm-guard-strict"),
  mg1e: game.realmGuard.core.resolveProfileCapabilities("mg1e")
})
```

Expected:
- phase = M10B.3
- MG1E profileVersion = 4
- MG1E foundationOnly = true / selectable = false / liveRuleAuthority = false
- Strict + MG1E: rated Wises = true
- Strict + MG1E: MG1E Trait semantics = true
- Strict + MG1E: Help sourcePolicy = MG1E_TYPED
- Strict + MG1E: Synergy = false
- Strict Nature descriptors = Tradition / Family / Grief
- MG1E Nature label = Nature (Mouse)
- MG1E Nature descriptors = Escaping / Climbing / Hiding / Foraging
- Tap Nature = true
- Double-Tap Nature = true.

## Gate C — Legacy Mixed regression

With Legacy Mixed active:
- ordinary Skill roll works exactly as before
- Wises remain unrated / not directly rollable as Skills
- Legacy Wise reroll behavior remains available
- Legacy Trait semantics remain unchanged
- Help request still permits the existing Legacy helper-source behavior
- Synergy remains available
- Afraid compatibility behavior remains unchanged.

## Gate D — Strict Wises / Traits

Switch to Strict through the existing supported profile switch and reload.

Verify:
- rated Wise can be rolled as a Skill
- rating-0 preserved Wise is not auto-rated and cannot be tested
- I Am Wise = +1D
- Trait L1 = +1D once/session
- Trait L2 = +1D every applicable test
- Trait L3 = reroll failed dice once/session
- Fate/open sixes occur after the L3 reroll
- existing Actor/Item data remains preserved.

## Gate E — Strict Teamwork source matrix

Use two player-owned Rangers if available.

Verify:
- on an Ability test, helper can offer an appropriate Ability
- Skill and Wise helper sources are not offered for an Ability test
- on a Skill test, helper can offer an appropriate Skill or rated Wise
- Ability helper sources are not offered for a Skill test
- Wise Help is shown as Teamwork, not I Am Wise
- Synergy is not shown under Strict
- GM relevance review still works
- failed helped tests retain the existing lesser-Condition helper consequence workflow.

## Gate F — Strict Nature presentation

Verify on a normal roll dialog and Manage Nature:
- descriptor text = Tradition · Family · Grief
- no hardcoded Mouse descriptors appear
- Tap Nature is available except for profile-excluded Resources/Circles
- Double-Tap Nature remains available on a within-Nature Nature test
- normal Nature Tax behavior remains unchanged.

## Gate G — MG1E shadow/foundation resolution

MG1E must still not be activated. In console:

```js
const m = game.realmGuard.core.resolveProfileCapabilities("mg1e");
({
  profile: m.profile,
  wises: m.rules.wises,
  traits: m.rules.traits,
  help: m.rules.help,
  nature: m.rules.nature
})
```

Expected:
- profile version 4
- FOUNDATION_ONLY / selectable false / liveRuleAuthority false
- rated Wises
- MG1E Trait semantics
- MG1E_TYPED Help
- Synergy false
- Nature (Mouse)
- Escaping / Climbing / Hiding / Foraging
- Tap Nature true
- Double-Tap Nature true.

## Gate H — rollback / data safety

Strict → Legacy Mixed → reload.

Expected:
- Legacy behavior returns
- rated Wise values remain stored
- Trait-use data and Nature values remain stored
- no Conditions, Wises, Traits or other Items are deleted
- no inventory placement metadata is rewritten.

## PASS

qa.3 passes when Legacy compatibility remains intact, Strict uses source-correct MG1E-family Wises/Traits/Help/Nature routing, MG1E resolves the same family rules in foundation mode, and the entire round-trip remains non-destructive.
