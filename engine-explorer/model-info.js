/* A small model-notes sheet with predictable keyboard dismissal and focus. */
(()=>{'use strict';
 const trigger=document.getElementById('model-info-trigger');
 const dialog=document.getElementById('engine-model-info');
 if(!trigger||!dialog)return;
 const close=dialog.querySelector('.model-info-close');
 let opener=null;
 trigger.addEventListener('click',()=>{opener=document.activeElement;dialog.showModal();close.focus()});
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const items=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];
  if(!items.length)return;
  const first=items[0],last=items[items.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 });
 dialog.addEventListener('close',()=>{if(opener?.isConnected&&!document.body.classList.contains('is-exploring'))opener.focus();opener=null});
})();
