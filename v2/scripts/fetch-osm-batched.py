"""Fetch bounded OSM object batches, resumable after interrupted transfers."""
import pathlib,json,subprocess,time,concurrent.futures,sys
ROOT=pathlib.Path(__file__).resolve().parents[1];D=ROOT/'data-cache';D.mkdir(exist_ok=True)
area=''
queries={
 'buildings':'(way[building](30.7603,119.9162,32.0458,121.3830);rel[building](30.7603,119.9162,32.0458,121.3830););',
 'landscape':'(way[natural~"^(water|wood|wetland)$"](30.7603,119.9162,32.0458,121.3830);rel[natural~"^(water|wood|wetland)$"](30.7603,119.9162,32.0458,121.3830);way[landuse~"^(forest|grass|recreation_ground|reservoir)$"](30.7603,119.9162,32.0458,121.3830);rel[landuse~"^(forest|grass|recreation_ground|reservoir)$"](30.7603,119.9162,32.0458,121.3830);way[leisure~"^(park|garden|golf_course)$"](30.7603,119.9162,32.0458,121.3830);rel[leisure~"^(park|garden|golf_course)$"](30.7603,119.9162,32.0458,121.3830);way[waterway~"^(river|canal|stream)$"](30.7603,119.9162,32.0458,121.3830););',
 'roads':'(way[highway~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$"](30.7603,119.9162,32.0458,121.3830);way[railway=rail](30.7603,119.9162,32.0458,121.3830););'
}
def fetch(name,q):
 p=D/(name+'.json')
 if p.exists():
  try:
   data=json.loads(p.read_text())
   if 'elements' in data and not data.get('remark'):return data
  except Exception:pass
 (D/(name+'.overpassql')).write_text(q)
 for i in range(4):
  try:
   subprocess.run(['curl','--compressed','--fail','--connect-timeout','30','--max-time','150','-sS','-X','POST','https://maps.mail.ru/osm/tools/overpass/api/interpreter','--data-urlencode','data='+q,'-o',str(p)+'.part'],check=True)
   data=json.loads(pathlib.Path(str(p)+'.part').read_text())
   if data.get('remark'):raise ValueError(data['remark'])
   pathlib.Path(str(p)+'.part').replace(p);print('saved',name,len(data['elements']),p.stat().st_size,flush=True);return data
  except Exception as e:
   print('retry',name,i+1,str(e)[:120],flush=True)
   if i==3:raise
   time.sleep(30+i*10)
for name,q in queries.items():
 if len(sys.argv)>1 and name not in sys.argv[1:]:continue
 if (D/(name+'.json')).exists():
  try:
   data=json.loads((D/(name+'.json')).read_text())
   if data.get('elements') and not data.get('remark'):continue
  except Exception:pass
 ids=fetch(name+'-ids','[out:json][timeout:90];'+area+q+'out ids;')
 items=ids['elements'];batches=[items[i:i+1600] for i in range(0,len(items),1600)]
 print(name,len(items),'objects',len(batches),'batches',flush=True)
 def run(pair):
  index,batch=pair;parts=[]
  for typ in ['way','relation']:
   values=','.join(str(e['id']) for e in batch if e['type']==typ)
   if values:parts.append(('rel' if typ=='relation' else 'way')+'(id:'+values+');')
  return fetch(name+'-batch-'+str(index),'[out:json][timeout:90];('+''.join(parts)+');out geom;')
 results=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
  for data in pool.map(run,enumerate(batches)):results.extend(data['elements'])
 merged={**ids,'elements':results}
 assert len(results)==len(items),(name,len(results),len(items))
 (D/(name+'.json')).write_text(json.dumps(merged,separators=(',',':')))
 print('COMPLETE',name,len(results),flush=True)
