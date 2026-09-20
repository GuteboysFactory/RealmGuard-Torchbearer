# Realm Guard / Torchbearer v1.9.0-qa.32 — Structured Recruitment Relationships

This build cleans up the Recruitment relationship step at the source and fixes the Service & Specialty live counter.

## Structured relationship identity
Recruitment now stores relationship people as structured data instead of overloading one free-text field.

### Parents
Mother and Father each have:
- Name
- Profession
- Location

Alive/dead is deliberately not part of Recruitment identity. That remains a GM/story state.

### Senior Artisan
- Name
- Profession
- Location

Profession defaults from Apprenticeship where useful.

### Mentor
- Name
- Ranger role / station
- Location

### Friend
- Name
- Profession / Specialty
- Typical Location

### Enemy
- Name
- People / Type
- optional Role / Profession
- Location

## Profession and location selection
Profession suggestions are generated from the Quick NPC Library itself.
Fields remain editable/autocomplete-style so custom entries are still possible.

Location suggestions use common Realm Guard / Middle-earth locations while still allowing custom text.

## Data model
New Recruitment flag:
- flags.realm-guard.recruitmentRelationships

It stores structured Mother, Father, Senior Artisan, Mentor, Friend and Enemy records.

M8 now prefers this structured data when present.

Legacy Mixed fields are still written for compatibility.

Old Rangers without the new structured flag continue to use the existing legacy parser.

## NPC creation
Because M8 receives clean structured identity:
- Actor names stay clean
- profession/location remain separate
- smart Quick NPC template matching gets stronger inputs

Example:
Gertrud / Miller / Bree
-> PersonRecord.name = Gertrud
-> profession = Miller
-> location = Bree
-> generated Actor name = Gertrud

## Service & Specialty live counter
Service allocation now uses station-bounded dropdowns instead of number inputs, and the Required service checks display updates live from those selections.

Example for a Scout:
Fighter dropdown -> 2
-> counter immediately updates to 2 / 6

The counter:
- each Skill dropdown offers 0 through the Station's required Service total
- sums all Service allocations live
- marks under / complete / over
- still validates exact allocation on Continue
- does not count Specialty toward the required Service-check total

## Explicitly unchanged
- Recruitment rules
- Station service totals
- Specialty bonus behavior
- Circles rules
- M8 status/history behavior
- Quick NPC stats/templates
- relationship NPC destination: NPC - PC Relations
