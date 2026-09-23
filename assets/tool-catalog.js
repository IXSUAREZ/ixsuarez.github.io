/* The catalog is useful without JavaScript; previews and filters enhance it. */
(function(){'use strict';
var source=document.getElementById('tool-catalog-data'),dialog=document.querySelector('.tool-preview-dialog');if(!source||!dialog)return;
var data;try{data=JSON.parse(source.textContent)}catch(_){return}
var opener=null;var byId={};data.tools.forEach(function(t){byId[t.id]=t});
var filters=document.querySelector('.catalog-filters');filters.hidden=false;
filters.addEventListener('click',function(e){var button=e.target.closest('[data-catalog-filter]');if(!button)return;var group=button.dataset.catalogFilter,count=0;
 filters.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(b===button))});
 document.querySelectorAll('[data-catalog-group]').forEach(function(section){section.hidden=group!=='all'&&section.dataset.catalogGroup!==group;if(!section.hidden)count+=section.querySelectorAll('.catalog-card').length});
 document.querySelector('.catalog-count').textContent=count+' free pilot tool'+(count===1?'':'s');
});
if(typeof dialog.showModal!=='function')return;
document.querySelectorAll('[data-tool-preview]').forEach(function(button){button.hidden=false;button.addEventListener('click',function(){var t=byId[button.dataset.toolPreview];if(!t)return;opener=button;
 document.getElementById('preview-title').textContent=t.name;document.getElementById('preview-description').textContent=t.description;document.getElementById('preview-compatibility').textContent=t.compatibility;document.getElementById('preview-icon').src='/assets/identities/'+t.id+'/logo.png';
 var images=document.getElementById('preview-images');images.replaceChildren();t.screenshots.forEach(function(shot){var figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=shot.src;img.alt=shot.alt;img.width=1280;img.height=800;caption.textContent=shot.alt;img.addEventListener('error',function(){img.hidden=true;caption.textContent='Screenshot unavailable. You can still open '+t.name+'.'});figure.append(img,caption);images.appendChild(figure)});
 var features=document.getElementById('preview-features');features.replaceChildren();t.features.forEach(function(feature){var item=document.createElement('li');item.textContent=feature;features.appendChild(item)});
 var open=document.getElementById('preview-open');open.href=t.path;open.textContent='Open '+t.name;dialog.showModal();dialog.querySelector('.preview-close').focus();
})});
dialog.querySelector('.preview-close').addEventListener('click',function(){dialog.close()});
dialog.addEventListener('keydown',function(e){if(e.key!=='Tab')return;var items=Array.from(dialog.querySelectorAll('button:not([disabled]),a[href]')).filter(function(el){return !el.hidden});var first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
dialog.addEventListener('close',function(){if(opener&&opener.isConnected)opener.focus()});
dialog.addEventListener('click',function(e){if(e.target!==dialog)return;var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
})();
