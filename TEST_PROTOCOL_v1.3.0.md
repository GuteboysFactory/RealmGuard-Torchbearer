# TEST PROTOCOL — Realm Guard / Torchbearer v1.3.0

**Build:** v1.3.0 — CORE M1 Rules Profile Infrastructure & Rules Registry  
**Foundry target:** 13.351  
**Previous GOLD baseline:** v1.2.0  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Live QA status:** PASS — qa.1 full protocol + qa.2 Registry scroll hotfix verification

## A. Install / baseline

- [x] A1. Back up or copy the v1.2.0 GOLD test/campaign World.
- [x] A2. Install v1.3.0 QA over the v1.2.0 copy and launch without console-breaking errors.
- [x] A3. Foundry reports the M1 QA version and internal id remains exactly `realm-guard`.
- [x] A4. Existing Rangers, NPCs, Items, Scenes, Journals, Playlists, folders and Compendiums remain present.

## B. M0 preservation

Open **World Health Audit**.

- [x] B1. Schema remains `1`.
- [x] B2. Architecture remains `0.1`.
- [x] B3. Active profile metadata remains `realm-guard-legacy-mixed`.
- [x] B4. Profile metadata version remains `1`.
- [x] B5. `m0-core-baseline-v1` still appears exactly once in migration history.
- [x] B6. M1 does not add an Actor/Item/world-data migration entry.
- [x] B7. No M0 migration error is reported.

## C. Active Rules Registry

Open the new **Active Rules Registry** from the GM dock.

- [x] C1. The Rules Registry tool appears for the GM and opens successfully.
- [x] C2. Profile shows `Realm Guard — Legacy Mixed`.
- [x] C3. Profile id is `realm-guard-legacy-mixed`.
- [x] C4. Profile version is `1`.
- [x] C5. A deterministic `fnv1a-........` Rules Snapshot hash is displayed.
- [x] C6. The window explicitly states that M1 does not replace live gameplay engines yet.
- [x] C7. Registry includes `WISE.MODE = UNRATED`.
- [x] C8. Registry includes `INVENTORY.POLICY = STRUCTURED`.
- [x] C9. Registry includes `PROGRESSION.LEVELS_TALENTS = ENABLED`.
- [x] C10. Registry includes representative Tests, Nature, Traits, Help, Fate/Persona, Conditions, Conflict, Session, Circles, Creation and Tokens of Power entries.
- [x] C11. Provider/source/classification/automation information is readable for registry entries.

**QA note:** qa.1 exposed a UI-only issue: the Registry contained the required data but its content could not be scrolled. v1.3.0-qa.2 added a bounded vertical scroll area. Live retest confirmed scrolling works.

## D. Runtime CORE API

Use the browser console as GM.

- [x] D1. `game.realmGuard.core.phase` returns `M1`.
- [x] D2. `game.realmGuard.core.getActiveRulesProfile().id` returns `realm-guard-legacy-mixed`.
- [x] D3. `game.realmGuard.core.getActiveRulesRegistry().get("WISE.MODE").activeValue` returns `UNRATED`.
- [x] D4. `game.realmGuard.core.getActiveRulesSnapshot()` returns profile id, profile version and snapshot hash.
- [x] D5. `game.realmGuard.core.registeredProfiles()` lists only the currently implemented Legacy Mixed profile in M1.

## E. Determinism / reload

- [x] E1. Record the Rules Snapshot hash.
- [x] E2. F5/reload the World; the same profile and hash return.
- [x] E3. Close/reopen the World; the same profile and hash return.
- [x] E4. Restart Foundry/server if practical; the same profile and hash return.
- [x] E5. Reload does not add M0 migration entries or modify profile metadata.

## F. Multi-client safety

Use GM + at least one player.

- [x] F1. Both clients load successfully.
- [x] F2. Ordinary Actor/Item updates still synchronize.
- [x] F3. Player receives no Rules Profile initialization permission errors.
- [x] F4. GM Rules Registry opens without causing errors on player clients.
- [x] F5. Active profile resolution is the same on both clients if inspected.

## G. Representative gameplay regression

The purpose of M1 is infrastructure only. Compare against v1.2.0 GOLD.

- [x] G1. Normal trained Skill roll works and result layout is unchanged.
- [x] G2. Ability/Nature roll works.
- [x] G3. Beginner's Luck works.
- [x] G4. Fate/Open 6s works.
- [x] G5. Persona works.
- [x] G6. Help/Teamwork works.
- [x] G7. Conditions and Recovery work.
- [x] G8. Inventory/Gear paper-doll and containers work.
- [x] G9. Token Builder / portrait persistence works.
- [x] G10. GM Control / Quick Inspector works.
- [x] G11. Conflict planning → Starting Disposition → action resolution → completion works.
- [x] G12. Turn Manager / Checks work.
- [x] G13. End Session works.
- [x] G14. Recruitment can create a Ranger as before.
- [x] G15. Content Studio / Starter Library representative action works.

## H. Data preservation

- [x] H1. Character system fields remain unchanged from the v1.2.0 baseline.
- [x] H2. NPC system fields remain unchanged.
- [x] H3. Embedded Skills/Wises/Traits/Gear/Conditions/Tokens/Talents remain unchanged.
- [x] H4. Inventory placement/container ids remain unchanged.
- [x] H5. Progression Level / spent Fate / spent Persona remain unchanged.
- [x] H6. Recruitment metadata remains unchanged.
- [x] H7. Starter Compendiums are not rewritten by M1.

## QA decision

**Blocking failures:** None.  

**Non-blocking observations:** qa.1 Active Rules Registry scroll usability defect; fixed and verified in qa.2.  

**Final verdict:** PASS

### PASS gate

PASS. Legacy Mixed resolves deterministically, Rules Registry exposes the compatibility contract, M0 metadata remains untouched and representative gameplay matches v1.2.0 GOLD.
