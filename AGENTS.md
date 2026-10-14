# AGENTS.md

Instruktioner för AI-agenter som arbetar i det här repot. Läs hela filen innan du gör något.

## Syfte

Peters grammatik är en övningssida för elever som har svenska som andraspråk.

- Sidan ska vara lätt att navigera.
- Fokus ligger på lucktexter och andra övningar.
- Övningstyper som är tillåtna:
  1. **Lucktext** – eleven fyller i ett ord.
  2. **Välj rätt** – eleven väljer mellan alternativ.
  3. **Svara utifrån kontext** – eleven skriver ett svar utifrån en given text eller situation.
- Nya övningstyper kräver bekräftelse (se Arbetsflöde).

## Arbetsflöde (viktigast)

**Inget får ändras innan användaren har bekräftat det.**

1. Föreslå ändringen kort: vad, varför och vilka filer som berörs.
2. Vänta på uttryckligt ja.
3. Genomför ändringen.
4. Dokumentera beslutet i `decisions.md`.

### Kräver alltid bekräftelse

- Ramverk, bibliotek, verktyg eller build-steg (även dev-beroenden).
- Ny funktionalitet eller ny övningstyp.
- Ändrad datastruktur i JSON-filerna.
- Ändrad filstruktur eller namngivning.
- Lagring i webbläsaren (t.ex. `localStorage`).
- Externa resurser (CDN, typsnitt, bilder, tjänster).

### Kräver inte bekräftelse

- Buggfixar som inte ändrar beteendet.
- Rättelse av stavfel i UI-texter.
- Nya övningar i redan godkänt JSON-format.

Är du osäker: fråga.

## Tekniska ramar

- Publiceras **endast** på GitHub Pages. Ingen backend, ingen server-side-kod, ingen inloggning.
- Vanlig HTML, CSS och JavaScript. Inga ramverk, inga bibliotek och inget build-steg som standard.
- Alla sökvägar ska vara **relativa** (sidan ligger under `/Peters-grammatik/`).
- Inga externa beroenden (CDN, typsnitt, spårare).
- `fetch` av JSON fungerar inte via `file://`. Testa lokalt med en enkel server, t.ex. `python3 -m http.server`.

## Självunderhållande

- Övningar ligger som data i JSON-filer i `data/`.
- Nya övningar läggs till genom att redigera eller lägga till JSON, utan kodändring.
- Övningar ska inte hårdkodas i HTML eller JavaScript.

## Kodprinciper

- Tydlig och enkel kod. Inga "flashiga" funktioner: inga animationer, inga effekter, ingen onödig komplexitet.
- Små funktioner med ett ansvar. Ingen duplicering.
- Använd `addEventListener`, inte inline `onclick`.
- Undvik globala variabler.
- Kommentera bara det som behöver förklaras.
- Gör små, avgränsade ändringar. Inga stora omskrivningar utan godkännande.

## Språk

- **UI-text, `decisions.md` och kommunikation med användaren:** svenska.
- **Kod, filnamn, identifierare och kommentarer:** engelska.
- Håll det konsekvent. Äldre kod med svenska namn byts bara om användaren godkänner det.

## Målgrupp och språknivå

- Gränssnittstext och instruktioner ska vara på enkel svenska (ca A2–B1).
- Undvik svåra grammatiska termer. Om de behövs, förklara dem kort.
- Korta meningar. Tydliga instruktioner för varje övning.

## Tillgänglighet

- Varje inputfält har en `label`.
- Allt ska kunna användas med tangentbord.
- God kontrast och stor, läsbar text.
- Feedback får inte bara visas med färg. Använd även text eller symbol.
- Sidan ska fungera bra på mobil.
- Använd `lang="sv"` och semantisk HTML.

## Feedback och rättning

- Visa tydligt om svaret är rätt eller fel.
- Visa rätt svar när eleven svarat fel, och låt eleven försöka igen.
- Använd en vänlig och uppmuntrande ton.
- Vid jämförelse av svar: ignorera versaler och extra mellanslag i början och slutet.
- Hantera å, ä och ö korrekt.
- En övning kan ha flera godkända svar.

## Integritet

- Eleverna kan vara minderåriga. Samla inte in, lagra eller skicka personuppgifter.
- Inga cookies, inga spårare, inga externa tjänster.

## Kvalitetskontroll före varje ändring är klar

- JSON-filerna är giltiga.
- Inga fel i webbläsarens konsol.
- Alla övningar laddas och går att rätta.
- Sidan fungerar på mobilbredd.
- Alla länkar och sökvägar är relativa och fungerar.

## decisions.md

Skriv varje bekräftat beslut i `decisions.md`, på svenska, med detta format:

```
## ÅÅÅÅ-MM-DD – Kort rubrik
- **Beslut:** vad som bestämdes
- **Motivering:** varför
- **Alternativ:** vad som valdes bort
- **Status:** Gäller / Ersatt av <rubrik>
```

Ändra aldrig gamla beslut. Lägg till ett nytt beslut som ersätter det gamla.

## Git

- Tydliga, korta commit-meddelanden.
- En logisk ändring per commit.
