export interface Category {
  id: string
  name: string
  parent?: string
}

// 只约束查询必需的字段，调用方仍可保留文章标题、日期等完整资料。
export interface CategorizedArticle {
  id: string
  data: {
    categories: readonly string[]
    draft: boolean
  }
}

export interface CategoryQueryOptions {
  includeDrafts?: boolean
}

// Independent of Astro so invalid definitions can be checked before loading articles.
export function createCategoryCatalog(definitions: readonly Category[]) {
  const byId = new Map<string, Category>()
  for (const category of definitions) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.id)) {
      throw new Error(`分类 ID 格式无效：${category.id}。请使用小写字母、数字及单个连字符。`)
    }
    if (!category.name.trim()) throw new Error(`分类显示名不能为空：${category.id}`)
    if (byId.has(category.id)) throw new Error(`分类 ID 重复：${category.id}`)
    byId.set(category.id, { ...category })
  }

  function getCategory(id: string): Category {
    const category = byId.get(id)
    if (!category) throw new Error(`分类不存在：${id}`)
    return category
  }

  // Root first. A fresh visited set detects a cycle anywhere in the ancestor chain.
  function getPath(id: string): Category[] {
    const path: Category[] = []
    const visited = new Set<string>()
    let current: Category | undefined = getCategory(id)
    while (current) {
      if (visited.has(current.id)) {
        throw new Error(`分类父级关系成环：${[...visited, current.id].join(' -> ')}`)
      }
      visited.add(current.id)
      path.push(current)
      if (current.parent !== undefined && !byId.has(current.parent)) {
        throw new Error(`分类 ${current.id} 的父级不存在：${current.parent}`)
      }
      current = current.parent === undefined ? undefined : getCategory(current.parent)
    }
    return path.reverse()
  }

  // Validate all definitions, including categories that have no articles yet.
  for (const id of byId.keys()) getPath(id)

  function validateReferences(ids: readonly string[]): string | undefined {
    const seen = new Set<string>()
    for (const id of ids) {
      if (!byId.has(id)) return `文章引用不存在的分类：${id}`
      if (seen.has(id)) return `文章重复填写分类：${id}`
      seen.add(id)
    }
    return undefined
  }

  // 文章引用由内容 schema 校验；这里不排序，保留调用方的文章顺序。
  function getPosts<T extends CategorizedArticle>(
    posts: readonly T[],
    categoryId: string,
    { includeDrafts = false }: CategoryQueryOptions = {}
  ): T[] {
    getCategory(categoryId)
    const seen = new Set<string>()
    return posts.filter((post) => {
      if (!includeDrafts && post.data.draft) return false
      if (seen.has(post.id)) return false
      const matches = post.data.categories.some((id) =>
        getPath(id).some((ancestor) => ancestor.id === categoryId)
      )
      if (matches) seen.add(post.id)
      return matches
    })
  }

  // 包括数量为零的分类，是否显示空分类由界面层决定。
  function getCounts<T extends CategorizedArticle>(
    posts: readonly T[],
    options: CategoryQueryOptions = {}
  ): Map<string, number> {
    const counts = new Map<string, number>()
    for (const id of byId.keys()) counts.set(id, getPosts(posts, id, options).length)
    return counts
  }

  return { getCategory, getPath, validateReferences, getPosts, getCounts }
}
