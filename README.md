# Andrei Croitoru — CV

Site personal de prezentare (RO / EN), static, fără build.

## Structură

```
index.html        scheletul paginii
css/styles.css    stiluri (temă luminoasă + întunecată)
js/data.js        datele CV-ului — aici editezi conținutul
js/i18n.js        textele interfeței în română și engleză
js/app.js         randarea paginii și comutatorul de limbă
assets/           favicon și alte resurse
```

## Cum actualizezi CV-ul

Editează `js/data.js` (experiență, educație, certificări, competențe), apoi fă commit și push. GitHub Pages republică site-ul automat.

## Rulare locală

```bash
python3 -m http.server 8000
```

apoi deschide http://localhost:8000.
