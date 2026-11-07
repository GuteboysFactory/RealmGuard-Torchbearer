# 1.14.0-qa.2 — Legacy Mixed conflict and session playtest

This QA release combines the table-play improvements with the later card-secrecy and End Session requests. **All new playtest behavior is restricted to Realm Guard Legacy Mixed.** QA.1 incorrectly applied shared changes to other profiles; QA.2 restores the affected Strict Realm Guard, Mouse Guard 1E/2E and TB2E flows to their stable 1.13.1 implementations. Existing campaign documents are preserved. Stable remains 1.13.1; promotion requires separate user acceptance.

## Rolls

- Original dice appear immediately on the same chat card that later holds optional decisions, their history and the final result. This includes normal Skill/Ability tests, Beginner's Luck, automatic Versus, Nature Versus, Conflict and free-pool Custom Roll.
- Relevant Wise, explicitly configured Talent, Token of Power and Fate/Open 6s choices appear inline. Questions pulse until answered; the small accessible × declines without spending. Reduced-motion preferences receive a static highlight. Only the originating user's client answers; repeated clicks cannot spend twice.
- Persona bonus dice and Nature tapping retain their pre-roll choices. Trait effects follow the existing Legacy Mixed rules: this patch does not import MG1E's level-3 Trait reroll into Legacy Mixed. Existing dice/success effects are preserved. Explicit Talent rerolls remain an optional authored effect; prose is never interpreted as a new rule.
- A second local roll for the same character waits until pending decisions finish. Reloaded pending cards identify the interruption rather than replaying the roll or refunding committed costs.

## Conflict

- GM can grant a Skill exception for the current action. Actual ratings and Beginner's Luck still apply, and the used Skill/Ability is clear on the result card.
- Optional individual Disposition divides the existing team total. GM allocates points and losses; zero blocks acting and Help. Unallocated changes must be resolved before continuing.
- Any conflict type can use temporary named opposition without creating a world Actor.
- The resizable window adapts to small screens and retains scroll, expanded explanations and unfinished compromise notes. Instructions can be folded away. Connected observers follow public progress.
- Opposing plans stay hidden in both GM and player views, including after locking. **GM flips one action at a time with Flip Action.** Future cards remain hidden. This is normal interface secrecy; the GM still owns the underlying conflict authority.
- Accidental completion can be reopened, and the latest resolved action corrected. Existing resource costs, Learning and Nature tax are not applied again or automatically refunded. Serialized submissions reject stale actions and player submissions for the GM side.

## End Session and Skill editing

- End Session starts with player-owned/assigned character Actors, excluding NPCs and GM-only characters. The GM can adjust that list immediately; it is remembered for later sessions. Searching by name adds characters or NPCs, and × removes them. Deleted Actors and duplicate saved IDs are ignored; an explicitly empty list stays empty. Adding/removing someone preserves the other award selections.
- End Session uses Realm Guard's parchment, forest and gold appearance, readable controls and collapsible guidance. Embodiment sits beside MVP/Workhorse. Back retains selected criteria; Finish Session is the reward approval, without per-character approval checkboxes.
- Skill editing exposes manual Learning/Beginner's Luck corrections. Custom Skill creation and editing allow Will or Health as the Beginner's Luck basis.

## Verification and boundaries

Automated checks cover runtime syntax, the full regression smoke suite, direct comparison with preserved stable implementations, and Chromium tests of production modules with controlled Foundry documents/settings. Browser checks cover hidden cards/explicit flips, all nine temporary opposition types, scroll/resize, chat decisions, correction/reopening, roster search/persistence/removal/empty selection, Back, readable styling and the unchanged other-profile installers.

These are controlled browser tests, not a live Foundry multiplayer acceptance session. Follow TEST_PROTOCOL_v1.14.0-qa.2.md in a test world before accepting the patch. The accepted 1.13.1 startup optimization is retained. No Tome work, profile activation, data migration or stable promotion is included.
