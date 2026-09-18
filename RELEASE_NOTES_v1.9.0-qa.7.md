# Realm Guard / Torchbearer v1.9.0-qa.7 — Unified GM Dock Host

This QA build introduces a neutral provider-host contract for the existing Realm Guard GM Dock.

Highlights:
- one GM Dock can host tools from compatible GuteboysFactory products
- Adventurer's Tome v1.4.0-qa.2 is the first reference provider
- provider menus and badges integrate without copying provider-owned campaign data
- existing Realm Guard Dock tools, position persistence and reset remain authoritative
- host API is exposed for QA and future integrations

This package intentionally changes no tabletop rules.

Legacy Mixed remains live rules authority. CORE M7 remains SHADOW_READ_ONLY with liveApplication false.

QA protocol: `TEST_PROTOCOL_v1.9.0-qa.7.md`
