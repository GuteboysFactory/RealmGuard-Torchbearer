# Testprotokoll 1.14.0-qa.5

Använd separat testmiljö med kopia av världen, Foundry 13.351 och Realm Guard Legacy Mixed. Stäng Foundry och ersätt testmiljöns `Data/systems/realm-guard` med ZIP-innehållet. `system.json` ska ligga direkt i katalogen. Starta om och kontrollera version 1.14.0-qa.5. Anslut GM och minst två spelare.

## Nya kontroller

1. Klicka OB vid en NPC:s Quick Skill. Den vanliga slagrutan ska öppnas. Slå och svara som spelare från chattkortet: framgångarna ska bli OB. Prova också OB Roll i NPC-verktygsraden och byt Skill.
2. Dra ett Item av typen Gear från mappen Skills till ett PC-blad utanför ett särskilt fält. Det ska bli Skill. Dra samma slags Item till NPC:s Quick Skills och ange rating.
3. Dra Sword/Svärd från Weapons/Vapen. Det ska bli Gear med vapenkategori. Prova en undermapp under Weapons, samt svenska Färdigheter. Kontrollera att källföremålet inte ändras.
4. Dra ett Item från Weapons uttryckligen till Quick Skills: målfältet ska vinna och skapa Skill. Dra Skill till Gear: det ska bli Gear. Befintlig tränad PC-Skill ska behålla rating och Learning. NPC:s befintliga Skill får uppdaterad rating efter GM-val, utan extra dubblett.
5. Prova drop till utrustningsplats/behållare, inklusive ogiltig kapacitet och tvåhandsplacering. Ett nekad placering ska förklaras och inte lämna ett extra importföremål.
6. Öppna Talent-val på nivå 2 och 3. Prova namn-/regelsökning, tomt sökresultat och nivåfilter. Ingen Talent över karaktärens nivå ska gå att välja. Ett gjort val ska låsa just den nivån. Kontrollera äldre karaktär med tidigare Talents.
7. Kontrollera Gifted: den inskickade Lore Master-anpassningen ska finnas kvar. Läs Hauberk och Dream Vision: slutet/faktorerna ska finnas med. Kontrollera att [working title] syns för omatchade namn.
8. Kontrollera att Talents använder Manual effect och inte ger +1D till alla slag. Once/session-effekt ska låsas efter användning och återställas med Start Session. Övriga begränsningar och specialeffekter hanteras manuellt enligt texten.
9. Öppna Starter Talents. Alla 124 nya poster ska finnas i Legacy-världen. Synka igen: inga dubbletter eller överskrivna GM-ändringar. Tidigare starterposter får finnas kvar.

## Regression från QA.4

Genomför även hela den prioriterade acceptansen i `TEST_PROTOCOL_v1.14.0-qa.4.md`: chatt/svar/Undo, Conflict mellan spelare med Captain-val och låst Disposition, automatisk skada/Defend, Back/stängning, extra tärningar och Beginner’s Luck, End of Session, Wise-lås/Start Session, pausruta/ljud, dockminimering samt kartmarkörers behörighet.

Anteckna moment, förväntat/faktiskt resultat, klient, profil, version och läsbar feltext. Publicering väntar på användarens test och godkännande.
