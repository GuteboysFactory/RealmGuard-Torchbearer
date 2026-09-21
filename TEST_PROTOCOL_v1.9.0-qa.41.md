# v1.9.0-qa.41 — Circles Enmity Clause QA

## Gate A — Find New Person PASS regression
Run Find New Person and PASS.

Expected:
- creates/reuses Neutral CONTACT with Origin CIRCLES
- no Enmity prompt
- no NPC Actor is created automatically

## Gate B — Find New Person FAIL as GM
As GM, run Find New Person and FAIL.

Expected:
- Circles result resolves normally
- GM receives **Circles failed** decision
- choices include Normal Failure, Invoke Enmity Clause, Decide Later

Choose **Normal Failure**.

Expected:
- no PersonRecord / Relationship is created
- normal table failure handling remains available

## Gate C — invoke Enmity
Repeat with a unique new person and FAIL.
Choose **Invoke Enmity Clause**.

Expected:
- Enmity form is prefilled from the failed search
- GM can edit Name, Profession, People, Location, Notes
- optional reason and session/reference can be entered
- nothing is committed until **Create Enemy**

Confirm.

Expected:
- relationship appears on Relationships
- Role = Enemy
- Status = Hostile
- Origin = ENMITY
- no NPC Actor is created automatically

## Gate D — player-owned Ranger / multi-client
As a non-GM owner, run Find New Person and FAIL while a GM is online.

Expected:
- player receives notification that GM has been asked to resolve the failure
- active GM receives the Enmity decision dialog
- player cannot invoke Enmity directly
- GM can choose Normal Failure / Enmity / Later

## Gate E — duplicate Enemy
Fail again and invoke Enmity using the exact same:
Name + Profession + People + Location.

Expected:
- existing PersonRecord is reused
- existing Enemy Relationship is reused
- no duplicate person or relationship appears

## Gate F — existing Contact becomes Enemy
Create/use an existing Neutral Contact.
Invoke Enmity with exact matching identity.

Expected:
- same PersonRecord is reused
- same Relationship id is preserved
- Role changes to Enemy
- Status becomes Hostile
- Origin becomes ENMITY
- RelationshipHistory records Neutral -> Hostile
- no duplicate relationship is created

## Gate G — Living Relationship tools
On the new Enemy:
- change status
- inspect history
- optionally Create NPC / Link Existing Actor

Expected:
- qa.37/qa.38 tools still work
- explicit NPC creation goes to `NPC - PC Relations`

## Gate H — qa.40 Obstacle regression
Open Circles with GM Baseline / live Obstacle control.

Expected:
- Obstacle remains locked and GM-controlled
- Enmity additions do not change qa.40 behavior

## Gate I — reload
Reload after creating an Enemy.

Expected:
- PersonRecord persists
- Enemy / Hostile / ENMITY persists
- history persists
- actor link persists if present

## Gate J — conflict safety
Inspect normal conflict behavior after creating an Enemy.

Expected:
- no automatic +3s argument/speech disposition effect is applied in qa.41
- M6 / Legacy Mixed conflict behavior is unchanged

## PASS
qa.41 passes when failed new-person Circles offers a GM-controlled Enmity choice, creates/reuses persistent Enemy relationships safely, works across player/GM clients, preserves duplicate protection and does not alter Conflict mechanics.


## VERIFIED RESULT

**🟢✅ PASS — 2026-09-21 / Foundry VTT 13.351**

Live QA confirmed:
- failed Find New Person Circles opens the GM failure decision
- **Normal Failure / Invoke Enmity Clause / Decide Later** are available
- confirmed Enmity creates/reuses **ENEMY / HOSTILE / ENMITY**
- duplicate protection works
- an existing Contact is reused rather than duplicated and becomes Enemy/Hostile with history preserved
- reload persistence works
- no NPC Actor is created automatically
- qa.40 GM Obstacle authority remains intact
- release pipeline completed successfully

No blocking issues were reported in the qa.41 Enmity validation.
