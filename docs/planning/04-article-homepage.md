# 04 临时文章首页

状态：功能已实现；构建及主要生产预览验证通过，待用户复核。前置：01、02、03。

先读 [总览](README.md)、[项目规则](../../AGENTS.md)、[00 交接](00-shared-design.md) 及前置任务的实际交接。先核对现场，再说明第一个小步；以下入口仅供调查，不是任意改写的清单。

## 目标与范围

将首页临时换为文章列表，沿用文章入口的数据和展示能力；不实现探索型主页。

## 分步推进

1. 对照原首页解释页面入口与组件组合，核对 03 已搬迁内容。
2. 提出首页与 /article 共用列表/分类组件的最小设计，避免复制两套内容规则。
3. 实现首页文章列表，核对分页、分类侧栏、文章跳转、返回导航。
4. 明确首页与文章入口的规范地址及元数据处理，并交接给 07 验证。

## 主要入口

src/pages/index.astro、01/02 的列表与分类能力、导航和页面元数据。

## 执行时才确定

复用方式、首页分页路径、与 /article 的地址关系及页面标题。不提前指定重定向或 canonical 实现。

## 验收

首页展示真实文章列表，草稿和分类规则与文章入口一致；空列表、分页、宽窄屏和链接正常。构建并验证生产预览。

## 边界

不恢复旧首页宣传模块，不引入关系图、推荐算法或新搜索浮层。

## 交接记录

### 实现与维护入口

- 首页通过 ContentLayout 已有 top 插槽展示站名和描述，section 使用 home-header 类。标题与描述读取 site.config.ts；独立文案可在 src/pages/index.astro 的 title/description 赋值处调整，样式在同文件的 .home-header、.home-header h1/p 中维护。
- 新增 src/components/article/ArticleList.astro，接收 page、categoryCounts、collectionsCount，统一渲染统计、归档入口、详细卡片、分页及分类侧栏。首页和 /article 共用该组件。
- 新增 src/utils/article-listing.ts 的 getArticleListing()，统一公开文章获取、置顶/日期排序及全量分类统计。首页和文章路由调用同一接口，首页按 blogPageSize 截取第一页；未配置页大小时沿用 Astro 默认 10。
- ContentLayout 新增可选 listing（默认 false）及 back=false。列表模式沿用 top 和基础布局，由列表组件负责下方两列，不包正文排版、目录侧栏和底部正文插槽；不显示目录开关。原 About/Profile 等调用仍走默认分支。
- 原首页模板模块停止展示；未清理无关组件或素材。测试文章、测试分类保留。

### 地址与元数据

- / 是带站点介绍的文章第一页入口；/article 继续作为完整文章入口。首页下一页进入 /article/2，第二页上一页回 /article；文章详情返回 /article，站点品牌与列表 Back 可返回首页。不生成 /2 或首页独立分页系列，不重定向已有页面。
- 沿用 BaseHead 按当前路径生成 canonical/og:url：首页为 https://yanlite.github.io/，文章入口为 https://yanlite.github.io/article，各分页保持自身地址。首页标题为“首页 • ThRelic”，描述读取站点配置；/article 标题及描述保留。
- 首页与文章入口是两个保留的页面，不合并 canonical；07 上线前继续核对部署域名、尾斜杠、站点地图与这些地址一致。
- 文章分页生成和已复核的地址冲突检查仍留在 src/pages/article/[...page].astro，未改变详情链接接口。

### 验证与边界

- npm run build 通过：69 文件检查零错误/警告/提示，生成 56 页；git diff --check 通过。原 Markdown 插件弃用提示保留。
- parse5 核对构建产物：首页与 /article 第一页 content 文本一致、首页唯一 h1、canonical 正确、旧 Get Template 模块消失。
- 生产预览实际验证：首页 8/9 → 下一页 /article/2 为 1/9 → Back 返回首页；末页只有上一页，链接为 /article。首页卡片进入 3d-rendering，正文 Back 返回 /article，再 Back 回首页。
- 首页桌面截图检查及窄屏截图检查通过；窄屏请求 390px 覆盖，实际 DOM clientWidth/scrollWidth 均为 375px，不宣称精确 390px 实测。分类入口位于列表前方，默认收起，可展开并点击草稿进入“暂无文章”分类页。临时视口覆盖已恢复。
- 未临时清空全站文章验证首页空列表；共用组件原有空列表分支保留，空分类页实际检查不能替代全站空列表测试。未重新全面验收 About/Profile、评论或系统减少动态效果偏好。
- 公共布局新增参数、首页文案/样式及地址选择待用户复核；实现完成不代表用户已掌握或能手动复现。下一任务仍按总览进入 05，本会话不开展该范围。
- 未提交、推送或上线。
