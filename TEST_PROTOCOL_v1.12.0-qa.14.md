# Realm Guard / Torchbearer v1.12.0-qa.14 — Live Test Protocol

**Milestone:** M10C.3 — MG2E Shadow Rule Adapters / Activation-Readiness Foundation  
**Foundry target:** v13.351  
**Stable baseline:** v1.11.0  
**Primary rule:** MG2E remains FOUNDATION_ONLY and read-only. Shadow adapters may calculate plans only; they may not own live gameplay or mutate campaign data.

## Gate A — Boot / release
- Install/update v1.12.0-qa.14.
- World boots without startup errors.
- Rules Profile Management, Rules Registry, Manual, Ranger/NPC sheets, Item sheets and Recruitment open.
- Console exposes `game.realmGuard.core.m10.mg2e`.

## Gate B — M10C.2 closure regression
- `mg2e` resolves independently with lineage only `mg2e`.
- profile version = 3
- FOUNDATION_ONLY / non-selectable / unsupported / non-live remain true.
- conversion preview still opens READ ONLY with writes planned = 0.
- no automatic profile switch occurs.

## Gate C — Shadow adapter status
Run `game.realmGuard.core.m10.mg2e.getStatus()` and verify:
- phase = M10C.3
- mode = MG2E_READ_ONLY_SHADOW_ADAPTERS
- Tests / Advancement / Beginner's Luck / Traits / Wises / Help / Nature / Recovery / Inventory / Conflict / Session / Circles / Natural Order / Creation foundation adapters are all true
- Actor / Item / Journal / settings writes are all 0
- liveApplication = false

## Gate D — Advancement / Beginner's Luck / Nature
Verify representative plans:
- rating 4 advancement requires 4 passes / 3 fails
- rating 1 requires 1 pass / 0 fails
- completed requirement advances and clears marks
- Beginner's Luck uses Maximum Nature attempts and opens the Skill at 2
- Beginner's Luck does not advance Will/Health
- Nature descriptors are Escaping / Climbing / Hiding / Foraging
- Tap Nature remains unavailable for Resources/Circles

## Gate E — Traits / Wises / Help
Verify:
- Trait L1 = +1D once/session
- Trait L2 = +1D twice/session
- Trait L3 = +1s on applicable tests
- I Am Wise = +1D ally and replaces ordinary Help
- Deeper Understanding = Fate / one failed die reroll
- Of Course! = Persona / all failed dice reroll
- no rated-Wise conversion or Wise Item writes occur

## Gate F — Conditions / Recovery
Verify:
- Injured self recovery = Health Ob4, failed self recovery routes to Healer Ob3
- Sick self recovery = Will Ob4, failed self recovery routes to Healer Ob4
- GM Turn recovery cost = 2 Checks
- recovery plans remain read-only and do not toggle Conditions

## Gate G — Gear / Conflict
Verify:
- inventory policy = LOOSE / MG2E_CARRY_LIMITS
- sample 2 weapons + 2 satchel items + armor is within guidance
- bulky weapon replaces normal weapon capacity
- relevant Gear guided bonus = +1D
- Fight action skills = Fighter / Nature / Fighter / Nature
- Fight Animal adds Hunter / Loremouse
- max action helpers = 2
- representative weapon/armor shadow values: Axe Attack +1s; Shield Defend +2D; Halberd Attack +1D / Maneuver -1D; Spear Feint +1s; Light Armor one absorb/conflict; Heavy Armor Maneuver -1D
- no Conflict live state is changed by these planners

## Gate H — Players' Turn / End Session / Circles
Verify:
- one free Player Turn test; later test = 1 Check
- Player Turn Conflict = 1 Check
- alternation applies except solo
- Fate max 3 / Persona max 4
- one MVP / one Workhorse and same player cannot receive both
- Embodiment cannot be awarded to everyone
- Circles hometown +1D and known Contact +1D
- Enmity Argument/Speech disposition = +3s
- no automatic NPC creation

## Gate I — Natural Order / Creation foundation
Verify:
- Natural Order Mouse 3 / Weasel 4 / Black Bear 9 / Moose 9
- Chipmunk remains absent from MG2E
- Militarist +2..+6 thresholds remain 20 / 100 / 200 / 2,000 / 20,000
- Scientist Resources Ob = target Nature
- Character Creation snapshot has all five Guard ranks
- liveAuthority = NONE
- liveCommit / provenanceWrite / relationshipWrite = false
- no Actor rank or creation provenance is written

## Gate J — Activation readiness / isolation
Run `game.realmGuard.core.m10.mg2e.activationReadiness()` and verify:
- shadowAdaptersReady = true
- activationGateClosed = true
- activationAvailable = false
- fullRecruitmentCommitReady = false
- dedicatedLiveRulesReferenceReady = false
- existingActorMigrationRequired = false
- blockers include explicit activation milestone
- `game.realmGuard.core.m10.activationAvailable("mg2e")` remains false
- `game.realmGuard.core.m10.switchProfile("mg2e")` rejects foundation-only with zero setting writes

## Gate K — Existing profile regression / data safety
Representative smoke:
- Legacy Mixed Skill / Versus / Beginner's Luck / Recruitment / structured inventory
- Strict rated Wises / Conditions / Conflict / Recruitment / Scale of Might
- MG1E QA activation / rated Wises / Sick recovery / Natural Order / live Recruitment
- no existing Actor / Item / Journal mutation after MG2E shadow calls
- no Wise rating conversion, Condition rename/delete, inventory rewrite, Talent/Token deletion or MG2E provenance write

## Gate L — Release / channel
- GitHub release tag/assets are v1.12.0-qa.14
- QA channel points to qa.14 only after automated verification
- Stable channel remains v1.11.0

## PASS
M10C.3 is CLOSED only after Gates A-L pass in Foundry VTT 13.351.
