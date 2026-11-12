# 1.14.0-qa.8 – uppföljning efter QA.7

Alla tidigare QA.7-funktioner ingår. Dessa ändringar gäller Legacy Mixed:

- Spelarens delade Start Conflict-fönster visar ljus text och ljusa platshållare i mörka fält, även när fälten är låsta medan GM förbereder konflikten.
- Fate och Persona har inget lagringstak på PC eller NPC. Bladens plus/minus, GM:s Resource Admin och sessionsbelöningar bevarar värden över 5. System Audit accepterar dessa saldon. Miniminivån är fortfarande 0; Checks behåller sitt tak. Gränsen för Persona-tärningar i ett enskilt slag ändras inte.
- NPC:s Quick Skills saknar den separata VS-rutan. Versus väljs i den vanliga slagrutan. OB-knappen ligger direkt efter skillfältet på samma rad.

Verifiering: 191 runtime-filer syntaxkontrollerade, 134 smoke-testfiler, fem webbläsarsviter och release preflight. Testerna kör produktionskod med kontrollerade Foundry-dokument och transport. Spelarens konfliktfönster och NPC-layout har också granskats visuellt. Acceptans i er Foundry-installation återstår.

Endast lokal QA för manuell installation i separat testvärld. Ingen publicering, tagg eller kanaluppdatering. Andra profiler behåller sina tidigare regler. Rotens källmanifest behåller basversion 1.13.4; QA-versionen sätts endast i paketet.
