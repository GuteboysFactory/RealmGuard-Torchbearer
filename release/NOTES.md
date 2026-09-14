Realm Guard / Torchbearer v1.7.0-qa.1 — M5 Equipment Silhouette / Ancestry Foundation.

v1.6.0-qa.6 verified the full M4 Advancement / Nature / Conditions foundation. v1.7.0-qa.1 starts M5 with a presentation-safe equipment silhouette system while preserving the existing Legacy Mixed inventory rules and drag/drop behavior.

New in qa.1:
- introduces a dedicated character `system.ancestry` field instead of repurposing the existing Lineage / House identity field
- adds an equipment silhouette registry with Neutral, Human / Dúnadan, Dwarf, Elf and Halfling / Hobbit forms
- replaces the old geometric paper-doll appearance with more finished illustrated SVG silhouettes
- adds ancestry aliases including Dúnadan/Dunedain, Númenórean, Eldar, Dwarven and Hobbit
- unknown/custom ancestry values fall back safely to the Neutral Humanoid silhouette
- provides a backward-compatible visual bridge when an older Lineage field literally contains an ancestry word
- adds a quick Ancestry selector directly above the Equipment stage
- exposes diagnostics under `game.realmGuard.inventory.silhouette`
- adds headless M5 silhouette-registry smoke QA

Important preservation:
- silhouette selection is visual only
- inventory zones, capacities, hand rules, containers and gear assignments are unchanged
- Legacy Mixed remains sole live inventory authority
- the existing Lineage / House value is not migrated or overwritten
- M2, M3 and fully verified M4 behavior remain unchanged
- Conflict remains on the Legacy adapter path until M6

QA protocol: TEST_PROTOCOL_v1.7.0-qa.1.md
Foundry target: v13.351.
Approved baseline: v1.6.0-qa.6 PASS / M4 VERIFIED.
