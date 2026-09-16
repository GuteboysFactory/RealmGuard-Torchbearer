from pathlib import Path
import json


def replace_once(path, old, new, label):
    p = Path(path)
    s = p.read_text()
    count = s.count(old)
    assert count == 1, f"{label}: expected 1 match, found {count}"
    p.write_text(s.replace(old, new, 1))


# Legacy Conflict: expose the already-resolved automatic tiebreak result to the M6 shadow observer.
replace_once(
    'module/conflicts.mjs',
    '  let gmFailureMargin = 0, rFailureMargin = 0, tiePending = false;\n',
    '  let gmFailureMargin = 0, rFailureMargin = 0, tiePending = false;\n  let resolvedAutomaticTie = null;\n',
    'declare resolvedAutomaticTie'
)

replace_once(
    'module/conflicts.mjs',
    '''      if (tieResolution?.resolved) {\n        rPassed = Boolean(tieResolution.passed); gmPassed = !rPassed;\n        rMargin = rPassed ? Math.max(0, Number(tieResolution.margin ?? 0)) : 0;\n        gmMargin = gmPassed ? Math.max(0, Number(tieResolution.margin ?? 0)) : 0;\n        rFailureMargin = rPassed ? 0 : Math.max(0, Number(tieResolution.margin ?? 0));\n        gmFailureMargin = gmPassed ? 0 : Math.max(0, Number(tieResolution.margin ?? 0));\n        pair.resultText = `<b>Versus tie resolved:</b> ${rPassed ? "Rangers" : "GM / Opposition"} wins${Number(tieResolution.margin ?? 0) ? ` · margin ${Number(tieResolution.margin)}` : ""}.`;\n''',
    '''      if (tieResolution?.resolved) {\n        rPassed = Boolean(tieResolution.passed); gmPassed = !rPassed;\n        rMargin = rPassed ? Math.max(0, Number(tieResolution.margin ?? 0)) : 0;\n        gmMargin = gmPassed ? Math.max(0, Number(tieResolution.margin ?? 0)) : 0;\n        rFailureMargin = rPassed ? 0 : Math.max(0, Number(tieResolution.margin ?? 0));\n        gmFailureMargin = gmPassed ? 0 : Math.max(0, Number(tieResolution.margin ?? 0));\n        resolvedAutomaticTie = { resolved: true, rangerPassed: rPassed, margin: Math.max(0, Number(tieResolution.margin ?? 0)) };\n        pair.resultText = `<b>Versus tie resolved:</b> ${rPassed ? "Rangers" : "GM / Opposition"} wins${Number(tieResolution.margin ?? 0) ? ` · margin ${Number(tieResolution.margin)}` : ""}.`;\n''',
    'capture automatic tiebreak outcome'
)

replace_once(
    'module/conflicts.mjs',
    '''      tiePending: false,\n      maneuverQueue: maneuverPending\n''',
    '''      tiePending: false,\n      tieResolution: resolvedAutomaticTie,\n      maneuverQueue: maneuverPending\n''',
    'publish automatic tiebreak outcome'
)

# CORE M6: accept a completed automatic tiebreak as shadow input instead of stopping at raw tie.
p = Path('module/core/m6-conflict-services.mjs')
s = p.read_text()
s = s.replace(
    'export function resolveM6ConflictPair({ gmAction, rangerAction, gmMode, rangerMode, gmRoll, rangerRoll } = {}) {',
    'export function resolveM6ConflictPair({ gmAction, rangerAction, gmMode, rangerMode, gmRoll, rangerRoll, tieResolution = null } = {}) {'
)
old = '''  if (gmEffective === rangerEffective && gmMode === "versus" && rangerMode === "versus") {\n    return Object.freeze({\n      kind: "VERSUS",\n      tiePending: true,\n      gm: Object.freeze({ passed: false, margin: 0, failureMargin: 0, effectiveSuccesses: gmEffective, obstacle: null, trumped: false }),\n      ranger: Object.freeze({ passed: false, margin: 0, failureMargin: 0, effectiveSuccesses: rangerEffective, obstacle: null, trumped: false })\n    });\n  }\n'''
new = '''  if (gmEffective === rangerEffective && gmMode === "versus" && rangerMode === "versus") {\n    if (tieResolution?.resolved) {\n      const rangerPassed = Boolean(tieResolution.rangerPassed ?? tieResolution.passed);\n      const gmPassed = !rangerPassed;\n      const margin = Math.max(0, num(tieResolution.margin));\n      return Object.freeze({\n        kind: "VERSUS",\n        tiePending: false,\n        tieResolved: true,\n        gm: Object.freeze({ passed: gmPassed, margin: gmPassed ? margin : 0, failureMargin: gmPassed ? 0 : margin, effectiveSuccesses: gmEffective, obstacle: null, trumped: false }),\n        ranger: Object.freeze({ passed: rangerPassed, margin: rangerPassed ? margin : 0, failureMargin: rangerPassed ? 0 : margin, effectiveSuccesses: rangerEffective, obstacle: null, trumped: false })\n      });\n    }\n    return Object.freeze({\n      kind: "VERSUS",\n      tiePending: true,\n      tieResolved: false,\n      gm: Object.freeze({ passed: false, margin: 0, failureMargin: 0, effectiveSuccesses: gmEffective, obstacle: null, trumped: false }),\n      ranger: Object.freeze({ passed: false, margin: 0, failureMargin: 0, effectiveSuccesses: rangerEffective, obstacle: null, trumped: false })\n    });\n  }\n'''
assert s.count(old) == 1, f'CORE tie block expected 1 match, found {s.count(old)}'
s = s.replace(old, new, 1)
s = s.replace(
    '''  rangerRoll,\n  gmDisposition,\n''',
    '''  rangerRoll,\n  tieResolution = null,\n  gmDisposition,\n''',
    1
)
s = s.replace(
    '  const pair = resolveM6ConflictPair({ gmAction, rangerAction, gmMode, rangerMode, gmRoll, rangerRoll });',
    '  const pair = resolveM6ConflictPair({ gmAction, rangerAction, gmMode, rangerMode, gmRoll, rangerRoll, tieResolution });',
    1
)
p.write_text(s)

# Shadow bridge: forward Legacy automatic tiebreak evidence into the independent CORE calculation.
replace_once(
    'module/m6-conflict-shadow.mjs',
    '''    gmRoll: event.gmRoll,\n    rangerRoll: event.rangerRoll,\n    gmDisposition: event.beforeDisposition?.gm,\n''',
    '''    gmRoll: event.gmRoll,\n    rangerRoll: event.rangerRoll,\n    tieResolution: event.tieResolution ?? null,\n    gmDisposition: event.beforeDisposition?.gm,\n''',
    'forward automatic tiebreak to M6 CORE'
)

# Version bump.
p = Path('realm-guard.mjs')
s = p.read_text().replace('1.8.0-qa.1', '1.8.0-qa.2')
p.write_text(s)

p = Path('system.json')
m = json.loads(p.read_text())
m['version'] = '1.8.0-qa.2'
m['download'] = 'https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/1.8.0-qa.2/realm-guard.zip'
p.write_text(json.dumps(m, indent=2) + '\n')

# Expand M6 smoke coverage with the diagnosed automatic-tie path.
Path('qa/m6-conflict-shadow-smoke.mjs').write_text('''import assert from "node:assert/strict";\nimport { m6InteractionMode, resolveM6ConflictPair, previewM6ConflictResolution } from "../module/core/m6-conflict-services.mjs";\nassert.equal(m6InteractionMode("attack", "attack"), "independent");\nassert.equal(m6InteractionMode("attack", "attack", { ownMissile: true }), "versus");\nassert.equal(m6InteractionMode("defend", "feint"), "trumped");\n\nlet r = resolveM6ConflictPair({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 4 }, rangerRoll: { successes: 2 } });\nassert.equal(r.gm.passed, true); assert.equal(r.gm.margin, 2); assert.equal(r.ranger.passed, false);\n\nr = resolveM6ConflictPair({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 2 }, rangerRoll: { successes: 2 } });\nassert.equal(r.tiePending, true);\n\nr = resolveM6ConflictPair({ gmAction: "defend", rangerAction: "attack", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 3 }, rangerRoll: { successes: 3 }, tieResolution: { resolved: true, rangerPassed: true, margin: 2 } });\nassert.equal(r.tiePending, false); assert.equal(r.ranger.passed, true); assert.equal(r.ranger.margin, 2); assert.equal(r.gm.failureMargin, 2);\n\nlet preview = previewM6ConflictResolution({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 4 }, rangerRoll: { successes: 2 }, gmDisposition: { start: 8, current: 8 }, rangerDisposition: { start: 7, current: 7 } });\nassert.equal(preview.disposition.ranger.current, 5); assert.equal(preview.disposition.gm.current, 8);\n\npreview = previewM6ConflictResolution({ gmAction: "defend", rangerAction: "attack", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 3 }, rangerRoll: { successes: 3 }, tieResolution: { resolved: true, rangerPassed: true, margin: 2 }, gmDisposition: { start: 6, current: 6 }, rangerDisposition: { start: 7, current: 7 } });\nassert.equal(preview.pair.tiePending, false); assert.equal(preview.disposition.gm.current, 4); assert.equal(preview.disposition.ranger.current, 7);\n\nconsole.log("PASS m6-conflict-shadow-smoke · automatic Versus tie parity");\n''')

Path('TEST_PROTOCOL_v1.8.0-qa.2.md').write_text('''# Realm Guard / Torchbearer v1.8.0-qa.2 QA Protocol\n\n## Scope\nM6 remains shadow-only. qa.2 fixes the diagnosed parity gap where Legacy resolved a raw Versus tie through `_resolveAutomaticVersusTie()` while CORE stopped at `tiePending`. Legacy now exposes only the completed tiebreak result as observation data; CORE independently applies winner, margin, failure margin and disposition consequences. No CORE live writes are enabled.\n\n## 1. Initial status\n```js\ngame.system.version\ngame.realmGuard.core.m6.getStatus()\n```\nExpected: `1.8.0-qa.2`, phase `M6`, mode `SHADOW_PARITY`, authority `LEGACY_MIXED`, `liveApplication:false`.\n\n## 2. Reset\n```js\ngame.realmGuard.core.m6.clear()\n```\n\n## 3. Automatic Versus tie — primary qa.2 test\nRun a Versus action pair and obtain equal effective successes so the normal automatic Versus tiebreak resolves the tie. Complete the action normally. Then run:\n```js\ngame.realmGuard.core.m6.history().filter(e => e.domain === "CONFLICT_RESOLUTION").slice(-3)\ngame.realmGuard.core.m6.getStatus()\n```\nExpected latest resolution: `parity:"MATCH"`, `match:true`, Legacy/Core agree on passed side, margin, failure margin, effective successes, both disposition values and `tiePending:false`. `mismatches:0` after a clean reset.\n\n## 4. Non-tie Versus regression\nRun Attack vs Defend with unequal successes. Expected interaction and resolution `MATCH`.\n\n## 5. Independent regression\nRun an Independent pair. Expected resolution `MATCH`.\n\n## 6. Missile exception regression\nAttack vs Attack with Bow/Sling on either side. Expected both interaction rows `versus` and `MATCH`.\n\n## 7. Maneuver regression\nResolve a successful Maneuver with margin > 0. Expected CORE maneuver queue side/margin equals Legacy and resolution is `MATCH`. Complete the Legacy Maneuver UI normally.\n\n## 8. M5 / Token Actor regression\nConflict Tool bonuses and the qa.22 Token Actor resolver must remain unchanged. No red console errors.\n\n## PASS\nAutomatic resolved Versus tie MATCH, normal Versus MATCH, Independent MATCH, missile interaction MATCH, Maneuver MATCH, and final `mismatches:0`. Legacy Mixed remains live authority.\n''')

Path('release/NOTES.md').write_text('''Realm Guard / Torchbearer v1.8.0-qa.2 — M6 Automatic Versus Tie parity.\n\nDiagnosed qa.1 mismatch fixed narrowly: Legacy Mixed resolves equal Versus results through its automatic Versus tiebreak procedure, while the first M6 shadow implementation stopped at tiePending.\n\nqa.2 keeps Legacy as the sole live Conflict authority. When Legacy has completed an automatic Versus tiebreak, it exposes the resolved side and margin to the shadow observer. CORE then independently applies the same Conflict consequences and compares winner/pass-fail, margin, failure margin, effective successes, disposition and tie state.\n\nNo Conflict state writes move to CORE in this build. M5 live handoffs, Token Actor resolution, current Conflict UX and all prior CORE milestones remain unchanged.\n\nQA protocol: TEST_PROTOCOL_v1.8.0-qa.2.md\n''')

# Do not touch release/READY here. Release is triggered only after the verification workflow passes.
