# MG-Family CORE M3 — Custom Content Compatibility Requirement

**Project:** Realm Guard / Torchbearer  
**Phase:** M3 Unified Test Engine  
**Status:** LOCKED REQUIREMENT  
**Live authority during M3:** Legacy Mixed  
**CORE live takeover:** OFF

## Purpose

Realm Guard / Torchbearer must preserve the existing Legacy Mixed workflow where GMs and players can create their own Skills, Traits, Wises, Talents, Tokens of Power, Conditions and Gear. CORE must treat supported custom content as first-class system data rather than requiring canonical/default item names or IDs.

The architecture must remain **type- and data-driven, not name-driven**.

Canonical content may provide defaults and reference data, but CORE mechanics must not depend on hard-coded names such as `Clever`, `Fighter`, or any specific library UUID unless a rule explicitly requires that exact named source.

## M3 completion requirement

M3 may not be promoted to VERIFIED until the custom-content compatibility matrix below has been exercised in live QA.

### Custom Skill
- A GM-created/custom Role/Skill with Rating > 0 can make an ordinary test through the normal Legacy UI.
- Its real Legacy result is shadow-replayed through CORE.
- Pool, target, successes, outcome and margin must MATCH.
- Versus mode must remain available where the existing rules permit it.
- Advancement remains Legacy-authoritative during M3.

### Custom Trait
- A custom Trait must be visible to the existing Trait workflow.
- When used through a mechanically supported structured Trait path, the M2 `traits.selected-use` provider must observe it without requiring a canonical Trait ID/name.
- Session/use state remains Legacy-authoritative while M2/M3 are shadow-only.

### Custom Wise
- A custom Wise must participate in the existing Wise selection/reroll workflow.
- M2 `wises.selected-reroll` must observe the supported use without requiring a canonical Wise ID/name.
- Free-text Wise names remain valid content.

### Custom Talent
- A custom Talent using an existing structured supported effect mode must be eligible for the M2 Talent provider exactly like a library/default Talent.
- Applicability is determined from item type + structured fields, not whether the Talent came from default content.
- A purely narrative/manual Talent remains valid content but does not receive invented automatic mechanics.

### Custom Token of Power
- A custom Token of Power using supported structured link/effect data must be handled by `tokens-of-power.selected-use` without canonical-ID dependence.
- Manual/specific-use Tokens remain table-adjudicated where their written effect is not represented by a structured CORE effect type.

### Custom Condition
- Existing custom Conditions must remain valid and non-destructive through M3.
- Full custom Condition service parity is a blocking carry-forward requirement for M4, where Conditions become a dedicated CORE subsystem.
- M4 must not assume only default Condition names exist.

### Custom Gear
- Existing custom Gear must remain valid and non-destructive through M3.
- Full custom Gear/Inventory parity is a blocking carry-forward requirement for M5.
- M5 must be data-driven and must not restrict equipment behavior to starter-library item names.

### Custom Roll
- Custom Roll is the dedicated `custom` TestContext work item in M3.
- Free Custom Rolls must remain deliberately separate from Skill/Ability advancement unless explicitly linked by the existing gameplay workflow.
- CORE parity must verify the real prepared pool, target, successes, outcome and margin without taking over live execution.

## Free-text boundary

CORE must not attempt to infer arbitrary new mechanics from prose.

Example: a custom Talent whose description says that the character gains two extra actions under a special narrative condition is valid content, but it remains **manual** until that behavior is represented by an explicit structured effect type/provider.

This is intentional. Custom content is first-class; arbitrary natural-language rule interpretation is not part of the deterministic CORE engine.

## Planned M3 QA sequence

Following the current context-coverage work:

- `v1.5.0-qa.8` — Recovery parity
- `v1.5.0-qa.9` — Custom Roll parity
- `v1.5.0-qa.10` — Custom Content Compatibility matrix
  - Custom Skill
  - Custom Trait
  - Custom Wise
  - Custom Talent
  - Custom Token of Power
  - canonical/default-name independence
  - reload/persistence regression
- `v1.5.0-qa.11` — Final M3 promotion matrix

Version numbering may move if a blocking hotfix is required, but the gates themselves remain mandatory.

## Cross-phase carry-forward

The same custom-content principle remains mandatory after M3:

- **M4:** custom Skills advancement + custom Conditions
- **M5:** custom Gear / Inventory and supported custom Conflict Tools
- **M6:** conflict adapters must consume structured custom Skill/Tool data without canonical-name dependence
- later services must preserve the same type/data-driven contract

## M3 promotion gate addition

Before `M3 = VERIFIED`:

1. No supported custom item type is rejected solely because its name/ID is non-canonical.
2. Supported structured custom effects behave identically to equivalent default-content effects in shadow comparison.
3. Manual/free-text custom effects remain safe and explicitly manual rather than receiving guessed automation.
4. Existing Legacy Mixed custom items survive reload and CORE initialization without migration damage.
5. Legacy Mixed remains the sole live authority throughout the M3 verification line.
