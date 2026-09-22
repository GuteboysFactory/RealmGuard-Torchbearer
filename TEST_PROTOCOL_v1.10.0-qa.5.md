# v1.10.0-qa.5 — M9 Closure / Hardening Candidate QA

**Foundry target:** 13.351  
**GOLD fallback:** v1.9.0  
**Previous M9 gate:** v1.10.0-qa.4 PASS  
**Gameplay change:** NONE INTENDED  
**Normal Character Creation authority:** CORE M9  
**Legacy implementation:** QA-only explicit fallback/reference  
**Release channel:** gated QA manifest

## Gate A — authority / clean runtime status

Run:

```js
game.realmGuard.core.m9.getStatus()
```

Expected:
- mode = CORE_LIVE_COMMIT
- authority = CORE_M9
- draftAuthority = CORE_M9
- validationAuthority = CORE_M9
- commitAuthority = CORE_M9
- parityGuard = LEGACY_RECRUITMENT
- liveApplication draft/validation/commit/provenance/relationships = true
- commitMode = CORE
- qaFaultArmed is empty.

Because qa.5 is a QA build, `setCommitMode` and `testCommitFailure` remain available. They will not be exposed in the public M9 API in stable builds.

## Gate B — Guided + Quick

Create:
1. one full **Recruit Ranger / Guided** character;
2. one full **Create Ranger / Quick** character.

Expected:
- one Actor per completed creation
- PC folder placement
- normal Skills, Traits, unrated Wises, Gear and Conditions
- Fate 1 / Persona 1
- Recruitment compatibility flags preserved
- CreationProvenance present
- M8 normalized Social Network present
- no automatic NPC creation.

## Gate C — Back / Cancel

Guided:
- advance several steps
- Back multiple steps
- change Station and dependent answers
- finish.

Expected final Ranger reflects the revised path with no stale allocations.

Start another creation and Cancel before Review.

Expected: no Actor created.

## Gate D — all Stations

Complete or fully validate representative drafts for:
- Recruit
- Scout
- Veteran
- Captain
- Lord.

Verify age bounds, Will/Health, Service budget, Wise budget and Station-dependent Trait/Specialty behavior.

## Gate E — restrictions / party context

Verify:
- duplicate Specialty is blocked
- under/over Service allocation is blocked
- missing Wises are blocked
- invalid Resources trade is blocked
- restricted Traits are blocked
- incomplete Relationships are blocked
- missing Belief/Goal/Instinct is blocked.

## Gate F — GM + player ownership

Create one Ranger as GM and one as a non-GM user with Actor-create permission.

Expected:
- GM Ranger uses normal ownership defaults
- player-created Ranger grants that creating user OWNER
- both use CORE M9 commit
- both receive provenance and M8 normalization.

## Gate G — reload persistence

Reload after creating a qa.5 Ranger.

Expected:
- Actor, embedded Items, Conditions and Gear persist
- CreationProvenance persists
- stored M8 Social Network persists
- no duplicate People/Relationships appear
- existing linked/optional NPC workflows still function.

## Gate H — existing Actor safety

Open several Rangers created before qa.4.

Expected:
- unchanged
- no synthetic `creationProvenance`
- no forced Social Network rewrite solely because qa.5 is installed
- normal sheets/imported campaign data remain usable.

## Gate I — parity guard

After at least one complete creation:

```js
game.realmGuard.core.m9.getStatus()
game.realmGuard.core.m9.history()
```

Expected:
- mismatches = 0
- commitMismatches = 0
- allParity = true
- allCommitParity = true.

## Gate J — transactional regression

The qa.4 rollback injection was already verified PASS. For qa.5, confirm normal commit history only:

```js
game.realmGuard.core.m9.commitHistory()
```

Expected successful creations show:
- authority CORE_M9
- success true
- rolledBack false
- completedPhases includes WRITE_PROVENANCE.

No additional destructive fault injection is required unless a regression is suspected.

## Gate K — release channel

Foundry must only offer qa.5 after the GitHub release ZIP exists. Update through the normal QA manifest.

Expected:
- no 404
- QA channel reports v1.10.0-qa.5
- system updates normally.

## PASS / M9 CLOSURE

qa.5 passes when Guided/Quick/Back/Cancel, all Stations, validation restrictions, GM/player creation, reload persistence, provenance, M8 normalization, Legacy Mixed compatibility, old-Actor safety, parity and gated release all pass with no gameplay regression.

After PASS, promote the identical verified codebase to **v1.10.0 STABLE** with no functional gameplay/runtime changes and mark M9 **VERIFIED / CLOSED**.
