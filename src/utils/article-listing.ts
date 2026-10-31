import { getBlogCollection, sortMDByDate } from 'astro-pure/server'
import { categoryCatalog } from './category-catalog'

// 首页和文章入口共用草稿过滤、排序及全量分类统计。
export async function getArticleListing() {
  const collections = sortMDByDate<'blog'>(await getBlogCollection('blog'))
  const categoryCounts = categoryCatalog.getCounts(collections, {
    includeDrafts: import.meta.env.DEV
  })
  return { collections, categoryCounts, collectionsCount: collections.length }
}
