# M10B.7 Read-Only Audit — Character Creation Profile Routing

**Audit date:** 2026-09-28  
**Foundry target:** 13.351  
**Stable baseline:** v1.11.0  
**Current verified QA:** v1.12.0-qa.6  
**Audit type:** READ ONLY / NO GAMEPLAY CHANGE / NO PROFILE ACTIVATION

## 1. Audit conclusion

The next bounded M10B increment should be:

> **M10B.7 — Character Creation Profile Routing**

CORE M9 already supplies the generic Character Creation engine and transactional Foundry commit infrastructure. The remaining architectural debt is profile selection and source ownership around that engine.

M10B.7 should therefore **reuse CORE M9** and move Creation away from binary Legacy-vs-Strict identity checks toward the same generic Rules Profile routing pattern already used by M10B.3–M10B.6.

Mouse Guard 1E remains `FOUNDATION_ONLY`, non-selectable and non-live throughout this increment.

## 2. Source basis

Canonical project architecture:

- CORE-A12 classifies Character Creation workflow infrastructure as HARD CORE.
- Starting rules/content are profile-owned.
- Creation uses Draft → Validate → Review → Commit.
- Relationships route through CORE M8.
- Gear routes through the profile inventory policy.
- Drives route through the session/drive domain.
- Creation Provenance records profile identity/version and derivation.

Mouse Guard RPG 2008 / 1E Recruitment establishes a distinct MG1E creation profile with:

- five Guard ranks: Tenderpaw, Guardmouse, Patrol Guard, Patrol Leader, Guard Captain
- rank-owned age / Will / Health values
- patrol/group rank constraints
- base Nature 3 plus three Mouse Nature questions
- hometown packages granting one Skill and one Trait
- check-based Skill construction; checks + 1 = starting rating; starting cap 6
- rank-dependent Natural Talent / Guard experience / Wise budgets
- rated Wises
- Resources and Circles starting values plus recruitment questions
- MG1E Trait selection
- Parents / Senior Artisan / Mentor / Friend / Enemy relationships
- Tenderpaw cloak restriction
- Belief / Goal / Instinct
- loose starting Gear
- starting Fate 1 / Persona 1

These rules are not interchangeable with Realm Guard Recruitment. Realm Guard Strict continues to use Realm Guard v1.6 explicit Recruitment rules with MG1E inheritance only where Realm Guard does not override.

## 3. Current implementation inventory

### CORE M9 — good foundation, keep

Existing CORE M9 already provides:

- `CharacterCreationProfile`
- `CharacterCreationEngine`
- draft state
- step validation
- `CreationPartyContext`
- Review
- Commit Plan
- transactional Foundry commit
- rollback/fault infrastructure
- Creation Provenance
- CORE M8 relationship normalization

No replacement creation engine is needed.

### Existing live profiles

- `realm-guard-legacy-mixed` has its own live Creation profile.
- `realm-guard-strict` has its own source-correct Realm Guard Strict Creation profile.
- Strict creation is live through CORE M9 only while Strict is active.

### Remaining binary routing debt

Current Creation still contains profile-identity routing that M10B must remove:

1. `module/m9-creation-shadow.mjs`
   - imports Legacy and Strict Creation profiles directly
   - chooses profile/engine with `isStrictRealmGuard()`
   - QA parity/status also branches on Strict identity

2. `module/recruitment.mjs`
   - Strict-only Mentor UI fields and validation are selected with `isStrictRealmGuard()`
   - Enemy people/house-rule UI is selected with `isStrictRealmGuard()`
   - Wise review text switches on `isStrictRealmGuard()`

3. `module/m10-strict-character-creation.mjs`
   - historical Strict API still owns its own engine/status and checks `isStrictRealmGuard()`

4. `module/m10-profile-service.mjs`
   - Creation status/write flags still identify Strict directly.

This is now the largest remaining binary profile-routing block in ordinary character lifecycle code.

## 4. Missing MG1E Creation foundation

The MG1E Rules Profile currently declares only a skeletal Creation domain:

- mode = MG1E
- liveAuthority = NONE

There is no source-owned MG1E `CharacterCreationProfile` object yet.

Therefore the current system can explain that MG1E has Recruitment, but cannot yet resolve a complete MG1E Creation contract through CORE M9.

M10B.7 should fill that gap without making MG1E selectable.

## 5. Proposed M10B.7 implementation

### 5.1 MG1E foundation version

Advance MG1E Rules Profile:

> **v7 → v8**

Keep metadata:

- `foundationOnly: true`
- `selectable: false`
- `supported: false`
- `liveRuleAuthority: false`

### 5.2 New MG1E source Creation profile

Add a source-owned profile such as:

`module/profiles/mg1e-creation.mjs`

It should encode, at minimum:

- Guard Rank dimension and source values
- age / Will / Health tables
- patrol rank constraints
- Mouse Nature questionnaire and restrictions
- hometown OriginPackages
- Skill/Wise check budgets and CHECKS_PLUS_BASE resolver
- starting cap 6
- rated Wise provisioning
- Resources/Circles bases and recruitment modifiers
- Trait allocation/restrictions
- Mentor/Friend/Enemy relationship rules
- Tenderpaw cloak rule
- B/G/I
- loose Gear
- Fate 1 / Persona 1
- profile/version provenance

This profile is shadow/read-only under M10B.7.

### 5.3 Generic Creation policy/router

Add a generic provider such as:

`module/m10b-character-creation.mjs`

Responsibilities:

- resolve Creation policy from any Rules Profile
- resolve the correct `CharacterCreationProfile`
- expose generic status/snapshot APIs
- carry source-owned presentation/validation capability flags
- remain free of direct Actor/Item/world writes

### 5.4 CORE M9 routing

Refactor `module/m9-creation-shadow.mjs` so active Creation profile/engine comes from the active Rules Profile instead of `isStrictRealmGuard()`.

Required live behavior after refactor:

- Legacy Mixed → existing Legacy Creation profile
- Strict Realm Guard → existing Strict Creation profile
- MG1E → resolvable in shadow/foundation mode only; never active/selectable in qa.7

CORE M9 remains the creation authority; only profile selection changes.

### 5.5 Recruitment UI

Replace Strict identity branches in `module/recruitment.mjs` with Creation capabilities such as:

- mentor validation mode
- allowed Enemy peoples/types
- Enemy house-rule availability
- Wise mode/rating presentation
- profile-specific relationship fields

This is a routing refactor, not a redesign.

Legacy and Strict visual/live behavior must remain unchanged.

### 5.6 Compatibility wrapper

Keep `m10-strict-character-creation.mjs` as a compatibility API if existing QA/tools consume it, but delegate policy/profile resolution to the generic M10B.7 provider.

## 6. Preservation rules

M10B.7 must not:

- activate MG1E
- change the active world profile
- automatically create/migrate Actors
- rewrite existing CreationProvenance
- delete or normalize Legacy/Strict creation data
- guess conversion of old characters into MG1E characters
- create NPC Actors automatically from relationships
- alter CORE M9 transaction/rollback semantics
- alter Realm Guard Strict Recruitment source rules
- alter Legacy Mixed Recruitment behavior

## 7. Proposed qa.7 live gate

A qa.7 build should not be promoted until all of the following are green:

1. Boot/reload and profile capability snapshots.
2. Legacy Mixed Recruitment full representative regression.
3. Strict Realm Guard Recruitment full representative regression.
4. MG1E v8 resolves a complete CharacterCreationProfile in foundation mode.
5. MG1E Guard Rank / age / Will / Health / group constraints match source.
6. MG1E Nature questions, hometown grants and Skill/Wise check construction match source.
7. MG1E Resources/Circles, Trait and relationship constraints match source.
8. MG1E Tenderpaw cloak restriction, B/G/I, Gear and Fate/Persona grants match source.
9. MG1E preview/draft/review/commit-plan performs zero live writes.
10. Creation Provenance reports the resolved profile id/version correctly.
11. Legacy ↔ Strict round-trip remains data-safe with no automatic conversion.
12. Release/channel verification succeeds.

## 8. Explicitly deferred from M10B.7

Do not combine these into the Creation patch:

- MG1E Natural Order live/generic comparison planners
- generic Rules Reference for MG1E
- MG1E selectable activation
- stable MG1E promotion
- visual Recruitment redesign

Those are separate bounded increments.

## 9. Likely next increment after qa.7

If M10B.7 passes, the next architectural slice should be:

> **M10B.8 — Comparative Scale / Natural Order + generic Rules Reference routing**

Reason:

- MG1E already declares Natural Order, but the current executable comparison planner is Realm Guard-specific Scale of Might.
- the current detailed Rules Reference is also Strict Realm Guard-specific.

After M10B.7 and M10B.8, the major source domains required for an eventual MG1E selectable QA activation should be profile-routed rather than binary Strict-vs-Legacy code.

## 10. Audit result

**READY FOR IMPLEMENTATION as v1.12.0-qa.7.**

No runtime code was changed by this audit.
