# TEST PROTOCOL — v1.13.0-qa.21

## M10D.18 P2.1 — Traits Shadow Adapter — Foundry VTT 13.351

**Scope:** Torchbearer 2E CORE read-only Diagnostics ONLY. P1 is already user-verified (qa.20); Armor, Conflict and Magic remain pending. Do not toggle M11 or global kill switch. Test only disposable QA data.

### Gate A — Release / Install / Safety
1. QA channel manifest reports `1.13.0-qa.21` and GitHub Release has verified `realm-guard.zip` and `system.json`.
2. Install/Update from the **existing QA** manifest; Foundry 13.351 boots, no new blocking Realm Guard console errors.
3. `game.realmGuard.core.m10d.getStatus().traitsShadowReady === true`.
4. `game.realmGuard.core.m10d.traits.getStatus().adapterReady === true`; `liveApplication === false`.
5. `getStatus().p2PendingShadowAdapterDomains` equals `["armor","conflict","magic"]`.
6. Global kill switch ENGAGED; M11 PAUSED; Legacy Mixed live authority; stable remains `1.12.0`.

### Gate B — Trait benefit calculation (read-only via browser console)
Use `const t = game.realmGuard.core.m10d.traits`; call `t.usePlan({...})` directly. Do NOT mutate an Actor.
- B1: `t.usePlan({level:1,applies:true})` => ok, +1D; `benefitUses:1` => BENEFIT_USES_EXHAUSTED.
- B2: `t.usePlan({level:2,applies:true,benefitUses:1})` => ok +1D; `benefitUses:2` => blocked.
- B3: `t.usePlan({level:3,applies:true,outcome:"PASS"})` => +1s. `TIE` => +1s, `FAIL` => no success bonus.
- B4: `applies:false`, `angry:true`, `traitAlreadyUsedOnTest:true` => blocked; `phase:"UNKNOWN"` => blocked.
- All successful plans: `mode === "READ_ONLY_SHADOW"`, `liveApplication === false`, `writesPlanned === 0`.

### Gate C — Trait Against / Checks (read-only)
- C1: `t.usePlan({mode:"AGAINST",applies:true})` => self -1D and 1 proposed check.
- C2: `t.usePlan({mode:"AGAINST",againstOption:"OPPONENT_PLUS_2D",versus:true,applies:true})` => opponent +2D, 2 proposed checks.
- C3: `t.usePlan({mode:"AGAINST",againstOption:"BREAK_TIE",versus:true,outcome:"TIE",applies:true})` => opponent wins tie; 2 proposed checks.
- C4: AGAINST attempts with `phase:"CAMP"`, `phase:"TOWN"`, `pvp:true`, `againstUses:1` must all be blocked; OPPONENT_PLUS_2D outside Versus blocked.
- Check bonuses and proposed spending are NEVER committed to an Actor.

### Gate D — Refresh / Regression / Release
- D1: `t.refreshPlan({newSessionPrologueDelivered:false}).eligible === false`, true => eligible; neither mutates.
- D2: `t.classTraitBoundaryPlan({traitLostOrUnrecognizable:true})` requires GM review and `retirementCommitted === false`.
- D3: P1 Character Creation/Conditions/Help/Nature regression unchanged; other MG/Realm Guard rolls, equipment, conflict tools boot correctly.
- D4: Snapshot test Actor/Items, settings, and checks before/after shadow API calls and reload; no data change.
- D5: QA `1.13.0-qa.21` asset verification and GitHub Actions release job succeed; `channels/stable/system.json` remains `1.12.0`.

Gate A-D PASS by the human QA tester is necessary before P2.1 can be closed; CI passing alone is NOT Foundry PASS.
