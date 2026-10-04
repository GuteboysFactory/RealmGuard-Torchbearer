# TEST PROTOCOL — v1.13.0-qa.3

## M10D.3 Foundry VTT 13.351 gate — TB2E Help / Teamwork read-only shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.3; no boot errors.
- m10d status: phase M10D.3, shadowReadyDomains=["wises","help"], helpShadowReady=true, liveReady=false, activationAvailable=false, all writes=0.
- help.getStatus(): PARTIAL, TB2E_HELP_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.

### Gate B — Normal Help boundaries
- same Skill => +1D / SAME_SKILL.
- explicitly supplied suggested Help Skill => +1D / SUGGESTED_HELP_SKILL.
- Will/Health/Resources/Circles ordinary support => +1D where not Town-restricted.
- Nature requires relevant descriptor.
- Wise source rejects with USE_WISE_AID_ROUTE.
- Town Recovery and Town Resources reject with TOWN_HELP_FORBIDDEN.
- No full suggested-help catalogue is inferred.

### Gate C — Beginner's Luck / Instinct
- Beginner's Luck Help accepts Will or Health only, +1D, poolStage=PRE_HALVING.
- Other sources reject.
- On Instinct, helper must also be acting on Instinct or use relevant Nature descriptor; Wise remains separate.

### Gate D — Conflict Help
- Requires 4+ party and helper with no action that round.
- Required Skill, relevant Nature descriptor or GM-approved Skill are accepted as source-bounded shadow choices.
- Invalid party/action/source combinations reject safely.
- No action assignment or dice-pool mutation occurs.

### Gate E — Helper consequence guidance / zero writes
- Failed test + Condition => LESSER_CONDITION guidance, with everyone-Hungry alternative.
- Already having the Condition => NO_ADDITIONAL_CONDITION.
- No failed/Condition result => no consequence.
- Snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.

### Gate F — Existing profiles / release
- Representative existing profile roll/creation behavior remains unchanged.
- qa.3 release package green; QA=1.13.0-qa.3; Stable=1.12.0 unchanged.

Passing A-F verifies the bounded Help shadow contract only. It does not authorize TB2E activation or live Teamwork automation.
