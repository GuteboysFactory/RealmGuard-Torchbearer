# Realm Guard / Torchbearer v1.9.0-qa.10 — GM Dock Host Contract v2 QA

## Scope

This build extends only the neutral GuteboysFactory GM Dock Host presentation contract.

**Rules authority must remain identical to v1.9.0-qa.9.**

Reference provider: **Adventurer's Tome v1.4.0-qa.5**.

## 1. Realm Guard alone

- [ ] One Realm Guard GM Dock appears.
- [ ] Existing Realm Guard Dock tools remain unchanged.
- [ ] Drag/reset/per-user position still work.
- [ ] No provider menu is required for Realm Guard-only operation.

## 2. Host API

Run:

```js
globalThis.GuteboysFactory?.gmDockHost
```

Expected:
- `contract === "gbf-gm-dock-host"`
- `version === 2`
- `id === "realm-guard"`
- registerProvider / unregisterProvider / hasProvider / refresh / element remain available

## 3. Provider v2 rendering

With Adventurer's Tome v1.4.0-qa.5 active:

- [ ] only one GM Dock is visible
- [ ] Tome provider button opens one integrated menu
- [ ] provider body region renders inline Quick Capture
- [ ] provider footer remains visually separate and available
- [ ] normal provider item callbacks still work
- [ ] outside-click and close button still close the menu
- [ ] no layout jump or recurring render loop

## 4. Backward compatibility

- [ ] A v1-style provider with only items still renders correctly.
- [ ] Provider badge behavior remains unchanged.
- [ ] Provider callback exceptions are contained and do not break the Dock.

## 5. M7 qa.9 regression

Re-run the qa.9 essentials:

```js
game.realmGuard.core.m7.getStatus()
game.realmGuard.core.m7.claimHandoffStatus()
game.realmGuard.core.m7.transferHandoffStatus()
```

Expected:
- claim handoff enabled
- Pass Check transfer handoff enabled
- no authority-mode changes caused by Dock Host v2

Exercise:
- legal paid Players' Turn test
- legal Pass Check
- blocked Pass Check
- End Session smoke

Expected: qa.9 behavior unchanged.

## PASS criteria

qa.10 passes when Host v2 renders richer provider UI without breaking the existing Dock, player privacy remains intact, and every qa.9 M7 authority boundary remains unchanged.
