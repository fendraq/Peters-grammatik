# Peters grammatik

En övningssida i svenska för elever som har svenska som andraspråk. Sidan har lucktexter och andra korta övningar med direkt återkoppling.

## Övningstyper

1. **Lucktext** – eleven fyller i ett ord.
2. **Välj rätt** – eleven väljer mellan alternativ.
3. **Svara utifrån kontext** – eleven skriver ett svar utifrån en text eller situation.
4. **Klicka på rätt ord** (`select-words`) – eleven klickar på ord eller delar av en mening, till exempel alla verb. Meningen ligger som lista i `words` och rätta platser (första platsen är 0) i `answers`.
5. **Slå rätt ord** (`whack-words`) – ett spel där ord dyker upp på slumpade platser och eleven slår på rätt ordklass, som i "Whack-a-mole". Se nedan.

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

## Så fungerar sidan

- Publiceras endast på GitHub Pages. Ingen server och ingen inloggning.
- Vanlig HTML, CSS och JavaScript. Inga ramverk, bibliotek eller build-steg.
- Inga cookies, inga spårare och inga externa tjänster.
- Övningar ligger som data i JSON-filer i `data/`. Nya övningar läggs till i JSON, utan kodändring.
- Varje övningsfil har `rules` (regler som visas som "Grammatiska regler") och högst 20 uppgifter.

## Filer

| Sökväg | Innehåll |
|---|---|
| `index.html` | Sidan |
| `css/style.css` | Utseende |
| `js/app.js` | Kod för övningarna |
| `js/whack-game.js` | Kod för spelet "Slå rätt ord" |
| `data/` | Övningar i JSON-format. `_template.json` är en mall och `index.json` listar övningsfilerna |
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
