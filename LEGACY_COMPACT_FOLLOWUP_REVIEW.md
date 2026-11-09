# Legacy Mixed – kompaktare gränssnitt, uppföljningsrapport

Bas: stable 1.13.3 (`253a9a2`, publiceringsmetadata inkluderade).
Arbetsgren: `work/legacy-compact-followup`.
Datum: 2026-11-09. Byggt för granskning; ingen ny version eller release publicerad.

## Genomfört

1. Tränade Skills visar Pass/Fail i namnraden före värdet. Den separata undre progressionsraden är borta. Klick öppnar samma redigering som tidigare; det finns fortfarande Spara/Avbryt och skydd mot ogiltiga/föråldrade värden.
2. Otränade Skills visar Learning X/Y i namnraden. Will/Health-basen finns i rubriken för respektive grupp samt som förklaring på Learning. Roll-texten är ljus även för otränade Skills och gruppförklaringarna har läsbar kontrast.
3. Grundegenskapernas Pass/Fail ligger på samma rad som namn och värde. Nature visar namn, aktuellt/max, Pass/Fail och Tax i den ordningen. Övriga visar namn, värde och Pass/Fail.
4. Headerpilen är ett överlägg vid nederdelen av Health-rutan och tar inte en egen rad. Normalt har den svart pil och transparent bakgrund; hover/tangentbordsfokus ger det gröna utseendet. Hopfälld är den fortfarande åtkomlig ovanför huvudmenyn. Positionen uppdateras när överdelen ändrar storlek.
5. Det vanliga slagfönstret är 640 px brett som utgångspunkt och anpassas till mindre skärmar. Fälten ligger tätare, Ob/Modifier/Extra Dice delar rad och Trait/Trait use/Wise delar rad. Förklarande texter ligger bakom klickbara frågetecken. Befintliga frågetecken har kvar hoverförklaringar och är fokuserbara. Help visar aktuell status och accepterade bidrag; tom Conditions tar bara en rad. Learning är kompakt. Kontroller, väntande status och regelbegränsningar är kvar. Samma layout används när det vanliga slagfönstret öppnas från Conflict.
6. Head, Neck, Torso, Belt och Cloak har individuella ankarpunkter för alla åtta siluetter. Head ligger högre på huvudet, Neck vid halsen, Torso högre i bröstkorgen, Belt vid midjan och Cloak på axelspetsen på bildens högra sida. Punkterna har granskats visuellt per figur. Siluettbilder, föremål, utrustningsregler och övriga punkter är oförändrade.
7. GM-menyn använder nu TokenHUD.close i stället för det utfasade clear-anropet. Menyns alternativ och arbetssätt behålls. Testet stoppar uttryckligen om det gamla clear skulle anropas.

Chattvarningen om den äldre chatthooken ingår inte. Användaren bekräftade att den hör till en ny funktion i Tome; det projektet och dess kod har lämnats utanför.

## Testresultat

- 174 runtime-filer syntaxkontrollerade och 127 smoke-testfiler passerade.
- Det utökade Chromium-testet renderar den riktiga character.hbs-mallen med alla systemstilmallar. Det kontrollerar kompakt egenskapsrad, Pass/Fail i Skill-raden, Learning i otränad namnraden, ljus Roll-text, pilens transparens och hoverfärg, fortsatt redigering efter flytt, bibehållen skrollposition, 640 px slagfönster samt utfällbara förklaringar.
- Slagfönstret testas med ett riktigt produktionsflöde för Versus, och tidigare utrustningsbyten, tvåhandsblockering och synliga motståndare kontrolleras igen. Alla åtta figurer laddas och får separata granskningsbilder.
- GM-menyn testas med close-räknare och ett clear-anrop som skulle kasta fel. GM/profilspärrar, Escape och menyavslut fungerar i testmiljön.
- Det befintliga Conflict/End Session-webbläsartestet passerade, inklusive manuella Skills, gemensam Disposition, Back, kortsekretess, chattval och de andra profilernas gränssnitt.
- Release preflight och diff-kontroll passerade. Versionsnummer, release/READY och kanaler är oförändrade. Bevarade profilsnapshots, regelprofiler och den accepterade startup-optimeringen är inte ändrade.

GitHub-körning [42695306093](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/42695306093) passerade samtliga steg på kodcommit `8fca17c76603b0ec1a68cfbc451c167b1582dfb3`: releasekontrakt, syntax/regressioner, Conflict/End Session-testet, det utökade workspace-testet och uppladdning av granskningsbilder. Efterföljande rapportuppdatering ändrar endast dokumentation.

Testerna använder produktionskod i riktig Chromium men kontrollerade Foundry-dokument, dialogvärdar och canvasobjekt. Inga användarvärldar eller installerade filer har ändrats. Livekontroll på full Foundry-server med separata spelarklienter återstår. Ny patch skapas/publiceras först efter användarens granskning.

## Nästa kontroll i testvärlden

- Läsbarhet och klickytor i er vanliga fönsterstorlek, särskilt långa Skill-namn.
- Att pilen är enkel att hitta och nå både med och utan header.
- Vanliga slag, Beginner’s Luck och Conflict-slag med Help, resurser och aktuella Conditions.
- Att utrustningspunkterna sitter där ni vill på samtliga använda figurer.
- Att högerklicksmenyn öppnas utan HUD.clear-varningen.
