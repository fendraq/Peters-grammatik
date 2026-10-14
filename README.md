# Peters grammatik

En övningssida i svenska för elever som har svenska som andraspråk. Sidan har lucktexter och andra korta övningar med direkt återkoppling.

## Övningstyper

1. **Lucktext** – eleven fyller i ett ord.
2. **Välj rätt** – eleven väljer mellan alternativ.
3. **Svara utifrån kontext** – eleven skriver ett svar utifrån en text eller situation.

## Så fungerar sidan

- Publiceras endast på GitHub Pages. Ingen server och ingen inloggning.
- Vanlig HTML, CSS och JavaScript. Inga ramverk, bibliotek eller build-steg.
- Inga cookies, inga spårare och inga externa tjänster.
- Övningar ligger som data i JSON-filer i `data/`. Nya övningar läggs till i JSON, utan kodändring.

## Filer

| Sökväg | Innehåll |
|---|---|
| `index.html` | Sidan |
| `css/style.css` | Utseende |
| `js/app.js` | Kod för övningarna |
| `data/` | Övningar i JSON-format |
| `AGENTS.md` | Regler för AI-agenter som arbetar i repot |
| `decisions.md` | Beslut som har tagits i projektet |

## Köra sidan lokalt

`fetch` av JSON fungerar inte om du öppnar filen direkt (`file://`). Starta en enkel server i stället:

```
python3 -m http.server
```

Öppna sedan `http://localhost:8000` i webbläsaren.

## Arbetssätt

- Inga ändringar görs innan de är bekräftade. Se `AGENTS.md`.
- Kod, filnamn och kommentarer är på engelska. Text på sidan och dokumentation är på svenska.
- Texten på sidan ska vara enkel svenska (ca A2–B1).
- Alla beslut skrivs i `decisions.md`.
