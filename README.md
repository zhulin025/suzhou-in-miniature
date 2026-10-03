# 城市小境 · Cities in miniature

以 Three.js 构建的 17 座城市交互微缩场景。在原版「姑苏小境」基础上，新增杭州、上海、南通、无锡、常州、南京、温州、宁波、广州、深圳、北京、山西大同、长沙、武汉、青岛、大连，每座城市有独立页面、城市地标与可进入的原创小店，支持旋转缩放、昼夜切换和步行探索。

原版苏州保留古城水巷、拙政园意象、虎丘塔、东方之门、金鸡湖与太湖。所有新增场景的建筑、雕塑、树木、地形、船只都是代码生成的三维几何，不依赖远程模型或用截图平面冒充建筑；招牌文字在本地绘制，环境音本地合成。

这组城市小境是艺术化缩景：地标采用有来源依据的几何演绎，空间距离、建筑比例和地形经过重新编排，不是实测地图。苏州地理模型「城市图谱 2.0」作为独立版本保留，其数据范围与尺度说明见下文。

## 在线访问与部署

项目使用 GitHub 与 Vercel 持续部署：

- 在线地址：[suzhou.liuwa.xyz](https://suzhou.liuwa.xyz/)
- 城市入口：[17 城选择页](https://suzhou.liuwa.xyz/cities.html)
- 公开仓库：[zhulin025/suzhou-in-miniature](https://github.com/zhulin025/suzhou-in-miniature)
- Vercel 项目：`suzhou-in-miniature`，已连接上述 GitHub 仓库；推送到 `main` 分支会自动更新生产部署。
- 构建使用 Vite，运行 `npm run build`，输出目录为 `dist`。

每次更新推送到 `main` 后，由 Vercel 自动构建并发布。线上版本以最近一次成功的生产部署为准；本地运行方式和验收结果见下文。

## 本地运行

```bash
npm install
npm run dev -- --port 5173
```

访问 [城市选择页](http://127.0.0.1:5173/cities.html)，路径为 `/cities.html`；原版苏州仍在 [根路径 `/`](http://127.0.0.1:5173/)。`npm run build` 生成本地生产构建，`npm run preview` 预览构建。

新增的 16 个独立页面：

| 城市 | 页面路径 |
| --- | --- |
| 杭州 | `/cities/hangzhou/` |
| 上海 | `/cities/shanghai/` |
| 南通 | `/cities/nantong/` |
| 无锡 | `/cities/wuxi/` |
| 常州 | `/cities/changzhou/` |
| 南京 | `/cities/nanjing/` |
| 温州 | `/cities/wenzhou/` |
| 宁波 | `/cities/ningbo/` |
| 广州 | `/cities/guangzhou/` |
| 深圳 | `/cities/shenzhen/` |
| 北京 | `/cities/beijing/` |
| 山西大同 | `/cities/datong/` |
| 长沙 | `/cities/changsha/` |
| 武汉 | `/cities/wuhan/` |
| 青岛 | `/cities/qingdao/` |
| 大连 | `/cities/dalian/` |

城市选择页支持名称筛选和地区分组。独立页面共用交互与渲染入口，按当前城市动态导入对应的区域建模模块，只构建当前场景；选择页不会预先建立 17 座城市的三维模型。

### 苏州城市图谱 2.0

`v2/` 保留以本地预处理 OpenStreetMap 数据构建的苏州地理城市模型，与这组程序化微缩城市分别维护。从项目根目录启动其独立开发服务器：

```bash
npm run dev --prefix v2
```

访问 [http://127.0.0.1:5174/](http://127.0.0.1:5174/)。2.0 提供城区定位、地标搜索、图层切换与地理全域视角，没有第一人称漫游模式。单独构建及验证使用 `npm run build --prefix v2`、`npm run validate --prefix v2`。完整数据许可、23,898 栋建筑轮廓的范围与高度估算说明见 [v2/README.md](v2/README.md)。

## 操作

| 功能 | 操作 |
| --- | --- |
| 旋转、缩放、平移 | 左键拖动、滚轮、右键拖动 |
| 手机视角 | 单指旋转、双指缩放或平移 |
| 前往地标 | 点击场景标签、下方目的地或小地图标记 |
| 昼夜切换 | 顶部白昼 / 入夜，或 N |
| 重置视角 | 工具栏重置，或 H |
| 自动漫游镜头 | 左侧播放按钮；手动拖动暂停 |
| 步行 | 开启漫游，WASD / 方向键行走，拖动环顾 |
| 切换漫游起点 | 新增城市的漫游顶部选择框；可直接选择温州江心屿等离岸地标 |
| 步行加速 / 退出 | Shift / Esc；新增城市在触屏上提供拖动摇杆，原版苏州保留方向按钮 |
| 环境音 | 顶部声音图标，本地合成的轻水声 |
| 保存截图 | 工具栏相机，下载纯场景 PNG |

步行采用地面高度采样与建筑、水域边界检测，支持沿开放步桥过河和街巷探索。新增城市可从地标详情进入相应的步行观看点，漫游中也能从顶部选择另一处起点；原创店铺有实体柜台、书架或货架、可穿过的门口与室内空间。并非所有地标都可进入，海上大桥或文物建筑会使用岸边及庭院观看点。温州江心屿与陆地保持隔水关系，从起点选择框上岛后可以沿岛内步道行走。

## 模型与渲染

- 四面参数化曲面屋顶：翘角、屋脊、檐线、瓦垄；白墙、木窗格、灯笼与石基。
- 七层八角塔、空心连拱楼体、带拱洞和扶栏的桥、月洞门、亭、连廊、荷塘与假山。
- 分层沙盘底座、连续河网、有界湖面、植被、小岛、乌篷船、帆船、鸟群与夜间萤火。
- 根据材质合并静态几何；缓存日光阴影；PMREM 环境照明；程序化法线水面，按屏幕导数过滤小波纹。
- 夜间改变环境光、主光、局部光、窗户和灯笼自发光，灯具使用小型径向精灵光晕。没有屏幕后处理或 bloom。
- 默认最高 1.5 DPR / 2048 阴影；高画质最高 2 DPR / 4096 阴影。

新增城市采用共享几何工具与各自的程序化模型：例如上海环球金融中心的镂空顶部、广州塔网格结构、北京祈年殿的三重圆顶、青岛八角回澜阁和螺旋雕塑、大连双层悬索桥、大同三维九龙壁。城市差异体现在几何、街区、水岸和地景中。

三份研究文档记录参考来源、已核查的轮廓特征和艺术化重构范围：

- [江南六城：杭州、南通、无锡、常州、温州、宁波](docs/cities-jiangnan.md)
- [都市与江岸五城：上海、广州、深圳、长沙、武汉](docs/cities-metropolis.md)
- [北方与古都五城：南京、北京、大同、青岛、大连](docs/cities-north.md)

## 验证与复现

原版苏州：本地服务器运行时执行 `npm run validate`。脚本使用 Playwright 和本机 Google Chrome，检查真实 WebGL 渲染、视角操作、昼夜、六处书签、步行与碰撞、巡游、下载和手机布局。截图与测试记录保存在 `artifacts/`。

新增 16 城提供独立浏览器验证脚本。先在 `127.0.0.1:5173` 启动本地开发服务器，并确保当前 `ego-browser` 会话中已建立可用的 TaskSpace 2（脚本复用其中的 `p1` 页面，不创建新的 TaskSpace），再从项目根目录执行：

```bash
ego-browser nodejs < scripts/validate-cities.mjs
```

脚本逐城检查 WebGL 渲染及运行错误、地标镜头、昼夜切换、步行移动、起点切换、步行点与店铺碰撞状态、Esc 退出，并保存日景、地标近景、夜景和步行截图。默认输出目录为 `/tmp/city-validation`，结果写入其中的 `validation.json`。可编辑脚本顶部的 `config`，使用已建立的其他 TaskSpace、修改输出目录，或用 `onlyCities` 限定复测城市。Ego 的 Node 运行环境独立于启动它的 Shell。

浏览器结果以实际运行生成的 `validation.json`、进程退出状态和截图为准。运行 `node scripts/validate-city-geometry.mjs` 可另行检查顶点、法线、碰撞落点、道路中心线及 1 单位网格的步行连通性，报告写入 `artifacts/city-geometry.json`。温州三个离岸地标会明确记录上岛转移，并分别验证落点合法和岛内互通。

本次实际验收结果、手机触摸模拟和性能采样见 [多城市验收记录](docs/cities-validation.md)。

`?debug=1` 显示诊断面板。`?seed=91` 切换确定性植被种子；`?night=1` 从夜间开始；`?place=garden` 从园林开始。

浏览器控制台中的 `window.__SUZHOU__` 提供 `setTime(0)`、`goTo('garden')`、`setDebug('water-normals')`、`setDebug('wireframe')`、`setQuality('high')`、`metrics()`、`reset()` 等检查入口。恢复动画使用 `resume()`。

新增城市使用 `window.__CITY__`，提供 `places`、`shops`、`goTo(id)`、`getCamera()`、`getState()`、`isWalkable(x,z)`、`setTime(0)`、`setNight(true)`、`metrics()` 等入口。地标 ID 随城市而变，可从 `places` 读取；固定时间后使用 `resume()` 恢复动画。不要将新增城市接口与 2.0 页面同名的调试入口混为一组数据。

## 主要文件

- `src/geometry.js`：屋顶、建筑、亭、桥及几何合并工具。
- `src/world.js`：城市布局、地标、植被、水面、动态物体、步行地面与边界。
- `src/main.js`：光照、相机、交互、UI、检查入口。
- `src/style.css`：桌面与手机界面、昼夜配色。
- `cities.html`、`src/cities/gallery.js`：17 城选择页与筛选。
- `cities/*/index.html`：新增城市独立 HTML 入口。
- `src/city-entry.js`：新增城市共用的渲染、相机、昼夜、漫游、触屏摇杆和检查接口。
- `src/cities/catalog.js`：城市信息、页面路径和区域动态导入。
- `src/cities/city-kit.js`：新增城市共享材质、道路、水面、碰撞和场景组件。
- `src/cities/jiangnan.js`、`metropolis.js`、`north.js`：16 城的独立程序化地标和空间布局。
- `scripts/validate-cities.mjs`：新增 16 城的 ego-browser 验证脚本。
- `docs/cities-*.md`：模型清单、参考来源和重构边界。
- `v2/`：独立苏州地理城市图谱、离线地图数据与处理脚本。
- `VISUAL_CONTRACT.md`：视觉约定和实现边界。
- `artifacts/validation.json`：自动验证结果与实测性能。

渲染 API 参考 [Three.js 官方文档](https://threejs.org/docs/)。
