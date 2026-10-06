# TEST PROTOCOL — v1.13.0-qa.11

## M10D.10 Foundry VTT 13.351 gate — TB2E Inventory / Gear bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Inventory coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.11; no boot errors.
- m10d status: phase M10D.10, shadowReadyDomains includes inventory, inventoryShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- inventory.getStatus(): PARTIAL, TB2E_INVENTORY_GEAR_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.

### Gate B — Locations / storage labels
- Head wornSlots=1; Neck wornSlots=1; Hands totalWornSlots=2 and totalCarriedSlots=2; Torso slots=3; Belt slots=3; Pocket smallItems=1.
- Carried 4 => carriersRequired=2, handsPerCarrier=2, totalHands=4.
- Wield plan accepts caller-supplied wieldHands but performs no placement write.
- Feet/Legs remain source wording boundaries rather than invented numeric capacities.

### Gate C — Containers / belt / two-handed
- Backpack => 2 torso worn, 6 pack, negativeTests Fighter/Dungeoneer, magnitude UNAVAILABLE.
- Satchel => 1 torso worn, 3 pack, no negative tests.
- 7 used slots in Backpack => overCapacity=true.
- nested Satchel with inner .5 + contents 1 => requiredNestedSlots=1.5 and OUTER_MUST_FIT_INNER_AND_CONTENTS.
- Belt Pack1/Carried1 unbundled allowed; bundled or size2 rejected by plan.
- two-handed with one hand => DROP guidance; two hands => compliant.
- no automatic backpack penalty or item movement.

### Gate D — Cache / damage / starting boundaries
- damaged container + SOME contents risk => GM_ADJUDICATION; no content loss mutation.
- Camp cache with Check => 12 slots, canBuild=true, one Check preview.
- Town cache with parent/friend home => free build, canBuild=true.
- built cache => transferAtWill=true, but no item transfer committed.
- Magician + Backpack => spellBookRequired=true; clothes/belt slotless.
- Theurge + Satchel => holyRelicsRequired=2.
- no automatic starting-gear grants.

### Gate E — source boundaries / zero writes
- status boundaries include missing DG148 catalogue, DG156-157 weapon effects, no armor automation, no backpack penalty magnitude inference and no visual-table autogrants.
- snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.
- placement/container/cache/gear-grant/item-transfer mutation flags remain false.

### Gate F — Existing profiles / release
- representative MG2E Inventory or normal Skill roll and Recruitment/Create Ranger remain normal.
- qa.11 release assets/workflow green.
- QA=1.13.0-qa.11; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Inventory / Gear shadow contract. It does not authorize TB2E activation, item migration, placement writes, automatic gear effects or full gear/weapon/armor rules.
