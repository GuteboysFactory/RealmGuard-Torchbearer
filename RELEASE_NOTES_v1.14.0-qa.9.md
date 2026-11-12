# 1.14.0-qa.9 – anpassningsbar docka och konfliktavslut

Lokalt QA-paket för Legacy Mixed. Alla tidigare QA.8-funktioner ingår.

- **GM Dock:** Other tools → Customize quick access låter GM flytta verktyg mellan menyn och dockans snabbknappar. Även externa provider-menyer kan visas som snabbknappar med sina badge-tal. Valen sparas per GM. Cancel behåller tidigare val; Restore defaults återställer standardknapparna. Session är alltid tillgänglig och administrationsverktygen ligger fortsatt i Settings.
- **The Compromise:** när konflikten når sitt avgörande ersätts spelvyn av ett separat avslutningsfönster för alla anslutna klienter. GM skriver uppgörelsen och väljer Save Compromise & Close Conflict for Everyone. Texten sparas i Conflict Complete-kortet och konfliktfönstret stängs hos alla. Spelare kan läsa resultatet och vänta på GM men kan inte avsluta konflikten. Back finns kvar för rättelser. En avslutad konflikt kan öppnas manuellt för granskning och GM kan återöppna den vid fel.
- **OB-svar:** chattkortets Respond/Choose Skill-knapp växlar tydligt mellan rött och grönt. Inställningen för reducerad rörelse ger en statisk grön knapp med röd kant. Det vanliga skillbaserade svarsflödet är oförändrat.

Verifierat med 191 syntaxkontrollerade runtime-filer, 134 passerade smoke-testfiler, fem webbläsarsviter och release preflight. Tre separata klienter kontrollerar konfliktavslut och stängning. Skärmbilder har granskats; då upptäckta kontrast- och kolumnfel i avslutningsfönstret har korrigerats och testats igen.

Testerna använder produktionsmoduler, mallar och CSS med kontrollerade Foundry-dokument, transport och canvas. Acceptans i er riktiga Foundry-installation återstår. Inget är publicerat eller installerat i spelvärlden. Källmanifestet behåller version 1.13.4; paketet får QA-versionen vid byggandet.
