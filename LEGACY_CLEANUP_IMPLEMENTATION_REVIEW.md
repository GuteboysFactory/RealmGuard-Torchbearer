# Legacy Mixed – genomförd uppföljning efter godkänd QA.6

Datum: 12 november 2026. Lokal gren: `work/legacy-playtest-followup`.

Status: de åtta beställda punkterna är implementerade och testade i den isolerade testmiljön. **Inget nytt QA-paket är skapat. Ingen version, tagg, publicerad kanal eller release har ändrats.** Användaren tar beslut om nästa QA-paket efter rapporten.

QA.6 är godkänd enligt användarens besked. Dess befintliga ZIP är oförändrad: SHA256 `7cf961be385fbe0d6016365121829924a3058a4ed1a18e980eeef79d5f12ae0e`. Rotens manifest behåller basversion 1.13.4 tills en separat paketering beslutas. Frysta baseline-filer är orörda; alla nya användarflöden är avgränsade till Legacy Mixed.

## Resultat mot beställningen

| Punkt | Genomförd ändring | Verifiering |
|---|---|---|
| 1. GM Dock | Fem huvudknappar: Session, Conflict, Turns, Obstacle och Break. Start/End Session delar meny. Other tools samlar GM Control, NPC Library, Content Studio och externa provider-menyer. Inställningar, bibliotekssynk, diagnostik och positionsåterställning nås från Configure Settings → Realm Guard / Torchbearer → Settings, Libraries & Diagnostics. Manualens befintliga chattknapp behålls. | Menyregistrering, knappantal, routing, Session-menyn, extern provider/badge, positionsåterställning, minimering och profilavgränsning testade i webbläsaren. |
| 2. Token-HUD | Markerade genvägar för synlighet, status/Conditions, rörelse, target och combat döljs för både GM och spelare. Konfiguration, elevation och Delete lämnas synliga. Funktionerna och dokumentdata tas inte bort. | UI-döljning testad för båda användarrollerna med V13-formade kontroller, inklusive palette-knappar. Andra profilers tidigare HUD behålls. |
| 3. Inre slagram | Den markerade resultatrutans sidor och nederkant tas bort. Överkanten är en avdelare som går mellan ytterramens insidor. Ytterramen och övriga inre boxar behålls. | Faktiskt produktionsslag renderat i 330 px chattbredd. Kantbredder, avdelarens utsträckning och kvarvarande pool-box testade och visuellt granskade. |
| 4. Uppmärksamhet i chatten | Väntande slagval får tydligare gul markering, ljuspuls och större uppmärksamhetsrubrik. Pulsen gäller den som ska svara. Reducerad rörelse ger en tydlig statisk markering. | Verkligt väntande val via `beginRollChat`, aktiv animation, reducerad rörelse, fungerande svarsknapp och avslutad markering testade. Inga resurskostnader eller slagregler ändrade. |
| 5. Fristående Custom Roll | Chattknappen öppnar direkt en fri slagruta med etikett, tärningspool, extra tärningar och OB. Ingen PC/NPC väljs eller kopplas. Inga karaktärsresurser eller Learning används. Foundrys valda public/private roll mode respekteras. | Spelare utan vald/tilldelad karaktär öppnar och slår direkt. Dubbelklick ger en dialog. Resultatets actor/token/scene är null. Validering, Cancel, escaping, roll mode och oförändrade karaktärsdata testade. |
| 6. Trait-lista | Hela den bifogade listan importeras till Trait-Items med fulla beskrivningar i Traits-mappen i världen och i Starter Traits. Nya world Items är Observer-läsbara som standard. | 121 källposter motsvarar 120 unika namn: Stubborn förekommer två gånger och båda fulla texterna bevaras i samma Item. Alla 120 referenser, behörigheter, uppgradering av gamla genererade platshållartexter, bevarade GM-texter/rating och upprepad synk utan dubbletter testade. |
| 7. NPC:s OB-layout | Den separata OB Roll-knappen i NPC-verktygsraden tas bort. Skillens OB-knapp placeras direkt efter VS på samma rad. | Verklig NPC-mall testad: ingen övre OB-knapp, korrekt ordning och en rad. Det befintliga OB-slaget genomförs fortfarande med NPC:ns Skill. |
| 8. NPC:s normal-slaghint | Nedtonad text efter skillnamnet: “– click name for normal roll”. Skillnamnets vanliga slagväg behålls. | Text och layout kontrollerade i produktionsmallen. Tidigare normala Skill-/Versus-flöden passerar fortsatt. |

Dockan visar även en valbar liten textrad med aktuell tur och pågående/avslutad konflikt. Den kan stängas av i dockans Settings-panel. Tekniska statusfönster ligger inte bland spelknapparna. Externa integrationer behåller sitt befintliga provider-kontrakt men nås från Other tools.

Trait-importen lägger till saknat innehåll och sorterar dess mappreferenser. En känd gammal genererad platshållartext kan ersättas av den fulla beskrivningen. Egna GM-beskrivningar, rating och uttryckliga Item-/compendium-behörigheter skrivs inte över. Äldre extra Starter Traits tas inte bort.

## Testresultat

- **191 runtime-filer syntaxkontrollerade.**
- **133 smoke-testfiler passerade.**
- **Fem webbläsarsviter passerade:** Conflict/session, karaktärsarbetsyta/NPC, speltestuppföljning med tre klientkontexter, QA.6-flöden samt den nya cleanup-sviten.
- Release preflight, profil-/baseline-kontroller och `git diff --check` passerade.
- Inga GitHub Actions har startats av arbetet.

Under kontrollen rättades bland annat en testförväntning som inte räknade de nya Trait-posterna. Dockans tomma noll-badges döljs, medan externa integrationers verkliga badge-tal fortfarande visas. Alla slutliga kontroller passerar efter dessa rättningar.

Reproduktion: `node qa/run-playtest-review.cjs`, med `PLAYWRIGHT_MODULE`, `HANDLEBARS_MODULE`, `PLAYTEST_CHROME` och `WORKSPACE_CHROME` satta enligt datorns testinstallation. Lokalt användes Node 24.22.1 och Microsoft Edge som Chromium-motor. Tester och beroenden är isolerade från användarens spelvärld.

Loggar: `output/playtest-followup/checks.json`, `output/playtest-followup/review-checks.json` och respektive svits `.log`. Nya bilder: `output/cleanup-review/dock.png`, `settings.png`, `roll-divider.png` och `attention.png`. NPC-bilder finns bland arbetsytans testbilder.

## Testmiljöns gräns och nästa beslut

Testerna använder de riktiga produktionsmodulerna, NPC-mallen, CSS, dialogcallbackar och webbläsarhändelser. **Foundry-dokument, nätverk och canvas är kontrollerade fixtures. Ingen fullständig live-Foundry-server med gruppens installerade moduler har använts.** Native Settings-menyns faktiska visning och token-HUD tillsammans med era övriga moduler behöver därför verifieras i nästa användar-QA.

Arbetet är klart för beslut om ett nytt lokalt QA-paket. En publicerbar version beslutas först efter det testet; denna rapport innebär ingen publicering.

API-referenser som kontrollerats: [Foundry V13 TokenHUD](https://foundryvtt.com/api/v13/classes/foundry.applications.hud.TokenHUD.html) och [ChatMessage.applyRollMode](https://foundryvtt.com/api/v13/classes/foundry.documents.ChatMessage.html#applyRollMode-1).
