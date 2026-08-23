# Realm Guard / Torchbearer for Foundry VTT

**Version:** 1.0.1 - World Info Hotfix  
**Target:** Foundry VTT 13.351  
**Status:** Stable public release  
**Release baseline:** v1.0.1

## v1.0.1 World Info hotfix

Foundry's native **Edit World > World Description** field is now the single source for text shown in the Join Page World Description panel. The system no longer injects a hard-coded description with CSS. The themed background remains presentation-only and no World description data is created or overwritten.

## v1.0 identity

The visible system name is now **Realm Guard / Torchbearer**. The internal Foundry package id remains `realm-guard` so existing Worlds continue to identify the same game system after upgrading from the verified 0.x line.

This fan-made game system deliberately combines:

1. **Realm Guard: Rangers of the North** rules where that hack defines/overrides play;
2. inherited **Mouse Guard RPG 2nd Edition** core mechanics where Realm Guard does not replace them;
3. selected compatible **Torchbearer 2nd Edition** ideas that were deliberately adopted; and
4. clearly marked **Realm Guard / Torchbearer Foundry expansions**.

The release is not presented as a one-to-one digital edition of any single source book.

## Join page presentation

v1.0.1 keeps the dedicated **Realm Guard / Torchbearer** world/login background and uses Foundry's native **World Description** as the authoritative Join Page text. The system manifest still declares the same artwork as the default background for new Realm Guard / Torchbearer Worlds. Existing Worlds keep their World data; the join-page theme is presentation-only and does not move, rewrite or auto-fill campaign content.

## Global Manual & Rules Reference

v1.0 adds a persistent floating **RG/TB book button** for every user. The manual can be opened while working elsewhere in Foundry instead of requiring a return to chat.

The integrated manual now has two layers:

- **Using the Foundry System** - where the tools live and how the implemented play loop works.
- **Rules Reference** - concise summaries of the rules and automation boundaries actually used by the system.

Rules are marked as:

- `RULE`
- `AUTOMATED`
- `GM CALL`
- `RG/TB FOUNDRY`

## Permanent Rules Reference Journal

On first GM load, v1.0 creates a player-readable Journal folder **Realm Guard / Torchbearer** and the Journal **Realm Guard / Torchbearer - Rules Reference** if it does not already exist.

Normal world loading does not overwrite an existing Rules Reference Journal.

The same v1.0 rules-reference definitions are used by the integrated manual and the seeded Journal.

Shipped text references:

- `SYSTEM_MANUAL.md`
- `RULES_REFERENCE.md`

## Existing v0.26 GOLD features retained

- Recruitment 2.0 / Create Ranger / Recruitment Guide
- Skills, Learning, Beginner's Luck, Nature, Traits, Wises, Teamwork, Fate/Persona
- Conditions, Recovery, Optional Turn Manager / Free Play
- Inventory & Gear paper-doll and Containers
- Tokens of Power
- Levels & Talents
- Card-driven Conflict Engine
- Quick NPC / compact NPC sheet / GM Control
- Starter Compendiums
- GM Content Studio
- End of Session
- World Health Audit
- non-destructive World upgrade/transfer policy

## Data preservation

v1.0 does not rename the internal system id and does not deliberately move/reset existing World data. Existing Actors, NPCs, Scenes, Journals, Items, Compendiums, Recruitment, Inventory, Conditions, Tokens, Talents and progression must remain intact.

### Final v1.0 Join Game correction

v1.0.1 keeps the approved ultra-wide Realm Guard / Torchbearer release artwork while restoring Foundry's native World Description as the authoritative Join Page text source. Join Game layout styling aligns the live Foundry controls with the artwork without injecting campaign/system copy into the description panel.

## Installation

### Install directly in Foundry VTT

In Foundry VTT, open **Game Systems > Install System** and paste this Manifest URL:

`https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/system.json`

### Manual installation

Download `realm-guard-foundry-v1.0.1.zip` from this repository and extract the `realm-guard` folder into your Foundry `Data/systems/` directory.

## Project repository

https://github.com/GuteboysFactory/RealmGuard-Torchbearer

## Join Page World Description

Realm Guard / Torchbearer v1.0.1 displays the description saved in Foundry under **Edit World > World Description** when Foundry's **Join Page Theme** is set to **Default**. If the GM leaves that field blank, the Join Page description content is intentionally blank. The system does not write to the World document.

## Fan project notice

Realm Guard / Torchbearer for Foundry VTT is a non-commercial fan-made project. It is not affiliated with or endorsed by Foundry Gaming LLC, Tolkien Enterprises / Middle-earth Enterprises, the Tolkien Estate, Mouse Guard, Archaia/BOOM! Studios, Burning Wheel, or the creators and publishers of Torchbearer. Rights to referenced settings, games, names, and artwork remain with their respective owners.
