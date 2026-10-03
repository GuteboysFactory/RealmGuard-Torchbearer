# Realm Guard / Torchbearer v1.12.0-qa.17 — M10C.6 MG2E Live Parity QA Foundation

Built after v1.12.0-qa.16 passed Gates A-L in Foundry VTT 13.351 and closed M10C.5.

Highlights:
- keeps standalone Mouse Guard 2E Rules Profile at v3 and keeps activation OFF
- adds a zero-write 13-domain MG2E live-parity foundation matrix
- maps every MG2E source domain to a deterministic candidate provider and later live handoff surface
- explicitly identifies Wise Effects, Help, Inventory/Gear and Conflict as controlled handoff domains
- preserves MG2E Wise behavior through the source-owned MG2E adapter instead of Legacy unrated-Wise rerolls
- preserves MG2E 2015 weapon/armor behavior through source-owned MG2E adapters instead of the MG1E catalog
- makes generic Session/Circles capability routing recognize MG2E family semantics
- makes M10B.6 source ownership edition-aware: MG1E_2008 / MG2E_2015 / LEGACY_CURRENT
- advances LIVE_PARITY_QA to FOUNDATION_READY_NOT_RUN when all 13 domains are green
- keeps EXPLICIT_ACTIVATION_MILESTONE deferred
- does not add switchToMg2e and keeps activationAvailable false
- performs zero Actor, Item, Journal and settings writes and no destructive migration
- preserves existing campaign data and Legacy Mixed / Strict / MG1E behavior
- v1.11.0 remains STABLE / GOLD

Live QA follows TEST_PROTOCOL_v1.12.0-qa.17.md.
