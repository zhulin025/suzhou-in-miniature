import pathlib,json,subprocess,time,collections
from shapely.geometry import Polygon,Point,LineString
from shapely.ops import polygonize,unary_union,transform
from shapely import make_valid
from pyproj import Transformer
R=pathlib.Path(__file__).resolve().parents[1];D=R/'data-cache'
proj=Transformer.from_crs('EPSG:4326','+proj=tmerc +lat_0=31.3 +lon_0=120.65 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs',always_xy=True).transform
names=['姑苏区','虎丘区','吴中区','相城区','吴江区','昆山市','常熟市','张家港市','太仓市','苏州工业园区']
index=json.loads((D/'admin-index.json').read_text());buildings=json.loads((D/'buildings-projected.json').read_text());report=[]
for entry in index['elements']:
 name=entry['tags'].get('name')
 if name not in names:continue
 f=D/('admin-'+str(entry['id'])+'.json')
 if not f.exists():
  for i in range(3):
   r=subprocess.run(['curl','--compressed','--fail','--connect-timeout','20','--max-time','120','-sS','-X','POST','https://maps.mail.ru/osm/tools/overpass/api/interpreter','--data-urlencode','data=[out:json][timeout:60];rel('+str(entry['id'])+');out geom;','-o',str(f)+'.part'])
   try:
    d=json.loads(pathlib.Path(str(f)+'.part').read_text());assert r.returncode==0 and d.get('elements');pathlib.Path(str(f)+'.part').replace(f);break
   except Exception:
    if i==2:raise
    time.sleep(30)
 e=json.loads(f.read_text())['elements'][0];outer=[];inner=[]
 for m in e.get('members',[]):
  c=[(p['lon'],p['lat']) for p in m.get('geometry',[]) if 'lon'in p]
  if len(c)>1:(inner if m.get('role')=='inner' else outer).append(LineString(c))
 g=unary_union(list(polygonize(unary_union(outer))))
 if inner:g=g.difference(unary_union(list(polygonize(unary_union(inner)))))
 g=transform(proj,make_valid(g));count=sum(g.covers(Point(b['c'][0],-b['c'][1])) for b in buildings)
 report.append({'name':name,'relation':e['id'],'buildingCount':count,'areaKm2':round(g.area/1e6,1)})
 print(name,count,flush=True)
(R/'public/data/coverage.json').write_text(json.dumps({'method':'建筑轮廓中心点与 OpenStreetMap 行政区多边形相交检查','buildings':len(buildings),'districts':report},ensure_ascii=False,indent=2))
assert len(report)==10 and all(d['buildingCount']>0 for d in report)
