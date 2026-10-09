# TEST PROTOCOL — v1.13.0-qa.18

## M11.1 Foundry VTT 13.351 gate — TB2E Live Authority Framework

### Gate A — Boot / framework status
- qa.18 loads without boot errors.
- game.realmGuard.core.m11.getStatus(): phase M11.1, frameworkReady=true, foundationAuditComplete=true.
- registryCount=19.
- modeCounts OFF=5 / SHADOW=14 / DUAL_RUN=0 / LIVE=0.
- globalKillSwitchEngaged=true.
- killSwitchReleaseAuthorized=false.
- liveActivationAuthorized=false, profileSwitchAuthorized=false.
- domainLiveWritesAuthorized=0; all writes=0.

### Gate B — Registry / waves / blocked domains
- Wises: VERIFIED, SHADOW, ceiling DUAL_RUN, plannedWave=1, 0 authorized writes.
- Tests: BOUNDED_PARTIAL, SHADOW, plannedWave=2.
- Creation: BOUNDED_PARTIAL, SHADOW, plannedWave=8.
- Traits: SOURCE_BLOCKED, OFF, ceiling OFF.
- Narrative: MANUAL, OFF, ceiling OFF.
- all writePermissions false.

### Gate C — Transition and write refusal
- Wises -> DUAL_RUN transitionPlan is previewAllowed=true but commitAuthorized=false.
- Wises -> LIVE is blocked EXPLICIT_LIVE_DOMAIN_GATE_REQUIRED, nextRequiredMilestone=M11.2.
- Traits -> SHADOW is blocked SOURCE_BLOCKED_DOMAIN_MUST_REMAIN_OFF.
- Narrative -> DUAL_RUN is blocked MANUAL_DOMAIN_MUST_REMAIN_OFF.
- Wises ACTOR_UPDATE writePermissionPlan allowed=false because GLOBAL_KILL_SWITCH_ENGAGED.
- releaseKillSwitch() is blocked KILL_SWITCH_RELEASE_NOT_AUTHORIZED_M11_1.

### Gate D — Memory-only dual-run instrumentation
- Record equal Wises objects with different key order => MATCH.
- Record differing Tests result => DIVERGENCE.
- comparisonLog contains both records and persisted=false / zero document & setting writes.
- Conflict comparison is blocked because source-blocked.
- clearComparisonLog clears memory only.

### Gate E — Zero-write / regression / release
- Snapshot Actors/Items/Journals/profile settings around representative M11 calls => unchanged=true.
- MG2E normal Skill roll remains normal.
- Recruitment/Create Ranger remains normal.
- TB2E profile activation and Character Creation commit remain blocked.
- qa.18 workflow/assets green; Stable remains 1.12.0.

Passing A-E verifies only the M11.1 safety framework. It does not authorize DUAL_RUN commits, LIVE authority, kill-switch release or any TB2E World writes.
