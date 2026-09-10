# TEST PROTOCOL - Realm Guard / Torchbearer v1.0.8.44

**Build:** v1.0.8.44 QA  
**Foundry target:** 13.351  
**GOLD/public baseline:** v1.0.8.3  
**Primary focus:** dropdown regression repair + Roll/Conflict chat readability  

Mark each item PASS / FAIL and add a short note for any FAIL.

## A. Installation / smoke

- [ ] A1. Install v1.0.8.44 over the current QA world and launch without console-breaking errors.
- [ ] A2. Existing Rangers, NPCs, Scenes, Items, Journals and Compendiums remain intact.
- [ ] A3. `realm-guard` remains the internal system id and Foundry reports version 1.0.8.44.

## B. Dropdown regression repair

Test at least these dropdown families: Obstacle Control mode, Conflict Starting Disposition Method, Conflict Skill/Ability, Persona, Trait, Wise, Nature Scope, portrait mode and one Item/GM-tool dropdown.

- [ ] B1. Dropdown trigger stays visually aligned with its label/field and does not distort the parent dialog layout.
- [ ] B2. Opening a dropdown places the option list directly at the trigger even when the Foundry window has been moved/resized.
- [ ] B3. Option menu is not offset by Foundry window transforms and does not jump to a wrong screen position.
- [ ] B4. Clicking an option changes the real form value and the chosen value is honored when the dialog is submitted.
- [ ] B5. Hovering an option shows its contextual explanation.
- [ ] B6. Disabled options remain unselectable but can still expose their explanation where appropriate.
- [ ] B7. Click outside closes the open dropdown.
- [ ] B8. Scrolling/resizing closes the menu safely; reopening works normally.
- [ ] B9. Keyboard open/navigation/escape does not trap focus or break the dialog.
- [ ] B10. Multiple different dropdowns can be opened sequentially without stale menus remaining on screen.

## C. Standard Roll result readability

- [ ] C1. Normal trained Skill PASS shows a large `PASS` headline and a second line `Success: X`.
- [ ] C2. Normal trained Skill FAIL shows a large `FAIL` headline and a second line `Failed: X`.
- [ ] C3. Exact Obstacle PASS remains mechanically correct and displays `Success: 0` rather than old `Margin of ...` wording.
- [ ] C4. Result area still shows Successes and Obstacle/Target clearly.
- [ ] C5. Skill Dice Pool is broken into readable labelled entries: Base plus only relevant Modifier / Extra Dice / Teamwork / Persona / Tap Nature / Conditions / Trait / Token effects.
- [ ] C6. Base roll, Wise reroll, Token reroll and Fate/Open-6 dice appear on separate readable rows when used.
- [ ] C7. Resource-spend information remains correct after the visual reorganization.
- [ ] C8. Ability rolls use the same readable pool/result hierarchy.
- [ ] C9. Beginner's Luck clearly shows ability base -> pre-half pool -> halved pool -> after-halving Persona/Fresh/Tap Nature additions.
- [ ] C10. Automatic Versus/tie result still resolves correctly and uses the simplified PASS/FAIL/TIE result language.
- [ ] C11. Narrow chat sidebar does not make result pills or numeric rows overlap/cut off.

## D. Conflict Starting Disposition chat

- [ ] D1. Calculated Starting Disposition card clearly shows method, roll pool, rolled/effective successes, base Ability and final Starting Disposition.
- [ ] D2. Beginner's Luck Starting Disposition remains mathematically correct and readable.
- [ ] D3. Tap Nature Starting Disposition still spends Persona/taxes Nature correctly when legal.
- [ ] D4. Fixed opposition method clearly shows fixed base, supporting NPC bonus and Condition penalty.
- [ ] D5. Manual opposition method clearly shows the exact final value and does not imply a roll occurred.

## E. Conflict Action chat - primary readability gate

Run enough exchanges to cover Attack, Defend, Feint and Maneuver pairings.

- [ ] E1. Every resolved action card begins with `CONFLICT · EXCHANGE X · ACTION Y` and shows Action vs Action prominently.
- [ ] E2. Opposition side card clearly shows Actor, Action, Pool, dice and effective Successes.
- [ ] E3. Ranger side card clearly shows Actor, Action, Pool, dice and effective Successes.
- [ ] E4. Each rolled side shows PASS or FAIL plus `Success: X` / `Failed: X` on a separate line.
- [ ] E5. Trumped actions are clearly marked `TRUMPED · No test is rolled` and are not displayed as a failed roll.
- [ ] E6. Immediate outcome is obvious without opening technical details.
- [ ] E7. Rangers Disposition shows before -> after plus delta.
- [ ] E8. Opposition Disposition shows before -> after plus delta.
- [ ] E9. Unchanged Disposition is visually distinct from changed Disposition and still reports delta 0.
- [ ] E10. Expanding `Roll details` shows relevant Base/Modifier/Extra/Teamwork/Maneuver/Weapon/Condition/Trait/Persona/Tap Nature/Fate information.
- [ ] E11. Expanding `Rules resolution` shows the detailed rules explanation without cluttering the default card.
- [ ] E12. Conditional +s / -s penalties and L3 Trait +1s still affect mechanics exactly as before.

## F. Maneuver / Conflict Complete chat

- [ ] F1. Maneuver choice card clearly shows acting side, chosen effect and Success value.
- [ ] F2. Impede / Gain Position / Disarm / Combo effect text is readable and mechanically unchanged.
- [ ] F3. Conflict Complete card clearly shows Winner, conflict type, final/current Disposition for both sides and both Goals.
- [ ] F4. Compromise text is clearly separated when entered.

## G. v1.0.8.43 regression smoke

- [ ] G1. Ranger Original Portrait drag/zoom/framing still persists across sheet close/reopen and F5.
- [ ] G2. Original Portrait / Token Portrait switching remains non-destructive.
- [ ] G3. Token Builder reopens with its stored framing.
- [ ] G4. GM Quick Inspector metadata does not overlap for Ranger or NPC; multi-select remains usable.
- [ ] G5. Canvas token hover still reveals token name.
- [ ] G6. Tap Nature remains legal on Conflict Skill/Ability tests and unavailable for Fixed/Manual non-roll disposition methods.
- [ ] G7. Beginner's Luck Conflict Tap Nature remains post-halving.
- [ ] G8. Resources/Circles remain excluded from ordinary Tap Nature.

## H. Core regression

- [ ] H1. Normal Fate/Open 6s spends exactly 1 Fate and recursive sixes still work.
- [ ] H2. Persona spending remains 0-3D where legal and tracks lifetime spend correctly.
- [ ] H3. Skill/Ability Learning and automatic advancement remain unchanged.
- [ ] H4. Conditions/recovery still work.
- [ ] H5. Conflict planning/lock/reveal progression still advances correctly.
- [ ] H6. No destructive Actor migration or unexpected data reset occurs.

## QA decision

**Blocking failures:**  

**Non-blocking/cosmetic observations:**  

**Final verdict:** PASS / FAIL  

**If PASS:** promote v1.0.8.44 according to project version discipline.  
**If FAIL:** retain v1.0.8.3 as GOLD and patch from this v1.0.8.44 QA branch only after the failure is classified.
