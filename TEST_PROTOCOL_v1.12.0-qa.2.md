# v1.12.0-qa.2 — M10B.2 MG1E Source Manifest + Conversion Preview

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.11.0  
**MG1E activation:** OFF / FOUNDATION_ONLY  
**Gameplay mutation:** NONE intended

## Gate A — boot / version

Expected:
- system version = 1.12.0-qa.2
- current world profile remains unchanged
- no automatic profile switch
- no Actor/Item/Journal migration
- no red console errors.

## Gate B — MG1E source manifest

Run:

```js
const m = game.realmGuard.core.resolveProfileCapabilities("mg1e");
({
  phase: m.phase,
  profileVersion: m.profile.version,
  foundationOnly: m.profile.foundationOnly,
  selectable: m.profile.selectable,
  liveRuleAuthority: m.profile.liveRuleAuthority,
  nature: game.realmGuard.core.resolveRulesProfile?.("mg1e")?.profile?.domains?.nature?.descriptors,
  inventory: m.rules.inventory,
  naturalOrder: m.rules.naturalOrder,
  scale: m.rules.scaleOfMight
})
```

Expected:
- phase = M10B.2
- profileVersion = 3
- foundationOnly = true
- selectable = false
- liveRuleAuthority = false
- Mouse Nature = Escaping / Climbing / Hiding / Foraging
- inventory policy = LOOSE
- capacityMode = CHARACTER_SHEET_GEAR_SPACE
- Natural Order enabled / MG1E
- Scale of Might disabled.

## Gate C — Rules Profile Management

Expected:
- header = M10B.2
- Strict Realm Guard remains SUPPORTED
- Mouse Guard 1E appears under Available / Preview Profiles
- **Preview MG1E Conversion** opens
- MG1E has no Switch/Activate action
- stale M10A.9 / Stable activation candidate copy is gone.

## Gate D — MG1E conversion preview

Expected:
- READ ONLY
- current and target profile shown
- World Impact includes rated/unrated Wises, profile-specific Conditions, Tokens of Power and provenance
- reviewed deltas include Nature, Conditions, Natural Order, Scale of Might and Character Creation
- Actor writes = 0
- Item writes = 0
- Journal writes = 0
- setting writes = 0
- destructive conversion = NO.

## Gate E — live regression

On the currently active profile:
- one ordinary Skill roll still behaves exactly as before
- if Strict is active, representative Strict behavior remains unchanged
- no hidden data has been deleted or duplicated.

## PASS

qa.2 passes when MG1E source ownership and preview are correct, read-only and non-selectable, while Legacy Mixed and Strict Realm Guard live behavior remain unchanged.
