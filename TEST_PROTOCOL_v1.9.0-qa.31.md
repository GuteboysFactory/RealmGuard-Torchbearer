# v1.9.0-qa.31 — Recruitment Relationship NPC Review QA

## Gate A — finish Recruitment
Create a new Ranger through Recruitment and complete all normal relationship fields.

Expected:
- Ranger Actor is created successfully in PC
- normal Recruitment data is intact
- after creation, GM receives a Relationship NPC review

## Gate B — review dialog
Expected buttons:
- Create All
- Choose NPCs
- Not Now

Expected:
- listed people reflect the Recruitment relationships
- no NPC has been created yet

## Gate C — Not Now
Choose Not Now.

Expected:
- no relationship NPC Actors are created
- Ranger remains valid
- Relationships page still contains the people
- Create NPC from qa.30 remains available later

## Gate D — Choose NPCs
Create another Ranger, choose Choose NPCs.

Expected:
- checklist appears
- select only one or two people
- Continue begins Quick NPC selection only for selected people

For each selected person:
- Quick NPC Library opens
- search is prefilled with a useful profession/culture query
- nothing is created until a template is chosen

## Gate E — creation / linking
Choose a template for one selected relationship.

Expected:
- Actor name is the relationship person's name
- template stats / Skills / Gear are used
- Actor is created in NPC - PC Relations
- PersonRecord is linked automatically
- Ranger Relationships page shows Open / Unlink for that person

## Gate F — Create All
Create another Ranger or use a disposable test Ranger and choose Create All.

Expected:
- all relationship people become queued for explicit Quick NPC template selection
- templates are still chosen manually
- no automatic template decision occurs

## Gate G — persistence
Reload Foundry after creating at least one relationship NPC through Recruitment.

Expected:
- Ranger persists
- NPC persists in NPC - PC Relations
- relationship Actor link persists
- Open works

## PASS
qa.31 passes when Recruitment can finish normally, then optionally hand relationship people to Quick NPC Library without automatically creating anything or changing Recruitment rules.
