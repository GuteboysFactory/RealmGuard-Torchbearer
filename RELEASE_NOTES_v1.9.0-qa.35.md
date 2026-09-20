# Realm Guard / Torchbearer v1.9.0-qa.35 — NPC Group Templates

qa.35 adds the first reusable NPC Group Template workflow on top of the verified Quick NPC Library.

## Group Templates
Quick NPC Library now has a dedicated **Group Templates** entry point for GMs.

The first library contains:
- Ranger Patrol
- Gondorian Road Patrol
- Rohirric Rider Patrol
- Dwarven Caravan Guard
- Bree Road Caravan
- Dunlending Warband
- Orc Scout Band
- Orc Warband

Each group is a composition of normal Quick NPC roles and competence targets rather than a new parallel NPC rules system.

## Review before create
Opening a Group Template resolves the best current Quick NPC template for every member using the existing smart matcher.

The GM sees:
- group name
- member roles
- competence
- resolved source template

Nothing is created until **Create Group** is pressed.

## Actor organization
Created groups use:

`Actors > NPCs Groups > <Group Name>`

Each invocation receives its own subfolder. Reusing the same name creates a safe numbered sibling instead of silently merging two groups.

Every member:
- is a normal editable NPC Actor
- is detached from the source template after creation
- retains source-template trace metadata
- retains shared group-instance metadata

## Existing relationship flow
Relationship NPCs are unchanged and still use:

`Actors > NPC - PC Relations`

Recruitment relationship review, PersonRecord linking and structured Name / Profession / Location data are unchanged.

## Explicitly unchanged
- M8 Relationship status/history semantics
- Circles rules
- Recruitment rules
- Service & Specialty qa.34 UX
- Quick NPC individual creation
- Legacy Mixed live authority
