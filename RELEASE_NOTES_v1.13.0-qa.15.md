# Realm Guard / Torchbearer v1.13.0-qa.15 — M10D.14 TB2E Might / Precedence Bounded Shadow

M10D.13 Circles / Relationships was live-verified and closed on v1.13.0-qa.14.

- Adds a READ_ONLY shadow adapter for the PARTIAL Torchbearer 2E Might / Precedence domain.
- Models the QR 68-69 Might scale (1-8) strictly as a reference lookup; it does not infer Might for unlisted stocks/species/entities.
- Models the player goal limits exactly as summarized: Capture targets up to Might 3, Kill up to Might 4, Drive Off up to Might 5.
- Models +1s per point of greater Might on successful/tied actions in Kill, Capture and Drive Off conflicts, preview-only.
- Models the mounted boundary: Rider skill is required before combat to use mount Might, but the Rider test details are not supplied, so no roll/Ob is invented.
- Models the guide requirement to review/reprocess compromises and possible goals when Might changes after a conflict.
- Models the QR 70-71 Precedence scale (0-7) strictly as a reference lookup; it does not infer Precedence for unlisted characters.
- Models source-listed Precedence eligibility: Convince <= own Precedence, Haggle <= own+1, Convince Crowd members <= own+2, Trick/Riddle unrestricted by Precedence.
- Models +1s per point of greater Precedence on successful/tied actions in Negotiate, Convince and Convince Crowd conflicts, preview-only.
- Full exceptional interactions remain source-incomplete and are not inferred.
- No live conflict success modifiers, Might/Precedence changes, Rider rolls, compromise/goal changes or document/settings writes.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E profiles remain unchanged.
- QA advances to v1.13.0-qa.15. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.15.md.
