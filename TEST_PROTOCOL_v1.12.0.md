# v1.12.0 STABLE — Foundry VTT 13.351 Promotion Sanity

M10C.8 FULL PASS / VERIFIED / CLOSED follows user-verified qa.20. This is a focused promotion sanity check, not a new gameplay milestone.

1. Boot: update through Stable and reload. Confirm version 1.12.0, no console errors, MG2E SUPPORTED and Rules / Creation Profile v3.
2. Legacy: explicitly select Legacy Mixed. Snapshot representative Actors, Items and Journals, including Wise ratings, rank, inventory, progression and provenance. Confirm a representative test works.
3. MG2E: open/close Conversion Preview with no changes. Explicitly activate MG2E as GM; only activeRulesProfileId / activeRulesProfileVersion change to mg2e / 3. Confirm Registry/reference shows MG2E and a representative test works.
4. Reload: MG2E remains active; no boot errors. Repeated activation is idempotent.
5. Legacy: switch back and reload. Compare snapshots: existing document data is unchanged and representative Legacy test still works. Player activation remains rejected.

Release checks: normal 1.12.0 release; published realm-guard.zip and system.json verified; Stable = 1.12.0 and QA = 1.12.0-qa.20.
