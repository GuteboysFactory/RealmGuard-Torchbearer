# Realm Guard / Torchbearer v1.9.0-qa.4 — M7 Multiplayer State Authority Hardening QA

## Scope

This build hardens the existing Legacy Mixed structured Turn workflow for multiple connected clients.

- Legacy Mixed remains the only live rules authority.
- CORE M7 remains shadow/read-only.
- Player-initiated structured Turn mutations are technically committed by one deterministic active GM.
- The active GM serializes simultaneous player requests.
- Stale requests are rejected when the Turn cycle or phase changed before GM commit.
- Reload/reconnect must reconstruct state from world settings and Actor/token flags rather than client-local state.
- No Turn, Check, Recovery, Reward or Conflict rule changes are intended.

## Install / startup

1. Install/update to `v1.9.0-qa.4` on Foundry v13.351.
2. World loads without startup errors.
3. As GM, run:

```js
game.realmGuard.core.m7.getStatus()
game.realmGuard.core.m7.authorityStatus()
```

Expected:
- `phase: "M7"`
- `buildScope: "MULTIPLAYER_STATE_AUTHORITY_HARDENING"`
- `mode: "SHADOW_READ_ONLY"`
- `authority: "LEGACY_MIXED"`
- `liveApplication: false`
- GM reports `mode: "LOCAL_GM_COMMIT"`.

4. On a connected player client, `authorityStatus()` should report:
- `mode: "GM_PROXY_COMMIT"`
- the connected primary GM id/name
- `available: true`.

## GM / owning player

5. Start Players' Turn as GM.
6. Give an owned Ranger a Free Test plus at least 2 Checks.
7. From the owning player's client, make a normal test.
   - roll succeeds normally
   - Free Test is consumed exactly once
   - GM and player both see the same updated state.
8. After alternation permits, make an extra test from the player client.
   - exactly 1 Check is spent
   - `checksSpent` increments once.
9. From the player client use Pass Check.
   - donor must be owned by that player
   - transfer occurs exactly once
   - GM and player agree on donor/recipient totals.
10. From the player client use Done / Discard.
   - Done commits exactly once
   - remaining Checks are discarded exactly once.
11. Perform a Recovery attempt from the owning player if practical.
   - recovery attempt state is committed once and visible to GM.

## Non-owning player

12. From a non-owning player, attempt to mutate another Ranger through a normal exposed Turn action if available.
   - action must be unavailable or rejected
   - no Checks/state may change.
13. A non-GM player must not be able to change GM Turn ↔ Players' Turn.

## Multi-client state comparison

14. On GM and player clients run:

```js
game.realmGuard.core.m7.stateFingerprint()
```

after updates have synchronized.

Expected: identical strings.

15. Also compare:

```js
game.realmGuard.core.m7.multiplayerState()
```

The snapshot phase/cycle/actor values should match on both clients for the same active scene.

## Simultaneous requests / socket ordering

16. With two owning players connected, have both trigger an allowed Players' Turn action as close together as practical.
17. The GM authority queue must serialize the requests.
18. Resulting state must be legal:
   - no double-spend
   - no duplicate Free Test
   - no negative Checks
   - alternation rules still hold
   - each accepted action appears once.

## Stale UI guard

19. Open a player Turn Manager or Ranger sheet while in Players' Turn.
20. Have GM change phase/cycle before the player submits an action from the stale UI.
21. The stale request must be rejected with a refresh/retry style warning.
22. The new phase/cycle state must remain unchanged by that stale request.

## Reload / reconnect

23. During Players' Turn record:

```js
game.realmGuard.core.m7.stateFingerprint()
```

24. Reload the GM client.
25. Reload/reconnect the player client.
26. After synchronization, compare fingerprints again.
   - phase/cycle/state persists
   - no duplicate mutations occur on reconnect
   - authorityStatus resolves the active GM again.

## Existing qa.2 / qa.3 regression

27. Synthetic/unlinked Token Actor Pass Check remains correct.
28. Free Test → alternation → Check spend remains correct.
29. NPC and Free Play remain untracked.
30. Solo handling remains correct.
31. Conflict actions do not consume ordinary Players' Turn economy.
32. End Session Reward Proposal/Commit parity remains `mismatches: 0`.
33. Duplicate End Session protection remains unchanged.

## PASS criteria

`v1.9.0-qa.4` passes when GM/player clients converge on the same persisted structured-Turn state, owning-player mutations are committed exactly once by the active GM, unauthorized/stale requests cannot mutate state, simultaneous requests remain serialized/legal, reload/reconnect preserves state, and CORE remains shadow/read-only.

## Rollback criteria

Rollback if player actions hang, legitimate owners cannot act with an active GM, unauthorized users can mutate another Ranger, requests double-apply, Checks can go negative, stale actions mutate a new cycle, reconnect duplicates state changes, or Legacy/Core authority boundaries change unexpectedly.
