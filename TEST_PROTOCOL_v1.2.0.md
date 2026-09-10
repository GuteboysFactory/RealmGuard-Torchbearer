# TEST PROTOCOL — Realm Guard / Torchbearer v1.2.0

**Build:** v1.2.0 QA — CORE M0 Safety, Schema & Migration Baseline  
**Foundry target:** 13.351  
**GOLD/public baseline:** v1.0.8.44  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED

Mark each item PASS / FAIL. Add a note for every FAIL.

## A. Backup / install

- [ ] A1. Create/verify a backup or copied test World before installing M0.
- [ ] A2. Install v1.2.0 over a v1.0.8.44 test/campaign copy and launch without console-breaking errors.
- [ ] A3. Foundry reports system version 1.2.0 and internal id remains exactly `realm-guard`.
- [ ] A4. Existing Rangers, NPCs, Items, Scenes, Journals, Playlists, folders and Compendiums remain present.

## B. M0 metadata migration

Open **World Health Audit** after the world is ready.

- [ ] B1. Schema shows `1`.
- [ ] B2. Architecture shows `0.1`.
- [ ] B3. Active profile metadata shows `realm-guard-legacy-mixed`.
- [ ] B4. Profile version shows `1`.
- [ ] B5. Migration history contains `m0-core-baseline-v1` exactly once.
- [ ] B6. World Health Audit reports no M0 migration error.
- [ ] B7. M0 text explicitly makes clear that the profile tag is compatibility metadata and has not converted the world to Strict Realm Guard.

## C. Idempotency / reload

- [ ] C1. Close/reopen the World; migration history still contains one M0 entry.
- [ ] C2. F5/reload does not add another M0 history entry.
- [ ] C3. Restart Foundry/server if practical; metadata remains unchanged.
- [ ] C4. No repeated M0 migration notification/error appears.

## D. Multi-client safety

Use GM + at least one player client; a second GM client is recommended if available.

- [ ] D1. GM and player load the same World successfully.
- [ ] D2. Player receives no permission error from M0 settings.
- [ ] D3. With two active GMs, migration history remains single-entry and no write race is visible.
- [ ] D4. Both clients continue to see ordinary Actor/Item updates normally.

## E. Data preservation

Compare representative documents with the pre-M0 backup/copy.

- [ ] E1. Character system fields are unchanged.
- [ ] E2. NPC system fields are unchanged.
- [ ] E3. Embedded Skill/Wise/Trait/Gear/Condition/Token/Talent Items are unchanged.
- [ ] E4. Portrait/token framing and image paths are unchanged.
- [ ] E5. Recruitment metadata flags remain unchanged.
- [ ] E6. Inventory placement/container ids remain unchanged.
- [ ] E7. Progression Level / spent Fate / spent Persona remain unchanged.
- [ ] E8. Starter Compendiums are not rewritten by M0.

## F. World Health Audit regression

- [ ] F1. World Health Audit opens from GM tools.
- [ ] F2. Audit no longer shows the stale old `built for 1.0.4` warning.
- [ ] F3. Audit shows current v1.2.0 system version dynamically.
- [ ] F4. Existing Skills/Conditions/Resources/Inventory/Starter Library checks still run.
- [ ] F5. Post Summary to Chat still works and includes Schema/Profile metadata.

## G. Representative v1.0.8.44 gameplay regression

- [ ] G1. Normal trained Skill roll produces the approved PASS/FAIL result layout.
- [ ] G2. Ability/Nature roll works.
- [ ] G3. Beginner's Luck works and retains current pre/post-halving behavior.
- [ ] G4. Fate/Open 6s works.
- [ ] G5. Persona 0-3D works where legal.
- [ ] G6. Help/Teamwork still works.
- [ ] G7. Conditions and Recovery still work.
- [ ] G8. Inventory/Gear paper-doll and containers still work.
- [ ] G9. Token Builder / Original Portrait / Token Portrait persistence still works.
- [ ] G10. GM Control / Quick Inspector opens and works.
- [ ] G11. Conflict planning -> Starting Disposition -> action resolution -> completion still works.
- [ ] G12. Turn Manager / Checks still work.
- [ ] G13. End Session still works.
- [ ] G14. Recruitment can create a Ranger as before.
- [ ] G15. Content Studio / Starter Library representative action works.

## H. Runtime recovery smoke

- [ ] H1. If a Conflict is active, F5/reload recovers the same current public Conflict state as v1.0.8.44.
- [ ] H2. Turn phase/cycle survives reload as before.
- [ ] H3. No M0 setting overwrites current Conflict/Turn/End Session state.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Promote M0 only when metadata is idempotent, data is preserved, package id remains `realm-guard`, and representative gameplay matches v1.0.8.44.
