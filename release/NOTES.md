Realm Guard / Torchbearer v1.7.0-qa.14 — physical Conflict weapon source fix.

This hotfix corrects the live Fight planning bug where a stale/saved Conflict Tool named like a physical weapon (for example Staff) could appear even though the Ranger was visibly holding different Gear such as Sword + Shield.

New / corrected in qa.14:
- physical Fight/Fight Creature weapon names are now sourced from currently held Gear
- stale saved Conflict Tools named Sword, Staff, Bow, Shield, etc. no longer masquerade as equipped physical weapons during an active Fight
- if Staff is actually equipped as Gear, Staff remains available normally
- narrative/custom Conflict Tools remain supported according to their configured conflict types
- M5 CORE parity remains shadow-only and still uses Legacy Mixed as sole live authority

Preserved:
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- qa.13 accepted/rejected Inventory parity and declaration/disable parity
- qa.12 Ranger-sheet scroll-position persistence
- Equipment layout, portrait/token workflow, FilePicker compatibility
- M2, M3 and verified M4

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.14.md`

Primary PASS condition: a Ranger holding Sword + Shield sees Sword + Shield as physical Fight weapon sources and does not see a phantom Staff merely because an old saved Conflict Tool named Staff exists.