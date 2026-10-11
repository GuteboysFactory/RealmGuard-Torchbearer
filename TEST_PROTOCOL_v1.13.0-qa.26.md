# TEST PROTOCOL — v1.13.0-qa.26 · M10D.18 P3.2 Wises / Nature / Abilities-Skills (targeted)

**Install in Foundry v13.351 from QA manifest only after verified GitHub Actions release.** Candidate is read-only and must never activate TB2E live. Stable v1.12.0 frozen.
Authoritative source: Dungeoneer's Handbook (DH) 58-78, 160-176; Scholar's Guide (SG) 25, 87-88.

## Gate A — Installation / Safety
1. QA channel and Foundry System version `1.13.0-qa.26`; stable remains `1.12.0`.
2. `game.realmGuard.core.m10d.wises.combinationPlan` and `game.realmGuard.core.m10d.abilities.equipmentPlan` exist.
3. M10D status `existingShadowReauditRequired:true` and `liveIntegrationPaused:true`.
4. M11 globalKillSwitchEngaged=true, liveIntegrationPaused=true, liveDomainCount=0. Legacy Mixed remains sole live authority. No actor/gear writes or dice rolls.

## Gate B — Wises (DH 76-78; SG 87-88)
1. Two relevant distinct Wises using different effects on same test => PASS.
2. Duplicate Wise identity, duplicate effect, more than 4 known Wises => BLOCKED.
3. I Am Wise plus ordinary Help on same test => BLOCKED; either alone => VALID.
4. `rerollPlan("Deeper Understanding",{failedDice:1,fateLuckAlreadyUsed:true})` => BLOCKED `WISE_REROLL_MUST_PRECEDE_FATE_LUCK`.
5. Same Fate Luck ordering for `Of Course`. No independent artificial order between Of Course and Deeper imposed. Four marks complete => Wise cycle reward option, still no writes.

## Gate C — Nature / Skills (DH 65-75; SG 25)
1. Alternate descriptors: Dwarf Negotiating, Elf Enchanting, Halfling Hoarding; no automatic actor changes.
2. Missed-session Nature recovery with an existing condition => BLOCKED; `noConditions:true` permits restore one taxed point.
3. Nature conservation from maximum 1 => preview 0, retirement **end of adventure**, no automatic retirement.
4. At maximum Nature 7 => conditional end-of-session retirement check; not automatically applied.
5. Skills descriptions from DH 160-176 now source-available but *not yet fully mapped*.
6. `abilities.equipmentPlan`: unskilled without borrowed tools => +1 Ob; borrowed tools or Dwarven Crafting tools can remove inadequate tools penalty; one Supply + one Gear => +2D; second Gear or Supply blocked.
7. Learning a 25th Skill => `requiresForgetExistingSkill:true`, but no deletion/write.

## Gate D — Final regression & reload
1. Existing Legacy Mixed skill/ability/Nature/Wise/Help rolls still behave the same; Ranger and NPC sheets load.
2. P2 Traits/Armor/Conflict/Magic adapters remain read-only and usable.
3. Reload Foundry world: Actors/Items, HP, conditions, Fate/Persona, inventory, advancement marks and selected live profile persist unchanged.
4. No new blocking console errors; M11 PAUSED and global kill switch ENGAGED after reload.
5. GitHub Actions smoke tests pass, including `qa/m10d-tb2e-p32-wises-nature-skills-smoke.mjs`. No P3 changes are committed to live actor data.

Acceptance requires user-confirmed Foundry Gates A-D. `M10D18_P3_FULL_CORE_REAUDIT_LEDGER.md` remains **0/14 FULLY_REAUDITED** even after P3.2 target QA passes; next P3 package continues the rest of full source/domain mapping.
