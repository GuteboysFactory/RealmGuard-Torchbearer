Realm Guard / Torchbearer v1.10.0-qa.5 — M9 Closure / Hardening Candidate

Built from verified v1.10.0-qa.4 PASS.

Highlights:
- No intended gameplay or rules change.
- CORE M9 remains the sole normal Character Creation authority for draft, validation and transactional commit.
- Legacy Recruitment comparison is terminology-cleaned as a parity guard, not a shadow/live authority.
- Legacy createRanger remains only as an explicit QA fallback/reference.
- QA fallback and fault-injection controls are exposed only in QA builds; stable public M9 API will not expose them.
- Compensating rollback, CreationProvenance, Rules Profile snapshot hash and immediate M8 Recruitment normalization remain locked.
- Legacy Mixed compatibility flags and unrated Wise behavior remain preserved.
- Adds M9 closure-contract smoke and final live regression protocol.
- Existing Actors are untouched; no synthetic provenance or bulk migration.
- Gated QA release channel remains mandatory.
- Foundry VTT 13.351 target.
