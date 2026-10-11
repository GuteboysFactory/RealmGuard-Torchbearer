# M10D.18 P3.3 — Source-Verified Findings

**Scope:** Torchbearer 2E historical read-only shadows: Resources/Fate/Persona, Conditions, Recovery. **Targeted repair**, not full domain closure. CORE references below use physical PDF page numbering.

| ID | Source | Finding / implementation |
|---|---|---|
| R1 | DH 60–61 | Resources 0 needs treasure/cash before Resources test or Help; even hometown +1D alone cannot open a test. Special passed test from 0 advances to 1; preview only. |
| R2 | DH 60 | Failed-test tax is GM's choice; treasure absorbs tax 1:1; remaining tax resets Resources advancement; zero writes. |
| R3 | DH 77; SG 87–88 | Wise Deeper/Of Course rerolls require eligible failed dice and must precede Fate Luck; optional supplied dice context is validated. |
| C1 | SG 49, 51 | Injured and Sick each incur −1D ordinarily, but not on Will/Health recovery tests; elsewhere their penalties stack. |
| C2 | SG 47–48, 54 | Angry applicable precision/social test: GM +1 Ob on independent; −1s on versus tests; not recovery. |
| C3 | SG 46 | Fresh +1D only when no other condition. |
| C4 | SG 52, 55 | Dead CORE restriction documented; optional revival belongs to non-core Lore Master's Manual. |
| C5 | SG 41–42 | Standard Grind every 4 turns, extreme every 3, optional GM death after exhaustion in extreme conditions. |
| P1 | SG 49 | Exhausted Ob 3 Health recovery is allowed in both Camp and Town; older Quick Rules uncertainty obsolete. |
| P2 | SG 47, 56–57 | Hungry/Thirsty relieved by food **or** drink (water qualifies), while safe; no turn/check. Cook is optional in Camp, and acquiring food must be an actual GM-confirmed outcome. |
| P3 | SG 55–56 | Failure on recovery simply retains the condition; no twist or additional condition. |
| P4 | SG 102–105 | Town recovery venue table: Streets, Stables, Tavern, Flophouse, Inn, Hotel; read-only allowances, bonus dice and lifestyle costs. Home needs GM-selected equivalent accommodations. |

**Implementation:** M10D.7–M10D.9 refinements; new `recovery.townVenuePlan` & `townVenueModel`, updated old smokes, new `qa/m10d-tb2e-p33-resources-conditions-recovery-smoke.mjs`.

**Not claimed:** complete skill/price factors, fully automated GM decisions, comprehensive condition/death handling, mutation or all 14 domains verified. **0/14** FULLY_REAUDITED. Stable `v1.12.0` untouched, global kill switch ENGAGED, M11 PAUSED, Legacy Mixed sole live authority. Foundry Gates A–D still required.
