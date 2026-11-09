# 1.13.3 — Legacy Mixed character sheet and inventory

Stable patch following 1.13.2, authorized after the character workspace review. These changes apply **only to Realm Guard Legacy Mixed**. Other profiles keep their existing interfaces and rules. The accepted startup optimization remains unchanged. No TB2E activation or campaign-data migration is included.

- Larger character portrait with editing controls on hover/focus. Compact ability/progression displays, a shared Turn/Custom Roll/Conditions row, collapsible header, fixed navigation and retained per-tab scroll positions.
- Consistent compact trained/untrained Skill cards. Roll Window becomes Roll beside Edit; Quick Roll buttons are removed from this profile. Click progression to correct Pass/Fail or learning attempts with Save/Cancel and stale-edit protection.
- Standard/Versus choice inside ordinary Skill and Beginner’s Luck roll dialogs, searchable visible opponents and explicit legal opposition. Scene targets and saved Skill flags are not changed by this choice.
- Eight new inventory figures: male/female Human, Elf, Dwarf and Hobbit. Ancestry chooses the figure automatically; no ancestry defaults to Human. Dúnadan uses Human. The only figure selector is Male/Female.
- Equipment points show contents on hover/focus and open searchable equip/remove dialogs on click. A searchable inventory list includes equipped items and offers movement to body zones, containers or Unassigned. Existing placement validation, two-handed restrictions, item data and drag/drop remain in use. Tokens of Power details are collapsible.
- GM scene menu on the token layer: place an existing NPC token, open/start Conflict, End Session and ping; token-specific options include Actor, Conditions, Custom Roll, opponent targeting and Foundry token controls. Right-drag remains available for panning; Shift-right-click preserves normal handling.
- Learning explicitly shows attempts against maximum/untaxed Nature and the Will/Health roll base. Both passed and failed Beginner’s Luck attempts count toward opening the Skill at 2; they do not also advance Will/Health. Trait dice are now applied after Beginner’s Luck halving in Legacy Mixed.

Verification: 173 runtime syntax checks and 127 smoke-test files passed. Both the existing Conflict/End Session Chromium suite and the new production-template character workspace suite passed locally and in [GitHub Actions](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/42683106381). Browser tests use controlled Foundry documents/canvas fixtures; a full Foundry server with separate player clients remains the next table acceptance check. See TEST_PROTOCOL_v1.13.3.md.

Update using the stable manifest:
https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/stable/system.json

Users on 1.13.2 stable can use Foundry's normal system update. Users still on 1.14.0-qa.3 must switch to the stable manifest because that QA number is higher. This release does not update the QA channel.
