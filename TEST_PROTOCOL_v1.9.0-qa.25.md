# Realm Guard / Torchbearer v1.9.0-qa.25 — FilePicker QA

## Gate A — Ranger portrait upload
Open a Ranger sheet and upload/drop a new portrait using the existing portrait workflow.

Expected:
- image uploads normally
- original portrait is updated normally
- no yellow Foundry deprecation warning mentioning global FilePicker appears

## Gate B — Token Builder
Open Token Builder, create/save a round token.

Expected:
- token asset uploads to Realm Guard token-art folder
- Actor/prototype token updates normally
- no yellow Foundry deprecation warning mentioning global FilePicker appears

## Gate C — existing behavior
Expected:
- portrait framing still works
- Token Builder crop/zoom/offset still work
- existing Scene token update behavior is unchanged

## PASS criteria
qa.25 passes when portrait and token asset workflows work normally and the global FilePicker deprecation warning is absent.
