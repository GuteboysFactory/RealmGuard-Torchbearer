# M10D.17 — Torchbearer 2E Full-Core Source Expansion Audit

## Source authority

The source base has materially changed.

### Core / essential
1. **Dungeoneer's Handbook** — character-facing core rules: creation, abilities, Nature, skills, Wises, Traits, inventory, Arcana, Ritual, advancement, levels and the full reference catalogues.
2. **Scholar's Guide** — game procedures: tests and factors, Grind, Conditions/Recovery, Conflict, Fate, Camp, Town, Respite, adventure design and denizens.

Together these are treated as the complete core rules authority for this implementation audit.

### Optional expansion — kept separate
- **Lore Master's Manual** — advanced/optional rules, extra stock/classes, spells/invocations/equipment and additional conflict/campaign systems.
- **Scavenger's Supplement** — optional classes, Summoning, Traits, Weapons, Town and Denizens.

Optional material is not silently promoted into the core Torchbearer 2E profile.

## Source classification result

The old guide-only Final Foundation Audit is preserved as historical QA evidence, but its source-blocked classification is superseded for current planning.

| Domain | Full-core source status | Implementation consequence |
|---|---|---|
| Tests / Dice | VERIFIED | Existing shadow requires full-core re-audit |
| Abilities / Skills | VERIFIED | Existing shadow requires full-core re-audit |
| Nature | VERIFIED | Existing shadow requires full-core re-audit |
| Traits | VERIFIED | New shadow adapter required |
| Wises | VERIFIED | Existing shadow requires full-core re-audit |
| Help / Teamwork | VERIFIED | Existing shadow requires full-core re-audit |
| Fate / Persona / Resources | VERIFIED | Existing shadow requires full-core re-audit |
| Conditions | VERIFIED | Existing shadow requires full-core re-audit |
| Recovery | VERIFIED | Existing shadow requires full-core re-audit |
| Inventory / Gear | VERIFIED | Existing shadow requires full-core re-audit |
| Armor | VERIFIED | New shadow adapter required |
| Conflict | VERIFIED | New shadow adapter required |
| Advancement | VERIFIED | Existing shadow requires full-core re-audit |
| Session / phases | VERIFIED | Existing shadow requires full-core re-audit |
| Circles / relationships | VERIFIED | Existing shadow requires full-core re-audit |
| Character Creation | VERIFIED | Existing shadow requires full-core re-audit |
| Magic / invocations | VERIFIED | New shadow adapter required |
| Might / Precedence | VERIFIED | Existing shadow requires full-core re-audit |
| Narrative adjudication | MANUAL | Keep GM/table manual |

**Result: 18 VERIFIED / 0 SOURCE_BLOCKED / 1 MANUAL.**

## Confirmed reconciliation findings

The source expansion has already identified concrete places where the guide-bounded implementation must change:

1. Home skill: absent skill starts at rating **2**, not 3.
2. Social Grace: absent skill starts at rating **2**, not 3.
3. Specialty: absent skill starts at rating **2**, not 3.
4. Hungry & Thirsty and Exhausted apply **-1s to conflict disposition**; the old guide ambiguity is no longer retained.
5. Help is forbidden for Will/Health recovery and the Resources test to pay bills when leaving town — not every Resources test in town.
6. Maximum Nature reduced to 0 retires the character at the **end of the adventure**, not the end of the Adventure phase.
7. Full core test factors/tie procedures, gear/weapon/armor rules, conflicts, spells and invocations are now available and old UNAVAILABLE boundaries must be re-audited.

## Safety decision

M11 live integration is paused.

- Existing 14 shadows remain READ_ONLY/SHADOW but may not advance to DUAL_RUN or LIVE until re-audited against the full core books.
- Traits, Armor, Conflict and Magic are no longer source-blocked, but remain OFF until new bounded shadow adapters exist.
- Narrative remains manual.
- Kill switch remains engaged.
- No Actor, Item, Journal or Setting writes are authorized.

## Next milestone

**M10D.18 — Core Reconciliation**

1. Repair confirmed mismatches.
2. Remove stale guide-only source boundaries only where the core books explicitly supply the missing rules.
3. Re-audit the 14 existing shadows.
4. Build new Traits, Armor, Conflict and Magic shadow adapters.
5. Run a new final full-core foundation gate.
6. Only then resume M11 controlled live integration.
