# M10D.18 — Full CORE Re-Audit / Package A (working branch)

**Branch:** `qa/m10d18-full-reaudit-package-a`  
**Base:** `433cbb4b4261a9dad6ba2ba10744008ea923f47a` (`v1.13.0-qa.29`)  
**Status:** IN PROGRESS / NOT RELEASED. Do not treat this branch as a completed 5-domain re-audit.

## Current closure checklist — 2026-10-12

This section is the current completion plan. Later sections preserve chronological findings; their older NEXT/remaining statements are not separate new work packages. Package A remains IN PROGRESS / NOT RELEASED. The completed current-document adapters are engineering progress, not a completed re-audit.

**Verified baseline:** source implementation through `5298dea7c672b5d5e67d2b47e938bc38a539ff21`, recorded head `6bb77e8dcde9e837e06b81e505347f08da9026a1`; [CI run 38290798764](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38290798764) SUCCESS, 152/152 smoke suites, ZIP 21/21, syntax/preflight and frozen manifest/channel checks PASS. Foundry v13.351 combined acceptance: NOT RUN. Full domain certifications: 0/14.

### Definition of done and fixed scope

Package A covers Tests, Help, Wises, Nature and Abilities/Skills, with Resources/Conditions/Inventory/Advancement boundaries needed for those flows. Completing Package A does not automatically complete the other nine domain audits or resume M11. Its five source domains cannot be certified by CI alone. All five gates below must be supported by evidence for the FINAL tested candidate before declaring Package A complete; required cases cannot silently be dropped to make a gate green.

| Gate | Current status | What must finish | Evidence required to close |
|---|---|---|---|
| G1 — One integrated read-only test chain | OPEN: integrated Skill/BL chain implemented and regression verified; runtime/exception acceptance pending | Join current participant/equipment facts, base dice, Wise/Fate events and acting/helper progress under one test identity/context. The integrated API now supports observed Help/BL and derives progression from the reward-final outcome; older standalone adapters retain their narrower scopes. | Combined regression: source-bound acting Skill/BL and actual helper/equipment IDs; original FAIL changed to PASS by validated reward events; actor mark/BL attempt and Helper Synergy all derive from the SAME final result; contradictory test/source/cost/counter/result inputs rejected; no writes/RNG/spends. Calling three independent previews is not sufficient. |
| G2 — Complete five-domain source/exception and model review | OPEN: targeted cases/source tables verified, full rule closure missing | Finish one rule-to-code-to-test matrix for all five Package A domains using uploaded DH/SG. Cover or explicitly resolve Nature/Instinct, Heroic/class/stock benefits, Versus/ties/conflict/series boundaries, equipment/crafting/container exceptions and advancement lifetime. Resolve the absent Will/Health P/F counter representation and supply-unit/item semantics. | Every required rule/exception has a source page, implemented behavior or reviewed safe boundary, regression and applicable runtime case. Any rejected/out-of-scope required rule still blocks full domain certification; reject-only documentation must not be relabeled complete parity. Missing counters cannot be invented as 0 or inferred from current rating. |
| G3 — Historical/test identity provenance | OPEN: current observations only; old data unavailable | Establish the prospective evidence contract/trust model and obtain actual roll-time Actor/Item/owner/condition/resource/counter and per-die event records, including one test ID and resource chronology. Legacy chat creation currently stores HTML without native Roll records. | Reviewed prospective capture path owned by Legacy's existing live authority, plus a read-only CORE consumer; native base/reward result records, target/parent IDs, author/role scope, observed start balances and spending events tied to the same test; tamper/replay/incomplete/unauthorized rejection tests. Clearly state what the trust model proves; client flags/timestamps/GM declarations cannot alone set authentication=true. Past records without original data are UNRECOVERABLE FROM CURRENT EVIDENCE and must be retested prospectively, not reconstructed from HTML/current holdings. No capture/storage change is implemented by this checklist. |
| G4 — One consolidated Foundry v13.351 A-D acceptance | NOT RUN: real runtime evidence needed | After the required candidate code/source/evidence cases are ready, execute the whole consolidated protocol on an isolated copy of the test World using an unpublished candidate from an exact Git SHA. Include GM/player, private messages, real Legacy control rolls, source exceptions, rerolls/resources, participant/equipment/progress, reload and no-write checks. | Exact Foundry build, installed candidate source SHA/artifact hash, separate published QA.29 control, complete A-D PASS/FAIL, actual Actor/message/Item IDs and before/after read-only snapshots, console errors and multiplayer results. Earlier published P2/P3 confirmations and mocks do not certify this candidate. Any diagnostic run before G1-G3 completion remains partial. |
| G5 — Final reproducibility / frozen safety / protected release decision | Baseline automated checks PASS; FINAL gate OPEN | Re-run all required checks on the final candidate AFTER G1-G4; review all final exceptions and evidence, then apply the existing protected release requirements. | Final-head CI, complete smokes/syntax/preflight, ZIP integrity/manifest equality/dependencies, unchanged stable/QA/manifests/READY unless a later protected release step is actually authorized, verified rollback/control comparison and reviewed G1-G4 evidence. No auto-merge, version bump, tag or release from this checklist. |

### Immediate execution order

1. **Next bounded code task: G1.** One shared context and final-result chain, with the combined regression described above. Keep all adapters shadow/read-only and all unauthenticated fields truthful. This replaces further unrelated small planner additions.
2. Complete G2's single source/exception matrix and G3's evidence contract alongside the G1 chain. A historical proof cannot be supplied by more current-state readers. Any required model/capture change needs its own concrete reviewed design and tests before implementation; keep Legacy as sole writer and never grant CORE live authority.
3. Build an unpublished FINAL candidate and perform G4 in an isolated test environment. Do not change published QA/stable to obtain permission to test. Label all diagnostics and manual fixture preparation separately from read-only adapter execution.
4. Only after G1-G4 evidence is complete, finish G5. Until then keep Draft PR #14, M11 PAUSED, kill switch ENGAGED and 0/14 FULLY_REAUDITED.

### Limits on the completion claim

There is no defensible completion percentage or ETA from the smoke count. G1/G2 are repository/source work; G3 also needs a trustworthy prospective data path and test records; G4 needs actual Foundry execution evidence. The current snapshots cannot authenticate past state or recover missing original dice/resource events. No protected release or domain closure is authorized by the current evidence.

### Test-before-release ordering correction

The previous protocol headline said not to test before a published QA release, while Package A blocked release pending full gates. That was a circular dependency. The corrected order is: scoped source/code/evidence work → isolated unpublished candidate → full Foundry acceptance → final checks → protected release decision. The manifest may still display QA.29 because versions/channels are frozen; record the installed SOURCE SHA and ARTIFACT HASH so a candidate is never mistaken for the published QA.29 build.

## Frozen safety contract
- Stable **v1.12.0** stays untouched. No changes to `channels/`, `system.json`, `release/READY`, or production data from this audit pass.
- Legacy Mixed remains sole live authority; M11 PAUSED; global kill switch ENGAGED.
- Torchbearer CORE remains read-only shadow. No Actor/Item/Journal/Setting writes or spontaneous dice rolls.
- Full domain certificates **0/14** until rule-by-rule coverage, exceptions, automated tests, and Foundry acceptance all complete.

## Source-backed Package A findings

| Domain | Sources | Verified point | Remaining gap |
|---|---|---|---|
| Tests | SG 26–35; DH 58–75 | Existing factor/versus/tie planners are read-only; BL pre-/post-halving stages already modeled | Full skill-specific factor catalogue and tie reaction sequencing parity |
| Help | SG 36–38; DH 58–59, 72–75 | **Fixed** BL Help to accept a trained matching Skill or correct linked Will/Health, explicitly reject mismatches; verify same-Ability Help and Nature descriptor route; Hungry & Thirsty group consequence | Complete suggested Help mapping, consent/ownership, GM-approved situational alternative, helper propagation and conflict edge cases |
| Wises | DH 76–78; SG 87–88 | Existing Wise plan has one use per Wise per roll, unique effects, and rerolls before Fate Luck | Validate per-die history and effects with actual roll provenance; language-Wise edge cases |
| Nature | DH 65–71; SG 25 | Existing channel/tax/recovery/retirement plans remain separate, read-only | All stock/class/condition-dependent boundaries & retirement life cycle |
| Abilities/Skills | DH 58–75, 160–176 | 33 Skills with mapped BL Ability; zero-rating guard and known-skill capacity already present | Complete 33 skill factor + suggested-help descriptions, heroic caps, equipment exceptions, advancement interplay |

### Help correction specifics
`tb2eBeginnersLuckHelpPlan` now accepts optional `sourceKind` and `targetSkillName`. When a target is provided it verifies the target Skill and linked Ability from the existing DH skill list, including Skill-source Help. Older calls without a target still return a planner, **explicitly flagged as unverified**; they are not live authorization. Generic `tb2eHelpPlan` rejects self-contradictory sources and no longer treats any kind of Help as valid for a raw Ability test. Group Hungry & Thirsty is explicitly represented without applying conditions.

### Automated QA introduced
`qa/m10d18-package-a-help-regression-smoke.mjs` covers valid and invalid Skill/Ability BL Help, rating-zero restrictions, recovery/bills exclusions, Nature, group Hungry & Thirsty and profile safety.

**Remaining requirement:** Execute entire repository smoke suite and release preflight on CI; reconcile any historical test assumptions against the source; complete full skill factors/help matrix; add five-domain parity evidence; obtain one consolidated Foundry v13.351 A/B/C/D test. Do not publish a QA release before all checks succeed.

## Proposed consolidated Foundry gates (not yet released)
A. Verify Legacy Mixed live rolls and M11/kill-switch/profile safety before/after reload.
B. Verify Tests/Help: ordinary/Versus/BL, targeted Skill Help, correct Will/Health, bad-source rejection, rating-zero and no-Help on recovery/bills.
C. Verify Wises/Nature/Abilities/Skills: Wise + aid sequencing, Nature descriptor/tax/recovery, all 33 Skill mappings and edge cases against rulebook.
D. Verify multiplayer/reload, migration/document write invariants, historical P2/P3 regressions; report console errors.


## 2026-10-11 — Package A combined implementation checkpoint

The following source-backed, read-only improvements are now included in this **draft branch**:

1. **SG 37 Helping Beginners:** Help from the exact trained Skill is legal; otherwise the correct mapped Will/Health is required. Target omission is explicitly flagged as unverified and remains a GM boundary.
2. **DH pp.160–176 Suggested Help:** all 33 core Skill entries have an explicit, source-page-labelled list of suggested helping Skills. The only non-core named helper `Smith` (for Armorer) is recorded as such. One additional appropriate GM-approved skill can be declared explicitly under SG 37 / DH 73. No actor-owned Skills are inferred.
3. **DH pp.160–176 Factor family index:** the headings for each Skill's factor table are now available for reference; **numeric choices and full context-specific factor tables remain NOT MAPPED**. These are never treated as automated Ob values.
4. **DH 72 Heroic Skill:** ordinary advancement still caps at 6. A caller must explicitly declare `heroicRatingSevenUnlocked=true` before the read-only threshold planner recognizes cap 7.
5. **DH 68 0/0 Nature:** recovery, loss and advancement planning in a retired 0/0 state is blocked. No real character data changes.
6. **DH 69 Conserving Nature:** reducing Maximum Nature returns an explicit requirement to erase logged Nature advancement, still with zero changes to documents.
7. **SG 38 Group Failure:** Hungry & Thirsty as the group alternative is represented in the Help consequence preview; no condition mutation.

9. **DH 68 Nature-zero bypass guard:** a Current Nature of 0 with positive Maximum is an unresolved tax-loss state; substitution, channel, tax, recovery and advancement previews now block until the explicit Loss procedure is resolved. All zero-write.

8. **DH 78 Language-Wise:** on a Wise change, retain the associated language only when recorded with the current level benefit. The planner now distinguishes PENDING_RECORD from FORGOTTEN, and separately blocks verbal social tests when there is no communication method; always shadow/manual.

### Consolidated safety and automation
- `qa/m10d18-package-a-help-regression-smoke.mjs`
- `qa/m10d18-package-a-skill-index-smoke.mjs`
- `qa/m10d18-package-a-five-domain-smoke.mjs`
- `.github/workflows/package-a-smoke.yml`: read-only PR smoke workflow; executes release preflight, syntax validation, all `qa/*-smoke.mjs`, and immutable channel paths guard.
- All additions are isolated to a **draft PR** and require source-based signoff. No version bump; no release tag; no Foundry smoke accepted yet.

### Remaining acceptance gaps by domain
- **Tests:** full skill factor value mapping; factors+tie/advancement precedence interactions; independent truth-table parity.
- **Help:** consent/recipient selection, all context and condition restrictions, multi-helper consequences, original SG/DH rule edge tables, runtime integration beyond planners.
- **Wises:** per-die reroll provenance, synergy resource lifecycles, all Wise effects and progress across boundary sessions.
- **Nature:** stock/class-specific descriptors and exceptional uses, rating-zero workflows, retirement lifecycle, integration with conditions and advancement.
- **Abilities/Skills:** all 33 factor value tables, per-skill exceptions, heroic target-number changes, full Beginner's Luck and advancement effect chain.
- **All five:** independent full-domain test vectors and Foundry 13.351 acceptance needed before FULLY_REAUDITED can be set. Count stays **0/14**.

### Release policy
Even if CI becomes green, **CI regression PASS is not an audit certificate**. PR stays Draft until the five-domain review is complete or explicit and traceable source limitations are accepted for the combined QA test. Stable 1.12.0, M11, kill switch and Legacy Mixed constraints remain locked.


## 2026-10-12 — Additional source-based Package A reconciliation

1. **Help acceptance / group outcomes (SG 33, 36–38):** added explicit acting-player acceptance, in-fiction relevant action and GM-confirmed relevance; ordinary Help now rejects tiebreaker contexts in all three entry routes. Instinct Help requires a *similar* Instinct (or applicable Nature descriptor), not merely that both characters happen to be acting on Instinct.
2. **Group failure (SG 38):** Hungry & Thirsty can only propagate to all helpers when it is the primary condition; it is not an arbitrary choice for an unrelated failure. Existing-condition duplicates are suppressed when confirmed for the selected condition. I Am Wise aid exempts the wise participant from failure conditions but never from twists.
3. **Environmental factors (SG 32, 34):** clear/dim/darkness and GM hindrances can be combined read-only. Dark actions require GM confirmation; factors add Ob on an independent test but subtract successes (-1s per factor) in a Versus test. No automatic environment scan or roll.
4. **Skill list and licensing boundary:** DH pp.160–176 factor *families* are mapped; full numerical tables remain unmapped, and book text is not reproduced wholesale in the public repository. Core complete parity cannot be declared from this metadata alone.
5. **New core API:** `help.participationPlan`, `help.groupOutcomePlan`, and `tests.environmentalFactorPlan`. Older APIs remain available as zero-write planners.

New smokes: `qa/m10d18-package-a-help-consent-outcome-smoke.mjs` and `qa/m10d18-package-a-environment-smoke.mjs`. CI check is required after all changes.

**Heroic progression correction implemented (DH 59,72):** A GM-confirmed unlocked benefit now extends Will/Health as well as Skills to cap 7, while explicitly unlocked TN3 changes read-only obstacle/Versus success counting. No real rolls or level benefits are granted. Full ownership/provenance and live benefit integration remain separate unverified requirements.

## Package A latest code audit scope and release boundary

New code and QA smoke additions cover Help participation and group failure (`SG 36–38`), environmental and Versus factors (`SG 32–34`), and the GM-locked Heroic Ability/Skill cap/TN exceptions (`DH 59,72`). All source-backed previews remain explicitly read-only. CI PASS, if reported, certifies syntax/regression safety only; it does **not** certify complete source-to-code parity, actor-derived entitlement or all 33 numeric factor tables.

**Outstanding barriers to closing Package A:** (1) full numeric factor source-to-planner coverage; (2) actor-backed beneficial-level provenance and per-die Wise reroll provenance; (3) life-cycle Nature/Advancement interactions and all stock edge cases; (4) multiplayer Foundry 13.351 QA. No promotion while these are unverified; historical 0/14 count remains.


## 2026-10-12 — Exact Wise die-history review (DH 77)

Added read-only `wises.deeperDiePlan`, verifying a chosen failed D6 has not already been rerolled. Inputs carry explicit die IDs, face values, prior-reroll markers and resource availability. Existing Wise reroll entry point remains backward compatible. No Fate spend, no second roll, no Actor write. New regression: `qa/m10d18-package-a-wise-die-history-smoke.mjs`.

This **does not** complete Wise parity: other reroll-effect sequencing and exact real roll-record binding remain open. It does close a specific untracked-die selection risk in shadow previews.


## 2026-10-12 — 33-Skill Numerical Source Catalogue and Consolidated Tests Integration

A new source-parsed **33/33 DH skill numerical factor catalogue** is committed as `module/m10d18-tb2e-package-a-factor-values.mjs`. It encodes page-labelled factor options from printed DH pp.160–176 as structured read-only metadata, **not verbatim rulebook pages**. One primary alternative and applicable additive categories are explicitly selected by the GM. Runtime must never assume a player owns tools, Skill benefits or situational eligibility from this catalogue.

- Core APIs: `abilities.numericalFactorStatus/Entry/ObstaclePlan/FormulaPlan`, `abilities.skillFactorPrerequisitePlan`, `tests.sourceBoundFactorPlan`.
- Source-bound mode rejects unsourced category/choice names, missing or multiple unrelated primary factors, and conflicting additive modifiers; no dice are rolled and no Actor/Item/Journal/Settings writes are made.
- **Dedicated formulas** calculate Mentor current student Nature, Rider beast Nature + selected training use, Laborer additional carrying slots, Sapper pit/material and trap level, and Scholar's source-listed scribing Ob for the highest-circle spell plus +1 per additional spell (not the spell-circle number), always from explicit GM-provided values.
- **Non-Ob pathways** remain deliberately blocked from automatic numeric Ob: Fighter/Orator/Persuader/Criminal/etc. Versus routes; Arcanist individual spells, Ritualist invocations and Lore Master spell memorization delegate to their proper source domains.
- **Skill-specific source constraints** require confirmed reading language (Scholar), loom (Weaver tapestries), vessel or crew (Sailor), higher instructor Skill (Mentor) and trained/controlled mount (Rider), without false Actor ownership inference.
- Advanced Nature stock/descriptor policy from DH pp.65, 70–71 now covers written dwarven grudge goals, group-only Merrymaking with its **suggested**, not mandatory +1 Ob, non-persuasive Demanding, GM-approved new Elven Remembering lore and alternate descriptor ownership.
- Regression coverage: `qa/m10d18-package-a-numerical-factors-smoke.mjs`, `qa/m10d18-package-a-factor-prerequisite-smoke.mjs`, `qa/m10d18-package-a-nature-descriptors-smoke.mjs`, plus full historical suite.

### Explicit remaining truthfulness boundary

**Mapping the published DH source's numerical factor options does NOT mean full end-to-end Skill or Tests parity.** The catalogue does not itself authorize a player's action, automatically evaluate all fiction/conditions/tools or resolve all spells, monsters, conflict tests, spell memorization, magic exceptions, Traits, Wise provenance, original context-dependent modifiers or real advancement. The older generic GM-factor plan is preserved for compatibility and remains an untrusted caller-supplied preview. Actor-backed provenance and complete end-to-end test sequences still need independent review, plus one combined Foundry v13.351 manual QA.

Do not release just because CI passes; keep **FULLY_REAUDITED at 0/14**, the global kill switch engaged, M11 PAUSED and stable v1.12.0 unchanged.

## 2026-10-12 — Correction to earlier provisional Wise and Scholar assumptions

**Corrected source reconciliation (DH p.77 + SG p.87):** Both `Of Course!` and `Deeper Understanding` must precede Fate Luck; Deeper additionally cannot reroll a previously rerolled die. A prior checkpoint incorrectly removed Deeper's explicit pre-Luck restriction, overlooking SG p.87. That statement is superseded. The adapters once again reject Deeper after Fate Luck, and the per-die preview also enforces non-repeated die IDs.

**DH p.172:** Scholar's multiple-spell Scribe Ob uses the **spell-specific scribing Ob** of the highest-circle spell, then adds 1 per additional spell. Spell circle itself is not an Ob. Formula now requires `highestSpellScribingObstacle` sourced from the spell's own entry. Existing tests ensure `highestSpellCircle` alone cannot yield an Ob.


## 2026-10-12 — Integrated source-factor guard and five-component GM scenario preview

**Rule authority:** DH p.59 (Beginner's Luck pre-/post-halving); DH pp.73–75 and SG p.27 (GM chooses applicable primary / + factors and equipment modifiers); DH pp.76–77 (Wise aid is separate from ordinary Help); SG pp.32–38 (situational factor modifiers and offered/accepted Help).

**New audit guards:**
- The existing `tests.sourceBoundFactorPlan` now passes `tb2eSourceFactorInputGuard` before inspecting prerequisites or computing any Ob. The guard requires every applicable additive category to be selected or expressly excluded by the GM with a reason, so missing `+` factors cannot silently lower Ob. The optional Survivalist camp amenities remain genuinely optional (DH p.175).
- Nested `preconditionFacts` may contain **only** a known allowlist of source facts. They cannot override `skillName`, `tableName`, `selections`, `gmAuthorized` or factor mode, closing a potential input-routing mismatch.
- `tests.scenarioPlan` assembles one immutable, GM-supplied independent Skill/Beginner's Luck scenario: source table or special formula → situational +Ob → equipment +Ob → accepted Help / distinct Wise aid → normal dice pool or BL halving. It requires explicit gear and environment facts, GM full-modifier review, correct Beginner's Luck Will/Health, and explicitly unlocked heroic rating seven.
- If a helper attempts to provide ordinary Help and Wise aid from the same declared character ID, the scenario fails closed. Both may contribute if the characters are distinct and their independent Help/Wise plans permit it.
- No Foundry document, Actor or resource lookup, no automatic entitlement, roll or condition/advancement mutation. `poolAuthority: GM_INPUT_PREVIEW_NOT_ACTOR_VERIFIED` is an explicit safety label; a successful preview is NOT an authorization for a live test.

**Evidence:** `module/m10d18-tb2e-package-a-factor-guard.mjs`, `module/m10d18-tb2e-package-a-test-scenario.mjs`, `qa/m10d18-package-a-factor-input-guard-smoke.mjs`, `qa/m10d18-package-a-test-scenario-smoke.mjs`. Existing read-only APIs remain available and Legacy Mixed runtime is unchanged.

**Current parity gaps:** the underlying source selections are still caller-supplied and not derived from an authenticated GM or Actor; bonus sources, condition modifiers, real roll event provenance, spells, conflicts and advancement remain uncommitted, externally adjudicated, or separate shadow domains. Independent verification of each source exception and Foundry v13.351 multiplayer acceptance is outstanding. **0/14 FULLY REAUDITED; do not release or activate CORE.**


### Isolated Foundry archive readiness check (Package A Draft)

The Package A PR workflow now stages a **temporary**, unpublished Foundry system ZIP after the complete smoke suite. It validates ZIP integrity, byte-for-byte agreement of the packaged root `system.json`, inclusion of all runtime paths referenced by the manifest and exclusion of internal release/channel directories. `qa/m10d18-package-a-archive-check.mjs` checks the listing against `system.json` and ensures the version matches `release/READY`. The temporary archive is **never uploaded or tagged**, and no release workflow is invoked. This is a packaging preflight only; it is not a completed protected release or Foundry acceptance.


## 2026-10-12 — Package A integrated Actor/Condition provenance boundary (read-only)

**Source evidence:** *Scholar's Guide*, printed pp.46–52 (Fresh, Hungry, Angry, Afraid, Exhausted, Injured, Sick, Dead, multiple conditions), *Dungeoneer's Handbook* p.59 (Beginner's Luck dice staging) and Nature channel rules (DH 65–71).

The new `module/m10d18-tb2e-package-a-condition-boundary.mjs` requires the GM to identify an acting character and to explicitly review the actor's Condition set; where Help or Wise aid is used, it also requires separately reviewed helper Conditions and distinct character identifiers. This is not a Foundry Actor lookup or entitlement validation.

- Fresh contributes +1D for ordinary independent tests, and **after halving** for Beginner's Luck.
- Injured and Sick impose stackable -1D each on Skill/Will/Health tests. A Beginner's Luck Ability reduced to zero is rejected.
- Afraid blocks Beginner's Luck and ordinary Help offered by that helper. Angry blocks beneficial Traits for the actor and Wise aid from an angry helper. Dead characters cannot participate in tests or Help in any capacity.
- The GM explicitly chooses whether to apply the Angry +1 Ob for an independent precision/social Skill; listed source Skills are recognized. Exhausted free Instinct is not accepted: the acting player must spend a turn and +1 Ob applies.
- Channeled Nature requires the source test to match the current scenario, a GM-reviewed current/maximum Nature and Persona availability, and an exact match between channel dice and Current Nature; potential Tax is returned as guidance only.
- Independent-test preview refuses recovery, Versus, conflict and other contexts; these require their own rule pathways. No Condition, Nature, resource or Actor values are changed.

Test evidence: `qa/m10d18-package-a-condition-provenance-smoke.mjs`, alongside the existing scenario, factor, Help and Wise smoke suites. **CI 143 smoke suites PASS** on branch at the time of the checkpoint. Its unpublished ZIP preflight still verifies 21 manifest dependencies and no live channel changes.

### Important limits

Declaring `conditionsGmReviewed:true`, helper IDs, resource counts and Nature values does **not** prove that a real Foundry Actor currently has those values or that the client is a privileged GM. Full Actor-backed provenance, permission controls, real roll history, end-to-end Nature Tax/advancement, spell/conflict exceptions and multiplayer acceptance remain OPEN. `FULLY_REAUDITED` stays 0/14. No protected QA release, live CORE switch, or M11 resumption is justified by this checkpoint.


### 2026-10-12 — Skill/Beginner's Luck progression and zero-rating consequences

The source-linked, read-only `tests.progressAfterTestPlan` now distinguishes **trained Skill Pass/Fail marks** from **untrained Beginner's Luck learning attempts**. Dungeoneer's Handbook p.75 establishes that attempts count regardless of success against a threshold equal to Maximum Nature, grant skill rating 2 when complete and never advance the underlying Will/Health. Scholar's Guide p.51 forbids logging advancement while Sick; p.34 assigns post-tiebreaker advancement to the tiebreaking Ability/Skill, not the initial tied roll. An untrained BL route is blocked for Afraid, and Dead prevents all progress.

Scholar's Guide p.52 additionally prohibits rolling a Skill or Ability when its effective rating reaches 0 through conditions; the scenario now rejects a 0-rated trained Skill **even when Persona, gear or Help would otherwise add dice**. Nature substitution remains a distinct GM-adjudicated mechanism, not an automatic fallback.

The new progress planner returns only projected marks/readiness and expressly commits **no** Actor mutations, advancement counts, new Skills, Nature changes or Will/Health marks. An actual completed roll and Actor state are still **GM-supplied assertions**; ownership, roll history and resource spend provenance are not verified by this adapter.

Regression coverage: `qa/m10d18-package-a-progress-boundary-smoke.mjs`, plus new 0-rating cases in `qa/m10d18-package-a-condition-provenance-smoke.mjs`. Domain A is **not FULLY REAUDITED**; 0/14 unchanged.


## 2026-10-12 — Read-only outcome chain: final D6 pool → Obstacle → advancement preview

**Independent-test source basis:** *Scholar's Guide* printed pp.31–35 (independent Obstacle pass/fail, tie advancement boundary); *Dungeoneer's Handbook* pp.59,75 (ordinary/heroic success TN, Beginner's Luck halving and untrained learning); SG pp.46–52 (Condition constraints).

Added `module/m10d18-tb2e-package-a-outcome-chain.mjs` and public shadow API `tests.outcomeAndProgressPlan`. The new planner reuses the reviewed `tests.scenarioPlan`, rejects dice that don't exactly match the resulting pool size, validates individual D6 faces (1–6), derives Obstacle outcome using the existing read-only test engine (default TN4 or explicitly GM-claimed Heroic TN3) and optionally delegates that **derived** outcome to `tests.progressAfterTestPlan`. Post-test input can only contain an allowlisted set of GM-declared learning and counting facts; it cannot override Skill identity, mode, result, Obstacle or Conditions.

The new API requires explicit assertions that supplied final dice are reviewed and that **no Fate Luck, Wise rerolls or other exploded-die chains occurred**. Those features are deliberately excluded, rather than pretending the Dice array proves per-die provenance. Returned `rollSourceAuthenticated:false`, `actorSourceAuthenticated:false` and `gmPermissionAuthenticated:false` prevent the preview from being confused with live Foundry authority. There are no rolls, resources, Actor/Item/Journal/Settings writes, advancement marks, newly learned Skills or other side effects. Focused regression: `qa/m10d18-package-a-outcome-chain-smoke.mjs`.

**Remaining audit blocker:** real authenticated Actor/GM identity, trusted Foundry roll history and source-linked Fate/Persona/Deeper Understanding/Of Course sequencing, source-to-Actor heroic benefits, complete rule exception parity and combined Foundry 13.351 multiplayer QA. This is another verified **read-only integration boundary**, not a fully reaudited domain. **0/14 FULLY REAUDITED**, stable `v1.12.0` untouched, Legacy Mixed sole live authority, M11 PAUSED, global kill switch ENGAGED.


## 2026-10-12 — Fate/Wise event chronology and Helper Synergy source correction

Original references: DH pp.76–78, SG pp.87–88. **Corrected** both Deeper Understanding and Of Course to precede Fate Luck; SG p.87 explicitly requires Deeper-before-Luck, while DH p.77 additionally forbids rerolling an already-rerolled die. Old statements permitting Deeper after Luck are superseded.

`module/m10d18-tb2e-package-a-rewarded-roll-history.mjs` now previews one GM-asserted test with uniquely identified base dice, per-die Wise rerolls (related Wise, at most one per effect/wise) and a Fate Luck event holding recursive rounds with explicit parent-six associations. Every six must produce exactly one follow-up die; new sixes continue until exhausted. Unrelated/duplicated Wise effects, late Wise actions, incomplete 6-chains, fake parent die IDs, repeated new IDs and insufficient declared Fate/Persona balances fail closed. The preview sums *potential* resource cost without spending resources, and derives an uncommitted outcome and optional advancement from the enriched results. No Foundry roll log, actor/GM credentials or resource balance is authenticated.

`module/m10d18-tb2e-package-a-synergy.mjs` separately implements SG p.87 Helper Fate Synergy as a read-only advancement proposal: helper must have accepted eligible ordinary Help, declared Fate pre-roll, and a verified helping Skill/Ability. The Helper marks their own helping source on PASS/FAIL; on an initial tie ending in tiebreaker, either retract Fate/no mark or keep Fate and mark the tiebreaker source without giving Help on that roll. Sick and Afraid/Dead conditions remain in force. No reward or advancement is committed.

New regression suites: `qa/m10d18-package-a-reward-history-smoke.mjs` and `qa/m10d18-package-a-synergy-smoke.mjs`.

**Limitations:** all dice and event histories are GM asserted, not read from immutable Foundry roll records; the code must not be treated as actual runtime authority. External reward provenance, per-Actor Fate/Persona state, token ownership, all bonus interactions and complete end-to-end Foundry QA remain blockers. 0/14 FULLY REAUDITED; Kill Switch engaged; M11 paused; stable v1.12.0 untouched.


## 2026-10-12 — SG p.88 Persona budget reconciliation across all Package A independent-test previews

Source: *Scholar's Guide* p.88: **Advantage** spends no more than three Persona per roll before the dice; **Channeling Nature** spends one Persona; **Of Course** may spend a further Persona on a related Wise test before Fate Luck.

`tests.scenarioPlan` now rejects `bonuses.personaDice>3` and exposes explicitly uncommitted `projectedPersonaAdvantageCost`, `projectedPersonaNatureChannelCost` and `projectedPersonaBeforeRollCost`. `tests.rewardedRollHistoryPlan` reconciles those **pre-roll** costs against the same GM-declared **starting Persona balance** as later `OF_COURSE` events. If one Persona is used for Advantage or Nature and only one was declared at test start, an additional Of Course fails with `INSUFFICIENT_PERSONA`; no point can be double-booked. `tests.outcomeAndProgressPlan` (plain dice) now requires an explicit sufficient starting balance whenever pre-roll Persona spending is present and continues to leave resource provenance unauthenticated.

Wise ownership IDs are normalized for duplicate-use prevention: leading/trailing spaces and case changes cannot make the same Wise appear distinct in a reward timeline.

Evidence: `qa/m10d18-package-a-reward-history-smoke.mjs`, `qa/m10d18-package-a-outcome-chain-smoke.mjs`; regression vectors cover insufficient Persona before the roll, insufficient remaining Persona for Wise Of Course, Nature channel cost, over-three Advantage and duplicate Wise aliases. **This remains strictly GM-asserted, no real Actor holdings or transactional resource usage is verified.** No Actor/Item/Journal/settings writes, rolls, or release change. No domain upgraded; **0/14 FULLY REAUDITED**.


Further provenance check: both the rewarded and plain-D6 outcome planners now reject `NATURE_PERSONA_BALANCE_MISMATCH` when Nature Channel's claimed `personaAvailable` differs from the claimed start-of-test Persona ledger. This is internal consistency of GM assertions, **not** evidence of an authenticated Actor balance.

## 2026-10-12 — Package A current-document provenance boundary (Draft; no release)

Source re-read: uploaded DH printed pp.59,77 and SG pp.31,47,51,87-88. SG31 ties the base pool to the acting Skill; SG46-52 conditions require current character facts; SG87-88 Wise/Fate/Persona rules require chronological, roll-time resources. Current holdings cannot certify an earlier expenditure. Foundry v13 API basis: https://foundryvtt.com/api/v13/classes/foundry.documents.ChatMessage.html and https://foundryvtt.com/api/v13/classes/foundry.dice.Roll.html.

New public shadow APIs `tests.documentEvidence({actorId,messageId})` and `tests.documentOutcomePlan({actorId,messageId,scenarioInput})` resolve IDs from the ready Realm Guard session. Current active GM identity is checked against `game.users` before reading Actor/messages. Caller GM/Actor/Roll objects and message flags do not supply authority. Only a world character with the exact speaker Actor object, visible message content and currently authorized message author (GM or Actor OWNER) is accepted. Token/scene/synthetic Actors, unavailable documents and unknown active conditions fail closed. Legacy Tired/Strained are not silently converted to CORE conditions.

The dice evidence is detached, frozen and namespaced by message/roll/term/result index. Only one evaluated native plain Nd6 term (1-250 dice), no modifiers, all results active, no rerolled/discarded/exploded results and a matching raw total is accepted. This reads stored results; it never calls evaluate, creates a message, sends a socket request or changes documents/settings/resources. Missing/incomplete Wise/Fate histories and multi-roll messages are rejected rather than inferred from chat HTML or flags.

The outcome bridge compares the GM-reviewed scenario's acting ID, uniquely named role rating and complete active condition names to current Actor data, then feeds saved D6 faces into the existing obstacle planner. Scope: ordinary non-Heroic Skill test, no helper/Wise aid, no paid/extra bonus dice, no Nature channel and no advancement request. Equipment, factors, environment and narrative eligibility remain GM assertions. An Actor/message match does NOT certify the scenario or Actor state at roll time. Current Fate/Persona are observation only and are never substituted as test-start balances.

Evidence fields explicitly separate `currentSessionGmObserved`, `actorDocumentObserved`, `messageDocumentObserved` and `currentActorScenarioMatched` from false `gmPermissionAuthenticated`, `actorSourceAuthenticated`, `rollSourceAuthenticated`, `rollTimeActorStateVerified` and `historicalRewardBalanceVerified`. Client documents are mutable, not immutable records or server attestations. Current message-author permission is not permission at the original roll time. No new live authority is granted.

Regression: `qa/m10d18-package-a-document-provenance-smoke.mjs` covers native plain dice → obstacle result, identity/visibility/ownership failures, tokens/speaker mismatch, unknown conditions, altered rating/conditions, modified dice, bad totals, unsupported scopes, detached snapshots and zero-write/RNG sentinels. Full local/CI verification is recorded in the subsequent verification checkpoint.

Remaining gaps: historical Actor snapshots and reward spends; immutable/server-verifiable roll-event provenance; actual Legacy chat records that may contain only HTML faces or separate Fate Rolls; Wise ownership and chronological rerolls; helper/BL/Heroic/token routes; source-complete cross-domain parity; consolidated Foundry v13.351 multiplayer execution. Runtime integration is implemented but NOT Foundry-verified. 0/14 FULLY_REAUDITED. Legacy Mixed sole live authority; CORE shadow/read-only; kill switch ENGAGED; M11 PAUSED. Stable v1.12.0 and published QA v1.13.0-qa.29 untouched.

### Verification checkpoint — current-document boundary, 2026-10-12

Local full regression: **148/148 smoke suites PASS** (147 existing plus new document-provenance suite), module/sheet/main syntax checks PASS, release preflight PASS, frozen manifest/QA/stable diff against origin/main PASS. Focused document-provenance suite re-run after native-Die and Legacy-condition hardening PASS. GitHub CI and unpublished ZIP verification are recorded below once completed. Foundry v13.351 manual acceptance remains NOT RUN. No domain certification or release.

### GitHub CI verified — source commit 59831c341a805fa9ca1cb459e760707784512965

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38282096333 completed SUCCESS. Job logs explicitly confirm **148/148 smoke suites PASS**, parse/safety preflight PASS, unpublished ZIP integrity/manifest equality and **21/21 manifest dependencies PASS**, frozen QA/stable/manifest guard PASS. Local ZIP checks independently passed. No release actions ran.

Confirmed compatibility finding from `module/documents.mjs`: Legacy ChatMessage creation stores rendered `content` without native `rolls`. These existing HTML-only cards are outside the evidence adapter's accepted scope; reconstructing dice or Wise/Fate chronology from their HTML is not permitted. The new native-message bridge is implemented and mock-tested, not certified compatible with all live Legacy cards.

Audit documents and the consolidated Foundry v13.351 protocol are updated. Manual A-D execution, historical resources/Actor provenance, complete Wise/Fate event lineage and remaining full CORE domain exceptions are still OPEN. **0/14 FULLY_REAUDITED**, Draft PR #14, no merge/release, unchanged stable v1.12.0 and published QA v1.13.0-qa.29; Legacy Mixed sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED.

## 2026-10-12 — Package A saved-message Wise/Fate bridge and Angry correction (Draft)

Re-read uploaded Scholar's Guide printed p.47 and pp.87-88, Dungeoneer's Handbook p.77. Confirmed bug: `rewardedRollHistoryPlan` allowed Deeper Understanding / Of Course for an Angry actor. SG47 forbids beneficial Wise effects; both now reject `ANGRY_BLOCKS_WISE_REWARDS`. Ordinary Fate Luck remains permitted by this condition boundary. No Legacy live behavior changed.

New `tests.documentRewardHistoryPlan` reads initial and subsequent results from separate native plain-D6 session ChatMessages through the existing GM-only document reader. The initial reviewed Skill scenario must match the current Actor role/conditions and remains within the existing non-Heroic, no-helper/no-BL/no-Nature/no-extra-bonus bridge scope. Only GM-declared semantic links and historical start balances are inputs: caller dice/newFace/rerolls/roll objects, flags, result overrides and progression claims are not accepted.

Every event document must have the same world Actor and currently authorized author as the initial message, be visible/readable, be unique in this timeline and have a safe integer timestamp strictly later than the prior document. Missing/tied/reversed timestamps fail closed; this checks stored ordering only. Native results stay bounded, unmodified and detached. Deeper maps one newly read face to a named failed original die; Of Course maps read faces to the full failed-die set; Luck maps each read new die to one existing six, recursively. Existing source guards reject late Wise use, unknown/extra parents, missing explosion rounds, duplicate Wise/effects and insufficient asserted starting resources. Return evidence preserves each new-result-message ID and its GM-declared target/parent linkage.

Wise effects additionally resolve a real current `wise` Item ID on the acting Actor; missing items and repeated normalized Wise names are rejected. This verifies only CURRENT holdings. The topic being relevant, the documents belonging to the SAME actual test and the target/parent associations remain GM assertions. A manually fabricated or edited native ChatMessage is not server-attested randomness. Timestamp order cannot prove immutable execution order or event completeness.

Historical balances MUST be explicit `fateAtRollStartGmAsserted` / `personaAtRollStartGmAsserted`; current Actor Fate/Persona are never used as test-start funds. Tests demonstrate an Actor with current balances 0/0 and a separately declared historical 2 Fate/1 Persona yielding a valid preview, without claiming an authenticated spend. All authentication, historical Actor/resource and immutable chronology flags remain false; no advancement preview, RNG, sockets, writes, capture hooks, spend or live authority.

Regression evidence: new `qa/m10d18-package-a-document-reward-history-smoke.mjs` exercises the full saved base + Deeper + Of Course + recursive Luck chain (8 final successes), current Wise holdings, declared budgets, privacy/Actor/author failure, duplicate messages, equal/missing/reversed timestamps, forbidden face injection, rerolled native dice, incomplete or false parent-six chains, Angry rejection and detached snapshots. Existing reward-history suite adds source-specific Angry Wise / permitted Luck tests. Full regression and CI checkpoint follows.

OPEN: historical Actor/ownership and Wise snapshots; trustworthy starting balances and actual spend transactions; immutable/server-verified event history, actual same-test identity, event completeness, helper/BL/Heroic/token routes, Legacy HTML-only cards, full CORE exception parity and combined Foundry v13.351 A-D acceptance. No domain marked FULLY_REAUDITED (0/14). Legacy Mixed sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No release/merge.

### Local verification — saved-message reward chain

**149/149 smoke suites PASS**, syntax checks and release preflight PASS. Independent temporary ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**. Protected system.json / QA / stable / READY comparison against origin/main shows no differences. Focused saved-document and reward-history suites re-run after final response/source-label cleanup PASS. GitHub CI evidence will be recorded after the branch update. Foundry v13.351 combined acceptance remains NOT RUN.

### GitHub CI verified — saved-message Wise/Fate source commit cfab9483194f19c8d76a988518584857cf1d033a

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38284931885 completed SUCCESS. Logs explicitly confirm **149/149 smoke suites PASS**, saved-document reward chain regression PASS, syntax/safety preflight PASS, temporary unpublished ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**, protected QA/stable/system manifest diff PASS. Local full regression and independent ZIP checks also PASS.

The Angry Wise guard is a verified source-bound correction; the new document timeline remains evidence read from mutable current session records and GM-declared associations, not authenticated or complete historical gameplay. Foundry v13.351 A-D acceptance NOT RUN. All remaining gaps above remain OPEN; 0/14 FULLY_REAUDITED, Legacy Mixed only live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED, stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No release/merge/tag/channel action.

## 2026-10-12 — Package A current Actor participation provenance (Draft)

Source re-read: uploaded Dungeoneer's Handbook printed pp.58-59 (Will/Health mapping and Beginner's Luck staging), p.77 (Wise aid separate from ordinary Help); Scholar's Guide pp.36-38 (fictional action/acceptance, same or suggested Skill, trained Skill before Will/Health when helping a beginner, no rating-0 Help) and pp.46-52 (Fresh, Afraid/Angry, Injured/Sick and zero-rated sources).

New `tests.actorEvidence({actorId})` checks the current active session GM BEFORE looking up a world character. It copies only current scalar Skill Item IDs/names/ratings, Wise Item IDs/names, Will/Health, active source-mapped conditions and current reward holdings. Unknown active Legacy conditions remain rejected. Returned evidence is frozen/detached; no flags/descriptions/live Document references, Item provisioning, RNG or writes. The existing saved-D6 document reader now uses this common Actor boundary, so the older outcome and Wise/Fate APIs retain their scope and safety guards.

New separate `tests.participationOutcomePlan({actorId,messageId,scenarioInput,helpSourceItemId,wiseAidItemId})` connects those current Actor facts to ONE saved plain native D6 message:
- Ordinary Skill requires a unique matching trained current Skill rating 1-6.
- Beginner's Luck requires the target Skill absent or uniquely present at rating 0 (including normal untrained default Skill records). The underlying Will/Health MUST be the DH-mapped Ability, match the Actor's current value and remain source-eligible under conditions. A learned Skill, duplicate/malformed Skill records and claimed wrong Ability/rating fail closed. No automatic Skill creation or learning.
- Ordinary Help is bound to the selected helper's actual Skill Item ID, matching name and trained rating; source-listed relevance/acceptance remain explicitly required by the existing planner. For BL, a helper with the trained target Skill must use it; otherwise the correct current Will/Health route is supported. Non-positive effective helping sources from stacked Sick/Injured are rejected before preview even if other bonuses might add dice. Nature/Instinct/other Ability helper routes remain outside this bridge.
- Wise aid is bound to an actual unique Wise Item on a distinct helper Actor, with separately checked current conditions; the same character cannot supply both ordinary Help and Wise aid. Angry/Dead Wise aid and Afraid/Dead ordinary Help are blocked by existing source guards. Wise fictional relatedness is not inferred from the Item name.
- Actor/helper/Wise-helper condition declarations must match observed complete current condition sets. The original source planner still requires reviewed conditions, described relevant action, explicit accepted Help and GM-approved relevance. Helpers/Wise aid enter the correct pre-halving BL stage; Fresh remains derived after halving. Stored dice count must match the complete resulting pool.

Returns current participant/source evidence and an uncommitted outcome only. Current documents do NOT authenticate earlier ownership or character state, actual player acceptance, same-test participation or server-generated randomness. `playerConsentAuthenticated`, `participationAtRollTimeVerified`, `actorSourceAuthenticated`, `rollSourceAuthenticated`, `gmPermissionAuthenticated`, `rollTimeActorStateVerified` and `historicalRewardBalanceVerified` remain false. No resource costs, advancement preview, spends or writes. Equipment, environment, factor selections and narrative eligibility remain reviewed GM assertions.

Regression: `qa/m10d18-package-a-participation-provenance-smoke.mjs` covers trained Skill with distinct ordinary Help/Wise aid; current Will and Health BL routes; default rating-0 and absent Skill; Fresh after halving; learned/duplicate/malformed Skill rejection; wrong/unowned/duplicate helper and Wise Items; declined Help; wrong Actor/condition source; zero-rated Skill and Ability helpers; Afraid/Angry rejection; unsupported spend/Instinct/Heroic inputs; player denial before Actor reads; detached snapshots and zero-write/RNG sentinels. Existing saved-document and Wise/Fate suites also re-run after the shared reader change.

OPEN: historical Actor/resource/ownership snapshots and actual consent/events, immutable same-test history, equipment-source provenance, reward/advancement linkage for participation, Nature/Instinct/conflict/series/tiebreaker/Heroic/token paths, Legacy HTML-only native Roll gap, complete CORE exception parity and consolidated Foundry v13.351 A-D acceptance. This is CURRENT participant evidence only, not a historical actor authority or full-domain certificate. 0/14 FULLY_REAUDITED; Legacy Mixed only live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 / published QA v1.13.0-qa.29 untouched. No release/merge.

### Local verification — current participant provenance

**150/150 smoke suites PASS**, module/sheet/main syntax checks and release preflight PASS. New participation suite re-run after additional stacked Sick/Injured, Dead helper/Wise helper and unsupported Instinct/Heroic regressions PASS. Independent temporary ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**. Protected system/QA/stable/READY diff against origin/main remains empty. GitHub CI evidence will be recorded after branch update; Foundry v13.351 combined acceptance remains NOT RUN.

### GitHub CI verified — current participation source commit 201da6a4d69b63aa4ba28e8a35805477eebb8ea2

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38286617101 completed SUCCESS. Logs explicitly confirm **150/150 smoke suites PASS**, Actor-backed Skill/BL/Help/Wise-aid regression PASS, syntax/safety preflight PASS, temporary unpublished ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**, protected QA/stable/system manifest diff PASS. Local full regression and independent ZIP checks also PASS.

Current participant source matching is implemented and automatically verified, not historical gameplay authentication. Actual acceptance/ownership at roll time, resource spend history, equipment and complete event/exception parity remain OPEN. Consolidated Foundry v13.351 A-D acceptance NOT RUN. **0/14 FULLY_REAUDITED**, Draft PR #14, Legacy Mixed sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED, stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No merge/release/tag/channel action.

## 2026-10-12 — Package A saved outcome / current counters / Helper Synergy (Draft)

Re-read uploaded DH pp.72,75,108-110 and SG pp.51,87. DH75 learns a Skill at rating2 after attempts equal to Maximum Nature, regardless of pass/fail, and never advances the acting BL Will/Health. DH108 requires Skill passes equal to current rating and failures equal to rating minus1; DH109 forbids pass/fail conversion and resets only after advancement. SG51 forbids logging or advancing while Sick. SG87 Synergy spends the HELPER's Fate before the roll and marks THEIR actual helping Skill/Ability, not the acting source.

`tests.actorEvidence` now additionally projects scalar current Skill P/F counters, configured Legacy thresholds, beginnerAttempts and Current/Maximum Nature. Missing/invalid numbers remain null; they are never silently defaulted to 0. Existing Actor/dice/participation scopes are unchanged.

New separate `tests.participationProgressPlan` first uses the verified current-participant/saved plain-D6 chain, then derives every mark from that SAME outcome and Obstacle. Callers cannot choose result, difficulty, source, counters, Maximum Nature, known-Skill count, tiebreaker outcome or progression mode through separate facts. Explicit GM review must confirm a legal independent Adventure test, historical eligibility and that the CURRENT counters exclude this test. Those reviews remain unverified assertions; the adapter does not claim an immutable historical/duplicate-log check.

- Trained Skill reads its current observed P/F counters and projects only the derived mark. Source thresholds use current raw rating, not temporary condition-reduced dice and not custom Legacy passNeeded/failNeeded; both source requirements and stored Legacy configuration are shown without rewriting either. Normal cap6 blocks rating7. There is no automatic rating increment or counter reset.
- BL progression requires an actual unique rating0 learning record with a valid beginnerAttempts counter; a missing Skill remains allowed for the TEST preview but is rejected for COUNTER progression, rather than inventing a starting0 record. It uses observed Maximum Nature, with coherent Current/Maximum state and the current unique trained role count. Ambiguous/malformed records and counts above the CORE24 capacity fail closed. At24, reaching the threshold shows the need to choose an old Skill to forget; nothing is deleted/learned. The count is explicitly current Realm Guard role-item evidence, not a certified TB profile conversion.
- Sick suppresses both proposed marks/BL attempts AND advancement readiness even when old P/F counts already met the threshold. No Skill, Ability or learning writes occur.
- Optional Synergy requires observed ORDINARY Help, a separately GM-asserted historical HELPER Fate balance and pre-roll commitment. It derives the helping source from current participant evidence and its mark from the actor's SAME pass/fail. A different helping Skill gets its own observed P/F arithmetic/threshold preview. Wise aid does not qualify for Synergy. Current helper Fate is never substituted as the start balance.
- Ability Help Synergy can propose the source-bound Will/Health mark, but the current data model does not store Will/Health P/F advancement counters. `helperAbilityCountersObserved:false`, null helper counter projection and unchanged acting BL Will/Health marks explicitly preserve this model gap. No Ability baseline or new model fields are invented.

Regression: new `qa/m10d18-package-a-participation-progress-smoke.mjs` covers saved PASS/FAIL derivation, actual counters, rejected overrides/history/context/counter gaps, repeat-preview non-mutation, normal cap6, Legacy threshold divergence, Sick suppression even with ready counters, different-Skill Helper Synergy, current helper Fate0 versus historical asserted1, missing/late Synergy declaration, BL Current2/Maximum4 threshold on PASS and FAIL, existing versus absent learning record, capacity24/25, Maximum Nature0 and missing state, Sick no-attempt, and Ability Synergy's explicit missing-counter boundary. No resources/documents/settings/rating/learning/advancement writes, RNG, sockets or capture hooks.

OPEN: actual historical counter eligibility, duplicate-test ledger, player consent/ownership/participation at roll time, actual starting balances/transactions, complete event/source provenance, equipment evidence, Ability P/F data-model support, reward-history/participation integration, Nature/Instinct/conflict/series/tiebreaker/Heroic/token exceptions, Legacy HTML-only Roll gap and combined Foundry v13.351 A-D execution. No advancement/learning/spend authorization. 0/14 FULLY_REAUDITED; Legacy Mixed sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED. Stable v1.12.0 / published QA v1.13.0-qa.29 unchanged; no merge/release.

### Local verification — current counters and derived Helper Synergy

**151/151 smoke suites PASS**, syntax checks and release preflight PASS. Focused progression suite re-run after final evidence-label cleanup PASS. Independent temporary ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**. Protected system/QA/stable/READY comparison against origin/main remains empty. GitHub CI checkpoint follows after branch update; real Foundry v13.351 combined A-D remains NOT RUN.

### GitHub CI verified — saved participant outcome / current progress counters source commit 8631c7d6e8dc2c46f1ecef0fb284555b8286187e

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38288506035 completed SUCCESS. Logs explicitly confirm **151/151 smoke suites PASS**, saved-outcome/current Skill-BL counter/Helper Synergy regression PASS, syntax/safety preflight PASS, unpublished ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**, protected QA/stable/system manifest guard PASS. Local full regression and independent ZIP checks also PASS.

Counter arithmetic and source-bound suppression/thresholds are automatically verified. Historical rule eligibility, duplicate-test exclusion, actual Helper Fate commitment/consent and immutable event provenance remain GM assertions. Will/Health Helper Synergy still has no observed P/F counter model. Complete CORE exceptions and combined Foundry v13.351 A-D acceptance remain OPEN / NOT RUN; **0/14 FULLY_REAUDITED**. Legacy Mixed only live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No merge/release/tag/channel action.

## 2026-10-12 — Package A actual current equipment references (Draft)

Re-read uploaded DH pp.73-75: tools/supplies/gear are separate roles; trained basic tools depend on carrying an intact pack/satchel; missing/inadequate tools add Ob; untrained tools may be borrowed from a companion with the Skill; one supply increment and one ordinary gear use apply per test. SG31/36-38 and DH59 continue to govern the derived saved-D6 participant pool. Actual model: Gear stores quantity and inventory placement/container type but no reliable Skill-specific supply increment, damage, adequacy or loan-consent field.

Actor scalar evidence now includes Gear Item ID/name/current quantity and raw mode/location/container ID/type. Missing numeric/string data remains null. New separate `tests.equipmentOutcomePlan` wraps the SAME current-participant/saved plain-D6 outcome, requires explicit equipment role references and matches them to those current Actor Items:
- One uniquely referenced worn Torso pack/satchel with positive quantity; ambiguity/missing placement/reference fails closed. This is the supported CURRENT Realm Guard inventory placement scope, not proof that a physically hand-carried pack is absent in all fiction. Usability is explicitly GM asserted and must agree with the scenario carriesBackpackOrSatchel claim. A declared damaged/unusable pack does not grant basic tools.
- Selected Supply/Gear must be actual distinct Gear Items with positive safe-integer quantities, not caller-supplied holdings. They must be directly equipped in a recognized zone or directly inside the referenced usable worn pack/satchel. Missing/orphan/malformed/nested/custom-container paths are outside the bridge and reject. Pack, Supply and Gear cannot silently reuse one Actor Item for several roles. Zero-use categories require null references.
- Each Supply/Gear reference requires GM-reviewed Skill relatedness, physical usability and accessibility. Supplies additionally require an explicit assertion that one increment is available. The model's generic quantity is OBSERVED, not assumed to equal a Torchbearer supply increment; no decrement or historical consumption is inferred. Names/HTML/flags do not establish classification.
- Borrowed tools require a distinct real current lender Actor, unique trained matching Skill Item and its actual carried pack/satchel, plus explicit pack usability, access and lender-consent assertions. Missing/untrained lender, absent/empty pack, self-lending and contradictory borrowedTools declarations reject. Dwarf/Crafting Nature exceptions remain outside this narrow equipment bridge.

`historicalEquipmentVerified`, physicalConditionAuthenticated, equipmentRelevanceAuthenticated, supplyIncrementAuthenticated, lenderConsentAuthenticated and all Actor/roll/GM/player authentication flags stay false. Quantity/placement observations cannot certify those conditions at the recorded roll time. Inventory slot capacity/encumbrance and complete equipment-rule parity remain explicitly unverified. No supplies consumed, quantity decrements planned, inventory moves, tools created, Item/Actor/Settings writes, RNG, sockets, advances or spends. Other existing GM-asserted planners retain their earlier scope.

Regression: `qa/m10d18-package-a-equipment-provenance-smoke.mjs` covers current trained Cook pack + Supply + Gear → six saved D6; actual quantity and direct pack path; repeated detached non-consumption; wrong Skill/category review, injected quantity, inaccessible/empty/missing/duplicate Item, ambiguous/unequipped pack, orphan/malformed path, same Item used twice, unsupported crafting, unusable pack penalty, BL tools borrowed from a real trained lender, declined/untrained/empty/self lender, omitted/unused loan or Supply references, player denial and frozen prior evidence. Existing participation and current-counter suites are re-run after the shared Actor projection change.

OPEN: historical inventory state/spends, trusted Skill-specific item semantics/physical condition/access/consent, supply-unit representation, custom/nested containers and full capacity/encumbrance validation, Dwarf/stock/crafting/equipment exceptions, integrated equipment+reward+progress history, Ability counters, all prior historical/event/runtime gaps and combined Foundry v13.351 A-D acceptance. **0/14 FULLY_REAUDITED**; Legacy Mixed sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED. Stable v1.12.0 / published QA v1.13.0-qa.29 unchanged; no release/merge.

### Local verification — current equipment provenance

**152/152 smoke suites PASS**, module/sheet/main syntax checks and release preflight PASS. Focused equipment suite re-run after explicit wrong-type/missing-quantity regressions PASS. Independent temporary ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**. Protected system/QA/stable/READY comparison against origin/main remains empty. GitHub CI checkpoint follows after branch update; real Foundry v13.351 combined A-D remains NOT RUN.

### GitHub CI verified — current equipment source commit 5298dea7c672b5d5e67d2b47e938bc38a539ff21

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38290534291 completed SUCCESS. Logs explicitly confirm **152/152 smoke suites PASS**, Gear/pack/supply/quantity/carried-path/trained-lender regression PASS, syntax/safety preflight PASS, unpublished ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**, protected QA/stable/system manifest guard PASS. Local full regression and independent ZIP checks also PASS.

Current Item/quantity/placement bindings are automatically verified; historical equipment, physical adequacy/classification, supply-unit semantics, actual loan consent and consumption remain unverified. Full inventory capacity/custom/nested paths, stock/crafting exceptions, complete integration and real Foundry v13.351 A-D remain OPEN / NOT RUN; **0/14 FULLY_REAUDITED**. Legacy Mixed only live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No merge/release/tag/channel action.

## 2026-10-12 — G1 integrated saved-test implementation

`tests.integratedTestPlan` captures participant/equipment evidence once and binds the native base message, saved Wise/Fate events and final acting/helper progress to the same actor/message identity and scenario. An internal issued-result registry rejects forged or mismatched equipment contexts. Event reads and final participant/lender checks reject changed current snapshots. No caller final outcome or counter override is accepted.

Source basis: DH 59,73-77,108-110; SG 36-38,47,51,87-88. The new regression proves ordinary Skill FAIL→Deeper→PASS gives acting PASS and helper's own helping-Skill PASS; BL FAIL→Deeper six→Luck child→PASS gives one learning attempt, no Will/Health mark, and helper Skill PASS. No events preserves FAIL; insufficient Fate, fabricated context, conflicting scenario, unsupported outcome/history fields, duplicate-counter review and player invocation are rejected. Existing narrower public adapters retain their boundaries.

G1 engineering chain is implemented for independent Adventure Skill/BL in the existing supported equipment/participant scope. Full G1 acceptance remains OPEN pending the combined real-runtime case and broader exception coverage; this does not close G2–G5. Historical budgets/eligibility/relevance/consent/event links remain assertions, authentication remains false, Ability counters are still absent. No prospective capture was added. Foundry v13.351: NOT RUN. FULLY_REAUDITED: 0/14. Legacy sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; versions/channels/READY frozen.

Verified code SHA `ef721151f810f0c9d1cb8cc96dabb0d3d02e81f0`: [CI 38294327585](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38294327585) SUCCESS; 153/153 suites, syntax/preflight, unpublished ZIP integrity/manifest byte equality and 21/21 dependencies PASS; frozen stable/QA/system/READY guard PASS. Foundry acceptance remains NOT RUN.

## 2026-10-12 — G2 single source/code/test matrix and advancement boundaries

Current mapping: [Package A rule/code/test matrix](M10D18_PACKAGE_A_RULE_CODE_TEST_MATRIX.md). It separates pure regression, observed-document integration, model gaps and pending runtime acceptance across all five domains. It is not an exhaustive exception certificate. G2 remains OPEN.

Source-backed code corrections: DH108-110 advancement count/rating/Obstacle readers reject null, boolean, textual, fractional and unsafe numeric evidence instead of coercing it; mark review booleans must be actual booleans. DH68 zero-current Nature requires the immediate loss/trait/max/tax/mark-reset boundary before DH109 advancement. No live actions or schema changes. Regression proves distinct P/F thresholds, rating1/cap6 and preserved Nature tax difference; 154/154 local smoke suites plus preflight PASS. Final CI reference is recorded on Draft PR #14.

Required model decisions remain OPEN: no observed Will/Health/Nature P/F rows in current schema; no canonical Gear quantity-to-supply-increment unit. Never infer history or default-zero counts. Entitlement/Instinct/channel/crafting/Versus/tie/series/conflict/Wise-lifecycle integration and prospective Legacy-owned evidence still require work. Foundry v13.351 NOT RUN; G1 full acceptance and G2-G5 remain OPEN; 0/14 FULLY_REAUDITED. Legacy sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED; published versions/channels/READY untouched.
Verified G2 source/code SHA `e378731eae5d3d8ea0272cc8e91e2099cb2c137d`: [CI 38295483768](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38295483768) SUCCESS; 154/154 suites, syntax/preflight, unpublished ZIP integrity/manifest equality and 21/21 dependencies PASS; stable/QA/system/READY frozen guard PASS. Runtime acceptance NOT RUN; full gates and certifications unchanged.
## 2026-10-12 — G3 proposed trace contract / read-only consistency validation

Design and current limits: [Prospective Legacy trace contract](M10D18_PACKAGE_A_PROSPECTIVE_TRACE_CONTRACT.md). `tests.prospectiveTracePlan` validates explicit envelope/test/author/participant/item/die/spend/final declarations using the existing reward engine; it does not read native documents or install capture/storage/hooks. Source basis DH59,75,77,108-110; SG36-38,47,51,87-88. Envelope/receipt fields are engineering choices, not quoted rules.

Regression covers Skill and BL with Help, helper pre-roll Synergy receipt, Deeper before recursive Luck, linked acting spends and one final result; inconsistent edits, mixed/duplicate identities, malformed plain D6 records, missing/wrong-payee/wrong-cost/invalid-balance receipts, unsupported counters and declared prior-test replay are rejected. A consistently fabricated author/owner snapshot can still pass structural checks; all authentication/complete-history flags remain false. No real-session permission or global replay proof is claimed by this pure validator.

Legacy inspection confirms role chat cards retain HTML rather than complete native Roll/parent histories; existing spend results have no saved test/event identity. Future producer placement is specified in Legacy's existing roll and spend path, preserving Legacy rules and failure behavior, but no writer is installed in this checkpoint. G3 capture/trust/data and real runtime acceptance remain OPEN; current evidence cannot recover old HTML-only history. G1/G2 full acceptance and G4/G5 remain OPEN; certifications0/14; Legacy sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED, stable/published QA/READY untouched. Final verification is recorded after CI.
Verified G3 contract/validator source SHA `22e36c1ced1b2cc77c842b407767dc152c101a82`: [CI 38299979716](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38299979716) SUCCESS; 155/155 suites, syntax/preflight, unpublished ZIP integrity/manifest equality and 21/21 dependencies PASS; frozen stable/QA/system/READY guard PASS. No capture/storage or authenticated historical records; Foundry v13.351 NOT RUN; G3 and full domain gates remain OPEN.