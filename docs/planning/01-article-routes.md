# 01 文章入口与链接迁移

状态：已完成（2026-10-31）。公共链接入口、页面移动、卡片接管与地址冲突检查已获复核；本任务验收完成，正式评论服务和文章清理安排交 07。前置：00。

先读 [总览](README.md)、[公共约定](COMMON.md)、[00 交接](00-shared-design.md)。主要功能代码已包含在 `4c3dc30`，共享文档基线在 `57532ba`；3 篇分页测试文章与本次验收记录一并纳入版本管理。未推送、未上线。

## 目标与边界

Blog 显示为“文章”；列表入口迁移至 `/article`，详情为 `/article/<现有 id>`。站内链接、RSS 与元数据保持一致。网站未上线，不保留旧 `/blog` 跳转。

不改首页/About 内容，不设计分类、多语言或专栏，不全面移除主题包。

## 已确认决策与接口

- 沿用现有文章 ID，发布后保持稳定；移动、改名文章文件前检查 ID 与网址的影响。
- 保留内部 `blog` 集合及 `src/content/blog/`，网址迁移不要求内部更名。
- `src/utils/articles.ts` 导出 `ARTICLE_ROOT = '/article'` 和 `getArticleUrl(id: string): string`，供卡片、RSS 与后续 02/04 使用。
- 导航、返回列表地址使用 `ARTICLE_ROOT`；详情链接使用 `getArticleUrl(id)`。
- 本轮保留原模板文章及用户要求保留的 3 篇测试文章，不在任务 01 执行清理；发布前由 07 确认最终处置。

## 已完成

| 文件 | 变更或职责 |
| --- | --- |
| `src/pages/article/[...id].astro` | 从 blog 目录移动，内容保持不变，生成文章详情 |
| `src/pages/article/[...page].astro` | 移动列表/分页路由，标题改为“文章”，增加冲突检查 |
| `src/components/article/PostPreview.astro` | 按需接管主题卡片，改用公共链接函数，保留来源许可与原样式 |
| `src/site.config.ts` | 导航显示“文章”，链接使用公共常量 |
| `src/layouts/BlogPost.astro` | 返回地址使用公共常量 |
| `src/pages/index.astro`、`src/pages/archives/index.astro`、`src/pages/tags/` | 引用本地卡片，更新文章入口与返回链接 |
| `src/pages/search/index.astro` | 更新返回文章列表的链接 |
| `src/pages/rss.xml.ts` | 使用公共函数生成文章链接 |

### 主题组件边界

- 安装包 PostPreview 写死 `/blog`，本地副本仅调整来源说明、导入位置和文章 href；未修改安装包。
- Hero 不含旧文章链接；ArticleBottom 从当前页面地址推导前缀，继续使用原组件。
- canonical 从当前页面路径生成；PageInfo 使用页面路径。评论客户端与统计的路径一致性已完成核对，详见下节。
- `site.config.ts` 在 Astro 初始化阶段不能解析此处的 `@/utils/articles`，实际使用 `./utils/articles` 相对导入；页面内保持别名导入。

### 分页地址冲突检查（已复核）

列表与详情共用 `/article/` 前缀。列表路由取得 `paginate()` 的实际页面名单后，用 Set 保存 `params.page`，再与文章 ID 比较；相同时抛出含冲突地址的错误，停止构建。

只拒绝实际冲突，不全面禁止数字 ID。例如不存在第二页时 ID `2` 可用；以后文章增多产生 `/article/2` 时，会报错要求修改文章 ID。此项规则已获用户复核。

## 验证结果

- 正常 `npm run build` 成功：134 文件检查为 0 errors / warnings / hints，生成 46 页。仍有原 Markdown 插件配置弃用提示，未改写。
- 产物列表标题为“文章 • ThRelic”；详情 canonical、6 篇文章 RSS 链接、站点地图中 7 个 article 地址一致。
- 扫描生成 HTML 的 href/content 未发现旧 `/blog` 地址；没有 `dist/blog` 或草稿文章 HTML。
- 浏览器实际验证列表卡片进入 `/article/markdown`，再返回 `/article`。
- 浏览器实际验证 `/article/using-mdx` → 下一篇 `/article/improve-concentration` → 上一篇返回原文章。
- 冲突负向验证：临时增加 3 篇文章，其中 ID 为 `2`，公开文章达 9 篇（每页 8 篇）；构建按预期失败，提示“文章地址与列表分页冲突：/article/2。请修改文章 ID。”临时文件全部移除后，正常构建通过，测试产物未残留。
- `git diff --check` 通过。冲突构建验证不代表分页浏览器交互已通过。
- 分页浏览器验收通过：另加 3 篇不冲突的 pagination-check-a/b/c 测试文章，公开文章共 9 篇，每页仍为 8 篇。第一页显示 8/9 篇，点击下一页进入 `/article/2` 显示 1/9 篇，再点击上一页回 `/article`；第一页无上一页，第二页无下一页。没有业务代码改动。
- 用户要求暂留这 3 篇测试文章便于后续测试，并随本次验收记录提交；它们非草稿、关闭评论，会进入预览、RSS 与搜索索引。正常构建生成 50 页。检出包含本次验收内容的版本共有 9 篇公开文章，可生成第二页；更早的功能提交仅含 6 篇公开示例文章。正式发布前确认测试文章处置，不自动删除。
- 上下篇首尾边界验收通过：按主题“置顶优先、再按发布日期”的完整文章列表，首篇为 `/article/3d-rendering`，只有下一篇并实际点击进入 `/article/pagination-check-a`；末篇为 `/article/markdown-zh`，只有上一篇并实际点击进入 `/article/markdown`。没有首尾循环或旧 `/blog` 路径。继续复用主题 ArticleBottom，无业务代码修改，本步未重复构建。
- 搜索验收：用户自行实际测试文章搜索及结果跳转，反馈没有问题；据此记录通过，不记为 Agent 独立执行的搜索测试。

### 评论路径核对

- 检查本地 Comment、PageInfo、site.config.ts 及已安装的 @waline/client 3.16.0。评论初始化未设置 path，additionalConfigs 也没有覆盖；Waline 默认使用 window.location.pathname（[官方属性说明](https://waline.js.org/en/reference/client/props.html#path)）。
- PageInfo 的服务端 data-path 使用 Astro.url.pathname；浏览器 commentCount、pageviewCount 均显式传入 window.location.pathname。当前文章标识随路由迁到 `/article/<id>`，没有旧 `/blog` 标识或需要迁移的正式历史评论。
- 浏览器打开 `/article/using-mdx?route-check=1#waline`，页面实际 pathname 和两项统计 data-path 均为 `/article/using-mdx`；评论表单和空评论列表出现，查询参数及锚点不进入标识，未捕获警告或错误。
- 再通过下一篇切到 `/article/improve-concentration`，两项统计 data-path 正确更新；点击评论锚点后评论表单正常挂载。未输入或提交评论、未点击反应按钮。本地 PageInfo 的浏览量更新配置为 false。
- 继续保留现有示例服务器配置，未新增业务代码。上述仅证明当前文章路径一致及组件加载，不等于自有正式服务、提交/回复、生产域名或尾斜杠行为已经端到端验收；这些交给 07 上线前处理。

## 对后续任务的交接

- 02/04 沿用 `blog` 集合、现有文章 ID 和 `src/utils/articles.ts` 的接口，新增分类/首页组件时不要重新拼接 `/blog`。
- 本地 PostPreview 已由项目接管，02 的卡片分类展示应在这里接续；列表侧栏入口为 `src/pages/article/[...page].astro`，不得丢失已复核的分页冲突检查。
- 原模板和 3 篇测试文章保留；07 发布前检查是否移除或排除测试内容，并重新核对 RSS、搜索索引与站点地图。测试文章非草稿、评论关闭，随验收记录纳入 Git。
- 07 必须使用自有 Waline 服务或关闭评论；若启用，验证正式域名的路径（含尾斜杠处理）、统计、提交/回复和服务可用性，不将示例服务器视为本站正式服务。
- 干净安装、npm 锁文件、GitHub Actions 和正式发布均未由 01 完成，仍在 07 范围内。
- 下一任务为 02 分类机制与列表侧栏；本会话未启动 02。

生产预览统一为 `http://127.0.0.1:4322/`，文章列表为 `/article`；服务运行状态现场检查。维护入口见上表，后续只推进当前小步，不提前实施 02–07。
