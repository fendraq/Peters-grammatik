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

## 2026-10-15 – Spelet "Slå rätt ord" (ny övningstyp `whack-words`)
- **Beslut:** Ny övningstyp `whack-words`: ett spel i stil med Whack-a-mole där ord dyker upp på slumpade platser i en spelyta och eleven slår på rätt ordklass. Det första spelet är "Slå verben" under Verb (`data/whack_verbs.json`). Regler: rätt ord +10, fel ord −10, missat rätt ord 0 (poängen får bli negativ). Spelet startar långsamt och går fortare för varje rätt träff, och orden blir svårare i tre nivåer (`level` 1–3). Spelet slutar vid 20 rätta träffar eller 10 fel (missade rätta ord och träffar på fel ord). Instruktionen står överst. Slutskärmen visar rätt, missade och felslagna ord med ordklass och förklaring. Datafält: `instruction`, `targetClass`, `classes` (`label`, `explanation`) och `words` (`text`, `class`, `level`, `note`). Koden ligger i den nya filen `js/whack-game.js`, och `js/app.js` visar spelet och stoppar det när eleven byter övning.
- **Beslut (teknik och tillgänglighet):** Spelet har en loop med `requestAnimationFrame` och pausar när fliken tappar fokus. Det fungerar med pointer events (mus och touch), och tangentbordet kan användas med siffrorna 1–4 bredvid orden. Orden placeras slumpmässigt utan överlapp och hålls inom spelytan. Tryckytorna är minst 44 px. Pekaren byts mot en liten hammare som ritas med HTML och CSS (inga externa filer). Rätt träff ger konfettipixlar, fel träff ett ✖ över ordet. Poäng visas också som text (+10, −10 och Missad), inte bara med färg. Med `prefers-reduced-motion` tas konfettin och rörelserna bort. Skärmläsare får inte varje ord uppläst. Inget sparas i webbläsaren.
- **Motivering:** Eleverna ska kunna leka och samtidigt träna på att känna igen ordklasser. Spelet ligger som data i JSON, så fler ordklasser och svårare varianter ("advanced/elite") kan läggas till utan kodändring.
- **Alternativ:** Fast rutnät i stället för slumpade platser; fast tid i stället för slutregel med träffar och fel; lugnt läge utan tid och topplista (väntar).
- **Status:** Gäller. Undantag från "inga animationer" gäller bara spelet: hammare, konfetti och ✖ som varar kortare än en sekund.

## 2026-11-04 – Ordförståelse: "Veckans ord" och "Öva ordförståelse" (ny övningstyp `word-comprehension`)
- **Beslut:** Två nya ytor för ordförståelse. **Veckans ord** visas centrerat på startsidan när sidan öppnas: ett ord per dag, valt deterministiskt utifrån dagens datum (alla elever ser samma ord samma dag, nytt ord varje dag, ingen server behövs). **Öva ordförståelse** är en egen post i vänstermenyn och slumpar ett nytt ord så snart eleven har klarat ett. Varje ord visas med strukturen: "Ord: ORDET", en exempelmening som visar betydelsen, frågan "Välj förklaringen som passar ORDET" med fyra alternativ (ett rätt, tre hämtade från tre andra ord med samma ordklass) och frågan "Välj vilken ordklass som ORDET tillhör" med fyra ordklasser. De felaktiga alternativen och deras placering slumpas fram på nytt vid varje visning, så inget kan memoreras. Ordlistan ligger i `data/ordforstaelse.json` med fälten `word`, `example`, `definition` och `pos` per ord. Koden ligger i `js/word-exercise.js`; `js/app.js` har fått menyposten och standardvyn.
- **Beslut (lagring i webbläsaren):** localStorage används enbart för att komma ihåg vilka ord eleven har klarat i "Öva ordförståelse" (nyckel `word_exercise_done_v1`, bara ordtexter, inga personuppgifter). När alla ord är klarade börjar listan om. Detta är ett dokumenterat undantag från "Inget sparas i webbläsaren" och gäller bara den här funktionen.
- **Motivering:** Eleverna samlar svåra ord i sina skrivhäften; läraren samlar upp dem och eleverna övar på dem på sidan. Slumpade felalternativ vid varje visning gör att övningen inte går att gissa rätt genom att lära sig platserna.
- **Alternativ:** Färdiga distraktorer sparade i JSON (bort valt, eleven kunde memorera dem); Veckans ord slumpat per besök i stället för per dag (alla elever skulle se olika ord).
- **Status:** Gäller

## 2026-11-04 – LEXIN som ordbas och dold läraradministration
- **Beslut:** Orddata hämtas från **Svenska ord (LEXIN), 4:e upplagan** (CC BY 4.0, Språkbanken/Språkrådet, distribuerad av Isof på `sprakresurser.isof.se/lexin/svenska/swe_swe.xml`). XML-filen (30 MB) konverteras en gång till kompakt JSON med `scripts/convert_lexicon.py` och läggs som `data/lexicon.json` (ca 6 MB) med fälten `word`, `pos`, `defs`, `ex`, `infl` och `idx` per post. `idx` innehåller ordets sökformer (LEXIN har presens som uppslagsform för verb, till exempel "krypterar", med infinitiven i indexet), så läraren kan söka på grundformen. Licensen CC BY 4.0 kräver attribution: källhänvisning finns i sidfotet och i README. Den äldre 2:a upplagan (Språkbankens LEXIN.zip) används inte, eftersom den medföljande licensen förbjuder publicering och återdistribution. Sidan laddar lexikonet först när det behövs.
- **Beslut (administration):** En dold dörr ("Admin", svart text, synlig vid hover och tangentbordsfokus) högst upp till höger leder till en enkel inloggning med användarnamn och SHA-256-hashat lösenord i `js/admin-config.json`. Inloggningen är medvetet enkel (allt i repot är publikt) och skyddar bara mot slumpning. Bakom inloggningen finns "Lägg till nytt ord": läraren skriver ordet, sidan kontrollerar om ordet redan finns i ordlistan, slår upp det i `data/lexicon.json` (exakt träff, flera betydelser med "Vilken betydelse avser du?", eller prefixförslag med "Menade du"), förifyller fälten Ord/Exempelmening/Förklaring/Ordklass (tomma fält fylls i manuellt) och sparar med **GitHub Contents API** till `main`. Det kräver en fine-grained personal access token (behörighet Contents: Read and write, endast det här repot) som läraren sparar i sin egen webbläsare. Commit-meddelande: "Add word: ORDET".
- **Motivering:** Nya ord ska kunna läggas till direkt på sidan utan server, och LEXIN är en pedagogisk ordbok gjord för sva-elever med fritt licensierade data som får ligga i ett publikt repo.
- **Alternativ:** Serverlös SQL-databas utanför GitHub (bort valt: extern tjänst, integritet, bryter repo-reglerna); manuellt commit via GitHub-webben (kvar som reservlösning om token saknas); LEXIN 2:a upplagan (bort valt på grund av licensen).
- **Status:** Gäller

## 2026-11-04 – Spelet byter namn till "Banka ordet" och får egen menypost med ordklassval
- **Beslut:** Spelet heter nu "Banka ordet" och ligger under en egen menypost, "Spel", i stället för under Verb. Alla texter i spelet är ändrade från "slå" till "banka" ("Banka rätt ord", "Rätt bankade ord", "Fel ord du bankade på"). På startskärmen väljer eleven ordklass i en rullgardinsmeny (Ordklass:) bland Pronomen, Substantiv, Verb och Adjektiv, ser ordklassens regler och startar med knappen "Starta spelet". Efter avslutat spel finns knappen "Byt ordklass" som tar tillbaka till startskärmen. Speldata ligger i `data/whack_words.json` med en lista per ordklass (`label`, `instruction`, `targetClass`, `rules`, `classes`, `words`); verborden är de tidigare från `data/whack_verbs.json`, som är borttagen. Nya listor för pronomen, substantiv och adjektiv följer verblistans mönster: vanliga ord, grundform på nivå 1 och fler böjningar på nivå 2–3.
- **Beslut (hammaren):** Spelets hammare är ritad om: hammarhuvudet är nu högst upp och pekar åt vänster (tidigare var hammaren upp och ned), och träffen sker vid hammarhuvudets vänstra sida. Hammaren roterar kring underdelen av skaftet.
- **Motivering:** Spelet ska träna alla ordklasser, inte bara verb, och eleven ska själv välja vad som ska tränas. Hammaren såg upp och ned ut tidigare.
- **Alternativ:** Ett spel per ordklass i menyn (bort valt: menyn blir full); behålla "slå"-texterna (bort valt för att undvika våldsord); behålla hammaren som den var (bort valt).
- **Status:** Gäller
