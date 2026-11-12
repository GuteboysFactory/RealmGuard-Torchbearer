import {legacyMixedPolishEnabled} from './legacy-mixed-scope.mjs';
const bindings=new Map();
export function bindLegacyChatFollow(root=document){
  if(!legacyMixedPolishEnabled())return;
  for(const [element,binding]of bindings)if(!element.isConnected){binding.mutation.disconnect();binding.resize.disconnect();bindings.delete(element);}
  const logs=[...(root.matches?.('#chat-log,.chat-log,.chat-messages')?[root]:[]),...root.querySelectorAll('#chat-log,.chat-log,.chat-messages')];
  for(const log of logs){
    if(bindings.has(log))continue;
    let frame=null,last=null;
    const follow=()=>{
      frame=null;if(!log.isConnected||!legacyMixedPolishEnabled())return;
      const messages=[...log.querySelectorAll('[data-message-id],.message')].filter(el=>{const parent=el.parentElement?.closest('[data-message-id],.message');return !parent||!log.contains(parent);}),latest=messages[messages.length-1]??log.lastElementChild;if(!latest)return;
      if(last!==latest){if(last)resize.unobserve(last);last=latest;resize.observe(latest);}
      let scroll=log;
      while(scroll.parentElement&&getComputedStyle(scroll).overflowY!=='auto'&&getComputedStyle(scroll).overflowY!=='scroll')scroll=scroll.parentElement;
      if(scroll===document.body||scroll===document.documentElement)return;
      scroll.classList.add('rg-chat-follow');
      const area=scroll.getBoundingClientRect(),rect=latest.getBoundingClientRect();
      // A card taller than the viewport starts at its heading and remains fully
      // scrollable; a normal card is shown completely, including its footer.
      const top=rect.top-area.top+scroll.scrollTop;
      scroll.scrollTop=rect.height>scroll.clientHeight-20?Math.max(0,top-8):Math.max(0,top+rect.height-scroll.clientHeight+12);
    };
    const schedule=()=>{if(frame===null)frame=requestAnimationFrame(follow);};
    const mutation=new MutationObserver(schedule),resize=new ResizeObserver(schedule);
    mutation.observe(log,{childList:true,subtree:true,characterData:true});resize.observe(log);
    bindings.set(log,{mutation,resize,schedule});schedule();
  }
}
export function installLegacyChatFollow(){
  const bind=app=>{const root=app?.element instanceof HTMLElement?app.element:app?.element?.[0]??document;bindLegacyChatFollow(root);};
  Hooks.on('renderChatLog',bind);Hooks.once('ready',()=>bindLegacyChatFollow());
  Hooks.on('renderChatMessageHTML',()=>{bindLegacyChatFollow();for(const b of bindings.values())b.schedule();});
}
