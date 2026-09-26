# Realm Guard / Torchbearer — v1.12.0-qa.5 Test Protocol

## Scope
M10B.5 — generic MG1E-family Gear / Inventory / Conflict routing plus NPC Compact Header presentation polish. MG1E remains FOUNDATION_ONLY / non-selectable / non-live. v1.11.0 remains STABLE / GOLD.

## Gate A — Boot / release contract
1. Install/update to v1.12.0-qa.5 in Foundry VTT 13.351.
2. Reload the world.
3. Confirm no startup error and system version v1.12.0-qa.5.
4. Confirm Rules Profile Management and an NPC sheet open normally.

## Gate B — Capability snapshots
Run:
```js
const legacy = game.realmGuard.core.resolveProfileCapabilities("realm-guard-legacy-mixed");
const strict = game.realmGuard.core.resolveProfileCapabilities("realm-guard-strict");
const mg1e = game.realmGuard.core.resolveProfileCapabilities("mg1e");
console.log(JSON.stringify({
  legacy:{profile:legacy.profile,inventory:legacy.rules.inventory,conflict:legacy.rules.conflict},
  strict:{profile:strict.profile,inventory:strict.rules.inventory,conflict:strict.rules.conflict},
  mg1e:{profile:mg1e.profile,inventory:mg1e.rules.inventory,conflict:mg1e.rules.conflict}
},null,2));
```
Expected: Legacy = STRUCTURED / placement authority / unarmed -1D. Strict and MG1E = LOOSE / placement presentation only / unarmed 0D. MG1E profile v6 remains foundationOnly=true, selectable=false, supported=false and liveRuleAuthority=false.

## Gate C — Legacy Mixed inventory/conflict regression
Stay in Legacy Mixed. Verify:
- unassigned physical weapon is not offered as a Fight weapon until placed in hand;
- hand-held physical weapon is offered;
- no valid weapon/tool still gives Unarmed -1D;
- existing saved Conflict Tools, Talents, unrated Wise presentation and Legacy Trait behavior are unchanged.

## Gate D — Strict inventory
Switch to Strict and reload. Verify an unassigned physical Fight weapon is available under LOOSE inventory. Existing hand/worn/container/unassigned placement metadata must remain unchanged; the sheet may still display that metadata but it has no Strict rule authority.

## Gate E — Strict conflict routing
Verify representative Strict Realm Guard source ownership:
- Fight uses Fighter for Attack / Defend / Feint / Maneuver;
- Chase starting Disposition uses Scout + Health;
- Whip is presented instead of Hook and Line;
- Leather / Chainmail retain inherited MG1E armor behavior;
- Plated Armor is available as the Realm Guard override;
- no weapon/tool = 0D universal penalty;
- Tokens of Power remain available; Levels/Talents remain mechanically hidden/disabled.

## Gate F — MG1E foundation shadow
Do not activate MG1E. Run:
```js
const p = game.realmGuard.core.m10.resolveGearInventoryConflictPolicy("mg1e");
console.log(p);
```
Expected:
- Fight action skills = Fighter / Nature / Fighter / Nature;
- Chase starting Disposition base = Nature;
- Hook and Line remains Hook and Line;
- Light Armor / Heavy Armor are source armor;
- Plated Armor is not MG1E base content;
- unarmed default = 0D;
- weapon scope = ACTION_SET;
- profile remains non-live.

## Gate G — action-set weapon scope
In Strict, start a representative Fight and confirm weapon/tool declaration is bound to the exchange/action-set workflow rather than silently changing because Item placement changes mid-exchange. Halberd mode and Sword Useful choice must remain scoped correctly.

## Gate H — family conflict regression
Verify representative Conflict Roll Dialog behavior:
- rated Wises / I Am Wise in Strict;
- MG1E Trait level presentation;
- Teamwork remains typed family Help with Synergy off;
- Tap/Double-Tap Nature behavior remains as verified in M10B.3;
- Legacy Mixed still uses its compatibility behavior.

## Gate I — round-trip data safety
Use an Actor with hand/worn/container/unassigned Gear and container metadata. Legacy → Strict → Legacy with reloads must not delete, move, normalize or rewrite placement/container metadata. No profile switch may create duplicate Gear.

## Gate J — NPC Compact Header
Open NPCs with short and deliberately long names. Resize near 800 / 600 / 500 / 420 px.
Expected:
- Fate / Persona / Checks sit compactly beneath identity instead of a tall right column;
- all +/- controls remain usable;
- long names remain readable without forcing a giant header;
- resources reflow 3 columns → 2+1 → 1 as space narrows;
- Quick Skills / Conditions / GM Notes gain useful vertical space.

## Gate K — release hardening
Confirm workflow SUCCESS, GitHub prerelease v1.12.0-qa.5 has both release assets, release body identifies M10B.5, and `channels/qa/system.json` actually reports v1.12.0-qa.5.

Mark M10B.5 FULL PASS only after Gates A-K pass in Foundry VTT 13.351.
