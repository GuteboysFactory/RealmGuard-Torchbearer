# TEST PROTOCOL — v1.13.0-qa.19

## M10D.17 Full-Core Source Expansion Audit — Foundry VTT 13.351

### Gate A — Core source audit status
- version = 1.13.0-qa.19
- m10d phase = M10D.17
- sourceComplete/coreSourceComplete = true
- finalAudit().phase = M10D.17
- finalAudit().sourceCounts = VERIFIED 18 / MANUAL 1 / SOURCE_BLOCKED 0
- sourceBlockedDomains = []
- existingShadowReauditDomains length = 14
- newShadowAdapterDomains = traits, armor, conflict, magic
- liveIntegrationPauseRequired = true
- nextMilestone = M10D.18_CORE_RECONCILIATION
- all writes = 0

### Gate B — Core vs optional source separation
- Core source set contains Dungeoneer's Handbook + Scholar's Guide.
- Optional source set contains Lore Master's Manual + Scavenger's Supplement.
- Optional material is not marked essential and is not auto-enabled in the core profile.
- Narrative remains MANUAL.

### Gate C — M11 safety pause
- m11 mode counts remain OFF 5 / SHADOW 14 / DUAL_RUN 0 / LIVE 0.
- liveIntegrationPaused = true; pauseReason = FULL_CORE_SOURCE_REAUDIT_REQUIRED.
- sourceBlockedDomains = [].
- sourceVerifiedPendingAdapterDomains = traits, armor, conflict, magic.
- Wises remains SHADOW but modeCeiling = SHADOW and DUAL_RUN/LIVE returns FULL_CORE_REAUDIT_REQUIRED.
- Traits is VERIFIED source, OFF, adapterReady=false; SHADOW transition returns SHADOW_ADAPTER_REQUIRED.
- Narrative remains OFF and manual.

### Gate D — Confirmed reconciliation findings
- finalAudit().confirmedReconciliationFindings contains:
  - Home absent skill -> 2
  - Social Grace absent skill -> 2
  - Specialty absent skill -> 2
  - Hungry/Thirsty + Exhausted disposition -> -1s
  - Help restriction scoped to recovery + leaving-town bills
  - Nature max 0 retirement -> end of adventure
- This gate inspects audit data only; qa.19 deliberately does not yet mutate the existing adapters.

### Gate E — Zero-write / regression / release
- Snapshot Actors/Items/Journals/profile settings around finalAudit(), domain audits and representative M11 calls => unchanged=true.
- MG2E normal Skill roll remains normal.
- Recruitment/Create Ranger remains normal.
- TB2E profile activation and Character Creation commit remain blocked.
- qa.19 workflow/assets green; Stable remains 1.12.0.

Passing A-E closes the source expansion audit and opens M10D.18 Core Reconciliation. It does not authorize any TB2E live rules.
