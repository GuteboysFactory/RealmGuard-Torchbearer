# Realm Guard / Torchbearer for Foundry VTT

**Version:** 1.0.8.44  
**Target:** Foundry VTT 13.351  
**Status:** Stable public release / GOLD  
**Current stable baseline:** v1.0.8.44

## v1.0.8.44 GOLD

Realm Guard / Torchbearer v1.0.8.44 is the current verified GOLD release. It carries forward the complete 1.0.x feature line and adds the latest live-tested stability, portrait, Conflict and readability improvements.

Highlights include:

- automatic Skill and Ability advancement
- Beginner's Luck + Tap Nature integration
- immediate Level Up and Talent flow
- non-modal system windows and movable GM Dock
- player-to-player Help Requests and Synergy
- Baseline Obstacle, GM approval and Live Roll OB support
- Custom Roll / Flexible Test Engine
- automatic untrained Skill learning
- Smart NPC Drag & Drop, NPC Templates and Quick Spawn
- corrected Trait session-use rules and End Session reset
- persistent Ranger portrait framing and non-destructive Original Portrait / Token Portrait switching
- persistent Token Builder framing with preserved source artwork
- improved GM Quick Inspector layout and canvas token-name hover
- contextual hover explanations across supported dropdowns and Conflict controls
- audited Tap Nature availability in Conflict, including Beginner's Luck post-halving behavior and Resources/Circles exclusions
- simplified, more readable standard roll result cards
- rebuilt Conflict chat presentation with clear Action vs Action, side-by-side results, disposition changes and expandable technical details
- readable Starting Disposition, Maneuver and Conflict Complete cards
- hardened Conflict planning, lock and reveal progression

The internal Foundry package id remains `realm-guard` to preserve compatibility with existing Worlds.

## Installation

In Foundry VTT, open **Game Systems > Install System** and paste this Manifest URL:

`https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/system.json`

### Manual installation

Download `realm-guard-foundry-v1.0.8.44.zip` from this repository and extract the `realm-guard` folder into your Foundry `Data/systems/` directory.

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
