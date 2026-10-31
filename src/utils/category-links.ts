export const CATEGORY_ROOT = '/category'

// 分类 ID 已由分类表校验；父级和显示名不会影响地址。
export function getCategoryUrl(id: string): string {
  return `${CATEGORY_ROOT}/${id}`
}
