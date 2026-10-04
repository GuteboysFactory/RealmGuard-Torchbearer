# Realm Guard / Torchbearer v1.13.0-qa.4 — M10D.3 Help Shadow Metadata Hotfix

- Minimal follow-up to the otherwise green v1.13.0-qa.3 Help / Teamwork shadow QA.
- Keeps every Help rule outcome unchanged.
- Fixes rejected Help shadow plans so canonical adapter metadata always remains `phase: "M10D.3"`.
- Town / Adventure context is now reported separately as `phaseContext`; test context is reported as `testContext`.
- Hardens the shared rejected-plan builder so caller metadata cannot overwrite canonical phase/profile/reason/live/write fields.
- Adds regression assertions for Town Resources, Town Recovery and invalid Instinct Help metadata.
- No live TB2E authority, activation, resource spend, Condition mutation or Actor/Item/Journal/setting write.
- QA advances to v1.13.0-qa.4. Stable remains v1.12.0 unchanged.

Focused Foundry follow-up: Gate B/C metadata sanity + release/channel verification only.
