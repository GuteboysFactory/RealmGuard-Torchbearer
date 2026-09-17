from pathlib import Path
import json

ROOT = Path('.')
conflicts = ROOT / 'module/conflicts.mjs'
css = ROOT / 'styles/conflict-parchment-prototype.css'
scroll_css = ROOT / 'styles/roll-dialog-scroll.css'
manifest = ROOT / 'system.json'
main = ROOT / 'realm-guard.mjs'


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 occurrence, found {count}')
    return text.replace(old, new, 1)

text = conflicts.read_text(encoding='utf-8')
text = replace_once(
    text,
    'class="rg-conflict-primary" data-conflict-action="roll" data-side="gm"',
    'class="rg-conflict-primary gm" data-conflict-action="roll" data-side="gm"',
    'GM action roll class'
)
text = replace_once(
    text,
    'class="rg-conflict-primary" data-conflict-action="roll" data-side="ranger"',
    'class="rg-conflict-primary ranger" data-conflict-action="roll" data-side="ranger"',
    'Ranger action roll class'
)
text = replace_once(
    text,
    'class="rg-conflict-primary" data-conflict-action="disposition" data-side="gm"',
    'class="rg-conflict-primary gm" data-conflict-action="disposition" data-side="gm"',
    'GM disposition class'
)
text = replace_once(
    text,
    'class="rg-conflict-primary" data-conflict-action="disposition" data-side="ranger"',
    'class="rg-conflict-primary ranger" data-conflict-action="disposition" data-side="ranger"',
    'Ranger disposition class'
)
text = replace_once(
    text,
    'choices.push(`<button data-maneuver-choice="impede"',
    'choices.push(`<button class="rg-conflict-primary ${side}" data-maneuver-choice="impede"',
    'Maneuver impede class'
)
text = replace_once(
    text,
    'choices.push(`<button data-maneuver-choice="position"',
    'choices.push(`<button class="rg-conflict-primary ${side}" data-maneuver-choice="position"',
    'Maneuver position class'
)
text = replace_once(
    text,
    'choices.push(`<button data-maneuver-choice="disarm"',
    'choices.push(`<button class="rg-conflict-primary ${side}" data-maneuver-choice="disarm"',
    'Maneuver disarm class'
)
text = replace_once(
    text,
    'choices.push(`<button data-maneuver-choice="combo"',
    'choices.push(`<button class="rg-conflict-primary ${side}" data-maneuver-choice="combo"',
    'Maneuver combo class'
)
conflicts.write_text(text, encoding='utf-8')

marker = '/* v1.8.0-qa.8 — final Conflict UI polish */'
base_css = css.read_text(encoding='utf-8')
if marker not in base_css:
    base_css += r'''

/* v1.8.0-qa.8 — final Conflict UI polish */
/* One visual language: parchment = information, dark/gold = interaction,
   wine red = GM/Opposition, forest green = Rangers, gold = neutral/system. */
.rg-conflict-window {
  --rgc-control-bg:#17170f;
  --rgc-control-bg-2:#222116;
  --rgc-control-gold:#c89a4d;
  --rgc-control-gold-soft:#e2c17b;
  --rgc-control-gm:#7e3f34;
  --rgc-control-gm-bright:#b05e50;
  --rgc-control-ranger:#526b32;
  --rgc-control-ranger-bright:#8faa57;
}

/* Exchange Weapon / Tool belongs to the parchment flow, not a detached black slab. */
.rg-conflict-window .rg-conflict-exchange-tools {
  margin-top:10px;
  padding:10px;
  border:1px solid rgba(116,79,36,.38) !important;
  border-radius:8px;
  background:rgba(249,235,200,.72) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.38),0 3px 10px rgba(75,42,17,.08);
}
.rg-conflict-window .rg-conflict-exchange-tools .rg-plan-step-head {
  margin:0 0 8px;
  padding:0 0 7px;
  border-bottom:1px solid rgba(116,79,36,.24);
  background:transparent !important;
}
.rg-conflict-window .rg-conflict-exchange-tools .rg-plan-step-head b,
.rg-conflict-window .rg-conflict-exchange-tools .rg-plan-step-head i { color:#68451f !important; }
.rg-conflict-window .rg-conflict-exchange-tools .rg-plan-step-head span { color:#69583e !important; }
.rg-conflict-window .rg-conflict-weapons {
  display:grid;
  gap:8px;
  padding:9px;
  color:#392b1b !important;
  background:rgba(255,246,220,.66) !important;
  border:1px solid rgba(100,65,30,.25) !important;
  border-radius:7px;
  box-shadow:none !important;
}
.rg-conflict-window .rg-conflict-weapon-rule {
  display:block;
  padding:7px 9px;
  color:#5b4931 !important;
  background:rgba(184,133,62,.10) !important;
  border-left:3px solid #a77735;
  border-radius:4px;
  line-height:1.42;
}
.rg-conflict-window .rg-conflict-weapon-rule b { color:#463019 !important; }
.rg-conflict-window .rg-conflict-weapon-row {
  display:grid;
  grid-template-columns:minmax(105px,.45fr) minmax(180px,1.55fr) auto;
  gap:8px;
  align-items:center;
  padding:7px;
  background:rgba(255,250,232,.52) !important;
  border:1px solid rgba(102,68,32,.20) !important;
  border-radius:6px;
}
.rg-conflict-window .rg-conflict-weapon-row > b { color:#3b2b1a !important; }
.rg-conflict-window .rg-conflict-weapon-row select {
  min-height:34px;
  color:#f1e5cc !important;
  background:#2d2830 !important;
  border:1px solid #725c43 !important;
}
.rg-conflict-window .rg-conflict-weapon-row button,
.rg-conflict-window .rg-plan-custom-tool {
  min-height:34px;
  color:#f3e5c8 !important;
  background:linear-gradient(180deg,#2b2a1d,#17170f) !important;
  border:1px solid #9a753d !important;
  border-bottom:3px solid var(--rgc-control-gold) !important;
  border-radius:5px !important;
  font-weight:800;
}
.rg-conflict-window .rg-conflict-weapon-row button:hover,
.rg-conflict-window .rg-plan-custom-tool:hover { filter:brightness(1.13); box-shadow:0 0 0 1px rgba(217,177,94,.28),0 3px 8px rgba(58,34,13,.18); }

/* Character-sheet-tab inspired action controls. */
.rg-conflict-window .rg-plan-action-choice,
.rg-conflict-window .rg-conflict-primary,
.rg-conflict-window button.rg-conflict-primary {
  position:relative;
  overflow:hidden;
  color:#f1e5c9 !important;
  background:linear-gradient(180deg,var(--rgc-control-bg-2),var(--rgc-control-bg)) !important;
  border:1px solid #6f5a36 !important;
  border-bottom:3px solid var(--rgc-control-gold) !important;
  border-radius:5px !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 2px 5px rgba(52,31,13,.20) !important;
  font-weight:800;
  transition:filter .12s ease,transform .12s ease,box-shadow .12s ease,border-color .12s ease;
}
.rg-conflict-window .rg-plan-action-choice:hover,
.rg-conflict-window .rg-conflict-primary:hover {
  filter:brightness(1.14);
  transform:translateY(-1px);
  border-color:#b58a48 !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 0 1px rgba(205,160,79,.24),0 4px 9px rgba(52,31,13,.22) !important;
}
.rg-conflict-window .rg-plan-action-choice:active,
.rg-conflict-window .rg-conflict-primary:active { transform:translateY(0); }
.rg-conflict-window .rg-plan-action-choice i,
.rg-conflict-window .rg-plan-action-choice b,
.rg-conflict-window .rg-plan-action-choice small,
.rg-conflict-window .rg-conflict-primary i { color:inherit !important; }
.rg-conflict-window .rg-plan-action-choice small { opacity:.82; }

/* GM controls: same control family, wine-red identity line. */
.rg-conflict-window .rg-plan-action-choice.rg-gm-choice,
.rg-conflict-window .rg-conflict-primary.gm,
.rg-conflict-window .rg-maneuver-buttons .rg-conflict-primary.gm {
  border-color:#795046 !important;
  border-bottom-color:var(--rgc-control-gm-bright) !important;
  box-shadow:inset 0 -3px 0 rgba(126,63,52,.24),inset 0 1px 0 rgba(255,255,255,.06),0 2px 5px rgba(52,31,13,.20) !important;
}
.rg-conflict-window .rg-plan-action-choice.rg-gm-choice:hover,
.rg-conflict-window .rg-conflict-primary.gm:hover { border-color:#a9685c !important; box-shadow:inset 0 -3px 0 rgba(176,94,80,.45),0 0 0 1px rgba(176,94,80,.18),0 4px 9px rgba(52,31,13,.22) !important; }

/* Ranger controls: same olive/gold family as the active Character sheet tab. */
.rg-conflict-window .rg-plan-action-choice.rg-ranger-choice,
.rg-conflict-window .rg-conflict-primary.ranger,
.rg-conflict-window .rg-maneuver-buttons .rg-conflict-primary.ranger {
  border-color:#677442 !important;
  border-bottom-color:var(--rgc-control-ranger-bright) !important;
  box-shadow:inset 0 -3px 0 rgba(82,107,50,.26),inset 0 1px 0 rgba(255,255,255,.06),0 2px 5px rgba(52,31,13,.20) !important;
}
.rg-conflict-window .rg-plan-action-choice.rg-ranger-choice:hover,
.rg-conflict-window .rg-conflict-primary.ranger:hover { border-color:#8c9f58 !important; box-shadow:inset 0 -3px 0 rgba(143,170,87,.46),0 0 0 1px rgba(143,170,87,.19),0 4px 9px rgba(52,31,13,.22) !important; }

/* Selected/planned actions read like the selected Character tab without becoming a solid color block. */
.rg-conflict-window .rg-plan-action-choice.is-selected,
.rg-conflict-window .rg-plan-action-choice[aria-pressed="true"] {
  color:#fff0c9 !important;
  border-color:#c69648 !important;
  box-shadow:inset 0 0 0 1px rgba(207,162,78,.42),inset 0 -3px 0 var(--rgc-control-gold),0 0 11px rgba(193,143,62,.24) !important;
}

/* Action-stage Roll controls must carry side identity at a glance. */
.rg-conflict-window .rg-action-side .rg-conflict-primary {
  width:min(290px,100%);
  min-height:38px;
  margin:8px auto 0;
  padding:7px 13px;
  justify-content:center;
  letter-spacing:.01em;
}
.rg-conflict-window .rg-maneuver-buttons { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.rg-conflict-window .rg-maneuver-buttons .rg-conflict-primary { min-height:42px; }

/* Neutral conflict actions stay gold; destructive actions stay unmistakably destructive. */
.rg-conflict-window .rg-action-result .rg-conflict-primary,
.rg-conflict-window .rg-compromise-panel .rg-conflict-primary:not(.gm):not(.ranger) { border-bottom-color:var(--rgc-control-gold) !important; }
.rg-conflict-window .rg-conflict-admin button {
  color:#f4d8cd !important;
  background:linear-gradient(180deg,#5c302a,#371b18) !important;
  border:1px solid #7f4940 !important;
  border-bottom:3px solid #a95b4f !important;
  border-radius:5px !important;
}
.rg-conflict-window .rg-conflict-admin button:hover { filter:brightness(1.14); }

/* Tighter responsive planning without losing the side identity. */
@media(max-width:980px){
  .rg-conflict-window .rg-conflict-weapon-row { grid-template-columns:1fr; }
  .rg-conflict-window .rg-conflict-weapon-row button { width:100%; }
  .rg-conflict-window .rg-card-deck { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media(max-width:680px){
  .rg-conflict-window .rg-card-deck,
  .rg-conflict-window .rg-maneuver-buttons { grid-template-columns:1fr; }
}
'''
    css.write_text(base_css, encoding='utf-8')

scroll_marker = '/* v1.8.0-qa.8 — viewport-safe Conflict dialog family */'
scroll = scroll_css.read_text(encoding='utf-8')
if scroll_marker not in scroll:
    scroll += r'''

/* v1.8.0-qa.8 — viewport-safe Conflict dialog family */
/* DialogV2 keeps its footer outside these content blocks, so Roll/Cancel remain reachable
   while the form body scrolls on laptops and short viewports. */
.rg-conflict-roll-dialog,
.rg-conflict-setup,
.rg-conflict-goal-editor,
.rg-disposition-method,
.rg-disarm-dialog,
.rg-conflict-tool-editor {
  box-sizing:border-box;
  width:100%;
  max-width:100%;
  max-height:min(68vh,720px);
  min-height:0;
  overflow-y:auto;
  overflow-x:hidden;
  overscroll-behavior:contain;
  scrollbar-gutter:stable;
  padding-right:6px;
}

/* Foundry application shell: never let a Conflict dialog grow beyond the viewport. */
.application.dialog:has(.rg-conflict-roll-dialog),
.application.dialog:has(.rg-conflict-setup),
.application.dialog:has(.rg-conflict-goal-editor),
.application.dialog:has(.rg-disposition-method),
.application.dialog:has(.rg-disarm-dialog),
.application.dialog:has(.rg-conflict-tool-editor) {
  max-width:calc(100vw - 18px) !important;
  max-height:calc(100vh - 18px) !important;
}
.application.dialog:has(.rg-conflict-roll-dialog) .window-content,
.application.dialog:has(.rg-conflict-setup) .window-content,
.application.dialog:has(.rg-conflict-goal-editor) .window-content,
.application.dialog:has(.rg-disposition-method) .window-content,
.application.dialog:has(.rg-disarm-dialog) .window-content,
.application.dialog:has(.rg-conflict-tool-editor) .window-content {
  min-height:0 !important;
  overflow:hidden !important;
}
.application.dialog:has(.rg-conflict-roll-dialog) .form-footer,
.application.dialog:has(.rg-conflict-setup) .form-footer,
.application.dialog:has(.rg-conflict-goal-editor) .form-footer,
.application.dialog:has(.rg-disposition-method) .form-footer,
.application.dialog:has(.rg-disarm-dialog) .form-footer,
.application.dialog:has(.rg-conflict-tool-editor) .form-footer {
  flex:0 0 auto;
  position:relative;
  z-index:3;
}

@media(max-height:800px){
  .rg-conflict-roll-dialog,.rg-conflict-setup,.rg-conflict-goal-editor,
  .rg-disposition-method,.rg-disarm-dialog,.rg-conflict-tool-editor { max-height:60vh; }
}
@media(max-height:680px){
  .rg-conflict-roll-dialog,.rg-conflict-setup,.rg-conflict-goal-editor,
  .rg-disposition-method,.rg-disarm-dialog,.rg-conflict-tool-editor { max-height:52vh; }
}
@media(max-height:560px){
  .rg-conflict-roll-dialog,.rg-conflict-setup,.rg-conflict-goal-editor,
  .rg-disposition-method,.rg-disarm-dialog,.rg-conflict-tool-editor { max-height:44vh; }
}
@media(max-width:760px){
  .rg-conflict-roll-dialog,.rg-conflict-setup,.rg-conflict-goal-editor,
  .rg-disposition-method,.rg-disarm-dialog,.rg-conflict-tool-editor {
    min-width:0 !important;
    max-width:calc(100vw - 24px) !important;
  }
  .rg-conflict-roll-dialog .rg-roll-dialog-grid,
  .rg-conflict-setup-grid { grid-template-columns:1fr !important; }
}
'''
    scroll_css.write_text(scroll, encoding='utf-8')

# Version bump only; no rules/state changes.
data = json.loads(manifest.read_text(encoding='utf-8'))
data['version'] = '1.8.0-qa.8'
data['download'] = 'https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/1.8.0-qa.8/realm-guard.zip'
manifest.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

main_text = main.read_text(encoding='utf-8')
main_text = main_text.replace('game.system?.version ?? "1.8.0-qa.7"', 'game.system?.version ?? "1.8.0-qa.8"')
main.write_text(main_text, encoding='utf-8')

(ROOT / 'RELEASE_NOTES_v1.8.0-qa.8.md').write_text('''# Realm Guard / Torchbearer v1.8.0-qa.8\n\n## Final Conflict UI polish\n\nVisual-only consolidation of the qa.7 parchment prototype.\n\n- Exchange Weapon / Tool panel now follows the parchment visual language.\n- Unified Character-tab-inspired Conflict controls.\n- GM / Opposition controls use a wine-red bottom accent.\n- Ranger controls use the actor-sheet olive/green-gold accent family.\n- Neutral resolution controls stay gold; Abort remains destructive.\n- Action selection, Lock Cards, Disposition, Roll Action and Maneuver choices share one control language.\n- Conflict dialog family is viewport-safe and internally scrollable for laptop/short-screen use.\n- No Conflict rules, rolls, M6 state, socket or authority behavior changed.\n''', encoding='utf-8')

(ROOT / 'TEST_PROTOCOL_v1.8.0-qa.8.md').write_text('''# QA Protocol — v1.8.0-qa.8\n\n## Visual identity\n- GM action choices: dark/gold base with wine-red bottom accent.\n- Ranger action choices: dark/gold base with olive/green-gold bottom accent.\n- GM/Ranger Goal, Disposition, Lock Cards, Roll Action and Maneuver controls use the same side identity.\n- Resolve Tie / Finish Conflict remain neutral gold.\n- Abort Conflict remains destructive red.\n- Exchange Weapon / Tool panel is parchment-aligned and no longer reads as a detached black slab.\n\n## Responsive / scrolling\nTest at approximately:\n- 2560x1440\n- 1920x1080\n- 1366x768\n- 1280x720\n\nFor Start Conflict, Goal editor, Starting Disposition, Conflict roll, Disarm and Custom Tool:\n- content never extends irretrievably beyond viewport\n- inner body scrolls vertically\n- no horizontal overflow at laptop width\n- DialogV2 footer buttons remain reachable\n\nConflict window:\n- resize still works\n- internal body scroll still works\n- planning/action/maneuver/compromise remain reachable\n\n## Regression\n- qa.6 runtime/state handoff still enabled\n- resolution mismatches 0\n- state mismatches 0\n- action planning and exchange-scoped tools unchanged\n- roll dialogs still open above Conflict window\n''', encoding='utf-8')

print('Applied v1.8.0-qa.8 final Conflict UI polish')
