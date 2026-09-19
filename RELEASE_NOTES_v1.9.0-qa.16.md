# Realm Guard / Torchbearer v1.9.0-qa.16 — M7 Session Lifecycle Live Handoff

v1.9.0-qa.16 promotes the final deferred M7 semantic authority to CORE.

New CORE lifecycle scope:
- SESSION_STARTING
- SESSION_STARTED
- PHASE_CHANGED
- SESSION_ENDING
- SESSION_ENDED

Implementation:
- SessionLifecycleService now exposes canonical planCommit / previewCommit.
- Existing controllers still perform the Foundry document/settings mutations.
- CORE owns lifecycle event semantics.
- Legacy Mixed independently builds the same event for parity.
- Lifecycle mismatch or CORE error rolls back only Lifecycle authority.

After qa.16 there is no deferred M7 semantic authority remaining.

qa.15 End Session / Reward Live Handoff is VERIFIED.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.16.md
