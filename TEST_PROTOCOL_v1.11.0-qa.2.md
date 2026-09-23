# v1.11.0-qa.2 — M10A.1 Strict Registry + Conversion Preview QA

**QA RESULT:** 🟢✅ FULL PASS — registered profiles, Strict manifest, read-only conversion API/UI, data preservation after reload and ordinary Skill-roll regression verified in Foundry VTT 13.351.  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Gameplay change:** NONE LIVE  
**Active profile:** Realm Guard — Legacy Mixed  
**Strict profile:** PREVIEW ONLY / NOT SELECTABLE  
**Conversion writes:** ZERO

## Gate A — update / boot

Update to **v1.11.0-qa.2** through the QA manifest and open the same test world used for qa.1.

Expected:
- world opens normally
- active profile remains `realm-guard-legacy-mixed`
- no conversion prompt
- no Actor/Item mutation
- no new console-breaking error.

## Gate B — registered profiles

Run:

```js
game.realmGuard.core.registeredProfiles()
```

Expected:
- `mg1e`: FOUNDATION_ONLY, not selectable/supported
- `realm-guard-legacy-mixed`: ACTIVE, selectable/supported
- `realm-guard-strict`: PREVIEW_ONLY, not selectable/supported, previewOnly = true.

## Gate C — Strict manifest

Run:

```js
const s = game.realmGuard.core.resolveRulesProfile("realm-guard-strict")
s.profile.lineage
s.profile.domains
s.registry.list()
```

Verify at minimum:
- lineage = mg1e → realm-guard-strict
- Wises = RATED
- Inventory = LOOSE
- Levels/Talents = false
- Conditions include Strained and do not include Fresh/Afraid
- Dúnadan Nature descriptors = Tradition / Family / Grief
- Tokens of Power enabled
- Scale of Might enabled, MANUAL_GUIDED
- Wise/Trait/Inventory providers are inherited from mg1e
- Conditions/Tokens/Scale providers are realm-guard-strict.

## Gate D — conversion preview API

Run:

```js
game.realmGuard.core.m10.getStatus()
game.realmGuard.core.m10.previewStrictConversion()
```

Expected:
- mode = READ_ONLY_CONVERSION_PREVIEW
- liveActivation = false
- actorItemWrites = false
- worldSettingWrites = false
- preview.readOnly = true
- preview.activationAllowed = false
- preview.writesPlanned = 0
- safety Actor / Item / Setting writes = 0.

Check that the World Impact Scan reports sensible counts for your actual world.

## Gate E — Rules Registry UI

Open **GM Dock → Rules Registry** and click **Preview Strict Conversion**.

Expected:
- a separate Strict Conversion Preview opens
- current profile and Strict target hashes are visible
- World Impact Scan is visible
- conversion deltas are visible
- there is only a Close action
- there is NO Activate / Convert / Apply control.

## Gate F — data preservation spot-check

Before and after opening the preview, spot-check one Ranger with representative data.

Expected:
- Wise Items unchanged
- Talent Items unchanged
- Level/progression unchanged
- Equipment placement unchanged
- Fresh/Afraid Items, if present, unchanged
- CreationProvenance unchanged.

Reload after the preview and verify the same.

## Gate G — gameplay regression

Perform one ordinary Skill roll and open one normal Ranger sheet.

Expected:
- Legacy Mixed live behavior remains unchanged
- no Strict Wise/Trait/Condition/Inventory rule is applied yet.

## PASS

qa.2 passes when the Strict manifest resolves with correct source ownership, the preview accurately describes the world, all conversion paths remain read-only, Legacy Mixed stays active, and representative campaign data is unchanged after preview + reload.

After PASS, perform a new read-only audit for **M10A.2 — Wises / Traits / Help** before any mutation.
