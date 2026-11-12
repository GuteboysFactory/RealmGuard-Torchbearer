# QA.8 – resultat efter QA.7-feedback

12 november 2026. Legacy Mixed, lokal utvecklingsgren `work/legacy-playtest-followup`.

De tre beställda ändringarna är implementerade och testade före paketering:

| Ändring | Genomförande och kontroll |
|---|---|
| Läsbar Start Conflict för spelare | Låsta fält har uttrycklig mörk bakgrund och ljus text, inklusive WebKit text fill. Platshållarna är också ljusa. Två separata klienter verifierar låsning, beräknade färger och direkta uppdateringar från GM. Skärmbilden är visuellt granskad. |
| Fate/Persona utan lagringstak | Gemensam beräkningsgräns används av bladens resursknappar, GM:s Resource Admin, End of Session och System Audit. Inget oändligt maxvärde sparas i dokument. PC/NPC har testats från 5 till 6 och med saldon upp till 50, minskningar över gamla taket, nollgräns och fortsatt Checks-tak. Produktionsslag spenderar från Fate 9/Persona 8 och Undo återställer exakt. Sessionsbelöningar verifierar Fate 8→10 och Persona 4→9, inklusive skydd mot dubbelutdelning. |
| Ta bort NPC:s VS-ruta | NPC-mallen döljer kontrollen i Legacy Mixed. OB placeras direkt efter skillfältet; radlayout och fungerande skillbaserat OB-slag verifieras i webbläsaren. Vanlig slagruta behåller valet Versus. |

Full kontrollkörning: **191 syntaxkontrollerade runtime-filer, 134 passerade smoke-testfiler, fem passerade webbläsarsviter samt release preflight**. Inga misslyckade kontroller. Andra profilers gamla resurstak är regressionstestade. Frysta baseline-filer har inga ändringar. Persona-gränsen för tärningar i ett enskilt slag är oförändrad.

Testerna använder produktionsmoduler, mallar och CSS med kontrollerade Foundry-dokument, socket-transport och canvas; de ersätter inte acceptans i användarens installerade Foundry med gruppens tillägg. Skärmbilder och maskinläsbara loggar finns i `output/playtest-followup` samt NPC-bilden i arbetsytans `tb2e-verification/workspace-npc-resources.png`.

QA.8 byggs som ett lokalt paket. Paketeraren kontrollerar ZIP-CRC och jämför varje packad fil byte för byte med källan, med versionsbyte endast i paketets manifest. Källmanifestet är fortsatt 1.13.4. Ingen publicering, tagg, releasekanal eller installation i spelvärlden görs.
