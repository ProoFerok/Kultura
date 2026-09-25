(() => {
  const overlay = document.getElementById('booking-overlay');
  const frame = document.getElementById('booking-frame');
  const closeBtn = document.getElementById('booking-close');
  const externalLink = document.getElementById('booking-external');
  let lastFocused = null;

  function openBooking(url) {
    lastFocused = document.activeElement;
    // Запасной выход: если DIKIDI запретит встраивание или песочница
    // помешает виджету, записаться можно в отдельной вкладке.
    externalLink.href = url;
    frame.src = url;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeBooking() {
    overlay.hidden = true;
    frame.src = 'about:blank';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  function masterFromUrl(url) {
    if (url.indexOf('4005910') > -1) return 'Гуляев Данил';
    if (url.indexOf('3545598') > -1) return 'Терёшкин Андрей';
    if (url.indexOf('4615003') > -1) return 'Гребенщиков Максим';
    return 'unknown';
  }

  document.querySelectorAll('[data-booking-url]').forEach((el) => {
    el.addEventListener('click', () => {
      const url = el.dataset.bookingUrl;
      openBooking(url);
      if (window.kulturaTrack) window.kulturaTrack({ type: 'booking_open', master: masterFromUrl(url) });
    });
  });

  closeBtn.addEventListener('click', closeBooking);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeBooking();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeBooking();
  });
})();

// Меню навигации на узком экране.
(() => {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();
