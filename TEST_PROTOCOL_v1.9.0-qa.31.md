# v1.9.0-qa.31 — Smart Recruitment Relationship NPC Review QA

## Gate A — finish Recruitment
Create a test Ranger through the normal wizard with clear relationship data, for example:
- Friend: Baran Dev / Innkeeper / Bree
- Senior Artisan: Smith
- Mentor: named Ranger
- Enemy: Orc with location

Expected:
- Ranger is created normally in PC
- Relationship NPC review opens afterwards

## Gate B — automatic suggestions
Inspect the review before clicking anything.

Expected:
- every relationship person is listed by name
- every row shows a Suggested template
- Baran-style Friend data should resolve to a sensible Bree Innkeeper template
- Senior Artisan should resolve to a sensible trade template
- Mentor should resolve to a Ranger template
- Orc Enemy should resolve to an Orc template
- no NPC Actor has been created yet

## Gate C — Not Now
Click Not Now.

Expected:
- no relationship NPC Actors are created
- all relationship people remain available on the Ranger Relationships page
- qa.30 Create NPC remains available later

## Gate D — Create All
Create another disposable Ranger and inspect the suggestions.

Click Create All without changing templates.

Expected:
- no Quick NPC Library selection dialogs appear one-by-one
- all relationship NPCs are created directly from the displayed suggestions
- Actors use the relationship people's names
- Actors go to NPC - PC Relations
- all are linked back to their PersonRecords

## Gate E — Choose NPCs
Create another disposable Ranger and click Choose NPCs.

Expected:
- checklist appears
- suggestions are already present
- uncheck some people
- click Create Selected

Expected:
- only checked people are created
- no extra per-person template choice is required

## Gate F — Change Template
Before creation, click Change Template for one person.

Expected:
- Quick NPC Library opens in selection-only mode
- choosing a template updates the suggestion
- no NPC is created by the picker itself

Then Create All or Create Selected.

Expected:
- the overridden template is used for that person

## Gate G — persistence
Reload Foundry after creating relationship NPCs.

Expected:
- NPCs remain in NPC - PC Relations
- links persist
- Open / Unlink continue to work
- Ranger Recruitment data remains intact

## PASS
qa.31 passes when the GM only decides WHO should become an NPC while Realm Guard normally decides WHICH template fits, with Change Template available only as an optional override.
