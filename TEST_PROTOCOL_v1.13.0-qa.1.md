# TEST PROTOCOL — v1.13.0-qa.1

## M10D.1 first Foundry VTT 13.351 gate — source audit + locked foundation

Use a QA world; no later M10D play domains are live. Stable remains v1.12.0.

### Gate A — Boot / status

- Install qa.1, reload; no boot errors. System version 1.13.0-qa.1.
- `game.realmGuard.core.m10d.getStatus()` reports phase M10D.1, FOUNDATION_ONLY / READ_ONLY, foundationReady=true, liveReady=false, activationAvailable=false, liveParityVerified=false, 19 domains, and all writes=0.
- Rules / Creation Profile are torchbearer2e v1; readinessAudit().decision is FOUNDATION_ONLY_NOT_READY_FOR_LIVE. Existing m10 API remains available.

### Gate B — Source lineage / matrix

- Inspect sourceCoverageMatrix() and compare all 19 rows against the source-audit document. Counts: VERIFIED 1 / PARTIAL 13 / MANUAL 1 / SOURCE_INCOMPLETE 4.
- Confirm five authority references and matching source hashes. QR/CC page numbers are physical PDF pages; DG/SG books remain unavailable.
- Review guide ambiguities: Trait phase wording, differing disposition penalties, recovery wording, full armor/gear/class/magic omissions. No missing rules are filled by MG/RG defaults.
- VERIFIED Wise information remains disabled for live execution.

### Gate C — Preview / no writes

- Snapshot active profile settings and representative Actors, Items, Journals, rated Wises, rank/species, inventory, progression and creation provenance.
- Open Profile Management → Preview TB2E Source Coverage / Conversion. Verify FOUNDATION_ONLY / READ_ONLY, all classifications/evidence/gaps, and only Close.
- Open/close twice; compare snapshots. No profile switch or document/setting change. Repeat after reload.
- TB2E has no Activate button or switchToTorchbearer2e method. Generic `game.realmGuard.core.m10.switchRulesProfile("torchbearer2e")` must reject before any write.
- Creation foundation exposes steps only; no create/commit/grant operation is available. Player cannot open the GM preview or switch profiles.

### Gate D — Existing profile preservation

- In this QA world, confirm Legacy Mixed / Strict RG / MG1E / MG2E retain their prior support gates and representative roll/creation behavior. Existing MG2E remains supported.
- Preview TB2E from each existing profile without changing any data. Return to the starting profile using the existing supported switch workflow if testing switches; do not activate TB2E.
- Confirm old Wise ratings, ranks, conditions, inventory, levels/talents, provenance and Journal IDs are unchanged.

### Gate E — Release / channels

- qa.1 prerelease, realm-guard.zip and system.json exist; full syntax/smoke/package verification is green.
- QA = 1.13.0-qa.1; Stable = 1.12.0 with unchanged Stable manifest.

Report Gate A-E PASS/FAIL with the active profile and failing action. This gate verifies M10D.1 foundation only; it does not authorize live TB2E or claim later M10D parity.
