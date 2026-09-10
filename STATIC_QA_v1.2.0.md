# STATIC QA — Realm Guard / Torchbearer v1.2.0

**Build:** v1.2.0 QA — CORE M0 Safety, Schema & Migration Baseline  
**Foundry target:** 13.351  
**GOLD/public baseline:** v1.0.8.44  
**Internal system id:** `realm-guard`  
**Intended gameplay change:** NONE

## Result

**STATIC QA: PASS — ready for live M0 protocol.**

Live Foundry QA is still required before promotion.

## 1. Baseline discipline

- PASS — M0 worktree was created from the v1.0.8.44 package.
- PASS — v1.0.8.44 has a completed PASS live protocol in the project history.
- PASS — the unpromoted v1.1.0 Circles & Contacts branch was not used as the M0 code baseline because its live protocol remained uncompleted.
- PASS — v1.1.0 source/package is preserved separately for later M8 reuse/reference.

## 2. Package / manifest

- PASS — `system.json` parses.
- PASS — internal id remains `realm-guard`.
- PASS — display title remains `Realm Guard / Torchbearer`.
- PASS — version = `1.2.0`.
- PASS — compatibility remains Foundry 13 / verified `13.351`.
- PASS — download filename points to `realm-guard-foundry-v1.2.0.zip`.

## 3. JavaScript / imports

- PASS — **36 / 36 `.mjs` files** pass `node --check`.
- PASS — **91** local ES-module import references checked.
- PASS — **0** missing local import targets.
- PASS — new `module/core-baseline.mjs` imports cleanly from `realm-guard.mjs`.

## 4. M0 migration module

Static/source audit confirms:

- registers exactly six hidden world metadata settings;
- schema target = `1`;
- CORE architecture metadata = `0.1`;
- compatibility profile id = `realm-guard-legacy-mixed`;
- compatibility profile version = `1`;
- migration id = `m0-core-baseline-v1`;
- only an active deterministic GM authority performs migration writes;
- history is de-duplicated by migration id;
- schema version is written last;
- failure attempts to record `migrationLastError`;
- migration code contains no Actor/Item/Scene/Journal/Compendium mutation path.

## 5. Headless migration smoke

A mocked Foundry settings harness executed the actual M0 module.

PASS:

1. first run applied metadata;
2. resulting Schema = 1;
3. Architecture = 0.1;
4. Profile = `realm-guard-legacy-mixed` v1;
5. migration history contained exactly one M0 entry;
6. second run did not add another history entry;
7. non-authoritative second GM did not perform writes.

**Headless result: PASS.**

## 6. Data-model preservation audit

Byte comparison against v1.0.8.44 baseline:

- PASS — `module/data-models.mjs` unchanged.
- PASS — `module/documents.mjs` unchanged.
- PASS — `module/conditions.mjs` unchanged.
- PASS — `module/conflicts.mjs` unchanged.
- PASS — `module/recruitment.mjs` unchanged.
- PASS — `sheets/actor-sheet.mjs` unchanged.

Therefore M0 does not alter Actor/Item schemas or the primary gameplay implementations in static source.

## 7. Intended runtime code delta

Runtime changes are bounded to:

1. `module/core-baseline.mjs` — new metadata/migration service;
2. `realm-guard.mjs` — installs M0 metadata service and makes initialization version log dynamic;
3. `module/system-audit.mjs` — displays/verifies M0 metadata and removes stale old hard-coded version warning;
4. `system.json` — QA version/download metadata.

Other deltas are documentation only.

## 8. World Health Audit

Static wiring confirms:

- M0 Schema/Profile/Architecture metadata is included in audit result;
- missing/incorrect M0 metadata can produce audit findings;
- recorded migration errors produce a blocking audit finding;
- previous Skills, Conditions, Resources, Inventory and Starter Library audit code remains present;
- the stale hard-coded `systemVersion !== 1.0.4` warning has been removed;
- audit display identifies CORE M0 and explains that Legacy Mixed metadata does not convert rules.

## 9. Documentation artifacts

PASS — package includes:

- `M0_BASELINE_INVENTORY_v1.2.0.md`
- `M0_MIGRATION_AND_ROLLBACK_PLAN_v1.2.0.md`
- `TEST_PROTOCOL_v1.2.0.md`
- `STATIC_QA_v1.2.0.md`
- `docs/core/M0_SCHEMA_SNAPSHOT_v1.2.0.json`
- canonical CORE Rule Audit v0.2
- canonical CORE Architecture v0.1
- canonical CORE Implementation Roadmap v0.1

## 10. Static limits

Static QA cannot prove:

- real Foundry settings persistence;
- two-GM startup timing;
- database write behavior on a real host;
- actual campaign data equivalence after install;
- World Health Audit rendering;
- gameplay/runtime regression.

Those are mandatory in `TEST_PROTOCOL_v1.2.0.md`.

## Static verdict

**PASS.** Proceed to live M0 QA only on a backed-up/copied World first.
