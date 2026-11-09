# 1.13.4 — Legacy Mixed compact layout follow-up

User-authorized stable patch following 1.13.3. All changes apply **only to Legacy Mixed**. Other rule profiles, campaign data and the accepted startup optimization retain their existing behavior. No TB2E activation or Tome changes are included.

- Trained Skill Pass/Fail and untrained Skill Learning now share the name row. Cards no longer need a separate progression row; click editing and its validation remain available.
- Ability Pass/Fail shares the ability name/value row. Nature places it before Tax. Untrained Roll buttons and Will/Health group explanations have improved contrast.
- The header toggle is a transparent black-arrow overlay near Health, turning green on hover or keyboard focus. It consumes no row and remains accessible when the header is collapsed.
- Ordinary and Conflict roll dialogs start at 640 px, adapt to smaller screens, use denser control rows and fold explanatory text behind question marks. Current Help/status, Conditions, resource values and required choices remain visible.
- Head, Neck, Torso, Belt and Cloak equipment points are individually adjusted for each of the eight figures. Equipment data and placement rules are unchanged.
- The GM scene menu closes the token HUD through close(), eliminating its deprecated clear() call. Menu behavior is retained.

Verification: 174 runtime syntax checks, 127 smoke-test files and both Chromium suites passed locally and in [GitHub Actions](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/42695306093). Browser tests execute production templates/modules/styles with controlled Foundry documents and canvas fixtures. Live-world acceptance remains distinct; see TEST_PROTOCOL_v1.13.4.md and LEGACY_COMPACT_FOLLOWUP_REVIEW.md.

Update from 1.13.3 stable with Foundry's normal system update. Stable manifest:
https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/stable/system.json

The QA channel is unchanged. Users on the higher-numbered 1.14.0-qa.3 must switch to the stable manifest.
