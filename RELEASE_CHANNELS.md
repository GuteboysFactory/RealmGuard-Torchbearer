# Realm Guard / Torchbearer Release Channels

Foundry update discovery is deliberately separated from development state.

- QA channel: `channels/qa/system.json`
- Stable channel: `channels/stable/system.json`
- Root `system.json`: release candidate/development manifest only.

## Invariant

A channel manifest may move to a new version **only after**:

1. syntax/runtime validation passes,
2. every smoke test passes,
3. the Foundry ZIP builds and validates,
4. the GitHub Release is created/uploaded,
5. both published assets are downloaded back and verified.

Only then does GitHub Actions copy the verified manifest to the relevant channel.

Therefore Foundry clients using a channel never discover a version whose `realm-guard.zip` has not already been published and verified.

Historical QA smoke tests must test durable capabilities, not freeze a migration phase or pin `manifest.version` to one exact `qa.N`.
