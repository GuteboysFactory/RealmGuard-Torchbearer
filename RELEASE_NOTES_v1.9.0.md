# Realm Guard / Torchbearer v1.9.0 — STABLE

**Foundry VTT target:** 13.351  
**Status:** 🟢✅ STABLE / GOLD  
**CORE milestone:** M8 Social Network Migration — VERIFIED / CLOSED

v1.9.0 promotes the fully verified v1.9.0-qa.42 codebase to stable without gameplay-code changes.

## Major stable scope

### M8 Social Network
- normalized PersonRecord / Relationship / RelationshipHistory storage
- legacy Recruitment relationship compatibility preserved
- dynamic Contacts
- living Relationship Status and append-only History
- optional Actor linking
- explicit Relationship NPC creation into `NPC - PC Relations`
- duplicate protection and safe reload persistence
- player/GM multi-client handoff for GM-owned social decisions

### Circles integration
- Standard / Known Person / Find New Person flow
- successful new-person Circles creates/reuses a Neutral CIRCLES Contact
- failed new-person Circles can be resolved by the GM through Normal Failure, Enmity Clause or Decide Later
- Enmity creates/reuses ENEMY / HOSTILE / ENMITY Social Network records
- no automatic NPC Actor creation
- Circles Obstacle is locked to GM authority through Obstacle Control

### Quick NPC Library
- reusable individual and group NPC templates
- generic/reusable naming cleanup
- stable template identity
- Quick NPC Library 2.2.0
- 63 packaged default NPC portraits
- role/culture-aware template art
- template art inherited by created NPCs and prototype tokens
- GM-selected custom portraits are preserved

## Safety / compatibility
- internal system id remains `realm-guard`
- Legacy Mixed remains the current rules authority where CORE migration has not explicitly taken over
- no silent rules-profile conversion
- existing Recruitment fields remain preserved
- no automatic full NPC creation for Contacts/Enemies
- Foundry VTT 13.351 verified

## Deliberately deferred
- Mouse Guard Enemy +3s argument/speech disposition effect remains deferred to explicit Conflict/profile integration
- M9 Creation / Recruitment Migration begins on the next QA development line

## Promotion source
Stable v1.9.0 is promoted directly from **v1.9.0-qa.42**, which passed live QA in Foundry VTT 13.351.
