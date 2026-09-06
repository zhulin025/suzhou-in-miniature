# 姑苏小境 · Suzhou in miniature

以 Three.js 构建的苏州水乡微缩场景，包含古城水巷、拙政园意象、虎丘塔、东方之门、金鸡湖与太湖。建筑、树木、地形与船只均由代码生成，不依赖远程模型、贴图或音频。

这是艺术化缩景：地标采用可辨认的几何演绎，空间距离、建筑比例和地形经过重新编排，不是实测地图。

## 在线访问与部署

- 在线访问：[suzhou.liuwa.xyz](https://suzhou.liuwa.xyz/)
- 公开仓库：[zhulin025/suzhou-in-miniature](https://github.com/zhulin025/suzhou-in-miniature)
- Vercel 项目：`suzhou-in-miniature`，已连接上述 GitHub 仓库；推送到 `main` 分支会自动更新生产部署。
- 构建使用 Vite，运行 `npm run build`，输出目录为 `dist`。

## 本地运行

```bash
npm install
npm run dev -- --port 5173
```

访问 <http://127.0.0.1:5173/>。`npm run build` 生成本地生产构建，`npm run preview` 预览构建。

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
| 步行加速 / 退出 | Shift / Esc；手机提供方向按钮 |
| 环境音 | 顶部声音图标，本地合成的轻水声 |
| 保存截图 | 工具栏相机，下载纯场景 PNG |

步行采用地面高度采样与建筑、水域边界检测，支持沿拱桥高度过河与园林步道探索。

## 模型与渲染

- 四面参数化曲面屋顶：翘角、屋脊、檐线、瓦垄；白墙、木窗格、灯笼与石基。
- 七层八角塔、空心连拱楼体、带拱洞和扶栏的桥、月洞门、亭、连廊、荷塘与假山。
- 分层沙盘底座、连续河网、有界湖面、植被、小岛、乌篷船、帆船、鸟群与夜间萤火。
- 根据材质合并静态几何；缓存日光阴影；PMREM 环境照明；程序化法线水面，按屏幕导数过滤小波纹。
- 夜间改变环境光、主光、局部光、窗户和灯笼自发光，灯具使用小型径向精灵光晕。没有屏幕后处理或 bloom。
- 默认最高 1.5 DPR / 2048 阴影；高画质最高 2 DPR / 4096 阴影。

## 验证与复现

本地服务器运行时执行 `npm run validate`。脚本使用 Playwright 和本机 Google Chrome，检查真实 WebGL 渲染、视角操作、昼夜、六处书签、步行与碰撞、巡游、下载和手机布局。截图与测试记录保存在 `artifacts/`。

`?debug=1` 显示诊断面板。`?seed=91` 切换确定性植被种子；`?night=1` 从夜间开始；`?place=garden` 从园林开始。

浏览器控制台中的 `window.__SUZHOU__` 提供 `setTime(0)`、`goTo('garden')`、`setDebug('water-normals')`、`setDebug('wireframe')`、`setQuality('high')`、`metrics()`、`reset()` 等检查入口。恢复动画使用 `resume()`。

## 主要文件

- `src/geometry.js`：屋顶、建筑、亭、桥及几何合并工具。
- `src/world.js`：城市布局、地标、植被、水面、动态物体、步行地面与边界。
- `src/main.js`：光照、相机、交互、UI、检查入口。
- `src/style.css`：桌面与手机界面、昼夜配色。
- `VISUAL_CONTRACT.md`：视觉约定和实现边界。
- `artifacts/validation.json`：自动验证结果与实测性能。

渲染 API 参考 [Three.js 官方文档](https://threejs.org/docs/)。
