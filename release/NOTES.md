Realm Guard / Torchbearer v1.9.0-qa.7 — Unified GM Dock Host.

This QA build adds a neutral GuteboysFactory GM Dock Host/provider contract without changing tabletop rules.

Changes:
- keeps the existing Realm Guard GM Dock as the single host surface
- allows compatible GuteboysFactory products to register provider menus into the Dock
- Adventurer's Tome v1.4.0-qa.2 is the first reference provider
- adds provider badges, compact integrated menus, outside-click close and safe callback handling
- preserves existing Realm Guard tools, drag/reset and per-user Dock position
- exposes the host through globalThis.GuteboysFactory.gmDockHost and game.realmGuard.gmDockHost
- the Host receives action callbacks/presentation metadata only; it does not copy Tome campaign data

Legacy Mixed remains live rules authority.
CORE M7 remains SHADOW_READ_ONLY with liveApplication false.
No tabletop rules are intentionally changed.

Companion Tome QA build:
- Adventurer's Tome v1.4.0-qa.2

QA protocol: TEST_PROTOCOL_v1.9.0-qa.7.md
