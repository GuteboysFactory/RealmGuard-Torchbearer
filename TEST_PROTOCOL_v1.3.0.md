# TEST PROTOCOL — Realm Guard / Torchbearer v1.3.0

**Build:** v1.3.0 QA — CORE M1 Rules Profile Infrastructure & Rules Registry  
**Foundry target:** 13.351  
**GOLD baseline:** v1.2.0  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED

Mark each item PASS / FAIL. Add a note for every FAIL.

## A. Install / baseline

- [ ] A1. Back up or copy the v1.2.0 GOLD test/campaign World.
- [ ] A2. Install v1.3.0 QA over the v1.2.0 copy and launch without console-breaking errors.
- [ ] A3. Foundry reports the M1 QA version and internal id remains exactly `realm-guard`.
- [ ] A4. Existing Rangers, NPCs, Items, Scenes, Journals, Playlists, folders and Compendiums remain present.

## B. M0 preservation

Open **World Health Audit**.

- [ ] B1. Schema remains `1`.
- [ ] B2. Architecture remains `0.1`.
- [ ] B3. Active profile metadata remains `realm-guard-legacy-mixed`.
- [ ] B4. Profile metadata version remains `1`.
- [ ] B5. `m0-core-baseline-v1` still appears exactly once in migration history.
- [ ] B6. M1 does not add an Actor/Item/world-data migration entry.
- [ ] B7. No M0 migration error is reported.

## C. Active Rules Registry

Open the new **Active Rules Registry** from the GM dock.

- [ ] C1. The Rules Registry tool appears for the GM and opens successfully.
- [ ] C2. Profile shows `Realm Guard — Legacy Mixed`.
- [ ] C3. Profile id is `realm-guard-legacy-mixed`.
- [ ] C4. Profile version is `1`.
- [ ] C5. A deterministic `fnv1a-........` Rules Snapshot hash is displayed.
- [ ] C6. The window explicitly states that M1 does not replace live gameplay engines yet.
- [ ] C7. Registry includes `WISE.MODE = UNRATED`.
- [ ] C8. Registry includes `INVENTORY.POLICY = STRUCTURED`.
- [ ] C9. Registry includes `PROGRESSION.LEVELS_TALENTS = ENABLED`.
- [ ] C10. Registry includes representative Tests, Nature, Traits, Help, Fate/Persona, Conditions, Conflict, Session, Circles, Creation and Tokens of Power entries.
- [ ] C11. Provider/source/classification/automation information is readable for registry entries.

## D. Runtime CORE API

Use the browser console as GM.

- [ ] D1. `game.realmGuard.core.phase` returns `M1`.
- [ ] D2. `game.realmGuard.core.getActiveRulesProfile().id` returns `realm-guard-legacy-mixed`.
- [ ] D3. `game.realmGuard.core.getActiveRulesRegistry().get("WISE.MODE").activeValue` returns `UNRATED`.
- [ ] D4. `game.realmGuard.core.getActiveRulesSnapshot()` returns profile id, profile version and snapshot hash.
- [ ] D5. `game.realmGuard.core.registeredProfiles()` lists only the currently implemented Legacy Mixed profile in M1.

## E. Determinism / reload

- [ ] E1. Record the Rules Snapshot hash.
- [ ] E2. F5/reload the World; the same profile and hash return.
- [ ] E3. Close/reopen the World; the same profile and hash return.
- [ ] E4. Restart Foundry/server if practical; the same profile and hash return.
- [ ] E5. Reload does not add M0 migration entries or modify profile metadata.

## F. Multi-client safety

Use GM + at least one player.

- [ ] F1. Both clients load successfully.
- [ ] F2. Ordinary Actor/Item updates still synchronize.
- [ ] F3. Player receives no Rules Profile initialization permission errors.
- [ ] F4. GM Rules Registry opens without causing errors on player clients.
- [ ] F5. Active profile resolution is the same on both clients if inspected.

## G. Representative gameplay regression

The purpose of M1 is infrastructure only. Compare against v1.2.0 GOLD.

- [ ] G1. Normal trained Skill roll works and result layout is unchanged.
- [ ] G2. Ability/Nature roll works.
- [ ] G3. Beginner's Luck works.
- [ ] G4. Fate/Open 6s works.
- [ ] G5. Persona works.
- [ ] G6. Help/Teamwork works.
- [ ] G7. Conditions and Recovery work.
- [ ] G8. Inventory/Gear paper-doll and containers work.
- [ ] G9. Token Builder / portrait persistence works.
- [ ] G10. GM Control / Quick Inspector works.
- [ ] G11. Conflict planning → Starting Disposition → action resolution → completion works.
- [ ] G12. Turn Manager / Checks work.
- [ ] G13. End Session works.
- [ ] G14. Recruitment can create a Ranger as before.
- [ ] G15. Content Studio / Starter Library representative action works.

## H. Data preservation

- [ ] H1. Character system fields remain unchanged from the v1.2.0 baseline.
- [ ] H2. NPC system fields remain unchanged.
- [ ] H3. Embedded Skills/Wises/Traits/Gear/Conditions/Tokens/Talents remain unchanged.
- [ ] H4. Inventory placement/container ids remain unchanged.
- [ ] H5. Progression Level / spent Fate / spent Persona remain unchanged.
- [ ] H6. Recruitment metadata remains unchanged.
- [ ] H7. Starter Compendiums are not rewritten by M1.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Promote M1 only when the Legacy Mixed profile resolves deterministically, the Rules Registry accurately exposes the compatibility contract, M0 metadata remains untouched and representative gameplay still matches v1.2.0 GOLD.
