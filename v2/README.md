# 苏州 · 城市图谱 2.0

独立于「姑苏小境 1.0」的苏州地理城市模型。保留 23,898 栋真实建筑轮廓，覆盖 5 个市辖区、4 个县级市及单列的苏州工业园区。建筑、道路、河网与湖泊来自苏州及周边的 OpenStreetMap 数据，前端直接读取本地预处理文件，不需要地图 API Key，也不请求外部底图。

## 本地预览

在项目根目录执行：

```bash
npm run dev --prefix v2
```

访问 [http://127.0.0.1:5174/](http://127.0.0.1:5174/)。原版继续使用根目录自己的入口和 5173 端口。2.0 没有发布或部署。

```bash
npm run build --prefix v2
npm run validate --prefix v2
```

2.0 使用父项目已安装的 Three.js、Lucide、Vite、Playwright；也可在 `v2` 目录单独 `npm install`。

## 操作

| 功能 | 操作 |
| --- | --- |
| 自由旋转 | 左键拖动 / 单指拖动 |
| 拉近、拉远 | 滚轮 / 双指缩放 / 右侧加减按钮 |
| 平移 | 右键拖动 / 双指拖动 |
| 垂直俯瞰 | 右侧定位按钮 / T |
| 主城全景 | Logo / 右侧全景按钮 / H |
| 昼夜切换 | 顶部白昼、入夜 / N |
| 地标介绍 | 点击地图标签、地标模型，或搜索地标 |
| 城区定位 | 底部城区条，支持横向滚动；也可搜索城区 |
| 全域查看 | 底部「苏州全域」或小地图右上角 |
| 自动漫转 | 右侧旋转按钮 |
| 图层 | 左下建筑、水系、绿地、道路开关 |
| 保存场景 | 右侧相机按钮，下载 PNG |

支持主城、姑苏、金鸡湖、高新区、相城、吴中太湖、吴江、昆山、常熟、张家港、太仓与苏州全域书签。没有第一人称漫游模式。

## 数据尺度与边界

- OSM 苏州市行政关系：4430941。覆盖苏州市行政范围，包含所辖县级市。
- 数据坐标是 WGS84；离线使用 PROJ 横轴墨卡托投影（中央经线 120.65°，原点纬度 31.3°，比例因子 1）。前端使用同一投影级数，1 场景单位等于 1 米。水平、垂直没有夸张缩放。
- 建筑优先使用 OSM `height`，其次 `building:levels × 3.2 m`，缺失时按建筑用途使用确定性高度估计。当前 81 栋有高度记录、967 栋按楼层换算、22,850 栋按用途估算。
- 本地地景包含 10,327 个道路及铁路分段、3,837 个水面多边形、5,037 条水道和 3,540 个绿地多边形。它们是选定的已获取要素，不是完整路网或绿地普查。
- 按本次确认的规模冻结为 23,898 栋，不继续纳入查询到的全部 56,580 条记录。各区数量见 `public/data/coverage.json`；密度分布不均，主城与昆山更密，部分区域仅保留少量建筑。
- 只使用已有真实轮廓，不用随机建筑填补地图缺失。处理多面、多边形内洞、关系成员去重与最小面积校验。原始闭合环的极细节简化阈值为 0.15 米。
- 东方之门、国金中心、虎丘塔按公开介绍的高度制作可辨认的特征简模，替换对应 OSM 挤出模型，建筑布局来源仍可追踪。
- 窗户是程序化表达，亮灯占用使用稳定散列；窗宽与层距按米制计算，远处细节通过导数过滤防止闪烁。屋顶不会出现窗格灯光。
- 当前地形按平面处理；不包含实景纹理、准确建筑立面、室内或未收录建筑。1:1 指地理尺度，不代表完成了每栋建筑的实测复刻。

## 数据来源与许可

地图及建筑轮廓 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)，[ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)。处理后的源 ID、轮廓、高度及估算标识随 `public/data/footprints.json.gz` 提供；压缩渲染分块和地景数据属于同一派生数据库，按 ODbL 1.0 提供。数据获取时间、源文件散列、剔除原因与数量记录在 manifest 中。边界与湖泊保留邻接区域的地理上下文；建筑仅来自所选苏州记录。

地标内容参考：

- [东方之门 · 金鸡湖景区](https://jinjilake.sipac.gov.cn/zuixinzixun_article-342-3339.html)
- [苏州 IFS · CTBUH](https://www.skyscrapercenter.com/building/suzhou-ifs/196)
- [苏博建筑 · 苏州博物馆](https://dx.szmuseum.com/views/NewsDetails.aspx?guid=349a54de-f3f5-41bc-b86d-7c3488d3c0d6)
- [苏州古典园林 · UNESCO](https://whc.unesco.org/en/list/813)
- [虎丘塔 · 苏州市政府](https://english.suzhou.gov.cn/szsenglish/szgt/201611/5e2a12729cfe4151ad21506c251487ee.shtml)
- [金鸡湖城市地标](https://jinjilake.sipac.gov.cn/zuixinzixun_article-342-4252.html)

## 渲染与检查

建筑轮廓离线三角化为 4 km 地理分块，顶点位置采用分块局部坐标；法线、颜色、高度来源采用紧凑属性。浏览器解压 gzip 后直接构造 GPU 几何，不逐栋创建对象。视锥体裁剪按分块执行。标准画质远处隐藏亚像素支路，精细画质提高 DPR 和道路可见距离。无屏幕后处理，昼夜轮廓无需 bloom。

`?place=gate&night=1` 打开东方之门夜景；`?region=all` 打开全域视角；`?debug=1` 显示检查面板。调试模式提供高度来源（绿=已记录高度、蓝=楼层换算、橙=估算）、窗户发光隔离、线框及最终画面。`window.__CITY__` 提供书签、固定时间、相机、昼夜、画质和 metrics 接口。

`artifacts/validation.json` 保存浏览器检查、固定镜头帧时与几何指标。RAF 帧间隔、CPU 提交时间分别报告；未测量 GPU 时间时保持 null。原 1.0 文件的 SHA-256 对比记录用于验证原版没有改变。

## 重新获取与生成数据

已提交的本地数据可直接使用，不需要运行这些脚本。仅需要刷新数据时：

```bash
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python shapely pyproj numpy
# 不增加建筑：复用冻结的 buildings.json；只刷新选定道路
python3 scripts/fetch-map.py
.venv/bin/python scripts/prepare-data.py
node scripts/build-tiles.mjs
```

获取脚本按 ID 分批、串行下载、保存查询及断点缓存。请遵守公共 Overpass 实例的使用政策；收到限流时退避。原始缓存保存在 `data-cache/`，不用于前端运行。
