# M11.1 — TB2E Live Authority Framework

M10D Final Foundation Audit is closed. M11 introduces controlled domain-by-domain live integration.

## Authority states

- **OFF** — no TB2E runtime authority for the domain.
- **SHADOW** — source-bounded TB2E calculation is available but cannot mutate live game state.
- **DUAL_RUN** — future comparison state in which current live authority remains authoritative while TB2E runs in parallel.
- **LIVE** — future explicit domain authority. M11.1 authorizes no domain to enter this state.

## M11.1 starting registry

All 14 source-supportable domains start in **SHADOW**.
Traits, Armor, Conflict, Magic / invocations and Narrative adjudication start in **OFF**.

SOURCE_BLOCKED and MANUAL domains cannot be moved above OFF by the M11.1 framework.

## Safety controls

- Global TB2E kill switch starts **engaged**.
- M11.1 does not authorize releasing it.
- No domain has any live write permission.
- No persistent authority mode mutation is exposed.
- No Actor, Item, Journal or Setting writes are performed.
- Full TB2E profile activation remains blocked.
- Character Creation commit remains blocked.

## Per-domain write contract

The framework defines explicit operation categories:

ACTOR_UPDATE, ITEM_UPDATE, JOURNAL_WRITE, SETTING_WRITE, DOCUMENT_CREATE, DOCUMENT_DELETE, CHAT_CREATE and SOCKET_BROADCAST.

Every permission is false in M11.1. Future live milestones must explicitly grant the minimum operations required by a specific domain.

## Dual-run comparison

M11.1 includes a memory-only comparison ring buffer. It can compare legacy/current results with TB2E shadow results and record MATCH or DIVERGENCE without persisting anything to World data.

The buffer is QA instrumentation only. It is not a rules authority and is cleared on reload.

## Planned integration waves

1. Wises
2. Help + Tests
3. Nature + Abilities / Skills
4. Fate / Persona / Resources + Conditions
5. Recovery + Advancement
6. Inventory + Session
7. Circles + Might / Precedence
8. Character Creation

Traits, Armor, Conflict and Magic remain source-blocked. Narrative adjudication remains manual.

## Next milestone

**M11.2 — Wises First Live Domain**.

M11.2 must establish an explicit Wises mutation contract, DUAL_RUN parity gate, rollback/regression gate and Foundry QA before any Wises live authority can be enabled.
