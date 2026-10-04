# TEST PROTOCOL — v1.13.0-qa.8

## M10D.7 Foundry VTT 13.351 gate — TB2E Fate / Persona / Resources bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Resources coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.8; no boot errors.
- m10d status: phase M10D.7, shadowReadyDomains=["wises","help","tests","nature","abilities","resources"], resourcesShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- resources.getStatus(): PARTIAL, TB2E_FATE_PERSONA_RESOURCES_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.

### Gate B — End-session awards / exclusivity
- Acting Belief + Working Goal + Benefiting Instinct + approved Gallows Humor => Fate total 4.
- Crisis + MVP => Persona total 2.
- Acting + Playing Against Belief rejects as non-stacking.
- Working Toward + Accomplishing Goal rejects as non-stacking.
- MVP + Teamworker on the same plan rejects.
- awardMutationCommitted=false.

### Gate C — Fate spend plans
- Luck with [2,6,6] and 1 Fate => 2 initial extra dice, recursive open sixes, no spend/roll committed.
- Deeper Understanding requires Wise relation and plans one failed-die reroll.
- Synergy requires helping another player; PASS/FAIL map to helper advancement guidance; TIE => retract Fate or use tiebreaker.
- no resource or advancement write.

### Gate D — Persona spend plans
- Advantage 3 with 3 Persona => +3D before roll; 4 Persona amount rejects.
- Channel Nature with Current Nature 4 => +4D; Resources/Circles reject.
- Ah, Of Course! with 3 failed dice and related Wise => 3 extra dice after roll.
- no Persona spend, reroll or Nature tax committed.

### Gate E — Resources / Lifestyle / zero writes
- Resources 2, hometown, treasure 3 => finalDice 6 and tax insulation 3.
- Resources 3, fail by 4, treasure 2 => finalTax 2, preview ratingAfter 1.
- Resources 1, fail by 2, treasure 3 => finalTax 0, ratingAfter 1.
- Lifestyle cost 0 => minimum Ob 1.
- PASS + no Conditions + untaxed Nature => BECOME_FRESH.
- PASS + no Conditions + taxed Nature => RECOVER_ONE_TAXED_NATURE.
- FAIL => TWIST / CONDITION / TAX with GM_CHOICE_SOURCE_BOUNDARY.
- snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.

### Gate F — Existing profiles / release
- representative MG2E Fate/Open-6 or normal Skill roll and Recruitment/Create Ranger remain normal.
- qa.8 release assets/workflow green.
- QA=1.13.0-qa.8; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Fate / Persona / Resources shadow contract. It does not authorize TB2E activation or any resource/tax mutation.
