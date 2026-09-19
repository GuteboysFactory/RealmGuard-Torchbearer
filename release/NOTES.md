Realm Guard / Torchbearer v1.9.0-qa.16 — M7 Session Lifecycle Live Handoff.

New CORE lifecycle scope:
- SESSION_STARTING
- SESSION_STARTED
- PHASE_CHANGED
- SESSION_ENDING
- SESSION_ENDED

CORE M7 now owns the canonical lifecycle event semantics. Existing controllers continue to perform Foundry document/settings mutations.

Safety:
- Legacy Mixed independently constructs lifecycle events for parity.
- Lifecycle disagreement auto-rolls back only Lifecycle authority.
- CORE lifecycle planner errors fall back only Lifecycle.
- All previous M7 handoffs remain independently controlled.

After this build there is no deferred M7 semantic authority remaining.

qa.15 End Session / Reward Live Handoff is VERIFIED.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.16.md
