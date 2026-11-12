# QA.10 – bygg- och testresultat

12 november 2026. Lokal gren `work/legacy-playtest-followup`. Ändringar gäller Legacy Mixed.

Overview använder de befintliga fem dokumentfälten och visar ett åt gången. Rubrikerna är textknappar med grön hover/vald markering och en diskret instruktion. Inga nya textkopior eller migreringar införs. Byte sparar ändrat föregående fält med actor.update och bevarar vald rubrik i bladets instans. Befintlig formulärsparning behålls. Läsbehörighet låser redigering. Test med verklig produktionsmall verifierar byte, sparad text, omritning, en synlig ruta och färg; skärmbild granskad. En konkurrerande äldre knappstil upptäcktes och korrigerades under testet.

GM Dock använder nowrap och innehållsbredd, med knappar som inte krymper ihop till en andra rad. Browserkontrollen jämför knapparnas faktiska vertikala positioner efter anpassning av snabbknapparna.

Konfliktknappens tidigare villkor öppnade både pågående och färdiga konflikter. Nu återanvänds endast en aktiv konflikt. Färdig konflikt går till ny rosterdialog även via den publika öppningsfunktionen. Avbruten ny uppsättning förstör inte den tidigare konfliktens sparade resultat. Browserkontroll avslutar på tre klienter och verifierar att nästa knappanrop öppnar en ny uppsättning.

Ett lyckat svarsslag markerar sitt eget spelarägda chattmeddelande med ursprungskortets ID och svarande aktör. Originalkortets presentation läser dessa meddelanden och ignorerar ångrade svar. Ingen spelare behöver redigera GM:s meddelande. Chattens create/update/delete-hooks uppdaterar status; omladdning härleder den från sparade dokument. Fler svarande namn kan visas, och knappen behåller svarsfunktionen. Cancel ändrar ingen status. Test verifierar verklig slagruta, avbrytande, genomfört slag, namnet Responded, avstängd animation och återställning efter Undo. En andra klient får en kontrollerad kopia av Foundrys replikerade dokument och verifierar samma status.

Slutkontroller: 191 runtime-filer syntaxkontrollerade, 134 smoke-testfiler, fem webbläsarsviter samt release preflight. Testmiljön använder produktionsmoduler/mallar/CSS med kontrollerade Foundry-dokument och transport, inte gruppens kompletta Foundry-server. Ingen publicering eller ändring i livevärlden görs. Frysta baseline-filer och källmanifestets basversion 1.13.4 är oförändrade. Det lokala QA-paketet verifieras med CRC och jämförelse av varje packad fil mot källan.
