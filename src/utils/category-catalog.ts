import { categories } from '../data/categories'
import { createCategoryCatalog } from './categories'

// 内容校验和页面查询共用同一份分类定义。
export const categoryCatalog = createCategoryCatalog(categories)
