# 1.14.0-qa.3 — Legacy Mixed acceptance test

Use a backed-up test world, select **Legacy Mixed**, update to QA.3 and reload. Open both a GM client and a player client that owns the captain. The player group assigns its cards through that captain; the GM controls opposition cards. Stable remains 1.13.1.

## End Session

1. Confirm Creed appears alongside Belief, Goal and Instinct. Persona Belief and Goal choices should align with the Fate choices.
2. Select Mortal Crisis: the review must show +1 Persona for Creed. Instinct includes beneficial and detrimental play.
3. Try assigning Teamworker / Workhorse and MVP to the same participant: the form must clear the conflicting choice and review must reject an invalid combination.
4. Select Embodiment for two participants: only the latest remains selected; a malformed submission with two must be rejected. Zero or one is valid, including a solo participant.
5. Award five Persona from eligible criteria and a nomination. All five must be awarded, including when the existing balance plus the reward exceeds five. Back preserves choices; Cancel awards nothing; finishing the same cycle again awards nothing.

## Start Conflict

6. Use the two search lists to add/remove Rangers and opponents. Start a new conflict later and check that the player list is remembered. GM-only characters and NPCs must not be added automatically to the initial player list.
7. Add two temporary opponents and one existing opponent. Start and finish/abort: the world Actor/Contact lists must not gain new documents.
8. Save goals and roll Starting Disposition. The normal Roll dialog should open directly, with the familiar applicable choices and styling.

## Equipment and cards

9. Confirm equipment is a separate step before card planning. Initial choices are blank; confirmation requires a declared item/tool for every active participant on that side.
10. Declare an inventory item. Unknown items must not acquire guessed bonuses. Create a Custom benefit referencing travel boots with a GM-agreed +1D; the inventory item itself must remain unchanged.
11. Confirm equipment in the GM and captain clients. Both sides must be ready before planning begins.
12. With one active player, choose three cards: no participant selector is necessary. With two players, assign alternating cards and verify alternation across exchanges. With three or more, A–B–A is allowed even if C has not acted; A–A–B is rejected.
13. Assign each GM card to a chosen opponent. Verify the correct opponent, equipment and roll source when each card is flipped.
14. Lock both plans. Opposing future choices must remain hidden; only the action explicitly flipped by GM is revealed.
15. Reduce a Ranger to zero individual Disposition. That Ranger cannot act or Help. Reassign remaining cards as needed; a sole survivor may act repeatedly. Nobody must remain blocked by a dead participant's planned card.
16. Resolve Maneuver Disarm against the declared Custom boots benefit. The benefit must stop applying for this conflict without deleting the inventory item or disabling another participant's similarly named item.
17. Continue to the next exchange: equipment preparation returns before card planning. Check small-window readability, folded explanations and scroll retention within a step.

## Normal and conflict rolls

18. Compare both kinds of roll dialogs. Check Persona, Trait, Nature, Wise, Token/Talent and Help where applicable; conflict modifiers must not be counted twice. Conflict Learning is recorded on resolution.
19. Prepare a Wise before rolling: it is used once and not offered again. With no prepared Wise, failures plus at least 1 remaining Persona offer a paid reroll. Accepting spends exactly one Persona; × spends nothing. With no Persona, the paid option is absent. Check the banner pulse and button contrast.
20. Spot-check the other active profiles in separate test worlds: their old dialogs, nomination rules, reward caps and conflict workflows remain. Do not activate TB2E for this patch. Startup should retain the previously accepted behavior.

Automated testing uses production modules, controlled Foundry fixtures and real Chromium forms with all system stylesheets. Live GM/player synchronization and your campaign's equipment definitions still require the above Foundry session. Report version, profile, step and observed result, with a screenshot where useful.
