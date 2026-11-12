# Testprotokoll 1.14.0-qa.10

Installera manuellt i separat testmiljö med Foundry avstängt. ZIP-innehållets `system.json` ska ligga direkt i `Data/systems/realm-guard`. Kontrollera version 1.14.0-qa.10 och Legacy Mixed. Anslut GM och minst en spelare.

1. **Overview:** öppna karaktärens Overview. Nature, Belief, Goal, Instinct och Creed ska behålla sitt enkla rubrikutseende. Hover och vald rubrik ska vara gröna. Kontrollera den nedtonade instruktionen efter Creed och att endast ett textfält syns.
2. **Redigera text:** välj Goal, ändra texten och byt till Creed. Gå tillbaka till Goal: ändringen ska finnas kvar. Prova alla fem rubriker, vanlig automatisk sparning och omöppning av bladet. Kontrollera att ingen annan text ändrats. En användare med enbart läsbehörighet ska kunna byta rubrik men inte ändra text.
3. **Dockan:** använd era sparade snabbknappar och kontrollera att Tools ligger på samma rad. Flytta verktyg in och ut via Customize quick access. Dockan får inte skapa en andra knapprad. Prova även er vanliga fönsterbredd och minimering.
4. **Ny konflikt efter avslut:** avsluta en konflikt via The Compromise. Kontrollera att fönstret stängs hos alla och att kompromissen finns i chatten. Klicka sedan Conflict: en ny Start Conflict-ruta ska visas. Avbryt den och klicka igen; det ska fortfarande vara en ny uppsättning. Under en pågående konflikt ska Conflict i stället öppna den befintliga konflikten.
5. **Svar avbrutet:** skapa ett OB-slag och klicka Respond som spelare. Avbryt slagrutan. Originalkortets knapp ska fortsätta blinka och visa Respond.
6. **Svar genomfört:** klicka igen och genomför skill-slaget. Originalknappen ska bli stilla och visa exempelvis “Edrik Responded”, både hos spelaren och GM. Prova att återöppna chatten/ladda om klienten: statusen ska bestå.
7. **Undo:** ångra svarsslaget. Om inget annat svar återstår ska originalkortet åter visa Respond och blinka. Resurser och Learning ska återställas som tidigare. Kontrollera även att fler deltagare kan svara på samma OB.

Ingen publicering sker före ert godkännande av QA.
