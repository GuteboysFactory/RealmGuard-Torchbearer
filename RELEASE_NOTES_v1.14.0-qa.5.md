# 1.14.0-qa.5 – Legacy Mixed

Lokalt QA-paket baserat på stable 1.13.4, med hela speltestuppföljningen från QA.4 och följande tillägg:

- GM får OB Roll på NPC och OB-knapp vid Quick Skills. Samma vanliga slagruta används; framgångarna kan besvaras som OB från chatten.
- Item-drop följer det fält där föremålet släpps. Annars används källmapp och sedan ursprunglig typ. Skills hamnar i Skills/Quick Skills, Weapons/Vapen kategoriseras som vapen. Källan och befintlig Skill-progression skyddas.
- 124 unika Talents från den inskickade listan, nivå 2–10. Sökbar väljare, nivåfilter, ett permanent val per nivå och icke-överskrivande synk till Starter Talents.
- 99 Talent-namn är matchade mot Dungeoneer’s Handbook. 25 saknar verifierad källa och har markerade arbetsnamn. Användaren har uttryckligen skjutit upp källgranskningen; se `LEGACY_TALENT_SOURCE_REVIEW.md`.
- Anpassningarna i inskickad regeltext behålls. Hauberk och Dream Vision har fått sina avbrutna slut kompletterade från Handbook. En duplicerad Helpful-post har slagits ihop.

Talent-effekterna är Manual effect och behöver avgöras vid bordet. Importen automatiserar inte exempelvis Heroic Ability, Might, ratingtak eller inventarieutökningar. Once/session-lås används där texten är entydig; andra användningsbegränsningar följs manuellt enligt texten. Nivå 3:s Creed och hometown Circles visas som en påminnelse.

QA.4-funktionerna ingår: chattens Custom Roll och svar via vanlig slagruta, manuellt Versus-OB, Undo, PvP-Conflict med Captain-kort och fast Disposition, Back och stängning, delad End of Session, paus/närvaro/ljud, minimerbar GM Dock, sessionsbundna Wises, Start Session samt kartplatser och 16 sökbara symboler.

Alla nya flöden gäller Legacy Mixed. Quick Insert/Tome och TB2E-arbete ingår inte. Tester använder produktionskod med kontrollerade Foundry-dokument och ersätter inte acceptanstest i er spelvärld.

Ingen publicering eller kanaluppdatering har gjorts. Installera ZIP manuellt i separat testmiljö. Paketets framtida onlineadress är inte publicerad.
