# TEST PROTOCOL — v1.12.0-qa.20

M10C.8 corrective follow-up in Foundry VTT 13.351. Scope: Gate A, Gate B, Gate L and quick activation sanity. The qa.19 protocol remains the reference for full M10C.8 activation coverage; this patch does not itself close pending live gates.

## Gate A — Boot and status

- Install qa.20 and reload without boot errors. Runtime version is 1.12.0-qa.20 and phase is M10C.8.
- MG2E Rules / Creation Profile remain v3, QA_ACTIVE. `switchToMg2e` exists and readiness retains prior qa.18 verification and explicit QA activation authorization.

## Gate B — Profile Management / preview

- Open MG2E Conversion Preview: READ ONLY, M10C.8, QA-active, activation described as separate and explicit.
- No FOUNDATION_ONLY, M10C.2 or obsolete disabled Recruitment message appears.
- Close the preview: no profile settings, Actors, Items or Journals change.
- In QA, a GM preview reports activationAllowed=true and previewActivationAllowed=false. Stable/player permission remains false. No Activate button exists inside the preview.
- Cancel the separate activation confirmation: no writes.

## Quick activation sanity

- Snapshot profile settings and representative existing Actors, Items and Journals in a QA world.
- Explicit GM activation changes only activeRulesProfileId / activeRulesProfileVersion to mg2e / 3. Reload retains MG2E; repeated activation is idempotent.
- Switch back to the starting profile and confirm existing document data, Wise ratings, ranks, inventory, progression and provenance are unchanged.
- Player activation is rejected; stable gate remains closed (also covered by smoke).

## Gate L — Release / channels

- qa.20 GitHub prerelease has realm-guard.zip and system.json; release workflow/package verification is green.
- QA channel points to 1.12.0-qa.20. Stable remains 1.11.0.

Record these focused checks PASS/FAIL with any failing action and profile. No additional liveParityVerified result is created by opening a preview.
