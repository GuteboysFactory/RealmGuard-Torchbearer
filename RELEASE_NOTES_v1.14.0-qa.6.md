# 1.14.0-qa.6 – Legacy Mixed speltestfixar

Lokalt QA-paket med allt från QA.5 och följande uppföljning:

- Talents sorteras i **Talents → Level 1–10**, både i Starter Talents-compendium och världens Talent-bibliotek. Level 1 är tills vidare tom; de inskickade Talents börjar på nivå 2.
- De 65 namnen i den senaste filen används. Övriga godkända Fire-Talents behålls. Alla 124 poster finns kvar och ingen heter längre `[working title]`. Kända äldre standardnamn uppdateras i bibliotek och på karaktärer; GM:s egna namn och anpassade effekter bevaras.
- Ägare kan skapa **Custom Talents** från karaktärsblad och NPC-blad. Namn, nivå 2–10 och regeltext anges. Talenten sparas både på bladet och som ett återanvändbart world Item i rätt nivåmapp. En aktiv GM behövs för spelarnas bibliotekssparande. Även tokenbundna NPC-blad använder sin egen Actor-referens.
- Spelare som äger en konfliktdeltagare kan använda **Back**. GM-klienten återställer historiken; samtidiga eller inaktuella Back-försök får inte backa extra steg. Captain-begränsningen för kortval består.
- Den första **Start Conflict**-dialogen visas som en gemensam, skrivskyddad vy för spelarna medan GM förbereder konflikten. Namn, typ, deltagare och kaptener uppdateras löpande. Vyn stängs när GM startar eller avbryter.
- Både spelare och GM får en framträdande **Close conflict window**-knapp efter Conflict Complete.
- NPC:s Fate-, Persona- och Checks-siffror har tydlig kontrast.
- I konfliktens chattkort ligger handlingen ovanför karaktärsnamnet. Namnet får hela bredden. Chattkort och deras boxar har raka hörn.
- Versus använder sökträffar från den aktiva kartans tokens. Klick på en träff väljer motståndaren direkt. Ingen extra motståndardropdown. Dolda tokens visas inte för spelare; GM kan se sina dolda karttokens.
- Spelare får **Undo my roll** samt Undo i chattens högerklicksmeny för sina egna färdiga slag. Återställningen omfattar spårade Persona/Fate-, Trait/Wise- och Learning-ändringar, inklusive Beginner’s Luck och automatisk inlärning. Senare beroende ändringar behöver ångras först. Konfliktslag kan återtas tillsammans med efterföljande konfliktsteg efter en tydlig bekräftelse.
- Beginner’s Luck som svar från chatten registrerar nu sina framsteg på samma sätt som bladets slag.
- Chatten följer nya och växande senaste meddelanden, även efter sena layoutändringar. Kort som ryms visas helt. Kort som är högre än chattytan visas från rubriken och kan skrollas igenom.
- Nya regel-Items utan uttryckliga behörigheter och systemets Item-compendier är spelarläsbara som standard. Befintliga uttryckliga behörigheter, inklusive GM:s dolda innehåll, skrivs inte över. Mappvisningen följer Foundrys dokument-/compendium-behörigheter.
- Tokenens karaktärsnamn visas i en separat ruta ovanför högerklicksmenyn. Menyvalet heter **Open character sheet**.
- **Session Break:** gemensamt nedräkningsfönster med karaktärerna under klockan. Spelaren klickar på sin egen karaktär när hen är tillbaka; raden blir tydligt grön på alla klienter. Användarnamnet visas mindre under karaktärsnamnet. Även spelare som ansluter under rasten tas med. GM styr tiden manuellt, 10:00 som förval; befintliga toner vid start, återkomst och slut behålls.

Alla nya användarflöden är avgränsade till Legacy Mixed. Frysta baseline-filer och publicerade kanaler är orörda. Fires effekter är fortfarande Manual effect; namnbytet inför ingen ny automatisk tolkning av specialregler. De tidigare noterade regeltextskillnaderna för Needful Things och Fever Dreams har inte ändrats av namnuppdateringen.

Verifierat lokalt med 187 syntaxkontrollerade runtime-filer, 132 passerade smoke-testfiler, fyra passerade webbläsarsviter och release preflight. Foundry-dokument, nätverk och canvas använder kontrollerade fixtures. Full acceptans i er Foundry-värld återstår.

Ingen publicering, GitHub-release, tagg eller kanaluppdatering har gjorts. Installera paketet manuellt i en separat testmiljö.
