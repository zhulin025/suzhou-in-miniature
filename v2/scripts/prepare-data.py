"""Normalize OSM footprints/polygons into metre coordinates, preserving holes."""
import json,pathlib,re,math,hashlib,collections,gzip
from shapely.geometry import Polygon,MultiPolygon,LineString,Point
from shapely.ops import polygonize,unary_union,transform
from shapely import make_valid
from pyproj import Transformer
ROOT=pathlib.Path(__file__).resolve().parents[1];CACHE=ROOT/'data-cache';OUT=ROOT/'public/data'
OUT.mkdir(exist_ok=True,parents=True)
CRS='+proj=tmerc +lat_0=31.3 +lon_0=120.65 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs'
project=Transformer.from_crs('EPSG:4326',CRS,always_xy=True).transform

def poly_parts(g):
 if g.is_empty:return []
 if g.geom_type=='Polygon':return [g]
 return [p for c in getattr(g,'geoms',[]) for p in poly_parts(c)]

def coords(e):return [(n['lon'],n['lat']) for n in e.get('geometry',[]) if 'lon' in n]

def geometry(e):
 if e['type']=='way':
  c=coords(e)
  if len(c)<4 or c[0]!=c[-1]:return None
  try:return make_valid(Polygon(c))
  except Exception:return None
 outer=[];inner=[]
 for m in e.get('members',[]):
  c=coords(m)
  if m['type']=='way' and len(c)>1:(inner if m.get('role')=='inner' else outer).append(LineString(c))
 try:
  o=unary_union(list(polygonize(unary_union(outer))))
  if inner:o=o.difference(unary_union(list(polygonize(unary_union(inner)))))
  return make_valid(o)
 except Exception:return None

def rings(p):
 # World uses X=east, Y=up, Z=south. The projection's northing is negated.
 return [[[round(x,1),round(-y,1)] for x,y in r.coords[:-1]] for r in [p.exterior,*p.interiors]]
def number(v):
 if not v:return None
 m=re.search(r'-?\d+(?:\.\d+)?',str(v).replace(',','.'))
 if not m:return None
 n=float(m.group());return n*.3048 if 'ft' in str(v) or "'" in str(v) else n

def load(n):return json.loads((CACHE/(n+'.json')).read_text())
boundary_data=load('boundary');boundary_geo=unary_union([geometry(e) for e in boundary_data['elements']]);boundary=transform(project,boundary_geo)
print('boundary',boundary_data['elements'][0]['id'],boundary.bounds,boundary.area/1e6,flush=True)
raw=load('buildings');selection=json.loads((ROOT/'data-selection.json').read_text());actual_ids=sorted(e['type'][0]+str(e['id']) for e in raw['elements']);assert len(actual_ids)==selection['buildingCount'] and hashlib.sha256('\n'.join(actual_ids).encode()).hexdigest()==selection['idSetSHA256'],'建筑集合已冻结，禁止无意增加或替换。'
members={m['ref'] for e in raw['elements'] if e['type']=='relation' for m in e.get('members',[]) if m['type']=='way'}
records=[];stats=collections.Counter();sources=collections.Counter();named=[];ids=set()
for e in raw['elements']:
 if e['type']=='way' and e['id'] in members:stats['relationMemberWays']+=1;continue
 tag=e.get('tags',{})
 if tag.get('building') in ['no','construction','ruins']:stats['notStandingBuildings']+=1;continue
 g=geometry(e)
 if g is None or g.is_empty:stats['invalid']+=1;continue
 projected=transform(project,g)
 if not boundary.intersects(projected):stats['outside']+=1;continue
 parts=[p.simplify(.15,preserve_topology=True) for p in poly_parts(projected) if p.area>=8]
 if not parts:stats['tooSmall']+=1;continue
 key=e['type'][0]+str(e['id']);ids.add(key)
 area=sum(p.area for p in parts);center=projected.centroid
 h=number(tag.get('height'));levels=number(tag.get('building:levels'));kind=tag.get('building','yes');source=0
 if h is not None and 2<=h<=650:source=2
 elif levels is not None and 1<=levels<=150:h=levels*3.2;source=1
 else:
  # Conservative, deterministic building-type priors; never random spatial infill.
  source=0
  if kind in ['apartments','residential','dormitory']:h=19.2
  elif kind in ['office','commercial','hotel']:h=32 if area>500 else 16
  elif kind in ['industrial','warehouse','hangar']:h=10
  elif kind in ['house','detached','terrace','semidetached_house']:h=9.6
  elif kind in ['garage','garages','shed','roof','hut']:h=3.2
  elif kind in ['school','university','hospital']:h=16
  else:h=9.6 if area<350 else 16
 minimum=max(0,number(tag.get('min_height')) or 0)
 if minimum>=h:minimum=0
 sources[str(source)]+=1
 records.append({'id':key,'p':[rings(p) for p in parts],'h':round(h,1),'base':round(minimum,1),'s':source,'k':kind,'c':[round(center.x,1),round(-center.y,1)]})
 if tag.get('name'):named.append({'id':key,'name':tag['name'],'x':round(center.x,1),'z':round(-center.y,1),'h':round(h,1),'tags':tag})
print('buildings',len(records),'height sources',dict(sources),'excluded',dict(stats),flush=True)
(CACHE/'buildings-projected.json').write_text(json.dumps(records,separators=(',',':')))
(CACHE/'named-buildings.json').write_text(json.dumps(named,ensure_ascii=False,indent=2))
land=load('landscape');members={m['ref'] for e in land['elements'] if e['type']=='relation' for m in e.get('members',[]) if m['type']=='way'}
water=[];green=[];streams=[]
for e in land['elements']:
 t=e.get('tags',{})
 if t.get('waterway') in ['river','canal','stream'] and e['type']=='way':
  c=coords(e)
  if len(c)>1:
   line=transform(project,LineString(c)).simplify(1.5)
   streams.append({'p':[[round(x,1),round(-y,1)] for x,y in line.coords],'w':min(120,number(t.get('width')) or {'river':22,'canal':12,'stream':4}[t['waterway']]),'name':t.get('name','')})
 if e['type']=='way' and e['id'] in members:continue
 g=geometry(e)
 if g is None or g.is_empty:continue
 projected=transform(project,g).simplify(2,preserve_topology=True)
 is_water=t.get('natural')=='water' or t.get('landuse')=='reservoir'
 for p in poly_parts(projected):
  if p.area<100:continue
  (water if is_water else green).append({'p':rings(p),'name':t.get('name',''),'area':round(p.area)})
water.sort(key=lambda p:-p['area']);green.sort(key=lambda p:-p['area'])
road_data=load('roads');roads=[]
widths={'motorway':12,'motorway_link':7,'trunk':12,'trunk_link':6,'primary':10,'primary_link':6,'secondary':8,'secondary_link':5,'tertiary':7,'tertiary_link':5,'residential':5,'living_street':4,'unclassified':5}
for e in road_data['elements']:
 t=e.get('tags',{});c=coords(e)
 if len(c)<2 or t.get('tunnel')=='yes':continue
 line=transform(project,LineString(c)).simplify(1.8)
 k=t.get('highway','rail');w=number(t.get('width')) or widths.get(k,3)
 roads.append({'p':[[round(x,1),round(-y,1)] for x,y in line.coords],'k':k,'w':min(30,max(2,w)),'b':t.get('bridge')=='yes','name':t.get('name','')})
base={'boundary':[rings(p) for p in poly_parts(boundary.simplify(15,preserve_topology=True))],'water':water,'green':green,'streams':streams,'roads':roads}
with gzip.open(OUT/'landscape.json.gz','wt',encoding='utf8',compresslevel=9) as f:json.dump(base,f,ensure_ascii=False,separators=(',',':'))
manifest={'selection':selection,'version':'2.0.0','source':'OpenStreetMap contributors','sourceURL':'https://www.openstreetmap.org/copyright','license':'ODbL-1.0','snapshot':raw['osm3s']['timestamp_osm_base'],'boundaryOSM':boundary_data['elements'][0]['id'],'buildingCount':len(records),'sourceElementCount':len(raw['elements']),'coverageSelection':'用户确认的 23898 栋建筑子集；各行政区均有覆盖，非完整建筑普查。','landscapeSelection':'已获取的水系、绿地及主干道和局部街道，含主要湖泊完整轮廓；不是完整道路数据库。','uniqueBuildingIDs':len(ids),'heightSources':{'height':sources['2'],'levels':sources['1'],'estimated':sources['0']},'excluded':dict(stats),'waterPolygons':len(water),'greenPolygons':len(green),'waterways':len(streams),'roadSegments':len(roads),'bounds':[round(n,1) for n in boundary.bounds],'geographicBounds':boundary_geo.bounds,'projection':CRS,'origin':[120.65,31.3],'metersPerUnit':1,'coverageAreaKm2':round(boundary.area/1e6,1),'notes':['建筑覆盖以公开地图收录情况为限，未收录区域没有虚构填充。','轮廓为真实地图数据；缺失高度按用途估算，立面窗格为程序化表达。','地标特征模型为简化重建，不是测绘级实景模型。'],'sourceHashes':{n:hashlib.sha256((CACHE/(n+'.json')).read_bytes()).hexdigest() for n in ['boundary','buildings','landscape','roads']}}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('landscape',len(water),len(green),len(streams),len(roads),flush=True)
