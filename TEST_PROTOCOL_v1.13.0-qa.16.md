# TEST PROTOCOL — v1.13.0-qa.16

## M10D.15 Foundry VTT 13.351 gate — TB2E Character Creation bounded completion

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Character Creation coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.16; no boot errors.
- m10d status: phase M10D.15, shadowReadyDomains includes creation, creationShadowReady=true.
- liveReady=false, activationAvailable=false, creationCommitAllowed=false, all writes=0.
- creation.getStatus(): PARTIAL, TB2E_CHARACTER_CREATION_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.
- existing CharacterCreationProfile remains foundationOnly=true/liveCommit=false.

### Gate B — class/stock / ability / redistribution
- Burglar => Halfling, Will5 Health3, Fighter3.
- Magician 6/2 => valid Human; 7/1 => blocked cap-6 distribution.
- Warrior redistribution Fighter4/Hunter2/Commander3/Mentor2/Rider2 => total 13 preserved, valid.
- adding Scout => blocked REDISTRIBUTION_CANNOT_ADD_NEW_SKILLS.
- no Actor/Skill writes.

### Gate C — upbringing / home / social / specialty / Wises
- Human Criminal with rating0 => 3; Human Haggler rating3 => 4.
- Elf cannot use Human Upbringing.
- Elfhome + Elf + Healer + Calm => valid, Healer0 => 3, trait level preview1.
- Human Elfhome => blocked.
- Orator2 Social Grace => 3.
- Scout Specialty untaken => 3; already taken => blocked.
- Dwarf Dwarven Chronicles + Troll-wise => two starting Wises.
- Human custom Wise => one only; second starting Wise blocked.

### Gate D — Nature questionnaire / relationships / equipment
- Dwarf Revenge + Dig Deeper + Spend Gold => Nature5, Resources1.
- Elf Enchant + Retreat Hide + Struggle/Curious => Nature4, Singing->Enchanting, home Trait replacement Curious.
- Human Prepare + Listen Elders/Politics-wise + Fight/Defender => Nature3, class Trait level2, second Wise Politics-wise, home Trait replacement Defender.
- relationshipsBoundary => M10D.13_CIRCLES_SHADOW.
- Magician equipment => spellbook, 3 first-circle spells, memory palace1, 2d6 visual selection table not transcribed.
- Theurge => two minor relics, 3d6 visual selection table not transcribed.
- no Trait/Wise/Gear/relationship grants.

### Gate E — drives / level1 / final details / zero-write snapshot
- level3 drives => Creed unlocked; Belief/Instinct/Goal present; semantic judgement PLAYER_GM_MANUAL.
- Ranger level1 includes wilderness Camp-event +1 boundary.
- Elf age60 valid and Fresh preview true; age59 blocked.
- snapshot Actors/Items/Journals/profile settings around representative calls => unchanged=true.
- all mutation flags false.

### Gate F — Existing profiles / release
- representative MG2E normal Skill roll and Recruitment/Create Ranger remain normal.
- Torchbearer CharacterCreationProfile still refuses buildCommitSpec.
- qa.16 release assets/workflow green.
- QA=1.13.0-qa.16; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Character Creation shadow completion. It does not authorize TB2E activation, executable creation, Actor/Item creation, automated grants, spell/relic table execution or inferred missing DG rules.
