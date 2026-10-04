# Realm Guard / Torchbearer v1.13.0-qa.7 — M10D.6 TB2E Abilities / Skills Bounded Shadow

M10D.5 Nature was live-verified and closed on v1.13.0-qa.6.

- Adds a READ_ONLY shadow adapter for the PARTIAL Torchbearer 2E Abilities / Skills domain.
- Models Will and Health as raw Adventure abilities rated 1-6, Resources and Circles as Town abilities with the guide's 0/1-10 special-state boundary, and Precedence/Might as fixed-value references.
- Registers the 33 Skills named by the supplied Quick Rules Guide while preserving the 24-known-Skills character limit.
- Encodes the guide's exact Beginner's Luck mapping: 18 Skills use Will and 15 use Health. No unknown or unsourced Skill is inferred.
- Models new-Skill learning as Beginner's Luck attempts equal to Maximum Nature, then rating 2; no Skill Item is created.
- Models standard pass/fail advancement thresholds as passes=current rating and fails=current rating-1, with caps at 6 for Skills/Will/Health and 10 for Resources/Circles.
- Models the special Resources/Circles 0->1 route as a read-only threshold reference; Beginner's Luck remains forbidden for those abilities.
- Full Skill descriptions, Obstacle factors and suggested-help details referenced to DG160 remain unavailable/source-bounded.
- Resources/Circles taxation, treasure, ally and relationship effects remain deferred to their own domains rather than being duplicated here.
- No automatic Skill provisioning, learning, advancement or Actor/Item/Journal/setting mutation.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E profiles remain unchanged.
- QA advances to v1.13.0-qa.7. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.7.md.
