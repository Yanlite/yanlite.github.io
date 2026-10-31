# 02 分类机制与列表侧栏

状态：已完成；按收尾清单保留现状，未点名事项不再修改。分类功能、旧标签清理、源码副本移除及验收交接完成；测试覆盖边界与保留事项见文末。前置：01。

阶段保存：`7aa34aa` 保存分类功能、对应修复及规则整理；`daae717` 保存旧标签清理和检查范围调整；`b876105` 保存源码副本移除及对应配置清理。当前收尾文档与用户新增测试分类尚未提交，未推送或上线。下方各小步的状态为实施当时的记录，当前状态以本节及文末收尾交接为准。

先读 [总览](README.md)、[项目规则](../../AGENTS.md)、[00 交接](00-shared-design.md) 及前置任务的实际交接。先核对现场，再说明第一个小步；以下入口仅供调查，不是任意改写的清单。

## 目标与已确认规则

Tag 机制改为统一分类机制，侧栏文字改为“分类”，采用列表式排版。

- 分类支持父子层级，文章支持多归属，集中维护稳定标识和显示名。
- 分类按文章填写顺序展示，卡片最多两个；文章页可查看全部归属。
- 全部归属参与检索和统计；父分类包含后代文章并去重，作者不重复填写祖先。
- 暂不新增独立标签系统，不提前实现专栏。

## 分步推进

1. 先沿原 tags 字段 → 主题汇总函数 → 本地标签页面/侧栏 → Hero/PostPreview 展示讲解，明确改造范围。
2. 提出分类数据、引用校验和旧 tags 的迁移方案，展示一小组示例供复核；具体字段与目录到此才定。
3. 接入分类查询、数量和详情列表，处理不存在的引用、父级循环、多归属去重及草稿过滤。
4. 改造侧栏为分类列表，说明层级展示、当前项状态、小屏行为；卡片和文章头部同步消费分类。
5. 核对旧标签地址与内部链接，保留未迁移内容的可用性。接管主题组件时列出实际改动，不直接修改 node_modules。

## 主要入口

src/content.config.ts、src/content/blog/、src/pages/tags/、文章列表侧栏、BlogPost、Hero/PostPreview；具体新文件由方案确定。

## 执行时才确定

数据字段与存储位置、分类详情 URL、旧标签迁移、列表展开方式和空分类展示。沿用 01 的文章身份与链接规则。

## 验收

分类树、多归属、父级统计、卡片上限、完整归属和草稿处理一致；桌面/小屏列表可用；旧标签数据及路径有明确处置。构建并验证生产预览，交接供 04 复用的列表/分类能力。

## 交接记录

### 已确认设计（2026-10-31）

- 每个分类最多一个父级，文章可以引用多个分类。
- `src/data/categories.ts` 集中维护 `id`、`name`、可选 `parent`；文章 frontmatter 使用有序的 `categories` ID 数组。省略数组时视为空数组。
- 显示完整祖先路径，例如“技术 > 前端”；每个路径节点分别链接对应分类，分隔符不链接。卡片最多显示两条直接归属路径，文章头部显示全部。
- 分类 ID 使用小写字母、数字、单个连字符；未知引用、重复引用、重复 ID、空显示名、无效父级和循环均报错。
- 现有标签先迁成同名顶层分类，不推断父子关系，不翻译模板标签。
- 分类总览 `/category`，详情 `/category/<id>`，分页 `/category/<id>/2`；父子关系不编码进 URL。实际消费者迁移并核查后移除旧 `/tags` 页面，不保留跳转。
- 分类详情目录按确认选择使用 `[...category]`；分类 ID 的现有单段校验不变，不因此允许 ID 包含 `/` 或把父级写入地址。
- 分类总览采用可折叠树形列表：默认只显示顶层；展开父级后才显示子分类，各层独立展开。分类名仍链接文章列表，箭头/行内空白用于展开；卡片及文章头部的完整分类路径规则不变。

### 分类基础（暂且通过复核）

- 新增 `src/data/categories.ts`：登记原有八个标签（含草稿专用分类），作为手动维护分类入口。
- 新增 `src/utils/categories.ts`：`Category` 类型及 `createCategoryCatalog(definitions)`；返回 `getCategory(id)`、根到叶的 `getPath(id)` 和 `validateReferences(ids)`。
- `src/content.config.ts` 加载并校验完整分类表；文章引用由 schema 校验，草稿同样经过内容校验。文章输入旧 `tags` 字段会被拒绝，避免遗漏迁移后静默丢失归属；Docs 的 tags 规则不变。
- 六篇原有文章（含草稿）从 tags 迁为 categories，顺序不变；原无标签文章仍为空分类。
- 临时过渡：schema 从 categories 派生输出 tags，继续供未改造的主题工具、Hero 和本地标签页面读取。作者只维护 categories。过渡 tags 仅含直接归属，尚未接入新的父级查询；界面接入完成后移除此桥接。
- 新增 `tests/categories.test.mjs`：独立校验分类表与引用，不依赖 Astro 服务；运行 `node --test tests/categories.test.mjs`（当前 Node 24 支持直接加载所引用的 TypeScript 工具）。

### 分类查询与统计（已通过复核）

- 分类目录新增 `getPosts(posts, categoryId, options?)`：包含直接归属和任意层后代，按文章 ID 去重，保留输入顺序和完整文章对象，不修改输入数组。
- 新增 `getCounts(posts, options?)`：对全部定义的分类复用 getPosts 统计，包含零数量项。是否展示空分类留给界面方案。
- options 的 `includeDrafts` 默认 false，开发页面需要包含草稿时显式传 true；查询不能恢复调用方已过滤掉的草稿。查询依赖 schema 已完成引用校验，生产列表和统计应使用同一批文章和相同选项。
- 六组 Node 测试通过，新增覆盖三级分类、同篇命中兄弟分类、重复输入文章、仅归属父级、不向子级扩散、空分类、无分类、草稿选项、顺序和输入不变。
- 新增注释使用中文；仓库 AGENTS.md 已记录该约定，原来源许可保留。

### 基础查询阶段的验证与遗漏

- 六组 Node 测试通过，覆盖分类定义、祖先路径、引用与新增查询/统计行为。
- 新增查询后 `npm run build` 通过：Astro 检查 137 文件，0 errors / warnings / hints，生成 50 页；原 Markdown 插件配置弃用提示仍在。
- `git diff --check` 通过。未新增层级界面，未运行浏览器交互验收；构建成功不代表 02 整体验收完成。
- 尚未对实际错误 Markdown 执行负向构建；目前负向检查覆盖工具函数，正常构建覆盖 schema 接入与迁移数据。
- 未提交、推送或上线。

### 分类页面接入（新增代码待复核）

- `src/utils/category-catalog.ts` 导出共享 categoryCatalog，供内容校验和新页面共用；原有工厂及查询行为不变。查询涉及的 CategorizedArticle / CategoryQueryOptions 类型增加 export，满足项目类型声明生成要求。
- `src/utils/category-links.ts` 导出 CATEGORY_ROOT 与 getCategoryUrl(id)，集中生成分类链接。
- `src/components/category/CategoryPath.astro` 根据 ID 显示根到叶路径，各节点链接自己的分类；current 参数为最后一个节点标记 aria-current。
- 新增 `src/pages/category/index.astro` 和 `src/pages/category/[...category]/[...page].astro`：总览显示全部定义及文章数量，详情包含后代文章并分页，空分类也生成第一页并显示“暂无文章”。
- 新页面查询显式使用 blog 集合，排序沿用主题置顶优先/发布日期规则；排序函数显式指定 blog 类型，避免类型推断扩大到 Docs。生产排除草稿，开发显式包含草稿，两页使用一致选项。
- 页面最初接入时仍复用原 PostPreview，卡片、侧栏、Hero、旧标签页及 schema 桥接暂留；后续迁移状态见下方各小步，不将页面接入视为 02 完成。
- 正常配置每页 8 篇构建通过：142 文件检查无 errors / warnings / hints，生成 59 页；六组基础测试继续通过。
- 生产预览实际点击 `/category` → markdown（2 篇）→ 全部分类 → draft（暂无文章），数量与草稿过滤符合预期。
- 分类分页实际往返验证通过：临时将 blogPageSize 从 8 改为 2 并构建，example 共 3 篇；第一页 2/3，下一页 `/category/example/2` 为 1/3，再点上一页返回。首页无上一页、末页无下一页。随后恢复原配置（Git 确认 site.config.ts 无差异）；不保留临时每页 2 篇配置。
- 恢复每页 8 篇后重新构建成功（142 文件检查无错误/警告/提示，59 页），浏览器重新加载 example 显示 3/3、无分页按钮。分类总览窄屏截图检查未见横向溢出；桌面及层级长路径仍待后续界面验收。
- 目录采用 `[...category]` 后重新构建成功：142 文件检查无错误/警告/提示，仍生成 59 页，分类总览及八个详情地址与改名前一致。本次仅验证正常配置构建，未重复临时每页 2 篇的浏览器分页测试。
- 页面最初接入时分类表全部为顶层分类；后续现场已有 `3d.parent = 'technology'`，该设置保留，并用于下述树形总览验证。

### 分类总览折叠树（已继续推进）

- 新增 `src/components/category/CategoryTree.astro`，`src/pages/category/index.astro` 从平铺路径改为调用分类树。分类定义与查询规则未改动，未改卡片、文章头部或文章列表侧栏。
- 分类树按 parentId 筛出直接子分类，兄弟节点保留定义顺序；有子分类时用原生 details/summary 默认收起，并通过 Astro.self 递归渲染下一层。无子分类时只显示链接及数量。没有新增客户端脚本或展开状态持久化。
- 原生 summary 支持键盘焦点与回车开关；分类名称保留独立链接。树中用缩进表达层级，详情页继续显示完整路径。
- `npm run build` 通过：143 文件检查无 errors / warnings / hints，生成 59 页；原 Markdown 插件弃用提示仍在。`git diff --check` 通过。
- 生产预览实际验证：默认不显示 3d；展开 technology 后显示 3d；回车收起/展开均正常。technology 显示 2 篇、3d 显示 1 篇。
- 点击树中的 3d，进入 `/category/3d`，头部显示 technology > 3d、列表 1 篇；点击路径中的 technology 进入父级列表 2 篇。另验证树中父分类名称直接进入列表，不触发展开。
- 桌面及 390px 窄屏截图检查，展开后的名称、数量和缩进可见，未见横向溢出；临时视口覆盖已恢复。当前浏览器样例覆盖两级，更多层级的实际交互尚未验收。

### 文章及分类列表侧栏（已通过复核）

- 新增 `src/components/category/CategorySidebar.astro`，由文章列表及分类详情共用。桌面为右侧分类列表，小屏在文章列表前显示默认收起的“分类”入口；两种 CSS 布局共用分类树，仅对应布局可见，无新增客户端脚本。
- `CategoryTree` 新增可选 currentId：以 aria-current 标记当前项并加粗着色，按当前项的祖先路径设置 details 初始展开。未传 currentId 的总览和完整文章列表仍默认收起；展开状态不持久化。
- 两类列表在 getStaticPaths 中对完整文章列表计算 categoryCounts，再随分页 props 交给侧栏；不以当前页文章计算数量。零数量分类目前继续显示，包含 draft 0 篇。
- 文章列表移除旧标签汇总与按钮侧栏，保留原文章分页冲突检查、完整文章数及每页 8 篇配置；分类详情保留空分类页面与已有分页。
- 保留现场的 `3d.parent = 'technology'`，以及路径分隔符 `›`、分类详情标题 `分类 | …` 和说明文字调整。
- `npm run build` 通过：144 文件检查无 errors / warnings / hints，生成 59 页；原 Markdown 插件弃用提示仍在。`git diff --check` 通过。
- 浏览器桌面验证：文章列表侧栏展开 technology 并进入 3d；详情父级自动展开，可见侧栏仅 3d 标记当前项，technology 2 篇 / 3d 1 篇。截图检查布局正常。
- 390px 窄屏验证：分类入口位于文章列表前且默认收起；展开后可见当前分类及祖先，点击 technology 成功切换父级文章列表。截图未见横向溢出；视口已恢复。
- 文章分页往返 `/article` → `/article/2` → `/article` 通过：8/9 与 1/9 正确，第二页侧栏仍显示全站统计（example 3、markdown 2、technology 2），不是当前页数量。
- 侧栏阶段结束时，卡片与 Hero 尚未迁移，旧标签页与 schema 派生 tags 保留；本小步不代表 02 全部完成。未提交或推送。

### 卡片分类迁移（已通过复核）

- 修改项目已接管的 `src/components/article/PostPreview.astro`，从 categories 按填写顺序取前两项，通过 CategoryPath 显示完整路径。slice(0, 2) 仅产生展示数组，不修改文章数据或统计输入。
- 最初实现时详细和简版均显示分类；后续已明确分类属于简版省略内容，当前仅 detailed 卡片显示分类，无归属时不显示。一条直接归属的完整祖先路径算一项，不按路径节点数限制。
- 外层 post-card 负责原边框、内边距和悬停样式；文章主链接包裹图片、标题等信息，分类列表为其兄弟元素。移除原 object 标签容器及嵌在主链接内的分类链接，不新增客户端脚本。
- 保留源码来源与许可说明，新增注释使用中文。未迁移 Hero、Pagefind 分类元数据或旧标签路由，未移除 schema 桥接。
- `npm run build` 通过：144 文件检查无 errors / warnings / hints，生成 59 页；原 Markdown 插件弃用提示仍在。`git diff --check` 通过。
- 生产预览核对文章列表全部卡片：3d 文章为 example、technology › 3d 两条路径；improve-concentration 为 example、mind（不显示第三项 mood）；music-journey 为 example、music（不显示第三项 technology）。无归属文章不出现空分类列表。
- 实际点击详细卡片中的父分类 technology、子分类 3d，分别进入正确分类列表；点击文章主链接进入 3d-rendering 正文。分类列表复用卡片保持相同行为。
- 首页 9 张简版卡片 DOM 核对完整路径和两条上限，从首页简版卡片实际点击 3d 跳转成功；归档 9 张卡片核对最大两条、无旧 /tags 链接。桌面文章列表曾做截图检查，但没有对照原图片尺寸，漏检了下述定位容器回归，不能将该次检查记为图片尺寸验收通过。
- 390px 窄屏 DOM 检查：分类行 clientWidth/scrollWidth 均为 310，页面宽度未超过视口，无已检出横向溢出。截图接口重试后仍报 Unable to capture screenshot，因此未完成本步窄屏视觉验收，不把 DOM 尺寸核对记作截图通过；临时视口覆盖已恢复。

### 卡片图片回归修复（已随卡片通过复核）

- 反馈卡片图片大小变化；原因是分类迁移时给内层 article-link 新增 relative，导致 absolute 封面以内部链接为定位容器，而非整张 post-card，百分比宽高与偏移均变化。
- 修复仅让 article-link 保持静态定位，将移动端 pt-24 留白恢复到 post-card；图片继续位于主链接内，分类列表仍为主链接的兄弟。新增中文注释说明定位约束，未变更图片原有比例和遮罩规则。
- `npm run build` 通过：144 文件检查无 errors / warnings / hints，生成 59 页。
- 桌面尺寸对照：首卡约 756×202，错误时图片约 429×124、顶部和右侧各内缩约 21；修复后约 453×201，贴合卡片内边缘，符合右侧宽 60%、高 100% 的原规则。
- 390px 窄屏对照：首卡约 343×292，图片约 342×194，符合整卡宽和约 2/3 高度。桌面、窄屏截图已实际补验；此前的窄屏截图限制本次已解除。视口覆盖已恢复。
- 窄屏实际点击封面进入 3d-rendering 正文，返回后点击卡片分类 3d 进入分类列表，确认图片没有遮挡独立分类链接。未继续文章头部迁移。
- 同期按要求合并公共规则入口，具体文档整理见 00 追加记录；卡片及该修复仍待复核。未提交或推送。

### 下一复核点与待办

本任务已按文末清单收尾，不再新增功能或补做未点名的测试。后续按总览进入 03，04 在满足前置后复用下述接口；保留事项不作为 02 阻塞项。

### 卡片分类参考样式（已随卡片通过复核）

- 根据参考图，将卡片分类从底部胶囊改为正文信息上方的“文件夹图标 + 灰色路径”，移除每项边框、背景及内边距；多条路径横排，空间不足时换行。后续明确该区域只用于详细卡片，简版省略。
- 修改仍集中在 `src/components/article/PostPreview.astro`：分类列表移到文章主链接前，保持两者为兄弟；分类行设置层级，确保显示于封面上方。主链接不加 relative，整卡仍为图片定位基准；保留最多两条、填写顺序、完整路径及各级链接。
- 用内联 SVG 绘制装饰性文件夹图标，沿用站点灰色文字与主题悬停色，无新增图片资源或客户端脚本。按当前反馈标注代码分块职责，注释规范尚未写入规则文件，等待确认。
- `npm run build` 通过：144 文件检查无 errors / warnings / hints，生成 59 页；原 Markdown 插件弃用提示保留。`git diff --check` 通过。
- 桌面、390px 窄屏已查看截图；DOM 确认分类行位于文章主链接前，卡片最多两条，窄屏分类行未溢出。桌面图片比例仍约 60% 宽、整卡高。
- 窄屏从卡片点击 3d 进入分类列表，再点文章主链接进入 3d-rendering 正文，确认两种链接正常。临时视口覆盖已恢复。未提交或推送。

### 简版卡片范围修正

- 已明确分类属于简版卡片省略的部分；分类行条件改为 `detailed && categoryIds.length > 0`。首页及归档不传 detailed，因此省略分类；文章列表、分类详情及过渡标签列表传 detailed，继续显示文件夹与灰色路径。
- 此项覆盖上方早期简版分类显示记录，文章完整归属、查询统计、两条上限与详细卡片样式均不变。
- 构建通过（144 文件检查无错误/警告/提示，59 页）；生产预览 DOM 核对：首页、归档各 9 张简版卡片均无分类行，文章首页 4 张有归属的详细卡片保留分类行。未提交或推送。

### 文章头部与搜索分类（已通过复核）

- 新增 `src/components/article/Hero.astro`，按需复制安装包 astro-pure 1.4.9 的头部组件，注明来源、Apache-2.0 许可和实际改动，分块注释使用中文。未修改安装包文件。
- `src/layouts/BlogPost.astro` 仅将 Hero 导入改为项目副本；原调用参数、插槽及其他组件调用保留。
- 本地 Hero 改读完整 categories，按文章填写顺序显示全部文件夹与祖先路径；无分类不显示该区域。封面、日期、阅读时长、语言、描述及 description 插槽、模糊图滚动动效沿用原实现。
- `CategoryPath` 新增可选布尔参数 searchFilter（默认 false）。仅文章头部启用，为每个路径节点输出 `data-pagefind-filter="category"`，以节点显示名作为筛选值；包括祖先和全部直接归属。卡片、分类页等导航默认不输出搜索标记。
- Pagefind 支持从元素文字提取筛选值，依据：[官方筛选说明](https://pagefind.app/docs/filtering/)。文章头部不再生成原 tag 筛选键；搜索组件继续复用主题 PFSearch，界面目前自动显示 Category，中文化交 05。
- `npm run build` 通过：145 文件检查无 errors / warnings / hints，生成 59 页；原 Markdown 插件弃用提示仍在。`git diff --check` 通过。
- 浏览器核对 improve-concentration 头部显示样例、思想、情感三项，每项都有 category 标记和对应链接；第三分类可进入分类列表。正文、封面、日期和评论统计插槽仍出现，未提交评论。
- 搜索实际输入 concentration，展开 Category 并勾选情感，仍返回 improve-concentration，证明卡片未显示的第三分类已参与筛选。
- 搜索 rendering 并勾选父级技术后，结果缩为 1 篇 3d-rendering；该文头部路径包含样例、技术、3D 三个搜索节点，父级归属进入索引。Docs 当前仍可被未筛选搜索命中，隐藏排除继续交 06，未提前实施。
- 无分类的 using-mdx 头部不出现空分类行。桌面及 390px 窄屏截图已核对 improve-concentration 的三项分类、封面和标题；窄屏分类行 clientWidth 与 scrollWidth 相同，无横向溢出。临时视口覆盖已恢复。
- 本小步不删除旧标签页面或 schema 的临时 tags 派生，不继续依赖本地 Hero 开展清理，先留出复核点。未提交或推送。

- 清理前核对：src 中实际使用文章 tags 汇总和旧 /tags 链接的入口仅余 `src/pages/tags/index.astro` 与 `src/pages/tags/[tag]/[...page].astro`；主题工具内部仍定义标签汇总函数，未修改安装包。待移除本地调用后验证构建依赖，不能仅凭文本搜索宣称兼容层已可安全移除。

### 旧标签机制清理与检查范围调整（配置待复核）

- 删除 `src/pages/tags/index.astro` 与 `src/pages/tags/[tag]/[...page].astro`，旧地址不提供跳转；分类统一使用 /category。
- `src/content.config.ts` 删除从 categories 派生 tags 的临时 transform，保留 `tags: z.never().optional()` 拒绝旧输入。Docs 集合原 tags 及其去重函数保留；分类定义和文章归属未改动。
- 首次构建失败：原 tsconfig include 扫描全仓库，`packages/pure` 中旧 Hero、PostPreview 和标签工具仍依赖 tags，报出 6 项类型错误。核对真实路径确认它与 `node_modules/astro-pure` 是独立目录；当前主题解析到安装包，应用、配置和预设脚本没有引用 packages/pure。
- `tsconfig.json` 在 exclude 中新增精确目录 `./packages/pure`，不改 include、严格选项或 src 检查；对未导入的上游源码副本停止初始扫描，保留文件作为参考。未修改安装包或原主题源码。
- exclude 影响 include 的初始文件收集，不能阻止显式导入重新纳入检查；语义依据：[TypeScript 官方说明](https://www.typescriptlang.org/tsconfig/#exclude)。将来若改为链接/开发上游源码，需要重新评估这条排除。
- 重新 `npm run build` 通过：64 个应用相关文件检查无 errors / warnings / hints，生成 51 页。此前检查数包含上游副本；页面数从 59 减少 8 页，符合旧标签总览及 7 个公开标签详情的删除范围。原 Markdown 插件弃用提示保留。
- parse5 解析全部 51 个构建 HTML，未发现指向本站 /tags 的实际 href；XML 未发现旧标签网址，dist/tags 不存在。src 的 Astro/TypeScript 实际页面与组件未再使用 /tags 或标签汇总函数。
- 现场预览服务已停止，确认后重新启动固定 4322。HTTP 检查：/tags、/tags/example 为 404；/category、/category/technology、/article、/article/2、/docs 为 200。
- 浏览器实际从分类总览点击技术（2 篇）并进入 3d-rendering 正文；头部仍有完整分类路径，当前正文没有旧标签链接。
- `git diff --check` 通过。此小步新增清理及配置改动按要求提交保存；检查范围复核及源码副本处理仍需承接，再继续剩余验收。

### 移除未使用的主题源码副本（待复核）

- 对比仅排除类型检查、增加导入拦截、移至仓库外归档、从当前仓库移除四种方案后，采用移除方案：不新增拦截插件，继续使用安装包，所需组件按需接管。源码可从此前 Git 提交恢复。
- 删除 `packages/pure` 的 84 个受跟踪文件；删除前工作区干净，确认目录不是链接。未修改 `node_modules/astro-pure` 或已接管的组件。
- `tsconfig.json` 撤掉此前新增的 packages/pure 排除项及其说明，其他检查配置不变；同步项目规则中的主题来源与接管入口。
- Node 解析 `astro-pure` 和 `astro-pure/components/pages` 均指向 node_modules 中的安装包。源码目录已不存在。
- `npm run build` 成功：64 文件检查无 errors / warnings / hints，生成 51 页，与移除前一致；原 Markdown 插件弃用提示仍在。`git diff --check` 通过。本步未改界面或交互，未重复浏览器验收。
- 原主题 Docs 中有关本地包开发的说明暂保留，属于主题文档而非本项目操作规则；Docs 的隐藏与搜索排除仍交 06。
- 本小步未提交或推送。先复核目录移除与配置清理，再开展 02 剩余验收。

### 实际 Markdown 未知分类引用验证

- 临时新增 category-invalid-probe.md，其他必填字段正常，设置 `draft: true`、`comment: false`，分类仅填写不存在的 `category-does-not-exist-probe`。
- `npm run build` 退出码为 1：内容同步阶段报 InvalidContentEntryDataError，明确定位临时 Markdown 文件，并提示“文章引用不存在的分类：category-does-not-exist-probe”。证明校验接入真实内容链路，草稿也不会绕过引用校验。
- 首次沙箱构建被 Astro 配置目录的 EPERM 阻止，未作为分类验证结果；随后在允许的沙箱外构建中得到上述预期错误。
- 已删除临时文件，正式文章无 Git 差异；恢复后构建通过，64 文件检查无 errors / warnings / hints，生成 51 页。原 Markdown 插件弃用提示仍在。未修改业务代码或提交 Git。
- 本步只验证未知引用；重复引用、分类定义错误等仍以已有工具测试覆盖，未宣称完成所有负向构建或 02 整体验收。

### 三级分类手动验收

- 用户反馈三级分类测试完成、没有问题，记录为用户手动验收通过；未追加推定具体浏览器、视口或逐项操作记录。
- 现场分类表含 test-a → test-b1 → test-c 三级关系，以及 test-a 下的 test-b2 兄弟分类；这些为用户新增测试数据，本轮保留，不擅自删除或修改。
- 三级分类的实际界面验证不再列为待办；测试分类是否保留仍需在最终收尾时确认。此次仅更新文档，未重新构建或重复浏览器测试。

### 最终收尾与后续复用

- 收尾清单已确认：未点名内容保持现状。保留 test-a、test-b1、test-b2、test-c 四个测试分类，不自动清理；正式发布前由 07 统一核对测试内容的处置。
- 分类树、侧栏、父级统计、多归属去重、分页、空分类、详细卡片前两项与正文完整归属、搜索父级与第三归属、草稿过滤均有前述测试或页面验证；三级分类由用户手动验收通过。
- 未知分类引用经过实际 Markdown 负向构建；重复引用、无效定义、循环等以已有工具测试覆盖，不宣称逐项完成实际构建测试。最后一次 Agent 正常构建为 64 文件检查零错误、51 页；其后用户新增三级测试分类并反馈通过，未再由 Agent 重跑构建。
- 原主题 Docs 的本地包开发说明保留，隐藏与搜索排除交 06；Markdown 插件弃用提示不在本任务处理；搜索筛选与列表中现存英文界面交 05。
- 手动数据入口：`src/data/categories.ts` 维护 ID、显示名与父级；文章 frontmatter 的 categories 数组维护有序归属。路径分隔符在 `src/components/category/CategoryPath.astro`。
- 共享查询入口：`src/utils/category-catalog.ts` 导出 categoryCatalog；`getPosts(posts, categoryId, options?)` 返回父级及后代去重文章，`getCounts(posts, options?)` 返回含零数量项的 Map。includeDrafts 默认 false；统计用全量文章，不使用分页后的 page.data。
- 组件入口：`CategorySidebar.astro` 接收 counts 和可选 currentId；`CategoryPath.astro` 接收 categoryId、可选 current 和 searchFilter。只有正文 Hero 启用搜索标记，普通导航默认不启用。
- 04 可参考 `src/pages/article/[...page].astro` 的内容获取、排序、统计、分页与组件组合，复用 `src/components/article/PostPreview.astro`、分类侧栏及主题 Paginator；PostPreview 默认简版，传 detailed 才显示分类等详细信息。当前尚未抽出独立列表组件，不应假定已有现成列表封装。
- 文章链接继续由 `src/utils/articles.ts` 生成；分类链接由 `src/utils/category-links.ts` 的 CATEGORY_ROOT、getCategoryUrl(id) 生成。04 自行复核首页与 /article 的地址、分页和元数据方案，不在 02 提前实现。
- 本轮收尾只更新文档，未修改测试分类或业务代码，未自动提交、推送或上线。
