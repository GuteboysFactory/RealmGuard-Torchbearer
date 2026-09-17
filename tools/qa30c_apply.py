from pathlib import Path

src_path = Path('tools/qa30_apply.py')
src = src_path.read_text(encoding='utf-8')

# Replace the known-bad DialogV2 patching section by marker boundaries rather
# than matching its entire source text. This changes patch tooling only.
start_marker = '# Replace direct return wait with wrapped result and teamwork snapshot.'
end_marker = "old='''        modifier: Number(b.form?.elements?.modifier?.value ?? 0), extra: Math.max(0, Number(b.form?.elements?.extra?.value ?? 0)),"
start = src.find(start_marker)
end = src.find(end_marker, start)
if start < 0 or end < 0 or end <= start:
    raise SystemExit(f'qa30c: dialog patch markers not found start={start} end={end}')
replacement = '''# Replace the DialogV2.wait belonging specifically to openPoolDialog.\npre,post=t.split('async function openPoolDialog',1)\nneedle_wait='  return await foundry.applications.api.DialogV2.wait({'\nif needle_wait not in post:\n    raise SystemExit('dialog try: openPoolDialog wait not found')\npost=post.replace(needle_wait,'  let result=null;\\n  try { result = await foundry.applications.api.DialogV2.wait({',1)\nt=pre+'async function openPoolDialog'+post\n\n'''
src = src[:start] + replacement + src[end:]

# Replace the single GM-review confirm statement by line identity. DialogV2.wait
# is the already-proven Realm Guard v13 pattern.
lines = src.splitlines()
found = False
for i, line in enumerate(lines):
    if 'const approved=await foundry.applications.api.DialogV2.confirm(' in line:
        lines[i] = '  const approved=await foundry.applications.api.DialogV2.wait({window:{title:"Realm Guard · Review Help",resizable:true},content,modal:false,rejectClose:false,buttons:[{action:"approve",label:"Approve Help",icon:"fa-solid fa-check",default:true,callback:()=>true},{action:"reject",label:"Reject",icon:"fa-solid fa-xmark",callback:()=>false}]});'
        found = True
        break
if not found:
    raise SystemExit('qa30c: GM review confirm statement not found')
src = '\n'.join(lines) + '\n'

exec(compile(src, str(src_path), 'exec'))
