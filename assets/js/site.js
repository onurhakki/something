(()=>{
  'use strict';
  const data=window.PORTFOLIO_CONTENT||{};
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const imgPath=p=>p&&/^(https?:\/\/|assets\/)/i.test(p)?p:(p?'assets/images/'+p:'');
  const header=$('#site-header'),nav=$('#site-nav'),menu=$('.menu-button');
  const onScroll=()=>header.classList.toggle('scrolled',scrollY>24);
  onScroll();addEventListener('scroll',onScroll,{passive:true});
  menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close ×':'Menu ☰';});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu ☰';}));
  const reveal=$$('[data-reveal]');
  if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.07});reveal.forEach(el=>observer.observe(el));}else reveal.forEach(el=>el.classList.add('is-visible'));
  $('#year').textContent=new Date().getFullYear();
  const movies=(data.movies||[]).filter(m=>m.published!==false).sort((a,b)=>(a.order||0)-(b.order||0));
  function tile(m){const image=imgPath(m.poster);return `<button type="button" class="film-tile" data-film="${escape(m.slug)}" aria-label="Open ${escape(m.title)} details"><div class="tile-image">${image?`<img src="${escape(image)}" alt="${escape(m.title)} poster" loading="lazy">`:`<div class="tile-placeholder">${escape(m.title)}</div>`}</div><div class="tile-caption"><h3>${escape(m.title)}</h3><span>${escape(m.genre)}${m.year?' · '+escape(m.year):''}</span></div></button>`;}
  $('#films-grid').innerHTML=movies.filter(m=>!m.commissioned).map(tile).join('')||'<p class="muted">Films coming soon.</p>';
  $('#commissions-grid').innerHTML=movies.filter(m=>m.commissioned).map(tile).join('')||'<p class="muted">Commissioned projects coming soon.</p>';
  const detail=$('#film-detail');let opener=null;
  function openFilm(slug,button){const m=movies.find(m=>m.slug===slug);if(!m)return;opener=button;const image=imgPath(m.poster);
    const lead=m.vimeo_id?`<div class="video"><iframe src="https://player.vimeo.com/video/${encodeURIComponent(m.vimeo_id)}" title="${escape(m.title)} video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`:image?`<div class="hero-poster"><img src="${escape(image)}" alt="${escape(m.title)} poster"></div>`:'';
    const gallery=(m.images||[]).filter(g=>g.image||typeof g==='string');
    $('#film-detail-content').innerHTML=`<p class="eyebrow">MOVIES / ${escape(m.year||'')}</p><h1>${escape(m.title)}</h1><p class="film-meta">${escape(m.genre)}${m.year?' · '+escape(m.year):''}${m.credit?' · '+escape(m.credit):''}</p>${lead}${m.synopsis?`<section class="reading detail-section"><h2>Synopsis</h2><p>${escape(m.synopsis).replace(/\n/g,'<br>')}</p></section>`:''}${gallery.length?`<section class="detail-section"><h2>Images</h2><div class="gallery">${gallery.map(g=>{const path=imgPath(typeof g==='string'?g:g.image);const cap=typeof g==='string'?m.title:(g.caption||m.title);return `<figure><a href="${escape(path)}" class="lightbox-trigger" data-lightbox="film-${escape(m.slug)}" data-caption="${escape(cap)}"><img src="${escape(path)}" alt="${escape(cap)}" loading="lazy"></a><figcaption>${escape(cap)}</figcaption></figure>`;}).join('')}</div></section>`:''}${(m.festivals||[]).length?`<section class="detail-section"><h2>${m.slug==='mother-will-dad-be-angry-with-me'?'Project Development & Production Awards':'Festival Screenings & Awards'}</h2><ul class="festival-list">${m.festivals.map(f=>`<li>${escape(f)}</li>`).join('')}</ul></section>`:''}`;
    detail.hidden=false;document.body.style.overflow='hidden';detail.scrollTop=0;$('#film-close').focus();}
  function closeFilm(){detail.hidden=true;$('#film-detail-content').innerHTML='';document.body.style.overflow='';opener?.focus();}
  $('#film-close').addEventListener('click',closeFilm);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-film]');if(b)openFilm(b.dataset.film,b);});
  (data.about||[]).forEach(p=>$('#about-bio').insertAdjacentHTML('beforeend',`<p>${escape(p)}</p>`));
  (data.statement||[]).forEach(p=>$('#about-statement').insertAdjacentHTML('beforeend',`<p>${escape(p)}</p>`));
  if(data.profileImage)$('#about-portrait').innerHTML=`<img src="${escape(imgPath(data.profileImage))}" alt="${escape(data.profileAlt||'Portrait')}" loading="lazy">`;
  const news=(data.news||[]).filter(n=>n.published!==false).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  let newsPage=1;const perPage=50;
  function newsRow(n){const title=escape(n.title||''),summary=escape(n.summary||'');const date=escape(n.date||'');
    const candidate = String(n.url || n.link || '').trim();
    const link = /^https?:\/\//i.test(candidate) ? candidate : '';
    return `<article class="news-entry"><time datetime="${date}">${date}</time><div class="news-entry-content"><h3>${link?`<a href="${escape(link)}" target="_blank">${title} <span class="news-link-icon" aria-hidden="true">↗</span></a>`:title}</h3>${summary?`<p>${summary}</p>`:''}</div></article>`;}
  // First 10 news visible by default; button expands to the archive paginated by 50.
  let archive=false;
  function drawNews(){const total=Math.max(1,Math.ceil(news.length/perPage));if(!news.length){$('#news-list').innerHTML='<p class="news-empty">No published news yet. Add items in assets/js/content.js.</p>';$('#news-pager').hidden=true;return;}
    if(!archive){$('#news-list').innerHTML=news.slice(0,10).map(newsRow).join('')+(news.length>10?'<p><button class="news-archive-button" id="open-archive">View all news ↗</button></p>':'');$('#news-pager').hidden=true;$('#open-archive')?.addEventListener('click',()=>{archive=true;newsPage=1;drawNews();});return;}
    $('#news-list').innerHTML=news.slice((newsPage-1)*perPage,newsPage*perPage).map(newsRow).join('');$('#news-pager').hidden=false;$('#news-prev').disabled=newsPage<=1;$('#news-next').disabled=newsPage>=total;$('#news-count').textContent=`Page ${newsPage} of ${total} · ${news.length} updates`;
  }
  $('#news-prev').onclick=()=>{if(newsPage>1){newsPage--;drawNews();$('#news').scrollIntoView();}};$('#news-next').onclick=()=>{if(newsPage<Math.ceil(news.length/perPage)){newsPage++;drawNews();$('#news').scrollIntoView();}};
  drawNews();
  const gallery=(data.festivalGallery||[]).filter(f=>f.image),galleryEl=$('[data-festival-carousel]'),gallerySection=$('.festival-works-section');
  galleryEl.innerHTML=gallery.map((g,i)=>`<article class="festival-slide festival-gallery-frame" role="group" aria-roledescription="slide" aria-label="${i+1} of ${gallery.length}" ${i?'hidden aria-hidden="true"':''}><a class="lightbox-trigger" href="${escape(imgPath(g.image))}" data-lightbox="festival-gallery" data-caption="${escape(g.title)}"><img src="${escape(imgPath(g.image))}" alt="${escape(g.imageAlt||g.title)}" loading="lazy"></a><div class="festival-slide-description"><h3>${escape(g.title)}</h3>${g.description?`<p>${escape(g.description)}</p>`:''}</div></article>`).join('');
  if(!gallery.length){$('#festival-empty').hidden=false;gallerySection.querySelector('.carousel-actions').hidden=true;}
  const slides=$$('.festival-slide');let active=0,autoplayTimer=null,hover=false,focus=false;
  function show(i){if(!slides.length)return;active=(i+slides.length)%slides.length;slides.forEach((s,n)=>{const selected=n===active;s.hidden=!selected;s.setAttribute('aria-hidden',String(!selected));s.classList.toggle('is-current',selected);});$('[data-carousel-counter]').textContent=`${String(active+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;}
  function stop(){clearInterval(autoplayTimer);autoplayTimer=null;}
  function play(){stop();if(slides.length>1&&!document.hidden&&!hover&&!focus&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&$('#site-lightbox').hidden&&detail.hidden){autoplayTimer=setInterval(()=>show(active+1),5000);}}
  $('[data-carousel-prev]').onclick=()=>{show(active-1);play();};$('[data-carousel-next]').onclick=()=>{show(active+1);play();};
  [galleryEl,gallerySection.querySelector('.carousel-actions')].forEach(el=>{el.addEventListener('mouseenter',()=>{hover=true;stop();});el.addEventListener('mouseleave',()=>{hover=false;play();});el.addEventListener('focusin',()=>{focus=true;stop();});el.addEventListener('focusout',()=>{requestAnimationFrame(()=>{focus=gallerySection.contains(document.activeElement);play();});});});
  let tx=null;galleryEl.addEventListener('touchstart',e=>{tx=e.changedTouches[0].screenX;},{passive:true});galleryEl.addEventListener('touchend',e=>{if(tx===null)return;const d=e.changedTouches[0].screenX-tx;if(Math.abs(d)>55)show(active+(d<0?1:-1));tx=null;},{passive:true});
  galleryEl.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(active+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(active-1);}});
  document.addEventListener('visibilitychange',play);show(0);play();
  // Image viewer: handles links added dynamically by film details.
  const lightbox=$('#site-lightbox');let imageLinks=[],imageIndex=0,lightboxOpener=null;
  function updateImage(){const el=imageLinks[imageIndex];if(!el)return;$('#lightbox-image').src=el.href;$('#lightbox-image').alt=el.querySelector('img')?.alt||'';$('#lightbox-caption').textContent=el.dataset.caption||'';$('#lightbox-prev').disabled=imageLinks.length<2;$('#lightbox-next').disabled=imageLinks.length<2;}
  function openImage(a){imageLinks=$$(`a.lightbox-trigger[data-lightbox="${CSS.escape(a.dataset.lightbox)}"]`);imageIndex=imageLinks.indexOf(a);lightboxOpener=a;lightbox.hidden=false;lightbox.setAttribute('aria-hidden','false');document.body.classList.add('lightbox-open');updateImage();$('#site-lightbox .lightbox-close').focus();stop();}
  function closeImage(){lightbox.hidden=true;lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('lightbox-open');$('#lightbox-image').removeAttribute('src');lightboxOpener?.focus();play();}
  document.addEventListener('click',e=>{const a=e.target.closest('a.lightbox-trigger');if(a){e.preventDefault();openImage(a);}if(e.target.closest('[data-lightbox-close]'))closeImage();});
  $('#lightbox-prev').onclick=()=>{imageIndex=(imageIndex+imageLinks.length-1)%imageLinks.length;updateImage();};$('#lightbox-next').onclick=()=>{imageIndex=(imageIndex+1)%imageLinks.length;updateImage();};
  window.addEventListener('keydown',e=>{if(!lightbox.hidden){if(e.key==='Escape')closeImage();else if(e.key==='ArrowRight')$('#lightbox-next').click();else if(e.key==='ArrowLeft')$('#lightbox-prev').click();return;}if(!detail.hidden&&e.key==='Escape'){closeFilm();play();}});
  document.addEventListener('click',e=>{if(e.target.closest('[data-film]'))stop();});$('#film-close').addEventListener('click',play);
})();
