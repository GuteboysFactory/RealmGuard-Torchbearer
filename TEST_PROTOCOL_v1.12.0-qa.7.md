# TEST PROTOCOL — v1.12.0-qa.7

## M10B.7 — Character Creation Profile Routing

**Foundry target:** v13.351  
**Stable baseline:** v1.11.0  
**Previous QA:** v1.12.0-qa.6 — M10B.6 VERIFIED / CLOSED

### Gate A — Boot / release contract
- Install/update to v1.12.0-qa.7.
- World opens without startup error.
- Rules Profile Management opens.
- Existing Ranger and NPC sheets open.
- Console reports M10B.7 generic Profile router.

### Gate B — Creation capability snapshot
Run:

```js
const legacy = game.realmGuard.core.m10.resolveCharacterCreationPolicy("realm-guard-legacy-mixed");
const strict = game.realmGuard.core.m10.resolveCharacterCreationPolicy("realm-guard-strict");
const mg1e = game.realmGuard.core.m10.resolveCharacterCreationPolicy("mg1e");
console.log({legacy, strict, mg1e});
```

Expected:
- Legacy → Creation profile realm-guard-legacy-mixed v4; familySemantics false; unrated Wises; Legacy Enemy house rule available.
- Strict → Creation profile realm-guard-strict v1; familySemantics true; rated Wises; Strict Mentor/Enemy validation; house rule disabled.
- MG1E → Rules Profile v8 / Creation profile v1; FOUNDATION_ONLY; non-selectable; non-live; rated Wises; LOOSE inventory; no automatic NPC creation.

### Gate C — Legacy Mixed Recruitment regression
Representative Guided Recruitment:
- all existing Realm Guard steps and current UX remain available
- Wises remain unrated
- Servants-of-the-Enemy house-rule control remains available
- CORE M9 creates the Ranger normally
- CreationProvenance remains written
- CORE M8 relationship normalization remains intact
- no new duplicate Items/relationships

### Gate D — Strict Realm Guard Recruitment regression
Switch to Strict and reload:
- rated Wises remain calculated and provisioned
- Strict Enemy people restriction remains enforced
- Scout/Veteran older-Mentor rule remains enforced
- Captain/Lord Greybeard-Mentor rule remains enforced
- Strict Conditions/LOOSE inventory plan remains unchanged
- successful Recruitment commits through CORE M9

### Gate E — Generic CORE M9 routing
With Legacy active, `game.realmGuard.core.m9.profile().id` resolves Legacy.
With Strict active, it resolves Strict.
- profile selection follows active Rules Profile
- no direct Strict identity branch is required in CORE M9
- stale Legacy QA commit override cannot bypass active-profile policy

### Gate F — MG1E source Creation foundation
Use the M10 API to inspect/create an MG1E draft.

Verify source contracts:
- Guard Ranks: Tenderpaw / Guardmouse / Patrol Guard / Patrol Leader / Guard Captain
- rank-owned age / Will / Health
- base Nature 3 plus Mouse Nature questions
- hometown Skill + Trait grant
- check-count Skill/Wise construction; starting cap 6
- rated Wises
- rank-owned Resources/Circles bases and Recruitment modifiers

### Gate G — MG1E group / relationship rules
Verify representative validation:
- second Patrol Leader only under the four-player / two-Tenderpaw exception
- Guard Captain requires group approval and remains unique
- Tenderpaw Mentor must resolve to a current player character
- experienced-character Mentor Oldfur rule is represented
- Friend and Enemy records remain Person/Relationship planning, not automatic NPC Actors

### Gate H — MG1E Traits / cloak / drives / gear / rewards
Verify:
- Recruitment-answer Trait restrictions are represented
- Tenderpaw has no starting cloak
- non-Tenderpaw cloak is represented
- Belief / Goal / Instinct are represented
- source weapon list includes Hook and Line
- inventory policy = LOOSE
- Fate 1 / Persona 1

### Gate I — MG1E zero-write shadow safety
Build MG1E review / commit plan / preview only.
Expected:
- liveMutation false
- transaction.liveExecution false
- provenanceWrite false
- relationshipWrite false
- all preview operations disabled
- no Actor/Item/relationship/world-setting mutation

### Gate J — Provenance / round-trip safety
Legacy → Strict → Legacy with reload:
- existing characters unchanged
- old CreationProvenance unchanged
- relationship/social data unchanged
- inventory placement metadata preserved
- no conversion to/from MG1E occurs

### Gate K — Recruitment presentation routing
Legacy and Strict Recruitment presentation should remain visually/functionally equivalent to qa.6, but:
- Mentor/Enemy/Wise presentation is driven by Creation capabilities
- no visible regression in validation copy, controls, scrolling or review page

### Gate L — Release / channel
- GitHub release tag = 1.12.0-qa.7
- realm-guard.zip + system.json published
- QA channel manifest points to qa.7
- download URL points to qa.7

## PASS gate

M10B.7 is FULL PASS only when Gates A–L pass in Foundry VTT 13.351. MG1E must remain FOUNDATION_ONLY / non-selectable / non-live throughout this QA.
