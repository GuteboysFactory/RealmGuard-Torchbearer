# Speltestuppföljning – lokal QA.6

Datum: 12 november 2026.

Utgångspunkt: publicerad stable 1.13.4, main `ab18378bfd621bc943ad471dfd3102b399bf4758`. Lokal arbetsgren: `work/legacy-playtest-followup`.

Användaren har godkänt lokal QA-paketering. QA.6 innehåller tidigare QA.4/QA.5 och den nya insamlade uppföljningen. Ingen tagg eller publicering har skapats. Befintliga världar och installerade system har inte använts eller ändrats. Rotens `system.json` behåller basversionen; QA-versionen sätts bara i paketkopian. Se `RELEASE_NOTES_v1.14.0-qa.6.md` och motsvarande testprotokoll.

## Omfattning mot den samlade listan

Alla nya användarflöden är avgränsade till Realm Guard Legacy Mixed. Strict, MG1E, MG2E och TB2E använder sina tidigare flöden. Frysta baseline-filer har inte ändrats. Quick Insert och Tome ingår inte.

| Nr | Önskemål | Lokal implementation |
|---|---|---|
| 1 | Custom Roll vid chatten | Tärningsknapp vid chattkontrollerna öppnar den befintliga Custom Roll-funktionen. |
| 2 | Manuellt OB i Versus | Standardvalet är att GM redan har slagit. Motståndare väljs och OB anges manuellt. Automatisk motståndarroll finns kvar som uttryckligt alternativ. |
| 3 | Svara på slag från chatten | Öppnar direkt samma vanliga Skill-slagruta som från karaktärsbladet. Karaktär och Skill väljs i den rutan. OB hämtas från chattkortet. Conditions, Help och vanliga resursval använder befintliga funktioner. Ingen separat inledande väljarruta eller separat slagmotor. |
| 4 | Tydligare chatt | Avstånd, ram, bakgrund, deltagarrubriker och resultatavsnitt avgränsar kort och delslag. |
| 5 | Undo för Skill-slag | Alternativ i chattens högerklicksmeny. Sparar förändringar i berörda karaktärers systemdata och flaggor samt berörda befintliga Items. Återställer exempelvis Persona, Fate, progression, Nature-tax och sessionsanvändning. Senare beroenden stoppar återställningen. |
| 6 | Conflict synligt från start | Delat Conflict-tillstånd öppnar fönstret i anslutna klienter. |
| 7 | Spelare mot spelare | Oppositionen kan få en spelarkontrollerad Captain. Mål, Disposition, utrustning, kort och handlingsslag kan hanteras från spelarsidan. GM behåller auktoriteten över tillstånd och avgöranden. |
| 8 | Captain väljer kort | Endast respektive lags ledare får planeringskontrollerna. Ägarskap till en annan deltagare ger inte rätt att välja kort. Motpartens kommande kort visas inte i gränssnittet. |
| 9 | Disposition fördelas en gång | Fördelningen låses efter första tilldelningen. Skada och återhämtning synkroniserar de individuella aktuella poängen med lagets total. |
| 10 | GM korrigerar Disposition | Klick eller tangentbordsaktivering på dispositionbaren öppnar manuell korrigering av aktuella poäng. Startvärdena bevaras. |
| 11 | Behåll vapenval | Deklaration inför nästa omgång visar föregående giltiga val. Valet nollställs inte automatiskt. |
| 12 | Beginner’s Luck i Conflict | Otränad Skill använder Will/Health. Trait-tärningar läggs efter halveringen även i Conflict. |
| 13 | Extra tärningar i Conflict | Spelarnas fält går att redigera och dess värde går vidare till tärningspoolen. |
| 14 | Defend | Testat att Disposition återhämtas med rätt marginal och begränsas av startvärdet. Det är konfliktens Disposition, inte karaktärens Health-egenskap, som återställs. |
| 15 | Maneuver mot Defend | Lika framgångar avslutas utan ett låsande tiebreak-fönster: ingen effekt och oförändrad Disposition. Inget inlärningsresultat registreras för det lika utfallet. |
| 16 | Stäng avslutad Conflict | En riktig Close Conflict-knapp finns efter avslut, utöver minimera/återställ. |
| 17 | Back och korrigering | En historik över bekräftade steg sparar tillstånd, privata planer och karaktärsändringar. GM kan backa och korrigera resultat. Undo från ett konfliktslags chattkort kan efter GM-bekräftelse backa även efterföljande konfliktsteg. Berörda senare resultat märks som återtagna. |
| 18 | End of Session för alla | Spelarna får en delad visningsvy av GM:s aktuella genomgång och belöningsval. Vyn uppdateras när GM ändrar val. Spelarna kan minimera den; GM styr tilldelningen. |
| 19 | Minimera GM Dock | Knapp med sparat användarval. Verktyg och externa leverantörsknappar döljs när dockan är minimerad. |
| 20 | Namn på minimerade blad | Fönstertiteln sätts till karaktärsnamnet. Minimerat Legacy-blad får utrymme och synlig titel. |
| 21 | Pausruta | GM anger tid manuellt, 10:00 som förval. Gemensam nedräkning, lista över anslutna användare och egen återkomstknapp. Ljud vid start, återkomst och sluttid. |
| 22 | Level 1 Wises | Sessionsflagga låser använd Wise och filtrerar bort den från fler val. Även Wise som används för Help omfattas. Legacy-Wises har tidigare varit orankade; frånvaro av separat level behandlas här som Level 1. Andra profiler använder sin tidigare policy. |
| 23 | Start Session | GM-funktion med uttrycklig bekräftelse återställer Wises, Trait-användningar, Tokens of Power och sessionsbundna Talents. Fate, Persona, Conditions och Learning nollställs inte. Även befintliga Start Next Session återställer Wise-låsen. |
| 24 | Skapa på kartan | GM:s befintliga högerklicksmeny kan skapa platsmarkör eller ett Item av systemets befintliga typer med kopplad informationsmarkör på klickpositionen. |
| 25 | Sökbara kartikoner | 16 egna vektorsymboler: by, stad, ruin, grotta, grav, stenröse, borg, torn, läger, bro, gruva, tempel, skog, berg, hamn och föremål/skatt. Svenska och engelska sökord. |
| 26 | Markörinformation och synlighet | Namn, information och spelarsynlighet väljs vid skapandet. Standard är GM-only. Native Journal/Note används för fortsatt redigering och behörighet. Vid Item-skapande skapas även ett vanligt Item av vald typ med samma ursprungliga behörighet. |
| 27 | Enkel OB-roll från NPC | GM får OB Roll i NPC-verktygen och OB vid varje tränad Quick Skill. Den vanliga slagrutan används. Antalet framgångar blir OB för svar från chatten. |
| 28 | Import till rätt fält | Uttryckligt fält går före källmapp, som går före ursprunglig Item-typ. Skills/Quick Skills blir Skills; Weapons/Vapen blir Gear med vapenkategori. Svenska/engelska mappar och överordnade mappar stöds. Källföremålet ändras inte. Befintlig Skill-progression skyddas; utrustning från annan karaktär får ingen främmande placering. |
| 29 | Alla inskickade Talents | 124 unika poster för nivå 2–10, sökning och nivåfilter, permanenta val per nivå samt tillägg i världens Starter Talents. Namnen i senaste filens 65 poster gäller; övriga godkända namn behålls. Inga arbetsnamnsmarkeringar återstår. Användarens anpassade effekter bevaras. |
| 30 | Talent-mappar | Talents → Level 1–10 i världens Items och Starter Talents. Level 1 är tom eftersom listan börjar på nivå 2. Synk återanvänder mapparna och flyttar bara Item-mappreferensen. |
| 31 | Spelarnas Back | Ägare till deltagare på endera sidan får Back. Begäran utförs på GM-klienten mot samma tillståndsrevision; dubbelklick från en gammal vy backar inte extra steg. |
| 32 | Start Conflict från första rutan | Spelarna får en gemensam skrivskyddad vy av GM:s pågående första startdialog. Fält och deltagare uppdateras. Vyn stängs vid Start eller Cancel. |
| 33 | NPC-resurser | Fate, Persona och Checks har ljusa, tydliga siffervärden, även vid 0. |
| 34 | Handling över namn | Konfliktens chattkort visar handlingen över namnet, som får hela radbredden. |
| 35 | Raka chatthörn | Chattkort och deras inre boxar använder raka hörn. |
| 36 | Stäng färdig konflikt | Framträdande Close conflict window finns för alla klienter efter Conflict Complete. Stängningen är lokal för varje klient. |
| 37 | Klickbar Versus-sökning | Bara den aktiva kartans tokens listas. Klick på träff väljer motståndare direkt, utan extra dropdown. Tokenreferensen följer med för automatiska motståndarslag. Dolda tokens filtreras bort för spelare. |
| 38 | Spelarnas egen Undo | Högerklicksmeny och Undo my roll på egna färdiga slag. Samma snapshot återställer Persona, Fate, Trait, Wise och Learning. Konfliktslag går via GM och kan återta efterföljande steg efter bekräftelse. |
| 39 | Löpande chattföljning | Nya meddelanden och sena höjdändringar följs. Normala kort visas helt; kort högre än chattytan visas från rubriken och kan skrollas. Knappar inuti meddelanden förväxlas inte med meddelanderoten. |
| 40 | Spelarsynliga regelbibliotek | Nya world Items utan uttryckliga behörigheter och Item-compendier får Observer som standard. Befintliga uttryckliga GM-inställningar lämnas orörda. Foundry styr mappvisningen utifrån innehållets/compendiets rättigheter. |
| 41 | Separat namn över tokenmenyn | Namnruta är ett syskon ovanför menyn. Första åtgärden heter Open character sheet. |
| 42 | Godkända Fire-namn | De senaste 65 namnen är införda. Kända gamla standardnamn uppdateras, men GM:s egna omdöpningar och anpassade effekter bevaras. Källnamnsfrågan är avslutad enligt användarens besked. |
| 43 | Custom Talents | Ägare kan skapa på PC-/NPC-blad och samtidigt spara ett återanvändbart world Item under rätt nivå. Spelare använder ansluten GM för bibliotekssparandet. |
| 44 | Session Break med karaktärsrader | Alla ser nedräkningsfönstret. Spelaren klickar sin karaktär under klockan; raden blir tydligt grön hos alla. Porträtt/karaktärsnamn prioriteras och användarnamn visas mindre. Även sent anslutna deltagare kan markera återkomst. |

## Viktiga implementationstolkningar

- Individuell Disposition: förlust tas först från den aktiva deltagaren, sedan övriga i lagordning. Återhämtning fyller tillbaka poäng inom de ursprungliga individuella startvärdena. Den ursprungliga fördelningen ändras inte. Detta behöver kännas rätt vid användarens QA.
- Maneuver/Defend med lika resultat betyder ingen effekt, inte en automatiskt utsedd vinnare. Det avlägsnar den blockerande tied-hanteringen för just det paret.
- Chattens vanliga slagruta uppdateras när man byter Skill så att rätt grundvärden och Conditions används. Ett byte kostar inga resurser och utför inget slag.
- Kartverktyget skapar platser samt Gear, Skills, Traits, Wises, Conditions, Tokens of Power och Talents. Det använder systemets befintliga Item-typer och är inte en generell editor för alla Foundry-dokument.
- Platsinformation använder Foundrys vanliga journalfönster. Synlighet kan ändras via journalens Configure Ownership. Kopplat Item är ett separat dokument och har separat behörighet efter skapandet.

## Begränsningar och vad QA behöver pröva

1. Testmiljön använder riktiga produktionsmoduler, mallar, CSS, dialogcallbackar och webbläsarhändelser. Foundry-dokument, canvas och nätverk är kontrollerade fixtures. Tre separata webbläsarkontexter är inte samma sak som en full Foundry 13.351-server med verkliga spelarklienter och era moduler.
2. Undo kan bara gälla nya slag med sparade återställningsdata. Gamla chattkort från tidigare versioner kan inte rekonstrueras. Återställningen skyddar spårade systemändringar; den kan inte lova att återta godtyckliga ändringar som andra moduler gör utanför systemets slagflöde.
3. Konflikthistorik och privata planer hör till GM-klientens sparade privata tillstånd. Att byta GM-konto, dator eller webbläsarprofil mitt i en konflikt behöver separat acceptanstest. En pågående resursfråga i chatten ska avslutas/avböjas innan dess steg backas.
4. Återställning stoppar om berörda dokument har ändrats efter slaget. Då måste senare beroenden backas först. Det är ett avsiktligt skydd mot dubbla återbetalningar och felaktig progression.
5. Ljudens faktiska volym, behaglighet och webbläsarens ljudtillstånd behöver provas av gruppen. Timern och närvarosynkroniseringen är automatiskt testade; ingen mänsklig ljudbedömning har gjorts.
6. Kartmarkörers faktiska synlighet med token vision, journalbehörigheter och era kartmoduler behöver provas i Foundry. Testerna kontrollerar skapade dokumentdata, koordinater och behörighetsvärden.
7. End of Session är synlig för deltagarna men redigeras av GM. Det är ingen ny röstnings- eller självutdelningsfunktion.
8. Talent-importen är regelinnehåll, inte automatisering av 124 specialförmågor. Alla importposter använder Manual effect och ger inga generella automatiska bonusar. Effekter, val av Heroic Ability, ratingtak, extra inventarieplatser och fas-/äventyrsbegränsningar hanteras med GM enligt texten. Entydig once/session-text använder befintligt sessionslås. Nivå 3:s Creed och hometown Circles visas som en påminnelse och ändrar inga generella Circles-värden automatiskt.
9. **Namnfrågan är avslutad enligt användarens senare besked 2026-11-12.** Samtliga Fire-Talents ska ingå och senaste filens namn gäller för dess 65 poster. Ingen vidare källgranskning krävs. `LEGACY_TALENT_SOURCE_REVIEW.md` innehåller det uppdaterade beslutet.
10. Automatisering av specialeffekterna i 124 Talents ingår fortfarande inte. Custom Talents är Manual effect och bibliotekets world Item är en fristående kopia; efterföljande redigering av en kopia skriver inte automatiskt över andra karaktärers exemplar.

## Tester och reproduktion

QA.6:s slutresultat: **187 runtime-filer syntaxkontrollerade, 132 smoke-testfiler passerade, fyra webbläsarsviter passerade samt release preflight och diffkontroll passerade.** Slutresultat finns i de lokala loggarna nedan. Inga GitHub Actions har startats av detta lokala arbete.

Kör `node qa/run-playtest-review.cjs` med Playwright och Handlebars tillgängliga. På denna dator ligger testbiblioteken separat under `output/test-runtime`; de ingår inte i systemkoden. Lokalt används Node 24.22.1, Playwright 1.62.1, Handlebars 4.7.8 och Microsoft Edge som Chromium-motor. CI-konfigurationen använder fortsatt Node 22 och Playwrights Chromium.

Kontroller:

- Syntaxkontroll av samtliga runtime-filer i `realm-guard.mjs`, `module/` och `sheets/`.
- Alla smoke-testfiler, inklusive profilisolering och baseline-integritet.
- `qa/release-preflight.mjs`: basversionens kontrakt; inget nytt releasepaket byggs av kontrollen.
- `qa/conflict-session-browser.mjs`: tidigare konflikt-/sessionsflöden, rättad fast fördelning och sparat vapenval.
- `qa/legacy-character-workspace-browser.mjs`: karaktärsblad, utrustning, manuellt/automatiskt Versus, riktiga drop-händelser på PC/NPC, NPC:s OB-slag, Talent-dialogens sökning/nivåval och profilavgränsning.
- `qa/legacy-qa6-browser.mjs`: delad första startdialog, uppdaterade fält, Cancel, spelares och GM:s Custom Talents, korrekta nivåmappar, behörigheter, avvisat obehörigt skapande, chattföljning vid sena höjdändringar och separata namnrutan över tokenmenyn.
- `qa/legacy-player-undo-smoke.mjs`: produktionsslag med Persona, Fate, Trait och Wise, Pass/Fail, samt Beginner’s Luck som lär in Skill och återställs till tidigare otränat tillstånd.
- `qa/legacy-playtest-followup-browser.mjs`: tre separata GM-/spelarkontexter, PvP-ledare och dolda kort, automatisk Disposition, Defend, lika Maneuver/Defend, Back, GM-korrigering, stängning, paus/närvaro, delad sessionsvy, direkt öppning av den vanliga slagrutan från chatten, byte av Skill, Undo av Persona/progression, extra konfliktstärningar, Beginner’s Luck och Trait efter halvering, kartdata, dockminimering och minimerad titel.

Detaljerade resultat sparas i `output/playtest-followup/checks.json` och `review-checks.json`. Webbläsarbilder finns i samma mapp: `break.png`, `session.png`, `map-icons.png`.

Foundry 13-integrationsreferenser: [chattens nya kontextmenyhook](https://github.com/foundryvtt/foundryvtt/issues/12335) och [renderChatInput](https://foundryvtt.com/api/v13/functions/hookEvents.renderChatInput.html).

## Beslutspunkt

Lokal QA-paketering är godkänd. Publicering och kanaluppdatering väntar tills användaren har testat och godkänt QA.
