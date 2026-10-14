# Beslut

## 2026-10-14 – Skapade AGENTS.md med arbetsregler
- **Beslut:** Agenter följer reglerna i `AGENTS.md`: bekräfta före ändring, vanlig HTML/CSS/JS, övningar som JSON-data, publicering endast på GitHub Pages.
- **Motivering:** Sidan ska vara enkel, självunderhållande och under användarens kontroll.
- **Alternativ:** Ingen AGENT-fil (inga gemensamma regler).
- **Status:** Gäller

## 2026-10-14 – Engelska i kod, svenska i UI och dokumentation
- **Beslut:** Kod, filnamn och kommentarer på engelska. UI-text och `decisions.md` på svenska.
- **Motivering:** Konsekvent namngivning, enkel svenska för eleverna.
- **Alternativ:** Svenska överallt; blandat som tidigare.
- **Status:** Gäller

## 2026-10-14 – Rättade trasiga taggar i index.html
- **Beslut:** Rättade `<link>` för CSS och `<script>` för `js/app.js`.
- **Motivering:** Taggarna var trasiga, så varken CSS eller JavaScript laddades.
- **Alternativ:** Inga.
- **Status:** Gäller

## 2026-10-14 – data/test_ovning.json är en testfil
- **Beslut:** Filen är bara ett test. Fler JSON-filer läggs till senare.
- **Motivering:** Användaren vill se innehållet först.
- **Alternativ:** Inga.
- **Status:** Gäller

## 2026-10-14 – JSON-struktur för övningar
- **Beslut:** Varje övningsfil har `title`, `area` och `exercises`. Varje övning har `type` (`gap-fill`, `multiple-choice` eller `context-answer`) och `answers` (alltid en lista, så flera godkända svar fungerar). `gap-fill` har `text`, `multiple-choice` har `question` och `options`, `context-answer` har `context` och `question`. Mall finns i `data/_template.json`. `data/index.json` listar övningsfilerna eftersom GitHub Pages inte kan lista mappar. `data/test_ovning.json` har bytt till den nya strukturen.
- **Motivering:** Sidomenyn ska byggas av `area` och `title`. Samma `answers`-lista gör att "Rätta" fungerar likadant för alla övningstyper.
- **Alternativ:** Svenska nycklar som tidigare; ett enda svar per övning; en fil med alla övningar.
- **Status:** Gäller

## 2026-10-14 – Sidomeny byggd från JSON
- **Beslut:** `index.html` har en sidomeny (`<nav>`) och en innehållsyta. `js/app.js` läser `data/index.json` och alla filer som listas där, grupperar övningarna efter `area` och bygger menyn med hopfällbara områden (`<details>`, öppna från start). Klick på en övning visar titel och område. Den hårdkodade lucktexten och `onclick` är borttagna. Rättning och visning av själva övningarna kommer i nästa steg. Dark theme behålls.
- **Motivering:** Menyn ska fyllas utifrån JSON utan kodändring. Valda övningar markeras med symbol (▶) och inte bara färg.
- **Alternativ:** Områden alltid öppna utan `<details>`.
- **Status:** Gäller

## 2026-10-14 – Skrev README.md
- **Beslut:** `README.md` på svenska beskriver syfte, övningstyper, tekniska ramar, filer och hur man kör sidan lokalt, enligt `AGENTS.md`.
- **Motivering:** README.md var tom. Nya läsare behöver en kort översikt.
- **Alternativ:** Lämna filen tom; skriva på engelska.
- **Status:** Gäller
