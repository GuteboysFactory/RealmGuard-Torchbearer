# Realm Guard / Torchbearer v1.12.0-qa.11 — Live Test Protocol

**Milestone:** M10B.11 — MG1E Selectable QA Activation  
**Foundry target:** v13.351  
**Stable baseline:** v1.11.0  
**Primary rule:** activation must remain reversible, settings-only and non-destructive.

## Gate A — Boot / release
- Install/update v1.12.0-qa.11.
- World boots without startup errors.
- Profile Management, Manual, Ranger/NPC sheets, Item sheets and Recruitment open.

## Gate B — QA activation boundary
- Profile Management shows MG1E v11 as QA_ACTIVE.
- MG1E is selectable in this QA build.
- Conversion preview remains read-only.
- Switching requires explicit GM confirmation.
- No automatic profile switch occurs on boot.

## Gate C — Legacy Mixed regression
- Activate Legacy Mixed and reload.
- Ordinary Skill, Versus and Beginner's Luck remain compatible.
- Legacy Rules Journal remains unchanged.
- Legacy Recruitment and structured inventory remain compatible.

## Gate D — Strict regression
- Activate Strict and reload.
- Rated Wises, Traits/Help/Nature, Conditions/Recovery, Conflict, Session/Circles/Progression, Recruitment and Scale of Might behave as before.
- Strict Rules Reference routes correctly.

## Gate E — MG1E activation / reload
- Preview MG1E conversion.
- Activate MG1E and reload.
- Active profile remains MG1E v11 after reload.
- Profile Management and Registry report MG1E as active.
- Manual opens the active MG1E Rules Reference.

## Gate F — MG1E live rules routing
- Rated Wise controls are active.
- MG1E Trait/Help/Nature behavior is selected.
- MG1E Conditions/Recovery set is used.
- Conflict descriptor Nature is available where MG1E policy permits.
- Levels/Talents remain mechanically disabled while existing data is preserved.
- Natural Order reference/routing is MG1E-owned; no automatic Actor rank writes occur.

## Gate G — MG1E Recruitment / CORE M9
- Create a new MG1E guardmouse through the active Recruitment flow.
- Commit is live only while MG1E is active.
- New character receives profile-owned Skills, rated Wises, Traits, Gear and MG1E Conditions.
- Conditions are Hungry & Thirsty / Angry / Tired / Injured / Sick.
- Creation provenance identifies MG1E.
- Creation relationships are normalized through CORE M8.

## Gate H — Creation rollback safety
- Cancel/back paths create no Actor.
- If the existing QA fault-injection path is available, inject a post-Actor critical failure and verify the partial Actor is removed.
- No orphan embedded documents or relationship records remain.

## Gate I — Existing-data safety
- Existing Actors are not auto-migrated when MG1E is activated.
- Existing unrated Wises are not guessed.
- No species → Natural Order rank inference occurs.
- No Condition rename/delete occurs.
- No Gear placement rewrite occurs.
- No Talent or Token of Power deletion occurs.

## Gate J — Round-trip
Perform and reload after each switch:
1. Legacy Mixed → MG1E
2. MG1E → Legacy Mixed
3. Legacy Mixed → MG1E
Verify profile-specific data survives each change and no campaign documents are rewritten by the switch itself.

## Gate K — Multi-client refresh
- With GM + player connected, switch profile as GM.
- Connected client observes runtime profile refresh/profile-change handling.
- Reload both clients and verify the same active profile and snapshot.
- No client receives a partial/mixed rules state after reload.

## Gate L — Release/channel
- GitHub release tag/assets are v1.12.0-qa.11.
- QA channel points to qa.11 only after automated verification.
- Stable channel remains v1.11.0.

## PASS
M10B.11 is CLOSED only after Gates A-L pass in Foundry VTT 13.351.
