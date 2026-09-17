Realm Guard / Torchbearer v1.8.0-qa.10 — Skill Roll UX & Beginner's Luck Split.

This patch adds explicit Quick Roll and Roll Window actions for trained Skills and Untrained / Beginner's Luck Skills, keeps Help / Teamwork visible in the full Roll Window, and separates untrained canonical Skills into Will-based and Health-based groups.

Quick Roll keeps the existing live roll authority: automatic Conditions, Turn Manager claims, Fate/Open 6s and advancement/learning remain in the current actor roll pipeline. Cases that require an explicit GM/user decision — Obstacle Approval or ambiguous/unsupported Versus opposition — automatically open the full Roll Window instead of bypassing the workflow.

The active Skills UI no longer shows the ambiguous Will / Health fallback. Custom/unclassified Skills remain explicit and ask for a base ability when first rolled. Farmer is aligned as physical and therefore uses Health for Beginner's Luck.

Also removes obsolete one-shot qa26–qa30 patch workflows/patcher scripts while preserving reusable smoke tests. No M6 Conflict resolution/state authority changes.

QA protocol: TEST_PROTOCOL_v1.8.0-qa.10.md