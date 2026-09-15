Realm Guard / Torchbearer v1.7.0-qa.6 — M5 Equipment Figure silhouette revision.

This patch replaces the rejected Equipment Figure artwork approach with the approved gray transparent silhouette language supplied during live QA and simplifies the Equipment Figure workflow to exactly two modes.

New / corrected in qa.6:
- Equipment Figure now exposes only `Custom Figure` and `Ancestry Figure`
- Character Art / Auto modes are removed from Equipment Figure
- Custom Figure with no custom path uses the approved medium-gray humanoid silhouette by default
- Custom Figure may still be overridden by an explicit custom image path with Fit/Zoom/X/Y framing
- Ancestry Figure automatically resolves from `system.ancestry`
- Dúnadan and Human use the approved full-size gray silhouette language
- Elf uses the same silhouette language with taller/slimmer proportions and pointed ears
- Dwarf uses the same silhouette language with shorter/broader proportions
- Halfling/Hobbit uses the same silhouette language with smaller proportions
- unknown/custom ancestry falls back to the neutral gray humanoid
- all built-in figure assets have transparent backgrounds; no environmental background is baked into the figure assets
- old geometric/mannequin/paper-doll artwork is removed from the active Equipment Figure registry

Important preservation:
- Inventory rules are unchanged
- M5 Gear / Inventory / Conflict Tool CORE services from qa.5 remain shadow/read-only
- Legacy Mixed remains sole live Inventory and Conflict authority
- Token Builder drag/drop and square PC portrait / round token separation remain unchanged
- M2, M3 and verified M4 behavior remain unchanged

QA protocol: TEST_PROTOCOL_v1.7.0-qa.6.md
Foundry target: v13.351.
Approved baseline entering this build: v1.7.0-qa.5 M5 CORE foundation plus qa.4 Token/portrait UX.
