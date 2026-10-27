# TB2E wizard implementation candidate

Baseline: qa.27; isolated branch `work/tb2e-wizard-qa28`.
No release, channel promotion, profile activation or existing-world migration.

## Approved scope
Copy the existing Recruitment wizard's presentation and interaction shell for TB2E, retaining guided/quick modes, Back/Next, cancellation and final review.
Reuse CORE M9 for drafts, validation, commit plans and rollback. Reuse existing TB2E source-owned planners.
Other rules retain their existing wizard.

Roadmap: M10D.8 / M10D.10 implementation, followed by M10D.11 activation and Per's Foundry playtest only after readiness.

## Implementation
- `module/tb2e-recruitment.mjs`: isolated 11-step wizard. The shell, CSS classes, dialog dimensions and navigation derive from qa.27 Recruitment.
- `module/profiles/torchbearer2e-wizard-creation.mjs`: candidate M9 creation profile; uses existing TB2E class/skills/Nature/Wises/Circles/equipment planners.
- Existing recruitment entry functions route to the TB2E copy only for the active TB2E rules profile. Others keep the original path.
- M9 generic validation accepts a profile-owned identity field. Default remains rank, preserving other profiles. TB2E uses className, never a fake Ranger station.
- Equipment is copied from visible existing world Gear Items, preserving source data and resetting old placement references. No new catalog, actor migration or automatic NPC creation.
- Party members are selected for the specialty uniqueness check; unrelated test Actors are excluded.
- Explicit TB2E condition documents are provisioned through the existing adapter's runtime extension. Fresh starts active; gameplay effects remain the responsibility of M10D.11.
- Keepsake/gold alternatives become treasure records and Gear Items. Magic choices and level-1 benefits are recorded; spells/invocations are not invented.
- Original TB2E foundation profile stays registered until M10D.11. The candidate is not substituted into the active registry yet.

## Verification
`qa/tb2e-wizard-smoke.mjs` covers all six class/stock paths, skills, Nature side effects, Wises, social/Loner paths, class changes, invalid distributions, specialty collisions, template escaping, Back/Cancel, source Gear preservation and CORE M9 rollback.
The branch-only workflow runs syntax checks and existing regression smokes. Consult the linked Actions run for actual results; a test file is not evidence of passing by itself.

## Starting rewards source resolved
Dungeoneer's Handbook, printed/PDF p. 47, "Starting Rewards": a new character starts with Fate 0 and Persona 0.
"Heir to the Pauper's Throne" on the same page permits a replacement for a deceased character to inherit their remaining Fate/Persona, capped at 3 each. This exception remains GM-adjudicated; ordinary creation grants 0/0.
The existing zero values are retained, with source provenance and explanatory Final Details / Review text.
Candidate metadata now has readyWhenActive=true, releaseReady=true and pendingSource=[]. These flags resolve the wizard's source blocker only; they do not activate the TB2E profile or bypass its separate liveCommit gate.

## Verification of source completion (2026-10-27)
The local wizard smoke passed against baseline commit 78a3a2422a69b7a2cbee2df6bdac56d32f415ee3 plus this completion. It checks 0/0 and refusal to create before profile activation for all six classes, the p. 47 citation and GM replacement exception in Final Details, Review text and readiness metadata, alongside the existing validation/navigation/rollback checks.
The other locally present module files were compared with the baseline's Git blob hashes (normalizing CRLF to LF); only the two approved wizard modules differ.

Local verification passed on Node 24.22.1:
- Syntax checks for the two changed modules and `qa/tb2e-wizard-smoke.mjs`.
- `qa/tb2e-wizard-smoke.mjs`.
- `qa/m9-creation-foundation-smoke.mjs`.
- `qa/m9-creation-commit-plan-shadow-smoke.mjs`.
- `qa/m9-core-live-commit-smoke.mjs`.
- `qa/m10b-character-creation-smoke.mjs`.
- `qa/m10d-tb2e-creation-shadow-smoke.mjs`.

These are mock-based local checks, not a new GitHub Actions result. The existing branch workflow uses Node 22 and runs the full smoke suite after a push.
The four approved files were saved to `work/tb2e-wizard-qa28` in commit `ee04989efee6128c7a51d5f0e28dc63587e34801`. The full branch workflow passed on that commit: [GitHub Actions 40588851451](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/40588851451). This includes syntax checks and every `qa/*-smoke.mjs` test on Node 22. Foundry visual verification remains outstanding.

## QA work still required
Actual Foundry rendering and character creation must be tested by Per after M10D.11 activation.
Automatic tests use mocks and do not prove Foundry UI appearance.
QA27 remains the approved installed baseline.

## M10D.11 handoff and user QA
M10D.8's starting-rewards source completion is implemented, saved to the work branch and verified by local tests and the full branch workflow. The branch implementation is ready for the separately approved M10D.11 activation and Foundry playtest.
No activation, release, version bump, channel promotion or registry change is part of this completion. `releaseReady=true` is candidate source-readiness metadata, not authorization to publish.

After explicit user approval for M10D.11, prepare controlled QA activation and run the following in a disposable Foundry test world:
1. Check all 11 steps in both Guided and Quick mode, layout, prompts, Back/Next, retained choices and final Review. Cancel must create no Actor or Items.
2. Create one character of each of the six classes. Confirm Fate 0 / Persona 0, level 1, Fresh, class/stock, Nature, skills, traits, Wises and relationships against the review. Newly learned Home, Social Graces and Specialty skills start at 2; human Upbringing starts a new skill at 3.
3. Confirm Final Details cites Dungeoneer's Handbook p. 47 and explains the GM-adjudicated inheritance of a deceased character's remaining Fate/Persona, at most 3 each. Ordinary creation must not apply that transfer automatically.
4. Exercise invalid skill distributions, duplicate party specialties and class changes. Confirm validation prevents creation and that previous stock data does not survive a class change.
5. Copy existing Gear Items; confirm source Items stay unchanged and old placement references are cleared. Check magic notes and keepsake/gold alternatives.
6. Confirm other rules profiles retain their existing wizard. Verify failure rollback leaves no partial character, and record Foundry version, branch commit, reproduction steps and console errors for any failure.

Before that approval the TB2E foundation/liveCommit gate must continue blocking actual wizard creation. M10D.11 activation and playtest fixes are the next step; stable 1.13.0 requires separate user approval after QA.
