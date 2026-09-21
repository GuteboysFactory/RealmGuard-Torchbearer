# Realm Guard / Torchbearer v1.9.0-qa.37 — Living Relationship Status

qa.37 continues M8 Social Network Migration by making the existing RelationshipStatus / RelationshipHistory backend usable directly from the Ranger Relationships tab.

## Status editing
GM users now get a **Status** action on each normalized Relationship card.

Available states:
- Unknown
- Friendly
- Neutral
- Estranged
- Hostile

Changing status opens a review dialog with:
- current status
- new status
- optional reason / event
- optional session / reference

No history entry is created when the selected status is unchanged.

## Relationship History
Every actual status transition appends a RelationshipHistory record preserving:
- previous status
- new status
- optional reason
- optional session/reference
- timestamp
- source

The Relationships tab exposes a compact collapsible history preview for relationships that have changed.

## Authority and migration safety
- Status changes are GM-only during M8 migration.
- Legacy relationship fields remain preserved.
- Legacy Mixed remains gameplay authority.
- The normalized Social Network flag stores the changing relationship state/history.
- Existing PersonRecord / Actor linking and Relationship NPC creation remain unchanged.

## Explicitly unchanged
- Recruitment relationship source fields
- Circles rules and live Circles integration
- Quick NPC / Group Templates
- Relationship NPC destination
- Actor links
- Legacy Mixed rules
