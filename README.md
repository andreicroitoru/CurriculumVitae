# CurriculumVitae

Site-ul meu personal de prezentare / CV, în română și engleză.

- **Site:** https://andreicroitoru.github.io/CurriculumVitae/
- **Admin:** https://andreicroitoru.github.io/CurriculumVitae/admin.html

HTML, CSS și JavaScript simplu (ES modules), fără framework și fără pas de build.
Conținutul CV-ului stă în **Supabase** (Postgres), site-ul e publicat cu GitHub Pages din ramura `main`.

## Cum funcționează

- `index.html` citește CV-ul din Supabase cu cheia *publishable* (publică, doar citire).
- `admin.html` - login cu email + parolă (Supabase Auth). Doar conturile din tabelul `admin_users` pot modifica date.
- Regulile de acces sunt în baza de date (Row Level Security), nu în JavaScript: oricine poate citi, doar adminii pot scrie.

## Structură

```
index.html                        site-ul public
admin.html                        pagina de editare
css/
  variables.css                   culori, fonturi, dimensiuni (temă luminoasă + întunecată)
  base.css                        reset și butoane
  header.css                      header-ul sticky și comutatorul RO/EN
  sections.css                    secțiunile CV-ului
  admin.css                       stiluri pentru admin
js/
  config.js                       URL-ul proiectului Supabase + cheia publishable
  main.js                         CvApp - încarcă CV-ul și schimbă limba
  services/supabaseClient.js      clientul Supabase (folosit doar de admin)
  services/CvRepository.js        citește tabelele cu fetch() și le transformă pentru CvRenderer
  i18n/translations.js            textele interfeței în RO și EN
  components/CvRenderer.js        generează HTML-ul secțiunilor
  components/LanguageSwitcher.js  comutatorul RO/EN (tap, drag, tastatură)
  admin/AdminApp.js               login, tab-uri, notificări
  admin/AuthService.js            login / logout / verificare admin
  admin/TableEditor.js            editor generic pentru un tabel (adaugă, salvează, șterge)
  admin/editorSchemas.js          ce câmpuri apar în formular pentru fiecare tabel
  utils/                          DateFormatter, SpringAnimation, escapeHtml
supabase/
  migrations/                     schema bazei de date + reguli RLS
  seed.sql                        datele inițiale ale CV-ului
```

## Baza de date

| Tabel | Conținut |
|---|---|
| `profile` | un singur rând: nume, rol, locație, „Despre” |
| `work_experience` | joburi (`end_date` gol = job actual) |
| `education` | studii |
| `certifications` | certificări (`skill_level` 1–3) |
| `skills` | competențe |
| `admin_users` | cine poate edita |

Proiect nou de la zero: rulează în SQL Editor fișierul din `supabase/migrations/`, apoi `supabase/seed.sql`,
creează un user în Authentication și adaugă-l ca admin:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'email@exemplu.com';
```

Un câmp nou în CV = coloană nouă în tabel + câmp în `js/admin/editorSchemas.js` + afișare în `CvRepository.js` / `CvRenderer.js`.

## Rulare locală

```bash
python3 -m http.server 8000
```

apoi http://localhost:8000 (ES modules nu merg deschise direct cu `file://`).
