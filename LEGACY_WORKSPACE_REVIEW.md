# Legacy Mixed – karaktärsblad och Inventory, granskningsrapport

Datum: 2026-11-09. Lokal utvecklingsgren: `work/legacy-sheet-inventory`.
Bas: stable 1.13.2, inklusive huvudgrenens publiceringsmetadata (`e4a6d66`).
Status: byggt och lokalt testat; inte publicerat eller installerat i en spelvärld.
Versionsnummer, release/READY och releasekanaler har inte ändrats.

## Genomfört

1. Större porträtt. Bildredigeringsikoner visas vid hover eller tangentbordsfokus; på pekskärm förblir de synliga.
2. Nature, Will, Health, Resources och Circles har kompaktare visning och mindre progressionskontroller.
3. GM Turn, Custom Roll och Conditions delar samma verktygsrad när turn-raden finns.
4. En centrerad pil fäller undan överdelen. Huvudmenyerna ligger kvar; Character-undermenyn ligger fast under skrollning. Varje huvudflik behåller sin skrollposition medan bladet är öppet.
5. Tränade och otränade Skill-kort följer samma kompakta grundlayout. Quick Roll-knapparna är borttagna i Legacy Mixed. Roll Window heter Roll och ligger vid Edit.
6. Pass/Fail visas ovanpå varandra. Klick öppnar en redigering med Spara/Avbryt. Otränade Skills visar Learning och Will/Health-bas i stället. Ogiltiga, föråldrade och dubbla samtidiga redigeringar i samma klient avvisas.
7. Vanliga Skill-slag och Beginner’s Luck har valet Standard/Versus i slagfönstret, med sökning efter synliga motståndare och val av regelstödd opposition. Detta ändrar inte scenens tokenmarkeringar eller sparar ett permanent Versus-val på färdigheten. Conflict använder fortsatt sitt befintliga gemensamma slagflöde.
8. Åtta nya PNG-siluetter: människa, alv, dvärg och hobbit, manlig/kvinnlig. Härkomst styr bilden; endast siluettens kön kan väljas i Inventory. Tom härkomst ger människa. Dúnadan använder människobilden. Okänd angiven härkomst får neutral reservfigur. Engelska namn samt människa/alv/dvärg stöds i den nya bildväljaren.
9. Inventory använder kroppspunkter. Hover/fokus visar utrustning; klick öppnar en kvarliggande ruta med inventariesökning, utrusta och ta av. Placering använder befintlig validering för kroppszoner, kapacitet och tvåhandsvapen.
10. En sökbar inventarielista visar både utrustade och övriga föremål, inklusive placering. Move flyttar till kroppszon, behållare eller Unassigned. Dragning finns kvar. Tokens of Power ligger under en fällbar informationsdel. Befintliga föremål och inventarieregler konverteras inte.
11. GM får en högerklicksmeny på scenens tokenlager. Tom mark: placera befintlig NPC via sökning, öppna/starta Conflict, End Session och ping. På token: öppna Actor, Conditions, Custom Roll, välj som motståndare och ordinarie Foundry-tokenkontroller, plus gemensamma kommandon. NPC-placering skapar en token, ingen ny Actor. Högerdragning lämnas för panorering; Shift-högerklick lämnar den befintliga hanteringen till Foundry.

## Regelkontroll: Beginner’s Luck och inlärning

- Will/Health anger slagets bas, inte antal inlärningsförsök.
- Antal försök är maximal/otaxerad Nature. Nature-tax ska inte förkorta inlärningen.
- Både ett lyckat och ett misslyckat registrerat Beginner’s Luck-försök räknas. Ett oavgjort, olöst resultat räknas inte i det befintliga flödet.
- Färdigheten öppnas på värde 2. Därefter används vanlig Pass/Fail-utveckling.
- Beginner’s Luck-försöket ger inte samtidigt utveckling av Will/Health.
- Visningen använder uttryckligen Learning X/Y och basförmågan. Ett generellt Needed 1 ersätter inte Nature-värdet.
- Granskningen hittade att Trait-tärningar tidigare ingick i poolen före halveringen. Legacy Mixed räknar nu Trait-tärningar efter halveringen, liksom Persona, Fresh och tappad Nature. Exempel: Health 5 och +1D Trait ger ceil(5/2)+1 = 4D. Andra profiler använder sina bevarade implementationer.

Referenser: [officiellt Torchbearer-rollformulär](https://www.torchbearerrpg.com/wp-content/uploads/2019/04/TB_cs_v2_r5_blank.pdf), [publicerad slagöversikt](https://www.torchbearerrpg.com/wp-content/uploads/2016/10/Torchbearer-Cheat-Sheets-Dice-Rolls.pdf), [MG2E-diskussion om maximal Nature och inlärning](https://forums.burningwheel.com/t/errors-in-2nd-edition/23697).
Detta är en avgränsad granskning av Beginner’s Luck/inlärningsflödet, inte en ny fullständig regelprofil eller import av TB2E.

## Verifiering

- 173 runtime-filer syntaxkontrollerade och 127 smoke-testfiler passerade i den fullständiga lokala körningen.
- Nytt riktat test verifierar de åtta bildfilerna, tom härkomst, maximal kontra taxad Nature, båda slagutfallen, automatisk inlärning på 2, efterföljande utveckling, ogiltiga/föråldrade redigeringar, Trait efter halvering, Versus-val och GM/profilspärrar.
- Nytt Chromium-test renderar den riktiga character.hbs-mallen med samtliga systemstilmallar och produktionsmoduler. Det klickar genom hopfällning, progression, ett fullständigt Versus-slag utan tokenmarkering, manlig/kvinnlig bild, utrustningsbyte, tvåhandsblockering, sökning även av utrustade föremål, flikskroll och GM-menyn.
- Alla åtta bilder laddar i webbläsaren. PNG-filerna har alfakanal; hörnpixlar är transparenta.
- Normal och mindre fönsterstorlek har granskats visuellt. Testet kontrollerar läsbar textfärg, att inventarielistan inte täcker siluetten och att bladet inte får horisontellt överflöd.
- Det befintliga Conflict/End Session-testet i Chromium passerade, inklusive gemensam Disposition, Back, manuella Skills, kortsekretess, resursfrågor och andra profilers gränssnitt.
- Release preflight och git diff --check passerade. Bevarade profilsnapshots och startup-optimeringen är oförändrade.

Testerna använder kontrollerade Foundry-dokument, inställningar, dialogvärdar och canvasobjekt. De kör produktionskod i en riktig webbläsare men är inte en körning på en full Foundry-server med flera riktiga spelarklienter. Inga användarvärldar har öppnats eller ändrats. CI-arbetsflödet är uppdaterat för arbetsgrenen men har inte körts på GitHub i denna omgång.

## Kvar före distribution

Användaren granskar rapporten och bilderna. Därefter kan en separat testpatch förberedas för Foundry-testvärlden. Där behöver framför allt GM-menyn tillsammans med faktisk token-HUD/panorering, fönsterstorlekar och GM/spelare på separata klienter provas. Ingen stable- eller QA-release skapas av detta arbetssteg.

## Bildmaterial

Åtta nya filer finns under `assets/ui/silhouettes/legacy/`. Den inbyggda bildgeneratorn användes; ingen av de gamla siluetterna har redigerats. Bildbeskrivningar och referensrelationer finns i ARTWORK.md i samma mapp.
