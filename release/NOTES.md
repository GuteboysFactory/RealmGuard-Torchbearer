Realm Guard / Torchbearer v1.6.0-qa.4 — CORE M4 Real Nature Shadow Parity.

v1.6.0-qa.2 verified the real TEST_RESOLVED Advancement shadow bridge and v1.6.0-qa.3 added the approved scrollable roll-dialog UX. qa.4 now observes real Legacy Mixed Nature use and compares the resulting Nature state against CORE NatureService predictions while Legacy remains the sole live writer.

New in qa.4:
- adds `m4-nature-shadow-parity.mjs`
- observes real Nature use through Skill, Ability, Beginner's Luck, Automatic Versus and Nature Versus roll paths
- compares Legacy Nature tax against CORE `NatureService.taxForResult`
- compares resulting Current, Maximum and collapse state against CORE `previewTax`
- covers Tap Nature within / against, direct Nature within / against, ties and double-tap semantics
- exposes Nature parity diagnostics under `game.realmGuard.core.m4.natureParity`
- adds headless Nature shadow parity smoke QA
- preserves the qa.3 scrollable Roll Dialog UX

Important preservation:
- Legacy Mixed remains sole live authority for Nature writes
- CORE NatureService is observation/prediction only
- M2 remains SHADOW_COMPARE / live OFF
- M3 remains SHADOW_PARITY / live OFF
- M4 remains SHADOW_SERVICES / live OFF
- Advancement shadow remains enabled and unchanged
- Conflict remains on the Legacy adapter path until M6
- no destructive migration or strict-profile correction

QA protocol: TEST_PROTOCOL_v1.6.0-qa.4.md
Foundry target: v13.351.
Approved baseline: v1.6.0-qa.3 PASS.
