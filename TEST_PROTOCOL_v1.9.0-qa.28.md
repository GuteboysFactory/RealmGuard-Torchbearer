# Realm Guard / Torchbearer v1.9.0-qa.28 — Quick NPC Library 2.0 QA

## Gate A — startup / sync
Start Foundry as GM after installing qa.28.

Expected:
- no startup errors
- Starter Library performs a non-destructive missing-entry sync for the new NPC library
- existing edited starter entries are not overwritten

Open Starter Library and confirm the NPC template count is now substantially larger than the old 8-template starter set.

## Gate B — open Quick NPC Library
GM Control / GM Dock -> Quick NPC Library.

Expected:
- searchable Quick NPC Library opens
- search field is focused
- category / culture / competence filters are visible
- result count is visible
- results are presented as cards

## Gate C — synonym search
Test these searches one at a time:

1. bartender
Expected: Innkeeper templates are among the leading matches.

2. healer bree
Expected: Bree Healer is among the leading matches.

3. old ranger
Expected: Dúnadan Ranger variants are among the leading matches.

4. big orc
Expected: Orc Brute is among the leading matches.

Also try a normal occupation/culture query of your choice.

## Gate D — filtering
Use Category, Culture and Competence filters.

Expected:
- result list updates immediately
- result count updates
- Clear resets query and filters

## Gate E — Create
Choose a template and click Create.

Expected:
- a normal NPC Actor is created
- stats, trained skills and gear from the chosen template are present
- Actor remains fully editable
- NPC is created in the normal NPC folder
- no persistent dependency on the template is required

Edit something on the Actor.

Expected:
- template entry itself is unchanged

## Gate F — double-click quick create
Double-click a template result outside its button.

Expected:
- NPC is created immediately from that template
- no duplicate dialog is required

## Gate G — local image on result
Drag a local PNG/JPG/WEBP onto a template card.

Expected:
- card highlights as image-drop target
- image uploads
- NPC is created from that template
- dropped filename is used as NPC name when meaningful
- image is used as portrait / prototype token texture
- no deprecated FilePicker warning appears

## Gate H — canonical skills
Spot-check several generated NPCs from different categories:
- civilian/trade
- Ranger
- military
- Orc
- creature

Expected:
- trained Skills use existing Realm Guard Skill names
- no unexpected duplicate/custom Skill names appear from the library generator

## Gate I — non-destructive sync
If practical:
- edit one generated template in the compendium
- run Add Missing Entries again

Expected:
- edited template is not overwritten
- sync only adds missing entries

## PASS criteria
qa.28 passes when the GM can rapidly search a broad NPC library using ordinary terminology/synonyms, create a complete editable NPC in seconds, and use local-image drop on a result without breaking templates or existing Starter Library content.
