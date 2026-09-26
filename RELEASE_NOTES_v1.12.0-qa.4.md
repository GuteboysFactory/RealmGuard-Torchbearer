# Realm Guard / Torchbearer v1.12.0-qa.4 — M10B.4 Conditions / Recovery Routing

Built after v1.12.0-qa.3 passed live Foundry VTT 13.351 QA.

This QA build moves MG1E-family Conditions and Recovery away from binary Strict-vs-Legacy checks and into the resolved Rules Profile capability layer. Mouse Guard 1E remains FOUNDATION_ONLY, non-selectable and non-live.

Highlights:
- MG1E foundation advances to profile v5.
- Generic MG1E-family Condition effects, recovery order, methods, Help policy, GM Turn Check economy, zero-rating policy and failure-state planning.
- MG1E source set: Healthy / Hungry & Thirsty / Angry / Tired / Injured / Sick.
- Strict Realm Guard inherits the family engine while Strained remains the Realm Guard v1.6 override for Sick.
- Historical Strict Conditions/Recovery APIs remain compatibility wrappers over M10B.4.
- Automatic destructive Sick → Strained boot migration is removed.
- Sick, Strained, Fresh and Afraid may remain dormant outside the active profile without rename/delete.
- Will/Health recovery rolls suppress player-to-player Help according to Mouse Guard 1E.
- Legacy Mixed keeps its existing default Condition set and recovery list.
- Release preflight now rejects stale release/NOTES.md version identity.
- Foundry target remains 13.351; v1.11.0 remains STABLE / GOLD.
