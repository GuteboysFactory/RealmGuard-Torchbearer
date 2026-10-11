# M10D.18 P3.4 — Inventory / Advancement / Session CORE findings

This document records **targeted source reconciliation**. It is NOT full 14-domain re-audit parity.

| ID | CORE source (PDF page) | Verified finding and shadow implementation |
|---|---|---|
| I1 | Dungeoneer's Handbook (DH) 84 | **Carried 4** ordinarily requires 2+ people, but one individual can heft it with a Laborer test. `inventory.storagePlan` now reports `soloCarried4RequiresLaborerTest`, does not roll or change placement. |
| I2 | DH 86 | Nested sacks count their contents and own fractional slot, rounded up to whole item slots. `inventory.containerPlan` retains raw nested slots and previews rounded total & overcapacity. |
| I3 | DH 87–88 | Cache items may be retrieved only by visiting the cache location; transfers aren't global. `inventory.cachePlan` accepts `atCacheLocation` and blocks preview of remote transfer. |
| I4 | DH 148 onward | Earlier claim that the complete gear/weapon source is unavailable is obsolete. Available PDF content is **not** equivalent to full catalogue mapping, gear effect rules or automatic grants. |
| A1 | DH 112 | Exact cumulative spent Fate/Persona level table is 1=0/0, 2=3/3, 3=7/6, 4=14/12, 5=22/20, 6=31/30, 7=41/42, 8=52/56, 9=64/72, 10=78/98. `advancement.levelBoundaryPlan` now exposes exact next thresholds; level-up requires Town and both thresholds. Still no writes. |
| A2 | DH 110 | Resources can log one Town purchase-series advancement mark and another for paying bills; second mark is forfeited if purchases already advanced Resources. `advancement.townResourcesMarkPlan` isolates these sources. |
| A3 | DH 110–111 | Near-advancement exception in series, disposition rolls not counting, tie resolution behavior are documented for future full parity; no hidden automation asserted. |
| A4 | DH 113 onward | Class benefits are available in full CORE source, not fully mapped in adapter; no automatic benefit selection. |
| S1 | Scholar's Guide (SG) 40, 95 | Instinct costs no Adventure turn/Camp check **unless Exhausted**, when it costs one. `session.grindTurnPlan` and `campCheckPlan` now accept `exhausted`. |
| S2 | SG 41–42 | Standard Grind condition cadence is every four Adventure turns; extreme is every three, with GM-adjudicated possible Dead after Exhausted. New `session.grindCadencePlan` is read-only. |
| S3 | SG 90 | Camp requires party check(s), a site to rest and no immediate peril or conflict. `session.campEntryPlan` now includes these explicit inputs. |
| S4 | SG 92–93 | Dark Camp decreases danger penalty by 1 and increases recovery Ob by 1; `session.campEventModifierPlan` previews the former while existing camp planner previews the latter. |
| S5 | SG 95–96 | Watchers' recovery limits and Camp reset remain in their existing planners; no turn/check mutations. |

**Evidence scope:** Focused references DH 83–88, 108–114, SG 39–42, 90–96. Complete factor lists, all per-class level benefits, full items, and complete Session event table are **not** claimed fully mapped.

**Safety:** All plans pure, no Actor/Item/Journal/Settings writes, live rolls, skill advancement or gear placement. Stable v1.12.0 unchanged. Legacy Mixed sole LIVE authority, kill switch ENGAGED, M11 PAUSED. Historical full domain ledger **0/14**, manual QA Gates A–D pending.
