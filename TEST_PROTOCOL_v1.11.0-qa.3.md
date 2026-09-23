# v1.11.0-qa.3 — M10A.2 Wises / Traits / Help + Profile Management QA

**QA RESULT:** 🟢✅ FULL PASS — Profile Management, Wise preservation, Strict Trait/Help planners, helper consequence contract, reload and Legacy Mixed regression verified in Foundry VTT 13.351.  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Active gameplay profile:** Realm Guard — Legacy Mixed  
**Strict gameplay authority:** OFF  
**Profile switching:** LOCKED  
**Automatic Wise conversion:** OFF

## Gate A — update / boot

Update to **v1.11.0-qa.3** through the QA manifest and open the same test world.

Expected:
- world opens normally
- active profile remains `realm-guard-legacy-mixed`
- existing Wises remain present with names/descriptions intact
- no Actor/Item bulk migration prompt
- no new console-breaking error.

## Gate B — Game Settings Profile Management

Open:

**Game Settings → Configure Settings → Realm Guard / Torchbearer → Rules Profile Management → Manage Rules Profile**

Expected:
- current profile = Realm Guard — Legacy Mixed
- Strict Realm Guard = PREVIEW_ONLY
- source lineage = Mouse Guard RPG 2008 / 1E → Realm Guard v1.6 overrides
- World Impact summary is populated
- **Preview Strict Conversion** opens the existing read-only conversion report
- **Switch to Strict Realm Guard** is visible but disabled/locked
- no raw profile-id/version input is exposed.

## Gate C — additive Wise schema preservation

Open several existing Wise Items from the qa.2 world before and after reload.

Expected:
- name unchanged
- description unchanged
- no rating has been invented for old Wises
- existing Wises are treated by Strict planning as `UNASSIGNED_PRESERVED`
- Legacy Mixed live rolls continue using the existing unrated Wise behavior.

Console QA:

```js
const ranger = game.actors.find(a => a.type === "character" && a.items.some(i => i.type === "wise"))
const wise = ranger?.items.find(i => i.type === "wise")
game.realmGuard.core.m10.strict.wiseView(wise)
game.realmGuard.core.m10.strict.planWiseTest(wise)
```

For an untouched existing Wise, expected:
- rating = 0
- conversionState = `UNASSIGNED_PRESERVED`
- planWiseTest.ok = false
- reasonCode = `wise-unassigned`.

This is expected: qa.3 adds schema capability, not conversion.

## Gate D — Strict Trait policy API

Run representative policy calls:

```js
game.realmGuard.core.m10.strict.traitBenefitPlan({system:{rating:1}}, {sessionUses:0})
game.realmGuard.core.m10.strict.traitBenefitPlan({system:{rating:2}}, {sessionUses:99})
game.realmGuard.core.m10.strict.traitBenefitPlan({system:{rating:3}}, {sessionUses:0})
game.realmGuard.core.m10.strict.traitAgainstPlan("breakTie", {versus:true})
game.realmGuard.core.m10.strict.traitCheckEconomy({level:1,sessionUses:0,checks:3})
```

Expected:
- L1 = +1D once/session
- L2 = +1D and remains available regardless of prior positive uses
- L3 = reroll all failed dice once/session, not +1 success
- Break Tie = 2 Checks and tieToOpponent = true
- Charge cost = 3 Checks
- Recharge L1 = 2 Checks
- Recharge L3 = 4 Checks.

These are Strict policy plans only; they must not change a Legacy Mixed roll.

## Gate E — Strict Help policy API

Run:

```js
game.realmGuard.core.m10.strict.classifyHelp({sourceKind:"Wise", isSelf:true})
game.realmGuard.core.m10.strict.classifyHelp({sourceKind:"Wise", isSelf:false})
game.realmGuard.core.m10.strict.helperEligibility({sourceKind:"Skill", isSelf:false})
```

Expected:
- own Wise = `I_AM_WISE` +1D
- another Ranger's Wise = `TEAMWORK_WISE` +1D
- synergyAllowed = false
- afraidBlocksHelp = false
- helperSharesConsequences = true for another Ranger.

## Gate F — helper consequence contract

Run:

```js
game.realmGuard.core.m10.strict.helperConsequenceContract({
  helperActorId:"test",
  helperActorName:"Test Helper",
  sourceKind:"Wise",
  sourceName:"Road-wise",
  failed:true
})
```

Expected:
- consequence = `LESSER_CONDITION_CHOSEN_BY_GM`
- applicationAuthority = `M10A.3_CONDITIONS_RECOVERY`
- autoApply = false.

qa.3 must not apply a Condition from this contract.

## Gate G — Legacy Mixed regression

Perform ordinary live Legacy Mixed checks:
- normal Skill roll
- current Wise selected-use behavior
- Trait L1/L2/L3 behavior remains the current Legacy implementation
- Help request still displays Legacy Synergy
- Afraid still blocks Help under Legacy Mixed if applicable.

Expected:
- no Legacy Mixed gameplay behavior changes
- Strict policy APIs remain non-live.

## Gate H — reload

Reload the world.

Expected:
- active profile remains Legacy Mixed
- Rules Profile Management still appears in Game Settings
- existing Wise descriptions/data remain intact
- no Strict switch or auto-conversion occurs.

## PASS

qa.3 passes when additive Wise fields survive without assigning ratings, Strict Wises/Traits/Help semantics are available through non-live policy services, Game Settings exposes safe Profile Management with a locked Switch control, and all Legacy Mixed gameplay remains unchanged.

After PASS, perform a new read-only audit for **M10A.3 — Conditions / Recovery** before any mutation.
