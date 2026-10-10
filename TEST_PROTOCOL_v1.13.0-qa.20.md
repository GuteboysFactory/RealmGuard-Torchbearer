# TEST PROTOCOL — v1.13.0-qa.20

## M10D.18 Core Reconciliation — Package 1 — Foundry VTT 13.351

### Gate A — Reconciliation package status
- version = 1.13.0-qa.20
- m10d phase = M10D.18
- reconciliationStatus().package = P1_CONFIRMED_MISMATCH_REPAIRS
- packageReady = true
- resolvedFindingCount = 6
- pendingFindingCount = 4
- fullDomainReauditStillRequired = true
- existingShadowReauditDomainCount = 14
- newShadowAdapterDomainCount = 4
- liveIntegrationPaused = true
- all writes = 0

### Gate B — Character Creation numeric repairs
- Human Upbringing absent skill: 0 -> 3 (unchanged and correct).
- Home absent skill: 0 -> 2; existing 2 -> 3; max 4.
- Social Grace absent skill: 0 -> 2; existing 2 -> 3; max 4.
- Specialty absent skill: 0 -> 2; existing 2 -> 3; max 4.
- No Actor/Item mutation.

### Gate C — Conditions + Help
- Hungry & Thirsty + Exhausted disposition plan: successPenalty = -2 total when both are present, each applied once per team.
- Injured + Sick disposition plan: dicePenalty = -2 total for an affected character with both.
- resolution = CORE_RESOLVED; automation remains false.
- Generic Town Resources Help is allowed when normal eligibility exists.
- Resources PAY_BILLS / payingTownBills is blocked TOWN_BILLS_HELP_FORBIDDEN.
- Will/Health recovery Help is blocked RECOVERY_HELP_FORBIDDEN.

### Gate D — Nature + safety pause
- Nature 0/0 retirementTiming = END_OF_ADVENTURE.
- M11 remains paused; kill switch engaged.
- Wises cannot advance to DUAL_RUN/LIVE.
- Traits/Armor/Conflict/Magic remain OFF pending adapters.

### Gate E — zero-write / regression / release
- snapshot Actors/Items/Journals/profile settings around representative P1 calls => unchanged=true.
- MG2E Skill roll remains normal.
- Recruitment/Create Ranger remains normal.
- TB2E Character Creation commit remains blocked.
- qa.20 workflow/assets green; Stable remains 1.12.0.

Passing A-E closes M10D.18 P1 only. It does not complete the 14-domain full-core re-audit and does not resume M11.
