"""Match preserved user effects to read-only Handbook extraction; emit review candidates."""
import json,re,difflib
from pathlib import Path
base=Path('output/talent-import')
pages=json.loads((base/'handbook-levels.json').read_text(encoding='utf8'))
book=[]
level=0;cls='';current=None
for page in pages:
 for line in page['text'].splitlines():
  if 'LeveL BenefIts' in line:
   cls=line.split(' LeveL')[0].title();current=None
  elif re.fullmatch(r'Level \d+\s*',line):
   level=int(line.strip().split()[-1]);current=None
  else:
   match=re.match(r'^([A-Z][A-Za-z ,’\'-]{1,55}):\s*(.*)',line)
   if match and level>=2 and cls and match[1] not in ['Choose','Animated Broom']:
    current={'name':match[1],'level':level,'class':cls,'page':page['page'],'description':match[2]};book.append(current)
   elif current and not line.isdigit() and line!='Levels':current['description']+=' '+line
def norm(s):return re.sub(r'[^a-z0-9 ]','',re.sub(r'\s+',' ',s.lower()))
(base/'book-benefits.json').write_text(json.dumps(book,ensure_ascii=False,indent=2),encoding='utf8')
supplied=json.loads((base/'supplied-effects.json').read_text(encoding='utf8'))['records']
results=[]
for rec in supplied:
 if rec.get('duplicateOf'):continue
 a=norm(rec['description'].removeprefix('Helpful: '))
 def score(b):
  bb=norm(b['description']);n=min(len(a),len(bb),200)
  return difflib.SequenceMatcher(None,a[:n],bb[:n]).ratio()
 ranked=sorted(book,key=score,reverse=True)
 results.append({**rec,'candidates':[{**b,'score':round(score(b),3)} for b in ranked[:2]]})
(base/'name-matches.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
for r in results:print(r['key'], ' | '.join(f"{b['score']} {b['name']} ({b['class']} L{b['level']} p{b['page']})" for b in r['candidates']))
