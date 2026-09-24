Realm Guard / Torchbearer v1.11.0-qa.9 — M10A.8 Profile Activation QA

Built after v1.11.0-qa.8 passed live Foundry VTT 13.351 QA.

Strict Realm Guard is now available as a reversible QA_ACTIVE rules profile. This is not a stable promotion.

Highlights:
- Adds GM-only Rules Profile activation in Game Settings with conversion-impact preview.
- Profile switching writes only the active profile id/version world settings. It does not migrate Actors, Items or Journals.
- Supports reversible Legacy Mixed → Strict → Legacy Mixed switching with reload recommended after each switch.
- Existing unrated Wises, Talents, Fresh/Afraid Conditions and structured inventory metadata are preserved exactly; no old-data rating or conversion is guessed.
- Strict profile v9 becomes selectable/supported only as QA_ACTIVE.
- CORE M9 Character Creation routes to the active profile. Strict live Recruitment uses rated starting Wises, Strict Enemy/Mentor rules, Strict Condition provisioning, LOOSE inventory ownership, M8 relationships and Strict CreationProvenance.
- Cross-profile M9 commits are rejected and the QA Legacy creation override is disabled while Strict is active.
- Strict live Wises/Traits/Help routing: rated Wises, own I Am Wise +1D, other-Ranger Wise Teamwork, Synergy OFF, canonical MG1E Trait L1/L2/L3 semantics.
- Strict Fresh/Afraid automatic effects are disabled; Angry no longer blocks beneficial Trait/Wise use. Strict recovery methods include Harvester and preserve guided Injured/Strained failure routes.
- Strict Levels/Talents are mechanically disabled while stored data is preserved; Fate/Persona still spend normally.
- Strict Conflict uses LOOSE gear ownership, no hand-slot rule authority, no universal no-tool -1D, active-profile CORE M5 tool evaluation, and no Talent/Legacy Wise-reroll mechanics.
- Strict End Session validation uses the source-correct Embodiment boundary and skips Talent reset.
- Manual/Strict Rules Reference reflect whether Strict is previewed or active; the permanent Legacy Mixed Rules Journal remains unchanged.
- Adds a dedicated activation smoke and live QA protocol.
- Foundry target remains 13.351.

PASS requires successful Legacy → Strict → Legacy → Strict switch/reload/rollback QA with data preservation, Strict live rule behavior and Strict CORE M9 Recruitment verified.
