Realm Guard / Torchbearer v1.9.0-qa.32 — Structured Recruitment Relationships.

- Recruitment relationship identity is now structured at source.
- Mother/Father: Name / Profession / Location.
- Senior Artisan: Name / Profession / Location.
- Mentor: Name / Ranger role / Location.
- Friend: Name / Profession / Location.
- Enemy: Name / People-Type / optional Role-Profession / Location.
- Alive/dead is intentionally not part of Recruitment identity.
- Profession suggestions come from Quick NPC Library; custom text remains allowed.
- M8 prefers flags.realm-guard.recruitmentRelationships when present and keeps legacy fallback for old Rangers.
- Legacy Mixed relationship fields are still written for compatibility.
- Smart relationship NPC generation now receives clean names plus separate matching metadata.
- Service allocation uses Station-bounded dropdowns (0..Service total), and the counter is now bound directly to the active dropdowns in the Recruitment dialog for reliable live updates.
- Specialty does not count toward the required Service total.
- No Recruitment rules, Circles, NPC stats, or M8 status/history rules changed.

QA: TEST_PROTOCOL_v1.9.0-qa.32.md
