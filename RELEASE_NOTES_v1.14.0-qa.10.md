# 1.14.0-qa.10 – Overview, enradig docka och avslutade konflikter

Lokalt QA-paket för Legacy Mixed. Alla tidigare QA.9-funktioner ingår, med följande ändringar:

- **Overview:** Nature · Belief · Goal · Instinct · Creed är klickbara rubriker ovanför ett gemensamt synligt textfält. Hover och vald rubrik är gröna. Efter Creed visas den nedtonade instruktionen “Click on the text to the left to display text”. Texten kan läsas och redigeras direkt. Byte av rubrik sparar ändrad text och vald rubrik bevaras vid omritning. Läsbehörighet ger visning utan redigering.
- **GM Dock:** snabbknappar och Tools ligger på en enda rad. Dockan beräknar sin bredd efter innehållet och knapparna radbryts inte. Tidigare sparade verktygsval behålls.
- **Conflict:** efter Save Compromise & Close Conflict for Everyone öppnar nästa klick på Conflict en ny Start Conflict-ruta. Den avslutade konflikten öppnas inte igen av knappen. Resultat och kompromiss ligger kvar i chatten. Pågående konflikt öppnas som tidigare.
- **OB-svar:** efter ett genomfört svarsslag visar originalkortets knapp karaktärens namn följt av “Responded” och slutar blinka. Statusen härleds från spelarens eget sparade slagmeddelande och visas även hos andra klienter. Avbruten slagruta behåller väntande status. Undo eller borttagning av svarsslaget återställer väntande status om inga andra svar återstår. Knappen är fortfarande åtkomlig för andra deltagare som också behöver svara.

Verifiering: 191 syntaxkontrollerade runtime-filer, 134 smoke-testfiler, fem webbläsarsviter och release preflight. Tester använder produktionskod med kontrollerade Foundry-dokument, canvas och transport. Gruppens Foundry-installation och tillägg behöver fortfarande acceptanstestas.

Endast lokal manuell QA-installation i separat testvärld. Ingen publicering, tagg eller uppdateringskanal. Andra profiler och frysta baseline-filer behåller tidigare beteende. Källmanifestet är fortsatt 1.13.4; endast paketmanifestet får QA-versionen.
