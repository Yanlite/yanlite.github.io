# 07 整体验收与 GitHub Pages 部署

状态：进行中，未上线。前置：01–06。许可链接修正已保存于d6f36b2，政策页保留现状；Pages工作流已在本地准备。当前先说明部署的必要条件、构建与托管关系，再复核工作流方案及触发方式；尚未推送或执行Linux构建。

入口：[项目规则](../../AGENTS.md)、[规划总览](README.md)、[00 基线](00-shared-design.md)。前置功能及历史验收以各任务交接为准，不在此重复。

## 目标与发布边界

- 完成首版整体检查、可复现安装、Linux 构建与 GitHub Pages 发布，并按有效授权执行上线。
- 不自动提交、推送、覆盖旧 main、强推、重置或发布；保留备份，不升级主题。
- npm锁文件及本机干净安装复现已完成；Linux及整站/线上验收仍待完成。Linux构建与部署使用同一份Pages工作流草案，发布分支、触发条件待复核，平台设置尚未核对。

## 已确认取舍

- 首版关闭评论、阅读数、评论数及相关点赞区域；不搭建自有 Waline 服务。
- 6 篇主题示例与 3 篇分页测试文章暂时公开，原有 1 篇草稿不改；示例 Docs 内链暂不处理。
- RSS 保留现状，已知问题延期，不作为首版阻塞项，也不记为已修复或完整验收通过。
- 支持多作者和可选链接；本站人物按已登记路径复用 profiles，不抓取任意页面。
- Copyright 使用纯文字作者列表，不显示头像。文章开头、PostPreview 作者信息，以及主题渐变/悬停动效在 task-07 后讨论。
- 空作者的最终显示、过滤和回退策略暂缓；当前旧回退不是最终认可的业务规则。
- 文章默认许可选择 CC BY-NC-SA 4.0；Copyright 的许可文字与链接对应此协议。模板示例及第三方内容的原许可仍须分别核对，不能因站点显示统一许可而认定已获重新授权。
- 政策页保留现状：页脚入口继续隐藏，不迁移页面、不补写内容。页面仍可直接访问并进入搜索和站点地图；本项不阻塞首版。

## 实现与维护入口

| 部分 | 当前实现及入口 | 状态 |
| --- | --- | --- |
| npm 依赖 | 根 package-lock.json，package.json 未改，bun.lock 暂留 | 7a2a237 已保存 |
| 评论与统计 | site.config.ts 的 waline.enable=false、server为空；PageInfo 整体遵循开关 | a51a331 已保存 |
| 共享人物 | data/profiles.ts 的 profiles，以人物页路径为键；about/yanlite.astro 读取姓名、头像、links | 8f1a775 已保存，复核通过 |
| 作者输入 | content.config.ts 的可选 authors 数组，每项可选 name/href；填入字符串需非空，href仅根路径或HTTP(S) | 2d63d07已保存，复核缺口保留 |
| 人物查询 | utils/authors.ts：isAuthorHref、resolveAuthors；精确匹配共享姓名/头像/可选简介，保留顺序且不修改输入，未匹配保留原字段 | 2d63d07已保存，复核缺口保留 |
| 底部署名 | BlogPost 查询后传入 Copyright；有href显示链接，无href显示姓名，换行排列 | 2d63d07已保存，待预览复核 |
| 作者元数据 | types/site-meta.ts 增加可选authors；BlogPost→ContentLayout→BaseLayout→BaseHead，姓名meta与有链接作者的完整article:author | 2d63d07已保存，复核缺口保留 |

表内源码路径均相对 src/。schema 中缺省authors仍可省略，查询缺省输入返回空数组；空条目与未知无名引用的最终策略未定。站内自动查询只匹配登记键，不隐式规范化同域绝对URL、尾斜杠或查询参数。

测试文章 pagination-check-a 保留本站、外部链接、无链接三位作者样例。底部署名和作者元数据对未填写/空列表仍保留原有站点作者分支；该历史关联尚待处理，不能将站点署名与文章作者等同。分享via仍使用原配置。

## 验证依据与缺口

- 锁文件与原安装的18项直接依赖及703个对应包版本一致；另105个锁定条目为带平台约束的可选包。用户在独立副本完成npm ci、构建和preview，反馈无问题；安装后npm ls无问题。Linux未验证，不宣称已有CI保证。
- 关闭统计后构建35页，HTML无评论/统计容器及示例地址；文章与About响应无相关区域。未独立捕获浏览器运行时请求，尚未收到明确的后续浏览器复核反馈。
- profiles抽取前后作者页HTML逐字节一致；人物资料代码已获复核。
- 三组authors测试通过。真实混合作者样例经过构建与DOM核对，临时文章已移除，恢复35页、9项RSS；测试A保留纯文字样例。独立的排版、窄屏和点击验收仍待完成。
- 元数据改动构建成功，最终npm run check为81文件零错误/警告/提示。测试A输出三项姓名与两项完整链接；测试A、Using MDX及About的body与改动前一致，后两页原作者元数据未变。这些是Agent检查，不代替用户理解或认可方案。
- git diff --check通过；原Markdown插件弃用提示保留。尚无线上、外部平台抓取或正式域名验收。
- 许可链接修正后npm run build通过（81文件检查无错误/警告/提示，35页）；9篇文章产物中的CC BY-NC-SA 4.0文字与链接一致。未进行本次链接的浏览器点击复验。

## 仍需处理

1. 作者元数据的方案及代码复核缺口保留，不因提交或推进其他发布准备而视为已通过；不扩大作者功能。
2. 完成作者界面适用复核，确定空作者策略；文章许可已选择CC BY-NC-SA 4.0并修正对应链接，逐篇来源/许可仍未核对。
3. 测试分类（test-a、test-b1、test-b2、test-c）当前保留；政策占位页按已确认取舍保留，不再列为首版待处理项。
4. 核对主题返回旧页状态同步问题。历史交接称保留PostPreview内层transition:none，但本轮现场未见该规则；不得默认已修复或自动恢复延期动效。
5. 复核本地Pages工作流及发布设置，再依据有效授权推送并验证Linux安装/构建、静态资源、图片和Pagefind；继续核对首页/文章/分页/分类/About/搜索、隐藏路径、RSS已知边界、站点地图、canonical、404和移动端。
6. 适合保存阶段时主动提醒Git提交。可审阅结果就绪并具备有效授权后再推送/发布，验证正式网址并记录回退与维护方法。

## Pages工作流草案与发布入口

- 文件：`.github/workflows/pages.yml`。草案仅在推送`research/theme-restart`时触发，构建成功后直接尝试部署；不是仅运行检查。提交到本机不会触发，不自动推送。
- 构建：`ubuntu-latest`、Node.js `24.19.0`（与本机一致）、npm下载缓存、`npm ci`、`node --test tests/*.test.mjs`、`npm run build`，上传`dist/`；部署任务依赖构建成功，使用`github-pages`环境和GitHub内置授权，无需自建发布分支。
- 远端现场：默认分支及唯一分支为`main`，位于初始提交`808ce76`。草案使用当前成果分支，不覆盖旧main，也不修改默认分支；发布前仍须确认此分支选择。
- 发布前平台核对：仓库Settings → Pages的Source设为GitHub Actions；Settings → Environments → github-pages允许`research/theme-restart`部署。现有平台设置未读取或修改，不视为已配置。
- 本地验证：YAML解析无错误，触发分支、构建命令、部署任务依赖与上传目录已核对；9项现有测试通过，diff检查通过。未改网站源码，沿用许可修正后的构建结果；Linux执行、产物上传及线上部署仍未验证。
- 维护：若以后更换发布分支，同时调整`on.push.branches`与环境允许的分支。当前不提供手动触发，避免工作流未在默认分支时无法使用Run workflow按钮的误导。
- 依据：[Astro Pages指南](https://docs.astro.build/en/guides/deploy/github/)、[官方产物上传](https://github.com/actions/upload-pages-artifact)、[官方Pages部署](https://github.com/actions/deploy-pages)。

## RSS 已知边界（延期）

XML可解析，9项公开文章链接均为正确的/article地址，无草稿。4篇无封面仍输出undefined，5篇有封面使用相对地址，所有enclosure缺length/type；MDX按普通Markdown解析，导入语句混入正文、组件内容退化。逻辑继承自808ce76初始模板，不能据此推断当前上游版本状态。网站正文不受同一渲染链路影响；此处保留缺陷记录，不在当前小步修复。
