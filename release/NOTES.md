Realm Guard / Torchbearer v1.10.0 — STABLE / GOLD

Promoted from fully verified v1.10.0-qa.5 with no functional gameplay/runtime changes.

M9 Generic Character Creation / Recruitment Migration is VERIFIED / CLOSED.

Highlights:
- CORE M9 owns Character Creation draft, recalculation, validation and transactional commit.
- Transactional Foundry commit uses compensating rollback for critical failures.
- New Rangers receive CreationProvenance with the active Rules Profile snapshot hash.
- Recruitment relationships normalize immediately into M8 Social Network storage without automatic NPC creation.
- Legacy Mixed compatibility flags and unrated Wise behavior remain preserved.
- Legacy Recruitment remains parity/reference compatibility infrastructure, not live stable authority.
- QA-only Legacy commit override and fault-injection controls are not exposed in stable runtime.
- Existing Actors are untouched; no synthetic provenance or bulk migration.
- Stable updates use the gated stable channel and are offered only after release assets are published and verified.
- Foundry VTT 13.351 verified.
- Next CORE milestone: M10 — Strict Realm Guard Profile / Rules Ownership.
