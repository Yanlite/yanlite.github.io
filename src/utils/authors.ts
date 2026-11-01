import type { ImageMetadata } from 'astro'

export interface ArticleAuthor {
  name?: string
  href?: string
}

export interface ProfileData {
  name: string
  avatar?: ImageMetadata
  description?: string
}

export interface ResolvedAuthor extends ArticleAuthor {
  avatar?: ImageMetadata
  description?: string
}

/** 接受本站根路径和 HTTP(S) 地址，排除协议相对地址与反斜杠路径。 */
export function isAuthorHref(href: string): boolean {
  if (href.includes('\\')) return false
  if (href.startsWith('/')) return !href.startsWith('//')
  try {
    const url = new URL(href)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/** 按 href 精确匹配人物资料；匹配时采用共享姓名，保留顺序且不修改输入。 */
export function resolveAuthors(
  authors: readonly ArticleAuthor[] | undefined,
  profiles: Readonly<Record<string, ProfileData>>
): ResolvedAuthor[] {
  return (authors ?? []).map((author) => {
    const profile = author.href && Object.hasOwn(profiles, author.href)
      ? profiles[author.href]
      : undefined

    if (!profile) return { ...author }

    return {
      ...author,
      name: profile.name,
      ...(profile.avatar ? { avatar: profile.avatar } : {}),
      ...(profile.description ? { description: profile.description } : {})
    }
  })
}
