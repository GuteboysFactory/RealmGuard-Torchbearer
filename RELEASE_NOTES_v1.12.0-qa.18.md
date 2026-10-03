# Realm Guard / Torchbearer v1.12.0-qa.18 — M10C.7 MG2E Controlled Live Parity Execution

Built after v1.12.0-qa.17 passed Gates A-L in Foundry VTT 13.351 and closed M10C.6.

## Highlights

- keeps Mouse Guard 2E Rules Profile v3 and Character Creation Profile v3
- keeps MG2E activation OFF and does not add `switchToMg2e`
- adds a QA-only controlled runtime execution service for the four M10C.6 handoff domains
- executes MG2E Wise Effects through the source-owned MG2E adapter
- executes typed Help / I Am Wise separation through the MG2E Help adapter
- executes LOOSE inventory / relevant Gear +1D GM-approved routing through MG2E Gear adapters
- executes Fight action/disposition and MG2E 2015 weapon/armor routing through MG2E Conflict adapters
- explicitly blocks Legacy unrated-Wise auto-reroll authority in MG2E parity execution
- explicitly blocks MG1E weapon-catalog authority in MG2E parity execution
- records parity evidence only in memory for the current QA runtime
- performs zero Actor, Item, Journal and world-setting writes
- closes LIVE_PARITY_QA only after all four bounded domains pass
- leaves EXPLICIT_ACTIVATION_MILESTONE deferred
- preserves Legacy Mixed / Strict Realm Guard / MG1E behavior
- v1.11.0 remains STABLE / GOLD

Live QA follows `TEST_PROTOCOL_v1.12.0-qa.18.md`.
