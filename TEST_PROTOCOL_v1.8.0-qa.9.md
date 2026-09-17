# QA — v1.8.0-qa.9

1. Move/resize Conflict and Conflict Roll windows; click through actions and reopen dialogs. They must remain where the user left them. Reload and verify persistence. Resize viewport smaller and verify clamping.
2. Player opens Ranger Conflict roll and clicks Ask for Help. Only online Rangers participating in the Conflict receive requests.
3. Afraid participant: request is blocked before popup and the requester sees the reason. Recheck also blocks stale acceptance.
4. Helper can Offer Help or Decline and may add optional description.
5. Trained Skill Help should flow without an extra GM click. Wise/Ability/Synergy should request GM review. Approve and Reject both work.
6. Accepted Help appears in the roll dialog and contributes +1D per accepted helper up to the action limit.
7. Modifier Total is readonly. Change source and verify Condition contribution display recalculates. Maneuver/Tool modifiers remain automatic.
8. GM sets Story Modifier from Current Action; player sees it read-only and the roll uses it.
9. M6 regression: handoff/state/shadow mismatches remain 0; Conflict stacking and scroll remain good.
