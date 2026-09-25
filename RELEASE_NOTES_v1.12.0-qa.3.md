# Realm Guard / Torchbearer v1.12.0-qa.3

## M10B.3 — Wises / Traits / Help / Nature Routing

This QA build begins replacing binary Legacy-vs-Strict runtime checks with generic profile-capability routing for four MG1E-family domains.

### Added
- Generic MG1E-family Wises / Traits / Help / Nature policy.
- Generic rated-Wise and MG1E Trait rule planners.
- Profile-driven Nature label/descriptors, Tap Nature and Double-Tap Nature capabilities.
- MG1E source-correct Teamwork source matrix.

### Changed
- Traits now route through active profile capabilities.
- Wises / I Am Wise now route through active profile capabilities.
- Teamwork now routes helper legality and Synergy through active profile capabilities.
- Strict Ability tests accept Ability Help; Strict Skill/Wise tests accept Skill or rated-Wise Help.
- Shared Nature UI no longer hardcodes Dúnadan descriptors.
- Historical M10A Strict planners remain compatibility wrappers over the generic family rules.

### Preserved
- Legacy Mixed compatibility behavior.
- Strict Realm Guard supported activation.
- all existing campaign data, including unrated/rated Wises, Traits, Conditions and inventory metadata.
- read-only MG1E conversion preview.
- v1.11.0 STABLE / GOLD fallback.

### Still off
- MG1E activation.
- MG1E live gameplay authority.
- automatic Wise rating or destructive profile conversion.
- MG1E Character Creation live commit.
