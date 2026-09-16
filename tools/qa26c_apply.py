from pathlib import Path
import json


def replace_once(path, old, new, label):
    p = Path(path)
    s = p.read_text()
    count = s.count(old)
    assert count == 1, f"{label}: expected 1 match, found {count}"
    p.write_text(s.replace(old, new, 1))

Path('module/core/m6-conflict-tool-scope.mjs').write_text('''export function applyExchangeToolScope(plan = [], weaponIds = {}, { defaultActorId = "" } = {}) {\n  return (Array.isArray(plan) ? plan : []).map(entry => {\n    const actorId = String(entry?.actorId ?? defaultActorId ?? "");\n    return { ...entry, actorId, weaponId: String(weaponIds?.[actorId] ?? "") };\n  });\n}\n\nexport function exchangeToolScopeIsConsistent(plan = [], weaponIds = {}, { defaultActorId = "" } = {}) {\n  return (Array.isArray(plan) ? plan : []).every(entry => {\n    const actorId = String(entry?.actorId ?? defaultActorId ?? "");\n    return String(entry?.weaponId ?? "") === String(weaponIds?.[actorId] ?? "");\n  });\n}\n''')

replace_once('module/conflicts.mjs',
'import { resolveConflictActor, inspectConflictActorResolution } from "./conflict-actor-resolver.mjs";\n',
'import { resolveConflictActor, inspectConflictActorResolution } from "./conflict-actor-resolver.mjs";\nimport { applyExchangeToolScope } from "./core/m6-conflict-tool-scope.mjs";\n',
'M6 exchange tool scope import')

replace_once('module/conflicts.mjs',
'''function planWeaponSelect(actor, state, side, index, selectedId = "") {\n  const weapons = availableConflictWeapons(actor, state, side);\n  const validSelected = weapons.some(w => w.id === selectedId) ? selectedId : "";\n  return `<label class="rg-plan-weapon"><span>Weapon / Tool</span><select data-plan-weapon="${index}" data-plan-side="${side}" data-rg-help-label="Weapon / Tool"><option value="" ${!validSelected ? "selected" : ""} data-rg-help="No valid Conflict Weapon / Tool is selected. This Action is Unarmed and takes −1D.">Unarmed · −1D</option>${weapons.map(w => `<option value="${w.id}" ${validSelected === w.id ? "selected" : ""} data-rg-help="Use ${esc(w.name)} as this Action's Conflict Weapon / Tool. Its action-specific bonus or penalty is applied when the test resolves.">${esc(w.name)}</option>`).join("")}</select></label>`;\n}\n''',
'''function planWeaponSummary(actor, state, side) {\n  const selectedId = weaponDraftFor(actor, state, side);\n  const name = planWeaponName(actor, state, side, selectedId);\n  return `<div class="rg-plan-weapon rg-plan-weapon-locked" data-rg-help="This Actor's Conflict Weapon / Tool is declared once for the entire three-Action Exchange. Change it in the Exchange Weapon / Tool section before locking the cards." data-rg-help-title="Exchange Weapon / Tool"><span>Exchange Weapon / Tool</span><b>${esc(name)}</b></div>`;\n}\n''',
'replace per-action tool dropdown')

replace_once('module/conflicts.mjs',
'  const defaultWeaponId = planEntry?.weaponId || weaponDraftFor(actor, state, side);\n',
'  const defaultWeaponId = weaponDraftFor(actor, state, side);\n',
'editable slot uses exchange declaration')

replace_once('module/conflicts.mjs',
'${actorSelect}${planWeaponSelect(actor, state, side, index, defaultWeaponId)}${custom}',
'${actorSelect}${planWeaponSummary(actor, state, side)}${custom}',
'render exchange tool summary')

replace_once('module/conflicts.mjs',
'''  return `<details class="rg-conflict-weapon-defaults"><summary><i class="fa-solid fa-wand-sparkles"></i> Optional: set quick Weapon / Tool defaults</summary><div class="rg-conflict-weapons"><small class="rg-conflict-weapon-rule">Defaults prefill new Action slots. Every planned Action can still choose a different Weapon / Tool. No valid tool = Unarmed −1D.</small>${rows}</div></details>`;\n''',
'''  return `<section class="rg-conflict-weapon-defaults rg-conflict-exchange-tools"><div class="rg-plan-step-head"><div><b><i class="fa-solid fa-wand-sparkles"></i> Exchange Weapon / Tool</b><span>Declare one Weapon / Tool per Actor for this three-Action Exchange.</span></div></div><div class="rg-conflict-weapons"><small class="rg-conflict-weapon-rule"><b>Locked for the Exchange:</b> an Actor uses this same Weapon / Tool on every Action they take in these three cards. A different Weapon / Tool may be declared when the next Exchange begins. No valid tool = Unarmed −1D.</small>${rows}</div></section>`;\n''',
'canonical exchange tool planner')

replace_once('module/conflicts.mjs',
'<b>Choose three Actions</b><span>Select an Action first. Actor and Weapon / Tool controls appear only after that slot is filled.</span>',
'<b>Choose three Actions</b><span>Declare each Actor’s Exchange Weapon / Tool above, then choose the three Actions and assign the acting Ranger.</span>',
'planner instruction')

replace_once('module/conflicts.mjs',
'''  root.querySelectorAll("[data-plan-weapon]").forEach(select => select.addEventListener("change", () => {\n    const side = select.dataset.planSide; if (!["gm","ranger"].includes(side)) return;\n    const plan = [...planFor(side, state)]; const index = Number(select.dataset.planWeapon);\n    const actorId = side === "ranger" ? (plan[index]?.actorId || state.ranger.participantIds[index % state.ranger.participantIds.length]) : state.gm.actorId;\n    const actor = actorById(actorId);\n    plan[index] = { ...(plan[index] ?? {}), actorId, weaponId: validateWeaponId(actor, state, side, select.value) };\n    setDraft(side, state, plan);\n  }));\n''','',
'remove per-action tool handler')

replace_once('module/conflicts.mjs',
'''  root.querySelectorAll("[data-conflict-weapon-actor]").forEach(select => select.addEventListener("change", () => {\n    setWeaponDraft(state, select.dataset.conflictWeaponActor, select.value);\n  }));\n''',
'''  root.querySelectorAll("[data-conflict-weapon-actor]").forEach(select => select.addEventListener("change", () => {\n    const actorId = select.dataset.conflictWeaponActor;\n    const side = state.stage === "gmPlan" ? "gm" : "ranger";\n    const actor = actorById(actorId);\n    setWeaponDraft(state, actorId, validateWeaponId(actor, state, side, select.value));\n    renderConflictWindow(state, { force: true });\n  }));\n''',
'rerender after exchange declaration')

replace_once('module/conflicts.mjs',
'''    const gmActor = actorById(state.gm.actorId);\n    const p = privateState(); p.conflictId = state.id; p.gmPlan = plan.map(x => ({ action: x.action, actorId: state.gm.actorId, weaponId: validateWeaponId(gmActor, state, "gm", x.weaponId ?? weaponDraftFor(gmActor, state, "gm")) })); await setPrivateState(p);\n    lockedPlanCache.set(state.id, { ...(lockedPlanCache.get(state.id) ?? {}), gmPlan: clone(p.gmPlan) });\n    const next = clone(state);\n    next.weaponIds = { ...(next.weaponIds ?? {}), [state.gm.actorId]: validateWeaponId(gmActor, state, "gm", weaponDraftFor(gmActor, state, "gm")) };\n''',
'''    const gmActor = actorById(state.gm.actorId);\n    const gmWeaponId = validateWeaponId(gmActor, state, "gm", weaponDraftFor(gmActor, state, "gm"));\n    const gmWeaponIds = { [state.gm.actorId]: gmWeaponId };\n    const gmActionPlan = plan.map(x => ({ action: x.action, actorId: state.gm.actorId }));\n    const p = privateState(); p.conflictId = state.id; p.gmPlan = applyExchangeToolScope(gmActionPlan, gmWeaponIds); await setPrivateState(p);\n    lockedPlanCache.set(state.id, { ...(lockedPlanCache.get(state.id) ?? {}), gmPlan: clone(p.gmPlan) });\n    const next = clone(state);\n    next.weaponIds = { ...(next.weaponIds ?? {}), ...gmWeaponIds };\n''',
'GM exchange-scoped tool lock')

replace_once('module/conflicts.mjs',
'''  const validatedPlan = plan.map(entry => {\n    const actor = actorById(entry.actorId);\n    return { ...entry, weaponId: validateWeaponId(actor, state, "ranger", entry.weaponId ?? rangerWeaponIds[entry.actorId] ?? "") };\n  });\n''',
'''  const validatedPlan = applyExchangeToolScope(plan, rangerWeaponIds);\n''',
'local Ranger exchange scope')

replace_once('module/conflicts.mjs',
'''  const validatedPlan = plan.map(entry => {\n    const actor = actorById(entry.actorId);\n    return { ...entry, weaponId: validateWeaponId(actor, state, "ranger", entry.weaponId ?? weaponIds[entry.actorId] ?? "") };\n  });\n''',
'''  const validatedPlan = applyExchangeToolScope(plan, weaponIds);\n''',
'socket Ranger exchange scope')

replace_once('module/conflicts.mjs',
'${esc(planWeaponName(actor, state, side, planEntry.weaponId))}',
'${esc(planWeaponName(actor, state, side, state?.weaponIds?.[actor?.id] ?? planEntry.weaponId))}',
'locked plan display')

p = Path('realm-guard.mjs'); p.write_text(p.read_text().replace('1.8.0-qa.3', '1.8.0-qa.4'))
p = Path('system.json'); m = json.loads(p.read_text()); m['version']='1.8.0-qa.4'; m['download']='https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/1.8.0-qa.4/realm-guard.zip'; p.write_text(json.dumps(m, indent=2)+'\n')

p = Path('qa/m5-foundry-filepicker-compat-smoke.mjs'); s = p.read_text(); s = s.replace('assert.match(manifest.version, /^1\\.8\\.0-qa\\.\\d+$/);','assert.match(manifest.version, /^1\\.8\\.0-qa\\.\\d+$/);'); p.write_text(s)

Path('qa/m6-conflict-tool-scope-smoke.mjs').write_text('''import assert from "node:assert/strict";\nimport fs from "node:fs";\nimport { applyExchangeToolScope, exchangeToolScopeIsConsistent } from "../module/core/m6-conflict-tool-scope.mjs";\nconst plan=[{action:"defend",actorId:"dev",weaponId:"gear:sword"},{action:"attack",actorId:"dev",weaponId:"gear:axe"},{action:"maneuver",actorId:"other",weaponId:"gear:sword"}];\nconst scoped=applyExchangeToolScope(plan,{dev:"gear:shield",other:"gear:bow"});\nassert.deepEqual(scoped.map(p=>p.weaponId),["gear:shield","gear:shield","gear:bow"]);\nassert.equal(exchangeToolScopeIsConsistent(scoped,{dev:"gear:shield",other:"gear:bow"}),true);\nassert.equal(exchangeToolScopeIsConsistent(plan,{dev:"gear:shield",other:"gear:bow"}),false);\nconst conflicts=fs.readFileSync("module/conflicts.mjs","utf8");\nassert.ok(conflicts.includes("Exchange Weapon / Tool"));\nassert.ok(conflicts.includes("Locked for the Exchange"));\nassert.ok(conflicts.includes("applyExchangeToolScope(gmActionPlan, gmWeaponIds)"));\nassert.ok(conflicts.includes("const validatedPlan = applyExchangeToolScope(plan, rangerWeaponIds);"));\nassert.ok(conflicts.includes("const validatedPlan = applyExchangeToolScope(plan, weaponIds);"));\nassert.ok(!conflicts.includes("data-plan-weapon="));\nassert.ok(!conflicts.includes("Every planned Action can still choose a different Weapon / Tool"));\nconsole.log("PASS m6-conflict-tool-scope-smoke · one tool per Actor per Exchange");\n''')

Path('TEST_PROTOCOL_v1.8.0-qa.4.md').write_text('''# Realm Guard / Torchbearer v1.8.0-qa.4 QA Protocol\n\n## Scope\nEach Actor declares one Conflict Weapon / Tool for the full three-card Exchange. The declaration is stamped onto every Action assigned to that Actor when the plan locks. A different declaration can be made when the next Exchange begins. M6 qa.3 resolution handoff remains enabled.\n\n## 1 Initial status\n```js\ngame.system.version\ngame.realmGuard.core.m6.getStatus()\ngame.realmGuard.core.m6.handoffStatus()\n```\nExpected `1.8.0-qa.4`, M6 enabled, CORE_M6 resolution authority, LEGACY_MIXED state authority.\n\n## 2 Single Actor\nUse an Actor with Shield and Sword. Choose Shield under Exchange Weapon / Tool, then plan Defend, Attack, Maneuver. Every Action slot must show Shield; no per-Action weapon dropdown may exist. Lock and resolve all three. Every reveal uses Shield; bonuses apply only to actions where Shield grants them.\n\n## 3 Next Exchange\nAfter all three cards, choose Sword in the new Exchange. All Actions for that Actor now use Sword.\n\n## 4 Multi-Ranger\nDeclare different tools per Ranger. Each Ranger keeps their own declaration on every Action they take.\n\n## 5 Custom Tool\nCreate/select a custom Conflict Tool during planning. It becomes that Actor's Exchange declaration.\n\n## 6 M6 regression\nResolve Versus, Independent and Maneuver.\n```js\ngame.realmGuard.core.m6.handoffStatus()\ngame.realmGuard.core.m6.getStatus()\n```\nExpected handoff mismatches 0, errorFallbacks 0, shadow mismatches 0, enabled true.\n\n## 7 Token Actor regression\nUnlinked Token Actor equipment must remain authoritative.\n\n## PASS\nNo per-Action switching; one declaration per Actor per Exchange; new Exchange allows a new declaration; multi-Ranger independence; M6 and Token Actor remain green.\n''')

Path('release/NOTES.md').write_text('''Realm Guard / Torchbearer v1.8.0-qa.4 — Exchange-scoped Conflict Weapon / Tool declarations.\n\nOne Weapon / Tool is now declared per Actor for the entire three-card Exchange. The per-Action selector is removed. The declaration is applied authoritatively when plans lock, including socket-submitted Ranger plans, so stale clients cannot mix weapons across cards. A new Exchange may declare a new tool. Multiple Rangers retain independent declarations.\n\nM6 qa.3 controlled resolution handoff, M5 tool evaluation handoff and Token Actor resolution remain otherwise unchanged.\n\nQA protocol: TEST_PROTOCOL_v1.8.0-qa.4.md\n''')
