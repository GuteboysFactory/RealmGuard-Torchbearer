# v1.11.0-qa.1 — M10A.0 Profile Foundation QA

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Gameplay change:** NONE INTENDED  
**Live rules profile:** Realm Guard — Legacy Mixed  
**Strict profile state:** FOUNDATION ONLY / NOT SELECTABLE

## Gate A — install / boot

Install/update to **v1.11.0-qa.1** through the normal QA manifest and open a copy of an existing v1.10.0 world.

Expected:
- world opens without console-breaking errors
- system id remains `realm-guard`
- existing Actors, Items, Scenes, Journals and campaign data are unchanged
- normal gameplay remains Legacy Mixed.

## Gate B — baseline status

Run:

```js
game.realmGuard.core
```

Then inspect the existing baseline/profile status API.

Expected:
- system schema/architecture remain ready
- active profile remains `realm-guard-legacy-mixed`
- baseline does not rewrite existing data
- no Actor/Item migration is performed.

## Gate C — registered profiles

Run:

```js
game.realmGuard.core.registeredProfiles()
```

Expected entries include:
- `realm-guard-legacy-mixed` — selectable/supported
- `mg1e` — foundation-only, not selectable/supported
- `realm-guard-strict` — foundation-only, not selectable/supported

Strict must not become active merely because it is registered.

## Gate D — Strict read-only resolution

Run:

```js
game.realmGuard.core.resolveRulesProfile("realm-guard-strict")
```

Expected:
- id = `realm-guard-strict`
- lineage = `mg1e -> realm-guard-strict`
- metadata.strictRealmGuard = true
- metadata.foundationOnly = true
- metadata.selectable = false
- metadata.liveRuleAuthority = false
- metadata.conversionRequired = true.

No world setting, Actor or Item should change from this call.

## Gate E — Legacy runtime regression

Open the Rules Registry and perform representative existing workflows:
- one ordinary Skill test
- Fate / Persona availability check
- one Help request
- open Conditions
- open Inventory / Equipment
- open Conflict setup
- open Recruitment/Create Ranger without committing if a full creation is unnecessary.

Expected:
- behavior is unchanged from v1.10.0
- registry still reports Realm Guard — Legacy Mixed as active
- no Strict rule is applied live.

## Gate F — reload safety

Reload the world/client.

Expected:
- active profile remains Legacy Mixed
- no forced profile rewrite
- no duplicate migration event that mutates campaign data
- Strict/MG1E remain registered as foundation-only.

## Gate G — multi-client smoke

With GM + one player connected, reload one client and then the other.

Expected:
- both resolve the same active Legacy Mixed profile snapshot
- no profile mismatch or console error
- no switch prompt is shown.

## Gate H — M9 creation regression

Create one representative Ranger or run the existing M9 regression path.

Expected:
- CORE M9 remains normal Creation authority
- Legacy Mixed creation profile remains active
- Wises remain unrated
- CreationProvenance uses the active Legacy Mixed rules snapshot
- no automatic NPC creation
- M8 normalization remains intact.

## PASS

qa.1 passes when the profile foundation is resolvable, baseline repair no longer assumes Legacy Mixed is the only possible future profile, and every normal live workflow remains behaviorally identical to v1.10.0.

After PASS, do a new read-only audit for **M10A.1 — Strict Registry + Profile Conversion Preview** before any further patch.
