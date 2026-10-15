# Realm Guard / Torchbearer v1.13.0-qa.23 — Foundry Inventory Report Export Fix

- Carries forward QA22's GM-only, read-only inventory of existing world documents, embedded Actor Items and readable compendiums.
- Fixes report export to use Foundry V13's native local-file save utility instead of a Blob URL.
- Adds a selectable JSON copy fallback if local saving is unavailable.
- No Foundry documents, settings, profiles, modules, or compendium entries are changed; no automatic upload.
- Discovery/reporting only; no M10D gate closes. Stable remains v1.12.0.

See TEST_PROTOCOL_v1.13.0-qa.23.md.
