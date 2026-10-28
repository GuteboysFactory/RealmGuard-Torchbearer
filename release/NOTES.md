# 1.13.0-qa.29 — M10D.11 controlled TB2E character creation QA

Enables the completed 11-step TB2E wizard for explicit testing in a separate QA world. Ordinary updates do not switch a world's rules profile or enable this opt-in setting.

## Start testing
1. Update through the usual QA channel and open a separate test world as GM.
2. In Configure Settings, enable **Enable TB2E character creation QA**, save and reload.
3. Open **Manage Rules Profile**, switch to **Torchbearer 2E · Character Creation QA**, and reload again.
4. Open the usual Character Creation / Recruitment guide. The active TB2E profile now uses its own wizard; other profiles keep their existing wizard. Starting Equipment selects existing world Gear Items, so import suitable Gear including a Backpack or Satchel if needed.

Test all six classes in Guided and Quick modes, navigation/cancellation, final review, and creation. Starting Fate/Persona remain 0/0; the GM-adjudicated replacement-character exception is capped at 3 each. Newly learned Home, Social Graces and Specialty skills start at 2; human Upbringing starts a new skill at 3. Check that the created character matches the review, has Fresh active and retains the same skills and Conditions after reload.

## Scope and verification
Only character creation receives live QA authority through CORE M9. This does not enable the remaining TB2E gameplay domains or claim complete gameplay parity. The setting defaults to off and cannot enable the wizard in stable builds. Actual creation requires the active TB2E profile and Actor-create permission. Profile switching preserves existing Actors and Items. Switch back to the previous profile before disabling the TB2E QA setting.

TB2E wizard characters are protected from legacy skill/Condition provisioning and Condition metadata enrichment on reload. This prevents Weather Watcher, Tired or Strained from being added and prevents source-owned Condition data from being overwritten.

Local checks passed: 159 syntax checks, all 120 smoke tests, and release preflight. GitHub branch workflow 40594796845 passed too. The new activation smoke uses the production wizard commit and CORE M9 provisioners with simulated Foundry documents for all six classes, checks rollback and stable/inactive/player guards, and verifies UI profile data and reload preservation. Actual Foundry user testing remains outstanding; see TB2E_WIZARD_WORK.md for the full checklist.

The release workflow is restricted to main and checks its source ref before publishing assets. Stable remains 1.12.0. Publishing stable 1.13.0 still requires separate user approval.
