import type { Category } from '../utils/categories'

// Migrated from the existing article tags. Parent relationships are not inferred.
export const categories: Category[] = [
  { id: 'example', name: '样例' },
  { id: '3d', name: '3D', parent: 'technology' },
  { id: 'markdown', name: 'markdown' },
  { id: 'mind', name: '思想' },
  { id: 'mood', name: '情感' },
  { id: 'music', name: '音乐' },
  { id: 'technology', name: '技术' },
  { id: 'draft', name: '草稿' }
]
