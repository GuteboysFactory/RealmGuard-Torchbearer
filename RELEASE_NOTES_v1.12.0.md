# Realm Guard / Torchbearer v1.12.0 — STABLE

Stable promotion of the user-verified v1.12.0-qa.20 code. M10C.8 is FULL PASS / VERIFIED / CLOSED in Foundry VTT 13.351.

- MG2E is now supported stable: Rules Profile v3 and Character Creation Profile v3.
- Promotion changes only version/channel/release metadata, MG2E support metadata and status copy. Gameplay and activation implementation are unchanged from qa.20.
- Activation remains separate, explicit, GM-only, reversible and settings-only. Legacy Mixed remains the default; existing worlds are not automatically switched.
- Conversion Preview remains READ_ONLY / zero-write. No Actor, Item or Journal migration, automatic Wise conversion, species-to-rank inference or destructive conversion.
- Legacy Mixed / Strict / MG1E regression coverage is retained. MG1E remains QA-only.
- QA channel stays on 1.12.0-qa.20; Stable replaces 1.11.0 only after published assets are verified.

Promotion sanity: `TEST_PROTOCOL_v1.12.0.md` — boot → Legacy → MG2E → reload → Legacy.
