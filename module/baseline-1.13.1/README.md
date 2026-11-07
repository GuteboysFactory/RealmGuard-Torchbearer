# Preserved profile behavior

These five source snapshots come from stable 1.13.1, commit 5085c07ee4c330c159c0f706d889587bcae68dcd. Only relative import paths were relocated.

The Legacy Mixed playtest patch uses these implementations for Strict Realm Guard, Mouse Guard 1E/2E and TB2E. The new conflict and session installers are bypassed for those profiles. Changed Actor/sheet callbacks dispatch at invocation time, including ApplicationV2 action maps and NPC-sheet inheritance. Shared models, policies and startup repair stay in their original modules. This temporary compatibility boundary avoids rewriting or migrating campaign data.

When changing these areas later, update the intended profile implementation explicitly and run the profile isolation tests. Do not silently extend the Legacy Mixed patch to other profiles.
