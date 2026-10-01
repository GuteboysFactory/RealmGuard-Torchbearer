# Realm Guard / Torchbearer v1.12.0-qa.13 — Live Test Protocol

**Milestone:** M10C.2 — MG2E Domain-Completion Audit + Generic Conversion Preview Routing  
**Foundry target:** v13.351  
**Stable baseline:** v1.11.0  
**Primary rule:** MG2E remains FOUNDATION_ONLY and read-only. No profile activation or campaign-data mutation is permitted.

## Gate A — Boot / release
- Install/update v1.12.0-qa.13.
- World boots without startup errors.
- Profile Management, Rules Registry, Manual, Ranger/NPC sheets, Item sheets and Recruitment open.

## Gate B — M10C.1 closure regression
- `mg2e` remains independently registered with lineage only `mg2e`.
- MG2E remains FOUNDATION_ONLY / non-selectable / unsupported / non-live.
- No automatic profile switch occurs.

## Gate C — MG2E domain-complete snapshot
Resolve `game.realmGuard.core.resolveRulesProfile("mg2e").profile` and verify representative values:
- profile version 2
- advancement: pass=rating / fail=rating-1
- Beginner's Luck learning opens at 2 after maximum-Nature attempts
- inventory policy LOOSE / MG2E_CARRY_LIMITS
- two weapons or one bulky weapon; bag/satchel item guidance
- Conflict three-action exchanges and two action helpers
- Fight action skills = Fighter / Nature / Fighter / Nature
- Fight Animal adds Hunter and Loremouse
- Players' Turn one free test; extra test = 1 Check; alternation with solo exception
- End Session Fate max 3 / Persona max 4
- Recruitment profileVersion 2 and rank templates present

## Gate D — MG2E Natural Order
Verify read-only Comparative Scale routing:
- Mouse rank 3
- Weasel rank 4
- Black Bear / Moose rank 9
- Chipmunk is not silently inherited from MG1E
- Fighter/Hunter limits: kill through +1; capture/injure through +2; run off beyond +2
- Militarist thresholds +2..+6 = 20 / 100 / 200 / 2,000 / 20,000
- Scientist +2 or more uses Resources Ob = target Nature
- no Actor rank is inferred or written

## Gate E — MG2E Conversion Preview
Open **Preview MG2E Conversion** from Profile Management.
Verify:
- target = Mouse Guard 2E v2
- READ ONLY
- writes planned = 0
- no profile switch
- reviewed deltas include Wises, Traits, advancement, Nature, Conditions, inventory, Conflict, Session, Natural Order and Recruitment
- world-impact snapshot renders
- closing preview changes nothing

## Gate F — Rules Registry preview
Open Active Rules Registry and use **Preview MG2E Conversion**.
Verify it opens the same read-only MG2E preview and performs no writes.

## Gate G — Activation isolation
- Profile Management exposes no MG2E activation button.
- `game.realmGuard.core.m10.activationAvailable("mg2e")` returns false.
- attempting `game.realmGuard.core.m10.switchProfile("mg2e")` rejects as foundation-only.
- active profile remains unchanged.

## Gate H — Existing profile regressions
Representative smoke in Foundry:
- Legacy Mixed: Skill / Versus / Beginner's Luck / Recruitment / structured inventory
- Strict: rated Wises / Conditions / Conflict / Recruitment / Scale of Might
- MG1E: QA activation / rated Wises / Sick recovery / Natural Order / live Recruitment
No MG2E rule data leaks into any active profile.

## Gate I — Existing-data safety
- no existing Actor/Item/Journal changes after opening MG2E preview
- no Wise rating conversion
- no Condition rename/delete
- no inventory placement rewrite
- no Talent/Token deletion
- no MG2E provenance added to existing Actors

## Gate J — Release/channel
- GitHub release tag/assets are v1.12.0-qa.13
- QA channel points to qa.13 only after automated verification
- Stable channel remains v1.11.0

## PASS
M10C.2 is CLOSED only after Gates A-J pass in Foundry VTT 13.351.
