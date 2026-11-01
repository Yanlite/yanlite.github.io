// 改编自 astro-pure 1.4.9，Apache-2.0；见 LICENSE。
// 为本地中文目录保留主题的层级生成规则。
import type { MarkdownHeading } from 'astro'

export interface TocItem extends MarkdownHeading {
  subheadings: TocItem[]
}

export function generateToc(headings: readonly MarkdownHeading[]): TocItem[] {
  const root: TocItem = { depth: 0, slug: 'root', text: 'Root', subheadings: [] }
  const stack: TocItem[] = [root]

  headings.forEach((h) => {
    const heading: TocItem = { ...h, subheadings: [] }
    // 从栈中寻找深度更小的父标题。
    // 栈末项为当前最近的祖先标题。
    while (stack[stack.length - 1].depth >= heading.depth) {
      stack.pop()
    }
    // 将当前标题加入父标题的子列表。
    stack[stack.length - 1].subheadings.push(heading)
    // 当前标题入栈，供后续更深的标题使用。
    stack.push(heading)
  })
  return root.subheadings
}
