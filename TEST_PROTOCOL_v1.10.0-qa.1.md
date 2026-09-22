# v1.10.0-qa.1 — M9 Generic Character Creation Foundation / Shadow QA

**Foundry target:** 13.351  
**GOLD fallback:** v1.9.0  
**Gameplay change:** NONE INTENDED  
**Live Creation authority:** Legacy Recruitment 2.0

## Gate A — install / baseline
- Install v1.10.0-qa.1 over a copy of the verified v1.9.0 world.
- World opens with no console-breaking errors.
- System id remains `realm-guard`.
- Existing Rangers/NPCs/Items/Scenes/Journals remain intact.

## Gate B — M9 foundation status
In console run:

```js
game.realmGuard.core.m9.getStatus()
```

Expected:
- phase = M9
- mode = SHADOW_ONLY
- authority = LEGACY_RECRUITMENT
- liveApplication = false
- profileId = realm-guard-legacy-mixed
- capabilities include CreationDraft, CharacterCreationProfile, CreationValidator, CreationCommitPlan and CreationProvenance.

## Gate C — Guided Recruitment parity
Create one Ranger through **Recruit Ranger** and complete all 11 steps.

Expected:
- UI/workflow is unchanged from v1.9.0.
- Ranger is created exactly once.
- Skills, Traits, Wises, Resources/Circles, Fate/Persona and starting Gear behave as before.
- Relationship NPC review remains optional/GM-controlled.
- Console has no M9 parity mismatch warning.

Then run:

```js
game.realmGuard.core.m9.getStatus()
game.realmGuard.core.m9.history()
```

Expected:
- at least one observation
- mismatches = 0
- latest parity = true.

## Gate D — Quick Recruitment parity
Create a second Ranger through **Create Ranger**.

Expected:
- same rules, reduced explanatory text
- no M9 parity mismatch
- no duplicate Actor or Item creation.

## Gate E — Back / Cancel regression
- Start Recruitment, advance several steps, use Back, change Station/answers, then continue.
- Start another Recruitment and Cancel before Review.

Expected:
- current Legacy behavior remains intact
- Back changes the eventual Ranger as expected
- Cancel creates no Actor.

## Gate F — party restriction regression
Attempt to choose an already-used Specialty.

Expected:
- current Legacy unique-Specialty validation still blocks it.
- M9 remains shadow-only and does not override the UI.

## Gate G — M8 regression
On a newly created Ranger verify:
- structured Recruitment relationships are present
- Relationships tab still uses M8 normalized/fallback data
- optional Create NPC / link behavior remains intact
- no NPC is created automatically.

## Gate H — no unintended CORE mutation
Inspect a shadow event's `commitPlan`.

Expected:
- `kind = CreationCommitPlan`
- `liveMutation = false`
- provenance preview contains profile id/version
- no new `creationProvenance` flag is committed to the Ranger in qa.1.

## PASS
qa.1 passes when Legacy Recruitment remains the only live creation authority, Guided + Quick produce normal v1.9.0-compatible Rangers, M9 shadow parity reports zero mismatches for representative full creations, M8 remains intact and existing campaign data is untouched.
