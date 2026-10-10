# Realm Guard / Torchbearer v1.13.0-qa.24 — M10D.18 P2.4 Magic Shadow Adapter

**QA candidate only — user Foundry QA required. Stable v1.12.0 unchanged.**

Source authority: Torchbearer 2E Dungeoneer's Handbook **Arcana pp.89-97**, **Ritual pp.98-106**; Scholar's Guide **Conflict p.79**. No Mouse Guard magic rules substituted.

## Implemented, read-only

- Spell Memory Palace: slots cost spell circle; memorize in Camp/Town only, carried spell-book membership and capacity checked. Lore Master Ob = circles of selected new spells + count of spells already stored; Camp check (and no simultaneous watch); Town free with lodging/relationship, else lifestyle +1.
- Spell-book folios: five folios per book, circle-based storage.
- Arcanist casting plan for fixed, factors, versus or skill-swap tests. Requires speech and empty gesturing hand. Casting from memory releases the memorized spell, scroll is one use, direct spell-book casting consumes its entry — **planned only**.
- Materials and focus each +1D; material is expended, focus reusable; collaborating arcanists normally add a turn, wises do not. Spell-specific allowed pre-disposition timing, one free non-opponent-affecting spell per round between rounds, equipped skill-swap timing and cannot disarm spell effects.
- Temerarious discharge: Will Ob total spell circles, zero turn/check; interruptions: spell lost, caster and helpers test Will at Ob sum of stored spell circles; outcomes remain GM.
- Ritualist invocations: fixed/factors/versus/skill-swap and speech required. Relic absence raises time, burden and obstacle (+1) or versus -1s; sacramental +1D and consumed, creed opposition +1 burden. Immortal burden and Urdr overflow require Health Ob equal to total burden, stigmata guidance, no automatic conditions/death.
- Invocation interruptions dissipate the ritual **but burden still accrues** (plan only). Purification in Camp/Town: Theologian Ob burden, uncorrupted place, shrine +1D, no help, Camp check/Town lifestyle +1. Success reduces burden 1+MoS; fail-condition 1, fail-twist 0. No resource writes.
- Spell-specific factors, spell/invocation effects, Scroll scribing/learning, full catalogue content, NPC/monster magic, and special class/supplement magic remain governed by their source entries / GM; not automated or marked live-complete. This P2.4 delivers a safe foundation, **not** complete per-spell live parity.

Read-only API: `game.realmGuard.core.m10d.magic`: `getStatus`, `model`, `memoryPlan`, `spellbookPlan`, `castPlan`, `dischargePlan`, `spellInterruptPlan`, `invocationPlan`, `invocationInterruptPlan`, `purificationPlan`, `stigmataPlan`.

Historical P2.1 Traits, P2.2 Armor and P2.3 Conflict remain verified; all four new shadow adapter domains now have QA candidates, but **14 historic domains still require full-source re-audit**. No M11 activation, TB2E profile selection, Actor/Item/Journal/Settings writes or destructive migration. Legacy Mixed remains live authority; global kill switch ENGAGED.

Release flow: validate manifest/syntax/all historical and new QA smokes, ZIP, GitHub Release, download+verify assets, then update only QA manifest through Actions. Manual Foundry Gate A–D described in TEST_PROTOCOL_v1.13.0-qa.24.md. No Stable promotion.
