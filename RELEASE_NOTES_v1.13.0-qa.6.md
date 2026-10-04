# Realm Guard / Torchbearer v1.13.0-qa.6 — M10D.5 TB2E Nature Bounded Shadow

M10D.4 Tests / Dice was live-verified and closed on v1.13.0-qa.5.

- Adds a READ_ONLY shadow adapter for the PARTIAL Torchbearer 2E Nature domain.
- Models Current Nature and Maximum Nature separately, with the guide's 0-7 range and stock descriptor reference for Dwarf, Elf, Halfling and Human.
- Models Nature substitution for unavailable or zero-rated Skills using Current Nature dice. Within-descriptor substitution has no tax; outside-descriptor failure plans tax equal to margin of failure.
- Models Channel Nature as 1 Persona before the roll, adding Current Nature as +D, forbidden for Resources/Circles. Within descriptors has no tax; outside descriptors plans tax 1 on success or margin of failure on failure.
- Models Nature recovery previews for Respite, eligible Prologue, missed-session return, eligible leaving-town Lifestyle recovery and voluntary Conserve.
- Models the zero-current-from-tax loss procedure as guidance only: non-class Trait change, Maximum Nature -1, tax erased, Nature advancement erased, and retirement guidance if Maximum reaches 0.
- Models Nature advancement using Maximum Nature as the basis; advancing increases Current and Maximum together, preserving the tax difference. Reaching 7 produces an end-of-session retirement check only.
- No automatic retirement, Trait mutation, resource spend, tax application, advancement write or Actor/Item/Journal/setting mutation.
- No stock/species inference is performed for existing Actors.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E profiles remain unchanged.
- QA advances to v1.13.0-qa.6. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.6.md.
