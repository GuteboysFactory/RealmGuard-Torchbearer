Realm Guard / Torchbearer v1.7.0-qa.10 — FilePicker deprecation warning hotfix.

This patch is a targeted Foundry v13/v14 compatibility correction after live qa.9 testing still showed Realm Guard stacks accessing the deprecated global `FilePicker` alias during Token Builder image upload and token creation.

New / corrected in qa.10:
- `module/token-builder-ux-hotfix.mjs` now resolves FilePicker exclusively through the modern namespaced Foundry API
- the compatibility bridge now retries after Foundry initialization (`init`) and again at `ready`, instead of assuming the namespaced FilePicker implementation already exists during first module evaluation
- the bridge replaces the deprecated global alias without reading its deprecated getter when Foundry allows the property to be reconfigured
- compatibility status now exposes attempt count and the last install phase for live QA
- direct NPC and PC Token Builder drag/drop paths keep existing behavior
- round token creation remains unchanged
- manifest remains Foundry v13–v14 compatible; v13.351 remains the verified runtime until direct v14 QA is completed

Preserved from qa.9:
- responsive Equipment Figure toolbar
- Containers + Unassigned Gear left / Equipment main-column layout
- square PC portrait / separate round token behavior
- M5 Gear / Inventory / Conflict Tool CORE remains shadow/read-only
- Legacy Mixed remains sole live Inventory / Conflict authority
- M2, M3 and verified M4 remain unchanged

QA protocol: TEST_PROTOCOL_v1.7.0-qa.10.md
Primary PASS condition: no Realm Guard `FilePicker` deprecation warning during Character portrait upload, Character Token Builder upload/save or NPC Token Builder upload/save on Foundry v13.351.