# Realm Guard / Torchbearer v1.11.0-qa.11

## M10A.9 — Stable Activation Candidate

This candidate closes the gap between the verified M10A.8 QA activation flow and a stable-channel Strict Realm Guard profile.

- Strict Realm Guard profile advances to **v10 / SUPPORTED**.
- Strict selection no longer depends on the system version containing `-qa.`.
- Legacy Mixed remains the default compatibility profile.
- Conversion preview and explicit GM confirmation remain in place.
- Profile switching remains reversible and settings-only.
- No automatic Wise rating, Level/Talent deletion, Condition cleanup or inventory migration is introduced.
- Existing dormant profile-specific data is preserved for rollback safety.
- Manual, Rules Registry, Strict Rules Reference and Profile Management use supported-profile wording.
- M10 regression smokes are extended through M10A.9, including a simulated stable `1.11.0` activation test.
- qa.10 Quick NPC Provider API is carried forward unchanged.

**Status:** QA / stable activation candidate. v1.10.0 remains GOLD until the M10A.9 closure protocol passes.
