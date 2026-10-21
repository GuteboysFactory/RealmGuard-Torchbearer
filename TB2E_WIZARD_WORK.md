# TB2E wizard work — approved scope and integration boundary

Baseline: main 5f7cd80b2da2f7d8613126b6c2cceae8691cefcb, version 1.13.0-qa.27.
Per reported QA27 A/B/C PASS. Stable stays 1.12.0.

## Approved by Per
Copy the existing Recruitment wizard and adapt that copy for TB2E.
Preserve its guided/quick modes, layout, explanatory help, Back/Next, review and creation quality.
Use existing CORE M9 and TB2E planners. Route entry points by active rules profile.
Other profiles continue to use their existing wizard.
No unrelated changes. No replacement simplified creator. No PR14 work.

Roadmap placement: M10D.8 character creation / M10D.10 controlled integration.
This does not itself close M10D.11 activation or M10D.12 supported release.

## Implemented in this working branch
Correct a verified prerequisite in the existing TB2E creation planner:
- Human Upbringing: a new skill is 3 (CC page 14).
- Home: a new skill is 2 (CC page 15).
- Social Graces: a new skill is 2 (CC page 23).
- Specialty: a new skill is 2 (CC page 24).
- Existing skills gain one, capped at 4 in each case.

Source: supplied 538386285-Torchbearer-2E-Character-Creation-Guide.pdf.
Added a rating matrix regression. Existing other-profile snapshots remain checked.
Branch-only CI has read permissions and no release or channel promotion steps.

## Confirmed integration decision required before activation
QA27's torchbearer2e rules profile is FOUNDATION_ONLY, not selectable and has no live rule authority.
module/m10-profile-activation.mjs excludes it from selectable profiles.
module/m10b-character-creation.mjs correctly refuses live creation for a foundation-only rules profile.
module/profiles/torchbearer2e-creation.mjs explicitly rejects creation commits.

A profile-routed TB2E wizard therefore cannot be used to create a real PC in the installed QA27 world yet.
Changing the global profile to QA_ACTIVE also affects the authority boundary for other TB2E domains.
Do not clear those gates merely to make the wizard run.

Before connecting live creation, Per must choose whether this package also includes the separately scoped M10D.11 activation work, or whether the wizard remains built for later activation. Do not publish a preview-only QA as if it were the agreed complete wizard.

## Current release state
Wizard implementation is not complete. No new QA release has been published.
QA/stable install links, release/READY, main and all existing world data remain unchanged.
