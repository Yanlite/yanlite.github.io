import type { SiteMeta as ThemeSiteMeta } from 'astro-pure/types'
import type { ArticleAuthor } from '../utils/authors'

export interface SiteMeta extends ThemeSiteMeta {
  authors?: ArticleAuthor[]
}
