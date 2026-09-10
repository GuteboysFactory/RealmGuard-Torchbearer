# STATIC QA — Realm Guard / Torchbearer v1.3.0

**Build:** v1.3.0 QA — CORE M1 Rules Profile Infrastructure & Rules Registry  
**Foundry target:** 13.351  
**GOLD baseline:** v1.2.0  
**Internal system id:** `realm-guard`  
**Intended gameplay change:** NONE

## Pre-release result

**STATIC SOURCE REVIEW: PASS — release workflow validation required before live Foundry QA.**

## 1. Scope discipline

M1 introduces descriptive/profile infrastructure only:

- `module/core/rules-profile.mjs`
- `module/core/rules-registry.mjs`
- `module/profiles/realm-guard-legacy-mixed.mjs`
- `module/rules-profile-service.mjs`
- GM Rules Registry diagnostic tool
- `game.realmGuard.core` read/diagnostic API
- headless M1 profile smoke test

No existing roll, Nature, Condition, Conflict, inventory, Recruitment, session, advancement or Actor/Item data-model implementation is replaced in M1.

## 2. Package identity

- PASS — internal Foundry system id remains `realm-guard`.
- PASS — M1 QA uses version `1.3.0-qa.1`.
- PASS — Foundry target remains v13.351.
- PASS — QA manifest uses the repository `main/system.json` channel.

## 3. RulesProfile / ProfileResolver

Source review confirms:

- profiles require id, integer version and display name;
- declarative domain data is copied/frozen;
- parent composition is supported without JavaScript class inheritance;
- missing parents and inheritance cycles fail explicitly;
- resolved profiles are immutable;
- registry entries are composed by rule id;
- deterministic snapshot hash is generated from stable sorted profile data.

## 4. RulesRegistry

Source review confirms:

- Registry consumes a resolved profile;
- entries preserve rule id, domain, title, active value, provider, source, classification, automation and override reason;
- lookup by id and domain is supported;
- Registry has no Actor/Item/world mutation path.

## 5. Legacy Mixed compatibility profile

The first operational profile is exactly:

`realm-guard-legacy-mixed` v1

Representative explicit compatibility declarations include:

- `WISE.MODE = UNRATED`
- `INVENTORY.POLICY = STRUCTURED`
- `PROGRESSION.LEVELS_TALENTS = ENABLED`
- current published Test/Nature/Trait/Help/Condition/Conflict/Session/Circles/Creation behavior remains delegated to the existing v1.2.0 engines.

Strict Realm Guard is not activated.

## 6. Foundry service boundary

`module/rules-profile-service.mjs` is the Foundry-facing adapter for M1.

It:

- reads the M0 active profile metadata;
- resolves the declarative profile;
- constructs the Rules Registry;
- exposes a snapshot and diagnostic API;
- registers a GM-only Rules Registry window.

It does not modify Actor/Item rule state.

## 7. M0 preservation

M1 does not change:

- schema target `1`;
- architecture metadata `0.1`;
- profile id metadata `realm-guard-legacy-mixed`;
- profile metadata version `1`;
- M0 migration id `m0-core-baseline-v1`.

No new data migration is introduced for M1.

## 8. Automated headless gate

`qa/m1-profile-smoke.mjs` is wired into the GitHub release workflow.

The release must fail unless the smoke confirms:

- Legacy Mixed resolves;
- Wise mode is unrated;
- inventory policy is structured;
- Levels/Talents are enabled;
- Registry contains the expected M1 entries;
- snapshot hash is deterministic;
- resolved profile and snapshot are frozen.

## 9. Static limits

Static/source QA cannot prove:

- Foundry DialogV2 rendering;
- GM Dock rendering;
- real client permissions;
- multiplayer behavior;
- gameplay equivalence;
- campaign data equivalence after install.

These require `TEST_PROTOCOL_v1.3.0.md`.

## Verdict

**PASS for release-workflow validation.**

If GitHub release validation succeeds, proceed to live Foundry M1 QA on a backed-up/copied v1.2.0 GOLD World.
