# Realm Guard / Torchbearer v1.13.0-qa.20 — M10D.18 Core Reconciliation P1

M10D.17 Full-Core Source Expansion Audit is FULL PASS / VERIFIED / CLOSED.

This candidate repairs the six confirmed guide-era mismatches identified by the full Torchbearer 2E core source audit, while keeping every TB2E adapter read-only.

- Character Creation: preserves Human Upbringing absent skill at rating 3, but corrects Home, Social Grace and Specialty absent skills to rating 2; existing skills still increase by one to maximum 4.
- Conditions: resolves the old guide conflict using Scholar's Guide. Hungry & Thirsty and Exhausted each apply -1s to team disposition once; Injured and Sick remain -1D to the affected character's rolls including disposition. Shadow output now exposes separate success and dice penalties; no live mutation is enabled.
- Help: removes the over-broad all-Town Resources block. Help is prohibited for Will/Health recovery tests and for the Resources test used to pay bills when leaving town; ordinary Resources tests are no longer blocked merely because phase=TOWN.
- Nature: maximum Nature reduced to 0 now reports retirement timing as END_OF_ADVENTURE.
- Adds an M10D.18 reconciliation status API tracking 6 resolved findings and 4 still-pending source-expansion findings.
- Full-domain re-audit is still required for all 14 existing shadows; Traits, Armor, Conflict and Magic still require new shadow adapters.
- M11 remains paused, global kill switch remains engaged, profile activation and Character Creation commit remain blocked.
- No Actor, Item, Journal or Setting writes are added.
- QA advances to v1.13.0-qa.20. Stable remains v1.12.0.
