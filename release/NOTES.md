# Realm Guard / Torchbearer v1.13.0-qa.18 — M10D.17 Controlled TB2E Wises Handoff

- Adds a QA-runtime-only, GM-only path to select and record TB2E-owned Wises plans.
- Reuses the qa.17 VERIFIED Wises shadow adapter; no Wises rules are reimplemented.
- The handoff records only in-memory evidence. It does not evaluate or reroll dice, spend Fate/Persona, write Actor/Item/Journal/settings data, activate TB2E, or switch profiles.
- Rejects missing/unrelated Wises, unavailable resources, ineligible dice and unknown effects without fallback.
- Legacy Mixed, Strict Realm Guard, MG1E and MG2E remain outside the TB2E handoff.
- Stable remains v1.12.0.

Foundry VTT 13.351 validation: TEST_PROTOCOL_v1.13.0-qa.18.md.
