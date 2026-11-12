# 1.14.0-qa.7 – Legacy Mixed, städad docka och slagchatt

Lokalt QA-paket baserat på användarens godkända QA.6. Alla tidigare QA.6-funktioner ingår.

- **GM Dock:** fem huvudknappar — Session, Conflict, Turns, Obstacle och Break — samt Other tools och minimering. Session samlar Start/End Session. NPC-/innehållsverktyg och externa provider-menyer nås genom Other tools. Inställningar, bibliotekssynk, diagnostik och positionsåterställning nås genom Configure Settings → Realm Guard / Torchbearer → Settings, Libraries & Diagnostics. En liten valbar textrad visar aktuell spelstatus.
- **Token-HUD:** markerade genvägar för synlighet, status/Conditions, rörelse, target och combat döljs för både spelare och GM. Konfiguration, elevation, Delete och underliggande tokenfunktioner behålls.
- **Slagkort:** den markerade inre resultatrutans sidor och nederkant tas bort. Överkanten blir en avdelare hela vägen mellan ytterramens insidor. Övriga boxar och ytterramen behålls.
- **Väntande slagval:** tydligare ljuspuls och uppmärksamhetsrubrik för den som ska svara. Reducerad rörelse använder en tydlig statisk markering. Inga slag- eller resursregler ändras.
- **Custom Roll vid chatten:** öppnar direkt ett fristående slag med etikett, pool, extra tärningar och OB. Ingen PC/NPC väljs eller kopplas, och inga karaktärsresurser eller Learning används. Foundrys valda roll mode respekteras.
- **Traits:** hela listan läggs i Traits-mappen som world Items och i Starter Traits med fulla beskrivningar. Listan innehåller 121 beskrivningar men 120 unika namn; båda Stubborn-texterna bevaras i en post. Nya world Items är spelarläsbara. Befintliga egna texter, rating och uttryckliga behörigheter skrivs inte över. Upprepad synk skapar inga dubbletter.
- **NPC:s Quick Skills:** OB-knappen flyttas direkt efter VS på samma rad. Den övre OB Roll-knappen tas bort. Nedtonad text efter namnet visar “– click name for normal roll”. OB-slagens funktion ändras inte.

Ändringarna gäller Legacy Mixed. Andra profiler och frysta baseline-filer behåller tidigare beteende.

Automatiskt verifierat med 191 syntaxkontrollerade runtime-filer, 133 passerade smoke-testfiler, fem passerade webbläsarsviter och release preflight. Testerna använder riktiga produktionsmoduler med kontrollerade Foundry-dokument, socket-transport och canvas. Full acceptans i gruppens live-Foundry-miljö återstår.

Paketet är endast för manuell installation i separat testmiljö. Ingen GitHub-release, tagg eller uppdateringskanal är publicerad. Paketets framtida onlineadresser är inte tillgängliga som installationskälla.
