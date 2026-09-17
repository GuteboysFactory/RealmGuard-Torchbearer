# v1.8.0-qa.10 — Skill Roll UX & Beginner's Luck Split

- Trained Skills now present explicit **Quick Roll** and **Roll Window** actions.
- Untrained / Beginner's Luck Skills get the same Quick Roll / Roll Window choice.
- Full Roll Window keeps **Help / Teamwork always visible** and uses the existing teamwork workflow unchanged.
- Untrained canonical Skills are grouped by Beginner's Luck base: **Will-based** and **Health-based**; custom/unclassified Skills use **Custom / Choose**.
- The old ambiguous `Will / Health` display fallback is removed from the active Skills UI.
- Quick Roll preserves automatic Conditions, Turn Manager claims, Fate/Open 6s, advancement/learning and existing actor roll authority. Complex Versus or GM Obstacle Approval cases automatically fall back to Roll Window instead of bypassing required choices.
- Farmer is aligned as a physical Beginner's Luck Skill and therefore uses Health.
- Obsolete one-shot qa26–qa30 patch workflows and patcher scripts are removed. Reusable smoke tests remain.
- No M6 Conflict resolution/state authority changes.
