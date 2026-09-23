/* Mirrors only navigation controls. Native source handlers own edits and validation. */
(function(){'use strict';
function start(){var dock=document.querySelector('.nav .av-destinations');if(!dock)return;
var selector,labels,kind='page',owner;
if(document.getElementById('se-workspace')){selector='.se-app-header nav[aria-label="Workspace"] a';owner=document.getElementById('se-workspace')}
else if(document.querySelector('.cg-stepper')){selector='.cg-step-btn';labels=['Certificate','Names','Photo','Review'];kind='step';owner=document.querySelector('.cg-stepper')}
else if(document.querySelector('.part61-step-rail')){selector='.part61-step-rail .part61-rail-item';labels=['Goal','Background','Experience','Your plan'];kind='step';owner=document.getElementById('part61CalculatorView')}
if(!selector)return;
dock.setAttribute('aria-label',kind==='step'?'Steps':'Tool sections');document.body.dataset.avToolDock='true';
var signature='';
function sync(){var native=Array.from(document.querySelectorAll(selector));if(!native.length)return;
var next=native.map(function(el){return [el.textContent,el.getAttribute('href'),el.disabled,el.getAttribute('aria-current'),el.className].join('|')}).join(';');if(next===signature)return;signature=next;
var focused=Array.from(dock.children).indexOf(document.activeElement);dock.replaceChildren();
native.forEach(function(el,i){var b=document.createElement(el.tagName==='A'?'a':'button');b.className='av-key';var text=labels?labels[i]:el.textContent.trim();var icons=selector==='.cg-step-btn'?['Award','Users','Image','CheckCheck']:kind==='step'?['Target','UserRound','ClipboardList','Route']:['BookMarked','ListChecks','BookOpen'];b.innerHTML='<svg class="av-icon" aria-hidden="true"><use href="/assets/avionics-icons.svg#'+icons[i]+'"></use></svg>';var label=document.createElement('span');label.textContent=text;if(selector==='.part61-step-rail .part61-rail-item'||selector==='.cg-step-btn'){var cert=selector==='.cg-step-btn';b.classList.add('av-has-compact',cert?'av-compact-360':'av-compact-600');b.setAttribute('aria-label',text);label.className='av-label-full';var compact=document.createElement('span');compact.className='av-label-compact';compact.setAttribute('aria-hidden','true');compact.textContent=(cert?['Cert','Names','Photo','Review']:['Goal','Profile','Hours','Plan'])[i];b.appendChild(label);b.appendChild(compact)}else b.appendChild(label);if(b.tagName==='A')b.href=el.href;else b.type='button';if(el.disabled)b.disabled=true;
if(el.hasAttribute('aria-current')||el.classList.contains('active'))b.setAttribute('aria-current',kind);
b.addEventListener('click',function(e){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();el.click();queueMicrotask(sync)});dock.appendChild(b)});
if(focused>=0&&dock.children[focused])dock.children[focused].focus({preventScroll:true});
}
sync();new MutationObserver(sync).observe(owner,{subtree:true,childList:true,attributes:true,attributeFilter:['class','disabled','aria-current','href']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
