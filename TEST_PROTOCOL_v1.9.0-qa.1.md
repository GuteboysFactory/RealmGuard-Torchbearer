# Realm Guard / Torchbearer v1.9.0-qa.1 — M7 Session Engine Foundation QA

## Scope

M7 begins as **shadow/read-only** infrastructure.

- Legacy Mixed remains the only live authority for Turn Manager, Checks, Free Tests and End Session.
- No CORE M7 service may mutate Actor/session state in this build.
- Existing Turn Manager and End Session UX must remain unchanged.

## Static / install gate

1. Install/update on Foundry v13.351.
2. World loads without startup errors.
3. Console reports `CORE M7 Session Engine foundation ready`.
4. `game.realmGuard.core.m7.getStatus()` reports:
   - `phase: "M7"`
   - `mode: "SHADOW_READ_ONLY"`
   - `authority: "LEGACY_MIXED"`
   - `liveApplication: false`
5. `game.system.id` remains `realm-guard`.

## Session snapshot

6. Run `game.realmGuard.core.m7.current()` during GM Turn.
   - phase = `gm`
   - current turn cycle is represented
   - Rangers and current Checks are represented
7. Start Players' Turn using the existing Turn Manager, then run `current()` again.
   - phase = `player`
   - no state is changed by reading the M7 snapshot
8. Reload the world and verify snapshot still reflects legacy state.

## Test-claim preview

9. During Players' Turn, before a Ranger has acted:
   - `game.realmGuard.core.m7.previewTestClaim(actor)` returns `source: "free"`.
10. After that Ranger has consumed the Free Test through the existing live workflow and still has a Check:
   - preview returns `source: "check"`, cost 1.
11. With Free Test used and zero Checks:
   - preview returns `ok: false`, `reason: "no-checks"`.
12. With more than one active Ranger, the actor who took the last test is preview-blocked by `reason: "alternation"`.
13. A character marked Done is preview-blocked by `reason: "done"`.
14. An NPC preview is untracked and does not consume Players' Turn economy.
15. Disable Turn Manager / use Free Play:
   - preview returns untracked `source: "free-play"`.

## Action Currency preview

16. `previewCheckTransfer(donor, recipient, 1)`:
   - legal when donor has enough Checks, recipient has zero and Actors differ
   - does not mutate either Actor
   - illegal if donor lacks Checks
   - illegal if recipient already has Checks

## Reward Engine preview

17. `previewReward(...)` reproduces the current End Session proposal math for:
   - Belief Fate
   - Goal progress Fate
   - Instinct Fate
   - Goal accomplished Persona
   - Against Belief Persona
   - Embodiment Persona
   - MVP Persona
   - Workhorse Persona
18. Goal progress Fate is suppressed when Goal accomplished is also selected.
19. Fate proposal caps at 3.
20. Persona proposal caps at 4.
21. Calling reward preview does not modify Fate, Persona, session finalization state, Traits, Talents or Tokens of Power.

## Regression gate

22. Existing Turn Manager UI remains functional.
23. Free Test / Check spend still follows legacy behavior.
24. Pass Checks still follows legacy behavior.
25. Done / Discard still follows legacy behavior.
26. GM Turn ↔ Players' Turn transition still follows legacy behavior.
27. End Session review/approval/finalization still follows legacy behavior.
28. Duplicate End Session reward protection remains intact.
29. Trait/Talent/Token session reset/recharge remains intact.
30. Conflict, rolls, Beginner's Luck, Conditions/Recovery and Gear remain unaffected.

## PASS criteria

`v1.9.0-qa.1` passes when M7 exposes correct read-only Session/Reward/Action Currency previews, all live behavior remains owned by Legacy Mixed, and representative regression is clean.

## Rollback criteria

Rollback immediately if M7 changes live state, consumes resources, changes session phase, alters End Session rewards, changes existing UI behavior, or prevents a world from loading/reloading cleanly.
