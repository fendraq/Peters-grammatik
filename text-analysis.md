# Textunderlag: felanalys av elevtexter

Underlag för att skapa övningar. Texterna är debattartiklar från elever i åk 7 och åk 8 om mobiler i skolan, läxor och betyg.

**Integritet:** Filen innehåller inga elevtexter i original. Alla exempel är omskrivna så att de inte går att koppla till en enskild elev. Lägg aldrig in elevtexter i original i repot (det är publikt).

**Steg** hänvisar till processbarhetsteorin (Pienemann; för svenska Håkansson, Pienemann & Sayehli 2002). Stegen är preliminära och ska kontrolleras mot kurslitteraturen, särskilt steg 4 och 5 (markerade med *).

## Felkategorier

| Område | Typiskt fel → rätt | Steg | Hur vanligt | Övning |
|---|---|---|---|---|
| Pronomen: de / dem / det | "Läraren hjälper de" → dem. "Dem vill gå hem" → De. "De finns många" → Det finns många. "Maten serveras de" → Det serveras. | 2 | Mycket vanligt | Klar: `pronouns_de_dem_det.json` |
| Pronomen: sin / sitt / sina eller deras | "Hon lämnar in sitt mobil" → sin mobil. "Han oroar sig för sin barns säkerhet" → sitt barns. "Eleven känner dig utanför" → sig. "Eleverna tar deras telefoner" → sina telefoner. | 2–3 | Vanligt | Klar: `pronouns_reflexive_possessive.json` |
| Substantiv: en / ett | "ett plats" → en plats. "en verktyg" → ett verktyg. "ett samhället" → ett samhälle. | 2–3 | Vanligt | Klar: `nouns_en_ett.json` |
| Substantiv: bestämd form och plural | "den stöden" → det stödet. "bra betygen" → bra betyg. "problemer" → problem. | 2–3 | Vanligt | Klar: `nouns_definite_plural.json` |
| Adjektiv i frasen | "dålig betyg" → dåligt betyg. "digitalt teknik" → digital teknik. "viktiga information" → viktig information. "full fokus" → fullt fokus. | 3 | Vanligt | Klar: `adjectives_in_phrase.json` |
| Adjektiv efter verbet | "Eleverna känner sig kränkt" → kränkta. "De blir deprimerande" → deprimerade. | 4* | Vanligt | Klar: `adjectives_predicative.json` |
| Verb: infinitiv efter modalverb | "måste tänke" → tänka. "kunde använde" → använda. "kan blir" → bli. "Sluta förbjud" → förbjuda. | 2 | Vanligt | Klar: `verbs_infinitive.json` |
| Verb: tempus | "händet" → hände. "tåg" → tog. "har sakt" → sagt. "skulle haft skett" → skulle ha hänt. | 2 | Vanligt | Klar: `verbs_tense.json` |
| Ordföljd: inte och alltid i bisats | "när det finns inte någon" → när det inte finns någon. "eftersom de har alltid kontakt" → de alltid har. "vad är klockan" (indirekt fråga) → vad klockan är. | 5* | Mycket vanligt | Klar: `word_order_subordinate_clause.json` |
| Ordföljd: omkastning efter inledande bisats | "När man är ensam man har inget att göra" → har man. "Om man behöver pengar man kan ringa" → kan man. | 4* | Enstaka. Behöver fler egna exempelmeningar. | Klar: `word_order_inversion.json` (med egna exempelmeningar) |
| Skrivregler: skiljetecken och mellanslag | Saknat mellanslag efter komma och punkt. "?." och "!!!". Liten bokstav efter punkt. "t.ex" utan sista punkt. | – | Vanligt | Klar: `writing_rules_punctuation.json` |
| Skrivregler: ihop- och särskrivning | "jätte stort" → jättestort. "efter som" → eftersom. "tillbacka" → tillbaka. "utan för" → utanför. | – | Vanligt | Klar: `writing_rules_compound_words.json` |
| Skrivregler: vanliga stavfel | "specielt" → speciellt. "Desutom" → Dessutom. "betälla" → beställa. "försänt" → försenat. "vilktigt" → viktigt. | – | Vanligt | Klar: `writing_rules_spelling.json` |
| Skrivregler: skriftspråk eller talspråk | "asså", "chilla", "suger", "grej", "nåt", "va", "o" i stället för "och". | – | Enstaka | Kommande |
| Skrivregler: bindeord i debattext | "För de första" → För det första. "Tillsist" → Till sist. "eftersom att" → eftersom. "på grund av det kan" → på grund av att. | – | Vanligt | Klar: `writing_rules_connectors.json` |

## Områden

Pronomen (ersätter Possessiva pronomen), Substantiv, Adjektiv, Verb, Ordföljd, Skrivregler.

## Anteckningar

- Varje övning har max 20 uppgifter. Finns det mer material delar vi upp övningen i del 1 och del 2.
- Varje övningsfil har ett fält `rules` med grundläggande regler. Reglerna visas som "Grammatiska regler" högst upp i övningen.
- Typen "Svara utifrån kontext" rättas bara mot svar som anges i förväg. Den passar bara korta svar. Den används också för "Skriv meningen rätt": den felaktiga meningen är texten och eleven skriver hela meningen rätt. Svar med och utan sista punkt godkänns.
- Än så länge saknas bara övningen om skriftspråk och talspråk (enstaka förekomster i texterna).
