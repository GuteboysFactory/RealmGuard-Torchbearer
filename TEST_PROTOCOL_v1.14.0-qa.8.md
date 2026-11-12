# Testprotokoll 1.14.0-qa.8

Installera ZIP-innehållet i en separat testmiljös `Data/systems/realm-guard` med Foundry avstängt. Kontrollera version 1.14.0-qa.8 efter omstart. Använd Legacy Mixed, GM och minst en separat spelarklient.

1. **Start Conflict som spelare:** låt GM öppna och fylla i konfliktens första ruta. Kontrollera att spelaren tydligt kan läsa konfliktens namn, sökfältens platshållare och valda alternativ. Ändringar från GM ska fortfarande synas direkt, medan spelarens fält är låsta.
2. **Fate och Persona på PC och NPC:** höj båda resurserna från 5 till minst 8. Sänk sedan en gång: resultatet ska bli 7. Prova även GM:s Resource Admin över 5. Sänk till 0 och kontrollera att värdena inte kan bli negativa.
3. **Slag och Undo med stora saldon:** börja med exempelvis Fate 9 och Persona 8. Spendera resurser i ett vanligt slag och ångra det. De ursprungliga saldona ska återställas exakt. Gränsen för Persona-tärningar per slag ska vara densamma som tidigare.
4. **End of Session:** ge belöningar till en karaktär som redan har minst 5 Fate och Persona. Hela den godkända belöningen ska läggas till. Befintliga saldon över 5 ska bevaras även om ingen belöning ges för resursen. Samma utdelning får inte kunna göras två gånger.
5. **NPC:s Quick Skills:** ingen VS-ruta ska visas. Skillfält, OB, redigering och borttagning ska rymmas på samma rad. Klick på skillnamnet öppnar vanligt slag där Versus kan väljas; OB öppnar fortfarande NPC:ns skillbaserade OB-slag.

Prova slutligen ett vanligt slag och en kort konflikt med spelare för att kontrollera att era vanliga moduler fungerar ihop med uppdateringen. Rapportera användarroll, steg och eventuell skärmbild vid fel. Ingen publicering sker innan er QA är godkänd.
