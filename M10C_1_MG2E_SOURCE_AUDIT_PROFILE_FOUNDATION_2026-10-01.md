# M10C.1 — MG2E Source Audit & Profile Foundation

**Date:** 2026-10-01  
**Source authority:** *Mouse Guard Roleplaying Game: Second Edition* (2015)  
**Profile id:** `mg2e`  
**Profile version:** 1  
**Status:** SOURCE-AUDITED FOUNDATION / QA CANDIDATE

## Boundary

M10C.1 establishes Mouse Guard 2E as a **standalone Rules Profile**. It does not inherit Mouse Guard 1E or Realm Guard, and it is not used as a fallback source for Strict Realm Guard.

This slice is deliberately read-only:

- `foundationOnly: true`
- `selectable: false`
- `supported: false`
- `activationState: FOUNDATION_ONLY`
- `liveRuleAuthority: false`
- no activation API or Profile Management switch
- no Actor / Item / Journal / world-setting migration
- no conversion preview yet

Only source domains audited below are encoded. Unreviewed domains remain pending rather than silently borrowing MG1E behavior.

## Audited domains

### Nature

Source: MG2E pp. 230–232.

- Nature is **Nature (Mouse)**.
- Mouse aspects are **Escaping, Climbing, Hiding, Foraging**.
- Nature may substitute for a missing appropriate skill; this is not Beginner's Luck.
- Nature cannot substitute for Wises.
- Acting against Nature may tax Nature.
- Tap Nature and Double-Tap Nature are present.
- Resources and Circles are excluded from Tap Nature.

### Traits

Source: MG2E pp. 256–260 and Recruitment p. 308.

- One trait may help the character per test.
- Level 1: **+1D once per session**.
- Level 2: **+1D twice per session**.
- Level 3: **+1s on applicable tests**.
- Negative-aspect options:
  - Impede: -1D, earn 1 Check.
  - Hurt a versus opponent: opponent +2D, earn 2 Checks.
  - Break a versus tie in the opponent's favor: earn 2 Checks.
- Charge a Trait: 3 Checks.
- Recharge: level 1 costs 2 Checks; level 3 costs 4 Checks.

The explanatory example on p. 257 contains wording that conflicts with the explicit level-2 rule. The explicit rule and Recruitment summary both establish **two uses per session**, so the profile encodes that value.

### Wises

Source: MG2E pp. 270–272.

- Wises are **unrated**.
- A Wise is not tested on its own.
- A character may have up to four Wises.
- **I Am Wise:** +1D to an ally's relevant test, used in place of Help.
- **Deeper Understanding:** spend Fate to reroll one failed die; a die already rerolled cannot be rerolled again.
- **Of Course!:** spend Persona to reroll all failed dice; use before Fate/Open-6 rerolls.
- Wise use has its own advancement/perk cycle after all four required use marks are completed.

M10C.1 records the Wise effects and unrated model but does not yet route them into live roll UI.

### Help / Wise Aid

Source: MG2E pp. 95, 271.

- Ordinary Teamwork and I Am Wise are distinct support mechanisms.
- I Am Wise is used **instead of** ordinary Help on that test.
- The same character cannot both Help and use I Am Wise on the same test.
- I Am Wise insulates the wise user from helper Conditions but not from twists.

The full MG2E Suggested Help matrix remains part of later domain-completion work.

### Conditions & Recovery

Source: MG2E pp. 125–132.

Active adverse Conditions:

- Hungry & Thirsty
- Angry
- Tired
- Injured
- Sick

Healthy is the no-adverse-condition state.

Recovery order:

1. Hungry & Thirsty
2. Angry
3. Tired
4. Injured
5. Sick

Core recovery values audited:

- Angry: Will Ob 2.
- Tired: Health Ob 3.
- Injured: Health Ob 4; after failed self-recovery, Healer Ob 3.
- Sick: Will Ob 4; after failed self-recovery, Healer Ob 4.
- Recovery in the GM's Turn costs 2 Checks.
- One recovery test per Condition per turn.

The **Sick Healer Ob 4** value is intentionally edition-specific and must not inherit the MG1E value.

### Circles

Source: MG2E pp. 237–239.

- Hometown Advantage: +1D to Circles in the character's hometown.
- A previously established Contact grants +1D on later Circles tests to find that same character.
- Failed Circles may invoke the Enmity Clause.
- An Enemy gains +3s to disposition in Arguments and Speeches made against the character.

CORE M8 remains the Foundry storage/tooling layer; M10C.1 performs no relationship migration.

### Recruitment foundation

Source: MG2E pp. 299–309.

Recruitment is described as a 21-step character-creation process.

Five Guard ranks:

- Tenderpaw
- Guardmouse
- Patrol Guard
- Patrol Leader
- Guard Captain

Foundation values audited:

- Mouse Nature starts at 3 before the three Nature questions.
- A newly chosen Skill starts at 2.
- Repeated Skill choices increase rating by 1, to a maximum of 6.
- Wises are unrated.
- Starting Wise count by rank:
  - Tenderpaw: 1
  - Guardmouse: 1
  - Patrol Guard: 2
  - Patrol Leader: 3
  - Guard Captain: 4
- Tenderpaw Wise choice is restricted by source.
- Guard Captain must include Lockhaven-wise or Matriarch-wise.

M10C.1 records these contracts only. A complete MG2E `CharacterCreationProfile` and transactional CORE M9 commit path are deferred.

## Explicitly pending domains

The following are **not closed by M10C.1** and must not be inferred from MG1E:

- full Ability / Skill advancement deltas
- inventory / Gear policy and capacity
- Conflict action-skill and disposition tables
- armor / weapon differences
- Session / Winter / reward rules
- Comparative Scale / Natural Order behavior
- complete Recruitment validation, relationships and commit plan
- conversion-preview deltas
- live Rules Reference
- selectable activation

## Safety / promotion gate

M10C.1 passes only when:

1. `mg2e` resolves independently with lineage `["mg2e"]`.
2. Source-audited values above are represented in profile v1.
3. MG2E remains foundation-only and cannot be activated.
4. No MG2E profile switch API/button exists.
5. Legacy Mixed, Strict Realm Guard and MG1E behavior remain unchanged.
6. No campaign documents/settings are mutated by MG2E registration.
7. automated smoke/release pipeline is green.
8. Foundry v13.351 live foundation QA passes.

**Next bounded slice after closure:** M10C.2 — MG2E domain-completion audit + generic conversion-preview routing.
