"""Fetch reproducible, bounded Suzhou OSM extracts. No generated footprints."""
import json,time,pathlib,subprocess
D=pathlib.Path(__file__).resolve().parents[1]/'data-cache'
D.mkdir(exist_ok=True)
area='area["name"="苏州市"]["boundary"="administrative"]["admin_level"="5"]->.a;'
queries={
 'boundary': '[out:json][timeout:150];rel["name"="苏州市"]["boundary"="administrative"]["admin_level"="5"];out geom;',
 'buildings': '[out:json][timeout:240][maxsize:536870912];'+area+'(way["building"](area.a);rel["building"](area.a););out geom;',
 'landscape': '[out:json][timeout:240][maxsize:536870912];'+area+'(way["natural"~"^(water|wood|wetland)$"](area.a);rel["natural"~"^(water|wood|wetland)$"](area.a);way["landuse"~"^(forest|grass|recreation_ground|reservoir)$"](area.a);rel["landuse"~"^(forest|grass|recreation_ground|reservoir)$"](area.a);way["leisure"~"^(park|garden|golf_course)$"](area.a);rel["leisure"~"^(park|garden|golf_course)$"](area.a);way["waterway"~"^(river|canal|stream)$"](area.a););out geom;',
 'roads': '[out:json][timeout:240][maxsize:536870912];'+area+'(way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$"](area.a);way["railway"="rail"](area.a););out geom;'
}
for name,query in queries.items():
 p=D/(name+'.json');(D/(name+'.overpassql')).write_text(query)
 if p.exists():
  try:
   data=json.loads(p.read_text())
   if data.get('elements') and not data.get('remark'):
    print('cached',name,len(data['elements']),flush=True);continue
  except Exception:pass
 for attempt in range(3):
  print('fetch',name,'attempt',attempt+1,flush=True)
  try:
   raw=subprocess.check_output(['curl','--compressed','--retry','1','--fail','--max-time','300','-sS','-X','POST','https://overpass-api.de/api/interpreter','--data-urlencode','data='+query])
   data=json.loads(raw)
   if data.get('remark') or not data.get('elements'):raise ValueError(data.get('remark','empty response'))
   p.write_bytes(raw);print('saved',name,len(data['elements']),len(raw),flush=True);break
  except Exception as e:
   print(str(e),flush=True)
   if attempt==2:raise
   time.sleep(15)
