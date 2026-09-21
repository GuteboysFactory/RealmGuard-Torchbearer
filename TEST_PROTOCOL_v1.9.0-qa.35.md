# v1.9.0-qa.35 — NPC Group Templates QA

## Gate A — Group Templates entry point
Open GM Quick NPC Library.

Expected:
- **Group Templates** button is visible
- individual Quick NPC search/create remains unchanged

## Gate B — Group library
Open Group Templates.

Expected:
- at least 8 starter groups are visible
- each card shows group purpose and member composition
- no Actors are created by merely opening the library

## Gate C — review resolution
Open **Ranger Patrol**.

Expected:
- review lists the group members
- every member has a resolved Quick NPC source template
- Group Name is editable
- destination explains `Actors > NPCs Groups`

## Gate D — cancel safety
Cancel the review.

Expected:
- no new Actor folder
- no new NPC Actors

## Gate E — create group
Open Ranger Patrol again and press **Create Group**.

Expected:
- root Actor folder `NPCs Groups` exists
- a dedicated Ranger Patrol child folder is created beneath it
- expected NPC members are created inside that child folder
- no group NPC opens a sheet automatically during bulk creation

## Gate F — actor independence and provenance
Open created group members.

Expected:
- each Actor is fully editable
- editing a created Actor does not modify its Quick NPC source template
- each Actor has Realm Guard `quickNpcGroup` metadata identifying:
  - shared group instance
  - group template
  - member role/index
  - source template

## Gate G — duplicate group name
Create the same Group Template again without renaming it.

Expected:
- a new numbered sibling folder is created, e.g. `Ranger Patrol (2)`
- the first group remains untouched
- Actors are not merged silently

## Gate H — Relationship NPC regression
Create a Relationship NPC through the existing M8/Recruitment flow.

Expected:
- it still goes to `NPC - PC Relations`
- PersonRecord Actor linking remains intact
- it does not go to `NPCs Groups`

## Gate I — qa.34 regression
Run Recruitment through Service & Specialty and Structured Relationships.

Expected:
- Service remains dropdown-based
- no live Service counter has returned
- Continue validates exact Service allocation
- Name / Profession / Location remain separate
- smart Recruitment relationship NPC review still works

## PASS
qa.35 passes when Group Templates create isolated, editable NPC groups under `NPCs Groups` without changing the established individual or relationship NPC workflows.


## VERIFIED RESULT

**PASS — 2026-09-21 / Foundry VTT 13.351**

Live QA confirmed:
- Group Templates entry point works
- starter group library renders correctly
- group review resolves members correctly
- cancel creates nothing
- group creation produces isolated child folders under `NPCs Groups`
- created NPC Actors remain independently editable
- duplicate group names create numbered sibling folders
- Relationship NPC flow remains in `NPC - PC Relations`
- qa.34 Service / Structured Relationship regression remains intact

No blocking issues were reported during qa.35 live validation.
