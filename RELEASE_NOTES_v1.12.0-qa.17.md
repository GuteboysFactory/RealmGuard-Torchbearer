# Realm Guard / Torchbearer v1.12.0-qa.17

## M10C.6 — MG2E Live Parity QA Foundation

Built after v1.12.0-qa.16 passed Gates A-L in Foundry VTT 13.351 and closed M10C.5.

### Highlights

- keeps standalone MG2E Rules Profile v3 FOUNDATION_ONLY, non-selectable, unsupported and non-live
- adds a zero-write 13-domain MG2E live-parity foundation matrix
- maps each MG2E domain to a deterministic candidate provider and later live handoff surface
- explicitly identifies Wise Effects, Help, Inventory/Gear and Conflict as controlled adapter handoffs
- prevents future MG2E live work from silently reusing Legacy Wise rerolls or MG1E weapon/armor semantics
- makes generic Session/Circles capability routing recognize MG2E family semantics
- makes M10B.6 source ownership edition-aware (MG1E_2008 / MG2E_2015)
- advances LIVE_PARITY_QA to FOUNDATION_READY_NOT_RUN when the matrix is green
- keeps EXPLICIT_ACTIVATION_MILESTONE deferred
- keeps activationAvailable false and adds no switchToMg2e
- performs zero Actor, Item, Journal and settings writes
- preserves Legacy Mixed, Strict Realm Guard, MG1E and existing campaign data
- v1.11.0 remains STABLE / GOLD

Live QA follows `TEST_PROTOCOL_v1.12.0-qa.17.md`.
