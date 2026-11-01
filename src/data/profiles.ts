import yanliteAvatar from '../assets/yanlite.jpg'

// 键为人物页的站内路径，须与引用该人物的 href 完全一致。
export const profiles = {
  '/about/yanlite': {
    name: 'Yanlite',
    avatar: yanliteAvatar,
    links: [
      { label: 'GitHub', href: 'https://github.com/yanlite' },
      { label: 'Bilibili', href: 'https://space.bilibili.com/454015318' },
      { label: '知乎', href: 'https://www.zhihu.com/people/zilo-38-18' },
      { label: '洛谷', href: 'https://www.luogu.com.cn/user/945401' }
    ]
  }
}
