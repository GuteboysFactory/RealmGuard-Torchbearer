# Realm Guard / Torchbearer v1.9.0-qa.22 — NPC + Item Parchment Harmony QA

## Gate A — NPC visual pass

Open an existing NPC.

Expected:
- framed parchment fills the NPC window
- dark NPC identity header remains clear
- stat cards are light parchment
- Quick Skills, Conditions, Traits, Wises, Talents and Gear read as paper sections
- GM Notes is a light writing area

Test:
- NPC Skill roll
- Ability roll
- Condition toggle
- edit one Trait/Wise/Gear entry
- Custom Roll
- Token Builder button

## Gate B — Item sheets

Open at least:
- Gear / container
- Skill
- Trait
- Wise
- Condition
- Token of Power
- Talent

Expected:
- same framed parchment visual language
- fields are readable with dark ink on paper
- select/input/textarea controls remain editable
- specialized blocks retain clear hierarchy
- no field disappears or becomes unreadable

## Gate C — Gear item

On a Gear container Item:
- change quantity
- slot size
- bundle
- wield hands
- container type
- pack capacity

Expected:
- values save normally
- no layout clipping

## Gate D — resize

Resize NPC and Item windows wide/narrow/tall/short.

Expected:
- frame remains intact
- inputs and panels do not overflow
- compact Item windows retain usable content area

## Gate E — isolation

Expected:
- Ranger Character, Skills and Inventory/Gear remain unchanged from qa.21
- Conflict UI remains unchanged
- no M8 gameplay/data behavior introduced

## PASS criteria

qa.22 passes when NPC and Item sheets visually belong to the same parchment system as the Ranger sheet and all existing interactions/data editing continue to work.
