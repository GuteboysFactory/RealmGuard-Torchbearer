# Realm Guard / Torchbearer v1.9.0-qa.33 — Service Counter Observer Fix

This build isolates the Service & Specialty live-counter fix into a new QA version.

## Why qa.33
qa.32 verified that:
- the Service dropdowns hold the correct values,
- the dropdowns emit normal change events,
- the arithmetic is correct,
- but DialogV2 render-time binding never reached the real select elements.

F12 verification showed every Service select lacked the expected binding marker.

## New counter lifecycle
qa.33 removes the Service counter's dependence on DialogV2 onRender timing.

Instead:
- Recruitment installs one MutationObserver on document.body,
- when a Recruitment form is actually inserted into the DOM, the observer finds it,
- the real Service dropdowns are then bound directly,
- each select is marked with data-rg-service-counter-bound="true",
- the counter immediately sums the visible dropdown values,
- later input/change events recalculate from the visible values again.

## Counter authority
The live counter is intentionally DOM-driven.

It calculates:

sum(Number(select.value || 0))

across:

select[data-rg-service-check]

The UI total should therefore always match the literal sum of the visible Service dropdowns.

## Unchanged
- Service allocation dropdowns remain station-bounded.
- Specialty does not count toward the required Service total.
- Continue validation remains authoritative for exact allocation.
- Structured Recruitment Relationships from qa.32 are unchanged.
- Recruitment rules and NPC generation are unchanged.
