# Testprotokoll 1.14.0-qa.4

Använd en separat testmiljö med kopia av världen, Foundry 13.351 och profilen Realm Guard Legacy Mixed. Kontrollera versionsnumret 1.14.0-qa.4 efter installationen. Paketet är lokalt och ska installeras manuellt; ingen onlineinstallation eller uppdateringskanal har publicerats.

## Installation av det lokala paketet

1. Stäng Foundry i testmiljön.
2. Ersätt testmiljöns systemkatalog `Data/systems/realm-guard` med ZIP-innehållet. `system.json` ska ligga direkt i den katalogen, utan extra mellankatalog. Blanda inte gamla och nya systemfiler.
3. Starta Foundry och testvärlden. Kontrollera version och profil.
4. Anslut GM och minst två spelarklienter. Använd gärna samma moduler och fönsterstorlekar som under spelkvällen.

## Prioriterad acceptans

- Klicka på GM:s slag i chatten. Bekräfta att den vanliga Skill-slagrutan öppnas direkt, att byte av Skill räknar om rätt underlag och att OB, Conditions, Help och resurser fungerar. Prova även otränad Skill.
- Prova manuellt Versus mot GM:s redan gjorda slag. Automatisk motståndarroll ska endast ske när det alternativet väljs.
- Gör Skill-slag med Persona/Fate, Learning och Wise. Prova Undo i samma högerklicksmeny som Delete. Kontrollera återställda värden och att upprepad Undo inte skapar resurser. Prova ett senare beroende som ska blockera för tidig återställning.
- Starta Conflict från GM. Alla klienter ska få fönstret. Endast lagets Captain ska välja kort; framtida motståndarkort ska vara dolda även i GM-vyn.
- Fördela Disposition en gång. Spela minst två fulla kortomgångar. Ingen ny fördelning ska krävas; aktuella individuella poäng och total ska följa skada och Defend. Startfördelningen ska bestå.
- Klicka på dispositionbaren som GM och korrigera aktuella poäng. Prova Maneuver mot Defend med lika framgångar: ingen effekt, inget låsande tied-fönster.
- Prova Extra Dice och Beginner’s Luck i Conflict. Kontrollera vapenval mellan omgångar och efter Disarm.
- Prova Back och ändring av felaktigt val/slag, inklusive resurser och Learning. Avsluta konflikten och stäng fönstret. Prova en konflikt med spelare på båda sidor.
- Öppna End of Session. Alla deltagare ska se GM:s genomgång och ändringar. Kontrollera belöningar och tidigare skydd mot dubbel tilldelning.
- Använd en Wise och kontrollera att den inte går att återanvända samma session, även för Help. Starta ny session som GM och kontrollera att sessionsanvändningar återställs medan Fate, Persona, Conditions och Learning behålls.
- Starta paus på 10:00 och på en annan manuellt vald tid. Kontrollera nedräkning, egen återkomstknapp och ljud vid start, återkomst och slut på alla klienter.
- Minimera och återställ GM Dock. Minimera karaktärsblad och kontrollera namnen. Bedöm chattkortens tydlighet i den vanliga chattbredden.
- Skapa dold respektive synlig plats och Item på kartan. Sök ikoner på svenska och engelska, öppna informationen och prova journalbehörighet tillsammans med token vision.

Anteckna för varje problem: moment, förväntat resultat, faktiskt resultat, berörd klient, profil, version och eventuell läsbar feltext.

Automatiska tester har körts med kontrollerade dokument/canvas och ersätter inte detta acceptanstest. Publicering väntar på användarens test och godkännande.
