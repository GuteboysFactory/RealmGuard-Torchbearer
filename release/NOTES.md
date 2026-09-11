Realm Guard / Torchbearer v1.5.0-qa.6 — CORE M3 Beginner's Luck Versus UI bridge + focused parity QA.

qa.5 completed every requested regression except Beginner's Luck Versus because the Legacy backend path existed but the Ranger sheet did not expose a Versus toggle for untrained Skills. qa.6 closes that usability gap so the real gameplay path can be exercised normally.

New in v1.5.0-qa.6:
- adds a visible VERSUS toggle to every untrained Skill row
- the toggle persists through the existing role.system.versus flag
- uses the existing Beginner's Luck roll dialog/opponent selection flow; no new resolution path is introduced
- retains qa.5 Beginner's Luck Versus shadow capture and CORE parity logic
- focused QA now covers both non-tie and resolved-tiebreak Beginner's Luck Versus through the normal character sheet UI

Preserved:
- Legacy Mixed remains sole live authority
- Test Engine remains SHADOW_PARITY / live OFF
- Effect Engine remains SHADOW_COMPARE / live OFF with six verified providers
- no migration, no CORE state mutation, no gameplay takeover

QA protocol: TEST_PROTOCOL_v1.5.0-qa.6.md
Foundry target: v13.351.
Approved regression baseline: all qa.5 checks except UI-blocked Beginner's Luck Versus were reported PASS.
