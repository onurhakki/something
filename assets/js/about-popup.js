(() => {
  'use strict';
  const modal = document.getElementById('about-modal');
  if (!modal) return;
  const panel = modal.querySelector('.about-modal-panel');
  const closeButton = document.getElementById('about-modal-close');
  const nav = document.getElementById('site-nav');
  const menu = document.querySelector('.menu-button');
  let opener = null;
  function openAbout(event) {
    if (event) event.preventDefault();
    if (!document.getElementById('film-detail')?.hidden || !document.getElementById('site-lightbox')?.hidden) return;
    opener = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('about-modal-open');
    panel.scrollTop = 0;
    if (nav) nav.classList.remove('open');
    if (menu) { menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu ☰'; }
    closeButton.focus();
  }
  function closeAbout() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('about-modal-open');
    if (opener && opener.isConnected && opener.focus) opener.focus();
  }
  document.querySelectorAll('a[href="#about"]').forEach(a => a.addEventListener('click', openAbout));
  closeButton.addEventListener('click', closeAbout);
  modal.querySelector('.about-modal-backdrop').addEventListener('click', closeAbout);
  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeAbout(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...panel.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => el.getClientRects().length);
    if (!controls.length) {event.preventDefault();panel.focus();return;}
    const first=controls[0],last=controls[controls.length-1];
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
  });
  if (location.hash === '#about') {
    // Compatibility with an old bookmarked #about URL.
    openAbout();
  }
})();
