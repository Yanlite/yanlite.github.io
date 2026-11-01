import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { categoryCatalog } from './utils/category-catalog'
import { isAuthorHref } from './utils/authors'

function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array
  const lowercaseItems = array.map((str) => str.toLowerCase())
  const distinctItems = new Set(lowercaseItems)
  return Array.from(distinctItems)
}

// Define blog collection
const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Required
  schema: ({ image }) =>
    z.object({
      // Required
      title: z.string().max(60),
      description: z.string().max(160),
      publishDate: z.coerce.date(),
      // Optional
      authors: z.array(z.object({
        name: z.string().trim().min(1).optional(),
        href: z.string().trim().min(1).refine(isAuthorHref, {
          message: '作者链接须为以 / 开头的本站路径或 HTTP(S) 地址'
        }).optional()
      })).optional(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z
        .object({
          src: image(),
          alt: z.string().optional(),
          inferSize: z.boolean().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          color: z.string().optional()
        })
        .optional(),
      categories: z.array(z.string()).default([]).superRefine((ids, context) => {
        const message = categoryCatalog.validateReferences(ids)
        if (message) context.addIssue({ code: 'custom', message })
      }),
      // 拒绝文章误填旧 tags 字段，避免分类归属被静默忽略。
      tags: z.never().optional(),
      language: z.string().optional(),
      draft: z.boolean().default(false),
      pin: z.boolean().optional(),
      // Special fields
      comment: z.boolean().default(true)
    })
})

// Define docs collection
const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
  schema: () =>
    z.object({
      title: z.string().max(60),
      description: z.string().max(160),
      publishDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
      draft: z.boolean().default(false),
      // Special fields
      order: z.number().default(999)
    })
})

export const collections = { blog, docs }
