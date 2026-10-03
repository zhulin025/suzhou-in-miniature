export const catalog = [
 {id:'suzhou',name:'苏州',en:'SUZHOU',region:'江南',group:null,subtitle:'一城水色 · 千年姑苏',motif:'pagoda',tone:'#658772',features:'平江路 / 拙政园 / 虎丘 / 东方之门'},
 {id:'hangzhou',name:'杭州',en:'HANGZHOU',region:'江南',group:'jiangnan',subtitle:'西湖烟柳 · 钱塘山水',motif:'pagoda',tone:'#6e9174',features:'西湖 / 雷峰塔 / 三潭印月 / 断桥'},
 {id:'shanghai',name:'上海',en:'SHANGHAI',region:'江海',group:'metropolis',subtitle:'浦江两岸 · 万国天际',motif:'skyline',tone:'#668e96',features:'东方明珠 / 上海中心 / 环球金融中心 / 外滩'},
 {id:'nantong',name:'南通',en:'NANTONG',region:'江南',group:'jiangnan',subtitle:'江海之会 · 濠河古城',motif:'clock',tone:'#799786',features:'濠河 / 狼山 / 钟楼 / 南通博物苑'},
 {id:'wuxi',name:'无锡',en:'WUXI',region:'江南',group:'jiangnan',subtitle:'太湖帆影 · 梁溪清韵',motif:'garden',tone:'#83a084',features:'太湖 / 寄畅园 / 清名桥 / 惠山古镇'},
 {id:'changzhou',name:'常州',en:'CHANGZHOU',region:'江南',group:'jiangnan',subtitle:'龙城古塔 · 运河人家',motif:'pagoda',tone:'#83926e',features:'天宁宝塔 / 文笔塔 / 大运河 / 青果巷'},
 {id:'nanjing',name:'南京',en:'NANJING',region:'古都',group:'north',subtitle:'六朝烟水 · 金陵城阙',motif:'gate',tone:'#8c9871',features:'中华门 / 秦淮河 / 夫子庙 / 中山陵'},
 {id:'wenzhou',name:'温州',en:'WENZHOU',region:'江南',group:'jiangnan',subtitle:'瓯江双塔 · 山海温州',motif:'pagoda',tone:'#7e9c85',features:'江心屿 / 东西双塔 / 松台山 / 朔门'},
 {id:'ningbo',name:'宁波',en:'NINGBO',region:'江海',group:'jiangnan',subtitle:'三江汇流 · 书藏古今',motif:'clock',tone:'#769699',features:'天一阁 / 天封塔 / 老外滩 / 三江口'},
 {id:'guangzhou',name:'广州',en:'GUANGZHOU',region:'岭南',group:'metropolis',subtitle:'珠水流光 · 羊城新韵',motif:'tower',tone:'#81996d',features:'广州塔 / 珠江 / 广州大剧院 / 海心桥'},
 {id:'shenzhen',name:'深圳',en:'SHENZHEN',region:'岭南',group:'metropolis',subtitle:'湾区绿意 · 云端鹏城',motif:'skyline',tone:'#719c8a',features:'平安金融中心 / 春笋 / 市民中心 / 深圳湾'},
 {id:'beijing',name:'北京',en:'BEIJING',region:'古都',group:'north',subtitle:'朱墙金瓦 · 京华春秋',motif:'round',tone:'#ad896d',features:'祈年殿 / 紫禁城 / 北海白塔 / 胡同'},
 {id:'datong',name:'大同',en:'DATONG',region:'古都',group:'north',subtitle:'云冈石语 · 塞上古城',motif:'gate',tone:'#ac9976',features:'云冈石窟意象 / 九龙壁 / 华严寺 / 古城墙'},
 {id:'changsha',name:'长沙',en:'CHANGSHA',region:'长江',group:'metropolis',subtitle:'湘江洲渚 · 麓山晚亭',motif:'garden',tone:'#869677',features:'橘子洲 / 爱晚亭 / 杜甫江阁 / 中国结步行桥'},
 {id:'wuhan',name:'武汉',en:'WUHAN',region:'长江',group:'metropolis',subtitle:'两江襟带 · 黄鹤凌空',motif:'pagoda',tone:'#9b9d73',features:'黄鹤楼 / 长江大桥 / 晴川阁 / 江汉江岸'},
 {id:'qingdao',name:'青岛',en:'QINGDAO',region:'海滨',group:'north',subtitle:'红瓦绿树 · 碧海白帆',motif:'sail',tone:'#7a9caa',features:'栈桥回澜阁 / 五月的风 / 圣弥厄尔教堂 / 八大关'},
 {id:'dalian',name:'大连',en:'DALIAN',region:'海滨',group:'north',subtitle:'星海长桥 · 北方海岸',motif:'bridge',tone:'#7c99a4',features:'星海湾大桥 / 星海广场 / 灯塔 / 俄式街区'},
];
export const cityUrl=id=>id==='suzhou'?'/':`/cities/${id}/`;
export const loaders={jiangnan:()=>import('./jiangnan.js'),metropolis:()=>import('./metropolis.js'),north:()=>import('./north.js')};

// Original vector vignettes for navigation; city scenes themselves use real geometry.
export function vignette(motif='pagoda',tone='#819677'){
 const shapes={
  pagoda:'<path d="M113 93V32h14v61M100 38l20-16 20 16-8 3h-24ZM94 55l26-15 26 15-9 3h-34ZM89 74l31-16 31 16-10 3H99ZM83 94l37-17 37 17-11 3H94Z"/>',
  skyline:'<path d="M65 99V59h18v40M99 100V31l13-12 13 12v69M106 34l12 58M147 100V48h25v52M152 52h15v12h-15ZM191 100V23M186 29h10M191 81V43"/><circle cx="191" cy="44" r="10"/><circle cx="191" cy="80" r="15"/>',
  tower:'<path d="M108 104Q130 60 115 18M145 104Q124 60 136 18M110 103l26-85M143 103l-28-85M114 87l26-16M119 63l17-14M122 38l12-13M130 18V4M105 104h44"/>',
  round:'<path d="M88 102V80h67v22M81 80q40-12 81 0l-6 4H87ZM88 65q33-16 68 0l-7 4H95ZM98 49q24-21 49 0l-4 5h-42ZM120 34V23M100 88v14M112 88v14M130 88v14M144 88v14"/>',
  gate:'<path d="M69 102V74h102v28M66 74l54-17 55 17M81 65V48h78v17M74 47l46-24 47 24-8 5H83M110 102V89a10 10 0 0 1 20 0v13M52 102V86h17M171 86h17v16M55 86v-8m10 8v-8m114 8v-8m9 8v-8"/>',
  clock:'<path d="M104 104V39h31v65M99 39l20-20 20 20ZM109 23V11h21v12M93 104h54M108 76h7v14h-7ZM123 76h7v14h-7Z"/><circle cx="119" cy="55" r="10"/><path d="M119 47v8l5 3"/>',
  garden:'<path d="M53 102V72h45v30M45 72l30-18 30 18M145 102V69h49v33M136 69l34-24 33 24M142 72h55M155 74v28M183 74v28M100 96q23-20 44 0M102 97h40M113 94v8M128 94v8"/>',
  sail:'<path d="M132 97V24M132 29L97 84h33M137 46l32 38h-32M110 95l12 11h38l10-11ZM48 103V67h34v36M43 66l22-18 22 18M54 80h7v12h-7m12-12h7v12h-7"/>',
  bridge:'<path d="M37 95h165M77 94V36h11v58M153 94V36h11v58M39 90Q66 85 81 39Q119 95 159 39Q182 85 201 90M50 85v10M65 69v26M98 60v35M114 73v22M130 73v22M145 59v36M177 71v24M190 84v11"/>',
 };
 return `<svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="121" cy="115" rx="94" ry="11" fill="${tone}" opacity=".11"/><path d="M24 114l38-15 75 1 80 16-47 17-98-2Z" fill="${tone}" opacity=".18"/><path d="M34 114q24-7 42 0t44 0t44 0t41 0" stroke="${tone}" opacity=".5"/><g stroke="${tone}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="${tone}" fill-opacity=".08">${shapes[motif]||shapes.pagoda}</g><circle cx="192" cy="29" r="14" fill="${tone}" opacity=".1"/></svg>`;
}
