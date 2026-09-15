Realm Guard / Torchbearer v1.7.0-qa.4 — M5 Equipment Artwork + Token Builder UX correction.

This patch corrects the two visual/UX issues identified after qa.3: the Equipment fallback/mannequin look and the Token Builder portrait workflow.

New / corrected in qa.4:
- paper/mannequin Equipment figures are formally retired (`paperFiguresAllowed: false`)
- Custom Figure with no custom image falls back to detailed dark Ranger artwork, never a paper figure
- Ancestry Figure for Dúnadan, Human, Elf, Dwarf and Halfling/Hobbit uses the same detailed dark-fantasy Ranger art direction with ancestry-specific proportions
- unknown/custom ancestry falls back to detailed Neutral Ranger artwork
- no environmental scene is baked into the Equipment figure artwork
- restores local desktop image drag/drop into Quick Token Builder
- dropped PC artwork becomes the preserved Character Portrait source
- PC Character Portrait is kept square/rounded-square on the sheet
- generated token remains a separate round PNG used by Prototype Token / Scene tokens
- Token Builder is prevented from replacing a PC's Character Portrait with the generated round token
- legacy qa.3 Rangers that had switched to Token Portrait are repaired back to preserved original artwork when possible

Important preservation:
- Equipment visuals remain presentation-only
- inventory zones, capacities, 2H locking, containers and gear assignments are unchanged
- Legacy Mixed remains sole live inventory authority
- M2, M3 and verified M4 behavior remain unchanged
- Conflict remains on the Legacy adapter path until M6

QA protocol: TEST_PROTOCOL_v1.7.0-qa.4.md
Foundry target: v13.351.
Approved baseline: v1.6.0-qa.6 PASS / M4 VERIFIED; M5 remains under QA.
