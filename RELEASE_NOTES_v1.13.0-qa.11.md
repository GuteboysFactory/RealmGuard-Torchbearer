# Realm Guard / Torchbearer v1.13.0-qa.11 — M10D.10 TB2E Inventory / Gear Bounded Shadow

M10D.9 Recovery was live-verified and closed on v1.13.0-qa.10.

- Adds a READ_ONLY shadow adapter for the PARTIAL Torchbearer 2E Inventory / Gear domain.
- Models source-backed inventory locations and capacity statements: Head 1 worn, Neck 1 worn, two Hands with worn/carried capacity, Torso 3, Belt 3, Feet clothing guidance, Legs pants-only guidance, and one-small-item Pocket.
- Models Carried / Wield / Worn / Pack storage labels without inferring unavailable item catalogue data.
- Models Carried 4 as two people using both hands.
- Models Backpack (2 Torso worn / 6 Pack) and Satchel (1 Torso worn / 3 Pack) with mutual exclusivity. Backpack Fighter/Dungeoneer negative effect is recorded without inventing its missing magnitude.
- Models Belt as three Pack 1 or Carried 1 items with bundled items disallowed.
- Models two-handed weapons as needing both hands at all times or being dropped.
- Models nested-container requirement as outer capacity for the inner container plus contents, while avoiding unavailable item-specific slot data.
- Models container damage/content loss only as GM twist guidance; no mutations.
- Models standard 12-slot caches, Camp build for one Check, Town free build with a parent/friend who has a home, and at-will transfer once built.
- Models starting-gear boundaries: well-worn clothes + utilitarian belt are slotless, choose Satchel or Backpack, Magician requires spell book, Theurge carries two holy relics. The visual starting-gear tables are not converted into automatic grants.
- DG148 full gear catalogue and DG156-157 weapon effects remain unavailable/source-incomplete and are not inferred.
- No placement, container, cache, gear grant, item conversion or Actor/Item/Journal/setting mutation.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E profiles remain unchanged.
- QA advances to v1.13.0-qa.11. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.11.md.
