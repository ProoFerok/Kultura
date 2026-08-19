// Лёгкий трекинг «намерения записаться» с сайта — отправка в Google-Форму.
// Ответы формы Google складывает в связанную таблицу (её вы и смотрите).
// Никаких куки, скриптов и OAuth: форма принимает ответы анонимно.
// Пока js/config.js -> KULTURA_FORM.action пустой, функция ничего не делает.
(function () {
  function track(payload) {
    var cfg = window.KULTURA_FORM;
    if (!cfg || !cfg.action) return; // не настроено — не мешаем сайту
    var f = cfg.fields || {};
    var fd = new FormData();
    if (f.type)   fd.append(f.type, payload.type || "");
    if (f.master) fd.append(f.master, payload.master || "");
    if (f.where)  fd.append(f.where, payload.where || "");
    if (f.page)   fd.append(f.page, location.pathname);
    if (f.ts)     fd.append(f.ts, String(Date.now()));
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(cfg.action, fd); // переживает переход/закрытие вкладки
      } else {
        fetch(cfg.action, { method: "POST", mode: "no-cors", body: fd, keepalive: true });
      }
    } catch (e) {
      /* аналитика не должна ломать сайт */
    }
  }

  // Экспорт для main.js (открытие формы записи к мастеру)
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
