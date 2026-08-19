(() => {
  const overlay = document.getElementById('booking-overlay');
  const frame = document.getElementById('booking-frame');
  const closeBtn = document.getElementById('booking-close');
  let lastFocused = null;

  function openBooking(url) {
    lastFocused = document.activeElement;
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
