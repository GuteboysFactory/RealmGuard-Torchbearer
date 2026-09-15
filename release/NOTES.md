Realm Guard / Torchbearer v1.7.0-qa.7 — Equipment Figure settings cleanup.

This patch keeps the approved qa.6 gray custom/ancestry figure system, but removes the bulky framing controls from the Inventory page itself.

New / corrected in qa.7:
- Source and Ancestry stay visible in the compact Equipment Figure header
- a single gear icon opens Equipment Figure Settings
- Custom image path, Fit, Zoom, Horizontal and Vertical controls now live in that settings dialog
- Apply saves the visual settings to the existing `flags.realm-guard.equipmentFigure` preferences
- Cancel is non-destructive
- Ancestry Figure keeps its fixed ancestry framing; Custom Figure framing remains independently stored
- built-in gray Custom Figure fallback remains unchanged
- Human/Dunadan/Elf/Dwarf/Halfling ancestry switching remains unchanged

Important preservation:
- Inventory rules are unchanged
- M5 Gear / Inventory / Conflict Tool CORE services remain shadow/read-only
- Legacy Mixed remains sole live Inventory and Conflict authority
- Token Builder drag/drop and square PC portrait / round token separation remain unchanged
- M2, M3 and verified M4 behavior remain unchanged

QA protocol: TEST_PROTOCOL_v1.7.0-qa.7.md
Foundry target: v13.351.
Approved visual baseline entering this build: v1.7.0-qa.6 gray Custom/Ancestry Figure system.