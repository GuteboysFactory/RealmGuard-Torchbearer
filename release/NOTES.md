Realm Guard / Torchbearer v1.11.0-qa.7 — M10A.6 Strict Character Creation

Built after v1.11.0-qa.6 passed live Foundry VTT 13.351 QA.

This build does not activate Strict Realm Guard. Legacy Mixed remains the sole live gameplay and Character Creation profile.

Highlights:
- Adds a read-only Strict Realm Guard CharacterCreationProfile on the existing CORE M9 engine.
- Reuses source-backed Realm Guard v1.6 Recruitment structure instead of duplicating the creation engine.
- Strict Wises start rated from Recruitment checks (+1 rating, max starting 6) and receive normal Pass/Fail learning fields.
- Strict personal Enemies are limited to Dúnadan, Dwarf, Elf, Hobbit or Man; the Legacy Enemy-servant house rule is unavailable in Strict.
- Adds source-specific Mentor validation for Recruit, Scout/Veteran and Captain/Lord Stations.
- Extends read-only creation party context with Station, age and Traits for mentor validation.
- Makes creation preview condition projection profile-aware.
- Strict creation plans Hungry & Thirsty, Angry, Tired, Injured and Strained; Healthy is derived; Fresh/Afraid/Sick are excluded as defaults.
- Strict inventory is LOOSE while paper-doll placement metadata may remain as presentation.
- No Strict Level/Talent grants.
- CORE M8 relationship normalization and CreationProvenance remain in the future activation contract.
- Strict commit plans are preview-only: liveExecution, provenanceWrite and relationshipWrite remain false.
- Full Strict step preflight is required before commit preview.
- Overlapping CORE/step validation errors are deduplicated; a duplicate Specialty conflict is reported once with the richer contextual message.
- Legacy Mixed Recruitment remains behaviorally unchanged.
- Strict profile advances to version 7 / M10A.6 and remains PREVIEW_ONLY.
- Foundry VTT target remains 13.351.

Next after PASS:
M10A.7 — Scale / Docs / Rules Reference, preceded by a fresh read-only audit.
