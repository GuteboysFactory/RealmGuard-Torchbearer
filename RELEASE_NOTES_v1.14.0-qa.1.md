# 1.14.0-qa.1 — Conflict and table-play polish

QA candidate based on stable 1.13.1. The previously accepted startup optimization is retained. Stable channel promotion is separate from this test release.

## Rolls and chat

Skill, Ability, Beginner's Luck, automatic Versus, Nature Versus, Conflict and free-pool Custom Roll now publish their original dice immediately. Optional Wise, Trait, configured Talent and Token of Power rerolls and Fate/Open 6s are answered on that same chat card. Pending questions pulse until answered; an accessible small × declines without spending. The card retains the original dice and the answer history alongside the final result. Reduced-motion preferences use a static highlighted border.

Persona bonus dice and Nature tapping retain their pre-roll selection and cost. MG2E Wise effects retain their distinct legal post-roll costs and order. Selecting an optional reroll does not consume its use until it is accepted. Only the originating user's client can answer its pending card, and duplicate clicks are ignored. One character cannot start a second local roll while its first roll is awaiting an answer. A reloaded client marks abandoned questions as interrupted; it does not replay the test or refund previously committed resources.

Talents now have an explicit optional failed-dice reroll effect in their Item editor. Existing +D and manual Talent definitions are preserved; descriptions are not interpreted or automatically converted to rerolls.

## Conflict

- GM Skill exceptions apply to one side of one action, including Skills outside that conflict type's standard list. The selected Skill keeps its actual rating and Beginner's Luck rules.
- Optional individual Ranger Disposition allocates the existing team total. The GM distributes starting/current points and chooses who takes losses. Unallocated changes block further tests and card locking. Zero-point Rangers cannot act or Help; remaining planned cards can be reassigned to active Rangers.
- Temporary named opposition with a configurable pool works in all nine existing conflict types and creates no campaign Actor. Existing Actors remain selectable.
- Scroll position, expanded explanations, entered compromise notes and user-selected window dimensions survive rerenders. Narrow windows have a more compact layout; explanatory text folds away.
- Every connected user can follow the public conflict window, while card planning and action permissions remain restricted. Unrevealed plans are not published.
- The completed conflict can be reopened to outcome review or restored to its last action for a GM correction. Previously spent resources, recorded advancement tests and Nature tax are retained, preventing duplicate application on re-resolution. Any correction to those character values is a separate explicit GM edit. Temporary tools are cleaned up on completion and restored if the conflict is reopened.
- Used Skills appear clearly in resolved action cards. Simultaneous disposition/action submissions are serialized; stale action replies and player submissions for the GM side are rejected.

## Session and Skills

Embodiment nominations appear with MVP and Workhorse. Finish Session approves the displayed awards in one step, while Back/Cancel, profile-specific validation, resource caps and duplicate-finalization guards are retained.

Creating a custom Skill asks for Will or Health. The Skill Item editor exposes that choice and clearly labels manual Learning correction, including Beginner's Luck attempts. Correcting ticks does not itself request automatic advancement.

## Scope and validation

The four supported profiles remain Legacy Mixed, Strict Realm Guard, Mouse Guard 1E and Mouse Guard 2E. No TB2E activation, migration, Tome/Vault feature or additional startup work is part of this patch.

Validation combines the full existing smoke suite with deterministic production-roll tests and a separate real-Chromium DOM sandbox. The sandbox uses Foundry-shaped settings, documents, permissions, dice and socket fixtures; it is not a live Foundry-server session. The test-world checklist is TEST_PROTOCOL_v1.14.0-qa.1.md.
