# M10D.17 — Torchbearer 2E Controlled Live Integration Plan

**Planning baseline:** v1.13.0-qa.17  
**Planning date:** 2026-10-14  
**Foundry target:** 13.351  
**Current status:** QA CANDIDATE IMPLEMENTED — Foundry handoff verification pending. The route remains QA-only and does not grant live rule authority, profile activation, Actor/Item/Journal/Setting writes, resource spending, or Character Creation commit.

## 1. Entry evidence

On 2026-10-14, the user installed qa.17 in Foundry and ran:

```js
game.realmGuard.core.m10d.finalAudit()
```

The returned audit reported:

- `auditComplete=true`, `domainCount=19`, `mappingIntegrity=true`
- `adapterGapDomains=[]` and `unexpectedReadyDomains=[]`
- Classification: 1 VERIFIED, 13 BOUNDED_PARTIAL, 4 SOURCE_BLOCKED, 1 MANUAL
- `nextPhase=CONTROLLED_TB2E_LIVE_INTEGRATION_PLANNING`
- `liveActivationAuthorized=false`, `profileSwitchAuthorized=false`, `creationCommitAuthorized=false`

This is the completed foundation audit. It does not prove live parity or authorize activation.

## 2. Pilot selection

**First pilot: Wises.**

Wises is the only qa.17 domain classified VERIFIED. The qa.2 Foundry protocol already exercises its read-only contract, including I Am Wise, paid reroll plans, ordering, Wise-cycle guidance, and zero-write behavior. Use those adapters and results as carry-forward evidence; do not reimplement the shadow rules.

The pilot's purpose is to prove a TB2E-owned handoff can be selected through an explicit QA-only runtime path while the profile remains locked. It is not a general live-roll or activation milestone.

## 3. Reuse and ownership

Reuse these existing project components:

- CORE M3 Test Engine and its existing roll entry points
- the qa.17 `m10d.wises` source-owned shadow adapter and its policy plans
- existing rules-profile resolution and the QA-only, GM-only handoff pattern established by M10C.7

A M10C implementation is an architectural reference only. Do not call or copy `applyMg2eWiseEffect` or route through MG2E policy. Its roll timing and behavior belong to a different game profile. Do not use the Legacy unrated-Wise auto-reroll path as a fallback.

## 4. TB2E handoff contract

The QA-only Wises handoff must expose and report which source-owned plan was selected:

- **I Am Wise:** one die; replaces Skill Help for that contribution; retains the documented twist risk; no resource cost; remains available while acting on Instinct.
- **Deeper Understanding:** one Fate; reroll one eligible failed die that has not already been rerolled.
- **Of Course:** one Persona; reroll all eligible failed dice.
- If Of Course and Deeper Understanding are both intended, Of Course must be planned first.
- Missing/unrelated Wise, missing resource, unknown effect, or no eligible failed die must fail closed without applying an effect.

The pilot is policy routing and evidence capture only. No die is rerolled, no Fate/Persona is spent, and no Actor/Item/Journal/Setting is changed. Runtime evidence stays in memory and resets after reload.

## 5. Required gates

### Gate A — QA/runtime boundary

- QA runtime only and GM only.
- Torchbearer remains FOUNDATION_ONLY, non-selectable, unsupported, and without live rule authority.
- Profile activation and profile switching remain unavailable.
- No route is added to stable or ordinary Legacy/MG roll flows.

### Gate B — source-owned routing

- The handoff calls only TB2E Wises planning.
- M10C/MG2E Wises and Legacy auto-reroll providers are demonstrably not called.
- Each supported and rejected plan matches the existing qa.2 contract.
- Unsupported input is rejected without fallback behavior.

### Gate C — zero-write and state integrity

- Before/after Actor, Item, Journal, and profile-setting snapshots are identical.
- No roll evaluation, reroll, or Fate/Persona spend occurs.
- Failure, cancel, missing source, and missing resource paths remain zero-write.
- Evidence is ephemeral and not used as static profile authorization.

### Gate D — regression and release

- Existing Legacy Mixed, Strict RG, MG1E, and MG2E behavior is unchanged.
- Existing qa.17 foundation and all historical release smoke tests pass.
- Release notes and QA protocol describe this as a controlled Wises handoff, not TB2E live parity or activation.

## 6. Stop conditions

Stop and keep the handoff blocked if it requires importing MG1E/MG2E behavior, changes live test results, mutates campaign state, spends resources, enables a profile, or relies on an unverified source rule. Resolve the policy and mutation contract before implementation advances.

## 7. Exit decision

Passing these gates closes only the Wises **controlled handoff planning/execution slice**. It does not close Wises live parity, M10D.10, M10D.11 activation, or M10D.12 Core Live / Stable.

After the controlled handoff passes, the next decision is whether a separate, explicitly authorized live-rule/mutation milestone is supported by the available TB2E sources and can be safely tested. Source-blocked domains remain excluded.
