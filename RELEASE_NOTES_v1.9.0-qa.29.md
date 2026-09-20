# Realm Guard / Torchbearer v1.9.0-qa.29 — Canvas Image -> Quick NPC

This build connects the active Scene canvas directly to the verified Quick NPC Library.

## New GM workflow
Drag a local PNG/JPG/WEBP image from the operating system directly onto the active Foundry Scene.

Realm Guard then:
1. captures the image and exact canvas drop point,
2. opens Quick NPC Library with the dropped image shown as a preview,
3. focuses the normal searchable template library,
4. lets the GM choose or double-click a template,
5. uploads the image to Realm Guard NPC art storage,
6. creates the normal editable NPC Actor from the chosen template,
7. uses the image as portrait/prototype token texture,
8. creates the token on the same Scene at the image drop point.

The created NPC is still a detached normal Actor; it has no permanent template dependency.

## Naming
A meaningful local filename is used as the NPC name.
Generic image filenames continue to fall back to the selected template name.

## Canvas behavior
Only local image-file drops are intercepted.
Normal Foundry document/token/item drops are not intended to change.

The canvas highlights while an image is being dragged over it.

## Explicitly unchanged
- normal Quick NPC Library creation
- image-drop directly on a template card
- M8 Relationship behavior
- Create Ranger Wizard
- no automatic NPC creation
- no NPC - PC Relations folder yet
- ordinary Quick NPCs still use the normal NPC folder
