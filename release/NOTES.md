Realm Guard / Torchbearer v1.8.0-qa.6 — M6 Runtime & State Authority.

This is a consolidated M6 patch, not a micro-patch. It adds the CORE Conflict runtime model (ConflictState/Sides/Teams/Participants/ActionSet projection), pure CORE state services for disposition, Maneuver state/effects, action/exchange advancement, outcome and compromise, plus a separately protected live state-transition handoff.

Resolution-result authority from qa.3 remains independently protected. A state mismatch rolls back only CORE state authority; it does not disable the already verified resolution authority. Legacy remains authoritative for Learning writes, Nature tax, the interactive unresolved-tie transaction, and private hidden-plan persistence.

Includes the previously verified qa.4 Exchange Weapon/Tool scope and qa.5 window stacking behavior unchanged.

QA protocol: TEST_PROTOCOL_v1.8.0-qa.6.md
