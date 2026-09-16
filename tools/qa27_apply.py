from pathlib import Path
import json


def replace_once(path, old, new, label):
    p = Path(path)
    s = p.read_text()
    count = s.count(old)
    assert count == 1, f"{label}: expected 1 match, found {count}"
    p.write_text(s.replace(old, new, 1))


# Diagnosed root cause: the custom fixed Conflict window had z-index 120 while Foundry DialogV2
# roll windows live in Foundry's managed application stack (observed at z-index 103). That made
# the Conflict window permanently outrank transient roll dialogs. Put the custom surface below
# Foundry's application baseline so normal Foundry focus/stacking owns transient dialogs.
replace_once(
    'styles/realm-guard.css',
    '''.rg-conflict-window {\n  position: fixed;\n  z-index: 120;\n''',
    '''.rg-conflict-window {\n  position: fixed;\n  z-index: 99;\n''',
    'Conflict window z-index'
)

# Version bump.
p = Path('realm-guard.mjs')
s = p.read_text().replace('1.8.0-qa.4', '1.8.0-qa.5')
p.write_text(s)

p = Path('system.json')
m = json.loads(p.read_text())
assert m['version'] == '1.8.0-qa.4', m['version']
m['version'] = '1.8.0-qa.5'
m['download'] = 'https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/1.8.0-qa.5/realm-guard.zip'
p.write_text(json.dumps(m, indent=2) + '\n')

Path('qa/conflict-window-stacking-smoke.mjs').write_text('''import assert from "node:assert/strict";\nimport fs from "node:fs";\nconst css = fs.readFileSync("styles/realm-guard.css", "utf8");\nassert.match(css, /\\.rg-conflict-window\\s*\\{[\\s\\S]*?position:\\s*fixed;[\\s\\S]*?z-index:\\s*99;/);\nassert.ok(!/\\.rg-conflict-window\\s*\\{[\\s\\S]*?z-index:\\s*120;/.test(css));\nconsole.log("PASS conflict-window-stacking-smoke · Conflict below Foundry application stack");\n''')

Path('TEST_PROTOCOL_v1.8.0-qa.5.md').write_text('''# Realm Guard / Torchbearer v1.8.0-qa.5 QA Protocol\n\n## Scope\nTargeted UX fix for Conflict window stacking. Live diagnosis showed the custom `.rg-conflict-window` at computed z-index `120` while the active Realm Guard roll `DialogV2` was at `103`, so the Conflict window covered the roll dialog. qa.5 lowers only the custom Conflict surface to `99`, below Foundry's managed application stack. No Conflict rules/state/resolution logic changes.\n\n## 1. Initial version and M6 regression status\n```js\ngame.system.version\ngame.realmGuard.core.m6.getStatus()\ngame.realmGuard.core.m6.handoffStatus()\n```\nExpected `1.8.0-qa.5`; existing qa.4 / M6 state remains enabled with no rollback reason.\n\n## 2. Primary stacking reproduction\nKeep the Conflict window visible and click a Conflict Roll button.\nExpected: the roll dialog opens visibly above the Conflict window every time. It must be fully clickable without first moving/minimizing/closing Conflict.\n\nWhile the dialog is open, run:\n```js\nconst conflict = document.querySelector('.rg-conflict-window');\nconst dialogs = [...document.querySelectorAll('.application')];\nconsole.log({\n  conflictZ: conflict ? getComputedStyle(conflict).zIndex : null,\n  dialogs: dialogs.map(el => ({ id: el.id, title: el.querySelector('.window-title')?.textContent?.trim() ?? '', z: getComputedStyle(el).zIndex }))\n});\n```\nExpected Conflict `99`; active roll dialog `>99`.\n\n## 3. Repeated roll regression\nComplete/close a roll dialog and open at least two more Conflict rolls across different Actions.\nExpected every new dialog is above Conflict; Conflict rerenders/state updates must not jump above it.\n\n## 4. Other transient Conflict dialogs\nOpen any available Conflict transient dialog (custom tool, Disarm, disposition method, tie/other dialog where applicable).\nExpected Foundry dialog is above Conflict and remains interactive.\n\n## 5. Conflict interaction regression\nClose transient dialogs and interact with Conflict normally: drag it, scroll it, plan cards, choose Exchange Weapon / Tool, lock/reveal and roll.\nExpected Conflict itself remains above the canvas/sidebar enough to be usable; no layout or drag regression.\n\n## 6. qa.4 + M6 regression\nConfirm Exchange-scoped Weapon / Tool behavior remains correct and resolve at least one action pair.\n```js\ngame.realmGuard.core.m6.handoffStatus()\ngame.realmGuard.core.m6.getStatus()\n```\nExpected handoff telemetry mismatches `0`, errorFallbacks `0`, shadow mismatches `0`, enabled `true`.\n\n## PASS\nConflict computed z-index is 99, Foundry roll/transient dialogs open above it consistently, Conflict remains usable, and qa.4/M6 regressions remain green.\n''')

Path('release/NOTES.md').write_text('''Realm Guard / Torchbearer v1.8.0-qa.5 — Conflict window stacking hotfix.\n\nLive browser diagnostics captured the intermittent roll-dialog-behind-Conflict bug while active: `.rg-conflict-window` computed to z-index 120 while the Foundry `DialogV2` roll window was z-index 103. The fixed custom Conflict surface therefore outranked Foundry's managed application stack.\n\nqa.5 changes only the Conflict window stacking level from 120 to 99, allowing Foundry's normal application/dialog focus stack to remain above it. No Conflict rules, state, M6 resolution handoff, qa.4 Exchange Weapon / Tool scope, or Token Actor behavior changes.\n\nQA protocol: TEST_PROTOCOL_v1.8.0-qa.5.md\n''')
