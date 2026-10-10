# TEST PROTOCOL — v1.13.0-qa.22

## M10D.18 P2.2 — Armor Shadow Adapter · Foundry VTT v13.351

CORE sources: Dungeoneer's Handbook pp. 150–151, 156–159; Scholar's Guide p. 65. Test `game.realmGuard.core.m10d.armor` only via the console; calls are pure, read-only. No live armor changes are implemented. Use a QA world.

### Gate A — Installation / Safety
- Version: `1.13.0-qa.22`, manifest updated only after ZIP/release asset verification.
- Existing Ranger/NPC sheets, Roll Dialog and GM Dock open; no new blocking console errors.
- `const m=game.realmGuard.core.m10d; m.getStatus().armorShadowReady === true`.
- `m.armor.getStatus().adapterReady === true` and `liveApplication === false`.
- `m.getStatus().p2ImplementedShadowAdapterDomains` = `["traits","armor"]`; pending = `["conflict","magic"]`.
- Legacy Mixed live authority, M11 paused, global kill switch ENGAGED, stable `v1.12.0`.

### Gate B — Ordinary Armor Mechanics
Run direct console calls `const a=game.realmGuard.core.m10d.armor; a.absorptionPlan({...})`.
- B1 Leather: 1d6=4–6 => absorb 1; 1–3 => absorb 0; without d6 => unresolved pending; already used this fight => blocked.
- B2 Chain: absorb 1 normally. Wear on d6 1–3; intact on 4–6. Mace/warhammer bypass absorption **but still require wear check**.
- B3 Plate: absorb 1, wear d6 1–2 normally; wear 1–3 vs mace/warhammer.
- B4 Helmet absorbs one point once, then GM determines whether lost/damaged/destroyed.
- B5 Shield +2D Defend when equipped, may absorb one point once and is destroyed.

### Gate C — Eligibility / Weapon Exceptions
- C1 Leather bypass: Bow, Crossbow, Spear => no absorption; other weapon without bypass remains eligible.
- C2 Chain bypass: Mace and Warhammer => no absorption, but wear roll still required.
- C3 Only Kill, Capture, Drive Off conflicts; only directly targeted leading character; only Attack/Feint damage.
- C4 Overflow hits, 0 incoming damage, already damaged armor, already-used disposable armor => no absorption.
- C5 Invalid d6, invalid armor type, invalid negative incoming damage => rejected, no roll/writes.

### Gate D — Safety / Regression
- D1 `getStatus().liveEnabled/liveApplication/activationAllowed/actorMutationAllowed/itemMutationAllowed` all false.
- D2 Read-only plans expose `writesPlanned:0`, `rollExecuted:false`, `hitPointWrite:false`, `equipmentWrite:false`; no Actor, Item, Journal, setting or HP changes.
- D3 Traits P2.1 benefit/against still pass; P1 creation/conditions/help/nature regression remains.
- D4 Open Ranger and NPC sheets, run an ordinary roll, open Conflict tools; reload world and confirm character, equipment and Checks persist unchanged.
- D5 QA Github Release + ZIP and QA manifest report qa.22, Stable remains 1.12.0. No live profile promotion.

Do not close P2.2 until all four human Foundry gates PASS. CI success is necessary but not sufficient. Conflict and Magic remain pending, M11 blocked.
