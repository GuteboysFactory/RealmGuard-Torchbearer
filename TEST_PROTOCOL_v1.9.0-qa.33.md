# v1.9.0-qa.33 — Service Counter Observer QA

## Gate A — binding
Open Recruitment -> Service & Specialty.

Run in F12:

[...document.querySelectorAll("select[data-rg-service-check]")]
  .map(x => x.dataset.rgServiceCounterBound)

Expected:
- every visible Service select returns "true"

## Gate B — initial total
With all Service dropdowns at 0:

Expected:
- counter shows 0 / required total

## Gate C — live total
For a Scout set:
- Fighter 3
- Pathfinder 1
- Scout 1
- Weather Watcher 1

Expected:
- counter immediately shows 6 / 6

Verify in F12:

[...document.querySelectorAll("select[data-rg-service-check]")]
  .reduce((sum, x) => sum + Number(x.value || 0), 0)

Expected:
- console result and UI counter show the same allocated total

## Gate D — change again
Change Fighter 3 -> 4.

Expected:
- counter immediately changes to 7 / 6
- over state is shown

Change Fighter back to 3.

Expected:
- counter immediately returns to 6 / 6

## Gate E — back/forward
Continue or go Back, then return to Service & Specialty with saved allocations.

Expected:
- observer binds the newly inserted form
- restored dropdown values are immediately summed correctly

## Gate F — Specialty
Change Specialty.

Expected:
- Service counter does not change

## PASS
qa.33 passes when every real Service dropdown is bound after DOM insertion and the displayed total always equals the literal sum of the visible dropdown values.
