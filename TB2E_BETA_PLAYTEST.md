# TB2E – spelbar beta och bugglista

**Beslut:** Per, 2026-10-17. Publicera spelbar beta, speltesta, samla fynd och rätta dem i följande QA-versioner. Stable kräver Pers uttryckliga godkännande.

**Aktuellt paket:** v1.13.0-qa.26. **Status:** implementation och automatiska kontroller klara; Foundry-speltest väntar. Release och QA-kanal ska vara publicerade innan installation påbörjas.

**Roadmap:** M10D.2 (Nature/Creed i PC Overview), M10D.10 (koppling till befintliga motorer), M10D.11 (uttryckligt godkänd QA-aktivering), M10D.12 (spelbar grund på väg mot stable). Inga äldre godkända tester förklaras ogiltiga.

[Speltest med förväntade resultat](TEST_PROTOCOL_v1.13.0-qa.26.md)

## Vad som levereras

- Separat valbar **Torchbearer 2E – Playtest Beta** i befintlig profilhantering. Den historiska foundationprofilen förblir en låst referens. Profilbyten raderar eller konverterar inga Actors/Items.
- TB2E-skapande via befintlig Actors-ingång, M10D:s skapandeplaner och CORE M9:s transaktions-/rollbackflöde.
- Nature-text och Creed i samma Overview-panel som Belief/Goal/Instinct; numerisk Nature bevaras.
- Befintliga slag, hjälp och föremål återanvänds. TB2E:s conditions, Beginner’s Luck-abilityval, betalda Wise-effekter och standard-Recovery ansluts till spelhandlingarna.
- Adventure/Camp/Town-panel med sparad fas och tur. Grind ger GM-påminnelse; condition-tillämpningen görs med befintliga reglage.

## Angivna spelgränser

Startutrustning väljs från befintliga Items med GM. Eventuell valfri skill-omfördelning, relationernas fullständiga detaljer, keepsakes/gold pouches och klassförmågor färdigställs med GM. Magic, Conflict, Armor och Trait-effekter är manuella enligt tidigare avgränsning. Ingen automatisering av dessa förklaras färdig.

GM hanterar Grind-tillstånd, Camp/Town-events, boende, lifestyle och mat/dryck. Den integrerade Recovery-knappen använder standardtestet; särskilda boendebonusar eller specialmetoder görs som vanliga GM-anpassade slag och tillståndet justeras manuellt. GM anger Ob och relevanta modifierare.

Legacy, Strict och MG-profilerna behåller sina regeldefinitioner. Automatiska tester kontrollerar både befintliga funktioner och den nya anslutningen; de ersätter inte Pers Foundry-speltest.

## Bugglista

Inga fynd från speltest av QA26 registrerade ännu.

| ID | QA | Handling | Förväntat | Faktiskt | Påverkan | Status | Rättad/verifierad |
|---|---|---|---|---|---|---|---|

Status: NY → BEKRÄFTAD → RÄTTAD I QA → VERIFIERAD. Endast registrerade fynd och konkret berörda beroenden tas om. Den möjliga hjälmbegränsningen är enligt Per inget publiceringshinder; ett verkligt fynd kan rättas efter speltest.
