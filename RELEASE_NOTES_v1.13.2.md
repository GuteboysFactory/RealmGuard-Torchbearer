# 1.13.2 — Legacy Mixed table-play update

User-authorized stable release after the 1.14.0-qa.1–qa.3 playtests. The requested stable version is **1.13.2**, following 1.13.1; the QA version numbers do not rename the stable line.

All new table-play behavior applies **only to Realm Guard Legacy Mixed**. Strict Realm Guard, Mouse Guard 1E/2E and TB2E retain their existing workflows and rule behavior. The accepted 1.13.1 startup optimization remains unchanged. No TB2E activation, Tome work or campaign-data migration is included.

## Final conflict changes

- Back sits beside Abort in the GM footer. Preparation steps can be reviewed without repeating either side's Disposition roll. Returning to the latest resolved action uses the existing correction checkpoint and preserves resource costs, Learning and Nature tax; it does not grant a fresh roll or refund.
- GM makes one opposition Disposition roll and the captain makes **one shared roll for the player team**, optionally with Help. Each side's roll is reserved and committed once; repeated clicks or competing submissions cannot add another team total. A changed or reloaded roll client releases its abandoned reservation.
- With multiple players, that shared total must be distributed before equipment/cards. GM or a participating player can distribute the points; the sum must equal the existing team total. Invalid or stale submissions cannot mint or overwrite points. A solo player receives the total directly, without a distribution step.
- The player manually chooses from the acting character's own Skills for both team Disposition and action tests, including Skills outside the conflict type's standard list. No Skill is silently chosen. Its real rating or Beginner's Luck is used in the ordinary roll dialog.

## Included QA improvements

- End Session: saved/searchable participant list, Realm Guard styling, Creed and Mortal Crisis, aligned Belief/Goal choices, distinct MVP and Teamworker/Workhorse recipients, one Embodiment recipient and uncapped earned Persona.
- Conflict: searchable teams, multiple temporary opponents without Actor/Contact creation, explicit equipment preparation, inventory and Custom benefits, per-participant card assignment, hidden cards and one-action flips. Disarm disables the declared benefit without deleting inventory.
- One active player has no actor selector. Two players alternate. Three or more choose freely without consecutive actions by the same active player. Knockouts invalidate exhausted assignments; a sole survivor can act repeatedly.
- Normal and conflict rolls show original dice immediately, keep decisions and final results on one chat card, and highlight pending choices. A prepared Wise is used once; an unprepared relevant Wise may reroll failures for 1 available Persona, with a clear decline option.

## Verification and installation

Automated checks cover runtime syntax, the full regression suite, other-profile isolation and real Chromium forms with all system stylesheets. The final tests exercise the shared team roll, cross-client reservation/reply flow, manual off-list Skill choice, GM/player distribution, stale/invalid submissions, solo bypass and Back without rerolls. Controlled fixtures supplement the user's earlier Foundry QA tests; they are not a claim of a new live multiplayer Foundry session.

Use the **stable manifest**:
https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/stable/system.json

Testers coming from 1.14.0-qa.3 are moving to a lower numbered stable release. The QA manifest continues to point at its QA build; use the stable manifest to switch channels and check that the installed version becomes 1.13.2. World/character data is preserved. See TEST_PROTOCOL_v1.13.2.md for verification.
