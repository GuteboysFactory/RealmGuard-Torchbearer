# M10B.9 Read-Only Audit — MG1E Foundation Closure / Activation Readiness

**Audit date:** 2026-09-29  
**Foundry target:** 13.351  
**Stable baseline:** v1.11.0  
**Verified QA:** v1.12.0-qa.8 — M10B.8 FULL PASS / VERIFIED / CLOSED  
**Audit type:** READ ONLY / NO PROFILE ACTIVATION / NO GAMEPLAY CHANGE / NO DATA MIGRATION

## 1. Audit conclusion

Mouse Guard 1E is now substantially complete as a **source-owned rules foundation**, but it is **not yet ready to become selectable**.

M10B.3 through M10B.8 have removed the major rules-domain ownership debt. The remaining work is no longer a missing rulebook foundation problem; it is a **live-routing / activation-boundary problem**.

The repository already has profile-owned MG1E policy for:

- tests / advancement foundations
- Wises / Traits / Help / Nature
- Conditions / Recovery
- Inventory / Conflict
- Session / Circles / Progression
- Character Creation profile data and validation
- Natural Order / Comparative Scale
- Rules Reference

The remaining blockers are concentrated in a small number of live surfaces that still assume either:

1. **Strict Realm Guard** is the only source-owned live profile, or
2. **Legacy Mixed** is the only non-Strict live profile.

Therefore the correct next implementation is **not immediate MG1E activation**.

> **MG1E remains FOUNDATION_ONLY / non-selectable / non-live after M10B.9.**

## 2. Closed foundation domains

### 2.1 M10B.3 — Wises / Traits / Help / Nature

Already profile-routed:

- rated Wise policy
- I Am Wise
- typed Teamwork
- MG1E Trait level semantics
- Nature label / descriptors
- Tap Nature / Double-Tap Nature
- profile capability routing in normal roll surfaces

Status: **foundation complete for activation purposes**, subject to the Item Sheet blocker in section 4.2.

### 2.2 M10B.4 — Conditions / Recovery

Already profile-routed:

- MG1E Sick vs Strict Strained
- active Condition set
- recovery order
- Will / Health recovery
- recovery Help restrictions
- GM Turn Check economy
- dormant-condition preservation

Status: **activation-ready rules policy**.

### 2.3 M10B.5 — Inventory / Conflict

Already profile-routed:

- LOOSE vs STRUCTURED inventory policy
- action-set weapon scope
- unarmed default
- action skill tables
- starting Disposition tables
- armor / weapon / Disarm / Weapons of Wit policy
- live Conflict UI uses generic family policy in most paths

Status: **mostly activation-ready**, with one remaining direct Strict identity branch documented in section 4.3.

### 2.4 M10B.6 — Session / Circles / Progression

Already profile-routed:

- Players' Turn / Checks
- End Session validation
- Circles known Contact +1D
- Enmity Clause
- Levels / Talents enablement
- lifetime spend progression
- Pass/Fail advancement
- Beginner's Luck learning

Status: **activation-ready rules policy**.

### 2.5 M10B.7 — Character Creation

Already present:

- source-owned MG1E CharacterCreationProfile
- Guard Rank / hometown / Nature / skills / Wises / Traits / relationships / gear rules
- generic CORE M9 routing
- source validation
- read-only commit planning
- provenance model

However MG1E creation is intentionally still:

- `liveAuthority: NONE`
- `commitAuthority: NONE`
- `FOUNDATION_SHADOW_ONLY`
- transaction `liveExecution: false`
- relationship `liveWrite: false`
- condition / skill provisioning plan-only

Status: **foundation complete, live creation NOT activation-ready**.

### 2.6 M10B.8 — Comparative Scale / Rules Reference

Already profile-routed:

- MG1E Natural Order
- Fighter / Hunter outcome planner
- MG1E Militarist thresholds
- Scientist guided route
- Strict Scale of Might compatibility wrapper
- generic Rules Reference provider
- source isolation
- zero-write safety

Status: **activation-ready as a guided/read-only rules surface**. Live Conflict blocking is not required as a prerequisite because Strict Scale of Might is also intentionally guided/manual rather than universally enforced.

## 3. Direct identity branches that are intentional and may remain

The following direct ids are not activation debt by themselves:

- `module/m10-strict-*.mjs` compatibility wrappers
- Strict-specific conversion deltas
- MG1E-specific conversion deltas
- `core-baseline.mjs` defaulting new/uninitialized worlds to Legacy Mixed
- source-owned profile registry entries
- source-specific profile definitions
- dormant Strict / Legacy data preserved on Actors and Items
- explicit alternate/reference data that is not active policy

These are profile/content boundaries, not live-routing shortcuts.

## 4. Remaining activation blockers

### 4.1 HARD BLOCKER — Activation service only accepts Legacy Mixed and Strict

File:

- `module/m10-profile-activation.mjs`

Current behavior:

- `STRICT_PROFILE_ID` is the only non-Legacy target
- `switchRulesProfile()` hard-whitelists Legacy Mixed + Strict
- activation status is Strict-centric

This is correct while MG1E is non-selectable, but MG1E cannot become selectable until activation is driven by generic profile metadata:

- `selectable`
- `supported`
- `activationState`
- conversion-preview requirement
- explicit GM confirmation

**Required before activation:** replace the two-profile whitelist with a generic supported-profile gate while keeping MG1E metadata non-selectable until the final activation slice.

### 4.2 HARD BLOCKER — Rated Wise Item editor is Strict-only

Files:

- `sheets/item-sheet.mjs`
- `templates/item/item.hbs`

Current behavior:

- imports `isStrictRealmGuard()`
- Wise rating/learning synchronization runs only when Strict is active
- rated Wise editor renders only for Strict
- UI text says “Strict Realm Guard only”

MG1E is also a rated-Wise profile.

If MG1E were activated today:

- existing rated Wises would still work in profile-routed roll logic
- but the normal Item Sheet would not expose the rated-Wise editor
- editing a Wise rating would not update Pass/Fail requirements through this sheet path

**Required before activation:** drive the Wise editor and learning synchronization from `presentation.showRatedWiseControls` / rated-Wise capability rather than Strict identity.

### 4.3 HIGH BLOCKER — Conflict Nature choice contains a direct Strict identity branch

File:

- `module/conflicts.mjs`

Current branch:

- descriptor-Nature permission includes a direct check for `profileId === "realm-guard-strict"`

Most Conflict action routing is already generic through `familyConflictActionSkills()`, but this branch still treats Strict as the only profile with descriptor-based Nature substitution beyond explicitly routed Nature actions.

**Required before activation:** make descriptor-based Nature availability an explicit profile capability / conflict policy, not a Strict id check.

MG1E and Strict may then define their own source-correct policy without identity branching in the live Conflict UI.

### 4.4 HARD PRESENTATION BLOCKER — Manual still uses a binary Strict-vs-Legacy model

File:

- `module/manual.mjs`

Current behavior:

- `sourceProfileActive = activeId === "realm-guard-strict"`
- every non-Strict active profile is described as the active Legacy Mixed workflow
- the main profile-reference button opens Strict unless Strict is already active
- MG1E has a separate preview button, but the active-profile flow is not generic

If MG1E were activated today, the Manual would misidentify its live rules context.

**Required before activation:** route active source-profile presentation and “Open Profile Rules” to the actual active profile id.

The embedded long-form Legacy Mixed manual may remain as compatibility documentation.

### 4.5 HARD BLOCKER — MG1E Character Creation is still shadow-only

Files:

- `module/profiles/mg1e-creation.mjs`
- `module/m10b-character-creation.mjs`
- `module/recruitment.mjs`

The MG1E source profile is detailed and validated, but its commit contract is deliberately non-live:

- no Actor write authority
- no embedded Item write authority
- no Condition provisioning authority
- no relationship write authority
- no provenance write authority

In addition, the existing Recruitment guide / legacy compatibility projection still contains Realm Guard / Dúnadan / Legacy Mixed-specific copy and fallback structures.

The generic CORE M9 engine is reusable. A second creation engine is not needed.

**Required before activation:**

1. promote the MG1E creation commit contract to **ready-when-active**, while still unreachable during foundation mode;
2. provide a source-owned MG1E Recruitment presentation/adaptor for the existing CORE M9 steps;
3. provision MG1E rated Wises, Skills, Traits, Sick Condition set, LOOSE Gear metadata and relationships through the existing transactional commit adapter;
4. write MG1E CreationProvenance;
5. retain compensating rollback;
6. keep old Actors untouched.

This is the largest remaining functional blocker.

### 4.6 MEDIUM BLOCKER — Profile Management is still a Strict/Legacy switch UI

Files:

- `module/profile-management-menu.mjs`
- `templates/apps/profile-management.hbs`

Current behavior is correct for qa.8:

- MG1E preview exists
- MG1E activation button does not exist
- switch controls explicitly model Strict vs Legacy

Before MG1E activation, this should become a generic available-profile presentation rather than adding another bespoke `switchMg1e` branch.

**Required before activation:** profile list + generic supported switch action, while MG1E remains disabled until its metadata gate is promoted.

### 4.7 MEDIUM BLOCKER — M10 status/registry observability remains Strict-centric

Files:

- `module/m10-profile-service.mjs`
- `module/rules-profile-service.mjs`

Examples:

- preview/status fields such as `strictRulesLive`, `strictCreationLiveCommit`
- write/readiness reporting derived from `isStrictRealmGuard()`
- Rules Registry UI exposes a Strict conversion button but no generic target routing
- phase copy still says M10B.8 / MG1E foundation-only

These do not currently alter gameplay, but they would report misleading state after MG1E activation.

**Required before activation:** generic active-profile readiness/status surfaces.

### 4.8 LOW / CLEANUP — Remaining Realm Guard-specific Recruitment compatibility copy

File:

- `module/recruitment.mjs`

Legacy fallback/projection code still correctly contains:

- Legacy Mixed provenance
- unrated Wise descriptions
- Realm Guard Recruitment descriptions
- Dúnadan-specific guide copy

This code is valid while it is strictly the Legacy compatibility path.

It becomes a problem only if the same presentation/fallback is reused for active MG1E.

**Required:** keep it isolated as Legacy/Realm Guard compatibility content and do not use it as MG1E live presentation.

## 5. Activation readiness matrix

| Area | MG1E foundation | Generic live router | Activation-ready |
|---|---|---|---|
| Tests / ordinary / versus | YES | YES | YES |
| Pass/Fail advancement | YES | YES | YES |
| Wises runtime | YES | YES | **NO — Item editor Strict-only** |
| Traits / Help | YES | YES | YES |
| Nature | YES | YES | **NO — one Conflict Strict id branch** |
| Fate / Persona | YES | shared CORE path | YES |
| Conditions / Recovery | YES | YES | YES |
| Inventory | YES | YES | YES |
| Conflict action/disposition policy | YES | YES | **MOSTLY — Nature branch remains** |
| Session / Checks | YES | YES | YES |
| End Session | YES | YES | YES |
| Circles / Enmity | YES | YES | YES |
| Progression suppression | YES | YES | YES |
| Character Creation rules | YES | YES | **NO — shadow-only commit/UI** |
| Natural Order | YES | generic read-only | YES as guided rules surface |
| Rules Reference | YES | YES | **NO — Manual active-profile routing still binary** |
| Conversion preview | YES | YES | YES |
| Profile activation | metadata only | **NO** | **NO** |
| Profile Management UI | preview only | Strict/Legacy switch | **NO** |

## 6. Explicit M10B.9 readiness verdict

### Foundation completeness

**PASS.**

The MG1E source foundation is sufficiently complete to stop adding broad new rules domains.

### Live-routing closure

**NOT YET PASS.**

A small set of direct Strict/Legacy assumptions remains in live/presentation surfaces.

### Activation readiness

**NOT READY.**

MG1E must remain:

- `foundationOnly: true`
- `selectable: false`
- `supported: false`
- `liveRuleAuthority: false`

No activation metadata should be promoted by this audit.

## 7. Recommended next bounded implementation

The next implementation should be a **consolidated closure package**, not a chain of tiny one-file patches:

> **M10B.10 — MG1E Live Readiness Closure**

Recommended scope:

1. genericize profile activation eligibility internally, but keep MG1E non-selectable;
2. generic rated-Wise Item Sheet/editor routing;
3. remove the direct Strict identity branch from Conflict Nature choice;
4. make Manual/Profile Rules Reference routing active-profile generic;
5. make Profile Management / M10 status / Registry readiness reporting profile-generic;
6. promote the MG1E CORE M9 creation contract from shadow-only to **ready-when-active**;
7. add source-owned MG1E Recruitment presentation over the existing CORE M9 engine;
8. keep all MG1E live writes gated by active profile authority, which remains unreachable because MG1E stays non-selectable in M10B.10;
9. add simulated-MG1E-active smoke tests without exposing a real switch;
10. prove zero migration of existing Actors / Items.

This package should leave the repository in a state where the only remaining step is the actual activation gate.

## 8. Proposed M10B.10 PASS gate

M10B.10 should be FULL PASS only when:

- no live Sheet / Conflict / Manual path requires `isStrictRealmGuard()` to distinguish MG1E-family behavior;
- rated Wise editing works under simulated MG1E active state;
- MG1E Conflict Nature options are profile-owned;
- Manual opens the active MG1E Rules Reference under simulated active state;
- MG1E CORE M9 creation can build and execute a complete transactional commit under simulated active authority;
- MG1E creation provisions rated Wises, MG1E Conditions and LOOSE Gear correctly;
- rollback removes a partially created MG1E Actor on critical failure;
- no existing Actor/Item is migrated;
- Legacy Mixed and Strict regressions remain green;
- real profile activation still rejects MG1E because metadata remains non-selectable.

## 9. Activation slice after closure

Only after M10B.10 passes should the project consider:

> **M10B.11 — MG1E Selectable QA Activation**

That later slice may:

- advance the MG1E profile version again
- set an explicit QA activation state
- make MG1E selectable but not stable
- require conversion preview + explicit GM confirmation
- use the generic profile-switch service
- verify Legacy → MG1E → Legacy → MG1E round-trip across reload
- verify multiplayer refresh
- preserve all dormant profile-specific data
- perform no automatic Actor conversion
- keep Strict supported and reversible

Stable MG1E support would still require a later stable-candidate gate.

## 10. M10B.9 result

**AUDIT COMPLETE.**

**MG1E FOUNDATION = CLOSED ENOUGH FOR LIVE-READINESS WORK.**  
**MG1E ACTIVATION = NOT YET READY.**  
**NEXT = M10B.10 — MG1E Live Readiness Closure.**

No runtime code, profile metadata, Actors, Items, Journals or world settings were changed by this audit.
