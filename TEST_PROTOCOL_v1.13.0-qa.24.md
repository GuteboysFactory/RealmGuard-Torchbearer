# TEST PROTOCOL — v1.13.0-qa.24

## QA24 — Complete read-only System and Foundry Inventory
Foundry VTT 13.351 · baseline v1.13.0-qa.23 · inventory and discovery only

QA24 extends QA23's existing GM-only Foundry-world/compendium inventory with a build-generated index of the complete checked-out system source tree and a live catalogue of every registered rules profile and its resolved Rules Registry. The report is read-only. It creates no fixtures, modifies no documents/settings/profiles/modules/packs, makes no network upload, and closes no M10D gate. Keep the current QA world and Adventurer's Tome state unchanged.

The source index records repository file paths/categories, code modules, declared functions/classes and exports, imports, Hook/setting/GM Dock/sheet registrations, read/write call sites, project-document headings, QA evidence file names, system manifest document types and runtime entry points, and the qa.17 M10D source-coverage matrix. The live portion records every registered profile ID, resolved domain, complete Rules Registry entries and capabilities; it separately records the active profile and current CORE/M10D status providers. Static indexing cannot infer every runtime branch, dynamic registration or undocumented rule. Those limits are stated in the report.

### Gate A — Install and preserve the test world

- Install v1.13.0-qa.24 from the existing QA update channel and reload the same Foundry world.
- Do not create, edit, delete, import, move, seed or migrate any Actor, Item, Journal, setting, compendium entry or other world record.
- Do not switch rules profiles or alter module activation.
- Confirm Legacy Mixed and Adventurer's Tome retain their before-test state.
- As GM, open **Foundry World Inventory Report** from the GM Dock.
- Review the Foundry counts and the source-index/profile counts. Choose **Download JSON**. Foundry should save locally. If it cannot, choose **Copy JSON**, select all, and copy; report that fallback.

### Gate B — Confirm coverage in the report

- Confirm `report.readOnly=true`, `report.automaticUpload=false`, every `report.writes` value is zero, and `sourceInventory.status="available"`.
- Confirm Foundry 13.351, Realm Guard v1.13.0-qa.24 and the correct world are identified.
- Confirm the source inventory has a complete file list and indexes runtime modules, sheets, templates, styles, profiles, QA evidence and project documents.
- Confirm code records expose declared function/class names, exports, imports and discovered Hook/setting/GM Dock/sheet registrations with file and line references.
- Confirm all five registered rules profiles are represented (Torchbearer remains foundation-only and non-live), with resolved domains, Registry entries and capabilities. Confirm Legacy Mixed is active and its registry/domain snapshot is present.
- Confirm the qa.17 M10D matrix has 19 domains, source classifications, verified scope, gaps, READ_ONLY mode, `liveEnabled=false` and `automation=DISABLED`. Keep the four SOURCE_BLOCKED domains and MANUAL narrative adjudication explicit.
- Confirm QA23's existing Foundry world, embedded Items and readable compendium inventory is still present.
- Settings values and credentials remain excluded. The world portion can contain Journal and Chat Message content; the JSON stays local unless you choose to share it.
- If the packaged source index or a runtime registration cannot be read, report that explicitly. Do not treat a missing section as an empty feature set or repair/seed anything during the test.

### Gate C — No-write and report

- Compare Actor, embedded/world Item, Scene, Journal, Setting and compendium contents/counts before and after. They must be unchanged.
- Confirm no profile/module state changed and no report data was uploaded.
- Share the JSON report here, or report the counts and unavailable/error section if local export still fails.

A PASS confirms QA24 inventories the checked-out source tree, registered rule profiles and current Foundry world read-only. It does not activate Torchbearer, authorize live rules, prove play-session parity, complete M10D.5 Inventory/Gear, or close any M10D gate. Stable remains v1.12.0.
