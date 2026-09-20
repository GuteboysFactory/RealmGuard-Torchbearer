# Realm Guard / Torchbearer v1.9.0-qa.23 — Recruitment Reactivity + Parchment Contrast Cleanup

This QA package closes the issues found in FireVisor's Recruitment / parchment test pass before M8 resumes.

## Recruitment
- Dunadan Nature "Current result" now updates immediately while answers are checked/unchecked.
- The live Nature value uses the same authoritative computation as Continue/validation.
- Homeland changes now replace the Homeland card and Skill/Trait choices immediately.
- Changing Homeland clears the prior Homeland Skill/Trait choice before showing the new lists.
- Back / Continue continue to commit through the existing Recruitment state flow.
- The old "click Continue to refresh" Homeland instruction is removed.

## Wise guidance
Recruitment-created Wises now explain:
- Wises are unrated in the current Realm Guard / Legacy Mixed profile.
- Tables using Mouse Guard 1st Edition-style rated Wises can represent them as custom Skills.

The Recruitment Guide carries the same guidance.

## Parchment contrast
- Character Overview Wises / Traits force dark ink in both CSS color and WebKit text fill.
- Skills Quick Roll / Roll Window controls use dark readable labels on their pale parchment buttons.
- NPC parchment panel prose/small text is darkened, including synced/injected information such as Known Information.

## Scope
No Actor/Item schema change.
No M8 Social Network implementation.
No Relationship NPC creation.
No Quick NPC Library work.
No CORE authority change.
