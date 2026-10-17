# QA26 – spelbar TB2E-beta

**Version:** 1.13.0-qa.26. **Roadmap:** M10D.2, M10D.10–12.
**Status:** kodtestad; Pers speltest återstår. Stable ändras inte.

Installera genom den vanliga QA-länken:
https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/qa/system.json

Det här testar den nya spelkopplingen. Tidigare godkända Legacy-/shadowtester behöver inte göras om.

## A. Installera och välj TB2E

1. Uppdatera systemet till **1.13.0-qa.26** och öppna testvärlden som GM.
2. Öppna befintlig **Rules Profile Management**. Välj **Torchbearer 2E – Playtest Beta** och ladda om världen.
3. Kontrollera att samma profil är aktiv efter omladdningen.

**Förväntat:** betaprofilen kan väljas. Befintliga personer och föremål finns kvar. Den äldre TB2E-foundationens förhandsvisning finns kvar som historisk referens; den är inte den spelbara profilen. Betan använder Adventure/Camp/Town i stället för GM Turn/Players’ Turn.

## B. Skapa en karaktär

1. I Actors, klicka **Create TB2E character**.
2. För en enkel kontroll: välj **Warrior**, Will **4**, Health **4** och ett namn.
3. Välj **Remote Village**. På nästa sida: ålder **18**, Human upbringing **Laborer**, Home skill **Carpenter**, Home trait **Early Riser**, Social grace **Persuader**.
4. Välj en ledig specialitet, exempelvis **Scout** eller **Scavenger**. Välj Nature **Boast**, **Demand Rights**, **Flee Hide**. Skriv en egen Wise och namnge Friend, Parents och Mentor; lämna Enemy tomt.
5. Skriv Belief, Goal och Instinct. Granska och klicka **Create character**.
6. Använd era befintliga föremål för startutrustningen, enligt klassens regler och GM:s beslut. Inga nya testföremål behövs.

**Förväntat:** en karaktär skapas med Will 4, Health 4, Nature 6/6, Resources 0, Circles 4 och Fresh aktiv. Fighter 4, Hunter 3, Commander/Mentor/Rider 2, Laborer/Carpenter/Persuader 3. Scout eller Scavenger blir 3 om vald. Nature-texten är **Boasting, Demanding, Running**. Avbryt före Create character ska inte skapa en Actor.

Skaparen använder befintliga TB2E-planer och M9:s sparning. Klassens grundfördelning används; eventuell valfri omfördelning görs med GM efteråt. Utrustning, relationernas detaljer, eventuella keepsakes/gold pouches, magi och klassförmågor färdigställs med GM och befintliga Items. Inga NPC:er skapas automatiskt.

## C. Overview och omladdning

1. Öppna PC → **Overview**.
2. Kontrollera ordningen **Nature, Belief, Goal, Instinct, Creed**.
3. Redigera Nature-texten och Creed. Stäng bladet, öppna igen och ladda om världen.

**Förväntat:** samma utseende och redigering för alla fem fälten. Texterna är kvar. Belief/Goal/Instinct och numerisk Nature är bevarade. Creed kan antecknas redan nu; dess regelbetydelse från level 3 hanteras vid bordet.

## D. Spela en kort situation

1. Slå Fighter med Ob **2**, utan extra modifierare, Persona eller hjälp, medan Fresh är aktiv.
2. Spela sedan vidare med er vanliga muntliga GM-bedömning, hjälp och befintliga föremål när situationen kräver det.

**Förväntat för första slaget:** Fighter 4 + Fresh 1 = **5D**. Varje 4, 5 eller 6 ger en framgång. Minst två framgångar ger PASS. Inget bestämt slumpresultat krävs.

Wise-valet ger betalda effekter: **Deeper Understanding** kostar 1 Fate för en misslyckad tärning; **Of Course** kostar 1 Persona för alla misslyckade tärningar. Avstå kostar inget. Detta kan provas när det uppstår naturligt i spel, med tillgängliga resurser.

## E. Adventure, Camp och Recovery

1. GM öppnar dockverktyget **TB2E Adventure / Camp / Town** (dungeon-ikonen).
2. När en spelhandling kostar en tur väljer GM **Record completed turn**. En vanlig fri Instinct-handling registreras inte som en tur. Exhausted Instinct kostar däremot en tur och +1 Ob.
3. Efter fjärde turen visas en Grind-påminnelse. GM använder befintliga condition-reglage för nästa tillstånd. För en Fresh karaktär är första tillståndet **Hungry & Thirsty**; Fresh ska då släckas.
4. När gruppen vill slå läger: minst en deltagare behöver en Check. GM väljer **Camp** i panelen. Använd befintliga Checks-reglage för Checks som tjänats genom GM-bedömda Trait-handlingar.
5. För ett konkret Recovery-prov: hantera mat/dryck med GM och släck Hungry & Thirsty. Aktivera Angry på testpersonen och ge personen 1 Check om det behövs för provet. Klicka dess **Recovery** och bekräfta.

**Förväntat:** Camp kräver minst en Check i gruppen och återställer turnumret till 1. Angry använder **Will Ob 2**, kostar **1 Check** och får ett försök per fas. Vid PASS släcks Angry; vid FAIL kvarstår Angry. Checken används i båda fallen. En avbruten eller tekniskt misslyckad körning ska inte förbruka den. Fas, turnummer, Checks och conditions finns kvar efter omladdning.

**GM-styrt i den här betan:** Grind-tillstånd appliceras av GM efter påminnelsen. Mat/dryck, Camp/Town-events, boende, bonusar och lifestylekostnader avgörs/antecknas vid bordet. Towns Resources-slag görs med den vanliga slagdialogen och GM-angivet Ob. Automatiserat Conflict, Armor, Magic och Trait-effekter ingår inte; Trait-modifierare och intjänade Checks anges manuellt. Detta är angivna spelgränser, inte funktioner som testprotokollet påstår är automatiserade.

## F. Återgång och rapport

1. Återgå till tidigare profil via profilhanteringen och ladda om.
2. Öppna en befintlig person. Välj sedan betan igen om ni vill fortsätta speltestet.

**Förväntat:** profilvalet sparas och personernas data bevaras. Inga föremål eller Nature-/Creed-texter raderas av profilbytet.

Rapportera exempelvis **A–C PASS, D: [observation]**. Vid fel: ange vad du gjorde, förväntat resultat och faktiskt resultat, gärna med bild. Fynd förs in i [bugglistan](TB2E_BETA_PLAYTEST.md). Nästa QA rättar registrerade fynd. Stable kommer först efter ditt uttryckliga godkännande.
