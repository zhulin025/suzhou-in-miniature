// WGS84 transverse Mercator (Snyder series), central meridian 120.65°E.
// Matches the offline PROJ definition to sub-centimetre precision in this region.
const A=6378137,E2=.0066943799901413165,L0=120.65*Math.PI/180,PHI0=31.3*Math.PI/180;
function meridional(p){const e4=E2*E2,e6=e4*E2;return A*((1-E2/4-3*e4/64-5*e6/256)*p-(3*E2/8+3*e4/32+45*e6/1024)*Math.sin(2*p)+(15*e4/256+45*e6/1024)*Math.sin(4*p)-35*e6/3072*Math.sin(6*p));}
const M0=meridional(PHI0);
export function project(lon,lat){const p=lat*Math.PI/180,l=lon*Math.PI/180,n=A/Math.sqrt(1-E2*Math.sin(p)**2),t=Math.tan(p)**2,c=E2/(1-E2)*Math.cos(p)**2,a=(l-L0)*Math.cos(p);return[n*(a+(1-t+c)*a**3/6+(5-18*t+t*t+72*c-58*E2/(1-E2))*a**5/120),-(meridional(p)-M0+n*Math.tan(p)*(a*a/2+(5-t+9*c+4*c*c)*a**4/24+(61-58*t+t*t+600*c-330*E2/(1-E2))*a**6/720))];}
export function unproject(x,z){let lon=120.65+x/95200,lat=31.3-z/110870;for(let i=0;i<4;i++){const [px,pz]=project(lon,lat);lon+=(x-px)/95200;lat-=(z-pz)/110870;}return[lon,lat];}
export const regions=[
 {id:'center',name:'主城全景',en:'CENTRAL SUZHOU',lon:120.660,lat:31.314,distance:12500,azimuth:.48,polar:1.01,copy:'古城的水脉，延伸为湖畔的天际线。'},
 {id:'gusu',name:'姑苏古城',en:'GUSU OLD TOWN',lon:120.616,lat:31.313,distance:9400,azimuth:.18,polar:.64,copy:'沿着城河与街巷，读一座江南古城。'},
 {id:'sip',name:'金鸡湖',en:'JINJI LAKE',lon:120.696,lat:31.316,distance:7900,azimuth:2.9,polar:1.03,copy:'湖西的东方之门，遥望湖东的新天际线。'},
 {id:'hitech',name:'狮山 · 高新区',en:'SUZHOU NEW DISTRICT',lon:120.535,lat:31.288,distance:10800,azimuth:.1,polar:.83,copy:'西部山水之间，城市向新的方向生长。'},
 {id:'xiangcheng',name:'相城',en:'XIANGCHENG',lon:120.624,lat:31.391,distance:15000,azimuth:.15,polar:.76,copy:'从城市北部，继续探索苏州的街区与水系。'},
 {id:'wuzhong',name:'吴中 · 太湖',en:'WUZHONG & TAIHU',lon:120.44,lat:31.192,distance:23500,azimuth:.25,polar:.72,copy:'太湖岸线与散落的聚落，铺开江南的辽阔。'},
 {id:'wujiang',name:'吴江',en:'WUJIANG',lon:120.63,lat:31.15,distance:18000,azimuth:.3,polar:.76,copy:'向南越过城市，河网串起江南水乡。'},
 {id:'kunshan',name:'昆山',en:'KUNSHAN',lon:120.959,lat:31.383,distance:20500,azimuth:.3,polar:.76,copy:'从玉峰山周边，俯瞰苏州东部的城市肌理。'},
 {id:'changshu',name:'常熟',en:'CHANGSHU',lon:120.748,lat:31.656,distance:18000,azimuth:.3,polar:.76,copy:'虞山与尚湖之间，展开常熟的城市轮廓。'},
 {id:'zhangjiagang',name:'张家港',en:'ZHANGJIAGANG',lon:120.55,lat:31.87,distance:21000,azimuth:.3,polar:.76,copy:'一路向北，抵达长江岸边的港城。'},
 {id:'taicang',name:'太仓',en:'TAICANG',lon:121.108,lat:31.45,distance:18000,azimuth:.3,polar:.76,copy:'沿江与临沪的城市，在河网中徐徐展开。'},
 {id:'all',name:'苏州全域',en:'GREATER SUZHOU',lon:120.655,lat:31.42,distance:208000,azimuth:0,polar:.2,copy:'一览苏州市行政范围内的建筑、道路与水系。'}
];
for(const r of regions)r.pos=project(r.lon,r.lat);
