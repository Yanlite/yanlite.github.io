# 01 文章入口与链接迁移

状态：进行中。公共链接入口、页面移动与卡片接管已获复核；地址冲突检查已实现并验证，待用户复核；其余验收未完成。前置：00。

先读 [总览](README.md)、[公共约定](COMMON.md)、[00 交接](00-shared-design.md)。本任务的代码已包含在 `4c3dc30`，本地提交不代表验收完成；未推送、未上线。

## 目标与边界

Blog 显示为“文章”；列表入口迁移至 `/article`，详情为 `/article/<现有 id>`。站内链接、RSS 与元数据保持一致。网站未上线，不保留旧 `/blog` 跳转。

不改首页/About 内容，不设计分类、多语言或专栏，不全面移除主题包。

## 已确认决策与接口

- 沿用现有文章 ID，发布后保持稳定；移动、改名文章文件前检查 ID 与网址的影响。
- 保留内部 `blog` 集合及 `src/content/blog/`，网址迁移不要求内部更名。
- `src/utils/articles.ts` 导出 `ARTICLE_ROOT = '/article'` 和 `getArticleUrl(id: string): string`，供卡片、RSS 与后续 02/04 使用。
- 导航、返回列表地址使用 `ARTICLE_ROOT`；详情链接使用 `getArticleUrl(id)`。
- 原模板文章暂未删除，最终处置仍需确认。

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
- canonical 从当前页面路径生成；PageInfo 使用页面路径。评论客户端路径与统计的一致性仍需验收。
- `site.config.ts` 在 Astro 初始化阶段不能解析此处的 `@/utils/articles`，实际使用 `./utils/articles` 相对导入；页面内保持别名导入。

### 分页地址冲突检查（待复核）

列表与详情共用 `/article/` 前缀。列表路由取得 `paginate()` 的实际页面名单后，用 Set 保存 `params.page`，再与文章 ID 比较；相同时抛出含冲突地址的错误，停止构建。

只拒绝实际冲突，不全面禁止数字 ID。例如不存在第二页时 ID `2` 可用；以后文章增多产生 `/article/2` 时，会报错要求修改文章 ID。此项规则尚待用户复核，不将“已提交”视为“已复核”。

## 验证结果

- 正常 `npm run build` 成功：134 文件检查为 0 errors / warnings / hints，生成 46 页。仍有原 Markdown 插件配置弃用提示，未改写。
- 产物列表标题为“文章 • ThRelic”；详情 canonical、6 篇文章 RSS 链接、站点地图中 7 个 article 地址一致。
- 扫描生成 HTML 的 href/content 未发现旧 `/blog` 地址；没有 `dist/blog` 或草稿文章 HTML。
- 浏览器实际验证列表卡片进入 `/article/markdown`，再返回 `/article`。
- 浏览器实际验证 `/article/using-mdx` → 下一篇 `/article/improve-concentration` → 上一篇返回原文章。仅覆盖一组相邻文章，未覆盖首尾边界。
- 冲突负向验证：临时增加 3 篇文章，其中 ID 为 `2`，公开文章达 9 篇（每页 8 篇）；构建按预期失败，提示“文章地址与列表分页冲突：/article/2。请修改文章 ID。”临时文件全部移除后，正常构建通过，测试产物未残留。
- `git diff --check` 通过。冲突构建验证不代表分页浏览器交互已通过。

## 待办与下一小步

1. 用户复核列表路由中的冲突规则。
2. 使用不冲突的临时内容验证真实分页及往返，结束后清理并恢复正常构建产物。
3. 验证上下篇首尾边界、真实搜索结果与点击地址。
4. 核对评论客户端标识与页面统计路径；记录服务是否可用及验证范围，不提交测试评论至示例服务。
5. 明确模板文章的保留/删除安排，补齐验收后更新任务状态，再交接 02。

生产预览统一为 `http://127.0.0.1:4322/`，文章列表为 `/article`；服务运行状态现场检查。维护入口见上表，后续只推进当前小步，不提前实施 02–07。
