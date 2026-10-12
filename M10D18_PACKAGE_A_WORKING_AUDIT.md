# M10D.18 — Full CORE Re-Audit / Package A (working branch)

**Branch:** `qa/m10d18-full-reaudit-package-a`  
**Base:** `433cbb4b4261a9dad6ba2ba10744008ea923f47a` (`v1.13.0-qa.29`)  
**Status:** IN PROGRESS / NOT RELEASED. Do not treat this branch as a completed 5-domain re-audit.

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

**DH p.77:** `Of Course!` explicitly precedes Fate Luck. `Deeper Understanding` may be used in conjunction with other rewards, but the selected die must **never already have been rerolled**. The earlier blanket pre-Luck gate for Deeper was stricter than the book. It has been removed from both legacy count-based shadow preview and the source-verified per-die preview. The count-based preview remains GM-unverified on die identities; the per-die preview enforces unique history IDs.

**DH p.172:** Scholar's multiple-spell Scribe Ob uses the **spell-specific scribing Ob** of the highest-circle spell, then adds 1 per additional spell. Spell circle itself is not an Ob. Formula now requires `highestSpellScribingObstacle` sourced from the spell's own entry. Existing tests ensure `highestSpellCircle` alone cannot yield an Ob.
