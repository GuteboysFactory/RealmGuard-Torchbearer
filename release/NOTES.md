Realm Guard / Torchbearer v1.7.0-qa.9 — Foundry v14 forward-compatibility + Equipment Figure responsive toolbar.

This patch addresses the FilePicker deprecation warning seen in live v13.351 QA and prepares the system to use the modern namespaced Foundry FilePicker implementation while keeping current v13 compatibility.

New / corrected in qa.9:
- adds an early Foundry compatibility bridge before the main Realm Guard system module loads
- uses `foundry.applications.apps.FilePicker.implementation` as the forward API baseline instead of relying on the deprecated global FilePicker getter
- removes the Realm Guard-side need to read the deprecated global FilePicker alias during portrait/token upload workflows
- manifest support range is now Foundry v13 through v14
- v13.351 remains the currently verified runtime until direct v14 QA is completed
- Character Portrait drag/drop and Token Builder upload/save workflows remain intact
- Equipment Figure toolbar is redesigned as a responsive compact control block
- wide layouts keep Source + Ancestry efficiently arranged
- medium/narrow layouts stack fields cleanly while keeping the settings gear reachable
- resolved Figure status remains inside the toolbar without overlap or horizontal overflow
- qa.8 Containers / Unassigned Gear / Equipment layout remains preserved

Important preservation:
- Inventory mechanics are unchanged
- M5 Gear / Inventory / Conflict Tool CORE services remain shadow/read-only
- Legacy Mixed remains sole live Inventory and Conflict authority
- PC profile portrait remains separate from the generated round token
- M2, M3 and verified M4 behavior remain unchanged

QA protocol: TEST_PROTOCOL_v1.7.0-qa.9.md
Current verified runtime: Foundry v13.351.
Forward target: Foundry v14; advance `compatibility.verified` only after direct v14 QA.