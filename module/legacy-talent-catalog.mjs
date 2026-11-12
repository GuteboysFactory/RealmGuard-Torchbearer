// Legacy Mixed: user-supplied effects and user-approved names.
// Complex effects are table adjudicated; no blanket dice bonus is inferred.
export const LEGACY_TALENT_CATALOG_VERSION = "2";
export const LEGACY_TALENT_LEVEL_NOTES = Object.freeze({3: "Level 3 also grants a Creed and +1D to Circles in your hometown. Record these with the GM."});
export const LEGACY_TALENTS = Object.freeze([
  {
    "key": "legacy-supplied-l2-01",
    "name": "Soft Step",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When concealed in or sneaking through underbrush or scrub, opponents suffer a -1s penalty to detect you.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 113,
      "class": "Burglar",
      "originalTitle": "Soft Step",
      "nameVerified": true,
      "suppliedLines": [
        2,
        2
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-02",
    "name": "Abstemious",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "At any point you choose, you may tighten your belt\nand push off your hunger or thirst. Remove the hungry and thirsty\ncondition, but check off the angry condition.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 113,
      "class": "Burglar",
      "originalTitle": "Abstemious",
      "nameVerified": true,
      "suppliedLines": [
        3,
        5
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-03",
    "name": "Blood of the Fae",
    "minLevel": 2,
    "frequency": "session",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You are suffused with raw magical energy. In a time of crisis,\nonce per session, you may use the Lore Master skill in place of any\nskill or ability. However, failure brings an additional twist on top of\nthe standard result assigned by the game master.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 115,
      "class": "Magician",
      "originalTitle": "Gifted",
      "nameVerified": true,
      "suppliedLines": [
        6,
        9
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Gifted"
    ]
  },
  {
    "key": "legacy-supplied-l2-04",
    "name": "Searing Verse",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Deliver a searing insult in verse in any verbal conflict. Add +1s to\nany tied or successful Feint\naction when you do so. In a verbal conflict, add one to your hit\npoints after the conflict captain distributes the disposition points.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        10,
        13
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Searing Verse [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l2-05",
    "name": "Needful Things",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "With a gesture of your hand, you can momentarily\nturn scraps and debris into tools or useful items for use in a single\nskill test. This test costs a check. After the test, the scraps\nreturn to their original state.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 115,
      "class": "Magician",
      "originalTitle": "Needful Things",
      "nameVerified": true,
      "suppliedLines": [
        14,
        17
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-06",
    "name": "Hauberk",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When wearing chain armor, you reduce the chance that\nyour armor is damaged when hit (from the usual 1-3 to 1-2 to remain\nundamaged). In addition, your chain armor will protect against weapons that bypass the protection of chain armor.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 119,
      "class": "Outcast",
      "originalTitle": "Hauberk",
      "nameVerified": true,
      "suppliedLines": [
        18,
        20
      ],
      "notes": [
        "Truncated final sentence completed from Handbook p119."
      ],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-07",
    "name": "Shrewd",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You may make a Haggler test during the Player phase without spending a check.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 119,
      "class": "Outcast",
      "originalTitle": "Shrewd",
      "nameVerified": true,
      "suppliedLines": [
        21,
        21
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-08",
    "name": "Born Under Silver Stars",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You are blessed by the wisdom of the night sky and can now\nlearn to orient themselves by the moon and stars: You are granted\n+1D to Pathfinder, Riding and Boatcrafter tests made when journeying or finding your way.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 122,
      "class": "Ranger",
      "originalTitle": "Born Under Silver Stars",
      "nameVerified": true,
      "suppliedLines": [
        22,
        24
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-09",
    "name": "Essence of the Earth",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You can get a good rest anywhere. You are granted a +1D to recover from exhaustion.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 122,
      "class": "Ranger",
      "originalTitle": "Essence of the Earth",
      "nameVerified": true,
      "suppliedLines": [
        25,
        25
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-10",
    "name": "Militant",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You have chosen the path of war, and get a +1D to any Militarist test.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        26,
        26
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Path of War [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l2-11",
    "name": "Vow to the Lords of Justice",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Once per phase, you may make a Will test versus a target’s Nature. If successful, the\ngame master reveals one of the following: creed, a trait or the last evil\ndeed committed by the target.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 125,
      "class": "Theurge",
      "originalTitle": "Vow to the Lords of Justice",
      "nameVerified": true,
      "suppliedLines": [
        27,
        29
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-12",
    "name": "Brawler",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When you are unarmed in a fight, you do not suffer the -1D\npenalty to all actions. If disarmed in an ongoing kill, capture or drive\noff conflict, you automatically switch to your bare hands and do not\ncount as disarmed. Bare hands do not provide a bonus to any actions.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 129,
      "class": "Warrior",
      "originalTitle": "Brawler",
      "nameVerified": true,
      "suppliedLines": [
        30,
        33
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-13",
    "name": "Skirmisher",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When you’re wearing light armor, you do not suffer -1D to recover from Tired.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 129,
      "class": "Warrior",
      "originalTitle": "Skirmisher",
      "nameVerified": true,
      "suppliedLines": [
        34,
        34
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l2-14",
    "name": "Battle Fever",
    "minLevel": 2,
    "frequency": "session",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "In kill and drive off conflicts, each hit point you lose grants you +1D to your Fighter skill for the remainder of the conflict, up to a maximum of your starting hit points. Can be counted as an advantage (+1D6) on a Fighter roll outside of a conflict once per session.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        35,
        35
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Battle Fury [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l2-15",
    "name": "Fever Dreams",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Visions and omens come to you when you are in an\naltered state of mind. In the Player Phase, (can be triggered by spending 2 checks to recover, or make the Ob3, as per normal rules) if you are drunk, drugged,\nangry, afraid, exhausted or sick, you slip into a fevered dream and\nreceive a vision of what is to come (if drugged or drunk, make an\nOb 3 Will test to summon the vision; if recovering from the listed\nconditions, the recovery test itself summons the vision). These\ntests incur the standard costs. If you share your vision with your\ncompanions before a test or conflict, your help is worth +2D rather\nthan the standard +1D for that turn.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        36,
        44
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Visions and Omens [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l2-16",
    "name": "Welcome in Every Hall",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You are well received everywhere and are\ngranted +1D to Orator when telling tales in the tavern or requesting\nhospitality.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        45,
        47
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Welcome Storyteller [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l2-17",
    "name": "Deep Mind",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Skalds know nearly everyone and a bit about everything.\nOnce per Player Phase, you may dig for leads, do research or search\nfor someone with a +1D bonus and without spending a check.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        48,
        50
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Skaldic Leads [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l2-18",
    "name": "Concealed Pocket",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You’ve learned how to secret items on your\nperson. You may conceal a small item or small\nweapon on the torso in addition to other inventory.\nIf someone tries to frisk you or pat you down,\ntest Scout or Criminal vs Scout to keep the item hidden.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        51,
        55
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Concealed Item [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l2-19",
    "name": "Improvisational",
    "minLevel": 2,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "A bit of wire, a sliver of metal, a shard of\nbone—you always have tools available for tests involving setting\nand disarming traps, escaping, picking locks and the like. If you\nalready have tools on hand, you may improvise supplies (+1D) for\nappropriate tests. No test is required for the\nimprovisation, and it never costs a check.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        56,
        61
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Improvised Tools [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l3-01",
    "name": "Second Breakfast",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You may eat an extra ration of food now to\nhedge against hunger later. This extra ration essentially counts as\narmor against one future hungry and thirsty condition. Note this\ncounts only when eating food, not drinking water, wine or whatever.\nIf you leave town fresh, you automatically begin the adventure phase\nwith a second breakfast in your belly.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 113,
      "class": "Burglar",
      "originalTitle": "Second Breakfast",
      "nameVerified": true,
      "suppliedLines": [
        63,
        68
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l3-02",
    "name": "Mathom",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When given a gift of gratitude, you may demonstrate\nsincere thanks to the giver and automatically recover from one of the\nfollowing conditions: hungry and thirsty, angry, afraid or exhausted.\nNo test or check is required, and recovery happens regardless of\nrecovery order. This benefit can be used once per person you know.\nGifts must be given in sincerity.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 113,
      "class": "Burglar",
      "originalTitle": "Mathom",
      "nameVerified": true,
      "suppliedLines": [
        69,
        74
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l3-03",
    "name": "Magic Object",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "One object in your possession is found to be imbued by the magic of the Eldar or the Ainur. You find this out by yours or someone else's wisdom or by accident. Work with your GM what this item is capable of, and what it curtails.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        75,
        75
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Awakened Heirloom [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l3-04",
    "name": "Bound Familiar",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your familiar emerges from the corner of your vision\nand adopts you as its own. You are bound together by fate. Your famil-\niar will act to guide and protect you and can understand simple com-\nmands and intentions, but it does not fully understand your language (unless\nyou communicate with them with a Lore Master roll)\nand thus may interpret your commands to suit its personality. To gain\ntheir help in a conflict, you must assign them a point of disposition.\n- Your familiar begins as a Might 1, Nature 2 animal with three\n  appropriate Nature descriptors.\n- At level 4, your familiar becomes Might 2, Nature 3.\n- At level 6, it becomes Might 3, Nature 4.\n- At level 8, it becomes Might 4, Nature 5.\n- At level 10, it becomes Might 4, Nature 6.\nFamiliar — Descriptors\nOwl — Ambushing, Flying, Listening\nMagpie — Mocking, Flying, Imitating\nSnake — Slithering, Striking, Hiding\nFox — Tricking, Learning, Stalking\nCat — Pouncing, Stalking, Climbing\nDog — Guarding, Working, Running",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 116,
      "class": "Magician",
      "originalTitle": "Bind Familiar",
      "nameVerified": true,
      "suppliedLines": [
        76,
        95
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Bind Familiar"
    ]
  },
  {
    "key": "legacy-supplied-l3-05",
    "name": "Hardy Stock",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You come from hardy stock. Add\n+1D to recover from the sick condition or to\nany tests to resist poison or drugs.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 119,
      "class": "Outcast",
      "originalTitle": "Hardy Stock",
      "nameVerified": true,
      "suppliedLines": [
        96,
        98
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l3-06",
    "name": "At Ease Below",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When below ground, you are granted\n+1D to detect deadfalls, pits, unstable\ntunnels, collapsing features, bad air, seams,\nrock quality, sloping passages and Dwarf-made\nstructures.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 119,
      "class": "Outcast",
      "originalTitle": "Miner",
      "nameVerified": true,
      "suppliedLines": [
        99,
        103
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Miner"
    ]
  },
  {
    "key": "legacy-supplied-l3-07",
    "name": "Remember the Ancient Forms",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You may use your Tradition\nNature when repairing or rebuilding an item or structure, related to the\nworks of the Dunedain.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 122,
      "class": "Ranger",
      "originalTitle": "Remember the Ancient Forms",
      "nameVerified": true,
      "suppliedLines": [
        104,
        106
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l3-08",
    "name": "Song of Soothing",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You may use your Singing or Fae Nature\nto perform ancient spells of healing. Use the Healer factors.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 122,
      "class": "Ranger",
      "originalTitle": "Song of Soothing",
      "nameVerified": true,
      "suppliedLines": [
        107,
        108
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l3-09",
    "name": "Hands of the Ainur",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "By laying hands on the sick or exhausted, you\ngrant the unfortunate soul a free recovery\ntest for the sick or exhausted conditions.\nThe power can be used once per Phase.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 125,
      "class": "Theurge",
      "originalTitle": "Vow to the Lords of Healing and Fire",
      "nameVerified": true,
      "suppliedLines": [
        109,
        112
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Vow to the Lords of Healing and Fire"
    ]
  },
  {
    "key": "legacy-supplied-l3-10",
    "name": "Cool Headed",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your veins are ice. When the game master assigns\nthe angry condition, you mark it but do not suffer the negative consequences\nunless you fail the recover from it. Then the rules apply per normal.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 129,
      "class": "Warrior",
      "originalTitle": "Cool Headed",
      "nameVerified": true,
      "suppliedLines": [
        113,
        115
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l3-11",
    "name": "Endurance",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You’ve suffered much hardship and it has given you a\ncertain toughness. Endurance grants +1D to recover from injury.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 129,
      "class": "Warrior",
      "originalTitle": "Endurance",
      "nameVerified": true,
      "suppliedLines": [
        116,
        117
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l3-12",
    "name": "Raging Hunger",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "If made hungry and thirsty, you\nmay choose to instead take the angry condition (if you are angry,\nyou may not make this switch). You may also vow to take on the\nsuffering of others—remove the hungry and thirsty condition from\nan ally and take the exhausted condition for yourself (so long as you\nare neither hungry and thirsty nor exhausted).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        118,
        123
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Vow of Burdens [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l3-13",
    "name": "Flyting",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When using the Manipulator skill in conflicts, you bear a\nspecial armor. Flyting absorbs 1 pt of damage per hit received, but\nroll 1d6 after each hit. The effect is lost for the remainder of the\nconflict on a 1-3 result. You are also granted the flyting weapon for\nconvince and convince crowd conflicts (+1s Feint). Flyting requires\nthat you deliver a searing insult.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        124,
        129
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Flyting Armor [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l3-14",
    "name": "Inspiring Counsel",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You can recite many a tale and saga. When\nproviding help to tests, that benefit from your vast knowledge of the past\nyou grant +2D of help instead of the standard +1D.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        130,
        132
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Tales and Sagas [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l3-15",
    "name": "Surprise Attack",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You fight without honor, seeking only to win. You\nare granted +1s to Feint in tight, dimly lit or claustrophobic fighting\n(or negotiating) conditions. Add this benefit to any weapon in play for the Feint.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        133,
        135
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Fight Without Honor [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l3-16",
    "name": "Pickpocket",
    "minLevel": 3,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You always have a ready source of cash during your\nvisits to town—due to certain involuntary donations to your purse.\nOnce per phase, you may make a free Criminal test to alleviate\none resident of some of their material burdens.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        136,
        139
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Involuntary Donations [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l4-01",
    "name": "Heartbeast",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You follow the bear, boar or wolf as your heartbeast.\nWhen you are angry, you gnaw at your shield and froth at the mouth\nin combat. You are granted +1D Attack and suffer -1s Defend in\nkill and drive off conflicts in addition to other weapon modifiers. If\nyou fail to damage your opponent with an Attack action, your team\nsuffers one point of damage. In your fury, you lash out, unable to tell\nfriend from foe. After a conflict in which you unleash your berserk\nfury, remove the angry condition and replace it with exhausted.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        141,
        148
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Heartbeast [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l4-02",
    "name": "Vow to the Mother of Beasts",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "By laying hands on the sick or\nafraid, you grant the unfortunate soul a free recovery test (for those\nconditions). This benefit may be used once per Player's Phase\nand must abide by the standard recovery rules.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        149,
        152
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Healing Hands [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l4-03",
    "name": "Master of Kennings",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You can play emotions as skillfully as you recite\npoetry. When you chant poetry in the Player's Phase, anyone listening is granted\n+1D to recover from angry, exhausted or afraid. The chanting does\nnot require a check.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        153,
        156
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Healing Poetry [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l4-04",
    "name": "Skaldic Reputation",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your fame is growing. You recieve a +1D to Circles tests to find helpful people in\nsettlements of your kin or their close allies. In addition, your skaldic reputation acts as a\nweapon (+1s Defend) in convince and convince crowd conflicts.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        157,
        159
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Growing Fame [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l4-05",
    "name": "Good Ear",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Take a moment to listen—you never know what you will\nhear. When listening at a portal, entryway, door or gate, this benefit\ngrants +1D to Scout. If the test is successful, you learn the number\nand type of opponents or hear odd and distinctive sounds ahead (if\nany). This benefit may be used once per adventure phase.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        160,
        164
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Listen at the Door [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l4-06",
    "name": "Unwavering Serenity",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When angry, you may use your Traits to your\nbenefit.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 113,
      "class": "Burglar",
      "originalTitle": "Plucky",
      "nameVerified": true,
      "suppliedLines": [
        165,
        166
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Plucky"
    ]
  },
  {
    "key": "legacy-supplied-l4-07",
    "name": "Oft-Overlooked",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Halflings are often overlooked by the other peoples\nof the world. If your group is captured, you will be left behind. If your\ncompanions are targeted, you will always be picked last. This goes\nfor finding work, too!",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 113,
      "class": "Burglar",
      "originalTitle": "Oft-Overlooked",
      "nameVerified": true,
      "suppliedLines": [
        167,
        170
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l4-08",
    "name": "Fence",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Every Player Phase you may make a Haggler check to sell items and turn them into coins or increase the value of an item by +1D by finding the right buyer.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        171,
        171
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Find the Right Buyer [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l4-09",
    "name": "Inner Light",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Once per Adventure Phase, you may summon to your hand a pure\nlight. The light may be transferred to a weapon or\nother appropriate item. The light cannot be doused\nby wind or weather. You may extinguish the light when you so desire.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 116,
      "class": "Magician",
      "originalTitle": "Mage Light",
      "nameVerified": true,
      "suppliedLines": [
        172,
        175
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Mage Light"
    ]
  },
  {
    "key": "legacy-supplied-l4-10",
    "name": "Inhuman Endurance",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Ignore exhausted, injured or sick for one\ntest or conflict per session. If you pass the test or win the conflict for which\nyou ignored the condition, the condition dissipates. Otherwise, it\nreemerges in addition to the twist or condition results from the failure.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 117,
      "class": "Magician",
      "originalTitle": "Inhuman Endurance",
      "nameVerified": true,
      "suppliedLines": [
        176,
        179
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l4-11",
    "name": "Greed",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You may invoke greed when you earn the angry condition\nand have a belief, goal or instinct about an object or person. Greed\ngrants a free test or conflict to purchase, steal, bargain or murder for\nthe item or person in question (but you cannot be helped unless your\ncompanions have Greed or an appropriate instinct). If you acquire\nthe object in question (or murder the person), you receive a free test\nto recover from angry or afraid in the next camp or town phase.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 120,
      "class": "Outcast",
      "originalTitle": "Greed",
      "nameVerified": true,
      "suppliedLines": [
        180,
        186
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l4-12",
    "name": "Stubborn",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You’re always last out of a fight. If your hit points are\ndepleted to zero but one of your teammates is still in the fight, instead\nincrease your hit points to 1 and deduct the remainder of the damage\nfrom another character of your choice. If there is another character\nwith this benefit, to see who goes out break the tie using this rubric:\nhigher level, higher Fighter skill, higher Nature, higher Might. If you’re\nthe same in all respects, you have a doppelgänger. Beware.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 120,
      "class": "Outcast",
      "originalTitle": "Stubborn",
      "nameVerified": true,
      "suppliedLines": [
        187,
        193
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l4-13",
    "name": "Fearless",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Some know no fear. When the game master assigns\nyou the afraid condition, you do not mark it and instead take another\ncondition of your choice. If all other conditions are marked, however,\nyou mark the afraid condition as normal.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 122,
      "class": "Ranger",
      "originalTitle": "Fearless",
      "nameVerified": true,
      "suppliedLines": [
        194,
        197
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l4-14",
    "name": "Athelas",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You have been taught powerful wards against disease and\npoison. You do not need to spend a check in camp or add to your\nlifestyle cost in town to make a test to recover from sickness.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 122,
      "class": "Ranger",
      "originalTitle": "Athelas",
      "nameVerified": true,
      "suppliedLines": [
        198,
        200
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l4-15",
    "name": "You Shall Not Pass",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "If made afraid, you may make an Ob 3 Will test to\nchannel your fear into anger. If successful, change the afraid condition\nto angry. This test does not inflict a twist or condition.\nYou may not engage this benefit if already angry.\nIf a spirit, corrupted or undead creature witnesses your transformation,\nthey must pass an Ob 3 Nature test or flee from your presence.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 126,
      "class": "Theurge",
      "originalTitle": "Feared in Hell",
      "nameVerified": true,
      "suppliedLines": [
        201,
        206
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Feared in Hell"
    ]
  },
  {
    "key": "legacy-supplied-l4-16",
    "name": "Duelist",
    "minLevel": 4,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When using a sword, between rounds you may reassign the\naction type (Attack, Defend, Feint or Maneuver) it benefits. Also,\na shield, dagger or hand axe carried in your off hand grants +1D\nto Defend against hand-to-hand weapons in addition to your main\nweapon’s quality for this conflict action.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 129,
      "class": "Warrior",
      "originalTitle": "Duelist",
      "nameVerified": true,
      "suppliedLines": [
        207,
        211
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-01",
    "name": "Vest Pockets",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You’ve learned how to stow a lot in a little space. Take\nthree additional torso inventory slots. These special slots can hold\nonly pack 1 items like potions, jewelry and daggers. What have you\ngot in your pockets?",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 114,
      "class": "Burglar",
      "originalTitle": "Vest Pockets",
      "nameVerified": true,
      "suppliedLines": [
        213,
        216
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-02",
    "name": "Clever",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Add +1 to your team’s disposition when you are embroiled in\nconflicts involving riddles, fleeing or sneaking. You do not have to\nlead the conflict to gain this benefit.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 114,
      "class": "Burglar",
      "originalTitle": "Clever",
      "nameVerified": true,
      "suppliedLines": [
        217,
        219
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-03",
    "name": "Master's Apprentice",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You have acquired an apprentice to aid you in your\ntasks. Your apprentice will stick by you and offers\nhelp on tests related the your four vocations (not Fighter, as well as Will and Health\ntests, but not Beginner’s Luck tests (because what can an apprentice\nteach a master?). Add +1D to your roll when your apprentice helps.\nTo gain their help in a conflict, you must assign them a point of\ndisposition. Your apprentice requires a portion of food and\nwater in each Adventure Phase.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 117,
      "class": "Magician",
      "originalTitle": "Apprentice",
      "nameVerified": true,
      "suppliedLines": [
        220,
        227
      ],
      "notes": [
        "Source has an unclosed parenthesis; original wording retained."
      ],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Apprentice"
    ]
  },
  {
    "key": "legacy-supplied-l5-04",
    "name": "Cousin",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your cousin forsakes your clan to come join you or ventures\nfrom the clan hold to try to convince you to return home. Your\ncousin remains at your side and helps you with the following skills\nskills: Fighter, Hunter, Armorer, Laborer, Orator and Scout.\nAdd +1D to your roll when your cousin helps. To gain their help in\na conflict, you must assign them a point of disposition. Your cousin\nrequires drink and a meal each Adventure Phase.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 120,
      "class": "Outcast",
      "originalTitle": "Cousin",
      "nameVerified": true,
      "suppliedLines": [
        228,
        234
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-05",
    "name": "Tinker",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You have a knack for the art of making and repairing things. Reduce by one the\nfactors for Building, Mending and Crafting in Jeweler, Armorer,\nStonemason and Carpenter skill. Minimum obstacle is 1.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 120,
      "class": "Outcast",
      "originalTitle": "Tinker",
      "nameVerified": true,
      "suppliedLines": [
        235,
        237
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-06",
    "name": "Burning Bright",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Reveal thine terrifying true inner spirit. Once per\nsession, use Singing or Enchanting Nature to instill fear in your\nopponents. To set the obstacle, total the Might of the creatures the\nelf wishes to target up to a total value equal to Might plus one.\nIf the elf passes the test, their targets are made afraid and must\nretreat or cower before them. If they wish to affect a conflict, use this\nbenefit before rolling for disposition.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 122,
      "class": "Ranger",
      "originalTitle": "Burning Bright",
      "nameVerified": true,
      "suppliedLines": [
        238,
        244
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-07",
    "name": "Master of Dreams",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You may use your Singing or Enchanting Nature\nto weave a soothing somnific strain and put all who hear it into a\ndeep slumber. To set the obstacle, total the Might of the creatures\nthe ranger wishes to target. They can target a total value equal\nto twice their Might—but cannot affect any target whose Might is\ngreater than their own. Success indicates the victims fall into a deep\nsleep to be awakened only after some hours of rest or if shaken\nviolently. This test may not be\ndone while fighting or in other chaotic circumstances. It must be\nperformed quietly or from a secret place from which the victim can\nhear the soft strains of the song.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 122,
      "class": "Ranger",
      "originalTitle": "Master of Dreams",
      "nameVerified": true,
      "suppliedLines": [
        245,
        255
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-08",
    "name": "Mythical Mount",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your are granted a mount\nand companion of immense power. Choose an appropriate form:\nwarhorse, reindeer, great wolf or great boar. Your mount has a\nNature 6 and Might 4. The creature’s Nature/Might will increase to\n7/5 at 8th level.\nIncarnation Nature Descriptors\n. Warhorse (Fighting, Herding, Pursuing)\n. Reindeer (Charging, Sprinting, Hauling)\n. Great Wolf (Hunting, Scavenging, Howling)\n. Great Boar (Goring, Digging, Intimidating)\nMount Rules\n. The creature will aid you in tests related to its Nature descriptors.\n. The mount is considered trained for war and riding.\n. The mount reduces the factor for a test in a long journey by -1\nand gives you +1 disposition in a Journey Conflict.\n. Should you ever be left for dead, or otherwise incapacitated,\nthe creature will return you to your home.\n. To gain its help in a conflict, you must grant your Mythical Mount\na point of disposition.\n. It can carry a few items for you if outfitted with a harness.\n. It does not require food from you.\n. It will not follow you into places it doesn't belong. Though it will\nawait your return at the entrance or on the shore.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 126,
      "class": "Theurge",
      "originalTitle": "Immortal Incarnation",
      "nameVerified": true,
      "suppliedLines": [
        256,
        278
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Immortal Incarnation"
    ]
  },
  {
    "key": "legacy-supplied-l5-09",
    "name": "Squire",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "A hopeful young warrior-in-training swears their service to\nyou. Your squire stands by you and help you with Fighter, Hunter,\nMilitarist, Rider and Instructor tests. Add +1D to your roll when\nyour squire helps. To gain their help in a conflict, you must assign\nthem a point of disposition. Your squire also requires one portion of\nfood and drink during the Adventure Phase.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 130,
      "class": "Warrior",
      "originalTitle": "Squire",
      "nameVerified": true,
      "suppliedLines": [
        279,
        284
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-10",
    "name": "Agile",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "In fights and battles, your help grants +2D instead of the\nstandard +1D.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 130,
      "class": "Warrior",
      "originalTitle": "Agile",
      "nameVerified": true,
      "suppliedLines": [
        285,
        286
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l5-11",
    "name": "Armor of Fury",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your aura shields you from harm. When angry, you\ngain the equivalent of plate armor against iron, fire or magic used\nagainst you for one conflict per session.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        287,
        289
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Aura of Anger [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l5-12",
    "name": "Admirer",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your fame attracts an ardent admirer.\n- Your admirer will announce your arrival and clean your boots.\n- They help with the Orator, Manipulator, Fighter, Lore Master and\n  Administrator skills during your travels.\n  Add +1D to your roll when\n  your apprentice is helping. To gain their help in a conflict, you\n  must assign them a point of disposition.\n- Your admirer requires one portion of wine and food every Adventure Phase.\n  (water just doesn’t sweeten the voice like wine). Without wine, they just don’t think clearly.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        290,
        298
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Ardent Admirer [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l5-13",
    "name": "Honored Guest",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "As your reputation as a poet grows, not only\nare you welcome in every hall, but so is your retinue. When you\nsuccessfully tell tales, sing, or perform in a settlement,\nand exceed your obstacle, this town\nacts as a temporary hometown (+1D advantage to Resources and\nCircles) for you and one other character who you designate. The\nhometown status lasts for Player's Phase. It can be reacquired in\nfuture visits to this town provided the above conditions are met.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        299,
        306
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Welcome Retinue [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l5-14",
    "name": "Mechanic",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You have a knack for mechanical things. This benefit\ngrants +1D when setting or disarming traps,\nunlocking things, tampering with machinery or the like.\nAlso, once per adventure phase you may check for traps without making a test.\nWhen using this benefit, you may be helped only by other\ncharacters with appropriate Nature descriptors or instincts.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        307,
        312
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "Mechanical Knack [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l5-15",
    "name": "Friends in Low Places",
    "minLevel": 5,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You know a guy. This benefit grants +1D\nto Circles for finding thieves, beggars, criminals and adventurers.\nIn addition, if ever accosted in town by a thief, bill collector, thug\nor leg-breaker, you may make a Circles test at +1 Ob to determine\nif you know them and are on good terms with them.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": null,
      "class": "",
      "originalTitle": null,
      "nameVerified": false,
      "suppliedLines": [
        313,
        317
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": [
      "I Know a Guy [working title]"
    ]
  },
  {
    "key": "legacy-supplied-l6-01",
    "name": "Righteous Fury (Theurge · Short variant)",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "If angry and contesting with the forces of darkness,\n+1s to all actions in conflicts.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 127,
      "class": "Theurge",
      "originalTitle": "Righteous Fury",
      "nameVerified": true,
      "suppliedLines": [
        319,
        320
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-02",
    "name": "Companion",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "One of your friends hears of your exploits and defies\nthe conservative conventions of the Shire to come join you in the\nlife on the road—or journeys out to convince you to come to your\nsenses and come home. Your companion will stick by you and help\nyou with your default class skills (Cook, Criminal, Fighter, Hunter,\nScout and Scavenger). Add +1D to your roll when your companion\nhelps. To gain their help in a conflict, you must assign them a point\nof disposition. Your companion also has three available inventory\nslots and requires a portion of food and water in camp.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 114,
      "class": "Burglar",
      "originalTitle": "Companion",
      "nameVerified": true,
      "suppliedLines": [
        321,
        329
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-03",
    "name": "Helpful",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When acting in service of your goal, you grant +2D when\nyou help instead of the standard +1D.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 114,
      "class": "Burglar",
      "originalTitle": "Helpful",
      "nameVerified": true,
      "suppliedLines": [
        330,
        331
      ],
      "notes": [
        "Duplicate supplied Helpful entry merged."
      ],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-05",
    "name": "Magister",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "If helping another magician with arcana, enchanting, lore\nor scholarship, you provide +2D when you help instead of +1D.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 117,
      "class": "Magician",
      "originalTitle": "Magister",
      "nameVerified": true,
      "suppliedLines": [
        334,
        335
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-06",
    "name": "Unbridled Power",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When casting spells like Swarm, Balefire or\nHammer of Heaven, you are granted +1s. However, such power\ncannot be easily contained. If you fail the test to cast or fail a versus\ntest, you are temporarily afflicted with one of the following:\n- Skin or hair changes color for the remainder of the phase.\n- Eyes crackle with energy. Receive a shock every time you\n  touch something for 1d6 turns.\n- Your shadow goes on walkabout.\n- 4 Milk curdles and fresh rations rot in your presence.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 117,
      "class": "Magician",
      "originalTitle": "Unbridled Power",
      "nameVerified": true,
      "suppliedLines": [
        336,
        344
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-07",
    "name": "Great Endurance",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Hunger and thirst have\nlittle effect on you. You do not suffer the\n-1 disposition penalty for the hungry\nand thirsty condition. In addition, you\ncannot be made exhausted as the result\nof a failed test or through the grind.\nYou can be given the condition by an\ninvocation, spell or curse.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 120,
      "class": "Outcast",
      "originalTitle": "Great Endurance",
      "nameVerified": true,
      "suppliedLines": [
        345,
        352
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-08",
    "name": "Secret Destiny",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "In your next haul of loot, you find a dwarven or elven\nartifact of rare beauty and strength that was destined for your hands.\n- An incomparable weapon that grants +1D to Fighter in addition\n  to the weapon’s standard abilities and grants a wise related to a\n  people, creature or monster.\n- An unbreakable chain hauberk that is damaged only on a roll\n  of a 1 and causes no weariness penalty (and can be repaired\n  if broken).\n- A priceless jewel that grants +1s to Haggler, +1s to disposition\n  for convince conflicts about treasure and is worth 15D of cash\n  if traded at the market. The gem is worn/neck or worn/hand 1.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "Secret Destiny",
      "nameVerified": true,
      "suppliedLines": [
        353,
        363
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-09",
    "name": "Prescience",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "The past becomes the future. Once per phase in a kill,\ncapture, drive off or battle conflict, you may swap out one of your\nunrevealed actions for a different action. You may do so at any point\nin the round before the opponent has revealed their opposing action.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 123,
      "class": "Ranger",
      "originalTitle": "Prescience",
      "nameVerified": true,
      "suppliedLines": [
        364,
        367
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-10",
    "name": "Grief",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "The toll of an immortal life manifests itself as a deep well of\ngrief within the elf. Use your level as the base disposition (instead\nof your Will or Health rating) when engaged in conflicts involving\ntragedy, loss or grief. In addition, if you write a belief or goal\nregarding tragedy, loss or grief, all tests in service of assuaging your\ngrieving heart are considered to be within your Nature—even if your\nbroken heart pushes you beyond the bounds of reason.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 123,
      "class": "Ranger",
      "originalTitle": "Grief",
      "nameVerified": true,
      "suppliedLines": [
        368,
        374
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-11",
    "name": "Righteous Fury (Theurge · Full variant)",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When angry and contesting with the forces of\ndarkness and chaos, you are granted +1s to Attack and Feint in\nconflicts. In addition, your anger acts as inspiration for others. When\nyou are made angry, any characters who are in your presence and\nafraid (or who would be made afraid by the same test) may test to\nrecover immediately. This does not cost a turn and may be done in\nany phase, but must abide by the standard recovery order rules.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 127,
      "class": "Theurge",
      "originalTitle": "Righteous Fury",
      "nameVerified": true,
      "suppliedLines": [
        375,
        381
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-12",
    "name": "Increate",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "The imprimatur of the Immortals resonates through you.\nIncrease your Precedence by 1. Add +1 to camp events rolls in ruins\nand near town. And add +1 to town events rolls for settlements\nallied with you and subtract -1 for those opposed to you. Allied and\nopposed towns include:\n- Towns in which you hold a holy office in good standing at a\n  well regarded temple\n- Towns in which your parent, friend or mentor in high ranking\n  position at a temple, guild or in leadership.\n- Towns in which a cult has formed around you.\n- Towns opposed to you include those who denounce your\n  temple or cult or from which you have been banned or exiled.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 127,
      "class": "Theurge",
      "originalTitle": "Increate",
      "nameVerified": true,
      "suppliedLines": [
        382,
        393
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-13",
    "name": "Shrug It Off (Warrior)",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You have suffered many slings and arrows and are\nnumb to the mortal coil. Once per adventure, you may remove the\ninjured condition. No roll is necessary. You can do this any time\nbefore you seek help from a healer. However, once you get help\nfrom a healer, you must abide by the standard rules for that injury.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 130,
      "class": "Warrior",
      "originalTitle": "Shrug It Off",
      "nameVerified": true,
      "suppliedLines": [
        394,
        398
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l6-14",
    "name": "War Captain (Warrior · L6)",
    "minLevel": 6,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When acting as a hero in an ambush, skirmish or\nbattle, and leading from the front, you double your hero bonus to\n+2s for Attack actions.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 130,
      "class": "Warrior",
      "originalTitle": "War Captain",
      "nameVerified": true,
      "suppliedLines": [
        399,
        401
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-01",
    "name": "Focus",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your steely focus is legendary. Choose one action type:\nAttack, Defend, Feint or Maneuver. For kill, drive off, ambush,\nskirmish and battle conflicts, you gain +1s to that action type. The\nfocus benefit combines with other bonuses from weapons, spells,\ninvocations, armor, etc.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 130,
      "class": "Warrior",
      "originalTitle": "Focus",
      "nameVerified": true,
      "suppliedLines": [
        403,
        407
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-02",
    "name": "Expert",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your rating cap for Fighter, Commander or\nStrategist from 6 to 7. Choose two. You may advance these ratings\nto 7 with six passed tests and five failed tests.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 130,
      "class": "Warrior",
      "originalTitle": "Expert",
      "nameVerified": true,
      "suppliedLines": [
        408,
        410
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-03",
    "name": "Demonslayer",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your Might by one when contesting with\nspirit, demon or undead type creatures.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 127,
      "class": "Theurge",
      "originalTitle": "Demonslayer",
      "nameVerified": true,
      "suppliedLines": [
        411,
        412
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-04",
    "name": "Elven Steed",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You are adopted by a loyal elven steed with Nature 7\nand the descriptors of Galloping, Guiding and Defending.\n- She has the weapons: Sleek form: +1D Maneuver in kill,\n  capture, drive off, flee and pursue conflicts; and Sharp hooves:\n  +1s Attack in drive off conflicts.\n- She is trained for war and riding as per the Rider rules.\n- She is Might 4, but she also has a special quality that increases\n  her rider’s Might by 1 in kill, capture, drive off and flee/pursue\n  conflicts if her rider’s Might is equal to or greater than hers.\n- When in the wild, you may summon your steed with an Ob 3\n  Singing Nature test. This test costs a turn.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 123,
      "class": "Ranger",
      "originalTitle": "Elven Steed",
      "nameVerified": true,
      "suppliedLines": [
        413,
        423
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-05",
    "name": "Shrug It Off (Ranger)",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Pain means little to you. You may remove the injured\ncondition once per adventure. No roll is necessary. You can do this\nany time before you seek help from a healer. However, once you get\nhelp from a healer for an injury, you must abide by the regular rules\nfor that injury.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 123,
      "class": "Ranger",
      "originalTitle": "Shrug It Off",
      "nameVerified": true,
      "suppliedLines": [
        424,
        428
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-06",
    "name": "Troll Slayer",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your Might by one when fighting troll type\nopponents. Combine this bonus with other bonuses from spells,\ninvocations and magic weapons.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "Troll Slayer",
      "nameVerified": true,
      "suppliedLines": [
        429,
        431
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-07",
    "name": "War Captain (Outcast · L7)",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When acting as a hero in an ambush, skirmish or\nbattle, and leading from the front, you double your hero bonus\nto +2s for Attack actions.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "War Captain",
      "nameVerified": true,
      "suppliedLines": [
        432,
        434
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-08",
    "name": "True Nature Unfolds",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your Might by one.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 117,
      "class": "Magician",
      "originalTitle": "True Nature Unfolds",
      "nameVerified": true,
      "suppliedLines": [
        435,
        435
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-09",
    "name": "It Could Be Worse",
    "minLevel": 7,
    "frequency": "session",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You may make one test per session as if you\nhave no conditions (barring dead). This test does not cost a turn or a\ncheck. You may be helped by your companion (as in the L6 benefit)\nor other halflings but no others.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 114,
      "class": "Burglar",
      "originalTitle": "It Could Be Worse",
      "nameVerified": true,
      "suppliedLines": [
        436,
        439
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l7-10",
    "name": "Shoulder the Burden",
    "minLevel": 7,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You are a boon to your friends. During the\nadventure phase, if one of your friends suffers a condition, you may\ntake that condition on yourself so that they are spared. If you already\nsuffer from this condition, you cannot take it on for your friend.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 114,
      "class": "Burglar",
      "originalTitle": "Shoulder the Burden",
      "nameVerified": true,
      "suppliedLines": [
        440,
        443
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-01",
    "name": "Supreme Confidence",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Use your level instead of your Will or Nature\nrating as the base for disposition for conflicts involving riddling,\nsneaking and fleeing.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 114,
      "class": "Burglar",
      "originalTitle": "Supreme Confidence",
      "nameVerified": true,
      "suppliedLines": [
        445,
        447
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-02",
    "name": "Friend of the Powerful",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Halflings have a knack for charming the\npowerful. Upon meeting a neutral or allied potentate, if you put on\ncharming or respectful airs, you may note the NPC as a friend on\nyour character sheet. No roll or test is required. This may be done in\nany phase and does not cost a turn or a check.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 114,
      "class": "Burglar",
      "originalTitle": "Friend of the Powerful",
      "nameVerified": true,
      "suppliedLines": [
        448,
        452
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-03",
    "name": "Master",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your rating cap for Arcanist, Lore Master, Alchemist\nor Scholar from 6 to 7. You may advance the chosen skill to rating 7\nwith six passed tests and five failed tests.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 118,
      "class": "Magician",
      "originalTitle": "Master",
      "nameVerified": true,
      "suppliedLines": [
        453,
        455
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-04",
    "name": "Transformed (Magician)",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Change one Nature descriptor to Creating, Destroying\nor Preserving. You may use this benefit to replace a lost Nature\ndescriptor.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 118,
      "class": "Magician",
      "originalTitle": "Transformed",
      "nameVerified": true,
      "suppliedLines": [
        456,
        458
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-05",
    "name": "Make Light of Heavy Burdens",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your rating cap for Health\nfrom 6 to 7. You may advance Health to rating 7 with six passed and\nfive failed tests.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "Make Light of Heavy Burdens",
      "nameVerified": true,
      "suppliedLines": [
        459,
        461
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-06",
    "name": "Strength",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Use your level instead of your Will or Health rating as the\nbase for disposition for kill, capture and drive off conflicts.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "Strength",
      "nameVerified": true,
      "suppliedLines": [
        462,
        463
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-07",
    "name": "Sons and Daughters of Arda",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your Might by one. Increase\nyour Might by an additional one when using grief (the level 6 benefit).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 124,
      "class": "Ranger",
      "originalTitle": "Sons and Daughters of Arda",
      "nameVerified": true,
      "suppliedLines": [
        464,
        465
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-08",
    "name": "Transformed (Ranger)",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Change one Nature descriptor to Avenging, Perceiving\nor Judging. You may use this level benefit to replace a lost Nature\ndescriptor.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 124,
      "class": "Ranger",
      "originalTitle": "Transformed",
      "nameVerified": true,
      "suppliedLines": [
        466,
        468
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-09",
    "name": "Immortal Armor",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Absorb one point of damage from spells,\ninvocations, demons, spirits and undead (even when not targeted\ndirectly). In addition, demons, spirits and the undead suffer -1s to all\nactions directed against you. You may combine this benefit with\nother bonuses conferred by spells, invocations and magical armor.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 127,
      "class": "Theurge",
      "originalTitle": "Immortal Armor",
      "nameVerified": true,
      "suppliedLines": [
        469,
        473
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-10",
    "name": "Vow to the Lady of Battle",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your rating cap for Fighter,\nCommander, Ritualist or Theologian from 6 to 7. You may advance\nthe chosen skill to rating 7 with six passed tests and five failed tests.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 128,
      "class": "Theurge",
      "originalTitle": "Vow to the Lady of Battle",
      "nameVerified": true,
      "suppliedLines": [
        474,
        476
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-11",
    "name": "Giant Slayer",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your Might by one when you are the conflict\ncaptain. Combine this bonus with other bonuses from spells,\ninvocations and magical items.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 130,
      "class": "Warrior",
      "originalTitle": "Giant Slayer",
      "nameVerified": true,
      "suppliedLines": [
        477,
        479
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l8-12",
    "name": "Veteran",
    "minLevel": 8,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your experience makes you a wily opponent. Use your level\ninstead of your Will or Health rating as your base disposition for kill,\ncapture and drive off conflicts.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 130,
      "class": "Warrior",
      "originalTitle": "Veteran",
      "nameVerified": true,
      "suppliedLines": [
        480,
        482
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-01",
    "name": "Heroic Ability (Warrior)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Choose Fighter, Health, Commander or Survivalist.\nThe chosen ability or skill becomes “heroic.” When rolling the heroic\nability or skill, a 3-6 indicates success (rather than the standard 4-6).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 131,
      "class": "Warrior",
      "originalTitle": "Heroic Ability",
      "nameVerified": true,
      "suppliedLines": [
        484,
        486
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-02",
    "name": "Transformed (Warrior)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Change one Nature descriptor to Fighting, Drinking or\nLooting. You may use this benefit to replace a lost Nature descriptor.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 131,
      "class": "Warrior",
      "originalTitle": "Transformed",
      "nameVerified": true,
      "suppliedLines": [
        487,
        488
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-03",
    "name": "Heroic Ability (Theurge)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Choose Commander, Fighter, Ritualist or\nTheologian. The chosen skill becomes “heroic.” When rolling this\nskill, 3-6 indicates a success (rather than the standard 4-6).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 128,
      "class": "Theurge",
      "originalTitle": "Heroic Ability",
      "nameVerified": true,
      "suppliedLines": [
        489,
        491
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-04",
    "name": "Transformed (Theurge)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Change a Nature descriptor to one of the following:\nQuesting, Judging or Slaying. You may use this benefit to replace\na lost Nature descriptor.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 128,
      "class": "Theurge",
      "originalTitle": "Transformed",
      "nameVerified": true,
      "suppliedLines": [
        492,
        494
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-05",
    "name": "Heroic Ability (Ranger)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Choose Scout, Nature, Health or Survivalist. The\nchosen skill or ability becomes “heroic.” When rolling this skill or\nability, 3-6 indicates a success (rather than the standard 4-6).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 124,
      "class": "Ranger",
      "originalTitle": "Heroic Ability",
      "nameVerified": true,
      "suppliedLines": [
        495,
        497
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-06",
    "name": "Voice of Ages",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Speak with the chthonic spirits of rock, tree, stream\nand field. You may ask a spirit’s name and provenance; you may\nask what it contains or once held; and you may ask it to perform\na service—guide your path, open the way, provide water, hinder\nopponents, etc. Test your Will versus the spirit’s Nature:\n- Stone — Nature 3\n- Tree — Nature 4\n- Stream or cave — Nature 5\n- Pond — Nature 6\n- Hill — Nature 7\n- River — Nature 8",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 124,
      "class": "Ranger",
      "originalTitle": "Voice of Ages",
      "nameVerified": true,
      "suppliedLines": [
        498,
        508
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-07",
    "name": "Heroic Ability (Outcast)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Choose Fighter, Health, Orator or Armorer. The\nchosen skill or ability becomes “heroic.” When rolling, 3-6 indicates\na success (rather than the standard 4-6).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "Heroic Ability",
      "nameVerified": true,
      "suppliedLines": [
        509,
        511
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-08",
    "name": "Transformed (Outcast)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Change one Nature descriptor to Hoarding, Boasting or\nRuling. You may use this benefit to replace a lost Nature descriptor.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "Transformed",
      "nameVerified": true,
      "suppliedLines": [
        512,
        513
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-09",
    "name": "Heroic Ability (Magician)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Choose Arcanist, Lore Master, Alchemist, Enchanter,\nScholar or Will. The chosen skill or ability becomes “heroic.” When\nrolling, 3-6 indicates a success (rather than the standard 4-6).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 118,
      "class": "Magician",
      "originalTitle": "Heroic Ability",
      "nameVerified": true,
      "suppliedLines": [
        514,
        516
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-10",
    "name": "Heroic Ability (Burglar)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Choose Will, Scout or Cook. The chosen ability or\nskill becomes “heroic.” When rolling, 3-6 indicates a success (rather\nthan the standard 4-6).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 115,
      "class": "Burglar",
      "originalTitle": "Heroic Ability",
      "nameVerified": true,
      "suppliedLines": [
        517,
        519
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l9-11",
    "name": "Transformed (Burglar)",
    "minLevel": 9,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Change one Nature descriptor to Cooking, Eating\nor Adventuring. You may use this benefit to replace a lost Nature\ndescriptor.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 115,
      "class": "Burglar",
      "originalTitle": "Transformed",
      "nameVerified": true,
      "suppliedLines": [
        520,
        522
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-01",
    "name": "Stalwart",
    "minLevel": 10,
    "frequency": "session",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When helping another character and they fail the test, you\nmay invoke this benefit. Instead of the standard failure procedure,\nthe result becomes a twist dictating that you step in and make the\ntest yourself. No other twist or condition is given until after you have\nmade your test. Your friend cannot help, but your success or failure\ncounts for both of you. You may use this benefit once per session.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 115,
      "class": "Burglar",
      "originalTitle": "Stalwart",
      "nameVerified": true,
      "suppliedLines": [
        524,
        529
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-02",
    "name": "Humble Home",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You return home to find you have inherited a fine\nhome from a long-forgotten distant relative. The home is located\nin your hometown and is equivalent to an inn. This turn of events\nmakes you somewhat of a respectable person. Increase Precedence\nby 1. In addition, increase your hometown Resources bonus and\nyour reputation Circles bonus to +2D.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 115,
      "class": "Burglar",
      "originalTitle": "Humble Home",
      "nameVerified": true,
      "suppliedLines": [
        530,
        535
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-03",
    "name": "Ageless",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Suffused with aetherial magic, you age imperceptibly and\nfor all intents will never die from old age. In addition, the magic\nsustains you through trials that would fell another being. You\naccumulate conditions and their effects but cannot die from the\ngrind. Poisons have no bite upon your dweomer-decayed form and\nmay be consumed with impunity.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 118,
      "class": "Magician",
      "originalTitle": "Ageless",
      "nameVerified": true,
      "suppliedLines": [
        536,
        541
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-04",
    "name": "The Lawbreaker",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You may instill life into inanimate matter, be\nit once living or forever dead. Choose a target to animate and\ntest Arcanist. Meeting the obstacle animates it with one Nature\ndescriptor. Spend margin of success to animate additional creations\n(up to a maximum equal to your Will) or to add additional Nature\ndescriptors. Once animated, the creation will follow your orders,\nthough each of its actions costs a turn.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 118,
      "class": "Magician",
      "originalTitle": "The Lawbreaker",
      "nameVerified": true,
      "suppliedLines": [
        542,
        548
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-05",
    "name": "Made of Sterner Stuff",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Increase your Might by one.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "Made of Sterner Stuff",
      "nameVerified": true,
      "suppliedLines": [
        549,
        549
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-06",
    "name": "The Madness Within",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When using greed (as in the level 4 benefit),\nall tests count as if they are within your Nature. Also, you may take a\nsecond free test to satisfy your greed.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 121,
      "class": "Outcast",
      "originalTitle": "The Madness Within",
      "nameVerified": true,
      "suppliedLines": [
        550,
        552
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-07",
    "name": "Maze of Mists and Shadows",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "You know a powerful spell song that\nweaves a fence of mists and shadows around a patch of land, forest\nor even a city. Casting this spell song requires an Ob 4 Nature test\nduring the town phase. You see all who enter the maze of mists and\nshadows. Once alerted to the presence of an interloper, you may\ngrant them permission to pass through the mists without incident\nor you may force them to test: To pass through the concealed area,\na creature or character must succeed at a Nature test against an\nobstacle equal to your max Nature rating. Failure indicates they’ve\nbeen led astray—or can enter but with the exhausted or afraid\ncondition (your choice). Characters or creatures with a Might greater\nthan yours may pass through the Maze of Mists and Shadows against\nyour will without being affected by it. This forced entry breaks the\nenchantment.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 124,
      "class": "Ranger",
      "originalTitle": "Maze of Mists and Shadows",
      "nameVerified": true,
      "suppliedLines": [
        553,
        566
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-08",
    "name": "Dream Vision",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Summoning the pure spirit of your true nature, you\ncan see impossible distances, hidden auras, truth behind lies or even\nproject a vision into the mind of another. Test your Will against the\nappropriate:\n\nImmortal Vision Factors\n- See impossible distances (2)\n- See an aura (3)\n- Detect truth and lies (4)\n- See a future event (5)\n\nIn Dreams Factors\n- Remembering an event experienced by another (2)\n- Recovering from all conditions (4)\n- Retrieving a lost object (4)\n- Breaking a curse (5)",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 125,
      "class": "Ranger",
      "originalTitle": "Dream Vision",
      "nameVerified": true,
      "suppliedLines": [
        567,
        570
      ],
      "notes": [
        "Missing factor lists restored from Handbook p125."
      ],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-09",
    "name": "Cult",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your deeds rise to the level of legend. A cult forms around your\nliving, holy works. Increase your Precedence by one. Found a temple\nto your cult in a settlement of your choice and add it as a location to\nthat town. Roll on the guild table to determine its founding members.\nThe temple acts as a home for you and your followers. When you\nvisit your temple, you may recruit 2d6 cultists to accompany you.\nYou may also use your Circles ability to add members to your cult.\nTake a +1D Circles bonus when using the ability within your cult.\nCult members will undertake independent action for you or follow\nyou, carrying your entire inventory. Cultists must be fed. Cultists\ncome with gear appropriate to their guild or, if found with Circles,\nas appropriate to their class or station. In combat, cultists act as\nminions. If they are assigned hit points, you may use the Boss Monster\nrule for yourself (see the Denizens chapter of the Scholar’s Guide).",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 128,
      "class": "Theurge",
      "originalTitle": "Cult",
      "nameVerified": true,
      "suppliedLines": [
        571,
        584
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-10",
    "name": "Holy Avenger",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Your weapon becomes imbued with your power and\nfury. Name your weapon and, so long as you wield it, it grants +1D\nto all Fighter and Orator tests and increases your Might by one.\nSo long as you carry the holy avenger, you cannot be made afraid.\nUpon your death, if the weapon is interred with you (and left for a\nsuitable period), it retains its magic. It can only be wielded by a group\nyou designate—requiring a certain Nature descriptor, trait, belief or\ncreed of your choice. If grasped by any other, the holy avenger burns\ntheir hand, injuring them and forcing them to drop the weapon.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 128,
      "class": "Theurge",
      "originalTitle": "Holy Avenger",
      "nameVerified": true,
      "suppliedLines": [
        585,
        593
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-11",
    "name": "Presence",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "When you’re in a kill, drive off or battle conflict, your side\ngets +2 to disposition in addition to whatever is rolled. You do not\nneed to lead the conflict.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 131,
      "class": "Warrior",
      "originalTitle": "Presence",
      "nameVerified": true,
      "suppliedLines": [
        594,
        596
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  },
  {
    "key": "legacy-supplied-l10-12",
    "name": "Fame and Glory",
    "minLevel": 10,
    "frequency": "passive",
    "linkType": "general",
    "linkedSkill": "",
    "linkedAbility": "",
    "effectMode": "manual",
    "diceBonus": 0,
    "description": "Tales of your deeds resound throughout the lands.\nIncrease your Precedence by 1. Your Circles becomes heroic when\nlooking for warriors and persons of quality to add to your retinue\n(when rolling, 3-6 indicates success rather than the standard 4-6). In\naddition, 2d3×10 soldiers flock to your banner, eager to act as your\nhonor guard and share in your glory. Their ranks swell during each\nrespite. Roll 1d6. On a 4-6, 10 more soldiers join your cause.",
    "source": {
      "document": "Dungeoneer’s Handbook",
      "page": 131,
      "class": "Warrior",
      "originalTitle": "Fame and Glory",
      "nameVerified": true,
      "suppliedLines": [
        597,
        603
      ],
      "notes": [],
      "nameApproved": true,
      "approvedBy": "User / Fire, 2026-11-12"
    },
    "previousNames": []
  }
].map(t => Object.freeze(t)));
