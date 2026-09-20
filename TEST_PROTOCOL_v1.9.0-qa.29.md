# v1.9.0-qa.29 — Canvas Image -> Quick NPC QA

## Gate A — normal canvas behavior
Open a Scene as GM.

Expected:
- Scene loads normally
- normal token/document interactions work
- no console errors

## Gate B — local image drop
Drag a local PNG/JPG/WEBP from Windows Explorer onto a visible point on the Scene.

Expected:
- canvas indicates image-drop state
- normal browser/file navigation does not occur
- Quick NPC Library opens
- dropped image is visible as preview
- filename is shown
- normal search/filter UI is present

## Gate C — choose template
Search for a template, e.g.:
- Bree Herdsman
- Orc Scout
- old ranger

Double-click a result.

Expected:
- one NPC Actor is created
- no second creation dialog
- dropped image becomes the NPC portrait/prototype-token texture
- Actor name comes from meaningful filename, otherwise template name
- one token is created on the Scene
- token appears at/centered on the original drop position
- NPC sheet is NOT automatically forced open for this canvas quick-spawn path

## Gate D — created NPC
Open the spawned token's Actor manually.

Expected:
- correct template stats
- correct trained Skills
- correct Gear
- fully editable normal NPC
- Actor exists in normal NPC folder

## Gate E — repeat
Repeat with another image and another template at another map position.

Expected:
- only one Actor and one token per completed drop
- correct independent drop position
- no stacked duplicate dialogs/listeners

## Gate F — cancel
Drop an image, then close Quick NPC Library without choosing a template.

Expected:
- no Actor created
- no token created
- no unwanted Scene document remains

## Gate G — regression
Use GM Dock -> Quick NPC Library normally and create an NPC.

Expected:
- qa.28 flow still works
- no canvas token is created unless the workflow began from a canvas image drop

## PASS
qa.29 passes when a GM can drag an image directly from the desktop to the map, choose a Quick NPC template, and receive exactly one complete NPC plus one token at the drop location in a few seconds.
