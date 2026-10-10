# TEST PROTOCOL — v1.13.0-qa.24 · M10D.18 P2.4 Magic Shadow Adapter

Target: Foundry VTT 13.351, QA-only world. Rule sources: Dungeoneer's Handbook Arcana 89–97 and Ritual 98–106; Scholar's Guide Conflicts 79.

All new API calls are PURE READ-ONLY PLANS. No real rolls, spent spells/scrolls/materials, Actor updates, burden edits or journal/setting writes.

## Gate A — Installation & Safety
- QA installation shows version 1.13.0-qa.24 and console free of new blocker errors.
- `const m=game.realmGuard.core.m10d; m.getStatus().magicShadowReady === true`
- `m.getStatus().p2ImplementedShadowAdapterDomains` = `["traits","armor","conflict","magic"]`; pending = `[]`.
- `m.magic.getStatus().adapterReady` true and liveEnabled/liveApplication/activationAllowed false.
- Legacy Mixed live authority; global kill switch ENGAGED; M11 PAUSED / liveDomainCount=0. Stable v1.12.0 unchanged.

## Gate B — Arcana
- B1 memory: Capacity 5, current spell Circle 1, new Circle 1 + Circle 2 => Lore Master Ob4, three added slots, 1 spare; Camp check 1.
- B2 spells can't be memorized while on watch or from sources not in carried spell books; capacity and camp/town validation.
- B3 Town accommodation/relationship => no lifestyle increment; otherwise +1. Spellbook five folios, Circle units.
- B4 spell modes Fixed/Factors/Versus/Skill Swap; speech and free hand required. Material +1D and focus +1D; only material consumed (planned).
- B5 memory release, one-use scroll, casting from spellbook consumes entry (all planned, not committed).
- B6 spell-specific pre-disposition permission, equipped skill-swap and no extra casting turns during Conflict, one eligible Free spell per round between rounds and no opposition-directed effects. Interruption and Will/Discharge obstacle.

## Gate C — Ritual
- C1 invocation base time/burden using relic, without relic +1 turn / +1 burden / +1 Ob or -1s versus.
- C2 Sacramental +1D consumed (planned), creed increases Burden, Urdr overage: Health Ob = new total Burden.
- C3 Interrupted invocation dissipates yet accrues Burden. No automatic writes.
- C4 Purification: Camp/Town, uncorrupted place, solo Theologian Ob total Burden; shrine +1D; Camp check vs Town lifestyle +1.
- C5 PASS reduction 1+MoS; failed condition -1 burden; failed twist unchanged; stigmata/Precedence GM control, 11+ outcome never auto-applied.

## Gate D — Regression & Persistence
- D1 Every plan has READ_ONLY_SHADOW, liveApplication false, writesPlanned 0, rollExecuted false and relevant mutation flags false.
- D2 P2.1 Traits, P2.2 Armor, P2.3 Conflict regression remain intact, as do P1 creation, conditions, Help, Nature.
- D3 Manually open Ranger and NPC sheets, make a normal Legacy Mixed roll and test Conflict tools, confirm no new blocking console errors.
- D4 Reload QA world; Actor/Item data, HP, resources, Conditions, inventory, Checks and active rules profile unmodified.
- D5 CORE readiness must still say full 14-domain re-audit required; M11 paused; global kill switch engaged; QA-only release assets verified; Stable 1.12.0 untouched.

Do not close P2.4 before all Foundry gates pass. CI passing is not Foundry QA. Do not approve Stable promotion or M11 activation on basis of these adapter smoke tests.
