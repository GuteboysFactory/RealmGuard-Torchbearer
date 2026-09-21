# Realm Guard / Torchbearer v1.9.0-qa.38 — Dynamic Contacts

qa.38 continues M8 Social Network Migration by allowing GMs to add reusable Contacts during play, outside Recruitment.

## New Contact
The Ranger Relationships tab now includes **New Contact** for the GM.

A Contact stores:
- Name
- Profession / Role
- People / Culture
- Location
- Notes
- current Relationship Status
- Origin = PLAY

Creating a Contact writes only normalized Social Network data.

**No NPC Actor is created automatically.**

## Duplicate protection
Dynamic Contact creation checks the normalized identity tuple:

`Name + Profession + People + Location`

An exact existing match is reused/rejected rather than creating duplicate PersonRecord / Relationship data.

## Editing
Dynamic Contacts can be edited later from the Relationship card.

Editing updates PersonRecord identity/details while preserving:
- Relationship record
- current Relationship Status
- RelationshipHistory
- linked Actor UUID
- Recruitment relationships

Duplicate protection also applies when editing.

## Existing Relationship tools
A Dynamic Contact can immediately use the existing M8 tools:
- Status / Relationship History
- Create NPC
- Link Existing Actor
- Open
- Unlink

If Create NPC is chosen explicitly, the normal Quick NPC workflow and `NPC - PC Relations` folder are reused.

## Explicitly unchanged
- Recruitment relationships
- Legacy fields
- Circles live integration
- Enmity
- Legacy Mixed gameplay authority
