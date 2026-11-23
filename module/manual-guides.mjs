import { openRecruitmentWizard } from "./recruitment.mjs";
import { fitWindowToViewport } from "./window-position-service.mjs";

const SWEDISH_GUIDES = {
  ranger: {
    title: "Skapa din Ranger",
    steps: [
      ["Börja i Actors", "Välj Recruit Ranger för hela guiden eller Create Ranger för ett kortare flöde. Välj Station och ålder utifrån vem du vill spela."],
      ["Besvara Nature-frågorna", "Nature beskriver vad som ligger naturligt för rollpersonen. Läs effekten vid varje svar. Ett svar kan även begränsa vilka Traits du får välja."],
      ["Bygg en rollperson att spela", "Välj färdigheter, kontakter och utrustning. Skriv ett Belief du kan spela efter, ett Goal för nästa uppdrag och en Instinct som beskriver hur du brukar agera."],
      ["Kontrollera och skapa", "Granska sammanfattningen och bekräfta i den riktiga guiden. Din karaktär hamnar under Actors → PC. Om GM är offline behandlas ansökan när en GM ansluter."]
    ]
  },
  sheet: {
    title: "Hitta på karaktärsbladet",
    steps: [
      ["Öppna karaktärsbladet", "Dubbelklicka på din token på kartan eller välj rollpersonen från Actors. I Compact ligger Nature, resurser och Conditions kvar i överdelen när du byter flik."],
      ["Prova de tre flikarna", "Klicka på flikarna på övningsbladet. På ditt riktiga blad fungerar de på samma sätt.", "tabs"],
      ["Hitta uppgiften du söker", "Vill du hitta en vän? Öppna Character → Relationships. Vill du spaningstesta? Öppna Skills och klicka på Scout. För att se vad du bär öppnar du Inventory & Gear."]
    ]
  },
  roll: {
    title: "Gör ditt första slag",
    steps: [
      ["Välj en Skill", "Du letar efter spår på vägen. Din övningskaraktär har Scout 3D, alltså tre tärningar. Vid ett riktigt slag öppnar du Skills och klickar på Scout."],
      ["Slå Scout mot Ob 2", "Ob 2 betyder att du behöver två framgångar. I Legacy Mixed är 4, 5 och 6 framgångar. Klicka på Scout 3D för att slå här.", "roll"],
      ["Läs resultatet", "Läs tärningarna först och jämför framgångarna med Ob. Vid exakt två framgångar klarar du Ob 2 med marginal noll. Vid ett riktigt slag visas det på chattkortet.", "result"]
    ]
  }
};

const ENGLISH_GUIDES = {
  ranger: {
    title: "Create Your Ranger",
    steps: [
      ["Start in Actors", "Choose Recruit Ranger for the full guide or Create Ranger for a shorter walkthrough. Pick a Station and age that fit the character you want to play."],
      ["Answer the Nature questions", "Nature describes what comes naturally to your character. Read the effect of each answer. Some answers also limit which Traits you can select."],
      ["Build a character you can play", "Choose Skills, relationships, and gear. Write a Belief to play by, a Goal for the next mission, and an Instinct that describes how you usually react."],
      ["Review and create", "Check the summary in the character creator before confirming. Your Ranger appears under Actors → PC. If the GM is offline, the request is processed when a GM connects."]
    ]
  },
  sheet: {
    title: "Find Your Way Around the Character Sheet",
    steps: [
      ["Open the character sheet", "Double-click your token or open the character from Actors. In Compact, Nature, resources, and Conditions stay in the header as you switch tabs."],
      ["Try the three tabs", "Click the tabs on this practice sheet. You will find the same tabs on your character sheet.", "tabs"],
      ["Find what you need", "Looking for a friend? Open Character → Relationships. To roll Scout, open Skills. To see what you are carrying, open Inventory & Gear."]
    ]
  },
  roll: {
    title: "Make Your First Roll",
    steps: [
      ["Choose a Skill", "You are looking for tracks on the road. Your practice character has Scout 3D, which means three dice. In play, open Skills and click Scout."],
      ["Roll Scout against Ob 2", "Ob 2 means you need two successes. In Legacy Mixed, 4, 5, and 6 each count as a success. Click Scout 3D to try it.", "roll"],
      ["Read the result", "Count the successes and compare them with the Obstacle. Exactly two successes pass Ob 2 with a margin of zero. A roll in play shows this on its chat card.", "result"]
    ]
  }
};

export const MANUAL_GUIDE_TOPICS = {
  "Create a Ranger with Recruitment": "ranger", "Skapa en Ranger med Recruitment": "ranger",
  "The character sheet and its layouts": "sheet", "Spelarbladet och dess layouter": "sheet",
  "Standard tests and reading the chat card": "roll", "Vanliga slag och att läsa chattkortet": "roll"
};

const texts = {
  en: {
    step: (current, total) => `Step ${current} of ${total}`,
    dice: "Dice", successes: "successes", margin: "margin",
    tabs: {
      Character: "Open Overview, Background, Relationships, or Notes. Overview includes Traits and Wises.",
      Skills: "This tab lists your Skills. Click Scout to open the roll dialog.",
      "Inventory & Gear": "This tab shows items, equipment slots, and packed gear."
    }
  },
  sv: {
    step: (current, total) => `Steg ${current} av ${total}`,
    dice: "Tärningar", successes: "framgångar", margin: "marginal",
    tabs: {
      Character: "Här finns Overview, Background, Relationships och Notes. Under Overview hittar du bland annat Traits och Wises.",
      Skills: "Här finns rollpersonens färdigheter. Ett klick på Scout öppnar slagdialogen.",
      "Inventory & Gear": "Här ser du föremål, utrustningsplatser och packade saker."
    }
  }
};

const guideSet = language => language === "sv" ? SWEDISH_GUIDES : ENGLISH_GUIDES;
export const manualGuideTitle = (key, language) => guideSet(language)[key]?.title;

function practiceResult(faces, text) {
  const successes = faces.filter(face => face >= 4).length;
  const outcome = successes >= 2 ? "PASS" : "FAIL";
  return `<div class="rg-manual-practice-result"><p><b>Scout 3D · Ob 2</b></p><p>${text.dice} ${faces.join(" · ")}</p><strong>${outcome}</strong> · ${successes} ${text.successes} · ${text.margin} ${successes - 2}</div>`;
}

let guideOpen = false;

export async function openManualGuide(key, language = "en") {
  const guides = guideSet(language);
  if (guideOpen || !Object.hasOwn(guides, key)) return;
  guideOpen = true;
  const { title, steps } = guides[key];
  const text = texts[language] ?? texts.en;
  const { tabs } = text;
  let faces = [];
  try {
    for (let i = 0; i < steps.length;) {
      const [heading, description, practice] = steps[i];
      const isLast = i === steps.length - 1;
      const controls = practice === "tabs"
        ? `<div class="rg-manual-practice-tabs">${Object.keys(tabs).map(tab => `<button type="button" data-practice-tab="${tab}" aria-pressed="${tab === "Character"}">${tab}</button>`).join("")}</div><p data-practice-text>${tabs.Character}</p>`
        : practice === "roll" ? '<button type="button" data-practice-roll>Scout 3D</button><div data-practice-result aria-live="polite"></div>'
          : practice === "result" ? practiceResult(faces, text) : "";
      const result = await foundry.applications.api.DialogV2.wait({
        window: { title, resizable: true }, position: fitWindowToViewport(560, 400),
        classes: ["rg-scrollable-wizard"],
        content: `<div class="realm-guard rg-recruitment rg-manual-practice"><p>${text.step(i + 1, steps.length)}</p><h2>${heading}</h2><p>${description}</p>${controls}</div>`,
        modal: false, rejectClose: false,
        render: (_event, dialog) => {
          const root = dialog.element.querySelector(".rg-manual-practice");
          if (practice === "tabs") {
            const group = root.querySelectorAll("[data-practice-tab]");
            for (const tab of group) tab.addEventListener("click", () => {
              for (const other of group) other.setAttribute("aria-pressed", String(other === tab));
              root.querySelector("[data-practice-text]").textContent = tabs[tab.dataset.practiceTab];
            });
          }
          if (practice === "roll") {
            const next = dialog.element.querySelector('[data-action="next"]');
            const button = root.querySelector("[data-practice-roll]");
            const output = root.querySelector("[data-practice-result]");
            next.disabled = !faces.length;
            if (faces.length) output.innerHTML = practiceResult(faces, text);
            button.addEventListener("click", async () => {
              const roll = await new Roll("3d6").evaluate();
              faces = roll.dice.flatMap(die => die.results.map(entry => entry.result));
              output.innerHTML = practiceResult(faces, text);
              next.disabled = false;
            });
          }
        },
        buttons: [
          ...(i ? [{ action: "back", label: "Back" }] : []),
          { action: "next", label: isLast ? "Done" : "Next", default: true },
          ...(isLast && key === "ranger" ? [{ action: "create", label: "Open Recruit Ranger" }] : []),
          { action: "close", label: "Close Guide" }
        ]
      });
      if (result === "create") { void openRecruitmentWizard({ mode: "guided" }); return; }
      if (result === "back") i--;
      else if (result === "next") i++;
      else return;
    }
  } finally {
    guideOpen = false;
  }
}
