# TEST PROTOCOL — Realm Guard / Torchbearer v1.3.0-qa.2

**Build:** v1.3.0-qa.2 — CORE M1 Active Rules Registry scroll hotfix  
**Foundry target:** 13.351  
**GOLD baseline:** v1.2.0  
**Previous QA:** v1.3.0-qa.1 — all reported checks PASS except the Active Rules Registry content could not be scrolled  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED

This protocol is a focused hotfix verification. The full v1.3.0 M1 protocol remains the parent QA protocol.

## A. Install / version

- [ ] A1. Install/update to `1.3.0-qa.2` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.

## B. Active Rules Registry scroll fix

Open **Active Rules Registry** from the GM dock.

- [ ] B1. Registry opens successfully.
- [ ] B2. Mouse wheel / trackpad scrolling moves the Registry content vertically.
- [ ] B3. The top of the Registry is reachable and shows the M1 heading/profile summary.
- [ ] B4. Profile shows `Realm Guard — Legacy Mixed`.
- [ ] B5. Profile id text shows `realm-guard-legacy-mixed`.
- [ ] B6. Profile version shows `1`.
- [ ] B7. Rules Snapshot hash is visible.
- [ ] B8. The text stating that M1 does not replace live gameplay engines yet is visible.
- [ ] B9. `WISE.MODE = UNRATED` is reachable/readable.
- [ ] B10. `INVENTORY.POLICY = STRUCTURED` is reachable/readable.
- [ ] B11. `PROGRESSION.LEVELS_TALENTS = ENABLED` is reachable/readable.
- [ ] B12. The bottom of the Registry is reachable by scrolling.
- [ ] B13. Provider / Source / Classification / Automation information remains readable.
- [ ] B14. Resize the Registry smaller and larger; scrolling remains available when content exceeds the window.
- [ ] B15. Close button remains usable after scrolling to the top and bottom.

## C. M1 integrity smoke

- [ ] C1. `game.realmGuard.core.phase` still returns `M1`.
- [ ] C2. `game.realmGuard.core.getActiveRulesProfile().id` still returns `realm-guard-legacy-mixed`.
- [ ] C3. Rules Snapshot hash is unchanged from qa.1.
- [ ] C4. World Health Audit still opens normally.
- [ ] C5. One normal trained Skill roll works as before.
- [ ] C6. No new migration entry is added.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Promote M1 when the Registry can be scrolled from top to bottom at normal and reduced window sizes, the existing M1 profile/snapshot remains unchanged, and the small integrity smoke shows no regression.
