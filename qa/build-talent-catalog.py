"""Reviewed matching manifest. Inputs are local extractions; never changes the source PDF."""
import json,collections
from pathlib import Path
base=Path('output/talent-import')
records=json.loads((base/'supplied-effects.json').read_text(encoding='utf8'))['records']
book=json.loads((base/'book-benefits.json').read_text(encoding='utf8'))
# Original titles selected by reading the benefit, not by fuzzy score alone.
# '?' labels are editorial working titles, explicitly unverified in the product.
names={
2:['Soft Step','Abstemious','Gifted','?Searing Verse','Needful Things','Hauberk','Shrewd','Born Under Silver Stars','Essence of the Earth','?Path of War','Vow to the Lords of Justice','Brawler','Skirmisher','?Battle Fury','?Visions and Omens','?Welcome Storyteller','?Skaldic Leads','?Concealed Item','?Improvised Tools'],
3:['Second Breakfast','Mathom','?Awakened Heirloom','Bind Familiar','Hardy Stock','Miner','Remember the Ancient Forms','Song of Soothing','Vow to the Lords of Healing and Fire','Cool Headed','Endurance','?Vow of Burdens','?Flyting Armor','?Tales and Sagas','?Fight Without Honor','?Involuntary Donations'],
4:['?Heartbeast','?Healing Hands','?Healing Poetry','?Growing Fame','?Listen at the Door','Plucky','Oft-Overlooked','?Find the Right Buyer','Mage Light','Inhuman Endurance','Greed','Stubborn','Fearless','Athelas','Feared in Hell','Duelist'],
5:['Vest Pockets','Clever','Apprentice','Cousin','Tinker','Burning Bright','Master of Dreams','Immortal Incarnation','Squire','Agile','?Aura of Anger','?Ardent Admirer','?Welcome Retinue','?Mechanical Knack','?I Know a Guy'],
6:['Righteous Fury','Companion','Helpful','Helpful','Magister','Unbridled Power','Great Endurance','Secret Destiny','Prescience','Grief','Righteous Fury','Increate','Shrug It Off','War Captain'],
7:['Focus','Expert','Demonslayer','Elven Steed','Shrug It Off','Troll Slayer','War Captain','True Nature Unfolds','It Could Be Worse','Shoulder the Burden'],
8:['Supreme Confidence','Friend of the Powerful','Master','Transformed','Make Light of Heavy Burdens','Strength','Sons and Daughters of Arda','Transformed','Immortal Armor','Vow to the Lady of Battle','Giant Slayer','Veteran'],
9:['Heroic Ability','Transformed','Heroic Ability','Transformed','Heroic Ability','Voice of Ages','Heroic Ability','Transformed','Heroic Ability','Heroic Ability','Transformed'],
10:['Stalwart','Humble Home','Ageless','The Lawbreaker','Made of Sterner Stuff','The Madness Within','Maze of Mists and Shadows','Dream Vision','Cult','Holy Avenger','Presence','Fame and Glory']}
classes={(6,13):'Warrior',(6,14):'Warrior',(7,5):'Ranger',(7,7):'Outcast',(8,4):'Magician',(8,8):'Ranger',(9,1):'Warrior',(9,2):'Warrior',(9,3):'Theurge',(9,4):'Theurge',(9,5):'Ranger',(9,7):'Outcast',(9,8):'Outcast',(9,9):'Magician',(9,10):'Burglar',(9,11):'Burglar'}
catalog=[]
for rec in records:
 if rec.get('duplicateOf'):continue
 _,lev,num=rec['key'].rsplit('-',2);level=int(lev[1:]);index=int(num)
 title=names[level][index-1];pending=title.startswith('?');title=title.lstrip('?')
 candidates=[b for b in book if b['name']==title and (b['level']==level or title=='War Captain')]
 if (level,index) in classes:candidates=[b for b in candidates if b['class']==classes[level,index]]
 if not pending:assert candidates,(level,index,title)
 match=candidates[0] if candidates else None
 description=rec['description'];notes=[]
 if (level,index)==(2,6):
  description+=' weapons that bypass the protection of chain armor.';notes.append('Truncated final sentence completed from Handbook p119.')
 if (level,index)==(10,8):
  description+='\n\nImmortal Vision Factors\n- See impossible distances (2)\n- See an aura (3)\n- Detect truth and lies (4)\n- See a future event (5)\n\nIn Dreams Factors\n- Remembering an event experienced by another (2)\n- Recovering from all conditions (4)\n- Retrieving a lost object (4)\n- Breaking a curse (5)';notes.append('Missing factor lists restored from Handbook p125.')
 if (level,index)==(5,3):notes.append('Source has an unclosed parenthesis; original wording retained.')
 if (level,index)==(6,3):description=description.removeprefix('Helpful: ');notes.append('Duplicate supplied Helpful entry merged.')
 source={'document':'Dungeoneer’s Handbook','page':match['page'] if match else None,'class':match['class'] if match else '', 'originalTitle':None if pending else title,'nameVerified':not pending,'suppliedLines':rec['sourceLines'],'notes':notes}
 catalog.append({'key':rec['key'],'name':title,'minLevel':level,'frequency':'session' if 'once per session' in description.lower() or 'one test per session' in description.lower() else 'passive','linkType':'general','linkedSkill':'','linkedAbility':'','effectMode':'manual','diceBonus':0,'description':description,'source':source})
counts=collections.Counter(t['name'] for t in catalog)
for talent in catalog:
 if counts[talent['name']]>1:
  suffix=talent['source']['class']
  if talent['name']=='War Captain':suffix+=' · L'+str(talent['minLevel'])
  if talent['name']=='Righteous Fury':suffix+=' · '+('Short variant' if talent['key'].endswith('-01') else 'Full variant')
  talent['name']+=f' ({suffix})'
 if not talent['source']['nameVerified']:talent['name']+=' [working title]'
assert len(catalog)==124
assert len(set(t['key'] for t in catalog))==len(catalog)
assert len(set(t['name'] for t in catalog))==len(catalog)
approved=json.loads(Path('qa/legacy-talent-approved-names.json').read_text(encoding='utf8'))
for talent in catalog:
 previous=talent['name']
 talent['name']=approved.get(talent['key'],previous.replace(' [working title]',''))
 talent['previousNames']=[previous] if previous!=talent['name'] else []
 talent['source']['nameApproved']=True
 talent['source']['approvedBy']='User / Fire, 2026-11-12'
assert len(set(t['name'] for t in catalog))==len(catalog)
target=Path('module/legacy-talent-catalog.mjs')
target.write_text('// Legacy Mixed: user-supplied effects and user-approved names.\n// Complex effects are table adjudicated; no blanket dice bonus is inferred.\nexport const LEGACY_TALENT_CATALOG_VERSION = "2";\nexport const LEGACY_TALENT_LEVEL_NOTES = Object.freeze({3: "Level 3 also grants a Creed and +1D to Circles in your hometown. Record these with the GM."});\nexport const LEGACY_TALENTS = Object.freeze('+json.dumps(catalog,ensure_ascii=False,indent=2)+'.map(t => Object.freeze(t)));\n',encoding='utf8')
(base/'catalog-review.json').write_text(json.dumps({'total':len(catalog),'historicalBookMatches':sum(t['source']['nameVerified'] for t in catalog),'approvedNames':len(catalog),'pendingNames':[],'levels':dict(collections.Counter(t['minLevel'] for t in catalog))},indent=2),encoding='utf8')
print((base/'catalog-review.json').read_text())
