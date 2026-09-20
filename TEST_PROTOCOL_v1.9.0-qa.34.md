# v1.9.0-qa.34 — Service UX Simplification QA

## Gate A — layout
Open Recruitment -> Service & Specialty.

Expected:
- no Required service checks counter row
- clear SERVICE CHECKS instruction with the Station total
- Service Skills still use dropdowns
- Specialty remains separate

## Gate B — under allocation
For a Scout allocate only 4 checks and choose a Specialty.

Click Continue.

Expected:
- Recruitment does not continue
- warning clearly states 4 of 6 selected and that 2 more checks are required

## Gate C — over allocation
Allocate 8 checks.

Click Continue.

Expected:
- Recruitment does not continue
- warning clearly states 8 of 6 selected and that 2 checks must be removed

## Gate D — exact allocation
Allocate exactly 6 checks and choose a valid Specialty.

Click Continue.

Expected:
- Recruitment proceeds to the next step

## Gate E — Specialty separation
Change Specialty without changing Service dropdowns.

Expected:
- Specialty remains the separate additional check
- it is not part of the required 6 Service Checks

## Gate F — Regression
Continue through Structured Relationships.

Expected:
- qa.32 Name / Profession / Location fields remain intact
- smart relationship NPC creation remains intact

## PASS
qa.34 passes when Service allocation is clear, dropdown-based, validated correctly on Continue, and no live-counter machinery remains.
