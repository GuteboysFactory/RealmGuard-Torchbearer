Realm Guard / Torchbearer v1.7.0-qa.22 — Conflict Token Actor resolution hotfix.

During qa.21 live testing, an unlinked Dev Testsson scene token showed Shield + other token-specific Gear while the world Actor contained only Sword. Conflict participant lookup still used game.actors.get(actorId), so planning and evaluation read the world Actor instead of the actual synthetic Token Actor on the table.

qa.22 fixes that resolution layer only:
- exactly one matching active-scene token -> use token.actor
- multiple matches with exactly one controlled token -> use the controlled token
- ambiguous multiple matches -> safe world Actor fallback + warning
- no scene token -> existing world Actor behavior
- M5 parity bridge uses the same resolver
- no Conflict rule changes and qa.21 evaluation handoff remains intact

QA protocol: TEST_PROTOCOL_v1.7.0-qa.22.md
