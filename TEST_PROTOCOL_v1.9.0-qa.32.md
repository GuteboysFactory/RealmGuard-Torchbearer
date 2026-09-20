# v1.9.0-qa.32 — Structured Recruitment Relationships QA

## Gate A — Service counter
Create a Scout and go to Service & Specialty.

Use the Fighter dropdown and change 0 to 2.

Expected:
- Required service checks immediately changes from 0 / 6 to 2 / 6 without leaving the field.
- If you go Back and return to Service & Specialty with saved allocations, the counter should immediately reflect those restored dropdown values.

Use the Pathfinder and Scout dropdowns and choose 2 in each.

Expected:
- counter immediately becomes 6 / 6
- complete state is visually indicated

Increase one field again.

Expected:
- counter becomes 7 / 6
- over state is visually indicated
- Continue still refuses anything except exactly 6 Service checks

Each dropdown should offer 0 through 6 for a Scout. Specialty selection must not change the 6 / 6 counter.

## Gate B — Parent structure
Go to Relationships.

Expected for Mother and Father:
- separate Name
- Profession
- Location
- no alive/dead field or prompt

Enter:
- Mother: Gertrud / Miller / Bree
- Father: Gunther / Cartographer / Bree

## Gate C — other relationship structure
Enter:
- Senior Artisan: Bert / Smith / Bree
- Mentor: Menalon / Ranger Veteran / Fornost
- Friend: Svenne / Innkeeper / Bree
- Enemy: Ogluk / Orc / optional role / Angmar

Expected:
- each identity component is separate
- professions offer Quick NPC-backed suggestions
- locations offer suggestions but accept custom text

## Gate D — Review
On Review & Create:

Expected:
- names remain clean
- profession/location shown separately in the relationship summary
- no combined name strings such as "Gertrud, Miller, Bree" being treated as the person's name

## Gate E — M8 / Smart NPC review
Create the Ranger.

Expected:
- post-Recruitment smart NPC review shows clean person names
- suggested templates use profession / role / people / location context
- Mother/Father/Senior Artisan/Mentor/Friend/Enemy all resolve from structured data

## Gate F — create NPCs
Choose Create All or Create Selected.

Expected:
- created Actor names are just Gertrud, Gunther, Bert, Menalon, Svenne, Ogluk
- no Actor names contain appended profession/location text
- Actors go to NPC - PC Relations
- links are written back correctly

## Gate G — compatibility
Open an older Ranger created before qa.32.

Expected:
- old relationship parsing still works
- old relationship fields are not deleted
- M8 fallback remains available

## PASS
qa.32 passes when new Recruitment relationships are cleanly structured at creation time and the Service counter updates live and correctly.
