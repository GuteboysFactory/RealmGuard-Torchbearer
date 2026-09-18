# Realm Guard / Torchbearer v1.9.0-qa.7 — Unified GM Dock Host QA

## Scope

This build adds a neutral GM Dock Host/provider contract so compatible GuteboysFactory tools can integrate into the existing Realm Guard GM Dock instead of creating competing GM toolbars.

**Rules authority is unchanged.**
- Legacy Mixed remains live.
- CORE M7 remains SHADOW_READ_ONLY.
- No tabletop mechanics are intentionally changed.

Companion integration target: **Adventurer's Tome v1.4.0-qa.2**.

## 1. Realm Guard alone

1. Enable Realm Guard without Adventurer's Tome.
2. Confirm one Realm Guard GM Dock appears.
3. Verify existing tools remain visible and functional:
   - Obstacle Control
   - GM Control
   - NPC Templates / Content Studio where applicable
   - Manual
   - System Audit
   - End Session
   - Conflict
   - Turn Manager when enabled
4. Drag Dock, reload and confirm its per-user position persists.
5. Reset Dock position.

Expected: no behavioral regression from qa.6.

## 2. Host API

As GM, inspect:

```js
globalThis.GuteboysFactory?.gmDockHost
game.realmGuard?.gmDockHost
```

Expected:
- `contract === "gbf-gm-dock-host"`
- `version === 1`
- `id === "realm-guard"`
- functions include `registerProvider`, `unregisterProvider`, `hasProvider`, `refresh`, `element`

Player client must not gain GM UI merely because the API exists.

## 3. Realm Guard + Adventurer's Tome

Enable Adventurer's Tome v1.4.0-qa.2.

Expected:
- only one GM Dock is visible
- no separate Tome Dock remains
- Realm Guard Dock contains an Adventurer's Tome provider button
- opening it shows the integrated Tome campaign menu
- closing/outside-click behaves cleanly
- provider badge can update without disrupting normal Realm Guard tools

## 4. Tome provider actions

Verify through the integrated provider:
- Current Context
- Pin / Unpin Context
- contextual Private Vault
- Quick Capture
- Reveal Queue
- Next Session
- Recent Tome entries
- Open Adventurer's Tome

Expected:
- actions execute Tome-owned workflows
- Realm Guard does not duplicate or persist Tome campaign data
- no recurring render loop or console spam

## 5. Privacy / multiplayer

- GM sees host and provider menu.
- Player does not see Realm Guard GM Dock/provider UI.
- Tome Private Vault content is never rendered into Realm Guard provider metadata.
- A second GM can retain a different Realm Guard Dock position.
- provider registration is safe if the Dock re-renders.

## 6. M7 regression

Re-run the qa.6 authority-boundary essentials:
- `game.realmGuard.core.m7.getStatus()`
- `game.realmGuard.core.m7.actionCurrencyAuthority()`
- Trait Against Check award
- Recovery Check spend/refund
- sessionCycle vs turnCycleId
- End Session lifecycle

Expected: identical qa.6 authority behavior.

## PASS criteria

qa.7 passes when Realm Guard acts as a stable neutral Dock Host, Tome integrates without producing a second Dock, all previous Realm Guard Dock tools remain intact, private/canonical data boundaries are preserved, and M7 qa.6 remains green.

## Rollback criteria

Rollback if provider registration removes or duplicates Realm Guard tools, player clients receive GM controls/private data, Dock rendering loops, callback failures destabilize the Dock, or any qa.6 rules-authority behavior changes.
