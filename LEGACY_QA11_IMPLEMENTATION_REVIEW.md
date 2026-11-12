# QA.11 – de två sista korrigeringarna före speltest

Legacy Mixed, lokal gren `work/legacy-playtest-followup`.

Textfältets höjd beräknas från aktivt textareas scrollHeight inklusive kantbredd. Grundstorleken är rows=1 utan tidigare fasta minhöjd. Varje input räknar om höjden från noll, vilket både växer och krymper korrekt. Byte av textpost räknar om omedelbart; en ResizeObserver reagerar på ändrad panelbredd eller när ett dolt blad åter visas. Föregående observer kopplas bort vid ny rendering. Dokumentvärden och sparlogik är oförändrade.

Vinnarnamn beräknas från hela vinnande sidans deltagarlista. Tillfälliga motståndares namn hämtas från konfliktens egna data; vanliga NPC/PC hämtas via aktörsresolvern. Samma namnfunktion används i The Compromise och det permanenta Conflict Complete-kortet. Namn HTML-escapas i båda vyerna. Vinnare och kompromissgrad beräknas fortfarande av befintlig konfliktlogik.

Browserkontroller verifierar enradshöjd, explicit flerradstext, naturlig radbrytning, krympning, byte mellan lång/kort post och bevarad sparning. Konfliktkontroller täcker NPC, flera motståndare, tillfälligt väder, PC på oppositionens sida och flera vinnande spelarkaraktärer, inklusive escaping och samma namn i slutkortet.

Full kontrollkörning omfattar 191 syntaxkontrollerade runtime-filer, 134 smoke-testfiler, fem webbläsarsviter och release preflight. Testmiljön använder produktionskod med kontrollerade Foundry-dokument/canvas/transport och ersätter inte gruppens speltest med egna moduler. Bilder och loggar finns i output/playtest-followup. Frysta baseline-filer och källmanifestets version 1.13.4 lämnas oförändrade. QA-paketet byggs lokalt efter tester och verifieras fil för fil samt med ZIP-CRC. Ingen publicering eller installation i livevärlden görs.
