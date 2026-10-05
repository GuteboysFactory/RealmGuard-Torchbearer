# Realm Guard / Torchbearer v1.13.0-qa.10 — M10D.9 TB2E Recovery Bounded Shadow

M10D.8 Conditions was live-verified and closed on v1.13.0-qa.9.

- Adds a READ_ONLY shadow adapter for the PARTIAL Torchbearer 2E Recovery domain.
- Models the guide's recovery order separately from Grind condition order.
- Models standard recovery tests: Angry Will Ob2, Afraid Will Ob3, Exhausted Health Ob3, Injured Health Ob4, Sick Will Ob3.
- Camp recovery previews one Check per test; Town recovery without accommodation previews +1 Lifestyle per recovery test. No Check/Lifestyle mutation occurs.
- Preserves the guide's general once-per-condition/phase boundary and blocks duplicate shadow attempts for the same Condition/phase.
- Models Hungry/Thirsty recovery routes for Adventure (rations + wine), Camp (Scavenger/Survivalist/Hunter plus Cook preparation) and Town (friends/certain accommodations), without inventing missing Camp obstacle factors.
- Models Flophouse, Hotel and Inn recovery allowances/bonuses exactly as supplied; Home remains free lodging with recovery-test quota explicitly unspecified.
- Models Hotel automatic Hungry/Thirsty + Exhausted recovery and Inn automatic Hungry/Thirsty recovery as previews only.
- Preserves Exhausted QR44 "Camp/Test" wording as an explicit source boundary while also recording generic Camp/Town and Town-accommodation support. Bonus-source stacking is left unspecified and not summed automatically.
- Models Healer out-of-order recovery for Injured and Sick with supplied severity Obstacles.
- Models Grit Your Teeth / Sweat Out The Fever failure consequences only as previews: rating loss target, condition removal and advancement-reset intent; no writes occur.
- Models Fresh eligibility from the guide: in town, no conditions, Nature untaxed, Lifestyle maintenance passed.
- Nature recovery execution stays delegated to M10D.5; Lifestyle resolution stays delegated to M10D.7.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E profiles remain unchanged.
- QA advances to v1.13.0-qa.10. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.10.md.
