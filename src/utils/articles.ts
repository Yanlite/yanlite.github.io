// Shared article paths. Keep route generation and link consumers in sync.
export const ARTICLE_ROOT = '/article'

export function getArticleUrl(id: string): string {
  return `${ARTICLE_ROOT}/${id}`
}
