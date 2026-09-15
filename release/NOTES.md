Realm Guard / Torchbearer v1.7.0-qa.12 — Ranger sheet scroll-position persistence hotfix.

This patch fixes the UX regression shown in live QA where the Character sheet jumps back toward the top whenever an action triggers an Actor/Item update and the sheet rerenders.

New / corrected in qa.12:
- Ranger sheet now remembers scroll position before update-triggered rerenders
- scroll position is restored after the new DOM has rendered
- active Character/Equipment tab remains preserved as before
- nested/scrollable sheet areas are handled without changing gameplay data
- the fix is UI-state only: no Actor, Item, Inventory, Conflict or CORE authority changes
- adds automated smoke coverage for the scroll persistence bridge

Preserved from qa.11:
- M5 live shadow parity bridge remains active
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- Legacy Inventory and Conflict writers remain sole live authority
- Equipment Figure / Inventory layout remains locked
- PC square/original portrait + separate round token workflow remains unchanged
- Foundry FilePicker compatibility from qa.10 remains preserved
- M2, M3 and verified M4 remain unchanged

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.12.md`

Primary PASS condition: when the user is scrolled down in Character or Equipment and performs an action that rerenders the sheet, the sheet remains at the same working position instead of jumping back to the top.