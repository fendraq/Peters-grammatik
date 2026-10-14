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
- **Status:** Delvis ersatt av Sidomenyn: stängda områden och grå underlista

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

## 2026-10-14 – Visning och rättning av övningar
- **Beslut:** Alla uppgifter i en övning visas som numrerad lista under "Grammatiska regler". Lucktext och "Svara utifrån kontext" har textfält med label, "Välj rätt" har radioknappar. Knappen "Rätta" rättar alla uppgifter. Rätt visar "✅ Rätt!". Fel visar "❌ Inte riktigt. Försök igen. Rätt svar: ...". Tomt svar visar en påminnelse. En sammanfattning ("Du fick X av Y rätt") visas med en uppmuntrande text. "Börja om" tömmer svar och feedback. Textsvar jämförs utan hänsyn till versaler och extra mellanslag (även mitt i), och flera godkända svar stöds. Svar i "Välj rätt" jämförs exakt, eftersom alternativen kan skilja sig bara på versaler. Inget sparas.
- **Motivering:** Eleverna ska få direkt, tydlig och vänlig återkoppling utan att något lagras eller skickas.
- **Alternativ:** Rätta en uppgift i taget; spara poäng i webbläsaren.
- **Status:** Gäller

## 2026-10-14 – Tio nya övningar och "Skriv meningen rätt"
- **Beslut:** Tio nya övningsfiler skapades från `text-analysis.md` (pronomen, substantiv, adjektiv, verb, ordföljd och skrivregler), med blandade uppgiftstyper: lucktext, välj rätt och "Skriv meningen rätt". "Skriv meningen rätt" använder den befintliga typen `context-answer`: den felaktiga meningen är `context`, frågan är "Skriv meningen rätt." och `answers` innehåller de rätta meningarna, med och utan sista punkt (och med och utan komma efter inledande bisats). Ingen ny övningstyp och ingen ändrad datastruktur. Övningen om skriftspråk och talspråk väntar. Svarsfält för kontextuppgifter är bredare i `css/style.css`. `data/test_ovning.json` har tagits bort av användaren.
- **Motivering:** Eleverna ska träna på att skriva hela meningar rätt, inte bara välja. Den befintliga typen räcker, så inget i koden behöver ändras.
- **Alternativ:** Ny övningstyp för att rätta meningar; fri text som rättas av läraren.
- **Status:** Gäller

## 2026-10-14 – Ny övningstyp "select-words" och övningen "Hitta verben i meningen"
- **Beslut:** Ny övningstyp `select-words`: eleven klickar på ord i en mening. Fält: `question`, `text` (meningen) och `answers` (lista med de ord som ska markeras). Jämförelsen ignorerar versaler och skiljetecken. Alla ord i meningen som matchar ett svar ska vara markerade, och inga andra. Orden är knappar med `aria-pressed`, så de fungerar med tangentbord och på mobil. Markerade ord visas med ✓, understrykning och ram, inte bara med färg. Rättningen använder samma "Rätta" och "Börja om" som övriga typer. Första övningen är `data/verbs_find_verbs.json` (område Verb, 20 uppgifter) och den är tillagd i `data/index.json`. Mallen `data/_template.json` har ett exempel. Ändrade filer: `js/app.js`, `css/style.css`. Inget sparas i webbläsaren. Typen kan även användas för andra ordklasser och satsdelar.
- **Motivering:** Eleverna ska träna på att känna igen ordklasser. Spelidén blev en övningstyp, och lagring i webbläsaren väntar.
- **Alternativ:** Markera ord med hakparenteser i texten (bort valt, eftersom `answers` redan finns i alla typer); ett spel med tid och poäng.
- **Status:** Ersatt av "select-words" med platser och färgfeedback
