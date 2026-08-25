# Realm Guard / Torchbearer for Foundry VTT

**Version:** 1.0.8.3  
**Target:** Foundry VTT 13.351  
**Status:** Stable public release / GOLD  
**Current stable baseline:** v1.0.8.3

## v1.0.8.3 GOLD

Realm Guard / Torchbearer v1.0.8.3 completes the planned 1.0.x stabilization and polish cycle. The release includes the cumulative improvements from v1.0.5 through v1.0.8.3, including:

- automatic Skill and Ability advancement
- Beginner's Luck + Tap Nature integration
- immediate Level Up and Talent flow
- non-modal system windows
- movable GM Dock
- dark, readable RG/TB chat presentation
- player-to-player Help Requests and Synergy
- Baseline Obstacle, GM approval and Live Roll OB support
- simplified and hardened Conflict Engine flow
- Custom Roll / Flexible Test Engine
- automatic untrained Skill learning
- read-only automatic roll modifiers and improved dice presentation
- Smart NPC Drag & Drop
- NPC Templates & Quick Spawn
- step-by-step Conflict chat results
- corrected Trait session-use rules and End Session reset
- improved NPC sheet layout and Conditions presentation
- Quick Token Builder with manual framing, zoom, Fit/Fill and explicit Save
- round NPC token generation with preserved original artwork
- compact GM Notes layout on NPC sheets

The internal Foundry package id remains `realm-guard` to preserve compatibility with existing Worlds.

## Installation

In Foundry VTT, open **Game Systems > Install System** and paste this Manifest URL:

`https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/system.json`

### Manual installation

Download `realm-guard-foundry-v1.0.8.3.zip` from this repository and extract the `realm-guard` folder into your Foundry `Data/systems/` directory.

## Rules identity

This fan-made game system deliberately combines:

1. **Realm Guard: Rangers of the North** rules where that hack defines or overrides play;
2. inherited **Mouse Guard RPG 2nd Edition** core mechanics where Realm Guard does not replace them;
3. selected compatible **Torchbearer 2nd Edition** ideas that were deliberately adopted; and
4. clearly marked **Realm Guard / Torchbearer Foundry expansions**.

The release is not presented as a one-to-one digital edition of any single source book.

## Global Manual & Rules Reference

The integrated manual contains:

- **Using the Foundry System** — where the tools live and how the implemented play loop works.
- **Rules Reference** — concise summaries of the rules and automation boundaries actually used by the system.

Rules are marked as `RULE`, `AUTOMATED`, `GM CALL`, or `RG/TB FOUNDRY` where appropriate.

## Join Page World Description

Realm Guard / Torchbearer displays the description saved in Foundry under **Edit World > World Description** when Foundry's **Join Page Theme** is set to **Default**. The system does not inject or overwrite World Description text.

## Data preservation

The 1.0.x line keeps the internal system id `realm-guard` and is designed to preserve existing World data. Existing Actors, NPCs, Scenes, Journals, Items, Compendiums, Recruitment data, Inventory, Conditions, Tokens, Talents and progression are not deliberately reset by these updates.

## Project repository

https://github.com/GuteboysFactory/RealmGuard-Torchbearer

## Fan project notice

Realm Guard / Torchbearer for Foundry VTT is a non-commercial fan-made project. It is not affiliated with or endorsed by Foundry Gaming LLC, Tolkien Enterprises / Middle-earth Enterprises, the Tolkien Estate, Mouse Guard, Archaia/BOOM! Studios, Burning Wheel, or the creators and publishers of Torchbearer. Rights to referenced settings, games, names, and artwork remain with their respective owners.
