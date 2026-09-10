Realm Guard / Torchbearer v1.4.0-qa.8 — CORE M2 Token of Power Level 3 shadow parity hotfix.

qa.8 is a deliberately narrow follow-up to qa.7. Live QA verified the Talent provider and Token of Power Level 1/2 paths, then exposed one real Level 3 shadow mismatch: CORE marked the L3 Token with base-roll STATE_CHANGE consumption intent while the current Legacy Mixed resolver correctly reports consumeOnRoll=false and consumes the Token only if the failed-dice reroll is actually accepted/used.

Fixed in qa.8:
- tokens-of-power.selected-use Level 3 no longer emits a base-roll STATE_CHANGE
- Level 3 still emits the shadow REROLL effect for failed dice
- Level 3 reroll metadata now records consumeOnRerollAccept=true so future transaction wiring has the correct lifecycle intent without mutating live state in M2
- compareTokenPowerEffects(...) now matches Legacy Mixed for a fresh L3 Token: available=true, diceBonus=0, reroll=true, manual=false, consumeOnRoll=false
- the automated Token provider smoke now locks the corrected L3 semantics
- Level 1 remains +1D once/session with shadow commit consumption intent
- Level 2 remains +1D on every appropriate check with no session-use consumption state
- manual once/session Token behavior remains unchanged

qa.7 live verification carried forward:
- talents.selected-use positive linked +1D path verified
- Talent wrong-link and minimum-level gates verified
- once/session Talent commit/use-state lifecycle verified
- Token Level 1 +1D / used-state lifecycle verified
- Token Level 2 repeatable +1D lifecycle verified
- Token Level 3 live reroll and post-use blocking behavior verified; only the pre-use shadow consumption intent required correction

Existing M2 providers retained:
- conditions.roll-dice
- traits.selected-use
- wises.selected-reroll
- tokens-of-power.selected-use
- talents.selected-use
- conflict-tools.action-modifiers

Deliberate scope limits:
- Effect Engine live application remains OFF
- all six providers remain shadow-only
- current Legacy Mixed live Token mechanics remain authoritative
- no Actor/Item/world migration
- no inventory or Conflict behavior change
- qa.6 Wise live override remains reverted/deferred
- no Strict Realm Guard or MG2E profile correction

Expected live status:
- phase: M2
- mode: SHADOW_COMPARE
- live application: OFF
- providers: 6

GOLD baseline: v1.3.0.
Foundry target: v13.351.
