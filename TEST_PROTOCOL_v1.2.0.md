# TEST PROTOCOL — Realm Guard / Torchbearer v1.2.0

**Build:** v1.2.0 — CORE M0 Safety, Schema & Migration Baseline  
**Foundry target:** 13.351  
**Previous GOLD/public baseline:** v1.0.8.44  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Live QA verdict:** **PASS**

## A. Backup / install

- [x] A1. Backup/copied test World verified before M0 testing.
- [x] A2. Install v1.2.0 over a v1.0.8.44 test/campaign copy and launch without console-breaking errors.
- [x] A3. Foundry reports the M0 build and internal id remains exactly `realm-guard`.
- [x] A4. Existing Rangers, NPCs, Items, Scenes, Journals, Playlists, folders and Compendiums remain present.

## B. M0 metadata migration

- [x] B1. Schema shows `1`.
- [x] B2. Architecture shows `0.1`.
- [x] B3. Active profile metadata shows `realm-guard-legacy-mixed`.
- [x] B4. Profile version shows `1`.
- [x] B5. Migration history contains `m0-core-baseline-v1` exactly once.
- [x] B6. World Health Audit reports no M0 migration error.
- [x] B7. M0 text explicitly makes clear that the profile tag is compatibility metadata and has not converted the world to Strict Realm Guard.

**QA note:** World Health Audit reported duplicate canonical Skills on one Actor (Pathfinder, Animal Handler, Baker, Deceiver). This is a normal data-audit finding and **not** an M0 migration error, so B6 remains PASS.

## C. Idempotency / reload

- [x] C1. Close/reopen the World; migration history still contains one M0 entry.
- [x] C2. F5/reload does not add another M0 history entry.
- [x] C3. Restart Foundry/server; metadata remains unchanged.
- [x] C4. No repeated M0 migration notification/error appears.

## D. Multi-client safety

- [x] D1. GM and player load the same World successfully.
- [x] D2. Player receives no permission error from M0 settings.
- [x] D3. With two active GMs, migration history remains single-entry and no write race is visible.
- [x] D4. Both clients continue to see ordinary Actor/Item updates normally.

## E. Data preservation

- [x] E1. Character system fields are unchanged.
- [x] E2. NPC system fields are unchanged.
- [x] E3. Embedded Skill/Wise/Trait/Gear/Condition/Token/Talent Items are unchanged.
- [x] E4. Portrait/token framing and image paths are unchanged.
- [x] E5. Recruitment metadata flags remain unchanged.
- [x] E6. Inventory placement/container ids remain unchanged.
- [x] E7. Progression Level / spent Fate / spent Persona remain unchanged.
- [x] E8. Starter Compendiums are not rewritten by M0.

## F. World Health Audit regression

- [x] F1. World Health Audit opens from GM tools.
- [x] F2. Audit no longer shows the stale old `built for 1.0.4` warning.
- [x] F3. Audit shows current system version dynamically.
- [x] F4. Existing Skills/Conditions/Resources/Inventory/Starter Library checks still run.
- [x] F5. Post Summary to Chat still works and includes Schema/Profile metadata.

## G. Representative v1.0.8.44 gameplay regression

- [x] G1. Normal trained Skill roll produces the approved PASS/FAIL result layout.
- [x] G2. Ability/Nature roll works.
- [x] G3. Beginner's Luck works and retains current pre/post-halving behavior.
- [x] G4. Fate/Open 6s works.
- [x] G5. Persona 0-3D works where legal.
- [x] G6. Help/Teamwork still works.
- [x] G7. Conditions and Recovery still work.
- [x] G8. Inventory/Gear paper-doll and containers still work.
- [x] G9. Token Builder / Original Portrait / Token Portrait persistence still works.
- [x] G10. GM Control / Quick Inspector opens and works.
- [x] G11. Conflict planning -> Starting Disposition -> action resolution -> completion still works.
- [x] G12. Turn Manager / Checks still work.
- [x] G13. End Session still works.
- [x] G14. Recruitment can create a Ranger as before.
- [x] G15. Content Studio / Starter Library representative action works.

## H. Runtime recovery smoke

- [x] H1. Active Conflict F5/reload recovery matches the v1.0.8.44 behavior.
- [x] H2. Turn phase/cycle survives reload as before.
- [x] H3. No M0 setting overwrites current Conflict/Turn/End Session state.

## QA decision

**Blocking failures:** None.  

**Non-blocking observations:** One Actor contains duplicate canonical Skills; this is an existing data-audit finding and unrelated to M0 migration.  

**Final verdict:** **PASS**

### PASS gate

**PASS.** Metadata is idempotent, campaign data is preserved, package id remains `realm-guard`, and representative gameplay matches the v1.0.8.44 GOLD baseline.

**Promotion decision:** M0 is approved for **v1.2.0 GOLD**.
