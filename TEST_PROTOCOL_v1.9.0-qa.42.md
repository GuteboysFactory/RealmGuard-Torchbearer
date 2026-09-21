# v1.9.0-qa.42 — Default NPC Template Portraits QA

## Gate A — Starter Library refresh
Install/update qa.42 as GM and enter the world.

Expected:
- Starter Library upgrades to seed version 0.27.0
- Quick NPC templates no longer all show the generic creature image
- template cards show role/culture-appropriate portraits

## Gate B — Common templates
Check examples such as:
- Innkeeper
- Farmer
- Smith
- Healer
- Carpenter
- Stablemaster
- Cartographer

Expected:
- each has a relevant packaged default portrait

## Gate C — cultures / enemies
Check:
- Dwarven template
- Elven template
- Hobbit template
- Dunlending template
- Orc Warrior / Archer / Captain
- Warg
- Hill/Cave Troll
- Undead / Barrow-wight

Expected:
- culture/creature-specific defaults are shown
- no missing-image icons

## Gate D — NPC creation
Create an NPC from several templates without dropping custom art.

Expected:
- created NPC inherits template portrait
- prototype token uses the same portrait
- token is 1x1 / contain / centered

## Gate E — custom image preservation
Use a starter template that already has a GM-selected custom portrait, then reload/sync Starter Library.

Expected:
- custom portrait is not overwritten

## Gate F — custom image override
Create from a template while dropping/selecting a custom image.

Expected:
- custom image overrides the default portrait
- existing Token Builder workflow remains unchanged

## Gate G — qa.41 regression
Check Relationships / Circles / Enmity quickly.

Expected:
- no behavioral change
- qa.41 remains intact

## PASS
qa.42 passes when packaged default art is visible across Quick NPC templates, newly created NPCs inherit it, custom GM art is preserved, and no missing asset paths appear.
