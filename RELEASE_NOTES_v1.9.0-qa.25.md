# Realm Guard / Torchbearer v1.9.0-qa.25 — Namespaced FilePicker Cleanup

Foundry compatibility cleanup for Ranger portrait and Token Builder uploads.

- Ranger portrait uploads now resolve FilePicker through the modern namespaced API.
- Token Builder generated-token uploads now resolve FilePicker through the modern namespaced API.
- Removes direct reads of the deprecated global `FilePicker` from these runtime paths.
- Existing upload folders, upload behavior, portrait framing and token generation are unchanged.
- QA smoke now asserts that Actor Sheet and Token Builder no longer access `globalThis.FilePicker`.

Target API:
`foundry.applications.apps.FilePicker.implementation`

No rules, Actor schema, Item schema, M8 Social Network or Recruitment behavior changes.
