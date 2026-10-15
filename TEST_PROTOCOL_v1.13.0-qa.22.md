# TEST PROTOCOL — v1.13.0-qa.22

## QA22 — Read-only Foundry World Inventory Report
Foundry VTT 13.351 · baseline v1.13.0-qa.21 · discovery/reporting only

QA22 adds a GM-only report that inventories the current Foundry test world and readable compendiums. It does not create fixtures or advance an M10D roadmap gate. Keep the existing test world, test Actors, Gear and module configuration as they are. Leave Adventurer's Tome in its current active/inactive state.

The report includes Foundry/world/system versions; the current user and users' basic roles; all module names, versions and active flags; registered setting definitions (names/metadata only); active profile and available read-only CORE status providers; every world Actor, Item, Scene, Journal, RollTable, Playlist, Card, Combat, Chat Message, Macro and Folder document; every readable compendium pack and its documents. Actor embedded Items are included with Actor data. Settings values are omitted. The JSON is downloaded locally and never uploaded automatically.

### Gate A — Install and profile boundary

- Install v1.13.0-qa.22 in the existing QA world and reload.
- Do not create, edit, delete, import or move any Actor, Item, pack entry, Journal, Setting or Chat Message.
- Do not change the current rules profile or module activation state.
- Confirm Legacy Mixed remains the live profile, Torchbearer remains locked/inactive, and Adventurer's Tome shows its pre-test active state.
- As GM, click **Foundry World Inventory Report** in the GM Dock.
- Review the collection and pack counts, then choose **Download JSON**. Cancel is also safe; it creates no file and changes nothing.

### Gate B — Inspect the report

- Open the downloaded `realm-guard-foundry-inventory-*.json`.
- Confirm `report.readOnly=true`, `report.automaticUpload=false`, and every `report.writes` counter is zero.
- Confirm the report identifies Foundry 13.351, Realm Guard / Torchbearer v1.13.0-qa.22 and the correct QA world.
- Confirm active modules and Tome's active flag match the world before testing.
- Confirm the current rules profile and M10D status snapshots are included. The status section is observational; it does not activate Torchbearer.
- Confirm all existing test Actors, their embedded Items, world Items, Gear and compendium entries appear. Do not create copies if an existing record is found.
- If a pack cannot be read, its error must be recorded in that pack's `readErrors`; report that result rather than trying to repair or seed the pack.
- Setting values and authentication credentials are not requested. The report contains Foundry world document source data, including Journal and Chat Message content; it remains local until you choose to share the JSON here.

### Gate C — No-write and share

- Compare Actor/Item/Journal/Setting/Chat Message and compendium counts with the pre-test world. Counts and contents must be unchanged.
- Confirm no document was created, updated, deleted, moved, seeded, or migrated; no profile or module state changed.
- Upload the downloaded JSON here so I can inventory the actual test world and check for gaps before any later roadmap implementation.

A successful report confirms only that QA22 can inspect and export the current Foundry state without writes. It does not complete M10D.5 Inventory/Gear, prove live inventory parity, authorize profile activation, or close any M10D gate. Stable remains v1.12.0.
