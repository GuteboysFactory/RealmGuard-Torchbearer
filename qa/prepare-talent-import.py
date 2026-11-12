"""Preserve user-supplied effects for matching against the original, read-only PDF."""
from pathlib import Path
import hashlib
import json
import sys

source=Path(sys.argv[1])
text=source.read_text(encoding='utf-8-sig')
lines=text.splitlines()
starts={
 2:[2,3,6,10,14,18,21,22,25,26,27,30,34,35,36,45,48,51,56],
 3:[63,69,75,76,96,99,104,107,109,113,116,118,124,130,133,136],
 4:[141,149,153,157,160,165,167,171,172,176,180,187,194,198,201,207],
 5:[213,217,220,228,235,238,245,256,279,285,287,290,299,307,313],
 6:[319,321,330,332,334,336,345,353,364,368,375,382,394,399],
 7:[403,408,411,413,424,429,432,435,436,440],
 8:[445,448,453,456,459,462,464,466,469,474,477,480],
 9:[484,487,489,492,495,498,509,512,514,517,520],
 10:[524,530,536,542,549,550,553,567,571,585,594,597]
}
headers={2:1,3:62,4:140,5:212,6:318,7:402,8:444,9:483,10:523}
assert len(lines)==603, f'Unexpected source layout: {len(lines)} lines; review boundaries before import'
records=[]
for level,offsets in starts.items():
 end_level=headers.get(level+1,len(lines)+1)-1
 for i,start in enumerate(offsets):
  end=(offsets[i+1]-1) if i+1<len(offsets) else end_level
  body='\n'.join(lines[start-1:end]).strip()
  records.append({'key':f'legacy-supplied-l{level}-{i+1:02}', 'level':level, 'name':'Helpful' if start==330 else None,
    'sourceLines':[start,end], 'description':body, 'status':'awaiting-original-title',
    'warnings':(['incomplete-description'] if start in [18,567] else [])+(['unclosed-parenthesis'] if start==220 else []),
    'duplicateOf':'legacy-supplied-l6-03' if start==332 else None})
out=Path(__file__).resolve().parent.parent/'output'/'talent-import'
out.mkdir(parents=True,exist_ok=True)
payload={'source':'User-provided Talent effects; original names to be matched to Dungeoneers Handbook',
 'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(), 'sourceLines':len(lines),
 'levelInstructions':{str(level):lines[line-1] for level,line in headers.items()},
 'records':records}
(out/'supplied-effects.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
summary={'rawEntries':len(records),'uniqueEffects':sum(not r['duplicateOf'] for r in records),'perLevel':{str(k):sum(r['level']==k and not r['duplicateOf'] for r in records) for k in starts},'incomplete':[r['sourceLines'] for r in records if 'incomplete-description' in r['warnings']], 'originalNamesResolved':1}
(out/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False,indent=2))
