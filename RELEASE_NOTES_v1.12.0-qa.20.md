# Realm Guard / Torchbearer v1.12.0-qa.20 — M10C.8 Conversion Preview Correction

- MG2E Conversion Preview now reports M10C.8 and QA-active status, including Recruitment guidance. Stale M10C.2 / FOUNDATION_ONLY copy is removed.
- `activationAllowed` reports the current GM permission for a separate MG2E activation through the existing QA gate. It is false for players and stable runtimes. `previewActivationAllowed` remains false.
- Preview remains READ_ONLY with zero Actor, Item, Journal or setting writes and only a Close action.
- Adds regression coverage for preview copy, QA/stable/player gating and preservation. Existing Legacy / Strict / MG1E behavior is retained.
- Rules Profile v3 / Character Creation Profile v3 remain unchanged. Stable remains v1.11.0.

Focused Foundry VTT 13.351 follow-up: Gate A, Gate B, Gate L and quick activation sanity in `TEST_PROTOCOL_v1.12.0-qa.20.md`. This patch does not claim new live QA results.
