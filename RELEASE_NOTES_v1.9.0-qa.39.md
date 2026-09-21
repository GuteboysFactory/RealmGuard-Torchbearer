# Realm Guard / Torchbearer v1.9.0-qa.39 — Circles Social Network Integration

qa.39 connects the existing Legacy Mixed Circles Ability roll to the normalized M8 Social Network without changing Circles dice rules.

## Before a Circles roll
The user chooses:
- **Standard Test** — existing Circles behavior only
- **Known Person / Contact** — select an existing Social Network person
- **Find New Person** — describe a person being sought

## Known Person
Known-person mode references an existing PersonRecord/Relationship.
The result does not automatically change Relationship status/history and does not create an NPC.

## New Person
The proposed person is not written before the roll.

On PASS:
- creates/reuses a normalized PersonRecord
- creates a CONTACT Relationship with Origin = CIRCLES
- initial status = Neutral
- exact duplicate protection is reused
- no NPC Actor is created automatically

On FAIL:
- no Contact is created in qa.39
- Enmity is deliberately deferred to the next M8 step

## Authority
A successful Circles Contact may be committed by the Ranger owner or GM. The existing manual New Contact workflow remains GM-only.

## Preserved behavior
- existing Circles dice pool / Obstacle / Fate / Persona / Help / Conditions / Learning remain unchanged
- Legacy Mixed remains gameplay authority
- Recruitment relationships remain untouched
- Relationship status/history remains explicit rather than being silently altered
