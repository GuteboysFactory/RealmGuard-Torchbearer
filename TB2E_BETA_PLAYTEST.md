# TB2E — spelbar beta och speltest

**Beslut:** Per, 2026-10-17 (Europe/Stockholm).  
**Mål:** publicera en spelbar TB2E-beta via projektets befintliga QA-installationslänk, speltesta, samla fynd och rätta i följande QA-versioner fram till stable.  
**Roadmap:** M10D.10 kontrollerad integration, M10D.11 QA-aktivering, M10D.12 spelbar grund och stable. Befintlig omfattning från qa.17 gäller.  
**Status:** IMPLEMENTATION ÅTERSTÅR. Detta är ett utkast till leverans och speltest, inte ett testprotokoll för den nu publicerade qa.25. Ingen betaversion eller ny release är publicerad genom detta dokument.

## Arbetsordning

1. Kodaren kopplar ihop befintlig funktionalitet till en spelbar TB2E-grund och redovisar konkreta ändringar, varför de behövs och roadmap-tillhörighet.
2. Kodaren verifierar den ändrade koden och publicerar en sammanhängande QA-version med versionsbundet testprotokoll och tydligt stödd spelomfattning.
3. Per installerar genom den befintliga QA-kanalen och spelar igenom protokollet med förväntade resultat.
4. Fynd registreras i bugglistan nedan, med faktisk observation och förväntat beteende. Befintliga spelregler ska kontrolleras innan något föreslås som ny funktion.
5. Nästa QA rättar de registrerade felen. Omtag av tester begränsas till ändrat beteende och konkret berörda beroenden.
6. Stable publiceras efter Pers uttryckliga godkännande av speltestet.

Godkända M5-, M7- och TB2E-shadowresultat ska återanvändas inom den omfattning de faktiskt verifierat. En öppen roadmaprubrik eller avsaknad av ett separat nytt QA-protokoll är inte i sig bevis på en saknad funktion. Ny generell inventarie-QA eller repetition av Session-shadowtesterna är inte beställd.

## Obligatoriskt i nästa QA — PC Overview

**Beställt av Per 2026-10-17. Roadmap: M10D.2 Character Model + Sheet. Status: BESTÄLLT — ännu inte implementerat. Ska ingå i nästa QA-paket.**

Overview på PC-bladet ska innehålla dessa fält i ordning:

1. **Nature** — lägg till beskrivning/nyckelord.
2. **Belief** — befintligt fält.
3. **Goal** — befintligt fält.
4. **Instinct** — befintligt fält.
5. **Creed** — lägg till.

Nature och Creed ska ha samma utseende och redigering som befintliga Belief, Goal och Instinct: återanvänd panel, etiketter, textfält, typsnitt och avstånd. Befintlig Nature-statistik (current/maximum) är separat och behålls.

Kodkontroll: `templates/actor/character.hbs` har Overview-panelen med Belief/Goal/Instinct. `module/data-models.mjs` deklarerar dessa tre textfält och numerisk Nature; Creed saknas där. Befintliga Nature-beskrivningar används också av regelprofilernas Nature-dialoger. Vid implementationen ska befintlig beskrivningsdata återanvändas där den finns och eventuell lagring på karaktären hanteras utan att skriva över tidigare innehåll.

**Acceptans i nästa QA:** öppna PC → Overview; alla fem fält syns i angiven ordning och med enhetligt utseende. Skriv och spara Nature-beskrivning och Creed; stäng bladet, öppna igen och ladda om världen. Texterna finns kvar och Belief/Goal/Instinct samt numerisk Nature är bevarade.

## Konkreta leveransändringar att genomföra

Verifierat mot main `bd6107c569547a239999a981f14d80b61ef2aad7`:

| Område | Befintlig kod | Nödvändig ändring inför spelbar beta |
|---|---|---|
| Profilval | `module/profiles/torchbearer2e-foundation.mjs` anger foundationOnly=true, selectable=false och liveRuleAuthority=false. `module/m10-profile-activation.mjs` listar inte TB2E bland aktiveringsraderna. | Koppla TB2E till befintligt GM-styrt profilval för QA, med korrekt TB2E-förhandsvisning, omladdning och återgång. Detta kräver en fungerande spelkoppling före upplåsning. |
| Karaktärsskapande | Befintlig CORE M9 och TB2E:s skapandeplaner återanvänds. `module/profiles/torchbearer2e-creation.mjs` returnerar för närvarande inga grants, validerar till ett blockerande fel och kastar fel vid buildCommitSpec. | Koppla källstödda skapandeval och värden till M9:s befintliga skapande- och sparflöde. Skapa en riktig karaktär med bevarade data efter omladdning. |
| Spelhandlingar | TB2E-domänerna är registrerade som read-only/shadow; befintliga CORE-motorer och spelgränssnitt finns. | Följ de handlingar som ingår i betan från gränssnitt till resultat och sparning. Använd TB2E:s stödda regler. Den exakta ändringslistan ska fastställas ur anropsvägarna; detta dokument påstår inte att en viss motor saknas. |
| Leverans | Befintlig QA-/stable-kanal och GitHub releaseworkflow finns. | Publicera versionsbundet speltest, ändringsbeskrivning och kända begränsningar med den spelbara QA-versionen. |

Detta är bekräftade startpunkter, inte en färdig eller uttömmande kodgranskning. Att bara ändra profilens låsflagga gör inte den nuvarande skapandeprofilen spelbar.

## Vad första betan ska erbjuda

- GM kan välja TB2E i den befintliga profilhanteringen och återgå till tidigare profil.
- En TB2E-karaktär kan skapas med den befintliga skapandemotorn och användas i spel.
- Den stödda grundloopen använder rätt TB2E-regler genom befintliga funktioner och sparar avsedda ändringar.
- Regler som enligt qa.17 saknar tillräckligt källstöd hanteras uttryckligen manuellt eller visas som otillgängliga. Automatiserat Conflict, Traits, Armor och Magic förklaras inte färdiga genom detta beslut.
- Befintlig hjälp, inventariehantering och Session-motor återanvänds. Eventuell hjälmbegränsning är inte ett publiceringshinder enligt Per; ett faktiskt speltestfynd hanteras som senare buggfix.
- Tidigare profiler och kampanjdata ska bevaras.

## Speltest — utkast, kör först med publicerad spelbar beta

Kodaren fyller i versionsnummer, exakta menyval, stödd skapandeklass och berörda regler när implementationen är klar. Tabellen beskriver acceptanskrav; den intygar inte att qa.25 redan uppfyller dem. Befintliga testpersoner och föremål används där de passar.

| Steg | Handling i betan | Förväntat resultat |
|---|---|---|
| A — Installera och välj | Installera betan via QA-kanalen, öppna profilhanteringen som GM, granska TB2E och välj profilen. Ladda om. | Installerad version matchar protokollet. TB2E visas som aktiv även efter omladdning. Befintliga personer och föremål finns kvar. |
| B — Skapa och spara | Använd den befintliga skaparen med en klass som betan stöder. Granska, skapa och öppna karaktären. Ladda om och öppna igen. | En karaktär skapas. Valen och de värden som visas i granskningen finns på bladet även efter omladdning. Avbryt före slutligt skapande ska inte skapa en karaktär. |
| C — Gör ett vanligt test | Använd karaktärens vanliga testdialog med den pool och Ob som anges i det versionsbundna protokollet. | Poolen stämmer med inmatade värden och synliga modifierare. Visade tärningsutfall ger korrekt antal framgångar och rätt jämförelse mot Ob. Normal spelhandling fungerar utan konsolkommandon. |
| D — Spela med befintliga funktioner | Spela en kort situation med hjälp och befintlig utrustning när berättelsen kräver det. | Behörig hjälp når det initierade testet enligt det befintliga flödet. Utrustning och avsedda ändringar finns kvar. Avvikelser noteras som fynd; detta är ingen ny genomgång av samtliga utrustningsregler. |
| E — Grundloopen | Följ de konkreta Adventure-, Grind/Condition- och Camp/Recovery/Town-steg som anges för den publicerade betan. | Varje steg får ett uttryckligt förväntat tillstånd före och efter handlingen i det slutliga protokollet. Automatiska respektive GM-styrda moment framgår. Avsedda sparade ändringar överlever omladdning. |
| F — Återgå | Återgå till föregående profil, ladda om och kontrollera en befintlig person. | Föregående profil blir aktiv och tidigare data bevaras. Ingen oavsiktlig konvertering eller radering sker. |

Vid slumpmässiga tärningsslag anges förväntad pool, modifierare och hur resultatet räknas. Ett visst slumpresultat krävs inte för PASS.

## Bugglista

**Registrerade fynd i den spelbara betan:** inga ännu — betan är inte publicerad eller speltestad.

| ID | QA-version | Steg / hur felet upprepas | Förväntat | Faktiskt | Påverkan | Status | Rättad i / verifiering |
|---|---|---|---|---|---|---|---|

Status: NY → BEKRÄFTAD → RÄTTAD I QA → VERIFIERAD. Ett fynd kan också markeras PLANERAD SENARE efter Pers beslut. En dokumentationslucka blir inte automatiskt en spelbugg.

## Stable

Stable kräver en fungerande stödd grundloop, bevarade data och Pers uttryckliga speltestgodkännande. Kända begränsningar och eventuella kvarvarande mindre fynd redovisas vid beslutet. Ett godkänt shadowtest ska aldrig beskrivas som bevis på en genomförd liveändring.
