# v1.9.0-qa.36 — Generic NPC Template Naming QA

## Gate A — version / load
Install qa.36 in Foundry VTT 13.351.

Expected:
- world loads normally
- no startup errors
- Quick NPC Library opens

## Gate B — generic template display names
Open Quick NPC Library and inspect common civilian/trade templates.

Expected examples:
- `Innkeeper · Ordinary`
- `Miller · Skilled`
- `Farmer · Veteran`
- `Guide · Skilled`

Expected:
- no Quick NPC display name begins with or contains **Bree**
- generic templates remain searchable by role

## Gate C — generic group naming
Open Group Templates.

Expected:
- `Road Caravan` exists
- `Bree Road Caravan` is gone
- group category reads `Travellers`
- Review Group resolves Merchant / Mercenary / Guide / Pony normally

## Gate D — existing Starter Library migration
Use the existing world that previously had qa.35 templates.

Expected:
- untouched generated `Bree ...` templates are renamed to their generic display names
- no duplicate generic copy is added for the same stable template
- template counts do not unexpectedly double

## Gate E — edited template safety
If practical, rename one generated NPC template manually before sync, then run **Add Missing Entries**.

Expected:
- the GM-custom name is preserved
- sync does not overwrite it with the canonical generic display name

## Gate F — Quick NPC regression
Create one generic individual NPC.

Expected:
- Actor creation works normally
- stats / Skills / Gear are unchanged
- created Actor remains editable

## Gate G — qa.35 group regression
Create one NPC Group.

Expected:
- group still creates beneath `NPCs Groups`
- child group folder remains isolated
- members are created normally

## Gate H — Relationship regression
Create or review a Relationship NPC.

Expected:
- destination remains `NPC - PC Relations`
- PersonRecord Actor linking remains intact

## PASS
qa.36 passes when generic template naming is visible, existing generated Bree-prefixed entries migrate without duplicates, GM-renamed entries are preserved, and qa.35/M8 NPC workflows remain intact.
