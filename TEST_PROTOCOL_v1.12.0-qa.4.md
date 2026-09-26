# Realm Guard / Torchbearer — v1.12.0-qa.4 Test Protocol

## Scope
M10B.4 — generic MG1E-family Conditions / Recovery routing. MG1E remains FOUNDATION_ONLY / non-selectable / non-live. v1.11.0 remains STABLE / GOLD.

## Gate A — Boot / release contract
1. Install/update to v1.12.0-qa.4 in Foundry VTT 13.351.
2. Reload the world.
3. Confirm no startup error and system version v1.12.0-qa.4.
4. Confirm Rules Profile Management opens.

## Gate B — Capability snapshots
Run:
```js
const legacy = game.realmGuard.core.resolveProfileCapabilities("realm-guard-legacy-mixed");
const strict = game.realmGuard.core.resolveProfileCapabilities("realm-guard-strict");
const mg1e = game.realmGuard.core.resolveProfileCapabilities("mg1e");
console.log({legacy:legacy.rules.conditions,legacyRecovery:legacy.rules.recovery,strict:strict.rules.conditions,strictRecovery:strict.rules.recovery,mg1e:mg1e.rules.conditions,mg1eRecovery:mg1e.rules.recovery});
```
Expected: Legacy familySemantics=false; Strict ends in Strained; MG1E ends in Sick; Strict/MG1E GM recovery cost 2; MG1E remains foundationOnly/non-selectable/non-live.

## Gate C — Legacy Mixed regression
Verify Fresh/Afraid unchanged, Strained recovery works, Hungry legacy methods remain Cook/Brewer/Baker/Resources, no Harvester is injected, ordinary rolls unchanged.

## Gate D — Strict live Condition effects
Switch to Strict and reload. Verify dormant Fresh/Afraid/Sick Items stay stored but do not apply Strict mechanics. Injured/Strained each apply -1D where appropriate; Resources/Circles exempt; Will/Health recovery ignores those penalties.

## Gate E — Strict recovery
Verify order Hungry & Thirsty → Angry → Tired → Injured → Strained. Hungry offers Harvester/Cook/Brewer/Baker/Resources. Angry Will Ob2. Tired Health Ob3. Injured Health Ob4 with Healer Ob3 route. Strained Will Ob4 with counsel route. GM Turn recovery costs 2 Checks. Will/Health recovery Roll Dialog shows no Ask for Help.

## Gate F — MG1E foundation shadow
MG1E is not activated. Inspect capabilities only. Expected: Healthy/Hungry & Thirsty/Angry/Tired/Injured/Sick; Sick Will Ob4; fail → Healer required Ob3; healer fail → permanent reduction excluding Resources/Circles; Players' Turn waiver represented; Strained absent from active MG1E set.

## Gate G — dormant-data safety
Use an Actor containing Sick, Strained, Fresh and Afraid. Reload in Legacy, switch to Strict, reload, switch back to Legacy, reload. None may be renamed/deleted automatically. No Sick→Strained or Strained→Sick migration.

## Gate H — release notes hardening
Confirm the GitHub prerelease body identifies v1.12.0-qa.4 and release workflow is green.

Mark M10B.4 FULL PASS only after Gates A-H pass in Foundry VTT 13.351.
