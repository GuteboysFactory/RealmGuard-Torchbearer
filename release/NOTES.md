# Realm Guard / Torchbearer v1.13.0-qa.26 — M10D.18 P3.2 (targeted full CORE re-audit)

**QA ONLY.** P3.2 is targeted source reconciliation of Wises, Nature and Abilities/Skills, NOT 14/14 full domain parity. All results READ_ONLY_SHADOW.

## DH/SG-backed adjustments
- **Wises** (DH pp.76-78, SG pp.87-88): `wises.combinationPlan` checks one use per Wise, each effect only once per test, max 4 Wises, fictional relevance and ordinary Help/I Am Wise exclusivity; Wise rerolls require being planned before Fate Luck, removes assumed Of Course → Deeper ordering; four-use cycle timing adjusted.
- **Nature** (DH pp.65-70, SG p.25): Alternative stock descriptors added; returned-from-missed-session recovery requires no conditions; end-of-adventure retirement for max Nature 0 (including voluntary conservation), conditional end-session check at Nature 7.
- **Abilities/Skills** (DH pp.72-75 and 160-176): full source available but 33-skill factor catalogue still not mapped; `abilities.equipmentPlan` previews tool penalties and caps Supplies/Gear per test; unskilled borrowed tools and Dwarven Crafting exception; learning a 25th Skill flags replacement of an old Skill; heroic cap 7 only with level benefit.
- Existing live rules, P3.1, P2 Traits/Armor/Conflict/Magic and original profile snapshots preserved by regression tests.

## Strict safety
- Global kill switch ENGAGED. M11 PAUSED. Legacy Mixed sole live authority. TB2E not activated.
- No Actor/Item/Journal/Settings writes; no roll execution, advancement or equipment mutation.
- **0/14 fully re-audited historical domains**; tracked with source citations and open work in `M10D18_P3_FULL_CORE_REAUDIT_LEDGER.md`.
- Foundry QA protocol: `TEST_PROTOCOL_v1.13.0-qa.26.md`. Gates A-D require manual PASS after successful CI/QA release.
- Stable v1.12.0 frozen. QA release manifest promoted only by verified GitHub Actions after ZIP/asset checks.
