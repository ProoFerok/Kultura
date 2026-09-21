// Дашборд «Культура»: читает опубликованный CSV таблицы ответов Google-Формы
// и рисует сводку. Вынесен из admin.html отдельным файлом, чтобы страница могла
// объявить script-src 'self' без 'unsafe-inline' — данные в CSV приходят из
// публичной формы, поэтому строгий CSP здесь не формальность.
(function(){
  var login = document.getElementById('login');
  var dash = document.getElementById('dash');
  var loginForm = document.getElementById('loginForm');
  var csvInput = document.getElementById('csv');
  var loginMsg = document.getElementById('loginMsg');
  var msg = document.getElementById('msg');

  var TYPE_LABEL = { booking_open:'Открыли форму мастера', profile_click:'Клик на профиль' };
  var WHERE_LABEL = { header:'шапка', top:'герой', services:'прайс', contacts:'контакты', footer:'подвал' };

  // Ищем только собственные ключи: значения в CSV приходят из публичной формы,
  // и ключ вроде "constructor" или "__proto__" иначе вернул бы объект из
  // прототипа, который попал бы в разметку вместо самого значения.
  function label(map, key){
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : key;
  }

  // --- CSV парсер (учитывает кавычки, запятые, переводы строк) ---
  function parseCSV(text){
    var rows = [], row = [], cur = '', i = 0, q = false, c;
    while(i < text.length){
      c = text[i];
      if(q){
        if(c === '"'){ if(text[i+1] === '"'){ cur += '"'; i++; } else q = false; }
        else cur += c;
      } else {
        if(c === '"') q = true;
        else if(c === ','){ row.push(cur); cur = ''; }
        else if(c === '\n'){ row.push(cur); rows.push(row); row = []; cur = ''; }
        else if(c === '\r'){ /* пропускаем */ }
        else cur += c;
      }
      i++;
    }
    if(cur.length || row.length){ row.push(cur); rows.push(row); }
    return rows;
  }

  function esc(v){ return String(v==null?'':v).replace(/[<>&]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];}); }
  function fmt(ts){
    var d = new Date(ts); if(isNaN(d)) return '';
    var p = function(n){ return (n<10?'0':'')+n; };
    return p(d.getDate())+'.'+p(d.getMonth()+1)+' '+p(d.getHours())+':'+p(d.getMinutes());
  }
  function dayKey(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }

  // Колонки CSV: 0=Отметка времени(Google), 1=type, 2=master, 3=where, 4=page, 5=ts(мс)
  function toEvents(rows){
    var out = [];
    for(var r = 1; r < rows.length; r++){ // пропускаем заголовок
      var row = rows[r];
      if(!row || (row.length === 1 && row[0] === '')) continue;
      var type = (row[1]||'').trim();
      if(!type) continue;
      var ms = parseInt(row[5], 10);
      if(!ms){ var gd = new Date(row[0]); ms = isNaN(gd) ? Date.now() : gd.getTime(); }
      out.push({ ts:ms, type:type, master:(row[2]||'').trim(), where:(row[3]||'').trim(), page:(row[4]||'').trim() });
    }
    out.sort(function(a,b){ return a.ts - b.ts; });
    return out;
  }

  function render(events){
    var total = events.length, byType = Object.create(null), byMaster = Object.create(null), byDay = Object.create(null);
    events.forEach(function(e){
      byType[e.type] = (byType[e.type]||0)+1;
      if(e.master) byMaster[e.master] = (byMaster[e.master]||0)+1;
      var k = dayKey(new Date(e.ts));
      byDay[k] = (byDay[k]||0)+1;
    });

    document.getElementById('mTotal').textContent = total;
    document.getElementById('mOpen').textContent = byType.booking_open || 0;
    document.getElementById('mProfile').textContent = byType.profile_click || 0;

    var days = [], today = new Date();
    for(var i = 13; i >= 0; i--){
      var d = new Date(today); d.setDate(today.getDate()-i);
      var k = dayKey(d);
      days.push({ label:('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2), n: byDay[k]||0 });
    }
    document.getElementById('m7').textContent = days.slice(-7).reduce(function(a,b){return a+b.n;},0);

    var keys = Object.keys(byMaster).sort(function(a,b){return byMaster[b]-byMaster[a];});
    var maxM = keys.reduce(function(m,k){return Math.max(m,byMaster[k]);},1);
    document.getElementById('masters').innerHTML = keys.length ? keys.map(function(k){
      var pct = Math.round(byMaster[k]/maxM*100);
      return '<div class="bar"><span>'+esc(k)+'</span><span class="track"><span class="fill" style="width:'+pct+'%"></span></span><span class="n tnum">'+byMaster[k]+'</span></div>';
    }).join('') : '<div class="muted">Пока нет открытий формы мастера.</div>';

    var maxD = days.reduce(function(m,d){return Math.max(m,d.n);},1);
    document.getElementById('days').innerHTML = days.map(function(d){
      var h = Math.round(d.n/maxD*120);
      return '<div class="day"><span class="cnt tnum">'+(d.n||'')+'</span><span class="col" style="height:'+h+'px"></span><span class="cap">'+d.label+'</span></div>';
    }).join('');

    var rec = events.slice(-40).reverse();
    document.getElementById('recent').innerHTML = rec.length ? rec.map(function(e){
      var isOpen = e.type === 'booking_open';
      var detail = isOpen ? esc(e.master) : esc(label(WHERE_LABEL, e.where));
      return '<tr><td class="tnum muted">'+fmt(e.ts)+'</td><td><span class="tag '+(isOpen?'open':'')+'">'+esc(label(TYPE_LABEL, e.type))+'</span></td><td>'+detail+'</td><td class="muted">'+esc(e.page)+'</td></tr>';
    }).join('') : '<tr><td colspan="4" class="muted">Событий пока нет.</td></tr>';
  }

  function load(url){
    if(!url){ showLogin('Не задана ссылка на CSV.'); return; }
    msg.textContent = 'Загрузка…';
    fetch(url, { cache:'no-store' }).then(function(r){
      if(!r.ok) throw new Error('http '+r.status);
      return r.text();
    }).then(function(text){
      if(/^\s*</.test(text)) throw new Error('html'); // пришла страница, а не CSV
      var events = toEvents(parseCSV(text));
      localStorage.setItem('kultura_csv_url', url);
      login.classList.add('hidden');
      dash.classList.remove('hidden');
      msg.textContent = 'Обновлено ' + fmt(Date.now());
      render(events);
    }).catch(function(err){
      if(err.message === 'html'){
        showLogin('Ссылка ведёт не на CSV. Нужен вариант «Опубликовать в интернете → CSV» (…/pub?output=csv).');
      } else {
        showLogin('Не удалось загрузить CSV. Проверьте, что таблица опубликована в интернете и ссылка верна.');
      }
    });
  }

  function showLogin(text){
    dash.classList.add('hidden');
    login.classList.remove('hidden');
    loginMsg.textContent = text || '';
    msg.textContent = '';
  }

  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    var u = csvInput.value.trim();
    if(u) load(u);
  });
  document.getElementById('refresh').addEventListener('click', function(){
    load(localStorage.getItem('kultura_csv_url') || (window.KULTURA_CSV_URL||''));
  });
  document.getElementById('logout').addEventListener('click', function(){
    localStorage.removeItem('kultura_csv_url');
    csvInput.value = '';
    showLogin('');
  });

  // автозагрузка: сохранённая ссылка или заданная в config.js
  var saved = localStorage.getItem('kultura_csv_url') || (window.KULTURA_CSV_URL || '');
  if(saved){ csvInput.value = saved; load(saved); }
})();
