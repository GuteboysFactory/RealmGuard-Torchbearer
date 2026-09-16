from pathlib import Path
import json


def replace_once(path, old, new, label):
    p = Path(path)
    s = p.read_text()
    count = s.count(old)
    assert count == 1, f"{label}: expected 1 match, found {count}"
    p.write_text(s.replace(old, new, 1))


# Pure M6 scope helper: one Conflict Weapon / Tool per Actor for the whole three-action Exchange.
Path('module/core/m6-conflict-tool-scope.mjs').write_text('''export function applyExchangeToolScope(plan = [], weaponIds = {}, { defaultActorId = "" } = {}) {\n  return (Array.isArray(plan) ? plan : []).map(entry => {\n    const actorId = String(entry?.actorId ?? defaultActorId ?? "");\n    return {\n      ...entry,\n      actorId,\n      weaponId: String(weaponIds?.[actorId] ?? "")\n    };\n  });\n}\n\nexport function exchangeToolScopeIsConsistent(plan = [], weaponIds = {}, { defaultActorId = "" } = {}) {\n  return (Array.isArray(plan) ? plan : []).every(entry => {\n    const actorId = String(entry?.actorId ?? defaultActorId ?? "");\n    return String(entry?.weaponId ?? "") === String(weaponIds?.[actorId] ?? "");\n  });\n}\n''')

# Wire scope helper into Conflict.
replace_once(
    'module/conflicts.mjs',
    'import { resolveConflictActor, inspectConflictActorResolution } from "./conflict-actor-resolver.mjs";\n',
    'import { resolveConflictActor, inspectConflictActorResolution } from "./conflict-actor-resolver.mjs";\nimport { applyExchangeToolScope } from "./core/m6-conflict-tool-scope.mjs";\n',
    'M6 exchange tool scope import'
)

# Replace per-action editable weapon dropdown with a read-only display of the Actor's exchange declaration.
old = '''function planWeaponSelect(actor, state, side, index, selectedId = "") {\n  const weapons = availableConflictWeapons(actor, state, side);\n  const validSelected = weapons.some(w => w.id === selectedId) ? selectedId : "";\n  return `<label class="rg-plan-weapon"><span>Weapon / Tool</span><select data-plan-weapon="${index}" data-plan-side="${side}" data-rg-help-label="Weapon / Tool"><option value="" ${!validSelected ? "selected" : ""} data-rg-help="No valid Conflict Weapon / Tool is selected. This Action is Unarmed and takes −1D.">Unarmed · −1D</option>${weapons.map(w => `<option value="${w.id}" ${validSelected === w.id ? "selected" : ""} data-rg-help="Use ${esc(w.name)} as this Action's Conflict Weapon / Tool. Its action-specific bonus or penalty is applied when the test resolves.">${esc(w.name)}</option>`).join("")}</select></label>`;\n}\n'''
new = '''function planWeaponSummary(actor, state, side) {\n  const selectedId = weaponDraftFor(actor, state, side);\n  const name = planWeaponName(actor, state, side, selectedId);\n  return `<div class="rg-plan-weapon rg-plan-weapon-locked" data-rg-help="This Actor's Conflict Weapon / Tool is declared once for the entire three-Action Exchange. Change it in the Exchange Weapon / Tool section before locking the cards." data-rg-help-title="Exchange Weapon / Tool"><span>Exchange Weapon / Tool</span><b>${esc(name)}</b></div>`;\n}\n'''
replace_once('module/conflicts.mjs', old, new, 'replace per-action tool dropdown')

replace_once(
    'module/conflicts.mjs',
    '  const defaultWeaponId = planEntry?.weaponId || weaponDraftFor(actor, state, side);\n',
    '  const defaultWeaponId = weaponDraftFor(actor, state, side);\n',
    'editable slot uses exchange declaration'
)
replace_once(
    'module/conflicts.mjs',
    '${actorSelect}${planWeaponSelect(actor, state, side, index, defaultWeaponId)}${custom}',
    '${actorSelect}${planWeaponSummary(actor, state, side)}${custom}',
    'render exchange tool summary in action slot'
)

# Make the existing Actor-level selector the canonical Exchange declaration UI, not an optional default.
old = '''  return `<details class="rg-conflict-weapon-defaults"><summary><i class="fa-solid fa-wand-sparkles"></i> Optional: set quick Weapon / Tool defaults</summary><div class="rg-conflict-weapons"><small class="rg-conflict-weapon-rule">Defaults prefill new Action slots. Every planned Action can still choose a different Weapon / Tool. No valid tool = Unarmed −1D.</small>${rows}</div></details>`;\n'''
new = '''  return `<section class="rg-conflict-weapon-defaults rg-conflict-exchange-tools"><div class="rg-plan-step-head"><div><b><i class="fa-solid fa-wand-sparkles"></i> Exchange Weapon / Tool</b><span>Declare one Weapon / Tool per Actor for this three-Action Exchange.</span></div></div><div class="rg-conflict-weapons"><small class="rg-conflict-weapon-rule"><b>Locked for the Exchange:</b> an Actor uses this same Weapon / Tool on every Action they take in these three cards. A different Weapon / Tool may be declared when the next Exchange begins. No valid tool = Unarmed −1D.</small>${rows}</div></section>`;\n'''
replace_once('module/conflicts.mjs', old, new, 'canonical exchange tool planner')

# Planning copy now describes Actions + Actor assignment; weapon comes only from exchange declaration.
replace_once(
    'module/conflicts.mjs',
    '<b>Choose three Actions</b><span>Select an Action first. Actor and Weapon / Tool controls appear only after that slot is filled.</span>',
    '<b>Choose three Actions</b><span>Declare each Actor’s Exchange Weapon / Tool above, then choose the three Actions and assign the acting Ranger.</span>',
    'planner instruction'
)

# Remove per-action weapon change handler. The canonical actor-level selector rerenders all slot summaries.
old = '''  root.querySelectorAll("[data-plan-weapon]").forEach(select => select.addEventListener("change", () => {\n    const side = select.dataset.planSide; if (!["gm","ranger"].includes(side)) return;\n    const plan = [...planFor(side, state)]; const index = Number(select.dataset.planWeapon);\n    const actorId = side === "ranger" ? (plan[index]?.actorId || state.ranger.participantIds[index % state.ranger.participantIds.length]) : state.gm.actorId;\n    const actor = actorById(actorId);\n    plan[index] = { ...(plan[index] ?? {}), actorId, weaponId: validateWeaponId(actor, state, side, select.value) };\n    setDraft(side, state, plan);\n  }));\n'''
replace_once('module/conflicts.mjs', old, '', 'remove per-action tool handler')

replace_once(
    'module/conflicts.mjs',
    '''  root.querySelectorAll("[data-conflict-weapon-actor]").forEach(select => select.addEventListener("change", () => {\n    setWeaponDraft(state, select.dataset.conflictWeaponActor, select.value);\n  }));\n''',
    '''  root.querySelectorAll("[data-conflict-weapon-actor]").forEach(select => select.addEventListener("change", () => {\n    const actorId = select.dataset.conflictWeaponActor;\n    const side = state.stage === "gmPlan" ? "gm" : "ranger";\n    const actor = actorById(actorId);\n    setWeaponDraft(state, actorId, validateWeaponId(actor, state, side, select.value));\n    renderConflictWindow(state, { force: true });\n  }));\n''',
    'rerender after exchange tool declaration'
)

# Lock-plan is authoritative: ignore any stale/per-action weaponId and stamp the Actor's exchange declaration onto every card.
old = '''    const gmActor = actorById(state.gm.actorId);\n    const p = privateState(); p.conflictId = state.id; p.gmPlan = plan.map(x => ({ action: x.action, actorId: state.gm.actorId, weaponId: validateWeaponId(gmActor, state, "gm", x.weaponId ?? weaponDraftFor(gmActor, state, "gm")) })); await setPrivateState(p);\n    lockedPlanCache.set(state.id, { ...(lockedPlanCache.get(state.id) ?? {}), gmPlan: clone(p.gmPlan) });\n    const next = clone(state);\n    next.weaponIds = { ...(next.weaponIds ?? {}), [state.gm.actorId]: validateWeaponId(gmActor, state, "gm", weaponDraftFor(gmActor, state, "gm")) };\n'''
new = '''    const gmActor = actorById(state.gm.actorId);\n    const gmWeaponId = validateWeaponId(gmActor, state, "gm", weaponDraftFor(gmActor, state, "gm"));\n    const gmWeaponIds = { [state.gm.actorId]: gmWeaponId };\n    const gmActionPlan = plan.map(x => ({ action: x.action, actorId: state.gm.actorId }));\n    const p = privateState(); p.conflictId = state.id; p.gmPlan = applyExchangeToolScope(gmActionPlan, gmWeaponIds); await setPrivateState(p);\n    lockedPlanCache.set(state.id, { ...(lockedPlanCache.get(state.id) ?? {}), gmPlan: clone(p.gmPlan) });\n    const next = clone(state);\n    next.weaponIds = { ...(next.weaponIds ?? {}), ...gmWeaponIds };\n'''
replace_once('module/conflicts.mjs', old, new, 'GM exchange-scoped tool lock')

old = '''  const validatedPlan = plan.map(entry => {\n    const actor = actorById(entry.actorId);\n    return { ...entry, weaponId: validateWeaponId(actor, state, "ranger", entry.weaponId ?? rangerWeaponIds[entry.actorId] ?? "") };\n  });\n'''
new = '''  const validatedPlan = applyExchangeToolScope(plan, rangerWeaponIds);\n'''
# Occurs twice: local lock and GM socket handler. Replace both deliberately.
p = Path('module/conflicts.mjs')
s = p.read_text()
count = s.count(old)
assert count == 2, f'ranger exchange scope: expected 2 matches, found {count}'
p.write_text(s.replace(old, new, 2))

# Card creation/actor reassignment may cache weaponId for visual continuity, but it is never authoritative at lock.
# Update locked own-plan view to show the declared exchange weapon, guaranteeing UI matches runtime scope.
replace_once(
    'module/conflicts.mjs',
    '${esc(planWeaponName(actor, state, side, planEntry.weaponId))}',
    '${esc(planWeaponName(actor, state, side, state?.weaponIds?.[actor?.id] ?? planEntry.weaponId))}',
    'locked plan exchange tool display'
)

# Version bump.
p = Path('realm-guard.mjs')
s = p.read_text().replace('1.8.0-qa.3', '1.8.0-qa.4')
p.write_text(s)
p = Path('system.json')
m = json.loads(p.read_text())
m['version'] = '1.8.0-qa.4'
m['download'] = 'https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/1.8.0-qa.4/realm-guard.zip'
p.write_text(json.dumps(m, indent=2) + '\n')

# Dedicated pure rule smoke + static integration checks.
Path('qa/m6-conflict-tool-scope-smoke.mjs').write_text('''import assert from "node:assert/strict";\nimport fs from "node:fs";\nimport { applyExchangeToolScope, exchangeToolScopeIsConsistent } from "../module/core/m6-conflict-tool-scope.mjs";\n\nconst plan = [\n  { action: "defend", actorId: "dev", weaponId: "gear:sword" },\n  { action: "attack", actorId: "dev", weaponId: "gear:axe" },\n  { action: "maneuver", actorId: "other", weaponId: "gear:sword" }\n];\nconst scoped = applyExchangeToolScope(plan, { dev: "gear:shield", other: "gear:bow" });\nassert.deepEqual(scoped.map(p => p.weaponId), ["gear:shield", "gear:shield", "gear:bow"]);\nassert.equal(exchangeToolScopeIsConsistent(scoped, { dev: "gear:shield", other: "gear:bow" }), true);\nassert.equal(exchangeToolScopeIsConsistent(plan, { dev: "gear:shield", other: "gear:bow" }), false);\n\nconst conflicts = fs.readFileSync("module/conflicts.mjs", "utf8");\nassert.ok(conflicts.includes("Exchange Weapon / Tool"));\nassert.ok(conflicts.includes("Locked for the Exchange"));\nassert.ok(conflicts.includes("applyExchangeToolScope(gmActionPlan, gmWeaponIds)"));\nassert.ok(conflicts.includes("const validatedPlan = applyExchangeToolScope(plan, rangerWeaponIds);"));\nassert.ok(!conflicts.includes("data-plan-weapon="));\nassert.ok(!conflicts.includes("Every planned Action can still choose a different Weapon / Tool"));\nconsole.log("PASS m6-conflict-tool-scope-smoke · one tool per Actor per Exchange");\n''')

Path('TEST_PROTOCOL_v1.8.0-qa.4.md').write_text('''# Realm Guard / Torchbearer v1.8.0-qa.4 QA Protocol\n\n## Scope\nCorrect Conflict Weapon / Tool declaration to Exchange scope. Each Actor declares one Weapon / Tool for the full three-card Exchange. The same declaration is stamped onto every planned Action assigned to that Actor. A new declaration may be made when the next Exchange begins. M6 qa.3 controlled resolution live handoff remains enabled and otherwise unchanged.\n\n## 1. Initial status\n```js\ngame.system.version\ngame.realmGuard.core.m6.getStatus()\ngame.realmGuard.core.m6.handoffStatus()\n```\nExpected `1.8.0-qa.4`; M6 handoff enabled; CORE_M6 resolution authority; LEGACY_MIXED conflict state authority; no rollback reason.\n\n## 2. Single-Actor exchange scope\nStart/continue a Fight with an Actor holding Shield and Sword. In planning, choose Shield in `Exchange Weapon / Tool`, then choose all three Actions (for example Defend, Attack, Maneuver).\nExpected: every Action slot displays Shield; there is no per-Action Weapon / Tool dropdown. Lock the three cards.\nResolve/reveal all three Actions. Expected every revealed Action uses Shield. Shield grants its bonus only where its action-specific rule applies; selecting Attack or Maneuver does not silently swap to Sword.\n\n## 3. Next Exchange may change\nFinish all three cards so the next Exchange begins. Choose Sword in `Exchange Weapon / Tool`.\nExpected all cards assigned to that Actor in the new Exchange display/use Sword. Previous Exchange remains recorded with Shield.\n\n## 4. Multi-Ranger scope\nWith at least two Rangers, declare different tools for each Actor (for example Dev = Shield, Brathazmus = Bow). Assign Actions across them.\nExpected each Actor keeps their own declared tool on every Action they take; one Ranger's selection never changes another Ranger's tool.\n\n## 5. Custom tool\nCreate/select a custom Conflict Tool for one Actor during planning. Expected it becomes that Actor's Exchange declaration and is used for every Action they take in that Exchange.\n\n## 6. M6 qa.3 regression\nResolve normal Versus, Independent and Maneuver cases.\n```js\ngame.realmGuard.core.m6.handoffStatus()\ngame.realmGuard.core.m6.getStatus()\n```\nExpected handoff telemetry mismatches 0, errorFallbacks 0, shadow mismatches 0, enabled true.\n\n## 7. Token Actor regression\nUse an unlinked Token Actor whose held equipment differs from the world Actor. Expected Exchange selector and resolution use the Token Actor equipment.\n\n## PASS\nNo per-Action weapon switching exists; one declaration per Actor applies to all three cards in an Exchange; a new Exchange permits a new declaration; multi-Ranger declarations remain independent; M6 qa.3 and Token Actor behavior remain green.\n''')

Path('release/NOTES.md').write_text('''Realm Guard / Torchbearer v1.8.0-qa.4 — Exchange-scoped Conflict Weapon / Tool declarations.\n\nConflict planning previously allowed a separate weapon/tool on every Action card. That contradicted the intended three-card Conflict declaration scope. qa.4 makes the existing Actor-level selector authoritative: one Weapon / Tool per Actor for the entire Exchange, stamped onto every Action assigned to that Actor when the plan locks. The next Exchange may declare a different tool. Multiple Rangers can each keep their own declaration.\n\nThe per-Action Weapon / Tool dropdown is removed and replaced by a read-only Exchange Weapon / Tool summary in each Action slot. Socket-side GM validation also reapplies Actor-level declarations, so stale or older clients cannot submit mixed per-Action weapon IDs.\n\nM6 qa.3 controlled resolution result handoff, M5 tool evaluation handoff, and Token Actor resolution remain otherwise unchanged.\n\nQA protocol: TEST_PROTOCOL_v1.8.0-qa.4.md\n''')
