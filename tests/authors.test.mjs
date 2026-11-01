import assert from 'node:assert/strict'
import test from 'node:test'
import { isAuthorHref, resolveAuthors } from '../src/utils/authors.ts'

test('本站资料与外部作者混合查询保持顺序，且不修改输入', () => {
  const avatar = { src: '/avatar.webp', width: 80, height: 80, format: 'webp' }
  const profiles = Object.freeze({
    '/about/person': Object.freeze({ name: '本站人物', avatar, description: '简短介绍' })
  })
  const authors = Object.freeze([
    Object.freeze({ name: '外部作者', href: 'https://example.com/' }),
    Object.freeze({ href: '/about/person' }),
    Object.freeze({ name: '无链接作者' })
  ])

  const result = resolveAuthors(authors, profiles)
  assert.deepEqual(result, [
    { name: '外部作者', href: 'https://example.com/' },
    { name: '本站人物', href: '/about/person', avatar, description: '简短介绍' },
    { name: '无链接作者' }
  ])
  assert.deepEqual(authors[1], { href: '/about/person' })
  assert.notEqual(result[0], authors[0])
})

test('缺省列表、空条目和未知链接不产生默认作者', () => {
  assert.deepEqual(resolveAuthors(undefined, {}), [])
  assert.deepEqual(resolveAuthors([], {}), [])
  assert.deepEqual(resolveAuthors([{}, { href: '/about/unknown' }], {}), [
    {}, { href: '/about/unknown' }
  ])
  assert.deepEqual(resolveAuthors([{ href: 'toString' }], {}), [{ href: 'toString' }])
})

test('链接允许本站路径和HTTP(S)，拒绝脚本地址及模糊的相对地址', () => {
  for (const href of ['/about/person', 'https://example.com/', 'http://example.com/']) {
    assert.equal(isAuthorHref(href), true)
  }
  for (const href of ['', 'person', '//example.com/', '/\\example.com', 'javascript:alert(1)', 'data:text/plain,test']) {
    assert.equal(isAuthorHref(href), false)
  }
})
