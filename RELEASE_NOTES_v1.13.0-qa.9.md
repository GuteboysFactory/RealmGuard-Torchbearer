# Realm Guard / Torchbearer v1.13.0-qa.9 — M10D.8 TB2E Conditions Bounded Shadow

M10D.7 Fate / Persona / Resources was live-verified and closed on v1.13.0-qa.8.

- Adds a READ_ONLY shadow adapter for the PARTIAL Torchbearer 2E Conditions domain.
- Preserves the guide's Grind condition order separately from its recovery order instead of conflating the two.
- Models Fresh +1D except Resources/Circles; Angry's beneficial Trait/Wise block and GM-discretion +1 Ob guidance; Afraid's Help/Beginner's Luck block with Nature fallback; Exhausted's free-Instinct cost/Ob guidance; and stacked Injured/Sick -1D test penalties.
- Models the guide's zero-rating boundary: a Skill/Ability reduced to 0 by Conditions cannot be tested, benefited from, used to grant Help, or receive Persona; Nature fallback remains available where source-supported.
- Preserves Sick's practice/Mentor/advancement-log block as zero-write capability guidance.
- Explicitly refuses to automate Conflict disposition penalties because QR 41/44 state -1s for Hungry/Exhausted while QR 51 states -1D for Hungry/Exhausted/Injured/Sick.
- Preserves the QR44 Exhausted recovery phase text as unresolved CAMP/TEST rather than silently correcting it.
- Models Injured serious-harm and Sick disease/poison/madness/grief death escalation only as warning/guidance plans; no Dead state is applied.
- Dead remains source-incomplete beyond its placement in the supplied condition order.
- Full recovery execution remains deferred to the Recovery domain.
- No Condition application/removal, Effect mutation, death state, Actor/Item/Journal/setting mutation or TB2E activation.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E profiles remain unchanged.
- QA advances to v1.13.0-qa.9. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.9.md.
