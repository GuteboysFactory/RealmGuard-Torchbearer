# STATIC QA - Realm Guard / Torchbearer v1.0.8.44

**Build:** v1.0.8.44 QA  
**Foundry target:** 13.351  
**GOLD/public baseline:** v1.0.8.3

## 1. Package / manifest

- `system.json` JSON parse: PASS.
- `lang/en.json` JSON parse: PASS.
- Internal id remains `realm-guard`: PASS.
- Version is `1.0.8.44`: PASS.
- Compatibility remains Foundry 13 / verified 13.351: PASS.
- Download target points to `realm-guard-foundry-v1.0.8.44.zip`: PASS.

## 2. JavaScript syntax

- All 35 `.mjs` files pass `node --check`: PASS.
- 89 local ES-module imports checked; 0 missing targets: PASS.

## 3. Dropdown regression repair - source audit

Static wiring confirmed:

- Custom RG/TB option menu is appended to `document.body` rather than remaining inside a transformed Foundry Application window.
- Positioning continues to use viewport coordinates, which now match the menu's fixed-position containing block.
- The original native `<select>` remains in the form and remains the canonical value submitted through existing dialog callbacks.
- Custom option clicks dispatch `input` and `change` to preserve existing listeners.
- Option menu recognizes click-inside-menu separately from click-outside so the global close handler does not prematurely close selections.
- Orphaned portalled menus are removed when their wrapper is removed by a Foundry rerender.
- Hover help remains attached to individual custom options through `data-rg-help`.

**Live gate:** visual placement in moved/resized Foundry windows, form submission and keyboard interaction require Foundry QA.

## 4. Standard roll result readability - source audit

Static wiring confirmed:

- Shared `_resultSummaryHTML()` no longer embeds `Margin of Success/Failure` in the headline.
- Final outcome headline is `PASS`, `FAIL` or `TIE`.
- Secondary line is `Success: X`, `Failed: X` or `Tiebreaker pending`.
- Special resolved Automatic Versus summary follows the same two-line language.
- Normal Skill rolls render labelled Dice Pool breakdown entries and separate roll/reroll/Fate rows.
- Ability rolls use the same labelled Dice Pool / roll rows.
- Beginner's Luck exposes pre-half and post-half contributions explicitly.

**Live gate:** narrow chat/sidebar rendering and all modifier combinations require Foundry QA.

## 5. Conflict chat readability - source audit

Static wiring confirmed:

- Conflict Action cards render matchup, two side cards, immediate outcome and Disposition changes before technical detail.
- Each side card contains Actor name, Action, Pool, dice faces, effective Successes and PASS/FAIL or TRUMPED state.
- Detailed roll modifiers are inside collapsible `Roll details`.
- Existing pair `resultText` is retained inside collapsible `Rules resolution` rather than discarded.
- Disposition records before -> after and numeric delta for Rangers and Opposition.
- Starting Disposition card uses labelled roll/base/final sections.
- Maneuver card uses a prominent effect/result block.
- Conflict Complete card separates Winner, final Disposition, Goals and optional Compromise.

**Live gate:** action-pair rules, disposition deltas and narrow chat rendering require Foundry QA.

## 6. Rule/data scope

- No changes to core roll math were intentionally introduced.
- No Actor/Item data migration was added.
- v1.0.8.43 portrait persistence, Tap Nature/Double-Tap eligibility, token hover and GM Quick Inspector logic are carried forward unchanged except for UI interactions sharing the dropdown layer.

## 7. Static verdict

**PASS - package is suitable for live Foundry 13.351 QA.**  
This is not a GOLD verdict. `TEST_PROTOCOL_v1.0.8.44.md` remains the release gate.
