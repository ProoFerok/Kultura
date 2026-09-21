# Шрифты

Локальные копии шрифтов с Google Fonts — подключаются из `css/style.css`
(`@font-face`), а не запросом к `fonts.googleapis.com`. Так IP посетителя не
уходит в Google, сайт не зависит от внешнего домена и в CSP не нужно открывать
`fonts.googleapis.com` / `fonts.gstatic.com`.

| Файл | Семейство | Начертания | Подмножество |
|---|---|---|---|
| `cormorant-garamond-cyrillic.woff2` | Cormorant Garamond (вариативный) | 300–600 | кириллица |
| `cormorant-garamond-latin.woff2` | Cormorant Garamond (вариативный) | 300–600 | латиница |
| `lora-cyrillic.woff2` | Lora (вариативный) | 400–500 | кириллица |
| `lora-latin.woff2` | Lora (вариативный) | 400–500 | латиница |
| `prata-cyrillic.woff2` | Prata | 400 | кириллица |
| `prata-latin.woff2` | Prata | 400 | латиница |

Вариативные файлы покрывают весь диапазон насыщенности одним файлом, поэтому
на три семейства нужно всего шесть файлов (168 КБ). Курсив не скачан — в вёрстке
он нигде не используется.

## Лицензия

Все три семейства распространяются по **SIL Open Font License 1.1**, которая
разрешает размещать файлы у себя и отдавать их с собственного домена.

- Cormorant Garamond — https://fonts.google.com/specimen/Cormorant+Garamond/license
- Lora — https://fonts.google.com/specimen/Lora/license
- Prata — https://fonts.google.com/specimen/Prata/license

## Как обновить

```
curl -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300..600&family=Lora:wght@400..500&family=Prata&display=swap"
```

В ответе взять блоки `/* cyrillic */` и `/* latin */`, скачать из них `.woff2`
по этим же именам и перенести `unicode-range` в `css/style.css` без изменений.
Современный User-Agent обязателен — иначе Google отдаёт устаревший формат `ttf`.
