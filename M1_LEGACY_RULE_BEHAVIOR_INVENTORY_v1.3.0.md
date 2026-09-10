# M1 LEGACY RULE BEHAVIOR INVENTORY — Realm Guard / Torchbearer v1.3.0

**Phase:** CORE M1 — Rules Profile Infrastructure & Rules Registry  
**Baseline:** v1.2.0 GOLD  
**Active compatibility profile:** `realm-guard-legacy-mixed` v1  
**Internal Foundry system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED

## Purpose

M1 gives the current published Realm Guard / Torchbearer behavior an explicit Rules Profile identity before any rule subsystem is moved into the new CORE engine.

This document does **not** claim that every current behavior is Strict Realm Guard. It records the compatibility contract that must remain stable while the backend is refactored.

## Compatibility contract

Existing worlds remain on:

`realm-guard-legacy-mixed`

The profile is deliberately Mixed because the published project includes Realm Guard rules, inherited/selected Mouse Guard behavior, Torchbearer-inspired expansions and Foundry-specific project features.

Strict Realm Guard is not activated in M1.

## M1 rule inventory

| Rule / domain | Legacy Mixed active behavior | Classification | M1 automation status |
|---|---|---|---|
| Tests | Current v1.2.0 published roll behavior | Legacy compatibility | Existing engine remains active |
| Abilities / Skills | Current v1.2.0 Actor/Skill behavior | Legacy compatibility | Existing engine remains active |
| Nature | Current Realm Guard project behavior | Legacy compatibility | Existing engine remains active |
| Traits | Current published Trait behavior | Legacy compatibility | Existing engine remains active |
| Wises | **Unrated** | Mixed / legacy project rule | Existing engine remains active |
| Help / Teamwork | Current published Help/Teamwork workflow | Legacy compatibility | Existing engine remains active |
| Fate / Persona | Current published spend/Open-6 workflow | Legacy compatibility | Existing engine remains active |
| Conditions / Recovery | Current Realm Guard project behavior | Legacy compatibility | Existing engine remains active |
| Inventory | **Structured** paper-doll / placement / containers | Mixed / Foundry expansion | Existing engine remains active |
| Conflict | Current published Conflict engine | Legacy compatibility | Existing engine remains active |
| Turn Manager / Checks | Current published workflow | Legacy compatibility | Existing engine remains active |
| End Session | Current published workflow | Legacy compatibility | Existing engine remains active |
| Circles | Current published workflow | Legacy compatibility | Existing engine remains active |
| Character Creation | Current Create Ranger / Recruitment workflow | Legacy compatibility | Existing engine remains active |
| Levels / Talents | **Enabled** | Mixed / Foundry expansion | Existing engine remains active |
| Tokens of Power | **Enabled** | Realm Guard / project feature | Existing engine remains active |

## Important strict-profile differences already known

These are **not changed in M1**. They are recorded so future profile work does not silently reinterpret existing campaigns.

- Strict Realm Guard will use the audited Realm Guard v1.6 → Mouse Guard 1E precedence chain.
- Strict Realm Guard will use rated Wises rather than the Legacy Mixed unrated model.
- Strict Realm Guard will not automatically inherit the current TB-inspired Level/Talent progression.
- Strict Realm Guard inventory policy can differ from Legacy Mixed structured inventory.
- Conflict Tool and other strict-rule corrections remain deferred until their relevant CORE/Profile phases.

## Technical M1 objects

M1 introduces:

- `RulesProfile`
- `ProfileResolver`
- immutable `ResolvedRulesProfile`
- `RulesRegistry`
- rule provenance entries
- deterministic `rulesSnapshotHash`
- `createProfileSnapshot()`
- Foundry-facing Rules Profile service
- GM-only Active Rules Registry diagnostic window
- runtime API at `game.realmGuard.core`

## Runtime ownership in M1

M1 is intentionally observational/descriptive.

The Rules Profile and Registry describe the active compatibility behavior, but the existing v1.2.0 gameplay implementations still execute rolls, Nature, Conditions, Conflict, progression, inventory, Recruitment, session flow and other mechanics.

Rule ownership migrates later in M2+.

## Non-destructive guarantee

M1 adds no Actor or Item schema conversion and does not convert existing campaign rules.

M0 world metadata remains the source for active profile id/version.

The expected active profile is:

`realm-guard-legacy-mixed` v1

## M1 success condition

M1 is successful when the system can answer:

> What Rules Profile is active, what representative rules does it declare, and where did each rule choice come from?

while representative gameplay remains equivalent to v1.2.0 GOLD.
