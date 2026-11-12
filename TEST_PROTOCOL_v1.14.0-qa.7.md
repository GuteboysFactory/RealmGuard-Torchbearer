# Testprotokoll 1.14.0-qa.7

Använd separat kopia av världen, Foundry 13.351 och Realm Guard Legacy Mixed. Stäng Foundry, ersätt testmiljöns `Data/systems/realm-guard` med ZIP-innehållet och starta om. `system.json` ska ligga direkt i katalogen. Kontrollera version 1.14.0-qa.7. Anslut GM och minst en spelare.

## Ny acceptans efter QA.6

1. **GM Dock:** kontrollera Session, Conflict, Turns, Obstacle och Break samt Other tools. Prova Start/End Session-menyn, öppning av konflikt, turhantering, publicering av OB och Session Break. Prova minimering och att dockan ryms vid normal fönsterbredd.
2. **Other tools och Settings:** kontrollera NPC Library, Content Studio och GM Control. Externa integrationer ska kunna öppnas genom Other tools och behålla sina badge-tal. Öppna Configure Settings → Realm Guard / Torchbearer → Settings, Libraries & Diagnostics. Prova bibliotekssynk, diagnostik, av/på för spelstatus och återställning av dockans placering. Inställningarna ska vara GM-begränsade.
3. **Token-HUD:** öppna Foundrys tokenkontroller via Shift-högerklick eller menyn Foundry token controls. Kontrollera från både GM och spelare att markerade genvägar för synlighet, status/Conditions, rörelse, target och combat är dolda. Config, elevation och Delete ska finnas kvar där användarens behörighet medger dem. Prova tillsammans med era vanliga tokenmoduler. Underliggande funktioner ska fortfarande fungera från övriga ordinarie vägar.
4. **Slagkortets ram:** gör ett vanligt Skill-slag och ett Ability-slag. Den yttre rollramen ska vara kvar. Den markerade inre ramens sidor och nederkant ska vara borta; den övre avdelaren ska gå hela vägen till ytterramens insidor. Pool-, tärnings- och resultatboxarna ska vara kvar. Bedöm i vanlig smal chattbredd.
5. **Väntande slagval:** få fram en fråga om Wise/Persona, Trait eller Fate. Den som ska svara ska tydligt se ljuspulsen och rubriken. Andra klienter ska inte få samma uppmärksamhetspuls. Prova både val och avböjande: slaget ska fortsätta och markeringen försvinna. Med reducerad rörelse ska en tydlig statisk markering visas.
6. **Fristående Custom Roll:** klicka tärningsknappen vid chatten utan att ha någon token vald eller karaktär tilldelad. Slagrutan ska öppnas direkt utan karaktärssökning. Ange etikett, pool, extra tärningar och OB och slå. Inget blad ska påverkas. Prova Cancel, dubbelklick, 0D och privata/blinda slag enligt Foundrys roll mode.
7. **Traits:** kontrollera de 120 unika referenserna i Starter Traits samt world Items i Traits-mappen. Läs exempelvis Adventurous, Crushing Strength, Wizard’s Sight och Stubborn. Stubborn ska behålla båda beskrivningarna. Nya world Items ska kunna läsas av spelarna. Synka/starta om: inga nya dubbletter och inga överskrivna egna GM-texter, rating eller dolda behörigheter. Äldre extra Traits får finnas kvar.
8. **NPC:s Quick Skills:** kontrollera att den övre OB Roll-knappen är borta. OB ska ligga direkt efter VS på varje Skill-rad utan extrarad. Texten “– click name for normal roll” ska visas nedtonat. Klicka skillnamnet och gör ett normalt slag, därefter OB och ett OB-slag: tidigare funktion ska bestå. Prova ett långt skillnamn.

## Kort regression

- Conflict: Captain-kortval, fast Disposition, Defend, Back och stängning efter Conflict Complete.
- Spelarens Undo: Persona/Fate, Trait/Wise, Pass/Fail och Beginner’s Luck återställs.
- Chattens Versus-sökning och svar från GM:s slag.
- Session Break: gemensam klocka, klick på egen karaktär och grön rad hos alla.
- Talents: godkända namn, nivåmappar och Custom Talent från PC/NPC.

Rapportera moment, förväntat och faktiskt resultat, klient, profil, version samt läsbar feltext. Publicering beslutas först efter användarens QA.
