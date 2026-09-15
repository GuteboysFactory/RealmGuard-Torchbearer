from pathlib import Path
import json
import re

p = Path('module/conflicts.mjs')
s = p.read_text()

pattern = re.compile(
    r'  const gmMode = interactionMode\(gmEntry\.action, rangerEntry\.action, \{ ownMissile: sideHasMissile\(gmActor, state, "gm", gmWeaponId\), opponentMissile: sideHasMissile\(rangerActor, state, "ranger", rangerWeaponId\) \}\);\n'
    r'  const rangerMode = interactionMode\(rangerEntry\.action, gmEntry\.action, \{ ownMissile: sideHasMissile\(rangerActor, state, "ranger", rangerWeaponId\), opponentMissile: sideHasMissile\(gmActor, state, "gm", gmWeaponId\) \}\);'
)
replacement = '''  const gmOwnMissile = sideHasMissile(gmActor, state, "gm", gmWeaponId);
  const rangerOwnMissile = sideHasMissile(rangerActor, state, "ranger", rangerWeaponId);
  const gmMode = interactionMode(gmEntry.action, rangerEntry.action, { ownMissile: gmOwnMissile, opponentMissile: rangerOwnMissile });
  const rangerMode = interactionMode(rangerEntry.action, gmEntry.action, { ownMissile: rangerOwnMissile, opponentMissile: gmOwnMissile });
  try {
    Hooks.callAll("realmGuardLegacyConflictInteraction", { conflictId: state.id, side: "gm", ownAction: gmEntry.action, opponentAction: rangerEntry.action, ownMissile: gmOwnMissile, opponentMissile: rangerOwnMissile, legacyMode: gmMode });
    Hooks.callAll("realmGuardLegacyConflictInteraction", { conflictId: state.id, side: "ranger", ownAction: rangerEntry.action, opponentAction: gmEntry.action, ownMissile: rangerOwnMissile, opponentMissile: gmOwnMissile, legacyMode: rangerMode });
  } catch (_error) { /* M6 shadow observer must never interrupt Conflict */ }'''
s, count = pattern.subn(replacement, s, count=1)
assert count == 1, f'reveal interaction block replacement count={count}'

needle = '  const gmZero = Number(next.gm.disposition.current ?? 0) <= 0, rangerZero = Number(next.ranger.disposition.current ?? 0) <= 0;'
assert needle in s, 'resolution observation target not found'
observer = '''  try {
    Hooks.callAll("realmGuardLegacyConflictResolution", {
      conflictId: next.id,
      exchange: next.exchange,
      pair: { index: pair.index, gmAction: pair.gmAction, rangerAction: pair.rangerAction, gmMode, rangerMode },
      gmRoll,
      rangerRoll: rr,
      beforeDisposition: {
        gm: { start: next.gm.disposition.start, current: beforeGm },
        ranger: { start: next.ranger.disposition.start, current: beforeRanger }
      },
      gmPassed,
      rangerPassed: rPassed,
      gmMargin,
      rangerMargin: rMargin,
      gmFailureMargin,
      rangerFailureMargin: rFailureMargin,
      gmEffectiveSuccesses: gmRaw,
      rangerEffectiveSuccesses: rRaw,
      gmDisposition: next.gm.disposition.current,
      rangerDisposition: next.ranger.disposition.current,
      tiePending: false,
      maneuverQueue: maneuverPending
    });
  } catch (_error) { /* M6 shadow observer must never interrupt Conflict */ }

'''
s = s.replace(needle, observer + needle, 1)
p.write_text(s)

p = Path('realm-guard.mjs')
s = p.read_text()
anchor = 'import { installM5CoreServices } from "./module/m5-core-service.mjs";\n'
if 'installM6ConflictShadow' not in s:
    assert anchor in s
    s = s.replace(anchor, anchor + 'import { installM6ConflictShadow } from "./module/m6-conflict-shadow.mjs";\n', 1)
s = s.replace('  installM5CoreServices();\n', '  installM5CoreServices();\n  installM6ConflictShadow();\n', 1)
s = s.replace('1.7.0-qa.22', '1.8.0-qa.1')
p.write_text(s)

p = Path('system.json')
m = json.loads(p.read_text())
m['version'] = '1.8.0-qa.1'
m['download'] = 'https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/1.8.0-qa.1/realm-guard.zip'
p.write_text(json.dumps(m, indent=2) + '\n')

Path('qa/m6-conflict-shadow-smoke.mjs').write_text('''import assert from "node:assert/strict";\nimport { m6InteractionMode, resolveM6ConflictPair, previewM6ConflictResolution } from "../module/core/m6-conflict-services.mjs";\nassert.equal(m6InteractionMode("attack", "attack"), "independent");\nassert.equal(m6InteractionMode("attack", "attack", { ownMissile: true }), "versus");\nassert.equal(m6InteractionMode("defend", "feint"), "trumped");\nlet r = resolveM6ConflictPair({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 4 }, rangerRoll: { successes: 2 } });\nassert.equal(r.gm.passed, true); assert.equal(r.gm.margin, 2); assert.equal(r.ranger.passed, false);\nr = resolveM6ConflictPair({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 2 }, rangerRoll: { successes: 2 } });\nassert.equal(r.tiePending, true);\nconst preview = previewM6ConflictResolution({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 4 }, rangerRoll: { successes: 2 }, gmDisposition: { start: 8, current: 8 }, rangerDisposition: { start: 7, current: 7 } });\nassert.equal(preview.disposition.ranger.current, 5); assert.equal(preview.disposition.gm.current, 8);\nconsole.log("PASS m6-conflict-shadow-smoke");\n''')

Path('TEST_PROTOCOL_v1.8.0-qa.1.md').write_text('''# Realm Guard / Torchbearer v1.8.0-qa.1 QA Protocol

## Scope
M6 Conflict Engine refactor begins in shadow-only mode. Legacy Mixed remains the sole live authority. CORE independently recomputes action interaction mode, pass/fail, margins, effective successes, disposition delta and Maneuver queue, then compares against the completed Legacy resolution.

## 1. Initial status
```js
game.system.version
game.realmGuard.core.m6.getStatus()
```
Expected: `1.8.0-qa.1`, phase `M6`, mode `SHADOW_PARITY`, authority `LEGACY_MIXED`, `liveApplication:false`, `mismatches:0`.

## 2. Clear M6 history
```js
game.realmGuard.core.m6.clear()
```

## 3. Versus resolution
Play one normal Versus action pair such as Attack vs Defend. After resolution:
```js
game.realmGuard.core.m6.getStatus()
game.realmGuard.core.m6.history().slice(-6)
```
Expected interaction rows `MATCH` and one `RESOLVE_ACTION_PAIR` row `MATCH`. Check pass/fail, margin, effective successes and both disposition values.

## 4. Independent resolution
Play an Independent pair, preferably Attack vs Attack without missile weapons or a legal independent/trumped combination. Expected `MATCH`; CORE disposition preview equals Legacy.

## 5. Missile interaction exception
Use Attack vs Attack with Bow or Sling on either side. Expected interaction mode `versus` on both sides and parity `MATCH`.

## 6. Maneuver resolution
Resolve a successful Maneuver with margin > 0. Expected `RESOLVE_ACTION_PAIR` parity `MATCH` and CORE `maneuverQueue` matching Legacy side+margin. Complete the normal Legacy Maneuver choice and verify gameplay remains unchanged.

## 7. Conditional successes / penalties regression
Use one Tool that produces conditional +s or -s. Expected M6 resolution parity `MATCH`.

## 8. Regression
Verify Conflict state, chat card, disposition, Learning/Nature tax, Maneuver UI, action advancement, next exchange and Token Actor resolution all behave exactly as before. No red console errors.

## PASS
At least one Versus, one Independent, missile exception and Maneuver resolution observed; all M6 rows MATCH; `mismatches:0`; Legacy remains live authority.
''')

Path('release/NOTES.md').write_text('''Realm Guard / Torchbearer v1.8.0-qa.1 — M6 Conflict Engine shadow foundation.

M5 is now treated as verified for controlled live Inventory validation and Conflict Tool evaluation. M6 begins the Conflict Engine refactor without taking live authority.

New CORE shadow services independently calculate interaction mode, Versus/Independent resolution, effective successes, margins, disposition deltas and pending Maneuver side/margin. Legacy Mixed remains the sole live Conflict resolution/state authority; M6 only observes and reports parity.

Preserved: M5 live handoffs, qa.22 Token Actor resolution, current Conflict UX, Learning/Nature handling and all previous CORE milestones.

QA protocol: TEST_PROTOCOL_v1.8.0-qa.1.md
''')

# M5 visual/compat smoke tests are milestone-preservation tests, not a version lock.
for smoke in Path('qa').glob('*.mjs'):
    text = smoke.read_text()
    updated = text.replace(r'/^1\.7\.0-qa\.\d+$/', r'/^1\.(?:7|8)\.0-qa\.\d+$/')
    updated = updated.replace('1.7.0-qa.22', '1.8.0-qa.1')
    if updated != text:
        smoke.write_text(updated)

Path('release/READY').write_text('1.8.0-qa.1\n')
