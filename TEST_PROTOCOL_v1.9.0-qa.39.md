# v1.9.0-qa.39 — Circles Social Network Integration QA

## Gate A — Standard Circles regression
Roll Circles and choose **Standard Test**.

Expected:
- normal Circles roll dialog appears
- dice/Obstacle/resources/Learning work as before
- no Social Network data is added

## Gate B — Known Person
Roll Circles and choose **Known Person**.

Expected:
- existing Recruitment relationships and Dynamic Contacts are selectable
- selected person is shown in the Circles roll dialog
- PASS/FAIL does not automatically change status/history
- no NPC is created

## Gate C — Find New Person PASS
Choose **Find New Person** and enter a unique person.

Resolve the Circles test as PASS.

Expected:
- person appears on Relationships as Contact
- Origin is CIRCLES
- Status is Neutral
- no NPC Actor is created
- existing Circles Learning still records normally

## Gate D — Find New Person FAIL
Choose a different new person and resolve FAIL.

Expected:
- no Contact is created
- existing Circles fail/Learning behavior remains intact
- notification explains Enmity is not automated yet

## Gate E — duplicate protection
Seek a new person with the exact same Name + Profession + People + Location as an existing Contact and PASS.

Expected:
- existing person is reused
- no duplicate PersonRecord/Relationship is created

## Gate F — owner/player
As Ranger owner (non-GM), perform Find New Person and PASS.

Expected:
- successful Contact can be committed to the owned Ranger
- manual **New Contact** button remains unavailable to non-GM

## Gate G — reload
Reload after a successful new-person Circles test.

Expected:
- CIRCLES Contact persists
- status remains Neutral
- no relationship loss

## Gate H — qa.37/qa.38 regression
For the new Circles Contact:
- change status as GM
- edit Contact
- optionally Create NPC / Link Existing Actor

Expected:
- all existing Relationship tools still work
- NPC creation remains explicit and goes to `NPC - PC Relations`

## PASS
qa.39 passes when Standard Circles is unchanged, known-person mode safely references existing records, and successful new-person Circles creates/reuses a persistent Neutral CIRCLES Contact without automatic NPC creation.
