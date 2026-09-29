# Realm Guard / Torchbearer v1.12.0-qa.11 — M10B.11 MG1E Selectable QA Activation

Built after v1.12.0-qa.10 passed Gates A-L in Foundry VTT 13.351 and closed M10B.10.

Highlights:
- advances the Mouse Guard 1E Rules Profile to v11
- changes MG1E from FOUNDATION_ONLY to QA_ACTIVE
- allows MG1E activation only when the running system version is a QA build
- keeps stable runtime unable to activate MG1E
- preserves read-only conversion preview plus explicit GM confirmation before switching
- keeps profile changes settings-only: active profile id + version only
- preserves reversible Legacy Mixed / Strict / MG1E switching
- refreshes the active Rules Profile runtime and emits the existing profile-change hook
- retains reload guidance after every supported profile switch
- activates the MG1E READY_WHEN_ACTIVE CORE M9 Recruitment transaction only while MG1E is actually active
- enables live MG1E provenance and CORE M8 relationship writes for newly created MG1E characters
- does not migrate existing Actors or Items
- does not infer Wise ratings
- does not infer Natural Order rank from species
- does not rewrite Conditions, Gear placement, Talents or Tokens of Power
- adds M10B.11 QA smoke coverage for stable-runtime rejection, QA activation, live CORE M9 creation routing and Legacy → MG1E → Legacy → MG1E round-trip
- v1.11.0 remains STABLE / GOLD
