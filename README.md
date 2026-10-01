# CurriculumVitae

Site-ul meu personal de prezentare / CV, în română și engleză.

- **Site:** https://andreicroitoru.github.io/CurriculumVitae/
- **Admin:** https://andreicroitoru.github.io/CurriculumVitae/admin.html

HTML, CSS și JavaScript simplu (ES modules), fără framework și fără pas de build.
Conținutul CV-ului stă în **Supabase** (Postgres), site-ul e publicat cu GitHub Pages prin GitHub Actions (`.github/workflows/deploy.yml`) la fiecare push pe `main`.

## Cache

- Datele din Supabase se cer cu `cache: "no-store"`, deci orice modificare din admin apare la următorul refresh.
- La deploy, workflow-ul adaugă `?v=<commit>` la toate fișierele CSS/JS și scrie `version.json`. Un deploy nou nu se amestecă niciodată cu fișiere vechi din cache.
- La încărcare, pagina compară versiunea ei cu `version.json`; dacă e o copie veche, se reîncarcă singură o dată (`js/utils/versionCheck.js`).

## Cum funcționează

- `index.html` citește CV-ul din Supabase cu cheia *publishable* (publică, doar citire).
- `admin.html` - login cu email + parolă (Supabase Auth). Sidebar cu tab-uri, câte o listă per tabel, adăugare / editare în pop-up (`<dialog>`), confirmare la ștergere. Doar conturile din tabelul `admin_users` pot modifica date.
- Regulile de acces sunt în baza de date (Row Level Security), nu în JavaScript: oricine poate citi, doar adminii pot scrie.
- Ambele pagini au Content-Security-Policy: scripturi doar de pe site (și supabase-js pe admin), conexiuni doar către proiectul Supabase.

## Structură

```
index.html                        site-ul public
admin.html                        pagina de editare
css/
  variables.css                   culori, fonturi, dimensiuni (temă luminoasă + întunecată)
  base.css                        reset și butoane
  header.css                      header-ul sticky și comutatorul RO/EN
  sections.css                    secțiunile CV-ului
  admin.css                       admin: sidebar, tabele, pop-up-uri, efect „liquid glass”
js/
  config.js                       URL-ul proiectului Supabase + cheia publishable
  main.js                         CvApp - încarcă CV-ul și schimbă limba
  services/supabaseClient.js      clientul Supabase (folosit doar de admin)
  services/CvRepository.js        citește tabelele cu fetch() și le transformă pentru CvRenderer
  i18n/translations.js            textele interfeței în RO și EN
  components/CvRenderer.js        generează HTML-ul secțiunilor
  components/LanguageSwitcher.js  comutatorul RO/EN (tap, drag, tastatură)
  admin/AdminApp.js               login, sidebar, comutare între tab-uri, notificări
  admin/AuthService.js            login / logout / verificare admin
  admin/TableView.js              un tab: lista unui tabel + adaugă / editează / șterge
  admin/RecordDialog.js           pop-up-ul cu formular (adăugare și editare)
  admin/ConfirmDialog.js          pop-up-ul de confirmare la ștergere
  admin/editorSchemas.js          pentru fiecare tabel: icon, coloane în listă, câmpuri în formular
  admin/icons.js                  iconițe SVG
  utils/                          DateFormatter, SpringAnimation, escapeHtml
supabase/
  migrations/                     schema bazei de date + reguli RLS
  seed.sql                        datele inițiale ale CV-ului
```

## Baza de date

| Tabel | Conținut |
|---|---|
| `profile` | un singur rând: nume, rol, locație, „Despre” |
| `work_experience` | joburi (`end_date` gol = job actual, `collaboration_type_id` = tipul de colaborare) |
| `collaboration_types` | nomenclator: tipuri de colaborare PF - firmă (CIM normă întreagă / parțială, PFA, drepturi de autor, mandat etc.) |
| `education` | studii |
| `certifications` | certificări (`skill_level` 1–3) |
| `skills` | competențe |
| `admin_users` | cine poate edita |

Proiect nou de la zero: rulează în SQL Editor fișierele din `supabase/migrations/` în ordine, apoi `supabase/seed.sql`,
creează un user în Authentication și adaugă-l ca admin:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'email@exemplu.com';
```

Un câmp de tip listă care ia valorile din alt tabel (ca „Tip colaborare” la experiență) se declară cu `optionsFrom` în `editorSchemas.js`; adminul reîncarcă singur lista de joburi când se modifică nomenclatorul.

Un câmp nou în CV = coloană nouă în tabel + câmp în `js/admin/editorSchemas.js` + afișare în `CvRepository.js` / `CvRenderer.js`.

## Rulare locală

```bash
python3 -m http.server 8000
```

apoi http://localhost:8000 (ES modules nu merg deschise direct cu `file://`).
