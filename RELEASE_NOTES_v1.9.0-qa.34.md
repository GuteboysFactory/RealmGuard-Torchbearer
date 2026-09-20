# Realm Guard / Torchbearer v1.9.0-qa.34 — Service UX Simplification

qa.34 removes the unreliable live Service counter entirely and keeps the parts that are already verified: the Service dropdown values and Continue validation.

## Service & Specialty
The Service step now clearly states the exact number of Service Checks granted by Station.

Example for Scout:

SERVICE CHECKS: 6

Distribute exactly 6 checks across the Skills below.

Specialty adds 1 additional check and is not part of these 6 Service Checks.

## Allocation
Service allocation remains dropdown-based.

Each Skill offers:
- 0 through the Station's Service total

This keeps allocation clean and prevents invalid negative/non-numeric input.

## Validation
There is no live total display.

When Continue is pressed, Recruitment reads the selected Service values and validates the exact total.

If under:
- You selected 4 of 6 Service Checks. Allocate 2 more checks.

If over:
- You selected 8 of 6 Service Checks. Remove 2 checks.

If exact:
- Recruitment continues normally.

## Removed
- live Service counter row
- Service counter MutationObserver
- Service counter render/binding functions
- Service counter data attributes
- under/complete/over counter styling
- qa.33 counter observer smoke

## Unchanged
- Service rules and Station totals
- Specialty behavior
- dropdown-based Service allocation
- structured Relationships from qa.32
- M8 Social Network behavior
- Quick NPC / relationship NPC generation
