# Realm Guard / Torchbearer v1.9.0-qa.21 — Skills + Inventory/Gear Parchment Harmony QA

## Gate A — Skills

Open Skills.

Expected:
- Skills page reads as part of the same parchment document as Character.
- No large opaque black outer slab.
- Trained Skill cards are light paper surfaces with clear Skill name/rating.
- PASS/FAIL learning controls remain readable and clickable.
- Beginner's Luck cards are lighter/lower emphasis but fully readable.
- Custom Skill, edit/delete and +/- controls remain visibly interactive.

Test one normal Skill roll and one Beginner's Luck roll.

## Gate B — Inventory & Gear outer surfaces

Open Inventory & Gear.

Expected:
- Tokens of Power, Containers, Equipment frame and Unassigned Gear integrate with the parchment.
- Section titles keep the Realm Guard dark forest/brass identity.
- Containers no longer read as detached black boxes.
- Unassigned items remain readable and draggable.

## Gate C — Equipment focal workspace

Expected:
- central paper-doll stage remains intentionally dark
- silhouette and equipment slots remain readable
- Figure controls above the stage use a parchment surface
- drag/drop between Unassigned, Containers and Equipment works normally
- two-hand / blocked-slot states remain clear

## Gate D — resize

Resize wide / narrow / tall / short.

Expected:
- Skills cards and learning controls do not overflow
- Gear columns follow the existing responsive layout
- qa.19 framed parchment remains intact

## Gate E — isolation

Expected:
- Character Overview / Background / Relationships / Notes remain unchanged
- NPC / Item / Conflict windows remain unchanged
- no rule/data migration introduced

## PASS criteria

qa.21 passes when Skills and Gear feel like parts of the same framed parchment sheet while the dark Equipment paper-doll workspace keeps its approved visual identity and all existing interactions continue to work.
