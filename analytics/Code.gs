/**
 * Аналитика записей с сайта «Культура» — бэкенд на Google Apps Script.
 *
 * Как подключить: см. analytics/README.md.
 * Коротко:
 *   1. Создайте Google-таблицу → Расширения → Apps Script.
 *   2. Вставьте этот код, замените SECRET на свой ключ.
 *   3. Развернуть → Новое развёртывание → тип «Веб-приложение»,
 *      «Запуск от имени: Я», «Доступ: Все». Скопируйте URL /exec.
 *   4. URL вставьте в js/config.js (KULTURA_TRACK_URL), ключ — в админке.
 */

var SHEET_NAME = 'events';
var SECRET = 'ПОМЕНЯЙТЕ_НА_СВОЙ_КЛЮЧ'; // тот же ключ вводится в admin.html

/** Приём события с сайта (sendBeacon / fetch, тело — JSON строкой). */
function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var sh = getSheet_();
    sh.appendRow([
      new Date(),
      String(data.type || ''),
      String(data.master || ''),
      String(data.where || ''),
      String(data.page || ''),
      String(data.ref || '')
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Сводка для админки. Требует ?key=SECRET. Поддерживает JSONP (?callback=). */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.key !== SECRET) return respond_(p, { ok: false, error: 'forbidden' });

  var sh = getSheet_();
  var last = sh.getLastRow();
  var rows = last > 1 ? sh.getRange(2, 1, last - 1, 6).getValues() : [];

  var total = 0, byMaster = {}, byType = {}, byDay = {}, recent = [];
  rows.forEach(function (r) {
    var ts = r[0] instanceof Date ? r[0] : new Date(r[0]);
    var type = String(r[1] || ''), master = String(r[2] || ''), where = String(r[3] || '');
    total++;
    byType[type] = (byType[type] || 0) + 1;
    if (master) byMaster[master] = (byMaster[master] || 0) + 1;
    var day = Utilities.formatDate(ts, 'Europe/Moscow', 'yyyy-MM-dd');
    byDay[day] = (byDay[day] || 0) + 1;
    recent.push({ ts: ts.getTime(), type: type, master: master, where: where });
  });
  recent = recent.slice(-40).reverse();

  return respond_(p, {
    ok: true, total: total, byMaster: byMaster, byType: byType, byDay: byDay, recent: recent
  });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['timestamp', 'type', 'master', 'where', 'page', 'referrer']);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function respond_(p, obj) {
  var s = JSON.stringify(obj);
  if (p.callback) {
    return ContentService.createTextOutput(p.callback + '(' + s + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON);
}
