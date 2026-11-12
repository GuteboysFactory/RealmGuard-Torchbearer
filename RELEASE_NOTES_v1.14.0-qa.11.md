# 1.14.0-qa.11 – kompakt textfält och namngivna vinnare

Lokal QA för Legacy Mixed. Alla tidigare QA.10-funktioner ingår.

- **Overview:** textfältet under Nature · Belief · Goal · Instinct · Creed har en rad som grundhöjd. Det växer när texten radbryts eller nya rader skrivs och krymper när text tas bort. Höjden räknas om även vid byte av rubrik och ändrad tillgänglig bredd. Tidigare texter och sparning behålls.
- **Conflict:** The Compromise visar den vinnande sidans faktiska deltagarnamn. Det gäller NPC, flera deltagare, annan PC och tillfälliga motståndare som namngivet väder eller egna skapelser. Samma namn visas som vinnare i Conflict Complete-kortet i chatten. Generiska sidnamn används endast om deltagarnamn saknas.

Verifierat med syntaxkontroller av 191 runtime-filer, 134 smoke-testfiler, fem webbläsarsviter och release preflight. Riktiga produktionsmallar, CSS och moduler körs med kontrollerade Foundry-dokument och transport. Test täcker textexpansion, krympning, byte mellan kort/lång text samt namn för NPC, flera motståndare, väder, PC-opposition och spelargruppen.

Paketet är för manuell installation i separat testvärld. Gruppens installation behöver speltestas. Ingen publicering, tagg, kanaluppdatering eller ändring i livevärlden görs. Källmanifestet behåller basversion 1.13.4; paketmanifestet har QA-versionen.
