# CurriculumVitae

Site-ul meu personal de prezentare / CV, în română și engleză.

**Live:** https://andreicroitoru.github.io/CurriculumVitae/

HTML, CSS și JavaScript simplu (ES modules), fără framework și fără pas de build.
Publicat cu GitHub Pages direct din ramura `main`.

## Structură

```
index.html                        scheletul paginii (header, main, footer)
css/
  variables.css                   culori, fonturi, dimensiuni (temă luminoasă + întunecată)
  base.css                        reset și butoane
  header.css                      header-ul sticky și comutatorul RO/EN
  sections.css                    secțiunile CV-ului
js/
  main.js                         CvApp - pornește aplicația, schimbă limba
  data/cvData.js                  conținutul CV-ului
  i18n/translations.js            textele interfeței în RO și EN
  components/CvRenderer.js        generează HTML-ul secțiunilor din cvData
  components/LanguageSwitcher.js  comutatorul RO/EN (tap, drag, tastatură)
  utils/DateFormatter.js          perioade și durate ("iun. 2018 – Prezent", "8 ani 5 luni")
  utils/SpringAnimation.js        animație de tip spring pentru comutator
  utils/escapeHtml.js
assets/favicon.svg
```

## Actualizare CV

Tot conținutul e în `js/data/cvData.js`. Un job nou, de exemplu:

```js
{
  jobTitle: { ro: "Senior Developer", en: "Senior Developer" },
  companyName: "Firma X",
  location: { ro: "București, România", en: "Bucharest, Romania" },
  startDate: "2026-11",
  endDate: null, // null = încă lucrez acolo
  logoInitials: "FX",
  logoColor: "#444444",
},
```

După commit + push, GitHub Pages republică site-ul în ~1 minut.

## Rulare locală

Fiind ES modules, pagina trebuie servită printr-un server (nu merge deschisă direct cu `file://`):

```bash
python3 -m http.server 8000
```

apoi http://localhost:8000
