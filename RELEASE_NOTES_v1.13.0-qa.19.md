# Realm Guard / Torchbearer v1.13.0-qa.19 — M10D.17 Full-Core Source Expansion Audit

The project source base now includes the full Torchbearer 2E core books plus two optional supplements.

- Registers Dungeoneer's Handbook and Scholar's Guide as essential CORE rulebooks.
- Registers Lore Master's Manual and Scavenger's Supplement as OPTIONAL_EXPANSION sources; optional rules remain separate from the core profile.
- Preserves the previous guide-only M10D.16 audit as historical QA evidence.
- Adds a new full-core source matrix: **18 VERIFIED / 0 SOURCE_BLOCKED / 1 MANUAL**.
- Traits, Armor, Conflict and Magic / Invocations are no longer source-blocked; each now requires a new READ_ONLY shadow adapter.
- All 14 existing TB2E shadows are marked for full-core reconciliation before any live authority can advance.
- Records confirmed guide-era implementation mismatches for Character Creation, Conditions, Help and Nature.
- M11.1 is safety-paused: existing shadows remain SHADOW, new adapter domains remain OFF, DUAL_RUN/LIVE transitions are refused, and the global kill switch remains engaged.
- Full TB2E profile switching and Character Creation commits remain blocked.
- No Actor, Item, Journal or Setting writes are added.
- Next milestone: **M10D.18 Core Reconciliation**.
- QA advances to v1.13.0-qa.19. Stable remains v1.12.0.
