Realm Guard / Torchbearer v1.7.0-qa.3 — M5 PC Character Art Equipment Figure.

v1.7.0-qa.2 established the painterly Equipment Figure direction. qa.3 makes the equipment display personal to each PC: Auto mode now prefers the Ranger's preserved original Character Art, then falls back to the ancestry figure and finally the neutral humanoid figure.

New in qa.3:
- adds Equipment Figure source modes: Auto, Character Art, Ancestry Figure and Custom Figure
- Auto resolves Character Art → Ancestry → Neutral fallback
- reuses the preserved original Ranger portrait source when Token Builder has generated a round token
- adds per-character Equipment Figure framing controls: Fit/Fill, Zoom, Horizontal offset and Vertical offset
- framing preferences persist under `flags.realm-guard.equipmentFigure`
- adds a Custom Figure path option for dedicated full-body equipment art
- Character/Custom modes fall back safely to ancestry when their source is unavailable
- keeps the dedicated `system.ancestry` field separate from Lineage / House
- exposes diagnostics under `game.realmGuard.inventory.figure`

Important preservation:
- Equipment Figure is presentation only
- inventory zones, drag/drop, capacities, two-hand locking, containers and gear assignment rules are unchanged
- Legacy Mixed remains sole live inventory authority
- M2, M3 and verified M4 behavior remain unchanged
- Conflict remains on the Legacy adapter path until M6

QA protocol: TEST_PROTOCOL_v1.7.0-qa.3.md
Foundry target: v13.351.
Approved baseline: v1.6.0-qa.6 PASS / M4 VERIFIED; M5 visual work remains under QA.
