# Realm Guard / Torchbearer v1.9.0-qa.36 — Generic NPC Template Naming

qa.36 is an M8 cleanup build following the verified qa.35 NPC Group Template release.

## Generic reusable template names
Common civilian/trade/travel templates no longer expose **Bree** in their display names.

Examples:
- `Bree Innkeeper · Ordinary` -> `Innkeeper · Ordinary`
- `Bree Miller · Skilled` -> `Miller · Skilled`
- `Bree Farmer · Veteran` -> `Farmer · Veteran`
- `Bree Guide · Skilled` -> `Guide · Skilled`

These templates are intended to be reusable in any suitable settlement or campaign location.

The former Bree culture bucket is now presented as **Common / Common Folk** metadata for generic roles. The internal legacy culture key remains stable for compatibility and existing template IDs are not rewritten.

## Group cleanup
- `Bree Road Caravan` is now `Road Caravan`
- category is now `Travellers`
- member matching uses generic Merchant / Mercenary / Guide queries

## Stable identity and migration safety
Quick NPC generated templates now use their existing stable `metadata.templateId` as the Starter Library identity.

Starter Library sync:
- recognizes existing templates by stable template ID
- renames only known untouched generated `Bree ...` entries
- preserves GM-renamed/edited template names
- avoids creating duplicate generic templates during the naming migration

## Default portrait preparation
Quick NPC metadata now includes a generic `portraitKey` based on role, e.g.:
- `innkeeper`
- `smith`
- `hunter`
- `orc-warrior` where appropriate from the role name

This is metadata preparation only. qa.36 does not require portrait assets and does not change the current fallback image.

## Explicitly unchanged
- Quick NPC stats / Skills / Gear
- competence tiers
- relationship matching
- qa.35 NPC Group creation behavior
- Relationship NPC destination
- Recruitment
- M8 social records
- Legacy Mixed authority
