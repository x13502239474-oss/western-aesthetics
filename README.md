# 西方美学思想史 · 数字学院

一套以西方美学思想史为主线的自学课程站点。十个模块、九十六讲，把朱立元主编《西方美学史》、朱光潜《西方美学史》与黑格尔《美学》的知识体系重新编排成一条可从零走到底的路线。

## 怎么打开

直接双击 `index.html` 即可。纯静态站点，无需安装、无需服务器、可离线使用。

如果要放到 GitHub Pages：把整个 `west-aesthetics/` 目录内容推到仓库根目录（或 `docs/`），在仓库设置里开启 Pages 即可，全部路径都是相对路径，不需要改任何东西。

## 目录结构

```
index.html                 站点外壳（顶栏、页脚、搜索层、灯箱、SVG 图标库）
build.py                   内容构建管线：校验 → 打包 → 生成搜索索引
assets/
  css/classical.css        视觉系统（象牙白／羊皮纸／深棕／古典金）
  js/app.js                路由、视图、搜索、书签、阅读位置
  js/svgs.js               14 幅手绘 SVG 构图示意图（作品赏析用）
  js/data.js               构建产物，由 build.py 生成，不要手改
  art/                     预留：放入真实作品图片（见下）
content/
  modules/mNN.json         模块与讲次结构：标题、提要、要点、关联 id（唯一权威）
  lessons/mNN-lNN.md       讲义正文（YAML front-matter + Markdown）
  lessons/_SPEC.md         讲义写作规范（八段结构、容器语法、引文规则）
  refs/concepts.json       概念词典 245 条
  refs/people.json         人物索引 142 位
  refs/schools.json        流派索引 17 个
  refs/timeline.json       思想史时间轴 59 条
  refs/readings.json       经典原著导读 11 部
  refs/artworks.json       艺术作品赏析 14 件
  refs/_SPEC.md            词典与索引数据规范
  refs/_hegel-quelle.txt   黑格尔《美学》汉译全文（26 万字，供引文逐字核对）
tools/                     辅助脚本
```

## 改内容以后要重新构建

```bash
cd west-aesthetics
python build.py            # 校验并重新生成 assets/js/data.js
python build.py --check    # 只校验，不写文件
```

构建会做这些检查，任何一条不过就报错退出（不会写出半成品）：

- 模块 JSON 的语法与字段完整性；讲次编号是否连续
- 讲义文件名是否对应已有讲次；front-matter 标题是否与结构文件一致
- 正文是否短于 1200 字（不足一讲）、八段结构关键词是否齐全
- 每一讲引用的概念／人物／原著／作品 id 是否真实存在
- 词典条目必填字段是否齐全

结束后会打印：模块数、讲次数、已有正文的讲次数与总字数、各类词条数与索引条数。

## 新增一讲

1. 在 `content/modules/mNN.json` 的 `lessons` 数组里加一项（`title` `subtitle` `summary` `points` 必填）。
2. 新建 `content/lessons/mNN-lXX.md`，按 `content/lessons/_SPEC.md` 的八段结构写正文。
3. 运行 `python build.py`。

顺序即编号：第 3 个对象就是 `m01-l03`，不需要手写 id。

## 引文规则（重要）

- 黑格尔原文必须先在 `content/refs/_hegel-quelle.txt` 里检索确认逐字一致，标注卷次与篇目位置，**不标页码**。
- 其他原典只引有把握的通行中译，标注篇名章节；没有把握逐字就写成转述并注明「大意是」。
- 不使用虚构的页码、卷次、版次。研究者解释与原典引文在版式上分开（引文用独立引文块，解释用正文行文）。

## 关于作品图片

外链图片在本机不可用，因此赏析区目前全部使用**手绘 SVG 构图示意图**（`assets/js/svgs.js`），它们标出构图轴线、比例分割、光源方向、结构受力与镜头切分，不是原作复制，允许夸张，夸张处均在图中注明。

若要换成真实图片：把图片放进 `assets/art/`，在 `svgs.js` 里把对应 id 的 SVG 换成 `<img>` 或改用 `assets/art/文件名.jpg` 的 `<figure>` 即可，灯箱与放大逻辑（`app.js` 的 `openLB`）对两者都适用。

## 已知边界

- 四份 PDF（朱立元本、朱光潜本、黑格尔第二卷与第三卷上下）都是无文字层的扫描件，本机无 OCR 工具，因此这三部书的**结构信息来自目录页影像核读**，正文观点靠通行学术理解转述，不逐字引用、不编造页码。
- 黑格尔《美学》的 EPUB 是完整文字版，序论部分已提取为 `_hegel-quelle.txt`，第一至三卷正文未包含在内。
- 96 讲中已有 25 讲为完整讲义（模块 1–3），其余 71 讲为已定稿的提要与要点，正文分批撰写。站点对两种状态有明确标识，不把纲要伪装成正文。

## 站点不做什么

没有习题、测验、考试、打卡、积分、排行榜、学习计划与进度考核。收藏、书签与阅读位置只保存在本机浏览器（localStorage），不上传，可随时在「书签」页删除。
