import assert from 'node:assert/strict'
import test from 'node:test'
import { createCategoryCatalog } from '../src/utils/categories.ts'

test('ancestor path is root first, independent of definition order', () => {
  const catalog = createCategoryCatalog([
    { id: 'frontend', name: '前端', parent: 'technology' },
    { id: 'technology', name: '技术' },
    { id: 'essay', name: '随笔' }
  ])
  assert.deepEqual(catalog.getPath('frontend').map(({ name }) => name), ['技术', '前端'])
  assert.equal(catalog.validateReferences(['frontend', 'essay']), undefined)
  assert.equal(catalog.validateReferences([]), undefined)
})

test('invalid definitions fail even without article references', () => {
  assert.throws(() => createCategoryCatalog([
    { id: 'a', name: 'A' }, { id: 'a', name: 'B' }
  ]), /ID 重复/)
  assert.throws(() => createCategoryCatalog([{ id: 'A', name: 'A' }]), /ID 格式无效/)
  assert.throws(() => createCategoryCatalog([{ id: 'a', name: ' ' }]), /显示名不能为空/)
  assert.throws(() => createCategoryCatalog([
    { id: 'a', name: 'A', parent: 'missing' }
  ]), /父级不存在/)
})

test('both self cycles and indirect cycles fail', () => {
  assert.throws(() => createCategoryCatalog([
    { id: 'a', name: 'A', parent: 'a' }
  ]), /成环/)
  assert.throws(() => createCategoryCatalog([
    { id: 'a', name: 'A', parent: 'b' },
    { id: 'b', name: 'B', parent: 'c' },
    { id: 'c', name: 'C', parent: 'a' }
  ]), /成环/)
})

test('article references reject unknown and repeated IDs', () => {
  const catalog = createCategoryCatalog([{ id: 'a', name: 'A' }])
  assert.match(catalog.validateReferences(['missing']), /不存在.*missing/)
  assert.match(catalog.validateReferences(['a', 'a']), /重复.*a/)
  assert.throws(() => catalog.getPath('missing'), /分类不存在/)
})

const tree = [
  { id: 'technology', name: '技术' },
  { id: 'frontend', name: '前端', parent: 'technology' },
  { id: 'astro', name: 'Astro', parent: 'frontend' },
  { id: 'backend', name: '后端', parent: 'technology' },
  { id: 'essay', name: '随笔' },
  { id: 'empty', name: '空分类' }
]

function article(id, categories, draft = false) {
  return { id, data: { categories, draft, title: `文章 ${id}` } }
}

const articles = [
  article('both', ['frontend', 'backend']),
  article('deep', ['astro']),
  article('parent', ['technology']),
  article('essay', ['essay']),
  article('uncategorized', []),
  article('draft', ['astro'], true)
]

test('父级包含各层后代，多归属和重复输入按文章 ID 去重，保留顺序', () => {
  const catalog = createCategoryCatalog(tree)
  const input = [...articles, articles[0]]
  const before = structuredClone(input)
  const posts = catalog.getPosts(input, 'technology')
  assert.deepEqual(posts.map(({ id }) => id), ['both', 'deep', 'parent'])
  assert.equal(posts[0], articles[0])
  assert.equal(posts[0].data.title, '文章 both')
  assert.deepEqual(input, before)
  assert.deepEqual(catalog.getPosts(input, 'frontend').map(({ id }) => id), ['both', 'deep'])
  assert.deepEqual(catalog.getPosts(input, 'astro').map(({ id }) => id), ['deep'])
  assert.deepEqual(catalog.getPosts(input, 'empty'), [])
  assert.throws(() => catalog.getPosts(input, 'missing'), /分类不存在/)
})

test('统计与列表一致，默认排除草稿，允许显式包含', () => {
  const catalog = createCategoryCatalog(tree)
  const input = [...articles, articles[0]]
  const counts = catalog.getCounts(input)
  assert.deepEqual(Object.fromEntries(counts), {
    technology: 3, frontend: 2, astro: 1, backend: 1, essay: 1, empty: 0
  })
  const options = { includeDrafts: true }
  assert.deepEqual(catalog.getPosts(input, 'astro', options).map(({ id }) => id), ['deep', 'draft'])
  const withDrafts = catalog.getCounts(input, options)
  assert.equal(withDrafts.get('technology'), 4)
  for (const { id } of tree) {
    assert.equal(withDrafts.get(id), catalog.getPosts(input, id, options).length)
  }
  assert.deepEqual([...catalog.getCounts([]).values()], [0, 0, 0, 0, 0, 0])
})
