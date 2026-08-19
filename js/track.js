// Лёгкий трекинг «намерения записаться» с сайта.
// Отправляет событие на ваш Google Apps Script (js/config.js -> KULTURA_TRACK_URL).
// Никаких куки и персональных данных: только тип события, мастер/место, время,
// текущая страница и реферер. Если URL не задан — тихо ничего не делает.
(function () {
  function track(payload) {
    var url = window.KULTURA_TRACK_URL;
    if (!url) return; // не настроено — выходим, не мешая сайту
    var body = JSON.stringify({
      type: payload.type || "",
      master: payload.master || "",
      where: payload.where || "",
      page: location.pathname,
      ref: document.referrer || "",
      ts: Date.now()
    });
    try {
      if (navigator.sendBeacon) {
        // sendBeacon переживает переход/закрытие вкладки; text/plain — без CORS-preflight
        navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
      } else {
        fetch(url, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: body,
          keepalive: true
        });
      }
    } catch (e) {
      /* аналитика не должна ломать сайт — молча игнорируем */
    }
  }

  // Экспортируем для main.js (открытие формы записи к мастеру)
  window.kulturaTrack = track;

  // Клики «Записаться» на профиль DIKIDI (шапка, герой, прайс, контакты)
  var links = document.querySelectorAll('a[href*="dikidi.net/ru/profile"]');
  Array.prototype.forEach.call(links, function (a) {
    a.addEventListener("click", function () {
      var where = a.closest("header")
        ? "header"
        : a.closest("footer")
        ? "footer"
        : (a.closest("section[id]") ? a.closest("section[id]").id : "other");
      track({ type: "profile_click", where: where });
    });
  });
})();
