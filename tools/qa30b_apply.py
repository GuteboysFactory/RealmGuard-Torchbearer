from pathlib import Path

src_path = Path('tools/qa30_apply.py')
src = src_path.read_text(encoding='utf-8')

# The original qa30 patcher intentionally used exact-match guards. One guard was
# too broad because conflicts.mjs contains three DialogV2.wait() calls with the
# same prefix. Scope this replacement to openPoolDialog instead.
old = '''# Replace direct return wait with wrapped result and teamwork snapshot.\nt=rep(t,\n''' + "'''  return await foundry.applications.api.DialogV2.wait({\n'''" + ''',\n''' + "'''  let result=null;\n  try { result = await foundry.applications.api.DialogV2.wait({\n'''" + ''',\n''' + "'''dialog try''',1)" + '''\n# The first occurrence after openPoolDialog might be wrong: there are earlier waits! We replaced global first occurrence likely startConflictDialog. Abort if marker location unsuitable handled by verification below.\n# Detect and repair if startConflictDialog got changed instead.\nif 'let result=null;\\n  try { result = await foundry.applications.api.DialogV2.wait' in t.split('async function openPoolDialog',1)[0]:\n    # undo first wrong replacement and perform scoped replacement after openPoolDialog only\n    t=t.replace('let result=null;\\n  try { result = await foundry.applications.api.DialogV2.wait','return await foundry.applications.api.DialogV2.wait',1)\n    pre,post=t.split('async function openPoolDialog',1)\n    post=post.replace('  return await foundry.applications.api.DialogV2.wait({','  let result=null;\\n  try { result = await foundry.applications.api.DialogV2.wait({',1)\n    t=pre+'async function openPoolDialog'+post\n'''
new = '''# Replace the DialogV2.wait belonging specifically to openPoolDialog.\npre,post=t.split('async function openPoolDialog',1)\nneedle_wait='  return await foundry.applications.api.DialogV2.wait({'\nif needle_wait not in post:\n    raise SystemExit('dialog try: openPoolDialog wait not found')\npost=post.replace(needle_wait,'  let result=null;\\n  try { result = await foundry.applications.api.DialogV2.wait({',1)\nt=pre+'async function openPoolDialog'+post\n'''
if old not in src:
    raise SystemExit('qa30b: could not locate broad DialogV2 patch block')
src = src.replace(old, new, 1)

# Use the same DialogV2.wait pattern already proven throughout Realm Guard rather
# than relying on a confirm convenience API whose v13 signature is less certain.
old_confirm = '''  const approved=await foundry.applications.api.DialogV2.confirm({window:{title:"Realm Guard · Review Help",resizable:true},content,modal:false,rejectClose:false,yes:{label:"Approve Help",icon:"fa-solid fa-check"},no:{label:"Reject",icon:"fa-solid fa-xmark"}});'''
new_confirm = '''  const approved=await foundry.applications.api.DialogV2.wait({window:{title:"Realm Guard · Review Help",resizable:true},content,modal:false,rejectClose:false,buttons:[{action:"approve",label:"Approve Help",icon:"fa-solid fa-check",default:true,callback:()=>true},{action:"reject",label:"Reject",icon:"fa-solid fa-xmark",callback:()=>false}]});'''
if old_confirm not in src:
    raise SystemExit('qa30b: could not locate GM review confirm call')
src = src.replace(old_confirm, new_confirm, 1)

exec(compile(src, str(src_path), 'exec'))
