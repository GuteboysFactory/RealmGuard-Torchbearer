# 1.13.0 stable — supported profiles acceptance checks

Scope: publish existing usable Legacy Mixed, Strict Realm Guard, Mouse Guard 1E and Mouse Guard 2E functionality. Further Torchbearer 2E integration is deferred by the user.

## Prior evidence and current checks
- MG1E: project roadmap and UPDATE_LOG record M10B.11 Gates A–L FULL PASS / VERIFIED / CLOSED in Foundry 13.351 on 1.12.0-qa.11. This includes reversible profile selection, reload, live rules routing, Recruitment/CORE M9, rollback, data safety and multi-client refresh.
- Strict and MG2E retain their existing supported stable status and source-owned rules.
- The release adds stable MG1E availability and hides TB2E QA opt-in in stable. Its regression tests verify all four supported profiles are selectable in stable, require a GM, preserve campaign documents, and authorize creation only for the active profile.
- TB2E stays blocked in stable even when a world retains `tb2eWizardQaEnabled=true`; QA-only development and the existing qa.29 update channel are preserved.
- The release workflow must pass syntax checks, every smoke test, preflight, ZIP validation and downloaded-asset verification before moving the stable channel. Consult the linked GitHub Actions release run; a test file alone is not a passing result.

## User checks after updating
1. If a test world uses the TB2E QA profile, switch back to its prior supported profile before moving to stable. Use `main/channels/stable/system.json` as the update manifest; the QA manifest continues serving qa.29.
2. Confirm the installed version is 1.13.0 and that the world's previous supported profile remains selected.
3. Open existing character sheets and verify their skills, Wises, Conditions, Gear, relationships and Overview fields are preserved.
4. In Manage Rules Profile, confirm Legacy Mixed, Strict, MG1E and MG2E are available. Profile switches require GM confirmation and a reload. Switching there and back must not convert or delete campaign documents.
5. In a test world, create an MG1E character through the existing Recruitment wizard and check its final review, created data and reload persistence. Exercise Back and Cancel; Cancel creates nothing.
6. Check an ordinary roll, Help/Wise use, a Conflict and the session tools under the selected supported profile against its existing behavior. There is no newly added TB2E gameplay automation to test in this stable release.
7. Confirm stable offers no TB2E activation and no Enable TB2E character creation QA setting. Read-only preview information may remain visible.

Existing recorded Foundry results are prior evidence. These post-update checks must not be reported as newly user-passed until the user confirms them.
