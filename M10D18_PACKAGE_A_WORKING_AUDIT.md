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
