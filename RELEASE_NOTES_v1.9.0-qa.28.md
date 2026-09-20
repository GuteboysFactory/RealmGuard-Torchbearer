# Realm Guard / Torchbearer v1.9.0-qa.28 — Quick NPC Library 2.0

This build turns the existing starter NPC templates into a large searchable Quick NPC Library intended for live GM use.

## Quick NPC Library
The GM Dock NPC tool now opens a searchable library instead of a small static template list.

Search covers:
- template name
- occupation / role
- category and subcategory
- culture / people
- competence tier
- threat tier
- concept
- tags
- aliases / synonyms

Examples intentionally supported by the search model include:
- bartender -> Innkeeper
- healer bree -> Bree Healer
- old ranger -> Ranger variants
- big orc -> Orc Brute

Filters:
- category
- culture
- competence

Double-clicking a result creates the NPC immediately.
The Create button does the same explicitly.

## Large generated template library
The library is generated from reusable archetype seeds and competence tiers rather than hundreds of duplicated hand-written stat blocks.

The generated set covers a broad range of:
- Dúnedain / Rangers
- Bree-land civilians and trades
- Gondor
- Rohan
- Dwarves
- Elves
- Hobbits
- Dunlendings / Northmen
- travellers and specialists
- officials, nobles and learned roles
- military NPCs
- criminals and outlaws
- Orcs and Shadow servants
- undead
- beasts and creatures

Each generated template carries structured metadata:
- schemaVersion
- libraryVersion
- templateId
- category / subcategory
- people / culture
- occupation
- competence
- threat
- aliases
- tags
- relationshipSuitability
- normalized searchText

Only canonical Realm Guard Skills are allowed by the generator.

## Template behavior
Creating an NPC copies the template into a normal editable Foundry Actor.
The new Actor is not permanently linked to the template.

Existing edited NPC templates remain protected by the Starter Library's non-destructive sync behavior. Missing generated templates are added; existing matching entries are not overwritten.

## Local image drop on template
Existing image-drop behavior is preserved and integrated into the searchable library:
- drag a local image onto a search result
- image uploads into Realm Guard NPC art storage
- NPC Actor is created from the selected template
- dropped image becomes portrait / prototype token texture

The NPC Builder now uses Foundry's modern FilePicker implementation path.

## Explicitly NOT in qa.28
- no desktop-image drop directly onto the canvas
- no token spawn at canvas drop coordinates
- no M8 Relationship -> Create NPC
- no Create Ranger Wizard NPC creation
- no NPC - PC Relations folder behavior
- no automatic relationship NPC creation

Those features will consume this verified library in later steps.
