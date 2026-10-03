# Realm Guard / Torchbearer v1.12.0-qa.19

## M10C.8 — MG2E Explicit QA Activation

M10C.7 / v1.12.0-qa.18 was confirmed FULL PASS by the user in Foundry VTT 13.351. M10C.8 authorizes explicit, reversible MG2E activation in QA builds. This is a new live QA candidate, not a claim that the activation round-trip has already passed Foundry QA.

- MG2E Rules Profile v3 and Character Creation Profile v3 are retained.
- MG2E is QA_ACTIVE and QA-selectable; stable builds and non-GM switching remain gated.
- Profile switching changes only activeRulesProfileId and activeRulesProfileVersion, with rollback and idempotence.
- M10C.7 parity evidence is recorded as a verified prior-release result; resetting runtime diagnostics cannot erase it.
- Actor Wise routing uses explicit Deeper Understanding (1 Fate, one failed die) and Of Course (1 Persona, all failed dice before Fate/open sixes). Selecting a Wise never grants the Legacy free reroll.
- MG2E typed Help supports I Am Wise for an ally, with no condition risk and with twist risk; a helper contributes one accepted source. Self Wise effects do not add Help dice.
- MG2E Conflict action/disposition tables and weapon/armor planners use the 2015 source adapters, not MG1E weapon aliases or Halberd mode choices.
- Active MG2E Recruitment uses the existing CORE M9 transactional creation path. It does not migrate existing characters.
- Armor absorption, weapon narrative exceptions, carry guidance and Wise usage-cycle benefits remain table/GM guidance through the source-owned planners; no automatic document conversion is introduced.
- No Actor/Item/Journal migration, automatic Wise conversion, species-to-rank inference, deletion or destructive conversion.
- Legacy Mixed / Strict / MG1E remain regression-covered; v1.11.0 remains STABLE / GOLD.

Live QA: TEST_PROTOCOL_v1.12.0-qa.19.md. QA channel promotion is allowed only after the full regression and published-package verification are green.
