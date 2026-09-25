# Realm Guard / Torchbearer v1.12.0-qa.1

## M10B.1 — Generic Profile Presentation & Rule Router

This QA build begins the Mouse Guard 1E profile line without making MG1E selectable.

### Added
- Read-only generic capability snapshots built from resolved Rules Profiles.
- Separate rule and presentation capability sections.
- Explicit non-destructive data-preservation contract for profile-specific data.
- CORE API access to active and arbitrary resolved profile capabilities.
- Shadow parity smoke for Legacy Mixed, Realm Guard Strict and the MG1E foundation.

### Unchanged
- Legacy Mixed live behavior.
- Realm Guard Strict live behavior.
- Profile switch targets.
- Actor/Item/Journal data.
- MG1E remains FOUNDATION_ONLY and cannot be activated.

**Stable fallback:** v1.11.0 STABLE / GOLD.
