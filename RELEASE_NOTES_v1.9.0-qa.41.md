# Realm Guard / Torchbearer v1.9.0-qa.41 — Circles Enmity Clause

qa.41 continues M8 Social Network Migration by implementing the GM-controlled Enmity Clause for failed **Find New Person** Circles tests.

## Failed new-person Circles
A failed Find New Person roll no longer ends with a passive notification.

The GM chooses:
- **Normal Failure** — use the normal table failure route; Social Network remains unchanged.
- **Invoke Enmity Clause** — review/create the inimical person as a Social Network Enemy.
- **Decide Later** — make no Social Network mutation now.

For a player-owned Ranger, the failure request is routed to an active GM over the Realm Guard system socket.

## Enmity creation
When the GM confirms Enmity:
- PersonRecord is created or reused
- Relationship role = ENEMY
- Relationship status = HOSTILE
- Relationship origin = ENMITY
- optional reason/session reference is preserved
- no NPC Actor is created automatically

The failed Circles search details are prefilled, but the GM may replace Name, Profession, People, Location and Notes before committing.

## Duplicate / existing-person behavior
Exact identity matching reuses the existing PersonRecord.

If that person already has a Relationship:
- no duplicate Relationship is created
- the existing Relationship becomes ENEMY / HOSTILE / ENMITY
- a status transition to HOSTILE is appended to RelationshipHistory when needed

If the matching relationship is already ENEMY / HOSTILE, it is simply reused.

## Existing M8 tools
The resulting Enemy can use:
- Relationship Status / History
- Edit Contact/person details where applicable
- Create NPC
- Link Existing Actor
- Open / Unlink

Explicit NPC creation still routes to `NPC - PC Relations`.

## Deliberately deferred
Mouse Guard's mechanical Enemy bonus to argument/speech disposition is **not** activated in qa.41. That effect belongs to the Conflict/profile layer and will be integrated explicitly rather than silently changing M6/Legacy Mixed conflict behavior.

## Unchanged
- successful Find New Person = Neutral CIRCLES Contact
- Known Person mode
- Standard Circles
- qa.40 GM Obstacle authority
- Recruitment relationships
- Legacy Mixed gameplay authority
