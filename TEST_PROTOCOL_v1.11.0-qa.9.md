# v1.11.0-qa.9 — M10A.8 Profile Activation QA

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Default profile:** Realm Guard — Legacy Mixed  
**Strict profile:** QA_ACTIVE / reversible  
**Automatic old-Actor conversion:** OFF  
**Profile switch mutation scope:** two world settings only  
**Reload after switch:** REQUIRED FOR QA

## Gate A — update / Legacy boot

Update to **v1.11.0-qa.9** and reload the existing test world before switching.

Run:

```js
(() => ({
  version: game.system.version,
  active: game.realmGuard.core.getActiveRulesProfile(),
  activation: game.realmGuard.core.m10.activationStatus(),
  m10: game.realmGuard.core.m10.getStatus()
}))()
```

Expected:
- version = 1.11.0-qa.9
- active profile = realm-guard-legacy-mixed
- Strict activationState = QA_ACTIVE
- Strict version = 9
- qaSwitchAvailable = true
- strictRulesLive = false
- switch safety = 0 Actor / 0 Item / 0 Journal writes
- switch world-setting writes = 2.

## Gate B — pre-switch preservation snapshot

Before switching, record:

```js
(() => ({
  actors: game.actors.size,
  worldItems: game.items.size,
  active: game.realmGuard.core.getActiveRulesProfile().id,
  rangers: game.actors.filter(a=>a.type==="character").map(a=>({
    id:a.id,
    name:a.name,
    itemCount:a.items.size,
    wises:a.items.filter(i=>i.type==="wise").map(i=>({id:i.id,name:i.name,rating:Number(i.system?.rating??0)})),
    talents:a.items.filter(i=>i.type==="talent").map(i=>i.id),
    freshAfraid:a.items.filter(i=>i.type==="condition"&&["fresh","afraid"].includes(String(i.name).toLowerCase())).map(i=>i.id),
    gear:a.items.filter(i=>i.type==="gear").map(i=>({id:i.id,mode:i.system?.inventory?.mode,location:i.system?.inventory?.location,containerId:i.system?.inventory?.containerId}))
  }))
}))()
```

Keep the result for post-switch comparison.

## Gate C — conversion preview + switch

Open:
**Game Settings → Rules Profile Management**

Expected before switch:
- current = Legacy Mixed
- Strict = QA_ACTIVE v9
- Preview Strict Conversion works
- world-impact counts are plausible
- button **Switch to Strict Realm Guard** is enabled.

Switch to Strict and confirm.

Expected:
- confirmation explicitly says no automatic Wise rating / Talent deletion / Condition deletion / inventory migration
- notification requests reload.

Reload the world.

## Gate D — Strict activation

After reload:

```js
(() => ({
  active: game.realmGuard.core.getActiveRulesProfile(),
  snapshot: game.realmGuard.core.getActiveRulesSnapshot(),
  activation: game.realmGuard.core.m10.activationStatus(),
  m10: game.realmGuard.core.m10.getStatus(),
  creation: game.realmGuard.core.m9.getStatus()
}))()
```

Expected:
- active = realm-guard-strict
- profile version = 9
- activationState = QA_ACTIVE
- strictRulesLive = true
- M10 liveActivation = true
- M9 profileId = realm-guard-strict
- M9 Legacy commit override = DISABLED_UNDER_STRICT.

## Gate E — old-data preservation

Compare with Gate B.

Expected:
- Actor count unchanged
- existing Actor ids unchanged
- existing Item ids/counts unchanged
- old unrated Wise ratings remain exactly as stored; no guessed conversion
- Talent Items remain
- Fresh/Afraid Items remain
- Gear slot/container metadata remains
- no automatic duplicate Conditions or Wises solely from profile switching.

Old rating-0 Wise:
- visible as preserved
- attempting to roll it reports that an explicit Strict rating is required
- system does not invent a rating.

## Gate F — rated Wise / I Am Wise / Teamwork

Use a Strict-created or explicitly rated Wise.

Expected:
- rated Wise is rollable as a Skill
- its rating is visible
- Pass/Fail learning fields are used
- own selected relevant rated Wise in another test = **I Am Wise +1D**
- another Ranger's rated Wise = **Teamwork Wise +1D**
- helper UI does not label another Ranger's Wise as I Am Wise
- Synergy is absent under Strict
- Afraid does not apply the Legacy generic Help block.

## Gate G — Traits

Verify representative Traits:
- Level 1 = +1D once/session
- Level 2 = +1D on every applicable test, no 2-use Legacy cap
- Level 3 = reroll all failed dice once/session
- Level 3 does **not** add Legacy +1 success
- Level 3 use is consumed when the reroll is actually used
- Trait Against Impede/Hurt remains available through the existing guided workflow.

## Gate H — Conditions / Recovery

Expected under Strict:
- Fresh/Afraid preserved Items have no Strict automatic roll effect
- Angry does not block beneficial Trait/Wise use
- Injured/Strained apply -1D to relevant Skill/Nature/Will/Health tests
- Resources/Circles remain excluded from those penalties
- Hungry recovery includes Harvester when trained
- GM Turn recovery costs 2 Checks
- failed Injured/Strained recovery records the Strict guided next route instead of creating an extra Condition.

## Gate I — Levels / Talents

On an existing Ranger with Level/Talent data:
- data remains visible as preserved/inactive
- no Talent use is offered in normal Strict roll UI
- spending Fate/Persona changes only the resource
- no Level increase
- no Talent unlock
- End Session does not reset Talent session state while Strict is active.

## Gate J — Inventory / Conflict

Use an existing weapon Gear item that is **not** in a hand slot.

Expected under Strict:
- it can still be selected/recognized as a physical Conflict tool
- paper-doll placement remains presentation metadata
- no-tool/unarmed does not receive the Legacy universal -1D
- Strict CORE M5 tool evaluation is authoritative; it does not auto-fallback because it differs from Legacy
- Talent controls are absent from Strict Conflict rolls
- Strict Trait/Wise behavior matches Gate F/G.

Scale of Might remains MANUAL/GUIDED and available from:
`game.realmGuard.core.m10.strict`.

## Gate K — Strict Character Creation live commit

Create one disposable Strict Ranger through ordinary Recruitment 2.0.

Expected:
- CORE M9 profile = realm-guard-strict
- Enemy servant house-rule UI is absent
- source-valid Mentor rules are enforced
- starting Wises are rated (checks + 1, max starting 6)
- Strict conditions provisioned:
  Hungry & Thirsty / Angry / Tired / Injured / Strained
- Fresh/Afraid/Sick not provisioned
- inventory policy/provenance indicates Strict / LOOSE
- no Talent grant / Level semantics
- M8 relationships normalize
- CreationProvenance rulesProfileId = realm-guard-strict
- rulesProfileVersion = 9
- rollback remains compensating-transaction based on critical failure.

## Gate L — Strict Manual / Registry

Expected:
- System Manual says Strict Realm Guard is active for M10A.8 QA
- button says **Open Strict Rules**
- Strict Rules Reference says **ACTIVE RULES PROFILE**
- Active Rules Registry resolves Strict sources
- permanent Legacy Mixed Rules Journal remains unchanged and explicitly Legacy Mixed.

## Gate M — reload / multiplayer

Reload again.

Expected:
- Strict remains active
- same rules snapshot hash
- no duplicate Items or migration
- no red console errors.

If using a second client:
- GM and player resolve the same active profile / version / snapshot after reload.

## Gate N — rollback to Legacy

Game Settings → Rules Profile Management → **Switch back to Legacy Mixed**.

Reload.

Expected:
- active profile = realm-guard-legacy-mixed
- Legacy Wises return to unrated behavior
- Legacy Synergy/Fresh/Afraid/Levels/Talents/structured inventory behavior returns
- Strict-created Ranger and all data remain intact
- no Item deletion or automatic reverse conversion.

## Gate O — activate Strict again

Switch to Strict again and reload.

Expected:
- same existing data
- no duplicated Wises/Conditions/Talents/Gear
- no ratings rewritten
- activation is idempotent
- Strict behavior returns.

## PASS

qa.9 passes only when the world can switch Legacy → Strict → Legacy → Strict safely, all requested Strict live-routing gates behave correctly, existing data remains untouched by profile switching, Strict Recruitment commits through CORE M9, reload/multiplayer are coherent, and rollback restores Legacy behavior without data loss.

Do **not** promote Strict activation beyond QA_ACTIVE until this protocol passes.
