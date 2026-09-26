# Realm Guard / Torchbearer v1.12.0-qa.6 — M10B.6 Session / Circles / Progression Routing

Built after v1.12.0-qa.5 M10B.5 passed full live Foundry VTT 13.351 QA.

This QA build moves MG1E-family Session, Circles and Progression ownership into the generic Rules Profile capability layer while keeping Mouse Guard 1E FOUNDATION_ONLY, non-selectable and non-live.

Highlights:
- MG1E foundation advances to profile v7.
- Generic MG1E-family Players' Turn / Checks, End Session, Circles and advancement/progression policy.
- CORE M7 remains the Players' Turn engine: one free test, 1 Check for additional tests, alternation with solo exception, transferable Checks and 2-Check GM Turn recovery.
- End Session validation routes through the active profile rather than direct Strict identity checks.
- Strict/MG1E-family Level/Talent mechanics remain disabled while preserved Legacy Level, lifetime spend and Talent data remains untouched.
- Fate/Persona may still be spent under Strict without incrementing Legacy lifetime Level counters or unlocking Talents.
- Known Contact Circles gains the source-backed +1D under MG1E-family profiles; Legacy Mixed remains unchanged.
- Linked Hostile Enmity-Clause enemies gain +3s opposition starting Disposition in Argument/Speech conflicts.
- Historical Strict M10A.5 Session / Circles / Progression APIs remain compatibility wrappers over M10B.6.
- No MG1E activation, automatic NPC creation or destructive Actor/Item/relationship conversion.
- NPC header hotfix aligns Fate / Persona / Checks with the Character sheet's compact vertical right-side resource stack.
- Foundry target remains 13.351; v1.11.0 remains STABLE / GOLD.
