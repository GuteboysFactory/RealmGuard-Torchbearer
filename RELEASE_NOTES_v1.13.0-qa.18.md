# Realm Guard / Torchbearer v1.13.0-qa.18 — M11.1 TB2E Live Authority Framework

M10D Final Foundation Audit is FULL PASS / VERIFIED / CLOSED.

- Adds a domain-level TB2E authority registry with OFF / SHADOW / DUAL_RUN / LIVE states.
- Keeps all 14 source-supportable domains in SHADOW and all SOURCE_BLOCKED/MANUAL domains in OFF.
- Adds a hard global TB2E kill switch, engaged by default; M11.1 deliberately provides no authorized release path.
- Adds explicit per-domain write-operation contracts covering Actor, Item, Journal, Setting, create/delete, Chat and Socket surfaces. Every write permission remains false in M11.1.
- Adds transition previews only. LIVE is refused without a later explicit domain gate; SOURCE_BLOCKED and MANUAL domains cannot leave OFF.
- Adds memory-only DUAL_RUN comparison logging with MATCH/DIVERGENCE results and no World persistence.
- Encodes the planned live-integration wave order, with Wises as Wave 1 and Character Creation as Wave 8.
- Full Torchbearer 2E profile switching remains blocked; Character Creation commit remains blocked.
- No Actor, Item, Journal or Setting writes are added.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E behavior remains unchanged.
- QA advances to v1.13.0-qa.18. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.18.md.
