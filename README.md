# Peters grammatik

En övningssida i svenska för elever som har svenska som andraspråk. Sidan har lucktexter och andra korta övningar med direkt återkoppling.

## Övningstyper

1. **Lucktext** – eleven fyller i ett ord.
2. **Välj rätt** – eleven väljer mellan alternativ.
3. **Svara utifrån kontext** – eleven skriver ett svar utifrån en text eller situation.
4. **Klicka på rätt ord** (`select-words`) – eleven klickar på ord eller delar av en mening, till exempel alla verb. Meningen ligger som lista i `words` och rätta platser (första platsen är 0) i `answers`.
5. **Slå rätt ord** (`whack-words`) – ett spel där ord dyker upp på slumpade platser och eleven slår på rätt ordklass, som i "Whack-a-mole". Se nedan.
6. **Ordförståelse** (`word-comprehension`) – se nedan.

## Spelet "Slå rätt ord"

- Rätt ord ger +10 poäng, fel ord −10 poäng och ett missat rätt ord 0 poäng. Poängen kan bli negativ.
- Spelet startar långsamt och går fortare för varje rätt träff. Orden blir också svårare i tre nivåer.
- Spelet slutar vid 20 rätta träffar eller 10 fel (missade rätta ord och träffar på fel ord).
- Slutskärmen visar alla rätt slagna, missade och felslagna ord med ordklass och en kort förklaring.
- Fungerar med mus, touch och tangentbord (siffrorna 1–4). Spelet pausar när fliken eller fönstret tappar fokus.
- En speldatafil har samma fält som andra övningsfiler (`title`, `area`, `rules`) och `exercises` med en enda uppgift av typen `whack-words`:
  - `instruction` – instruktion, till exempel "Slå alla verb."
  - `targetClass` – id för ordklassen som ska slås, till exempel `verb`.
  - `classes` – ordklasser med `label` (namn) och `explanation` (kort förklaring som visas på slutskärmen).
  - `words` – ord med `text`, `class` (id från `classes`), `level` (1–3, valfritt, standard 1) och `note` (valfri, till exempel "preteritum"). Minst 5 rätta och 5 fel ord behövs. Använd bara ord som tydligt tillhör en ordklass.
- Ett nytt spel, till exempel "Slå substantiven", läggs till som en ny JSON-fil i `data/` och i `data/index.json`. Ingen kodändring behövs.

## Ordförståelse: "Veckans ord" och "Öva ordförståelse"

- **Veckans ord** visas centrerat på startsidan: ett ord per dag, samma ord för alla elever hela dagen (ordet väljs utifrån dagens datum, ingen server behövs).
- **Öva ordförståelse** ligger i vänstermenyn och ger ett nytt ord så snart eleven har klarat ett.
- Varje ord visas med en exempelmening och två frågor: "Välj förklaringen som passar ORDET" (fyra alternativ, ett rätt) och "Välj vilken ordklass som ORDET tillhör" (fyra alternativ). De felaktiga alternativen och deras plats slumpas fram på nytt vid varje visning, så inget kan memoreras.
- Ordet räknas som avklarat när eleven svarat rätt på båda frågorna. Fel svar visar rätt svar och eleven får försöka igen.
- Ordlistan ligger i `data/ordforstaelse.json`: `title`, `area`, `rules` och `words` med fälten `word` (grundform), `example` (exempelmening), `definition` (rätt förklaring) och `pos` (ordklass).
- Sidan sparar bara vilka ord eleven har klarat (i webbläsarens localStorage). Inga personuppgifter sparas.
- Alla förklaringar och exempelmeningar kommer från Svenska ord (LEXIN), Språkbanken/Språkrådet (CC BY 4.0).

### Lägga till ord (lärare)

1. Hovra över "Admin" högst upp till höger på sidan och klicka. Logga in med användarnamn och lösenord (HASHEN av lösenordet ligger i `js/admin-config.json`; byt lösenord genom att skapa en ny SHA-256-hash och ersätta värdet).
2. Skriv ordet (grundform, till exempel "kryptera") och klicka "Slå upp". Sidan kollar om ordet redan finns, hämtar data ur LEXIN och förifyller fälten. Fält som saknas i LEXIN fylls i manuellt.
3. Skapa en gång en fine-grained GitHub-token (github.com → Settings → Developer settings → Fine-grained tokens) med behörigheten **Contents: Read and write**, **endast för det här repot**, och klistra in den under "GitHub-token". Token sparas i lärarens webbläsare, aldrig i repot.
4. Klicka "Lägg till ord i ordlistan". Ordet committas direkt till `main` och syns på sidan om en liten stund.

## Så fungerar sidan

- Publiceras endast på GitHub Pages. Ingen server och ingen inloggning (förutom den enkla läraradministrationen ovan).
- Vanlig HTML, CSS och JavaScript. Inga ramverk, bibliotek eller build-steg.
- Inga cookies, inga spårare och inga externa tjänster (GitHub-API:et används bara av lärarvyn vid inloggning och när ett ord sparas).
- Övningar ligger som data i JSON-filer i `data/`. Nya övningar läggs till i JSON, utan kodändring.
- Varje övningsfil har `rules` (regler som visas som "Grammatiska regler") och högst 20 uppgifter.

## Orddata: LEXIN

`data/lexicon.json` innehåller Svenska ord (LEXIN), 4:e upplagan, som konverterats från XML med `scripts/convert_lexicon.py`. Källa: `https://sprakresurser.isof.se/lexin/svenska/swe_swe.xml` (CC BY 4.0, Språkbanken/Språkrådet/Göteborgs universitet). Varje post har `word` (uppslagsform; verb står i presens), `pos` (ordklass), `defs` (förklaringar), `ex` (exempelmeningar), `infl` (böjningsformer) och `idx` (alla sökbara ordformer, till exempel infinitiven). För att generera om filen: kör `python3 scripts/convert_lexicon.py` (laddar ner XML:en) eller `python3 scripts/convert_lexicon.py swe_swe.xml data/lexicon.json`.

## Filer

| Sökväg | Innehåll |
|---|---|
| `index.html` | Sidan |
| `css/style.css` | Utseende |
| `js/app.js` | Kod för menyn och övningarna |
| `js/word-exercise.js` | Kod för "Veckans ord" och "Öva ordförståelse" |
| `js/admin.js` | Kod för lärarinloggning och "Lägg till nytt ord" |
| `js/admin-config.json` | Användarnamn och lösenordshash för lärarinloggningen |
| `js/whack-game.js` | Kod för spelet "Slå rätt ord" |
| `data/` | Övningar i JSON-format. `_template.json` är en mall och `index.json` listar övningsfilerna. `ordforstaelse.json` är ordlistan för ordförståelse och `lexicon.json` är ordbasen från LEXIN |
| `scripts/convert_lexicon.py` | Konverterar LEXIN XML till `data/lexicon.json` |
| `text-analysis.md` | Felanalys av elevtexter som underlag för nya övningar |
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
