# Testprotokoll 1.14.0-qa.9

Använd en separat testvärld, Legacy Mixed och GM plus minst en spelarklient. Stäng Foundry före manuell installation av ZIP-innehållet i testmiljöns `Data/systems/realm-guard`. Kontrollera version 1.14.0-qa.9 efter omstart.

1. **Flytta snabbknappar:** öppna Other tools → Customize quick access. Avmarkera exempelvis Break och markera NPC Library. Spara. Break ska nu ligga i Other tools och NPC Library som snabbknapp. Båda ska fortfarande fungera.
2. **Sparade val:** ladda om GM-klienten. Samma snabbknappar ska finnas kvar. Prova Cancel utan att spara och Restore defaults. Om ni använder externa dockverktyg, flytta även ett sådant till snabbknapparna och prova dess meny och badge-tal.
3. **The Compromise:** spela klart en konflikt. Alla ska automatiskt se avslutningsfönstret med mål, vinnare och kompromissgrad i stället för kortplaneringen. Kontrollera att texten är läsbar och att målen får lika breda kolumner.
4. **Spara och stäng för alla:** GM skriver en uppgörelse och klickar Save Compromise & Close Conflict for Everyone. Konfliktfönstret ska stängas hos både GM och spelare. Uppgörelsen ska finnas i Conflict Complete-meddelandet. En omladdning ska inte automatiskt öppna den avslutade konflikten igen.
5. **Rätta ett misstag:** prova Back i avslutningsfönstret. Efter ett avslut kan GM öppna Conflict manuellt och välja Reopen Conflict. Den sparade uppgörelsen ska finnas kvar och redan spenderade resurser ska inte dras igen bara för att konflikten återöppnas.
6. **OB-knappen:** gör ett OB-slag och kontrollera att svarsknappen i chatten blinkar tydligt mellan rött och grönt. Klicka och välj skill i den vanliga slagrutan. OB ska följa med, Conditions ska räknas och hjälp ska kunna begäras. Med reducerad rörelse ska knappen ha en tydlig statisk markering.

QA.8:s resursändringar, NPC-layout och spelarens ljusa Start Conflict-fält ingår fortsatt. Ingen publicering sker före ert godkännande.
