# 1.14.0-qa.1 — Table test protocol

Baseline: stable 1.13.1, including the already accepted startup fix. Candidate scope is the 14 collected Realm Guard playtest points plus clarified inline chat decisions. Start in a separate test world using the table's active supported profile; repeat the key roll/award checks when switching supported profiles.

## Automated sandbox

- Run `node qa/release-preflight.mjs`, syntax checks for all runtime modules/sheets and all `qa/*-smoke.mjs` scripts.
- Run `node qa/conflict-session-browser.mjs` with Playwright/Chromium available. Optional PLAYWRIGHT_MODULE and PLAYTEST_CHROME select an existing test runtime; PLAYTEST_SCREENSHOT saves its final view.
- Unit integration covers original chat dice, declines/acceptances, resource order, all five Actor roll pipelines across four profiles, free rolls with/without the parity adapter, Wise/Trait/Talent/Token decisions, duplicate clicks, ownership and serialized resource spending.
- Browser integration exercises production functions and actual DOM: scrolling, expansion state, resizing, observer view, per-action Skill exceptions, chat buttons/pulse, temporary opposition for all nine types, simultaneous disposition/action submission, stale/unauthorized submissions, Learning correction, custom Skill creation, reward review, reopen and last-action correction without repeated Learning/Nature tax.
- The fixture server serves only this repository and never connects to, writes to or replaces a user's Foundry world. A live Foundry-server multiplayer check remains the purpose of the user test below.

## The 14 requested points

| # | User check | Expected result |
|---|---|---|
| 1 | Roll a Skill with failures and a six, with a relevant Wise/Talent/Token selected. | Original dice appear first. Applicable reroll/Fate questions pulse on the same chat card; × declines. Final result replaces the pending state and retains the original dice/history. Persona bonus dice remain a pre-roll choice. |
| 2 | In Chase, GM selects Fighter as an exception for a Ranger action. | Fighter is offered for that action; the next action returns to its profile defaults. Players cannot create GM exceptions. |
| 3 | Allocate the Ranger team's Disposition to individuals, then assign a loss so one reaches zero. | Team totals remain correct. That Ranger cannot act/Help. The GM can reassign their unrevealed/current unrolled card. Pending allocation blocks the next test. |
| 4 | Start different conflict types against a temporary named opponent. | The configured opponent pool is usable; no Actor is added to the campaign directory. |
| 5 | Resize the conflict window on a smaller screen. | Its body scrolls, controls remain reachable, and selected dimensions survive updates. |
| 6 | Scroll down, select/clear cards, change an acting Ranger or weapon, and receive a remote update. | The window retains its scroll position. |
| 7 | Open/close instructions and roll explanations. | Explanations are collapsed by default and expand without interfering with form values. |
| 8 | Connect the captain, another Ranger owner and a non-owning observer. | Everyone can follow goals, disposition and revealed actions. Only permitted users can plan/roll; opposing unrevealed cards stay hidden. |
| 9 | Finish a conflict accidentally, reopen it, then use Back to last action and correct successes. | Outcome/action can be corrected. No duplicate resource spending, Learning award or Nature tax occurs. Original character-side costs remain available for a separate GM correction. |
| 10 | Resolve an action using a standard Skill and a GM exception. | The action chat identifies the actual Skill / Ability used. |
| 11 | Open End of Session. | Embodiment is alongside MVP and Workhorse, with the same profile-specific eligibility rules. |
| 12 | Review awards, use Back/Cancel, then Finish Session once. | Back/Cancel awards nothing. Finish approves displayed awards without per-character approval checkboxes. Reopening cannot award the same cycle twice. |
| 13 | Use the Skill pencil to edit Pass/Fail ticks and Beginner's Luck attempts. Reload the sheet. | Corrected values persist; saving corrections alone does not request automatic advancement. |
| 14 | Create two custom Skills, one based on Will and one on Health. | The chosen ability is saved and used for Beginner's Luck; it can be changed in the Item editor. |

## Additional chat checks

Test a no-six roll, insufficient Fate/Persona, accepting and declining each available reroll, clicking an answer twice, and receiving another player's pending question. Only relevant options should be offered; declines consume nothing. The actor's pending roll must finish before a second local roll can begin. Test MG2E Of Course with the last available Persona already selected as pre-roll bonus dice: it must not be offered using that already spent point.

Reload while a question is pending: the old card must identify the interrupted test and must not silently resume or spend again. Check character-side costs before choosing to make a new roll.

Report the active profile, which step failed, and a screenshot of the relevant chat/conflict state. This QA candidate is not a stable promotion.
