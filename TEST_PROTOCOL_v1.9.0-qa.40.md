# v1.9.0-qa.40 — Circles GM Obstacle Authority QA

## Gate A — Automatic / Baseline
In Obstacle Control:
1. set workflow to **Automatic - use Baseline**
2. set Baseline Obstacle to 2
3. open a Circles roll

Expected:
- Circles shows **Ob 2**
- Obstacle input is read-only
- status says GM controlled
- player cannot type a different Ob

## Gate B — Change Open Rolls Live
Keep the Circles dialog open.

In Obstacle Control change **Open Rolls Live** from 2 to 3.

Expected:
- open Circles dialog changes to **Ob 3**
- input remains read-only
- roll resolves against Ob 3

## Gate C — GM Approval
Set workflow to **GM approval** and open Circles from a non-GM Ranger owner.

Expected:
- Circles starts from current Baseline
- player Obstacle is read-only
- GM receives the normal Obstacle Request
- GM can change and approve the Ob
- approved value reaches the player's Circles dialog
- roll waits for approval as normal

## Gate D — Manual mode
Set workflow to **Manual - set Obstacle in each roll**.

Open Circles.

Expected:
- unlike ordinary manual rolls, Circles Obstacle remains read-only
- it starts from the GM Baseline
- GM can change the open Circles Ob through Obstacle Control
- player cannot override it

## Gate E — ordinary-roll regression
Open an ordinary Skill/Ability roll in each workflow mode.

Expected:
- ordinary roll behavior is unchanged
- Manual mode remains directly editable for ordinary rolls
- Automatic/Approval behavior remains unchanged

## Gate F — qa.39 Circles regression
Test:
- Standard Test
- Known Person
- Find New Person PASS

Expected:
- all three modes still open and roll normally
- successful new person still creates/reuses the CIRCLES Contact
- no NPC is created automatically

## PASS
qa.40 passes when Circles is GM-controlled in all Obstacle modes, remains live-adjustable/approvable by the GM, and ordinary roll Obstacle behavior remains unchanged.
