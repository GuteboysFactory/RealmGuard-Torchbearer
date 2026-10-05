# TEST PROTOCOL — v1.13.0-qa.10

## M10D.9 Foundry VTT 13.351 gate — TB2E Recovery bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Recovery coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.10; no boot errors.
- m10d status: phase M10D.9, shadowReadyDomains=["wises","help","tests","nature","abilities","resources","conditions","recovery"], recoveryShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- recovery.getStatus(): PARTIAL, TB2E_RECOVERY_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.
- source boundaries include Exhausted CAMP_TEST wording, Town-entry/accommodation sequencing and unspecified Exhausted bonus stacking.

### Gate B — Standard recovery / costs / attempt boundary
- Angry Camp => Will Ob2, Camp Check preview 1, no Lifestyle cost.
- Afraid Town + no accommodation => Will Ob3, Lifestyle preview +1.
- Exhausted Town + Inn => Health Ob3 plus explicit QR44 CAMP_TEST source boundary.
- duplicate same-Condition same-phase attempt => CONDITION_RECOVERY_ALREADY_ATTEMPTED_THIS_PHASE.
- no condition clear/check spend/lifestyle write.

### Gate C — Hungry/Thirsty / accommodations
- Adventure + rations + wine => satisfied true.
- Camp + Hunter + Cook preparation => satisfied true; obstacle null / UNAVAILABLE_NOT_IN_GUIDE.
- Town + Inn/Hotel => accommodation automatic preview.
- Flophouse => 1 free + 1 additional recovery test.
- Hotel => 2 free + 2 additional; +1D Sick/Injured; auto Hungry/Thirsty + Exhausted.
- Inn => 2 free + 1 additional; +1D Angry/Afraid/Exhausted; auto Hungry/Thirsty.
- Home => lodgingCost 0; recovery quota unspecified.

### Gate D — Exhausted modifiers / Healer
- Inn+Cloak are exposed as bonus sources but automaticDiceBonus=null and stacking UNSPECIFIED_DO_NOT_SUM_AUTOMATICALLY.
- shield/heavy armor etc => GM-discretion +1 Ob guidance only; obstacleAutomation=false.
- Healer Injured Burns => Ob4, out-of-order allowed, failure GRIT_YOUR_TEETH.
- Healer Sick Poison => Ob6, failure SWEAT_OUT_THE_FEVER.
- no roll or condition mutation.

### Gate E — Healer failure / Fresh / zero writes
- Grit Your Teeth allowed loss targets Health/Nature/Health-based Skill, ratingLoss 1, condition-removal + advancement-reset previews only.
- Sweat Out The Fever allowed loss targets Will/Nature/Will-based Skill with same zero-write behavior.
- Fresh eligible only when in Town + zero active Conditions + current Nature=max Nature + Lifestyle passed.
- snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.

### Gate F — Existing profiles / release
- representative MG2E Recovery or normal Skill roll and Recruitment/Create Ranger remain normal.
- qa.10 release assets/workflow green.
- QA=1.13.0-qa.10; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Recovery shadow contract. It does not authorize TB2E activation, recovery execution, condition clearing, Check/Lifestyle spending or Healer-failure mutations.
