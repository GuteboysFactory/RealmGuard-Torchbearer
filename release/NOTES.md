# 1.13.5 — Legacy Mixed playtest follow-up

Stable release following 1.13.4, authorized after the group's QA.11 review. Runtime and assets are identical to the accepted 1.14.0-qa.11 package; the public stable version is **1.13.5**. Changes apply to Legacy Mixed. Other profiles retain their prior behavior through the frozen baseline.

- Conflict supports player opposition, multiple participants and Captain-only hidden plans. Starting Disposition is allocated once and damage/recovery stays synchronized. Back, roll correction, Beginner's Luck and extra dice remain available. The Compromise replaces the play view when resolved, shows the actual winning participants (including temporary opposition such as weather), records the agreed outcome and closes for everyone. Clicking Conflict afterwards starts a new setup.
- Chat challenges open the ordinary Skill roll dialog with the correct Obstacle, Conditions and Help. Visible scene opponents can be searched and selected directly. Players can Undo their own rolls, restoring resources, Trait/Wise usage and Learning, including Beginner's Luck. The red/green Respond button becomes “Name Responded” after a completed response; cancelling keeps it pending and Undo restores pending status.
- Clearer chat separation, square card edges, full-width names and less redundant framing. Pending resource choices are more conspicuous. Chat follows new messages and late card growth. The chat Custom Roll button opens an independent dice-pool dialog without choosing an Actor.
- GM Dock has saved, per-GM quick-access choices, external provider support, minimization and one row of buttons. Settings, library administration and diagnostics are in Configure Settings. The marked native token-HUD shortcuts are hidden for GM and players.
- Session Break shows a shared adjustable countdown (10 minutes by default), character presence and return/start/expiry tones. End Session is visible to all. Session-scoped Wise use resets at the next session. Legacy PC/NPC Fate and Persona balances have no storage ceiling; zero floors, Checks limits and per-roll Persona dice rules remain.
- NPC Quick Skills have a compact per-Skill OB button and normal-roll hint, without the separate VS checkbox or toolbar OB button. Import routing respects explicit drop targets and source categories/folders instead of placing every Item in Gear.
- Complete approved Talent names and descriptions are organized by level. PC/NPC Custom Talents can be saved as shared Items. The supplied Traits are organized in Traits; 121 descriptions produce 120 unique names, retaining both Stubborn texts. Shared content is player-readable unless explicitly hidden by the GM; existing GM edits and permissions are preserved.
- GM scene tools can create named map places/Items with notes, search-friendly icon choices and explicit player visibility. Token menus put the Actor name above the actions.
- Overview replaces five large visible drive fields with clickable Nature/Belief/Goal/Instinct/Creed headings and one visible editable field. Selected/hovered headings are green; text height grows and shrinks automatically from one line.

Verification: 191 runtime syntax checks, 134 smoke-test files, release preflight and five controlled Chromium suites passed during QA. Production modules/templates/styles run with controlled Foundry documents, canvas and transport; this is distinct from a full session with the group's extensions. The user authorized stable publication; the next game night remains the broader playtest.

Install/update with the stable manifest:
https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/stable/system.json

Users manually testing 1.14.0-qa.11 must switch to the stable manifest and may need a manual reinstall because 1.13.5 sorts below that QA version. The QA channel remains unchanged.
