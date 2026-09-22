Realm Guard / Torchbearer v1.11.0-qa.1 — M10A.0 Profile Foundation

Starts M10 Strict Realm Guard Profile / Rules Ownership from the verified v1.10.0 STABLE / GOLD baseline.

This build has NO INTENDED GAMEPLAY CHANGE.

Highlights:
- Adds internal Mouse Guard 1E / 2008 foundation profile.
- Adds non-selectable realm-guard-strict foundation inheriting MG1E.
- Locks Strict source lineage to MG1E inheritance + Realm Guard v1.6 overrides.
- Legacy Mixed remains the sole normal live rules profile.
- CORE baseline readiness no longer hard-locks the Legacy Mixed profile id.
- Baseline repair preserves an explicit later profile instead of silently forcing Legacy Mixed on reload.
- Rules Profile runtime can resolve Strict read-only for QA, but no profile switch UI/API is exposed yet.
- Adds profile activation/support metadata and multi-client runtime refresh plumbing.
- Adds dedicated M10A.0 smoke coverage.
- Historical M7-M9 regression smokes remain active on the v1.11 line.
- Foundry VTT 13.351 remains the verified target.

Next after PASS:
M10A.1 — Strict Registry + non-destructive Profile Conversion Preview.
