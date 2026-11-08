# 1.14.0-qa.3 — Legacy Mixed session routines and simpler conflicts

QA.3 implements the collected QA.2 feedback **only for Realm Guard Legacy Mixed**. Stable remains 1.13.1. Strict Realm Guard, Mouse Guard 1E/2E and TB2E retain their previous workflows and reward rules. The accepted startup optimization is preserved. No Tome work, TB2E activation or stable promotion is included.

## End Session

Creed is displayed with Belief, Goal and Instinct. Mortal Crisis awards 1 Persona when Creed causes inner turmoil or is fiercely defended at great risk. Persona choices now align Belief first and Goal second with the corresponding Fate choices; Instinct explicitly includes beneficial or detrimental play.

Teamworker / Workhorse and MVP must go to different participants. At most one participant may receive Embodiment, enforced both in the form and on review. All earned Persona is awarded without the old four-point session cap or truncation at the old balance maximum. Manual Persona adjustments retain that balance. The other profiles retain their prior caps and validation. Back, Cancel and duplicate-cycle protection remain.

## Conflict setup and equipment

- Two searchable add/remove lists replace the large participant checklist. The player roster is remembered independently of End Session. Both sides accept existing characters/NPCs; the GM can create multiple temporary opponents that exist solely in the current conflict state, without creating Actors or Contacts.
- Each exchange begins with a separate equipment step. Each participant explicitly declares a weapon, inventory item or Custom tool before the hidden cards are planned. Nothing is automatically selected as Unarmed.
- Any inventory item may be declared; unknown equipment receives no invented bonus. Custom permits a table-approved effect and an optional inventory reference, for example travel boots +1D. Temporary opponents cannot save campaign content.
- Maneuver Disarm can disable the declared Custom or inventory benefit. It does not delete or automatically damage the inventory item. Disabled benefits are scoped to their participant and conflict; an invalidated tool grants no automatic Unarmed penalty.
- Goals, allocations and explanations are folded into expandable sections. Scroll/expanded information is retained during updates within a step; changing steps starts at the relevant new content.

## Cards and rolls

The group manually assigns cards through its captain. With one active player, the actor is selected automatically and the selector is hidden. Two players alternate, including across exchange boundaries. With three or more, the group chooses freely, without a forced equal-distribution rule; nobody takes two consecutive actions while another active participant remains. Knockouts invalidate exhausted assignments and permit a sole survivor to act repeatedly. GM cards can likewise be assigned manually among multiple opposition participants. Opposing card choices remain hidden until each action is flipped.

Optional GM Nature/fixed/manual disposition methods remain behind a folded menu. Calculated Starting Disposition and action rolls now use the **same production roll dialog as ordinary character-sheet rolls**, with applicable Traits, Persona, Nature, Wises, Tokens, Talents and Help. Conflict context is folded away; modifiers and permitted helpers follow the conflict. Player-turn currency is not spent and Learning is recorded by conflict resolution.

A Wise prepared before the roll is used once as part of that roll and is not offered again. If no Wise was prepared, a relevant unused Wise can instead reroll failures after the initial dice for **1 Persona**, when available. Declining costs nothing; availability and cost are checked again on acceptance. This applies to ordinary and conflict rolls. Pending chat choices have a conspicuous pulsing banner, readable buttons and a clear × decline control; reduced-motion preferences keep a static highlight.

## Verification

The automated regression suite and controlled Chromium tests cover production modules, all system stylesheets, real form/button callbacks, five-point Creed rewards, nomination exclusions, player-roster persistence, multiple temporary opponents without Actor creation, ordinary roll-dialog reuse, mandatory equipment, per-card actors, hidden flips, Custom disarm without inventory deletion, Wise costs/declines/reuse and other-profile isolation.

This is controlled browser testing with Foundry document/settings fixtures, **not live multiplayer acceptance in Foundry**. Follow TEST_PROTOCOL_v1.14.0-qa.3.md with a GM and a player client before acceptance. Stable publication requires separate approval.
