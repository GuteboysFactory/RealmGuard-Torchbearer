# QA.9 – bygg- och testresultat

12 november 2026. Lokal gren `work/legacy-playtest-followup`. Ändringarna är avgränsade till Legacy Mixed; frysta baseline-filer är orörda.

## Genomförande

GM Dock läser en lista med valda verktygs-ID:n från GM-användarens Foundry-flagga `gmDockQuickAccess`. Saknad lista ger tidigare standardknappar. Other tools visar tillgängliga verktyg som inte valts som snabbknappar. Externa providers använder samma princip och behåller originalmeny, callbacks och badges. Session och administrationsverktygens placering behålls. Save, Cancel och Restore defaults verifieras genom riktiga UI-klick.

Conflict renderar en särskild avslutningsvy vid `compromise`. Den visar mål, vinnare, kompromissgrad och GM:s textfält. Textutkast bevaras vid omritning. Befintligt GM-auktoritativt och serialiserat avslut sparar uppgörelsen i state och chatt, städar temporära verktyg och markerar att fönstret ska stängas för alla. Markeringen hindrar automatisk återöppning vid senare uppdateringar och klientstart. Avsiktlig manuell granskning och återöppning fungerar fortfarande. Back finns i avslutningsvyn.

OB-knappen använder en tvåsekunders CSS-animation mellan mörkrött och grönt med vit text. Reducerad rörelse stänger av animationen. Det befintliga skillbaserade svarsflödet och behörigheterna ändras inte.

## Verifiering

- 191 runtime-filer syntaxkontrollerade; 134 smoke-testfiler passerade.
- Release preflight och samtliga fem webbläsarsviter passerade.
- Tre separata klienter verifierar avslutningsvy, GM-behörighet, bevarat utkast, sparad kompromiss och automatisk stängning hos alla. Senare uppdateringar öppnar inte konflikten igen.
- Docktest flyttar både ett inbyggt verktyg och en extern provider, kontrollerar fungerande callbacks, sparad flagga, återritning, Cancel, återställning och andra profilers tidigare docka.
- Produktionsskapad OB-utmaning verifierar animationens faktiska röda/gröna färger och reducerad rörelse. Befintliga svarsslag och Undo passerar regressionerna.
- Visuell granskning upptäckte mörk text på mörk kompromisspanel samt en kvarvarande trekolumnsmall för två mål. Båda korrigerades och fick nya webbläsarassertioner före slutlig omkörning.

Loggar och bilder: `output/playtest-followup/review-checks.json`, `output/playtest-followup/checks.json`, `output/playtest-followup/qa9-compromise.png` och `output/cleanup-review/qa9-custom-dock.png` samt `qa9-ob-response.png`.

Testmiljön kör produktionskod med kontrollerade Foundry-dokument och transport, inte gruppens fullständiga Foundry-server med alla tillägg. Lokal QA.9 paketeras först efter passerade kontroller. Paketeraren verifierar varje ZIP-medlem mot källan och kontrollerar CRC. Ingen publicering, tagg, kanaluppdatering eller installation i livevärlden görs.
