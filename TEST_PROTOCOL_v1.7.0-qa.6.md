# Realm Guard / Torchbearer v1.7.0-qa.6 — Equipment Figure QA

Foundry target: v13.351

## Scope
This patch replaces the rejected Equipment artwork approach with the approved gray transparent silhouette language and reduces Equipment Figure to exactly two user-facing modes: Custom Figure and Ancestry Figure.

## A. Version / API
- `game.system.version === "1.7.0-qa.6"`
- `game.realmGuard.inventory.figure.getStatus().defaultMode === "custom"`
- modes are exactly `custom`, `ancestry`
- `characterArtModeRemoved === true`
- `paperFiguresAllowed === false`

## B. Custom Figure default
1. Open a Ranger Inventory / Equipment page.
2. Select `Custom Figure`.
3. Leave Custom image path empty.
4. Verify the built-in medium-gray humanoid silhouette is shown.
5. Verify the figure has no baked environmental background.
6. Verify it is not the old geometric/mannequin/paper-doll artwork.

## C. Custom Figure override
1. Enter a valid custom image path.
2. Verify the custom art replaces the built-in gray figure.
3. Verify Fit, Zoom, Horizontal and Vertical framing work and persist after reload.
4. Clear the custom path.
5. Verify the built-in gray humanoid returns.

## D. Ancestry auto selection
Select `Ancestry Figure` and test the Actor `system.ancestry` field:
- Dúnadan -> `dunadan.svg`
- Human -> `human.svg`
- Elf -> `elf.svg`
- Dwarf -> `dwarf.svg`
- Hobbit -> `halfling.svg`
- Halfling -> `halfling.svg`
- unknown/custom ancestry -> `neutral.svg`

Verify the silhouettes use the same medium-gray transparent visual language while ancestry proportions differ.

## E. House / Lineage separation
- Change Lineage / House to a normal House name.
- Verify it does not overwrite `system.ancestry`.
- Existing legacy ancestry-like Lineage values may still provide compatibility fallback only when explicit Ancestry is empty.

## F. Persistence / duplicate safety
- Switch between Custom Figure and Ancestry Figure.
- Reload Foundry.
- Verify the selected mode persists.
- Verify only one Equipment Figure control is present.
- Verify only one center figure is rendered.

## G. Inventory regression
Verify unchanged:
- gear drag/drop
- Head / Neck / Cloak / Torso / Belt / Pocket / Feet
- Left / Right Hand
- 2H locking
- capacities
- containers
- unassigned gear

## H. M5 CORE preservation
- `game.realmGuard.core.m5.getStatus()` remains available.
- Gear / placement / container / Conflict Tool shadow services remain read-only.
- Legacy Mixed remains live Inventory and Conflict authority.

## I. Token / portrait regression
Verify qa.4 behavior remains:
- Token Builder local image drag/drop
- source artwork remains the PC portrait
- PC portrait remains square/rectangular
- generated Prototype/Scene token remains round and separate

## J. M2 / M3 / M4 regression
Perform one ordinary Skill test and one Nature/Condition test.
Verify no duplicate chat, Learning, resource spends, Nature tax or Recovery writes and no new parity mismatches.

## PASS gate
- Two Equipment Figure modes only
- Custom default gray silhouette PASS
- Custom override PASS
- Dúnadan PASS
- Human PASS
- Elf PASS
- Dwarf PASS
- Hobbit/Halfling PASS
- Neutral fallback PASS
- No rejected old mannequin artwork PASS
- Inventory unchanged PASS
- M5 shadow services preserved PASS
- Token/portrait flow preserved PASS
- M2/M3/M4 preserved PASS
