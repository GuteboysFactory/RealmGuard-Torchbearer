# Realm Guard / Torchbearer — v1.12.0-qa.6 Test Protocol

## Scope
M10B.6 — generic MG1E-family Session / Circles / Progression routing plus NPC Character-style resource-stack hotfix. MG1E remains FOUNDATION_ONLY / non-selectable / non-live. v1.11.0 remains STABLE / GOLD.

## Gate A — Boot / release contract
1. Install/update to v1.12.0-qa.6 in Foundry VTT 13.351.
2. Reload the world.
3. Confirm no startup error and system version v1.12.0-qa.6.
4. Confirm Rules Profile Management, one Ranger sheet and one NPC sheet open normally.

## Gate B — capability snapshot
Run:
```js
const legacy = game.realmGuard.core.resolveProfileCapabilities("realm-guard-legacy-mixed");
const strict = game.realmGuard.core.resolveProfileCapabilities("realm-guard-strict");
const mg1e = game.realmGuard.core.resolveProfileCapabilities("mg1e");
console.log(JSON.stringify({
  legacy:{profile:legacy.profile,session:legacy.rules.session,circles:legacy.rules.circles,progression:legacy.rules.progression},
  strict:{profile:strict.profile,session:strict.rules.session,circles:strict.rules.circles,progression:strict.rules.progression},
  mg1e:{profile:mg1e.profile,session:mg1e.rules.session,circles:mg1e.rules.circles,progression:mg1e.rules.progression}
},null,2));
```
Expected: MG1E profile v7 remains foundationOnly=true, selectable=false, supported=false, liveRuleAuthority=false. Strict/MG1E show family Session/Circles semantics, one free test, 1 Check extra test, alternation + solo exception, 2-Check GM Turn recovery, known Contact +1D, Enmity +3s, Levels/Talents off and lifetime-spend Level tracking off. Legacy keeps Levels/Talents and lifetime spend tracking on.

## Gate C — Legacy Mixed regression
Stay/switch to Legacy Mixed and reload. Verify:
- Players' Turn free test / Checks / alternation behave as before;
- End Session still works with current Legacy compatibility behavior;
- Fate/Persona spending continues to update Legacy lifetime spend / Levels as before;
- Talents remain enabled and reset at a new session;
- Known Person Circles does not gain the new MG1E-family Contact +1D merely from qa.6 routing.

## Gate D — Strict Players' Turn / Checks
Switch to Strict and reload. Verify:
- first Players' Turn test is free;
- next test costs 1 Check;
- another active Ranger must act before the same Ranger acts again;
- solo Ranger may continue;
- Check transfer/pass behavior remains available;
- GM Turn recovery still costs 2 Checks where applicable.

## Gate E — Strict End Session
Verify representative End Session validation:
- MVP and Workhorse must be different;
- multiple Embodiment awards may be selected, but not every participating Ranger;
- one-player session cannot award Embodiment to that sole participant under Strict/MG1E-family policy;
- rewards still require table review/group agreement and Foundry commit remains GM-owned;
- no Legacy Level/Talent progression is triggered under Strict.

## Gate F — Circles known Contact +1D
In Strict, use Circles → Find New Person and succeed so the person is recorded as a Contact. Then use Circles → Known Person for that same Contact.
Expected:
- later Known Contact test receives +1D automatically;
- a known Enemy/non-Contact does not get that Contact bonus;
- Social Network record remains the authority; no NPC is created automatically.

## Gate G — Enmity Clause +3s
Use/link a Hostile Enemy relationship to an opposition NPC/Actor. Start an Argument or Speech conflict against that linked enemy.
Expected:
- opposition starting Disposition receives +3s from Enmity;
- chat breakdown identifies the Enmity Clause bonus;
- Fight/other conflict types do not receive it;
- unrelated/unlinked Hostile records do not receive it.

## Gate H — Strict progression suppression / data preservation
Use a Ranger with existing Legacy Level, lifetime Fate/Persona counters and at least one Talent. Under Strict:
- Fate/Persona may still be spent normally;
- lifetime spent counters do not increase;
- Level does not change;
- no Talent unlock occurs;
- existing Level/counters/Talent Items remain stored and return when switching back to Legacy.

## Gate I — MG1E foundation shadow
Do not activate MG1E. Run:
```js
const p = game.realmGuard.core.m10.resolveSessionCirclesProgressionPolicy("mg1e");
console.log(p);
```
Expected: profileVersion 7, family semantics true, CORE M7 ownership, one free test, 1 Check extra, alternation + solo exception, 2-Check GM recovery, group-consensus/GM commit boundary, Contact +1D, Enmity +3s, Levels/Talents off, clear-slate Pass/Fail advancement, one mark per Ability/Skill per conflict/scene, Beginner's Luck opens at rating 2 after Maximum Nature attempts and does not advance Will/Health.

## Gate J — profile round-trip safety
Legacy → Strict → Legacy with reloads on a Ranger containing Level/counters/Talents and Social Network Contacts/Enemies. Confirm no stored progression or relationship data is deleted, normalized or duplicated by profile switching.

## Gate K — NPC header hotfix
Open an NPC at normal width and the smallest practical width.
Expected:
- Fate / Persona / Checks use the same compact vertical right-side stack pattern as the Character sheet;
- name / Type / Concept remain readable;
- +/- controls remain usable;
- no qa.5 2+1 wrapping layout;
- at very narrow width the stack drops below cleanly rather than overlapping.

## Gate L — release/channel verification
Confirm workflow SUCCESS, GitHub prerelease v1.12.0-qa.6 has both release assets, release body identifies M10B.6, and `channels/qa/system.json` reports v1.12.0-qa.6.

Mark M10B.6 FULL PASS only after Gates A-L pass in Foundry VTT 13.351.
