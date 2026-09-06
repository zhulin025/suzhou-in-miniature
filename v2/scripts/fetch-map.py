import pathlib,json,subprocess,time
D=pathlib.Path(__file__).resolve().parents[1]/'data-cache'
def fetch(name,q):
 f=D/(name+'.json')
 if f.exists():
  try:
   d=json.loads(f.read_text())
   if d.get('elements') and not d.get('remark'):return d
  except Exception:pass
 for attempt in range(4):
  r=subprocess.run(['curl','--compressed','--fail','--connect-timeout','20','--max-time','100','-sS','-X','POST','https://maps.mail.ru/osm/tools/overpass/api/interpreter','--data-urlencode','data='+q,'-o',str(f)+'.part'])
  try:
   d=json.loads(pathlib.Path(str(f)+'.part').read_text());assert r.returncode==0 and not d.get('remark');pathlib.Path(str(f)+'.part').replace(f);print(name,len(d['elements']),flush=True);return d
  except Exception:
   if attempt==3:raise
   print('retry',name,attempt+1,flush=True);time.sleep(30)
all_ids={e['id']:e for e in json.loads((D/'suzhou-core-road-ids.json').read_text())['elements']}
for e in json.loads((D/'center-roads-ids.json').read_text())['elements']:all_ids[e['id']]=e
cached={}
for f in [*D.glob('roads-batch-*.json'),*D.glob('arterial-part-*.json'),*D.glob('suzhou-road-part-*.json'),*D.glob('final-roads-part-*.json')]:
 for e in json.loads(f.read_text())['elements']:cached[e['id']]=e
missing=[i for i in sorted(all_ids) if i not in cached];print('roads',len(all_ids),'missing',len(missing),flush=True)
for i in range(0,len(missing),1100):
 ids=missing[i:i+1100];data=fetch('final-roads-part-'+str(i//1100),'[out:json][timeout:60];way(id:'+','.join(map(str,ids))+');out geom;')
 for e in data['elements']:cached[e['id']]=e
# Preserve already acquired local streets along with the complete selected road classes.
(D/'roads.json').write_text(json.dumps({'elements':list(cached.values())},separators=(',',':')))
print('COMPLETE roads',len(cached),flush=True)
