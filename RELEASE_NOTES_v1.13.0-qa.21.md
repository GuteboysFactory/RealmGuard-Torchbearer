# Realm Guard / Torchbearer v1.13.0-qa.21 — M10D.18 P2.1 Traits Shadow Adapter

Builds on the user-verified M10D.18 P1 v1.13.0-qa.20. This is a QA-only milestone, not a Stable promotion.

- Adds a dedicated, pure Torchbearer 2E Traits read-only shadow adapter grounded in the Dungeoneer's Handbook, pp. 79–81 (CORE source; not MG legacy behavior).
- Benefit: Trait level 1 +1D once/session, level 2 +1D twice/session, level 3 +1s for passed/tied tests. Fictional applicability is table-approved; no automatic use consumption.
- Against self: -1D (1 check), +2D to versus opponent (2 checks), or break a versus tie for opponent (2 checks); each Trait only once/session; prohibited in Camp, Town, and PvP.
- One Trait per test; prologue refresh plan; class-Trait loss handled as manual GM adjudication; no automatic retirement.
- Read-only diagnostics: game.realmGuard.core.m10d.traits with getStatus(), model(), usePlan(), refreshPlan(), classTraitBoundaryPlan(). Readiness audit tracks implemented P2 Traits while Armor, Conflict, and Magic remain pending.
- Adds automated P2.1 smoke tests for source-level invariants, blocked cases, read-only mode, API registration, unchanged existing profile and zero-write behavior.
- Existing P1 fixes remain intact. All 14 existing domain re-audits remain pending. M11 live integration remains PAUSED, global kill switch remains ENGAGED. No activation or Character Creation commit for TB2E.
- Zero new Actor, Item, Journal, or Settings writes. No destructive migration.
- The release pipeline must pass syntax, preflight, all historical/current smoke tests, ZIP integrity and asset-download verification **before** updating QA channel manifest.
- Stable channel remains **v1.12.0**; Foundry 13.351 QA is still required to verify this candidate.
