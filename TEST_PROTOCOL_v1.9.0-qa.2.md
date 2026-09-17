# Realm Guard / Torchbearer v1.9.0-qa.2 — M7 Synthetic Participant Parity QA

## Scope

This build fixes Actor identity drift discovered during M7 QA when the Turn Manager is used with unlinked/synthetic token Actors.

- Legacy Mixed remains the only live authority for Turn Manager, Checks, Free Tests and End Session.
- CORE M7 remains shadow/read-only.
- No Check, turn, reward or session rule changes are intended.
- The displayed Turn Manager participant must remain the same Actor instance throughout Pass Check and Done/Discard actions.
- M7 snapshots/previews must observe the same participant Actor state used by the live Turn Manager.

## Install / startup

1. Install/update to `v1.9.0-qa.2` on Foundry v13.351.
2. World loads without startup errors.
3. Console reports `CORE M7 Session Engine foundation ready`.
4. `game.realmGuard.core.m7.getStatus()` reports:
   - `phase: "M7"`
   - `mode: "SHADOW_READ_ONLY"`
   - `authority: "LEGACY_MIXED"`
   - `liveApplication: false`
5. `game.system.id` remains `realm-guard`.

## Synthetic / unlinked token regression

6. Place a character token on the active scene with `actorLink: false`.
7. Give that synthetic token Actor 1 Check while its world Actor has 0 Checks.
8. Open Turn Manager during Players' Turn.
   - the participant row must display the synthetic Actor's 1 Check.
9. Use Turn Manager → Pass Check from that Ranger to a patrol member with 0 Checks.
   - donation succeeds
   - donor synthetic Actor goes 1 → 0
   - recipient goes 0 → 1
   - no false “has no Checks” warning
10. Repeat Pass Check from the character sheet.
    - behavior remains equivalent to Turn Manager.
11. Give the synthetic Actor a Check again and use Turn Manager → Done / Discard.
    - the displayed synthetic Actor is marked Done
    - its remaining Checks are discarded
    - the world Actor is not accidentally mutated instead.

## M7 participant parity

12. With the unlinked token present, run:

```js
game.realmGuard.core.m7.current()
```

The Ranger entry must reflect the scene participant state, including current Checks, and should expose `isToken: true` plus a participant `ref`.

13. Compare the synthetic token and world Actor values. If they differ, M7 must report the synthetic scene participant value used by Turn Manager.
14. Run:

```js
game.realmGuard.core.m7.previewTestClaim(canvas.tokens.controlled[0].actor)
```

The preview must use the matching participant state rather than silently falling back to the world Actor.
15. `previewCheckTransfer(syntheticDonor, recipient, 1)` remains read-only and reports the synthetic donor's current Check value.

## Linked/world Actor regression

16. Remove scene character tokens or test with linked tokens/world Actors.
17. Turn Manager participants still resolve correctly.
18. Pass Check still works for ordinary linked/world Actors.
19. Done / Discard still works.
20. GM Turn ↔ Players' Turn transitions remain unchanged.
21. Free Test and extra-test Check spending remain unchanged.

## M7 qa.1 retained gates

22. `current()` reports `gm` during GM Turn and `player` during Players' Turn.
23. Before Free Test use, `previewTestClaim(actor)` returns `source: "free"`.
24. After Free Test use with a Check remaining, preview returns `source: "check"`, cost 1.
25. With Free Test used and zero Checks, preview returns `reason: "no-checks"`.
26. Alternation and Done preview guards remain correct.
27. NPC and Free Play previews remain untracked.
28. Reward preview remains read-only and preserves Fate/Persona caps and Goal Fate suppression.
29. Reload the world and verify Turn Manager and M7 snapshot still reflect the correct participant state.
30. Conflict, rolls, Beginner's Luck, Conditions/Recovery, Gear and End Session remain unaffected.

## PASS criteria

`v1.9.0-qa.2` passes when Turn Manager actions preserve synthetic Token Actor identity, M7 observes the same participant state, linked/world Actor behavior remains unchanged, and M7 remains shadow/read-only.

## Rollback criteria

Rollback if the fix mutates the wrong Actor, duplicates participants, breaks linked actors, changes Check rules, gives CORE live authority, or causes startup/reload errors.
