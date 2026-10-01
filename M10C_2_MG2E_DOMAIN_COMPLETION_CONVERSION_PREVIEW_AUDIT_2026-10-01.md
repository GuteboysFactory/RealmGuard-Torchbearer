# M10C.2 — MG2E Domain-Completion Audit + Generic Conversion Preview Routing

**Date:** 2026-10-01  
**Source authority:** *Mouse Guard Roleplaying Game: Second Edition* (2015)  
**Profile id:** `mg2e`  
**Profile version:** 2  
**Status:** QA CANDIDATE / FOUNDATION_ONLY

## Boundary

M10C.2 completes the source-domain manifest needed before any MG2E shadow/live routing work.

MG2E remains:

- `foundationOnly: true`
- `selectable: false`
- `supported: false`
- `activationState: FOUNDATION_ONLY`
- `liveRuleAuthority: false`

The conversion preview is read-only and writes no Actors, Items, Journals or world settings.

## Advancement

Source: pp. 225-228.

- Advancement requires passed tests equal to current rating and failed tests equal to rating minus one.
- Ratings 0 and 1 require one passed test.
- Advancement is immediate when requirements are met.
- Extra tests are cleared after advancement.
- Only one advancement test per ability/skill per conflict or scene.
- Disposition rolls do not count.
- An unresolved tie does not count.
- Beginner's Luck attempts toward a new Skill are counted against current maximum Nature.
- The new Skill opens at rating 2.
- Beginner's Luck does not advance Will or Health.
- Character sheet capacity is 24 combined Skills and Wises.

## Gear / carrying

Source: pp. 34-35, 116-120.

- Relevant non-conflict Gear may grant +1D.
- Common carrying guidance: two weapons, or one bulky weapon such as a halberd/Black Axe; a satchel or bag carrying one or two Gear/supply items; possibly armor; personal items are narrative.
- Foundry structured placement remains presentation metadata only in this foundation.
- Fighting weapons and armor are encoded as source-owned MG2E 2015 contracts.

## Conflict

Source: pp. 98-123.

- Conflict uses sets of three actions: Attack / Defend / Feint / Maneuver.
- Up to two teammates may Help an action roll.
- Starting Disposition uses the source Conflict Type table.
- Mouse Nature may be used as a Disposition base only when the conflict matches Mouse Nature.
- Action skills are source-owned for Argument, Chase, Fight, Fight Animal, Negotiation, Journey, Speech, War and Other.
- Fight: Fighter / Nature / Fighter / Nature.
- Fight Animal adds Hunter for Attack/Feint and Loremouse for Defend/Maneuver.
- Negotiation Feint/Maneuver allow Manipulator or Persuader.
- Disarm may remove a weapon, Gear, Trait or animal weapon for the remainder of the conflict.
- MG2E 2015 fighting weapon, armor, Weapons of Wit, military weapon and chase-tool rules remain source-owned content.

## Players' Turn / End Session

Source: pp. 49-52, 73-83.

- Each player begins the Players' Turn with one free test.
- Additional tests cost one Check.
- Players may not take two tests in a row while other players can act.
- Solo play is exempt from alternation.
- Checks may be donated to patrolmates with no Checks.
- Starting a Players' Turn conflict costs one Check.
- Trait-against Checks are earned in the GM's Turn, not the Players' Turn.
- GM's Turn recovery costs two Checks.
- Fate: max three/session from Belief, unfinished Goal progress and Instinct.
- Persona: max four/session from Goal, playing against Belief, MVP, Workhorse and Embodiment.
- MVP and Workhorse are single awards and cannot go to the same player.
- Embodiment may go to multiple players but not everyone.

## Natural Order

Source: pp. 221-223.

MG2E has its own nine-rank Natural Order definition. It is not inherited from MG1E.

Important edition-isolation differences are encoded explicitly:

- MG2E rank 3: Mouse / Bat / Young Weasel.
- MG2E rank 4: Weasel / Mink / Rabbit / Flying Squirrel / Ground Squirrel / Snake / Bullfrog.
- No MG1E-only Chipmunk or Star-Nosed Mole entries are silently inherited.
- Fighter/Hunter: kill through +1, capture/injure through +2, run off beyond +2.
- Militarist thresholds for +2 through +6: 20 / 100 / 200 / 2,000 / 20,000 mice.
- Scientist applies from +2; Resources Ob equals target Nature; Scientist Attack/Maneuver; appropriate craft/trade Defend/Feint; animal Nature for Disposition and actions.

No Actor Natural Order rank is inferred or written.

## Recruitment completion

Source: pp. 299-313.

Profile v2 records the five Guard-rank templates including Will, Health, rank Skills, age ranges, Resources and Circles.

Additional source contracts:

- new Skill starts at rating 2; repeat choices increase it up to 6
- Nature starts at 3 before the three Nature questions
- rank-based unrated Wise counts = 1 / 1 / 2 / 3 / 4
- Tenderpaw chooses Code of the Guard-wise or Legends of the Guard-wise
- Guard Captain includes Lockhaven-wise or Matriarch-wise
- Tenderpaw mentor is a current player character, preferably Patrol Leader
- more experienced characters use an NPC mentor or PC with Oldfur
- Enemy is optional and may be an appropriate named enemy; this is source behavior, not a house-rule exception
- Tenderpaw starts without a cloak
- starting rewards = 1 Fate / 1 Persona
- starting Gear includes one weapon choice plus appropriate job tools

M10C.2 does not create an MG2E transactional CharacterCreationProfile. CORE M9 live commit remains disabled.

## Source inconsistency note

The Winter Session text on p. 158 contains wording that a new Wise starts at rating 2. The dedicated Wises chapter (pp. 270-272) and Recruitment (p. 306) explicitly define MG2E Wises as unrated. M10C.2 records the dedicated Wises/Recruitment model and flags the Winter wording as a source inconsistency rather than silently treating Wises as rated.

## Conversion Preview

M10C.2 adds a generic MG2E preview route in:

- Rules Profile Management
- Rules Registry
- `game.realmGuard.core.m10.previewMg2eConversion()`
- `game.realmGuard.core.m10.openMg2eConversionPreview()`

The preview covers profile ownership, Wise/Trait differences, advancement, Nature, Conditions, inventory, Conflict, Session, Natural Order, disabled project-only progression and future Recruitment.

Safety contract:

- Actor writes: 0
- Item writes: 0
- Journal writes: 0
- Setting writes: 0
- profile switch: false
- destructive conversion: false

## PASS gate

M10C.2 closes only when:

1. profile v2 resolves independently as `mg2e`
2. source-domain contracts above are available read-only
3. MG2E Natural Order resolves from its own definition
4. read-only preview opens from Profile Management / Registry
5. activation remains unavailable in UI and API
6. Legacy Mixed / Strict / MG1E regressions remain green
7. no campaign-data mutation occurs
8. automated release pipeline passes
9. Foundry VTT 13.351 live QA passes
