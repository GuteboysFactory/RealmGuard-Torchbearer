# TEST PROTOCOL — v1.13.0-qa.23

## M10D.18 P2.3 — Conflict Shadow Adapter · Foundry 13.351

Source authority: Torchbearer 2E Scholar's Guide pp. 59–81, Dungeoneer's Handbook pp. 156–159. Use disposable QA world and Foundry Console. The new API is read-only, not live Conflict Engine.

### Gate A — Release and security
- QA manifest: 1.13.0-qa.23. Both GitHub Release assets verified by Actions.
- Existing world boots; Ranger/NPC sheets, Roll Dialog and GM Dock open, no new blocking console errors.
- m10d.getStatus().conflictShadowReady=true; implemented: traits, armor, conflict; pending: magic.
- m10d.conflict.getStatus().adapterReady=true; liveEnabled=false; liveApplication=false; activationAllowed=false.
- Legacy Mixed remains live authority. M11 PAUSED, kill switch ENGAGED, liveDomainCount=0. Stable remains v1.12.0.

### Gate B — Disposition, seven conflict types and action interactions
API: const c=game.realmGuard.core.m10d.conflict;
- B1: c.model().types length 7; 3 actions/round. All 16 action matrix combinations follow Scholar's Guide p. 70.
- B2: FEINT versus ATTACK = NO_TEST; DEFEND versus FEINT = NO_TEST; DEFEND versus DEFEND = INDEPENDENT Ob3; ATTACK versus DEFEND = VERSUS.
- B3: Skill/Ability mapping, e.g. Kill Defend=Health, Capture Defend=Hunter, Trick or Riddle Defend=Lore Master.
- B4: c.dispositionPlan({conflictType:"KILL",baseRating:5,rolledSuccesses:4,teamConditions:["Hungry and Thirsty","Exhausted"],captainConditions:["Injured","Sick"],rollIncludesDicePenalty:true,captainHasBackpack:true,captainInDimOrDarkness:true}) gives successPenalty -4, dicePenalty -2 and startingDisposition 5.
- B5: Injured/Sick without rollIncludesDicePenalty keeps startingDisposition pending; minimum disposition 1.

### Gate C — Team HP / Damage / Defend / Maneuver / Compromise
- C1: c.hpAllocationPlan({startingDisposition:9,participantIds:["a","b"],oddPointRecipients:["b"]}) gives a=4, b=5. If odd recipients omitted => blocked. Team size above HP => requires captain selection.
- C2: c.hitPlan({marginOfSuccess:5,absorbed:1,currentHp:2}) reports HP 0 and overflow 2; cannot absorb overflow with armor; no HP write.
- C3: c.regroupPlan({interaction:"VERSUS",marginOfSuccess:2,actingCurrentHp:1,actingStartingHp:4}) restores 2. INDEPENDENT MoS2 restores 3, acting member first, leftovers to others.
- C4: Maneuver purchases: IMPEDE 1, GAIN_POSITION 2, DISARM 3, REARM 4. Repeated option or cost over MoS => blocked.
- C5: c.outcomePlan({teamStart:7,teamRemaining:0,opponentStart:6,opponentRemaining:0}) gives TIE, MAJOR_BOTH_SIDES. Borderline HALF/MAJOR requires GM judgment, not invented thresholds.

### Gate D — Regression and persistence
- D1: Run conflict planner calls: mode READ_ONLY_SHADOW, writesPlanned=0, actorWrite/itemWrite/hpWrite/rollExecuted all false.
- D2: Previous Traits and Armor diagnostic tests still pass; P1 creation, conditions, Help and Nature remain unchanged.
- D3: Open and exercise a normal Legacy Mixed Conflict and ordinary test. No CORE Conflict effects on live result.
- D4: Reload. Actor/Item/HP/gear/Checks, profile settings and current Conflict state preserved.
- D5: M11 kill switch and paused status intact; Stable v1.12.0 intact.

PASS all gates by human tester before closing P2.3. Automated GitHub CI alone is not Foundry verification.
