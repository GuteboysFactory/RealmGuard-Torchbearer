# Realm Guard / Torchbearer v1.9.0-qa.42 — Default NPC Template Portraits

qa.42 is the final Quick NPC presentation patch before M9.

## Default portrait pack
The supplied **Default pictures** art pack has been normalized to lightweight WEBP assets and packaged with the system under:

`assets/actors/default-npcs/`

63 default portraits are included.

## Quick NPC templates
Quick NPC Library is now **v2.2.0**.

Every generated Quick NPC template receives a deterministic packaged default portrait.

Selection is role/culture aware:
- Rangers use Ranger/Scout/Hunter/Healer variants where appropriate
- Common folk use role portraits such as Innkeeper, Farmer, Smith, Carpenter, Stablemaster, Healer and Cartographer
- Dwarves / Elves / Hobbits / Dunlendings use culture-specific defaults
- Orc roles use Orc Warrior / Archer / Soldier / Berserker / Chieftain / Warg-rider variants
- Trolls, Wargs, Undead and Wraith-like templates use creature-specific defaults
- unmatched human roles receive a safe human fallback

## Existing Starter NPC Templates
Starter Library seed version advances to **0.27.0**.

On first GM startup after update:
- generated templates still using the old generic `npc-creature.webp` portrait receive the new packaged default art
- prototype token texture is updated to the same portrait
- token remains centered, 1x1 and aspect-safe
- GM-selected custom portraits are preserved and are **not overwritten**
- renamed/edited starter templates remain protected by the existing non-destructive refresh rules

## Runtime behavior
NPCs created from Quick NPC templates inherit the template portrait automatically.

Dropping a custom image onto a template/create flow still overrides the packaged default exactly as before.

No rules, Social Network, Circles, Recruitment or CORE behavior changes are included in qa.42.
