import {legacyMixedPolishEnabled} from './legacy-mixed-scope.mjs';
export function slimTokenHud(app,html){
 const root=html instanceof HTMLElement?html:html?.[0]??app?.element;
 if(!root)return;
 root.classList.toggle('rg-slim-token-hud',legacyMixedPolishEnabled());
}
export function installLegacyTokenHud(){Hooks.on('renderTokenHUD',slimTokenHud);}
