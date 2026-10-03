# Realm Guard / Torchbearer v1.12.0-qa.18 — M10C.7 MG2E Controlled Live Parity Execution

Built after v1.12.0-qa.17 passed Gates A-L in Foundry VTT 13.351 and closed M10C.6.

Highlights:
- keeps standalone Mouse Guard 2E Rules Profile v3 and Character Creation Profile v3
- keeps MG2E foundation-only and activation OFF
- adds a GM-only, QA-runtime controlled execution harness for WISE_EFFECTS, HELP, INVENTORY_GEAR and CONFLICT
- verifies MG2E Deeper Understanding through its source-owned Wise adapter, not Legacy unrated-Wise auto-reroll
- verifies typed Teamwork and I Am Wise as distinct MG2E Help routes
- verifies LOOSE inventory and GM-approved relevant Gear +1D
- verifies Fight Defend = Nature and Fight disposition = Fighter + Health/Nature
- verifies MG2E 2015 weapon/armor adapters without MG1E catalog leakage
- keeps runtime parity evidence ephemeral and zero-write
- closes LIVE_PARITY_QA only after all four controlled handoffs pass in one QA runtime
- keeps EXPLICIT_ACTIVATION_MILESTONE deferred
- does not add switchToMg2e and does not authorize MG2E activation
- performs zero Actor, Item, Journal and world-setting writes
- preserves Legacy Mixed / Strict Realm Guard / MG1E behavior
- v1.11.0 remains STABLE / GOLD

Live QA follows TEST_PROTOCOL_v1.12.0-qa.18.md.
