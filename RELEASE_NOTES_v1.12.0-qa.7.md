# Realm Guard / Torchbearer v1.12.0-qa.7 — M10B.7 Character Creation Profile Routing

Built after v1.12.0-qa.6 M10B.6 passed full live Foundry VTT 13.351 QA.

This QA build moves Character Creation profile selection and Recruitment presentation behind the generic Rules Profile capability layer while keeping CORE M9 as the single Character Creation engine.

Highlights:
- MG1E foundation advances to profile v8 and remains FOUNDATION_ONLY, non-selectable and non-live.
- Adds a source-owned Mouse Guard 1E CharacterCreationProfile for shadow/draft/review/commit-plan QA.
- MG1E foundation Creation covers Guard Rank, age/Will/Health, Mouse Nature questions, hometown grants, check-built Skills/rated Wises, Resources/Circles, Traits, relationships, cloak, B/G/I, loose Gear and starting Fate/Persona.
- CORE M9 selects Legacy or Strict Creation through generic profile routing instead of direct Strict identity checks.
- Recruitment Mentor, Enemy and Wise presentation is capability-driven rather than using binary Strict branches.
- Historical Strict Character Creation API remains as a compatibility wrapper over the generic M10B.7 provider.
- Legacy Mixed and Strict Realm Guard live Recruitment semantics remain unchanged.
- MG1E creation planning is shadow-only: no Actor, Item, relationship or setting writes and no automatic NPC creation.
- No MG1E activation and no automatic character/profile conversion.
- v1.11.0 remains STABLE / GOLD.
