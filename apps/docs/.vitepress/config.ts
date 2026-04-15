import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' };

export default defineConfig({
  title: 'hap-fluent',
  description: 'Fluent, strongly-typed wrapper for HAP-NodeJS services and characteristics',
  base: '/hap-fluent/',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/hap-fluent/favicon.svg' }],
  ],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/pradeepmouli/hap-fluent' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Usage', link: '/guide/usage' }
          ]
        }
      ],
      '/api/': [
        { text: 'API Reference', items: typedocSidebar }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/pradeepmouli/hap-fluent' }
    ],
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026 Pradeep Mouli'
    },
    search: { provider: 'local' }
  }
});
