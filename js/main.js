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

  document.querySelectorAll('[data-booking-url]').forEach((el) => {
    el.addEventListener('click', () => openBooking(el.dataset.bookingUrl));
  });

  closeBtn.addEventListener('click', closeBooking);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeBooking();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeBooking();
  });
})();
