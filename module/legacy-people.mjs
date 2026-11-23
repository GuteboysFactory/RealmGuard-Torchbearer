const question = (theme, scene, close, mixed, against) => ({ theme, scene, answers: [close, mixed, against] });

export const LEGACY_PEOPLES = {
  human: {
    label: "Human", art: "stonemason.webp", homes: ["Bree-land", "Gondor", "Rohan", "Esgaroth & Dale"],
    questions: [
      question("Pride", "A former rival takes credit for your work. What do you do?", "Demand recognition in front of everyone", "Ask your rival to put it right in private", "Let the credit go to preserve the partnership"),
      question("Community", "Your village needs you the same week you are offered a well-paid job.", "Stay and help the village", "Arrange a few days of help before leaving", "Take the job and leave the village to make its own arrangements"),
      question("Preservation", "Your village must choose between repairing the old bridge and building a new one downstream.", "Rally the village to preserve the old bridge", "Keep what can be saved and change the rest", "Replace the old bridge and start from scratch")
    ]
  },
  dwarf: {
    label: "Dwarf", art: "dwarf.webp", homes: ["Erebor", "Iron Hills", "Blue Mountains", "Aglarond"],
    questions: [
      question("Greed", "A rockfall threatens your life's work. What matters most?", "Protect my life's work", "Save what matters most", "Leave my work and help others"),
      question("Stubbornness", "An experienced craftsperson tells you that your plan is wrong.", "Stick to my plan", "Try both methods", "Let the other craftsperson take over"),
      question("Steadfastness", "You promised to hold a mountain pass, and the situation has turned against you.", "Stay at my post", "Arrange for someone to relieve me", "Leave my post")
    ]
  },
  hobbit: {
    label: "Hobbit", art: "hobbit.webp", homes: ["The Shire", "Bree-land"],
    questions: [
      question("Small Folk", "Big Folk block the road and barely notice you.", "Slip past through a gap only I can fit through", "Wait for the right moment and ask to pass", "Step forward and speak for the group"),
      question("Merriment", "The company reaches safety after a long, miserable day.", "Lay on a meal, songs, and good company", "Share supper and rest", "Skip the evening and set off alone"),
      question("Strong Will", "A powerful traveller pressures you to surrender a letter you promised to protect.", "Refuse despite the threat", "Ask a trusted friend to help me decide", "Let the traveller decide what happens to the letter")
    ]
  },
  elf: {
    label: "Elf", art: "elf.webp", homes: ["Rivendell", "Lothlórien", "Woodland Realm", "Grey Havens"],
    questions: [
      question("Fey", "Children in a village ask you to explain a strange light in the forest.", "Answer with an old song and let them draw their own conclusion", "Tell them what I saw and sing a verse", "Give a direct, practical answer"),
      question("Long Memory", "An old boundary stone stands in the way of a new agreement.", "Let the old promise settle the issue", "Mention the old promise and seek a new agreement", "Let today's needs settle the issue"),
      question("Longing for the West", "A ship is waiting in the harbour when you are offered a new task in Middle-earth.", "Go down to the harbour and prepare to leave", "Put off leaving until I finish the task", "Choose to stay and settle here")
    ]
  }
};

export const LEGACY_BACKGROUNDS = {
  mason: { label: "Stonemason", skills: ["Stonemason", "Laborer", "Haggler"], gear: ["Hammer and Chisel", "Leather Apron"] },
  trader: { label: "Merchant", skills: ["Haggler", "Persuader", "Administrator"], gear: ["Merchant's Scale", "Ledger"] },
  courier: { label: "Messenger", skills: ["Pathfinder", "Scout", "Rider"], gear: ["Letter Case", "Travel Cloak"] },
  keeper: { label: "Innkeeper", skills: ["Cook", "Brewer", "Haggler"], gear: ["Cooking Pot", "Guest Book"] },
  warden: { label: "Road Warden", skills: ["Scout", "Fighter", "Survivalist"], gear: ["Walking Staff", "Signal Horn"] },
  herbalist: { label: "Herbalist", skills: ["Healer", "Survivalist", "Alchemist"], gear: ["Herb Pouch", "Mortar"] }
};

export const LEGACY_RELATIONS = [
  ["mother", "Mother or Parent", "PARENT", "UNKNOWN"],
  ["father", "Father or Other Family Member", "PARENT", "UNKNOWN"],
  ["seniorArtisan", "Master Artisan or Teacher", "SENIOR_ARTISAN", "UNKNOWN"],
  ["mentor", "Mentor", "MENTOR", "UNKNOWN"],
  ["friend", "Friend", "FRIEND", "FRIENDLY"],
  ["enemy", "Rival", "ENEMY", "HOSTILE"]
];

export const NATURE_ADJUSTMENTS = [1, 0, -1];
export const legacyStartingNature = answers => Math.min(6, Math.max(2, 3 + answers.reduce((sum, answer) => sum + (NATURE_ADJUSTMENTS[answer] ?? 0), 0)));
