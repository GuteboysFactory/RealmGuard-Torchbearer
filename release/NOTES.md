Realm Guard / Torchbearer v1.9.0-qa.33 — Service Counter Observer Fix.

- New QA version dedicated to the Service & Specialty live-counter issue.
- Verified root cause: DialogV2 render-time binding never reached the real Service select elements.
- Removed Service counter dependence on the Recruitment step's onRender lifecycle.
- Recruitment now installs a MutationObserver that binds only after the real form exists in document.body.
- Each Service dropdown is directly bound and marked data-rg-service-counter-bound="true".
- Live total is recalculated from the actual visible select[data-rg-service-check] values.
- Initial total is recalculated immediately after binding.
- Service dropdowns, exact Continue validation, Specialty behavior, structured Relationships, and NPC generation remain unchanged.

QA: TEST_PROTOCOL_v1.9.0-qa.33.md
