# 05 个人信息、中文化与功能精简

状态：已完成本阶段实现与整理；发布前待办及验证边界见下文。前置：03、04。

先读 [总览](README.md)、[项目规则](../../AGENTS.md)、[00 交接](00-shared-design.md) 及前置任务的实际交接。先核对现场，再说明第一个小步；以下入口仅供调查，不是任意改写的清单。

## 目标与范围

将模板作者的个人资料替换成用户资料，界面中文化，删除冗余功能（例如赞助）。

## 分步推进

1. 盘点站点配置、页面、主题组件中的个人信息、界面文案与功能入口，解释它们的来源。
2. 提供资料缺口和功能精简清单；已有 ThRelic/Yanlite 设置直接沿用，其余按需询问，不虚构内容。
3. 替换已确认资料、整合 About 与页脚等位置，按确认范围移除赞助等功能。
4. 中文化导航、按钮、列表、分页、搜索界面及空/错误状态；确定文档语言元数据。必要组件按需本地接管。
5. 检查移除功能后的引用、样式和脚本，不删除仍被保留功能需要的公共依赖。

## 主要入口

src/site.config.ts、About、本地布局和页面、主题 Header/Footer 与按钮等实际文案消费者。

## 执行时才确定

个人资料、社交链接、中文文案、冗余功能清单及页脚占位内容。用户英文简介和文章正文不因界面中文化而自动翻译。

## 验收

无误用的模板作者个人信息，用户设置得到保留；主要界面及状态中文一致；删除功能没有残留入口或断链。保留适用的源码来源与许可信息。构建并验证生产预览。

## 边界

06 专门处理 Docs/Links/Projects 和搜索排除；本任务不扩大为整站主题重写。

## 交接记录

- 已核对配置、本地列表/布局/页面及安装包 Header/Footer/搜索组件的文案来源；保留现有个人资料与源码来源署名，完成下述中文化及功能清理。
- src/site.config.ts 的 lang、dateLocale 为 zh-CN，attrs 已修正为 zh_CN；导航、政策链接、评论配置文案已中文化。站名、作者、英文简介、头像及作者正文保留。
- src/components/article/ArticleList.astro 的分页、空列表、统计及归档入口已由用户中文化并反馈验证通过；diff 核对原参数、链接与分页逻辑保留。本轮未独立构建或预览。
- 归档、搜索、404 元数据及本地布局返回/目录开关已中文化。保留用户自行修改的 ArticleList 与 404 文案。政策页仅翻译原有占位内容与标题，原日期保留，不代表正式政策已制定。
- 按需接管 astro-pure 1.4.9 的 Header、Footer、BackToTop、TOC、TOCHeading、PFSearch 至 src/components/site/；Copyright 至 src/components/article/。保留来源与许可说明，不修改安装包；公共依赖仍从包入口导入。目录生成内部函数接管至 src/utils/toc.ts，保持原层级规则。
- BaseLayout 接入本地 Header/Footer；CommonPage、ProfileLayout、IndividualPage、BlogPost 接入本地目录；ContentLayout/IndividualPage 接入本地返回顶部。参数与插槽保持原样。
- 文章 Hero/PostPreview 的置顶、草稿、更新日期和阅读时长中文化，阅读时长仅将主题生成的末尾 min 换为“分钟”，不改变估算规则。评论计数、加载占位、点赞及 Waline 语言配置中文化，未改评论服务。
- 搜索文案维护于 src/components/site/PFSearch.astro 的 translations；分类过滤名称由 CategoryPath 的 data-pagefind-filter 从 category 改为“分类”，对应索引已重新生成，分类 ID 与页面地址不变。后续消费过滤条件时使用该中文键。
- 文章许可显示 CC BY-NC-SA 4.0，但链接指向 CC BY 4.0，已确认暂不决定并保留原状；不可视为许可一致性验收通过。
- 验证：最终 npm run build 通过，77 文件检查零错误/警告/提示，生成 56 页；保留原 Markdown 插件弃用提示。git diff --check 通过。构建 HTML 核对首页、文章入口与分页、归档、搜索、About/作者页、文章详情、政策入口和 404 的语言元数据。
- 生产预览复用已确认属于本项目的 4322 服务；实际验证中文搜索结果、加载更多、清除、无结果提示、分类筛选（markdown 选项为两篇）、移动导航展开、归档入口、归档文章跳转、文章窄屏目录展开及锚点跳转、配色切换中文提示。搜索在窄屏和桌面截图中布局正常；桌面 DOM clientWidth/scrollWidth 均为 1265，临时视口覆盖已恢复。
- 未全面回归每个页面或构造全站空文章；未提交评论、点赞或点击外部分享。评论远端完整状态、二维码及复制交互未在本轮全面验收，正式评论服务交 07。Docs/Links/Projects 页面正文未整批翻译，按 06 隐藏与排除搜索，当前仍可搜索到 Docs。
- 页脚资料小步已完成：src/site.config.ts 移除 Moe ICP 占位；GitHub 图标标为“本站源码”，指向用户提供的 https://github.com/Yanlite/yanlite.github.io；保留 RSS、Astro/Pure 署名及现有站点政策入口。政策页面暂保留，后续整合为简短的版权与隐私说明，隐私正文随 07 实际评论配置落实。源码 Apache-2.0 及文章许可现状未改变。
- 本小步 npm run build 通过：77 文件零错误/警告/提示、56 页，原 Markdown 弃用提示仍在；git diff --check 通过。4322 生产预览实际核对无 Moe ICP、本站源码地址与名称正确、政策/RSS/来源署名保留；点击政策入口在新页打开 /terms，并核对页面内容。未点击外部仓库或重复验收全站功能。
- 文章咖啡入口由用户反馈已处理；未重复复查该简单修改。Projects 页已删除赞助推广、目录项、跳转按钮、收款方式、赞助名单及专用样式/导入；删除仅被该区块引用的 Sponsors.astro、Sponsorship.astro 和两张 alipay/wechat 收款图。这些文件原已被 Git 跟踪，可从历史恢复；共享 Icon、Button、文章 QRCode 等保留功能依赖未删除。
- 赞助清理后统一 npm run build 通过：75 文件零错误/警告/提示，生成 56 页，图片产物由 16 项减少为 14 项；git diff --check 通过。按用户对简单步骤免重复检查的指示，本轮不重复浏览器验收或复查用户删除的文章入口；构建通过不代表全部交互已独立复验。
- Docs 中介绍上游赞助的内容未动，Projects 的其他模板内容、Links 中的示例资料及搜索排除按 06 隐藏范围处理。政策正文和评论配置由 07 承接；05 没有把正式政策或自有评论服务记为已完成。
- 作者页 links 已由用户自行填写 GitHub/Bilibili/知乎/洛谷账号，保留这些修改；About 正文、时间线及作者正文的 TODO 是用户内容待填，不虚构替代资料。
- 已按确认取消默认分享图：site.config.ts 的 socialCard 留空（主题配置省略该字段会恢复默认模板路径）。BaseHead 仅在有实际图片时输出 og:image/twitter:image，并根据有无图片选择 Twitter 卡片类型；文章封面继续优先使用。移除原先对所有图片硬编码的 1200×630 尺寸声明。
- 浏览器图标改为 public/favicon/favicon.svg 的简洁 T 字母图形，BaseHead 不再输出旧主题 PNG/apple-touch-icon 声明；site.webmanifest 名称填写 ThRelic，图标指向新 SVG。旧主题静态图文件暂保留但不再被这些入口引用；独立品牌设计和专门的移动端安装图标以后再做。
- 最后统一 npm run build 通过：75 文件零错误/警告/提示，56 页，原 Markdown 弃用提示保留；git diff --check 通过。核对首页与无封面文章不输出图片标签、有封面文章保留图片标签，SVG 图标链接与 manifest 正确；4322 预览实际打开新 SVG，T 字形显示正常。未实测外部社交平台抓取、浏览器旧图标缓存刷新或移动端安装。
- 当前手动维护：站点语言/页脚在 site.config.ts；个人账号在 about/yanlite.astro 的 links；固定导航/页脚/目录/搜索文案在 components/site/；文章信息及许可展示在 components/article/；文章正文不因中文化而翻译。
- 下一任务为 06，本会话不启动。07 发布前需完成政策占位整合、实际评论服务决定、文章许可文字与链接一致性及适用的逐篇授权范围；这些仍是待办，不能把 05 收尾视为许可或正式政策已验收。
