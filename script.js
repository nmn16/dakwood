const $=(s,root=document)=>root.querySelector(selectorSafe(s,root)), $$=(s,root=document)=>[...root.querySelectorAll(s)];
function selectorSafe(s){return s;}
const filters=$$('.filter'), cards=$$('.project'), modal=$('#modal'), toast=$('#toast');let sceneText='';
filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));btn.classList.add('active');cards.forEach(card=>card.classList.toggle('hidden',btn.dataset.filter!=='all'&&card.dataset.category!==btn.dataset.filter));}));
function openProject(btn){const img=$('img',btn);$('#modalTitle').textContent=btn.dataset.title;$('#modalDescription').textContent=btn.dataset.description;$('#modalPhoto').style.backgroundImage=`url("${img.src}")`;sceneText=`${btn.dataset.title}\n${btn.dataset.description}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');}
function closeProject(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
$$('.project-img').forEach(btn=>btn.addEventListener('click',()=>openProject(btn)));$$('[data-close]').forEach(btn=>btn.addEventListener('click',closeProject));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProject()});
function notify(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('show'),2400)}
async function copy(text,msg){try{await navigator.clipboard.writeText(text);notify(msg)}catch{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();notify(ok?msg:'Copy was blocked by your browser')}}
$('#copyScene').addEventListener('click',()=>copy(sceneText,'Scene text copied'));
$('#menu').addEventListener('click',()=>$('#nav').classList.toggle('open'));$$('#nav a').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));
const slides=$$('.hero-slide'), dots=$$('.hero-dot');let currentSlide=0, slideTimer;
function setSlide(index){if(!slides.length)return;currentSlide=(index+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===currentSlide));dots.forEach((d,i)=>d.classList.toggle('active',i===currentSlide));}
function startSlideTimer(){clearInterval(slideTimer);slideTimer=setInterval(()=>setSlide(currentSlide+1),5000);}
if(slides.length){dots.forEach((dot,i)=>dot.addEventListener('click',()=>{setSlide(i);startSlideTimer();}));$('#heroPrev')?.addEventListener('click',()=>{setSlide(currentSlide-1);startSlideTimer();});$('#heroNext')?.addEventListener('click',()=>{setSlide(currentSlide+1);startSlideTimer();});$('#home')?.addEventListener('mouseenter',()=>clearInterval(slideTimer));$('#home')?.addEventListener('mouseleave',()=>startSlideTimer());startSlideTimer();}
