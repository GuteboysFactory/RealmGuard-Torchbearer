# 1.13.0-qa.27 — QA25 restoration + approved Overview fields

Restores system code to the approved 1.13.0-qa.25 baseline. Only runtime differences from QA25 are the Nature descriptive text and Creed fields in PC Overview, with the approved QA26 layout. Numeric Nature is unchanged.

QA26 is superseded and must not be used. Its separate creator, beta profile, session flow and rule changes are removed from this package. Existing QA25 wizard and rules remain the baseline. TB2E live beta is not enabled by this restoration. Stable remains 1.12.0.

Before updating from QA26: if Torchbearer 2E Playtest Beta is selected, switch back to your previous supported profile in Profile Management (Legacy Mixed if that was your previous profile). The removed beta profile ID is not available in QA25.

Install through the usual QA manifest. See TEST_PROTOCOL_v1.13.0-qa.27.md.
