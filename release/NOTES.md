# Realm Guard / Torchbearer v1.12.0-qa.5 — M10B.5 Gear / Inventory / Conflict Routing

Built after v1.12.0-qa.4 M10B.4 passed full live Foundry VTT 13.351 QA.

This QA build moves MG1E-family Gear, Inventory and Conflict ownership away from binary Strict-vs-Legacy checks and into the resolved Rules Profile capability layer. Mouse Guard 1E remains FOUNDATION_ONLY, non-selectable and non-live.

Highlights:
- MG1E foundation advances to profile v6.
- Generic MG1E-family Inventory, weapon, armor, Conflict Tool, Weapons of Wit, Disarm, action-skill and starting-Disposition policy.
- MG1E source Fight table resolves Fighter / Nature / Fighter / Nature; Realm Guard Strict retains the v1.6 Fighter / Fighter / Fighter / Fighter override.
- MG1E Chase starting Disposition uses Scout + Nature; Realm Guard Strict uses its v1.6 Scout + Health rule.
- MG1E retains Hook and Line plus Light / Heavy Armor.
- Strict Realm Guard aliases Hook and Line to Whip, presents Leather / Chainmail and retains Plated Armor.
- Live Conflict UI and M5 conflict-tool handoff route through active profile capabilities instead of direct Strict identity checks.
- Legacy Mixed keeps STRUCTURED placement authority, its existing Conflict compatibility tables and Unarmed -1D.
- LOOSE profiles preserve hand/worn/container/unassigned metadata as presentation without making placement rules-authoritative.
- Historical Strict M10A.4 Gear / Inventory / Conflict APIs remain compatibility wrappers over M10B.5.
- NPC Fate / Persona / Checks are compacted into a responsive resource bar beneath identity; long-name typography is responsive.
- No MG1E activation, no automatic inventory migration and no destructive Actor/Item conversion.
- Foundry target remains 13.351; v1.11.0 remains STABLE / GOLD.
