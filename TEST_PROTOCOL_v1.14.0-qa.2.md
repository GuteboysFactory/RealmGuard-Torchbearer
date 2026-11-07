# 1.14.0-qa.2 — Legacy Mixed acceptance checklist

Use a backed-up test world, select **Realm Guard Legacy Mixed**, and reload after updating. Check the installed version before starting. Stable stays at 1.13.1. This package supersedes QA.1 for the collected playtest work.

The automated suite uses production modules with controlled Foundry documents/settings and real Chromium DOM, loading every system stylesheet. It does not replace the GM/player acceptance session in Foundry. Strict Realm Guard, MG1E, MG2E and TB2E must retain their earlier behavior; do not activate TB2E to test this patch.

| # | User check | Expected |
|---|---|---|
| 1 | Make a normal Skill, Ability, Beginner's Luck, Versus and Custom Roll. | Original dice are visible immediately in chat. |
| 2 | Roll sixes; accept/decline Fate and applicable Wise/Token/configured Talent rerolls. | Questions pulse on the same card, × declines, final result follows the answers. Persona choices stay before rolling. Trait effects retain Legacy Mixed rules. |
| 3 | In Chase, grant a Fighter exception. | Only that action uses the exception, with the normal rating or Beginner's Luck. |
| 4 | Enable individual Disposition; distribute the team total, assign losses and reduce someone to zero. | GM controls allocation; zero blocks action and Help. Changed team totals require allocation before continuing. |
| 5 | Create a temporary opponent, including weather for Journey. | Opposition works without adding a permanent Actor. |
| 6 | Resize Conflict on a small screen. | Important controls remain reachable. |
| 7 | Scroll down; change cards/participants/tools and receive a remote update. | Scroll position is retained. |
| 8 | Fold/unfold explanations. | Guidance expands on demand without changing form values. |
| 9 | Connect GM, captain, another player and an observer. | Everyone follows public setup/progress; controls follow ownership. |
| 10 | Complete Conflict, reopen, then back up to the last resolved action and correct successes. | Correction works; no duplicate Learning, Nature tax or resource spend. Existing character-side costs are retained for explicit manual correction if needed. |
| 11 | Resolve a normal action and a GM Skill exception. | Actual Skill/Ability names appear on result cards. |
| 12 | Plan as player and GM, lock both plans, then Flip Action 1, 2 and 3. | Neither side sees the other's future choices. Locking alone reveals nothing. Only the flipped action becomes public. |
| 13 | Open End Session. | Embodiment is together with MVP/Workhorse. |
| 14 | Review rewards, Back/Cancel, then Finish Session and reopen. | Back preserves choices, Cancel awards nothing, Finish is the sole approval. The same cycle cannot be awarded again. |
| 15 | On first use check participants; search/add an NPC; remove a character; close and reopen. | Only player characters initially. The adjusted list is remembered. Existing award selections survive list edits. Try an empty saved list and a deleted saved Actor too. |
| 16 | Inspect End Session and Review on desktop and a small window. | Realm Guard parchment/forest/gold styling, readable fields and reachable buttons. |
| 17 | Edit Skill Pass/Fail and Beginner's Luck attempts, then reload the sheet. | Values persist; editing alone does not trigger automatic advancement. |
| 18 | Create custom Skills based on Will and Health. | The chosen basis persists and is used for Beginner's Luck. |

Also decline all optional chat choices once, double-click a choice, try another user's pending card, test insufficient resources, and reload during a pending choice. Old interrupted cards must not silently resume or spend again. Check already committed costs before rolling anew.

In separate profile test worlds, spot-check Strict/MG1E/MG2E rolls, Conflict and End Session against stable: no new inline question pipeline, individual Disposition controls or saved-roster UI. Their previous review approval checkboxes remain. TB2E activation is outside this patch.

Report the installed version, active profile, checklist number, observed result and a screenshot where useful. Stable publication requires separate acceptance after this QA test.
