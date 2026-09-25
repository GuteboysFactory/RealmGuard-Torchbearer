# v1.11.0-qa.11 — M10A.9 Stable Activation Candidate / Closure QA

**QA RESULT:** 🟢✅ FULL PASS  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Default profile:** Realm Guard — Legacy Mixed  
**Strict profile:** SUPPORTED / reversible  
**Automatic old-Actor conversion:** OFF  
**Profile switch mutation scope:** two world settings only  
**Reload after switch:** REQUIRED

## Purpose

M10A.8 proved the Strict rules profile live. M10A.9 proves that the same activation path is not accidentally tied to a `-qa.` system version and is safe to promote to the stable channel.

No new tabletop rule behavior is introduced in qa.11.

## Gate A — Legacy boot / supported profile metadata

Update to **v1.11.0-qa.11** and reload while the world is on Legacy Mixed.

Run:

```js
(() => ({
  version: game.system.version,
  active: game.realmGuard.core.getActiveRulesProfile(),
  activation: game.realmGuard.core.m10.activationStatus(),
  m10: game.realmGuard.core.m10.getStatus()
}))()
```

Expected:
- version = 1.11.0-qa.11
- active profile = realm-guard-legacy-mixed
- Strict profile version = 10
- Strict activationState = SUPPORTED
- switchAvailable = true
- Legacy Mixed remains the default/current profile
- switch safety = 0 Actor / 0 Item / 0 Journal writes
- world-setting writes on switch = 2.

## Gate B — conversion preview / Strict activation

Open **Game Settings → Rules Profile Management**.

Expected:
- Strict is labelled SUPPORTED, not QA_ACTIVE
- Preview Strict Conversion still works
- confirmation still states that Actors/Items are preserved
- no automatic Wise rating, Talent deletion, Condition deletion or inventory migration
- Switch to Strict Realm Guard is enabled.

Switch to Strict and reload.

Expected:
- active profile = realm-guard-strict
- profile version = 10
- strictRulesLive = true
- CORE M9 resolves realm-guard-strict
- existing data remains intact.

## Gate C — representative Strict regression

Verify only the closure-sensitive representatives; the full rule matrix already passed M10A.8:

- rated Wise remains rollable
- preserved unrated Wise remains unrated until explicitly edited
- Levels/Talents remain mechanically disabled but preserved
- Fresh/Afraid remain mechanically ignored by Strict
- unarmed/no-tool remains 0D
- Strict-created Ranger still exists with rated Wises / provenance / gear / relationships
- Manual says Strict is active without QA-only wording
- Strict Rules Reference says ACTIVE RULES PROFILE.

## Gate D — rollback

Switch Strict → Legacy Mixed and reload.

Expected:
- Legacy Mixed authority returns
- Level/Talent and Legacy Condition behavior return
- Strict-created data remains
- dormant Strict/Legacy data is not cleaned or deleted
- no duplicates or destructive reverse conversion.

## Gate E — static stable-runtime closure

The automated `qa/m10-profile-activation-smoke.mjs` runs with:

```js
game.system.version = "1.11.0"
```

It must still verify:
- Strict activation is available
- Strict can be selected
- switch writes only the two profile settings
- rollback to Legacy works
- activation source contains no `qaRuntime` dependency.

## PASS

qa.11 passes when supported Strict activation works in live qa.11, the stable-runtime smoke passes, rollback remains non-destructive, and no M10A.8 rule regression is observed.

After PASS, promote the same functional code to **v1.11.0 STABLE / GOLD** and close **M10A — Realm Guard Strict**.


## Live closure result

- Gate A — Legacy boot / SUPPORTED v10 metadata: ✅ PASS
- Gate B — Strict activation + reload: ✅ PASS
- Gate C — representative Strict regression: ✅ PASS
- Gate D — Strict → Legacy rollback: ✅ PASS
- Gate E — stable-runtime closure smoke: ✅ PASS
- Release workflow for qa.11: ✅ PASS

**Promotion approved:** v1.11.0 STABLE / GOLD. M10A is closed.
