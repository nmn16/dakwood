const $=(s,root=document)=>root.querySelector(selectorSafe(s,root)), $$=(s,root=document)=>[...root.querySelectorAll(s)];
function selectorSafe(s){return s;}
const filters=$$('.filter'), cards=$$('.project'), modal=$('#modal'), toast=$('#toast');let sceneText='';
filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));btn.classList.add('active');cards.forEach(card=>card.classList.toggle('hidden',btn.dataset.filter!=='all'&&card.dataset.category!==btn.dataset.filter));}));
let lastFocusedElement=null;
function openProject(btn){lastFocusedElement=document.activeElement;const img=$('img',btn);$('#modalTitle').textContent=btn.dataset.title;$('#modalDescription').textContent=btn.dataset.description;$('#modalPhoto').style.backgroundImage=`url("${img.src}")`;sceneText=`${btn.dataset.title}\n${btn.dataset.description}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');$('.close',modal)?.focus();}
function closeProject(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(lastFocusedElement)lastFocusedElement.focus();}
$$('.project-img').forEach(btn=>btn.addEventListener('click',()=>openProject(btn)));cards.forEach(card=>{const btn=$('.project-img',card);if(btn)card.addEventListener('click',e=>{if(!e.target.closest('.project-img'))openProject(btn);});});$$('.japanese-card').forEach(card=>{card.style.cursor='pointer';card.addEventListener('click',()=>{const img=$('img',card), h3=$('h3',card), p=$('p',card);if(img&&h3&&p)openProject({dataset:{title:h3.textContent,description:p.textContent},querySelector:()=>img});});});$$('[data-close]').forEach(btn=>btn.addEventListener('click',closeProject));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProject()});
function notify(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('show'),2400)}
async function copy(text,msg){try{await navigator.clipboard.writeText(text);notify(msg)}catch{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();notify(ok?msg:'Copy was blocked by your browser')}}
$('#copyScene').addEventListener('click',()=>copy(sceneText,'Scene text copied'));
const menuBtn=$('#menu'), navMenu=$('#nav');
function toggleMenu(open){const isOpen=open!==undefined?open:navMenu.classList.toggle('open');navMenu.classList.toggle('open',isOpen);menuBtn?.setAttribute('aria-expanded',isOpen?'true':'false');}
menuBtn?.addEventListener('click',()=>toggleMenu());$$('#nav a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));document.addEventListener('click',e=>{if(navMenu?.classList.contains('open')&&!e.target.closest('#nav')&&!e.target.closest('#menu'))toggleMenu(false);});
const slides=$$('.hero-slide'), dots=$$('.hero-dot');let currentSlide=0, slideTimer;
function setSlide(index){if(!slides.length)return;currentSlide=(index+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===currentSlide));dots.forEach((d,i)=>{const active=i===currentSlide;d.classList.toggle('active',active);d.setAttribute('aria-current',active?'true':'false');});}
function startSlideTimer(){clearInterval(slideTimer);slideTimer=setInterval(()=>setSlide(currentSlide+1),5000);}
if(slides.length){dots.forEach((dot,i)=>dot.addEventListener('click',()=>{setSlide(i);startSlideTimer();}));$('#heroPrev')?.addEventListener('click',()=>{setSlide(currentSlide-1);startSlideTimer();});$('#heroNext')?.addEventListener('click',()=>{setSlide(currentSlide+1);startSlideTimer();});$('#home')?.addEventListener('mouseenter',()=>clearInterval(slideTimer));$('#home')?.addEventListener('mouseleave',()=>startSlideTimer());startSlideTimer();}

/* Gallery tabs and image fallback */
const gTabs=$$('.gtab'),gCards=$$('.gallery-card');
gTabs.forEach(t=>t.addEventListener('click',()=>{gTabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');gCards.forEach(c=>c.classList.toggle('hidden',t.dataset.galleryFilter!=='all'&&c.dataset.gallery!==t.dataset.galleryFilter));}));
$$('img').forEach(img=>{const fail=()=>{const p=img.parentElement;p.dataset.label=img.alt;p.classList.add('no-img');};img.addEventListener('error',fail);if(img.complete&&img.naturalWidth===0&&img.currentSrc)fail();});

/* Scroll progress and reveal */
document.documentElement.classList.add('js');
const bar=$('#progress');addEventListener('scroll',()=>{const m=document.documentElement.scrollHeight-innerHeight;bar.style.width=(m>0?scrollY/m*100:0)+'%';},{passive:true});
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12}):null;
$$('.heading-row,.intro-img-card,.company-profile,.experience-highlight,.project,.japanese-card,.cap-list>div,.difference-card,.video-card,.band>div').forEach(el=>{el.classList.add('reveal');io?io.observe(el):el.classList.add('in');});

/* Page number indicator and section spy */
const PAGES=[['home','Home'],['vision','The Vision'],['about','About Us'],['collections','Collections'],['japanese-interiors','Japanese Interiors'],['gallery','Interior Gallery'],['craft','Our Craft'],['why-choose','Why Choose Us'],['videos','Interior Videos'],['contact','Contact']];
const pgDots=$('#pageDots');
PAGES.forEach(([id,name],i)=>{const a=document.createElement('a');a.href='#'+id;a.dataset.name=String(i+1).padStart(2,'0')+' '+name;a.setAttribute('aria-label','Go to '+name);pgDots.appendChild(a);});
function setPage(i){$('#pgNum').textContent=String(i+1).padStart(2,'0');$('#pgName').textContent=PAGES[i][1].toUpperCase();$$('#pageDots a').forEach((d,k)=>d.classList.toggle('active',k===i));$$('#nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+PAGES[i][0]));}
if('IntersectionObserver' in window){const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)setPage(PAGES.findIndex(p=>p[0]===e.target.id));}),{rootMargin:'-45% 0px -50% 0px'});PAGES.forEach(([id])=>{const s=document.getElementById(id);if(s)spy.observe(s);});}
setPage(0);
