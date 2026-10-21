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

## Explicit release blocker
Starting Fate/Persona values have not been verified. Existing source-owned TB2E planners do not declare a starting grant. The supplied PDF was rediscovered but current Library reads return no readable content.
Do not infer the Realm Guard 1/1 grant, nor ship the candidate's zero placeholders as confirmed TB2E rules.
The candidate metadata has releaseReady=false and the production entry/commit functions refuse execution even if a profile is activated.
Obtain the relevant source text or Per's explicit ruling, then update the award values, review and tests.
Until that is resolved, the wizard is an implementation candidate, not complete or ready for M10D.11.

## QA work still required
Actual Foundry rendering and character creation must be tested by Per after M10D.11 activation.
Automatic tests use mocks and do not prove Foundry UI appearance.
QA27 remains the approved installed baseline.
