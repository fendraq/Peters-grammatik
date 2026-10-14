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

## 2026-10-14 – Områden utifrån processbarhetsteorin
- **Beslut:** Övningsområden (`area`) är grammatiska ämnen, och steget i processbarhetsteorin anges i övningens titel. Preliminära områden: Substantiv (plural, bestämd form, en/ett), Verb (presens, preteritum, supinum, infinitiv), Adjektiv (kongruens i frasen och predikativt), Possessiva pronomen, Ordföljd (grundordföljd, adverb först, omkastning, bisats, negation). Listan är ett utkast och ska kontrolleras mot kurslitteraturen.
- **Motivering:** Ämnen är enklast för eleverna att navigera. Stegen följer teorin och hjälper läraren att välja övningar.
- **Alternativ:** Ett område per steg i teorin.
- **Status:** Ersatt av Nya områden och regler i varje övning

## 2026-10-14 – Nya områden och regler i varje övning
- **Beslut:** Områden är Pronomen (ersätter Possessiva pronomen), Substantiv, Adjektiv, Verb, Ordföljd och Skrivregler. Varje övningsfil har ett nytt fält `rules` (lista med korta regler på enkel svenska). Reglerna visas högst upp i övningen under den utfällbara rubriken "Grammatiska regler", stängd från början. Varje övning har max 20 uppgifter. Fyra första övningar skapades: `pronouns_de_dem_det.json`, `nouns_en_ett.json`, `word_order_subordinate_clause.json` och `writing_rules_punctuation.json`.
- **Motivering:** Eleverna ska kunna läsa grundreglerna innan de övar. De vanligaste felen i elevtexterna ger underlag för vad som ska övas först.
- **Alternativ:** Regler på en separat sida; ingen regelruta.
- **Status:** Gäller

## 2026-10-14 – Textunderlag utan elevtexter i original
- **Beslut:** `text-analysis.md` samlar felanalysen med korta, omskrivna exempel. Elevtexterna i original sparas inte i repot.
- **Motivering:** Eleverna är minderåriga och repot är publikt. Nästa omgång övningar utgår från filen.
- **Alternativ:** Spara elevtexterna i original (publikt eller lokalt via .gitignore).
- **Status:** Gäller

## 2026-10-14 – Skrev README.md
- **Beslut:** `README.md` på svenska beskriver syfte, övningstyper, tekniska ramar, filer och hur man kör sidan lokalt, enligt `AGENTS.md`.
- **Motivering:** README.md var tom. Nya läsare behöver en kort översikt.
- **Alternativ:** Lämna filen tom; skriva på engelska.
- **Status:** Gäller
