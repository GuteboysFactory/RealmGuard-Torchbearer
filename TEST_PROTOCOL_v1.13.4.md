# 1.13.4 — Foundry acceptance checks

Check the installed version is 1.13.4. Use Legacy Mixed in a backed-up test world.

1. Check trained Skill Pass/Fail and untrained Learning in the name rows. Edit, save and cancel progression. Check long names, the light Roll text and Will/Health group guidance.
2. Check Nature/Will/Health/Resources/Circles fit their values and progression in one row. Nature progression must sit before Tax. Ability rolls and corrections must still work.
3. Hover/focus the transparent header toggle, then collapse and expand repeatedly. Check navigation, retained scroll position, smaller windows and access to the toggle when collapsed.
4. Open a normal Skill roll, Beginner’s Luck roll and a Conflict roll. Check the narrower form, folded explanations, Help, current Conditions, Learning, Trait/Wise/Persona choices, Standard/Versus selection and Roll/Cancel. Opening explanations must not reset selected values or spend resources.
5. Check Head/Neck/Torso/Belt/Cloak on every used race/sex figure; verify the points follow anatomy. Equip/remove an item and check that two-handed blocking and container rules remain intact.
6. As GM, open the right-click scene menu repeatedly, use its existing options and reopen Foundry token controls. There should be no HUD.clear warning from legacy-scene-menu.mjs. Check pan and Shift-right-click as before.
7. Recheck a separate player client and other profiles after reload. The new layout must remain Legacy Mixed only. The unrelated chat-hook warning belongs to Tome and is outside this patch.

Automated evidence: 174 runtime syntax checks, 127 smoke-test files, the existing Conflict/End Session Chromium suite and the extended workspace Chromium suite passed. These use controlled Foundry fixtures rather than a full live multiplayer server.
