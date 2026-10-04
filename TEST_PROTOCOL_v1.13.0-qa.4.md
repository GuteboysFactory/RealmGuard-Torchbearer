# TEST PROTOCOL — v1.13.0-qa.4

## M10D.3 focused hotfix gate — Help shadow metadata

This patch changes metadata only. All v1.13.0-qa.3 rule outcomes remain authoritative for the current M10D.3 shadow test. Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY.

### Gate A — Boot sanity
- Install qa.4 and reload without errors.
- System version = 1.13.0-qa.4.
- m10d phase remains M10D.3; Help/Wises shadow adapters remain ready; activation/live authority remain false; writes remain 0.

### Gate B — Town reject metadata
Run Town Resources and Town Recovery Help plans.
- Both still reject with TOWN_HELP_FORBIDDEN.
- Both report `phase = "M10D.3"`.
- Both report `phaseContext = "TOWN"`.
- Town Resources reports `testContext = "TEST"`.
- Town Recovery reports `testContext = "RECOVERY"`.
- No rule outcome changes and no writes.

### Gate C — Instinct reject metadata
Run invalid Instinct Help.
- Still rejects with INSTINCT_HELP_SOURCE_NOT_ELIGIBLE.
- Reports `phase = "M10D.3"`.
- Reports `phaseContext = "ADVENTURE"`.
- Reports `testContext = "TEST"`.
- No writes.

### Gate D — Release / channels
- qa.4 prerelease assets verify green.
- QA = 1.13.0-qa.4.
- Stable = 1.12.0 unchanged.

If A-D pass, v1.13.0-qa.4 closes the qa.3 metadata defect and M10D.3 may be marked FULL PASS / VERIFIED / CLOSED.
