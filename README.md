# Realm Guard / Torchbearer for Foundry VTT

**Version:** 1.0.2 - Sidebar Manual UI Hotfix  
**Target:** Foundry VTT 13.351  
**Status:** Stable public release  
**Release baseline:** v1.0.2

## v1.0.2 sidebar manual UI hotfix

The old floating **RG/TB** pill button has been replaced by an icon-only manual button integrated with Foundry's sidebar controls. The button still opens the Realm Guard / Torchbearer Manual & Rules Reference, but now follows the visual language of the native sidebar instead of floating above it.

No gameplay rules, Actor data, World data, roll logic, conditions, advancement, inventory, conflicts, recruitment or other core system mechanics were changed in this patch.

## v1.0.1 World Info hotfix

Foundry's native **Edit World > World Description** field is the single source for text shown in the Join Page World Description panel. The system does not inject, create, overwrite or restore World Description text. For the native World Description panel to be visible, use **Join Page Theme: Default**.

## v1.0 identity

The visible system name is **Realm Guard / Torchbearer**. The internal Foundry package id remains `realm-guard` so existing Worlds continue to identify the same game system after upgrading from the verified 0.x line.

This fan-made game system deliberately combines:

1. **Realm Guard: Rangers of the North** rules where that hack defines/overrides play;
2. inherited **Mouse Guard RPG 2nd Edition** core mechanics where Realm Guard does not replace them;
3. selected compatible **Torchbearer 2nd Edition** ideas that were deliberately adopted; and
4. clearly marked **Realm Guard / Torchbearer Foundry expansions**.

The release is not presented as a one-to-one digital edition of any single source book.

## Join page presentation

The system keeps the dedicated **Realm Guard / Torchbearer** world/login background and uses Foundry's native **World Description** as the authoritative Join Page text. Existing Worlds keep their World data; the join-page theme is presentation-only and does not move, rewrite or auto-fill campaign content.

## Global Manual & Rules Reference

The integrated manual has two layers:

- **Using the Foundry System** - where the tools live and how the implemented play loop works.
- **Rules Reference** - concise summaries of the rules and automation boundaries actually used by the system.

Rules are marked as:

- `RULE`
- `AUTOMATED`
- `GM CALL`
- `RG/TB FOUNDRY`

## Permanent Rules Reference Journal

On first GM load, the system creates a player-readable Journal folder **Realm Guard / Torchbearer** and the Journal **Realm Guard / Torchbearer - Rules Reference** if it does not already exist.

Normal world loading does not overwrite an existing Rules Reference Journal.

Shipped text references:

- `SYSTEM_MANUAL.md`
- `RULES_REFERENCE.md`

## Existing GOLD features retained

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

v1.0.2 does not rename the internal system id and does not deliberately move/reset existing World data. Existing Actors, NPCs, Scenes, Journals, Items, Compendiums, Recruitment, Inventory, Conditions, Tokens, Talents and progression must remain intact.

## Installation

### Install directly in Foundry VTT

In Foundry VTT, open **Game Systems > Install System** and paste this Manifest URL:

`https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/system.json`

### Manual installation

Download `realm-guard-foundry-v1.0.2.zip` from this repository and extract the `realm-guard` folder into your Foundry `Data/systems/` directory.

## Project repository

https://github.com/GuteboysFactory/RealmGuard-Torchbearer

## Join Page World Description

Realm Guard / Torchbearer displays the description saved in Foundry under **Edit World > World Description** when Foundry's **Join Page Theme** is set to **Default**. If the GM leaves that field blank, the Join Page description content is intentionally blank. The system does not write to the World document.

## Fan project notice

Realm Guard / Torchbearer for Foundry VTT is a non-commercial fan-made project. It is not affiliated with or endorsed by Foundry Gaming LLC, Tolkien Enterprises / Middle-earth Enterprises, the Tolkien Estate, Mouse Guard, Archaia/BOOM! Studios, Burning Wheel, or the creators and publishers of Torchbearer. Rights to referenced settings, games, names, and artwork remain with their respective owners.
