Realm Guard / Torchbearer v1.8.0-qa.5 — Conflict window stacking hotfix.

Live browser diagnostics captured the intermittent roll-dialog-behind-Conflict bug while active: `.rg-conflict-window` computed to z-index 120 while the Foundry `DialogV2` roll window was z-index 103. The fixed custom Conflict surface therefore outranked Foundry's managed application stack.

qa.5 changes only the Conflict window stacking level from 120 to 99, allowing Foundry's normal application/dialog focus stack to remain above it. No Conflict rules, state, M6 resolution handoff, qa.4 Exchange Weapon / Tool scope, or Token Actor behavior changes.

QA protocol: TEST_PROTOCOL_v1.8.0-qa.5.md
