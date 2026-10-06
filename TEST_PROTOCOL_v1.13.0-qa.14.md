# TEST PROTOCOL — v1.13.0-qa.14

## M10D.13 Foundry VTT 13.351 gate — TB2E Circles / Relationships bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Circles coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.14; no boot errors.
- m10d status: phase M10D.13, shadowReadyDomains includes circles, circlesShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- circles.getStatus(): PARTIAL, TB2E_CIRCLES_RELATIONSHIPS_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.
- circles.model(): range 1-10, primaryPhase TOWN, obstacle factors unavailable/do not infer.

### Gate B — Circles outcomes / Reputation
- Pass => targetFound=true, allyRecordPreview=true, futureAllySearchBonusDice=1.
- Fail => targetFound=true, allyRecordPreview=false, consequence options Twist/Condition/Possible Enemy, GM_MANUAL.
- level 2 in hometown => +0D; level 3 in hometown => +1D; level 5 outside hometown => +0D.
- no NPC/relationship/Circles mutation.

### Gate C — starting social relationships
- Friend + Parents + Enemy, no Mentor, Warrior level 2, adventurer Friend => selected 3, starting Circles 4.
- Friend adventurer preview level 2 and levels with character.
- Parents => free-home candidate.
- no Mentor => self-made gold pouch 2D on Belt preview.
- Enemy => level 3, class authority GM.
- all four options => blocked STARTING_RELATIONSHIP_OPTION_LIMIT_EXCEEDED.
- Magician without Mentor => blocked MAGICIAN_MUST_SELECT_MENTOR.
- no creation grants/writes.

### Gate D — Loner / evolution / lodging / obstacle boundary
- Loner Warrior level 2 => starting Circles 1, Enemy level 3, remaining questions skipped, Loner trait preview only.
- Loner plus Parents/Mentor/Enemy input => blocked because remaining questions are skipped.
- Loner Magician => explicit unresolved source boundary, not inferred.
- Friend -> Enemy evolution => allowedByGuide=true, ROLEPLAY_GM_MANUAL, no mutation.
- Friend or Parents in Town => freeHomeLodging=true.
- no relationship in Town => freeHomeLodging=false.
- obstacleBoundaryPlan => completeFactorsAvailable=false, obstacle=null, testExecutionAllowed=false.

### Gate E — zero-write snapshot
- Snapshot Actors/Items/Journals/profile settings.
- Call representative pass/fail, reputation, starting, Loner, evolution and lodging plans.
- unchanged=true and all mutation flags false.

### Gate F — Existing profiles / release
- representative MG2E Circles/normal Skill roll and Recruitment/Create Ranger remain normal.
- qa.14 release assets/workflow green.
- QA=1.13.0-qa.14; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Circles / Relationships shadow contract. It does not authorize TB2E activation, Circles rolls/factors, NPC creation, relationship persistence, creation grants or other live writes.
