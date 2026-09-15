Realm Guard / Torchbearer v1.7.0-qa.8 — final Equipment cosmetic layout pass.

This patch closes the current Inventory cosmetic pass by moving Unassigned Gear away from the right side of Equipment and placing it directly beneath Containers in the left rail.

New / corrected in qa.8:
- desktop Inventory layout is now two columns instead of three
- left rail: Containers first, Unassigned Gear directly below
- Equipment owns the full main/right column
- Unassigned Gear no longer sits as a separate right-side panel next to Equipment
- responsive order below ~900 px is Containers -> Unassigned Gear -> Equipment
- qa.7 Equipment Figure Source / Ancestry / settings gear button remain unchanged
- no Inventory interaction, capacity, 2H, container or placement rules are changed

Important preservation:
- M5 Gear / Inventory / Conflict Tool CORE services remain shadow/read-only
- Legacy Mixed remains sole live Inventory and Conflict authority
- Token Builder portrait/token behavior remains unchanged
- M2, M3 and verified M4 behavior remain unchanged

QA protocol: TEST_PROTOCOL_v1.7.0-qa.8.md
Foundry target: v13.351.
Cosmetic intent: treat this as the closing layout pass unless later player feedback or bugs justify reopening visual work.