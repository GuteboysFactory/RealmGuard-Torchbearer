# MG-Family CORE M0 — Migration & Rollback Plan

**Build:** v1.2.0 QA  
**Phase:** M0  
**Migration id:** `m0-core-baseline-v1`  
**Target schema:** `1`  
**Architecture metadata:** `0.1`  
**Compatibility profile metadata:** `realm-guard-legacy-mixed` v1

## Migration contract

M0 is intentionally metadata-only.

The migration may write only Realm Guard **world settings** used for schema/profile bookkeeping.

It must not update:

```text
Actors
Embedded Items
World Items
Scenes
Journals
RollTables
Playlists
Folders
Compendium documents
Active game-rule fields
```

## Authority

Only one active GM client performs M0 world metadata writes.

The deterministic authority is the first active GM by User id. Other clients register the settings but do not run the migration.

## Idempotency

The migration is identified by:

```text
m0-core-baseline-v1
```

`migrationHistory` is de-duplicated by migration id.

If schema/profile metadata and the migration-history entry are already current, reload performs no migration write except clearing a stale recorded migration error if necessary.

## Commit order

M0 writes:

1. architecture version
2. Legacy Mixed profile id
3. Legacy Mixed profile version
4. deduplicated migration-history entry
5. schema version **last**
6. clears last migration error

Schema version is written last so an interrupted migration can safely retry.

## Failure behavior

On migration failure:

- error is logged to console;
- `migrationLastError` records a bounded diagnostic string when possible;
- schema version is not intentionally advanced past the failed step;
- no Actor/Item rollback is required because M0 performs no Actor/Item mutation.

## Required backup before live QA

Before installing M0 into a campaign world:

1. stop normal play;
2. create a Foundry World backup/export using the normal server/host backup method;
3. record current system version;
4. retain the known-good `realm-guard-foundry-v1.0.8.44.zip` package;
5. if practical, test M0 first on a copied world.

## Rollback procedure

If M0 causes a blocking problem:

1. stop the world;
2. restore/install v1.0.8.44;
3. restore the pre-M0 World backup if the world cannot open cleanly;
4. do not manually delete Actor/Item fields to troubleshoot M0;
5. preserve console output and the M0 metadata values for diagnosis.

Because M0 only adds hidden world settings, a normal package rollback should not require data conversion. A full World restore remains the safest rollback for any unexpected host/database issue.

## Promotion gate

M0 is promotable only if:

- metadata is created once;
- `realm-guard` package id remains unchanged;
- existing world content is unchanged;
- existing gameplay regression remains equivalent to v1.0.8.44;
- World Health Audit shows Schema 1 / Architecture 0.1 / Legacy Mixed metadata;
- reload and multi-client startup do not duplicate migration history;
- no blocking console error appears.
